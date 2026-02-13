import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createPaymentIntentWithFee, calculateAmounts } from '@/lib/stripe/stripe-connect';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/create-payment-intent
 * Creates a payment intent with application fee for artwork purchase
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { artworkId, orderId } = body;

    if (!artworkId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: artworkId, orderId' },
        { status: 400 }
      );
    }

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        price,
        gallery_id,
        galleries (
          id,
          name,
          stripe_accounts (
            stripe_account_id,
            payouts_enabled,
            charges_enabled
          )
        )
      `)
      .eq('id', artworkId)
      .single();

    if (artworkError || !artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, total_amount')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if gallery has Stripe account
    const gallery = artwork.galleries as any;
    if (!gallery?.stripe_accounts?.[0]?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Gallery has not connected their Stripe account' },
        { status: 400 }
      );
    }

    const stripeAccount = gallery.stripe_accounts[0];
    if (!stripeAccount.payouts_enabled || !stripeAccount.charges_enabled) {
      return NextResponse.json(
        { error: 'Gallery Stripe account is not fully activated' },
        { status: 400 }
      );
    }

    // Calculate commission (20% platform fee)
    const commissionRate = 20;
    const priceInCents = Math.round(artwork.price * 100);
    const { applicationFeeAmount, transferAmount } = calculateAmounts({
      salePrice: priceInCents,
      commissionRate,
    });

    // Create payment intent
    const paymentIntent = await createPaymentIntentWithFee({
      amount: priceInCents,
      currency: 'dkk',
      applicationFeeAmount,
      connectedAccountId: stripeAccount.stripe_account_id,
      metadata: {
        order_id: orderId,
        artwork_id: artworkId,
        gallery_id: gallery.id,
        buyer_id: user.id,
      },
    });

    // Update order with payment intent
    await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: priceInCents,
      applicationFee: applicationFeeAmount,
      transferAmount,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
