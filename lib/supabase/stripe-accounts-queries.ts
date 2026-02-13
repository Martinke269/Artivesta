/**
 * Supabase Query Helpers for Stripe Connect - Accounts
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Get gallery's Stripe account
 */
export async function getGalleryStripeAccount(galleryId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('stripe_accounts')
    .select('*')
    .eq('gallery_id', galleryId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Create or update Stripe account record
 */
export async function upsertStripeAccount(params: {
  galleryId: string;
  stripeAccountId: string;
  onboardingStatus: 'pending' | 'incomplete' | 'complete';
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: any;
  email?: string;
  businessType?: string;
  capabilities?: any;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('stripe_accounts')
    .upsert({
      gallery_id: params.galleryId,
      stripe_account_id: params.stripeAccountId,
      onboarding_status: params.onboardingStatus,
      payouts_enabled: params.payoutsEnabled,
      charges_enabled: params.chargesEnabled,
      details_submitted: params.detailsSubmitted,
      requirements: params.requirements || {},
      email: params.email,
      business_type: params.businessType,
      capabilities: params.capabilities || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
