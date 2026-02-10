import { SupabaseClient } from '@supabase/supabase-js'

export interface GalleryPayout {
  id: string
  order_id: string
  artwork_id: string
  artwork_title: string
  artwork_image_url: string | null
  artist_id: string
  artist_name: string
  buyer_name: string // Masked as "Business Customer"
  payout_amount_cents: number
  commission_cents: number
  net_amount_cents: number
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  payout_date: string | null
  created_at: string
  currency: string
}

export interface PayoutDetails extends GalleryPayout {
  order_details: {
    id: string
    amount_cents: number
    order_status: 'pending' | 'paid' | 'completed' | 'cancelled'
    escrow_status: 'held' | 'released' | 'refunded'
    payment_intent_id: string | null
    created_at: string
  }
  escrow_events: EscrowEvent[]
  stripe_events: StripeEvent[]
  approved_by_name: string | null
  approved_at: string | null
  invoice_id: string | null
}

export interface EscrowEvent {
  id: string
  event_type: 'held' | 'released' | 'partial_release' | 'refunded' | 'disputed' | 'dispute_resolved'
  amount_cents: number
  reason: string | null
  created_at: string
  initiated_by_name: string | null
}

export interface StripeEvent {
  id: string
  event_id: string
  event_type: string
  event_data: any
  processing_status: 'pending' | 'processed' | 'failed'
  created_at: string
  processed_at: string | null
}

export interface PayoutFilters {
  status?: string[]
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  artistId?: string
  searchQuery?: string
}

export interface PayoutStats {
  totalPaidOut: number
  pendingPayouts: number
  totalCommission: number
  completedPayoutsCount: number
}

/**
 * Get all payouts for a gallery
 * RLS ensures only gallery's own payouts are returned
 */
