import { NextRequest, NextResponse } from 'next/server';
import {
  getOfferById,
  getEscrowApproval,
  updateEscrowRelease,
  calculateEscrowAmounts,
} from '@/lib/supabase/offers-queries';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

/**
 * POST /api/escrow/[offerId]/release
 * Release escrow funds to seller (ONLY when both parties have approved)
 * Automatically calculates 20% commission + 25% VAT
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const offerId = params.offerId;

    // Get offer details
    const offer = await getOfferById(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Get escrow approval
    const approval = await getEscrowApproval(offerId);
    if (!approval) {
      return NextResponse.json(
        { error: 'Escrow approval not found' },
        { status: 404 }
      );
    }

    // CRITICAL: Check that BOTH parties have approved
    if (!approval.both_approved) {
      return NextResponse.json(
        {
          error: 'Both buyer and seller must approve before funds can be released',
          buyer_approved: approval.buyer_approved,
          seller_approved: approval.seller_approved,
        },
        { status: 400 }
      );
    }

    // Check if funds already released
    if (approval.funds_released) {
      return NextResponse.json(
        { error: 'Funds have already been released' },
        { status: 400 }
      );
    }

    // Verify payment was made
    if (!offer.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No payment found for this offer' },
        { status: 400 }
      );
    }

    // Calculate amounts: 20% commission + 25% VAT
    const amounts = await calculateEscrowAmounts(offer.offered_price_cents);

    // Get seller's Stripe account (for Connect transfer)
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', offer.seller_id)
      .single();

    if (!sellerProfile?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Seller has not connected Stripe account' },
        { status: 400 }
      );
    }

    // Create Stripe Transfer to seller
    // This transfers the seller's portion (80% - VAT) to their connected account
    const transfer = await stripe.transfers.create({
      amount: amounts.seller_amount_cents,
      currency: 'dkk',
      destination: sellerProfile.stripe_account_id,
      description: `Escrow release for offer ${offerId}`,
      metadata: {
        offer_id: offerId,
        artwork_id: offer.artwork_id,
        buyer_id: offer.buyer_id,
        seller_id: offer.seller_id,
        total_price_cents: offer.offered_price_cents.toString(),
        platform_fee_cents: amounts.platform_fee_cents.toString(),
        vat_cents: amounts.vat_cents.toString(),
        seller_amount_cents: amounts.seller_amount_cents.toString(),
      },
    });

    // Update escrow approval with release details
    await updateEscrowRelease(offerId, transfer.id, amounts);

    // Log the transaction for audit
    console.log('Escrow released:', {
      offer_id: offerId,
      transfer_id: transfer.id,
      total_price: offer.offered_price_cents / 100,
      platform_fee: amounts.platform_fee_cents / 100,
      vat: amounts.vat_cents / 100,
      seller_receives: amounts.seller_amount_cents / 100,
      currency: 'DKK',
    });

    return NextResponse.json({
      success: true,
      message: 'Escrow funds released to seller',
      transfer_id: transfer.id,
      amounts: {
        total_price_cents: offer.offered_price_cents,
        platform_fee_cents: amounts.platform_fee_cents,
        vat_cents: amounts.vat_cents,
        seller_amount_cents: amounts.seller_amount_cents,
      },
      breakdown: {
        total_price_dkk: offer.offered_price_cents / 100,
        platform_commission_20_percent: amounts.platform_fee_cents / 100,
        vat_25_percent_of_commission: amounts.vat_cents / 100,
        seller_receives_dkk: amounts.seller_amount_cents / 100,
      },
    });
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    
    // Provide more specific error messages
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to release escrow funds' },
      { status: 500 }
    );
  }
}
