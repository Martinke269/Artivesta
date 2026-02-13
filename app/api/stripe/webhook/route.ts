import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe/stripe-connect';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize Supabase with service role for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature, webhookSecret);

    // Log the event
    await supabaseAdmin.from('stripe_events').insert({
      event_id: event.id,
      event_type: event.type,
      event_data: event.data.object,
      processed: false,
    });

    // Process the event based on type
    switch (event.type) {
      // Account events
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'account.external_account.created':
      case 'account.external_account.updated':
      case 'account.external_account.deleted':
        await handleExternalAccountChange(event);
        break;

      // Payout events
      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout);
        break;

      case 'payout.canceled':
        await handlePayoutCanceled(event.data.object as Stripe.Payout);
        break;

      // Transfer events
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.updated':
        await handleTransferUpdated(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.reversed':
        await handleTransferReversed(event.data.object as Stripe.Transfer);
        break;

      // Payment Intent events (for escrow system)
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Charge events
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object as Stripe.Charge);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      // Dispute events
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      // Application fee events
      case 'application_fee.created':
        await handleApplicationFeeCreated(event.data.object as Stripe.ApplicationFee);
        break;

      case 'application_fee.refunded':
        await handleApplicationFeeRefunded(event.data.object as Stripe.ApplicationFee);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabaseAdmin
      .from('stripe_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

// Event handlers

async function handleAccountUpdated(account: Stripe.Account) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', account.id)
    .single();

  if (!stripeAccount) {
    console.error(`No gallery found for account ${account.id}`);
    return;
  }

  await supabaseAdmin
    .from('stripe_accounts')
    .update({
      onboarding_status: account.details_submitted ? 'complete' : 'incomplete',
      payouts_enabled: account.payouts_enabled || false,
      charges_enabled: account.charges_enabled || false,
      details_submitted: account.details_submitted || false,
      requirements: account.requirements,
      capabilities: account.capabilities,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id);

  // Create alert if account has issues
  if (account.requirements?.disabled_reason) {
    await supabaseAdmin.from('stripe_alerts').insert({
      gallery_id: stripeAccount.gallery_id,
      alert_type: 'account_disabled',
      severity: 'critical',
      message: `Account disabled: ${account.requirements.disabled_reason}`,
      metadata: { account_id: account.id, reason: account.requirements.disabled_reason },
    });
  }
}

async function handleExternalAccountChange(event: Stripe.Event) {
  const account = event.account;
  if (!account) return;

  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', account)
    .single();

  if (stripeAccount) {
    await supabaseAdmin.from('stripe_alerts').insert({
      gallery_id: stripeAccount.gallery_id,
      alert_type: 'bank_account_updated',
      severity: 'info',
      message: `Bank account ${event.type.split('.').pop()}`,
      metadata: { event_type: event.type },
    });
  }
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', payout.destination as string)
    .single();

  if (!stripeAccount) return;

  await supabaseAdmin.from('stripe_payouts').upsert({
    gallery_id: stripeAccount.gallery_id,
    payout_id: payout.id,
    amount: payout.amount,
    currency: payout.currency,
    status: payout.status,
    arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
    method: payout.method,
    type: payout.type,
    metadata: payout.metadata,
  });
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', payout.destination as string)
    .single();

  if (!stripeAccount) return;

  await supabaseAdmin.from('stripe_payouts').upsert({
    gallery_id: stripeAccount.gallery_id,
    payout_id: payout.id,
    amount: payout.amount,
    currency: payout.currency,
    status: 'failed',
    failure_code: payout.failure_code || undefined,
    failure_message: payout.failure_message || undefined,
  });

  await supabaseAdmin.from('stripe_alerts').insert({
    gallery_id: stripeAccount.gallery_id,
    alert_type: 'payout_failed',
    severity: 'critical',
    message: `Payout failed: ${payout.failure_message || 'Unknown reason'}`,
    metadata: { payout_id: payout.id, failure_code: payout.failure_code },
  });
}

async function handlePayoutCanceled(payout: Stripe.Payout) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', payout.destination as string)
    .single();

  if (!stripeAccount) return;

  await supabaseAdmin
    .from('stripe_payouts')
    .update({ status: 'canceled' })
    .eq('payout_id', payout.id);
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', transfer.destination as string)
    .single();

  if (!stripeAccount) return;

  await supabaseAdmin.from('stripe_transfers').insert({
    gallery_id: stripeAccount.gallery_id,
    transfer_id: transfer.id,
    amount: transfer.amount,
    currency: transfer.currency,
    destination: transfer.destination as string,
    source_transaction: transfer.source_transaction as string | null,
    status: 'completed',
    metadata: transfer.metadata,
  });
}