export async function getGalleryPayouts(
  supabase: SupabaseClient,
  galleryId: string,
  filters?: PayoutFilters,
  sortBy: 'newest' | 'highest_payout' | 'status' = 'newest'
): Promise<GalleryPayout[]> {
  // Get gallery artists to filter payouts
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Build payouts query
  let query = supabase
    .from('payouts')
    .select(`
      id,
      order_id,
      seller_id,
      amount_cents,
      commission_cents,
      net_amount_cents,
      status,
      completed_at,
      created_at,
      orders:order_id (
        artwork_id,
        currency,
        artworks:artwork_id (
          title,
          image_url,
          artist_id,
          profiles:artist_id (
            name
          )
        )
      )
    `)
    .in('seller_id', artistIds)

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  if (filters?.minAmount) {
    query = query.gte('net_amount_cents', filters.minAmount * 100)
  }

  if (filters?.maxAmount) {
    query = query.lte('net_amount_cents', filters.maxAmount * 100)
  }

  if (filters?.artistId) {
    query = query.eq('seller_id', filters.artistId)
  }

  // Apply sorting
  switch (sortBy) {
    case 'highest_payout':
      query = query.order('net_amount_cents', { ascending: false })
      break
    case 'status':
      query = query.order('status', { ascending: true }).order('created_at', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: payouts, error } = await query

  if (error) {
    console.error('Error fetching gallery payouts:', error)
    return []
  }

  if (!payouts) return []

  // Transform data
  const transformedPayouts: GalleryPayout[] = []

  for (const payout of payouts) {
    const order = Array.isArray(payout.orders) ? payout.orders[0] : payout.orders
    const artwork = order?.artworks ? (Array.isArray(order.artworks) ? order.artworks[0] : order.artworks) : null
    const artistProfile = artwork?.profiles ? (Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles) : null

    // Filter by search query if provided
    if (filters?.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      const titleMatch = artwork?.title?.toLowerCase().includes(searchLower)
      if (!titleMatch) continue
    }

    transformedPayouts.push({
      id: payout.id,
      order_id: payout.order_id,
      artwork_id: order?.artwork_id || '',
      artwork_title: artwork?.title || 'Unknown Artwork',
      artwork_image_url: artwork?.image_url || null,
      artist_id: payout.seller_id,
      artist_name: artistProfile?.name || 'Unknown Artist',
      buyer_name: 'Business Customer', // Masked for privacy
      payout_amount_cents: payout.amount_cents,
      commission_cents: payout.commission_cents,
      net_amount_cents: payout.net_amount_cents,
      status: payout.status,
      payout_date: payout.completed_at,
      created_at: payout.created_at,
      currency: order?.currency || 'DKK',
    })
  }

  return transformedPayouts
}

/**
 * Get detailed information for a specific payout
 */
export async function getPayoutDetails(
  supabase: SupabaseClient,
  payoutId: string
): Promise<PayoutDetails | null> {
  // Get payout with related data
  const { data: payout, error } = await supabase
    .from('payouts')
    .select(`
      *,
      orders:order_id (
        id,
        artwork_id,
        amount_cents,
        status,
        escrow_status,
        payment_intent_id,
        currency,
        created_at,
        artworks:artwork_id (
          title,
          image_url,
          artist_id,
          profiles:artist_id (
            name
          )
        )
      ),
      approver:approved_by (
        name
      )
    `)
    .eq('id', payoutId)
    .single()

  if (error || !payout) {
    console.error('Error fetching payout details:', error)
    return null
  }

  const order = Array.isArray(payout.orders) ? payout.orders[0] : payout.orders
  const artwork = order?.artworks ? (Array.isArray(order.artworks) ? order.artworks[0] : order.artworks) : null
  const artistProfile = artwork?.profiles ? (Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles) : null

  // Get escrow events
  const { data: escrowEvents } = await supabase
    .from('escrow_events')
    .select(`
      *,
      profiles:initiated_by (
        name
      )
    `)
    .eq('order_id', payout.order_id)
    .order('created_at', { ascending: false })

  // Get Stripe webhook logs
  const { data: stripeEvents } = await supabase
    .from('stripe_webhook_logs')
    .select('*')
    .eq('related_order_id', payout.order_id)
    .order('created_at', { ascending: false })

  // Get invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('order_id', payout.order_id)
    .eq('invoice_type', 'seller')
    .single()

  return {
    id: payout.id,
    order_id: payout.order_id,
    artwork_id: order?.artwork_id || '',
    artwork_title: artwork?.title || 'Unknown Artwork',
    artwork_image_url: artwork?.image_url || null,
    artist_id: payout.seller_id,
    artist_name: artistProfile?.name || 'Unknown Artist',
    buyer_name: 'Business Customer', // Masked
    payout_amount_cents: payout.amount_cents,
    commission_cents: payout.commission_cents,
    net_amount_cents: payout.net_amount_cents,
    status: payout.status,
    payout_date: payout.completed_at,
    created_at: payout.created_at,
    currency: order?.currency || 'DKK',
    order_details: {
      id: order?.id || '',
      amount_cents: order?.amount_cents || 0,
      order_status: order?.status || 'pending',
      escrow_status: order?.escrow_status || 'held',
      payment_intent_id: order?.payment_intent_id || null,
      created_at: order?.created_at || '',
    },
    escrow_events: escrowEvents?.map((event: any) => ({
      id: event.id,
      event_type: event.event_type,
      amount_cents: event.amount_cents,
      reason: event.reason,
      created_at: event.created_at,
      initiated_by_name: event.profiles?.name || null,
    })) || [],
    stripe_events: stripeEvents?.map((event: any) => ({
      id: event.id,
      event_id: event.event_id,
      event_type: event.event_type,
      event_data: event.event_data,
      processing_status: event.processing_status,
      created_at: event.created_at,
      processed_at: event.processed_at,
    })) || [],
    approved_by_name: payout.approver?.name || null,
    approved_at: payout.approved_at,
    invoice_id: invoice?.id || null,
  }
}

/**
 * Get payout statistics for a gallery
 */
export async function getPayoutStats(
  supabase: SupabaseClient,
  galleryId: string
): Promise<PayoutStats> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return {
      totalPaidOut: 0,
      pendingPayouts: 0,
      totalCommission: 0,
      completedPayoutsCount: 0,
    }
  }

  // Get all payouts
  const { data: payouts } = await supabase
    .from('payouts')
    .select('net_amount_cents, commission_cents, status')
    .in('seller_id', artistIds)

  if (!payouts || payouts.length === 0) {
    return {
      totalPaidOut: 0,
      pendingPayouts: 0,
      totalCommission: 0,
      completedPayoutsCount: 0,
    }
  }

  const completedPayouts = payouts.filter((p) => p.status === 'completed')
  const pendingPayouts = payouts.filter((p) => p.status === 'pending' || p.status === 'approved')

  const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.net_amount_cents, 0)
  const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + p.net_amount_cents, 0)
  const totalCommission = payouts.reduce((sum, p) => sum + p.commission_cents, 0)
  const completedPayoutsCount = completedPayouts.length

  return {
    totalPaidOut,
    pendingPayouts: pendingPayoutsAmount,
    totalCommission,
    completedPayoutsCount,
  }
}

/**
 * Get list of artists for filter dropdown
 */
export async function getGalleryArtistsForPayoutFilter(
  supabase: SupabaseClient,
  galleryId: string
): Promise<Array<{ id: string; name: string }>> {
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select(`
      artist_id,
      profiles:artist_id (
        name
      )
    `)
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  if (!galleryArtists) return []

  return galleryArtists.map((ga: any) => ({
    id: ga.artist_id,
    name: ga.profiles?.name || 'Unknown Artist',
  }))
}
