/**
 * Supabase Query Helpers for Stripe Connect - Application Fees
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Create application fee record
 */
export async function createApplicationFeeRecord(params: {
  stripeFeeId: string;
  stripeAccountId: string;
  galleryId: string;
  orderId?: string;
  leaseId?: string;
  amount: number;
  currency: string;
  chargeId?: string;
  metadata?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_application_fees')
    .insert({
      stripe_fee_id: params.stripeFeeId,
      stripe_account_id: params.stripeAccountId,
      gallery_id: params.galleryId,
      order_id: params.orderId,
      lease_id: params.leaseId,
      amount: params.amount,
      currency: params.currency,
      charge_id: params.chargeId,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
