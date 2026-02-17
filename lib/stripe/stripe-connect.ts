/**
 * Stripe Connect Utility Library
 * Handles Stripe Connect operations for Art Is Safe
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

/**
 * Create a Stripe Connect Standard Account
 */
export async function createConnectAccount(params: {
  email: string;
  country?: string;
  businessType?: 'individual' | 'company';
}) {
  const account = await stripe.accounts.create({
    type: 'standard',
    email: params.email,
    country: params.country || 'DK',
    business_type: params.businessType,
  });

  return account;
}

/**
 * Create an Account Link for onboarding
 */
export async function createAccountLink(params: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  type?: 'account_onboarding' | 'account_update';
}) {
  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: params.type || 'account_onboarding',
  });

  return accountLink;
}

/**
 * Retrieve account details
 */
export async function getAccountDetails(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return account;
}

/**
 * Calculate commission and transfer amounts
 */
export function calculateAmounts(params: {
  salePrice: number;
  commissionRate: number;
}) {
  const applicationFeeAmount = Math.round(
    params.salePrice * (params.commissionRate / 100)
  );
  const transferAmount = params.salePrice - applicationFeeAmount;

  return {
    applicationFeeAmount,
    transferAmount,
  };
}

/**
 * Create a transfer to a connected account
 */
export async function createTransfer(params: {
  amount: number;
  currency: string;
  destination: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const transfer = await stripe.transfers.create({
    amount: params.amount,
    currency: params.currency,
    destination: params.destination,
    description: params.description,
    metadata: params.metadata,
  });

  return transfer;
}

/**
 * Create a payment intent with application fee
 */
export async function createPaymentIntentWithFee(params: {
  amount: number;
  currency: string;
  applicationFeeAmount: number;
  connectedAccountId: string;
  metadata?: Record<string, string>;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    application_fee_amount: params.applicationFeeAmount,
    transfer_data: {
      destination: params.connectedAccountId,
    },
    metadata: params.metadata,
  });

  return paymentIntent;
}

/**
 * List payouts for a connected account
 */
export async function listPayouts(params: {
  accountId: string;
  limit?: number;
  startingAfter?: string;
}) {
  const payouts = await stripe.payouts.list(
    {
      limit: params.limit || 10,
      starting_after: params.startingAfter,
    },
    {
      stripeAccount: params.accountId,
    }
  );

  return payouts;
}

/**
 * Retrieve a specific payout
 */
export async function getPayout(params: {
  payoutId: string;
  accountId: string;
}) {
  const payout = await stripe.payouts.retrieve(params.payoutId, {
    stripeAccount: params.accountId,
  });

  return payout;
}

/**
 * List transfers
 */
export async function listTransfers(params: {
  destination?: string;
  limit?: number;
  startingAfter?: string;
}) {
  const transfers = await stripe.transfers.list({
    destination: params.destination,
    limit: params.limit || 10,
    starting_after: params.startingAfter,
  });

  return transfers;
}

/**
 * Retrieve a specific transfer
 */
export async function getTransfer(transferId: string) {
  const transfer = await stripe.transfers.retrieve(transferId);
  return transfer;
}

/**
 * Create a refund for a charge
 */
export async function createRefund(params: {
  chargeId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}) {
  const refund = await stripe.refunds.create({
    charge: params.chargeId,
    amount: params.amount,
    reason: params.reason,
    metadata: params.metadata,
  });

  return refund;
}

/**
 * Reverse a transfer
 */
export async function reverseTransfer(params: {
  transferId: string;
  amount?: number;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const reversal = await stripe.transfers.createReversal(params.transferId, {
    amount: params.amount,
    description: params.description,
    metadata: params.metadata,
  });

  return reversal;
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );

  return event;
}

/**
 * Check if account can receive payouts
 */
export function canReceivePayouts(account: Stripe.Account): boolean {
  return (
    account.payouts_enabled === true &&
    account.charges_enabled === true &&
    account.details_submitted === true
  );
}

/**
 * Get account requirements
 */
export function getAccountRequirements(account: Stripe.Account) {
  return {
    currentlyDue: account.requirements?.currently_due || [],
    eventuallyDue: account.requirements?.eventually_due || [],
    pastDue: account.requirements?.past_due || [],
    pendingVerification: account.requirements?.pending_verification || [],
    disabled: account.requirements?.disabled_reason || null,
  };
}

/**
 * Format amount for display (cents to currency)
 */
export function formatAmount(amountInCents: number, currency: string = 'DKK'): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

/**
 * Parse amount from currency to cents
 */
export function parseAmount(amount: number): number {
  return Math.round(amount * 100);
}