async function handleTransferUpdated(transfer: Stripe.Transfer) {
  await supabaseAdmin
    .from('stripe_transfers')
    .update({
      amount: transfer.amount,
      status: transfer.reversed ? 'reversed' : 'completed',
      metadata: transfer.metadata,
    })
    .eq('transfer_id', transfer.id);
}

async function handleTransferReversed(transfer: Stripe.Transfer) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    .select('gallery_id')
    .eq('stripe_account_id', transfer.destination as string)
    .single();

  if (!stripeAccount) return;

  await supabaseAdmin
    .from('stripe_transfers')
    .update({ status: 'reversed' })
    .eq('transfer_id', transfer.id);

  await supabaseAdmin.from('stripe_alerts').insert({
    gallery_id: stripeAccount.gallery_id,
    alert_type: 'transfer_reversed',
    severity: 'high',
    message: 'A transfer was reversed',
    metadata: { transfer_id: transfer.id },
  });
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  // Update order status if this charge is linked to an order
  if (charge.metadata?.order_id) {
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        stripe_charge_id: charge.id,
      })
      .eq('id', charge.metadata.order_id);
  }
}

async function handleChargeFailed(charge: Stripe.Charge) {
  if (charge.metadata?.order_id) {
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'failed',
        stripe_charge_id: charge.id,
      })
      .eq('id', charge.metadata.order_id);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (charge.metadata?.order_id) {
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'refunded',
        stripe_charge_id: charge.id,
      })
      .eq('id', charge.metadata.order_id);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const charge = dispute.charge as string;
  
  // Find the order associated with this charge
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('gallery_id')
    .eq('stripe_charge_id', charge)
    .single();

  if (order) {
    await supabaseAdmin.from('stripe_alerts').insert({
      gallery_id: order.gallery_id,
      alert_type: 'dispute_opened',
      severity: 'critical',
      message: `Payment dispute opened: ${dispute.reason}`,
      metadata: { dispute_id: dispute.id, charge_id: charge, reason: dispute.reason },
    });
  }
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const charge = dispute.charge as string;
  
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('gallery_id')
    .eq('stripe_charge_id', charge)
    .single();

  if (order) {
    await supabaseAdmin.from('stripe_alerts').insert({
      gallery_id: order.gallery_id,
      alert_type: 'dispute_closed',
      severity: 'info',
      message: `Payment dispute closed: ${dispute.status}`,
      metadata: { dispute_id: dispute.id, status: dispute.status },
    });
  }
}

async function handleApplicationFeeCreated(fee: Stripe.ApplicationFee) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('gallery_id, id')
    .eq('stripe_charge_id', fee.charge as string)
    .single();

  if (order) {
    await supabaseAdmin.from('stripe_application_fees').insert({
      gallery_id: order.gallery_id,
      order_id: order.id,
      fee_id: fee.id,
      amount: fee.amount,
      currency: fee.currency,
      charge_id: fee.charge as string,
    });
  }
}

async function handleApplicationFeeRefunded(fee: Stripe.ApplicationFee) {
  await supabaseAdmin
    .from('stripe_application_fees')
    .update({ refunded: true, refunded_at: new Date().toISOString() })
    .eq('fee_id', fee.id);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Check if this payment is for an offer (escrow system)
  const offerId = paymentIntent.metadata?.offer_id;
  
  if (offerId) {
    // Update offer with payment intent ID
    await supabaseAdmin
      .from('offers')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', offerId);

    console.log(`Payment succeeded for offer ${offerId}, funds held in escrow`);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const offerId = paymentIntent.metadata?.offer_id;
  
  if (offerId) {
    // Get offer details to create alert
    const { data: offer } = await supabaseAdmin
      .from('offers')
      .select('seller_id')
      .eq('id', offerId)
      .single();

    if (offer) {
      await supabaseAdmin.from('admin_alerts').insert({
        alert_type: 'payment_failed',
        severity: 'high',
        title: 'Payment Failed',
        message: `Payment failed for offer ${offerId}`,
        offer_id: offerId,
        metadata: {
          payment_intent_id: paymentIntent.id,
          last_payment_error: paymentIntent.last_payment_error,
        },
      });
    }

    console.error(`Payment failed for offer ${offerId}`);
  }
}
