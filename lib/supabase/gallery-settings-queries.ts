import { SupabaseClient } from '@supabase/supabase-js'

// Types
export interface GallerySettings {
  id: string
  owner_id: string
  gallery_name: string
  description: string | null
  address: string
  city: string
  postal_code: string
  country: string
  website: string | null
  email: string
  phone: string | null
  logo_url: string | null
  commission_percentage: number
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface GalleryBranding {
  primary_color: string | null
  secondary_color: string | null
  logo_url: string | null
  cover_image_url: string | null
}

export interface GalleryNotificationSettings {
  new_orders: boolean
  new_leasing_agreements: boolean
  expiring_leases: boolean
  insurance_warnings: boolean
  new_artists: boolean
  system_notifications: boolean
}

export interface GalleryPaymentInfo {
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  last_payout_date: string | null
  last_payout_amount: number | null
  payout_frequency: string
  commission_percentage: number
}

export interface GallerySocialMedia {
  instagram: string | null
  facebook: string | null
  linkedin: string | null
}

/**
 * Get gallery settings
 */
export async function getGallerySettings(
  supabase: SupabaseClient,
  galleryId: string
) {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', galleryId)
    .single()

  return { data: data as GallerySettings | null, error }
}

/**
 * Update gallery basic information
 */
export async function updateGalleryInfo(
  supabase: SupabaseClient,
  galleryId: string,
  updates: {
    gallery_name?: string
    description?: string | null
    address?: string
    city?: string
    postal_code?: string
    country?: string
    website?: string | null
    email?: string
    phone?: string | null
  }
) {
  const { data, error } = await supabase
    .from('galleries')
    .update(updates)
    .eq('id', galleryId)
    .select()
    .single()

  return { data, error }
}

/**
 * Update gallery logo
 */
export async function updateGalleryLogo(
  supabase: SupabaseClient,
  galleryId: string,
  logoUrl: string
) {
  const { data, error } = await supabase
    .from('galleries')
    .update({ logo_url: logoUrl })
    .eq('id', galleryId)
    .select()
    .single()

  return { data, error }
}

/**
 * Get gallery branding settings
 * Note: This is a placeholder. In a real implementation, you'd have a separate table
 * for branding settings or store them in a JSONB column
 */
export async function getGalleryBranding(
  supabase: SupabaseClient,
  galleryId: string
): Promise<{ data: GalleryBranding | null; error: any }> {
  // For now, return default values
  // In production, you'd fetch from a branding settings table
  return {
    data: {
      primary_color: '#000000',
      secondary_color: '#666666',
      logo_url: null,
      cover_image_url: null,
    },
    error: null,
  }
}

/**
 * Update gallery branding
 */
export async function updateGalleryBranding(
  supabase: SupabaseClient,
  galleryId: string,
  branding: Partial<GalleryBranding>
) {
  // Placeholder - in production, update branding settings table
  return { data: branding, error: null }
}

/**
 * Get gallery notification settings
 * Note: Placeholder - in production, fetch from user preferences table
 */
export async function getNotificationSettings(
  supabase: SupabaseClient,
  galleryId: string,
  userId: string
): Promise<{ data: GalleryNotificationSettings | null; error: any }> {
  // Return default settings
  return {
    data: {
      new_orders: true,
      new_leasing_agreements: true,
      expiring_leases: true,
      insurance_warnings: true,
      new_artists: true,
      system_notifications: true,
    },
    error: null,
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  supabase: SupabaseClient,
  galleryId: string,
  userId: string,
  settings: Partial<GalleryNotificationSettings>
) {
  // Placeholder - in production, update user preferences table
  return { data: settings, error: null }
}

/**
 * Get gallery payment information
 */
export async function getGalleryPaymentInfo(
  supabase: SupabaseClient,
  galleryId: string
) {
  // Get gallery info
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('owner_id, commission_percentage')
    .eq('id', galleryId)
    .single()

  if (galleryError) return { data: null, error: galleryError }

  // Get owner's Stripe info
  const { data: owner, error: ownerError } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', gallery.owner_id)
    .single()

  if (ownerError) return { data: null, error: ownerError }

  // Get last payout info (placeholder - would query payouts table)
  const paymentInfo: GalleryPaymentInfo = {
    stripe_account_id: owner.stripe_account_id,
    stripe_onboarding_complete: owner.stripe_onboarding_complete || false,
    last_payout_date: null,
    last_payout_amount: null,
    payout_frequency: 'monthly',
    commission_percentage: gallery.commission_percentage || 20,
  }

  return { data: paymentInfo, error: null }
}

/**
 * Get gallery social media links
 * Note: Placeholder - in production, store in JSONB column or separate table
 */
export async function getGallerySocialMedia(
  supabase: SupabaseClient,
  galleryId: string
): Promise<{ data: GallerySocialMedia | null; error: any }> {
  return {
    data: {
      instagram: null,
      facebook: null,
      linkedin: null,
    },
    error: null,
  }
}

/**
 * Update gallery social media
 */
export async function updateGallerySocialMedia(
  supabase: SupabaseClient,
  galleryId: string,
  socialMedia: Partial<GallerySocialMedia>
) {
  // Placeholder - in production, update social media settings
  return { data: socialMedia, error: null }
}

/**
 * Delete gallery (owner only)
 */
export async function deleteGallery(
  supabase: SupabaseClient,
  galleryId: string
) {
  const { error } = await supabase
    .from('galleries')
    .delete()
    .eq('id', galleryId)

  return { error }
}

/**
 * Transfer gallery ownership
 */
export async function transferGalleryOwnership(
  supabase: SupabaseClient,
  galleryId: string,
  newOwnerId: string
) {
  const { data, error } = await supabase
    .from('galleries')
    .update({ owner_id: newOwnerId })
    .eq('id', galleryId)
    .select()
    .single()

  return { data, error }
}

/**
 * Check if user is gallery owner
 */
export async function isGalleryOwner(
  supabase: SupabaseClient,
  galleryId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('galleries')
    .select('owner_id')
    .eq('id', galleryId)
    .eq('owner_id', userId)
    .single()

  return { isOwner: !!data, error }
}
