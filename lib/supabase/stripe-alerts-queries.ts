/**
 * Supabase Query Helpers for Stripe Connect - Alerts
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Create Stripe alert
 */
export async function createStripeAlert(params: {
  galleryId: string;
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  stripeAccountId?: string;
  stripeEventId?: string;
  actionRequired?: boolean;
  actionUrl?: string;
  metadata?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_alerts')
    .insert({
      gallery_id: params.galleryId,
      alert_type: params.alertType,
      severity: params.severity,
      title: params.title,
      message: params.message,
      stripe_account_id: params.stripeAccountId,
      stripe_event_id: params.stripeEventId,
      action_required: params.actionRequired || false,
      action_url: params.actionUrl,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get gallery Stripe alerts
 */
export async function getGalleryStripeAlerts(params: {
  galleryId: string;
  unresolvedOnly?: boolean;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('stripe_alerts')
    .select('*')
    .eq('gallery_id', params.galleryId)
    .order('created_at', { ascending: false });

  if (params.unresolvedOnly) {
    query = query.eq('resolved', false);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_alerts')
    .update({ is_read: true })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Resolve alert
 */
export async function resolveAlert(alertId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_alerts')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
