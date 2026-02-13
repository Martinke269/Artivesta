/**
 * Supabase Query Helpers for Stripe Connect - Transfers
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Get gallery transfers
 */
export async function getGalleryTransfers(params: {
  galleryId: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('stripe_transfers')
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
 * Create transfer record
 */
export async function createTransferRecord(params: {
  galleryId: string;
  stripeTransferId: string;
  stripeAccountId: string;
  amount: number;
  currency: string;
  orderId?: string;
  leaseId?: string;
  description?: string;
  status: string;
  metadata?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_transfers')
    .insert({
      gallery_id: params.galleryId,
      stripe_transfer_id: params.stripeTransferId,
      stripe_account_id: params.stripeAccountId,
      amount: params.amount,
      currency: params.currency,
      order_id: params.orderId,
      lease_id: params.leaseId,
      description: params.description,
      status: params.status,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update transfer record
 */
export async function updateTransferRecord(
  stripeTransferId: string,
  updates: {
    status?: string;
    failureCode?: string;
    failureMessage?: string;
    reversed?: boolean;
    reversalId?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_transfers')
    .update({
      status: updates.status,
      failure_code: updates.failureCode,
      failure_message: updates.failureMessage,
      reversed: updates.reversed,
      reversal_id: updates.reversalId,
    })
    .eq('stripe_transfer_id', stripeTransferId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
