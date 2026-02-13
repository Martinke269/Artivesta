import { createClient } from '@/utils/supabase/server';
import type { Offer, CreateOfferInput, EscrowApproval, AdminAlert, EscrowAmounts } from './offers-types';

/**
 * Create a new price offer
 */
export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('offers')
    .insert({
      artwork_id: input.artwork_id,
      buyer_id: user.id,
      seller_id: input.seller_id,
      list_price_cents: input.list_price_cents,
      offered_price_cents: input.offered_price_cents,
      message: input.message || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get offer by ID
 */
export async function getOfferById(offerId: string): Promise<Offer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Get offers for a buyer
 */
export async function getBuyerOffers(buyerId: string): Promise<Offer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get offers for a seller
 */
export async function getSellerOffers(sellerId: string): Promise<Offer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get offers for an artwork
 */
export async function getArtworkOffers(artworkId: string): Promise<Offer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Accept an offer (seller only)
 */
export async function acceptOffer(offerId: string): Promise<Offer> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify user is the seller
  const offer = await getOfferById(offerId);
  if (!offer) throw new Error('Offer not found');
  if (offer.seller_id !== user.id) throw new Error('Only seller can accept offer');
  if (offer.status !== 'pending') throw new Error('Offer is not pending');

  const { data, error } = await supabase
    .from('offers')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject an offer (seller only)
 */
export async function rejectOffer(offerId: string): Promise<Offer> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify user is the seller
  const offer = await getOfferById(offerId);
  if (!offer) throw new Error('Offer not found');
  if (offer.seller_id !== user.id) throw new Error('Only seller can reject offer');
  if (offer.status !== 'pending') throw new Error('Offer is not pending');

  const { data, error } = await supabase
    .from('offers')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    })
    .eq('id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update offer with payment link details
 */
export async function updateOfferPaymentLink(
  offerId: string,
  paymentLinkId: string,
  paymentLinkUrl: string
): Promise<Offer> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .update({
      payment_link_id: paymentLinkId,
      payment_link_url: paymentLinkUrl,
    })
    .eq('id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update offer with payment intent ID
 */
export async function updateOfferPaymentIntent(
  offerId: string,
  paymentIntentId: string
): Promise<Offer> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('offers')
    .update({
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get escrow approval for an offer
 */
export async function getEscrowApproval(offerId: string): Promise<EscrowApproval | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('escrow_approvals')
    .select('*')
    .eq('offer_id', offerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Buyer approves escrow release
 */
export async function buyerApproveEscrow(offerId: string): Promise<EscrowApproval> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify user is the buyer
  const offer = await getOfferById(offerId);
  if (!offer) throw new Error('Offer not found');
  if (offer.buyer_id !== user.id) throw new Error('Only buyer can approve');

  const { data, error } = await supabase
    .from('escrow_approvals')
    .update({
      buyer_approved: true,
      buyer_approved_at: new Date().toISOString(),
    })
    .eq('offer_id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Seller approves escrow release
 */
export async function sellerApproveEscrow(offerId: string): Promise<EscrowApproval> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify user is the seller
  const offer = await getOfferById(offerId);
  if (!offer) throw new Error('Offer not found');
  if (offer.seller_id !== user.id) throw new Error('Only seller can approve');

  const { data, error } = await supabase
    .from('escrow_approvals')
    .update({
      seller_approved: true,
      seller_approved_at: new Date().toISOString(),
    })
    .eq('offer_id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update escrow approval with release details
 */
export async function updateEscrowRelease(
  offerId: string,
  transferId: string,
  amounts: EscrowAmounts
): Promise<EscrowApproval> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('escrow_approvals')
    .update({
      funds_released: true,
      funds_released_at: new Date().toISOString(),
      stripe_transfer_id: transferId,
      platform_fee_cents: amounts.platform_fee_cents,
      vat_cents: amounts.vat_cents,
      seller_amount_cents: amounts.seller_amount_cents,
    })
    .eq('offer_id', offerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Calculate escrow amounts (20% commission + 25% VAT)
 */
export async function calculateEscrowAmounts(totalPriceCents: number): Promise<EscrowAmounts> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('calculate_escrow_amounts', { p_total_price_cents: totalPriceCents });

  if (error) throw error;
  
  return {
    platform_fee_cents: data[0].platform_fee_cents,
    vat_cents: data[0].vat_cents,
    seller_amount_cents: data[0].seller_amount_cents,
  };
}

/**
 * Get admin alerts
 */
export async function getAdminAlerts(filters?: {
  unreadOnly?: boolean;
  unresolvedOnly?: boolean;
  alertType?: string;
}): Promise<AdminAlert[]> {
  const supabase = await createClient();

  let query = supabase
    .from('admin_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (filters?.unresolvedOnly) {
    query = query.eq('resolved', false);
  }

  if (filters?.alertType) {
    query = query.eq('alert_type', filters.alertType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Mark admin alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<AdminAlert> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('admin_alerts')
    .update({ is_read: true })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Resolve admin alert
 */
export async function resolveAlert(alertId: string): Promise<AdminAlert> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('admin_alerts')
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
