import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { escrowReleaseSchema } from '@/lib/validation/stripe-schemas';
import { updateEscrowStatus } from '@/lib/supabase/stripe-escrow-queries';
import { ZodError } from 'zod';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

/**
 * POST /api/stripe/escrow/release
 * Releases escrow funds for a lease or order
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = escrowReleaseSchema.parse(body);

    // Fetch escrow record
    let escrowQuery = supabase
      .from('stripe_escrow')
      .select('*, galleries!inner(id, owner_id, stripe_accounts!inner(stripe_account_id))')
      .eq('status', 'held');

    if (validatedData.leaseId) {
      escrowQuery = escrowQuery.eq('lease_id', validatedData.leaseId);
    } else if (validatedData.orderId) {
      escrowQuery = escrowQuery.eq('order_id', validatedData.orderId);
    }

    const { data: escrow, error: escrowError } = await escrowQuery.single();

    if (escrowError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow record not found or already released' },
        { status: 404 }
      );
    }

    // Verify user has access to this gallery
    if (escrow.galleries.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get Stripe account ID
    const stripeAccountId = escrow.galleries.stripe_accounts?.[0]?.stripe_account_id;
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'Gallery does not have a connected Stripe account' },
        { status: 400 }
      );
    }

    // Verify Stripe account is ready for transfers
    const account = await stripe.accounts.retrieve(stripeAccountId);
    if (!account.payouts_enabled) {
      return NextResponse.json(
        { error: 'Gallery Stripe account is not enabled for payouts' },
        { status: 400 }
      );
    }

    // Create transfer to gallery
    const transferAmount = validatedData.amount || escrow.amount;
    
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: escrow.currency,
      destination: stripeAccountId,
      source_transaction: escrow.stripe_payment_intent_id || undefined,
      metadata: {
        escrow_id: escrow.id,
        gallery_id: escrow.gallery_id,
        order_id: escrow.order_id || '',
        lease_id: escrow.lease_id || '',
        reason: validatedData.reason || 'Escrow release',
      },
    });

    // Update escrow status
    await updateEscrowStatus(escrow.id, 'released', {
      stripeTransferId: transfer.id,
    });

    // Record transfer in database
    await supabase.from('stripe_transfers').insert({
      gallery_id: escrow.gallery_id,
      transfer_id: transfer.id,
      amount: transferAmount,
      currency: escrow.currency,
      destination: stripeAccountId,
      source_transaction: escrow.stripe_payment_intent_id,
      status: 'completed',
      metadata: transfer.metadata,
    });

    // Update order/lease status if applicable
    if (escrow.order_id) {
      await supabase
        .from('orders')
        .update({ 
          escrow_status: 'released',
          escrow_released_at: new Date().toISOString(),
        })
        .eq('id', escrow.order_id);
    }

    if (escrow.lease_id) {
      await supabase
        .from('leases')
        .update({ 
          escrow_status: 'released',
          escrow_released_at: new Date().toISOString(),
        })
        .eq('id', escrow.lease_id);
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        destination: transfer.destination,
        created: transfer.created,
      },
      escrow: {
        id: escrow.id,
        status: 'released',
        released_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Escrow release error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: 'Stripe error',
          details: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to release escrow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
