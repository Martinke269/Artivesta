import { createClient } from '@/utils/supabase/server'

// ============================================================================
// BUYER ORDERS PAGE QUERIES
// ============================================================================

export interface BuyerOrdersStats {
  totalOrders: number
  pendingPayments: number
  completedPurchases: number
}

export interface BuyerOrderDetail {
  id: string
  artwork: {
    id: string
    title: string
    artist_name: string
    image_url: string | null
    category: string | null
  }
  gallery: {
    id: string | null
    name: string | null
    address: string | null
    city: string | null
    postal_code: string | null
    email: string | null
    phone: string | null
  } | null
  order_date: string
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  amount_cents: number
  currency: string
  payment_method: string | null
  invoice_id: string | null
  invoice_url: string | null
  payment_history: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

export interface BuyerOrdersFilters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  galleryId?: string
  sortBy?: 'newest' | 'highest_amount' | 'status'
}

/**
 * Get order statistics for buyer
 */
export async function getBuyerOrdersStats(
  userId: string
): Promise<BuyerOrdersStats> {
  const supabase = await createClient()

  // Total orders
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)

  // Pending payments
  const { count: pendingPayments } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)
    .eq('status', 'pending')

  // Completed purchases
  const { count: completedPurchases } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)
    .in('status', ['paid', 'completed'])

  return {
    totalOrders: totalOrders || 0,
    pendingPayments: pendingPayments || 0,
    completedPurchases: completedPurchases || 0,
  }
}

/**
 * Get all orders for buyer with filters
 */
export async function getBuyerOrders(
  userId: string,
  filters: BuyerOrdersFilters = {}
): Promise<BuyerOrderDetail[]> {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(
      `
      id,
      amount_cents,
      currency,
      status,
      payment_intent_id,
      created_at,
      updated_at,
      artworks!inner(
        id,
        title,
        image_url,
        category,
        gallery_id,
        artist_id,
        profiles!artworks_artist_id_fkey(name)
      ),
      invoices(
        id,
        pdf_url
      )
    `
    )
    .eq('buyer_id', userId)

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply date filters
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  // Apply price filters
  if (filters.priceMin !== undefined) {
    query = query.gte('amount_cents', filters.priceMin * 100)
  }
  if (filters.priceMax !== undefined) {
    query = query.lte('amount_cents', filters.priceMax * 100)
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'highest_amount':
      query = query.order('amount_cents', { ascending: false })
      break
    case 'status':
      query = query.order('status', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data: orders, error } = await query

  if (error) {
    console.error('Error fetching buyer orders:', error)
    return []
  }

  if (!orders || orders.length === 0) {
    return []
  }

  // Get gallery information for orders with gallery_id
  const galleryIds = orders
    .map((o: any) => o.artworks?.gallery_id)
    .filter((id): id is string => id !== null && id !== undefined)

  let galleriesMap: Map<string, any> = new Map()

  if (galleryIds.length > 0) {
    const { data: galleries } = await supabase
      .from('galleries')
      .select('id, gallery_name, address, city, postal_code, email, phone')
      .in('id', galleryIds)

    if (galleries) {
      galleries.forEach((g) => galleriesMap.set(g.id, g))
    }
  }

  // Transform data
  const transformedOrders: BuyerOrderDetail[] = orders.map((order: any) => {
    const artwork = order.artworks
    const galleryId = artwork?.gallery_id
    const gallery = galleryId ? galleriesMap.get(galleryId) : null

    // Build payment history
    const paymentHistory: Array<{
      status: string
      timestamp: string
      note?: string
    }> = [
      {
        status: 'Ordre oprettet',
        timestamp: order.created_at,
      },
    ]

    if (order.status === 'paid' || order.status === 'completed') {
      paymentHistory.push({
        status: 'Betaling gennemført',
        timestamp: order.updated_at,
      })
    }

    if (order.status === 'completed') {
      paymentHistory.push({
        status: 'Ordre gennemført',
        timestamp: order.updated_at,
      })
    }

    if (order.status === 'cancelled') {
      paymentHistory.push({
        status: 'Ordre annulleret',
        timestamp: order.updated_at,
      })
    }

    return {
      id: order.id,
      artwork: {
        id: artwork?.id || '',
        title: artwork?.title || 'Ukendt kunstværk',
        artist_name: artwork?.profiles?.name || 'Ukendt kunstner',
        image_url: artwork?.image_url || null,
        category: artwork?.category || null,
      },
      gallery: gallery
        ? {
            id: gallery.id,
            name: gallery.gallery_name,
            address: gallery.address,
            city: gallery.city,
            postal_code: gallery.postal_code,
            email: gallery.email,
            phone: gallery.phone,
          }
        : null,
      order_date: order.created_at,
      status: order.status,
      amount_cents: order.amount_cents,
      currency: order.currency,
      payment_method: order.payment_intent_id ? 'Stripe' : null,
      invoice_id: order.invoices?.[0]?.id || null,
      invoice_url: order.invoices?.[0]?.pdf_url || null,
      payment_history: paymentHistory,
    }
  })

  // Apply search filter (client-side for simplicity)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    return transformedOrders.filter(
      (order) =>
        order.artwork.title.toLowerCase().includes(searchLower) ||
        order.artwork.artist_name.toLowerCase().includes(searchLower) ||
        order.gallery?.name?.toLowerCase().includes(searchLower)
    )
  }

  // Apply gallery filter
  if (filters.galleryId && filters.galleryId !== 'all') {
    return transformedOrders.filter(
      (order) => order.gallery?.id === filters.galleryId
    )
  }

  return transformedOrders
}

/**
 * Get single order details for buyer
 */
export async function getBuyerOrderById(
  userId: string,
  orderId: string
): Promise<BuyerOrderDetail | null> {
  const orders = await getBuyerOrders(userId, {})
  return orders.find((o) => o.id === orderId) || null
}

/**
 * Get list of galleries that buyer has ordered from
 */
export async function getBuyerOrderGalleries(
  userId: string
): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(
      `
      artworks!inner(
        gallery_id,
        galleries(id, gallery_name)
      )
    `
    )
    .eq('buyer_id', userId)

  if (!orders) return []

  const galleriesMap = new Map<string, string>()

  orders.forEach((order: any) => {
    const gallery = order.artworks?.galleries
    if (gallery?.id && gallery?.gallery_name) {
      galleriesMap.set(gallery.id, gallery.gallery_name)
    }
  })

  return Array.from(galleriesMap.entries()).map(([id, name]) => ({
    id,
    name,
  }))
}
