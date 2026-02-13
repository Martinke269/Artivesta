import { NextRequest, NextResponse } from 'next/server';
import { getOfferById, updateOfferPaymentLink, calculateEscrowAmounts } from '@/lib/supabase/offers-queries';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

/**
 * POST /api/payments/create-link
 * Create Stripe Payment Link after offer is accepted
 * Money goes to platform escrow, NOT directly to seller
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { offer_id } = body;

    if (!offer_id) {
      return NextResponse.json(
        { error: 'Missing offer_id' },
        { status: 400 }
      );
    }

    // Get offer details
    const offer = await getOfferById(offer_id);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Verify offer is accepted
    if (offer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Offer must be accepted before creating payment link' },
        { status: 400 }
      );
    }

    // Verify user is seller (only seller can create payment link)
    if (offer.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Only seller can create payment link' },
        { status: 403 }
      );
    }

    // Check if payment link already exists
    if (offer.payment_link_id) {
      return NextResponse.json(
        { error: 'Payment link already exists for this offer' },
        { status: 400 }
      );
    }

    // Get artwork details for product description
    const { data: artwork } = await supabase
      .from('artworks')
      .select('title, artist_name')
      .eq('id', offer.artwork_id)
      .single();

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    // Calculate amounts (20% commission + 25% VAT)
    const amounts = await calculateEscrowAmounts(offer.offered_price_cents);

    // Create Stripe Payment Link
    // IMPORTANT: Money goes to PLATFORM, not seller
    // This is escrow mode - funds held until both parties approve
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'dkk',
            product_data: {
              name: artwork.title,
              description: `Artwork by ${artwork.artist_name}`,
              metadata: {
                offer_id: offer.id,
                artwork_id: offer.artwork_id,
                seller_id: offer.seller_id,
                buyer_id: offer.buyer_id,
              },
            },
            unit_amount: offer.offered_price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        offer_id: offer.id,
        artwork_id: offer.artwork_id,
        seller_id: offer.seller_id,
        buyer_id: offer.buyer_id,
        escrow_mode: 'true',
        platform_fee_cents: amounts.platform_fee_cents.toString(),
        vat_cents: amounts.vat_cents.toString(),
        seller_amount_cents: amounts.seller_amount_cents.toString(),
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/buyer/dashboard/orders?payment=success&offer_id=${offer.id}`,
        },
      },
    });

    // Update offer with payment link details
    await updateOfferPaymentLink(
      offer.id,
      paymentLink.id,
      paymentLink.url
    );

    return NextResponse.json({
      payment_link_id: paymentLink.id,
      payment_link_url: paymentLink.url,
      amounts: {
        total_cents: offer.offered_price_cents,
        platform_fee_cents: amounts.platform_fee_cents,
        vat_cents: amounts.vat_cents,
        seller_amount_cents: amounts.seller_amount_cents,
      },
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
