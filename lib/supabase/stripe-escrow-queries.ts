/**
 * Supabase Query Helpers for Stripe Connect - Escrow
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Create escrow record
 */
export async function createEscrowRecord(params: {
  galleryId: string;
  orderId?: string;
  leaseId?: string;
  amount: number;
  currency: string;
  releaseScheduledFor?: Date;
  stripePaymentIntentId?: string;
  metadata?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_escrow')
    .insert({
      gallery_id: params.galleryId,
      order_id: params.orderId,
      lease_id: params.leaseId,
      amount: params.amount,
      currency: params.currency,
      status: 'held',
      release_scheduled_for: params.releaseScheduledFor?.toISOString(),
      stripe_payment_intent_id: params.stripePaymentIntentId,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update escrow status
 */
export async function updateEscrowStatus(
  escrowId: string,
  status: 'held' | 'released' | 'refunded' | 'disputed',
  additionalData?: {
    stripeTransferId?: string;
    disputeReason?: string;
  }
) {
  const supabase = await createClient();

  const updates: any = { status };

  if (status === 'released') {
    updates.released_at = new Date().toISOString();
    if (additionalData?.stripeTransferId) {
      updates.stripe_transfer_id = additionalData.stripeTransferId;
    }
  }

  if (status === 'disputed') {
    updates.dispute_opened_at = new Date().toISOString();
    if (additionalData?.disputeReason) {
      updates.dispute_reason = additionalData.disputeReason;
    }
  }

  const { data, error } = await supabase
    .from('stripe_escrow')
    .update(updates)
    .eq('id', escrowId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
