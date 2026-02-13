/**
 * Supabase Query Helpers for Stripe Connect - Metrics
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Get gallery Stripe metrics
 */
export async function getGalleryStripeMetrics(
  galleryId: string,
  startDate?: Date,
  endDate?: Date
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_gallery_stripe_metrics', {
    p_gallery_id: galleryId,
    p_start_date: startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    p_end_date: endDate?.toISOString() || new Date().toISOString(),
  });

  if (error) throw error;
  return data[0];
}

/**
 * Check if gallery can receive payouts
 */
export async function canGalleryReceivePayouts(galleryId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('can_gallery_receive_payouts', {
    p_gallery_id: galleryId,
  });

  if (error) throw error;
  return data;
}
