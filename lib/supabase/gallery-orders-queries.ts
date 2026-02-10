import { SupabaseClient } from '@supabase/supabase-js'

export interface GalleryOrder {
  id: string
  artwork_id: string
  artwork_title: string
  artwork_image_url: string | null
  artist_id: string
  artist_name: string
  buyer_name: string // Masked as "Business Customer"
  order_date: string
  order_status: 'pending' | 'paid' | 'completed' | 'cancelled'
  escrow_status: 'held' | 'released' | 'refunded'
  price_cents: number
  commission_cents: number
  payout_cents: number
  currency: string
  payment_intent_id: string | null
  has_payout: boolean
  payout_status?: 'pending' | 'approved' | 'completed' | 'rejected'
}

export interface OrderDetails extends GalleryOrder {
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
  escrow_events: EscrowEvent[]
  stripe_events: StripeEvent[]
  payout_details: PayoutDetails | null
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

export interface PayoutDetails {
  id: string
  amount_cents: number
  commission_cents: number
  net_amount_cents: number
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  completed_at: string | null
  created_at: string
}

export interface OrderFilters {
  status?: string[]
  dateFrom?: string
  dateTo?: string
  minPrice?: number
  maxPrice?: number
  artistId?: string
  searchQuery?: string
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  totalPayout: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
}

/**
 * Get all orders for a gallery
 * RLS ensures only gallery's own orders are returned
 */
export async function getGalleryOrders(
  supabase: SupabaseClient,
  galleryId: string,
  filters?: OrderFilters,
  sortBy: 'newest' | 'highest_price' | 'status' = 'newest'
): Promise<GalleryOrder[]> {
  // Get gallery artists to filter orders
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Build orders query
  let query = supabase
    .from('orders')
    .select(`
      id,
      artwork_id,
      buyer_id,
      seller_id,
      amount_cents,
      currency,
      status,
      escrow_status,
      payment_intent_id,
      created_at,
      artworks:artwork_id (
        title,
        image_url,
        artist_id,
        profiles:artist_id (
          name
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

  if (filters?.minPrice) {
    query = query.gte('amount_cents', filters.minPrice * 100)
  }

  if (filters?.maxPrice) {
    query = query.lte('amount_cents', filters.maxPrice * 100)
  }

  if (filters?.artistId) {
    query = query.eq('seller_id', filters.artistId)
  }

  // Apply sorting
  switch (sortBy) {
    case 'highest_price':
      query = query.order('amount_cents', { ascending: false })
      break
    case 'status':
      query = query.order('status', { ascending: true }).order('created_at', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching gallery orders:', error)
    return []
  }

  if (!orders) return []

  // Get payout information for each order
  const ordersWithPayouts: GalleryOrder[] = []

  for (const order of orders) {
    const artwork = Array.isArray(order.artworks) ? order.artworks[0] : order.artworks
    const artistProfile = artwork?.profiles ? (Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles) : null

    // Filter by search query if provided
    if (filters?.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      const titleMatch = artwork?.title?.toLowerCase().includes(searchLower)
      if (!titleMatch) continue
    }

    const { data: payout } = await supabase
      .from('payouts')
      .select('status')
      .eq('order_id', order.id)
      .single()

    // Calculate commission (20%)
    const commissionCents = Math.round(order.amount_cents * 0.2)
    const payoutCents = order.amount_cents - commissionCents

    ordersWithPayouts.push({
      id: order.id,
      artwork_id: order.artwork_id,
      artwork_title: artwork?.title || 'Unknown Artwork',
      artwork_image_url: artwork?.image_url || null,
      artist_id: order.seller_id,
      artist_name: artistProfile?.name || 'Unknown Artist',
      buyer_name: 'Business Customer', // Masked for privacy
      order_date: order.created_at,
      order_status: order.status,
      escrow_status: order.escrow_status,
      price_cents: order.amount_cents,
      commission_cents: commissionCents,
      payout_cents: payoutCents,
      currency: order.currency,
      payment_intent_id: order.payment_intent_id,
      has_payout: !!payout,
      payout_status: payout?.status,
    })
  }

  return ordersWithPayouts
}

/**
 * Get detailed information for a specific order
 */
export async function getOrderDetails(
  supabase: SupabaseClient,
  orderId: string
): Promise<OrderDetails | null> {
  // Get order with related data
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      artworks:artwork_id (
        title,
        image_url,
        artist_id,
        profiles:artist_id (
          name
        )
      )
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    console.error('Error fetching order details:', error)
    return null
  }

  // Get escrow events
  const { data: escrowEvents } = await supabase
    .from('escrow_events')
    .select(`
      *,
      profiles:initiated_by (
        name
      )
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  // Get Stripe webhook logs
  const { data: stripeEvents } = await supabase
    .from('stripe_webhook_logs')
    .select('*')
    .eq('related_order_id', orderId)
    .order('created_at', { ascending: false })

  // Get payout details
  const { data: payout } = await supabase
    .from('payouts')
    .select('*')
    .eq('order_id', orderId)
    .single()

  // Get invoice
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('order_id', orderId)
    .eq('invoice_type', 'seller')
    .single()

  // Calculate commission
  const commissionCents = Math.round(order.amount_cents * 0.2)
  const payoutCents = order.amount_cents - commissionCents

  return {
    id: order.id,
    artwork_id: order.artwork_id,
    artwork_title: order.artworks?.title || 'Unknown Artwork',
    artwork_image_url: order.artworks?.image_url || null,
    artist_id: order.seller_id,
    artist_name: order.artworks?.profiles?.name || 'Unknown Artist',
    buyer_name: 'Business Customer', // Masked
    buyer_id: order.buyer_id,
    seller_id: order.seller_id,
    order_date: order.created_at,
    order_status: order.status,
    escrow_status: order.escrow_status,
    price_cents: order.amount_cents,
    commission_cents: commissionCents,
    payout_cents: payoutCents,
    currency: order.currency,
    payment_intent_id: order.payment_intent_id,
    created_at: order.created_at,
    updated_at: order.updated_at,
    has_payout: !!payout,
    payout_status: payout?.status,
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
    payout_details: payout ? {
      id: payout.id,
      amount_cents: payout.amount_cents,
      commission_cents: payout.commission_cents,
      net_amount_cents: payout.net_amount_cents,
      status: payout.status,
      approved_by: payout.approved_by,
      approved_at: payout.approved_at,
      completed_at: payout.completed_at,
      created_at: payout.created_at,
    } : null,
    invoice_id: invoice?.id || null,
  }
}

/**
 * Get order statistics for a gallery
 */
export async function getOrderStats(
  supabase: SupabaseClient,
  galleryId: string
): Promise<OrderStats> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalPayout: 0,
      pendingOrders: 0,
      completedOrders: 0,
      averageOrderValue: 0,
    }
  }

  // Get all orders
  const { data: orders } = await supabase
    .from('orders')
    .select('amount_cents, status')
    .in('seller_id', artistIds)

  if (!orders || orders.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalCommission: 0,
      totalPayout: 0,
      pendingOrders: 0,
      completedOrders: 0,
      averageOrderValue: 0,
    }
  }

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount_cents, 0)
  const totalCommission = Math.round(totalRevenue * 0.2)
  const totalPayout = totalRevenue - totalCommission
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedOrders = orders.filter((o) => o.status === 'completed').length
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return {
    totalOrders,
    totalRevenue,
    totalCommission,
    totalPayout,
    pendingOrders,
    completedOrders,
    averageOrderValue,
  }
}

/**
 * Mark order as shipped (updates status)
 */
export async function markOrderAsShipped(
  supabase: SupabaseClient,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'completed' })
    .eq('id', orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get list of artists for filter dropdown
 */
export async function getGalleryArtistsForFilter(
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
