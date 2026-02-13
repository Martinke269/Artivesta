/**
 * Supabase Query Helpers for Stripe Connect - Payouts
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Get gallery payouts
 */
export async function getGalleryPayouts(params: {
  galleryId: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('stripe_payouts')
    .select('*', { count: 'exact' })
    .eq('gallery_id', params.galleryId)
    .order('created_at', { ascending: false });

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data, count };
}

/**
 * Create payout record
 */
export async function createPayoutRecord(params: {
  galleryId: string;
  stripePayoutId: string;
  stripeAccountId: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate?: Date;
  description?: string;
  failureCode?: string;
  failureMessage?: string;
  method?: string;
  type?: string;
  metadata?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_payouts')
    .insert({
      gallery_id: params.galleryId,
      stripe_payout_id: params.stripePayoutId,
      stripe_account_id: params.stripeAccountId,
      amount: params.amount,
      currency: params.currency,
      status: params.status,
      arrival_date: params.arrivalDate?.toISOString(),
      description: params.description,
      failure_code: params.failureCode,
      failure_message: params.failureMessage,
      method: params.method,
      type: params.type,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payout record
 */
export async function updatePayoutRecord(
  stripePayoutId: string,
  updates: {
    status?: string;
    arrivalDate?: Date;
    failureCode?: string;
    failureMessage?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_payouts')
    .update({
      status: updates.status,
      arrival_date: updates.arrivalDate?.toISOString(),
      failure_code: updates.failureCode,
      failure_message: updates.failureMessage,
    })
    .eq('stripe_payout_id', stripePayoutId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
