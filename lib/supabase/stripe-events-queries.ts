/**
 * Supabase Query Helpers for Stripe Connect - Events
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Create Stripe event record
 */
export async function createStripeEventRecord(params: {
  eventId: string;
  type: string;
  apiVersion?: string;
  account?: string;
  payload: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_events')
    .insert({
      event_id: params.eventId,
      type: params.type,
      api_version: params.apiVersion,
      account: params.account,
      payload: params.payload,
      processed: false,
    })
    .select()
    .single();

  if (error && error.code !== '23505') {
    // Ignore duplicate key errors
    throw error;
  }

  return data;
}

/**
 * Mark Stripe event as processed
 */
export async function markEventProcessed(
  eventId: string,
  errorMessage?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_events')
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq('event_id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
