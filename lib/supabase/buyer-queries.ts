import { createClient } from '@/utils/supabase/server'

// ============================================================================
// BUYER DASHBOARD OVERVIEW QUERIES
// ============================================================================

export interface BuyerOverviewStats {
  activeLeases: number
  openOrders: number
  paidInvoices: number
  insuranceStatus: 'ok' | 'missing' | 'expiring'
}

export interface BuyerActivity {
  id: string
  type: 'order' | 'lease_payment' | 'insurance' | 'system'
  title: string
  description: string
  date: string
  status?: string
}

export interface BuyerOrder {
  id: string
  artwork: {
    id: string
    title: string
    image_url: string | null
  }
  amount_cents: number
  currency: string
  status: string
  created_at: string
}

export interface BuyerLease {
  id: string
  artwork: {
    id: string
    title: string
    image_url: string | null
  }
  monthly_price_cents: number
  currency: string
  status: string
  end_date: string
  days_remaining: number
}

export interface BuyerInsuranceItem {
  lease_id: string
  artwork_title: string
  status: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  coverage_end?: string
}

/**
 * Get overview statistics for buyer dashboard
 */
export async function getBuyerOverviewStats(
  userId: string
): Promise<BuyerOverviewStats> {
  const supabase = await createClient()

  // Count active leases (both regular and gallery leases)
  const { count: regularLeasesCount } = await supabase
    .from('leases')
    .select('*', { count: 'exact', head: true })
    .eq('lessee_id', userId)
    .eq('status', 'active')

  const { count: galleryLeasesCount } = await supabase
    .from('gallery_leases')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)
    .eq('status', 'active')

  const activeLeases = (regularLeasesCount || 0) + (galleryLeasesCount || 0)

  // Count open orders (pending or paid, not completed/cancelled)
  const { count: openOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId)
    .in('status', ['pending', 'paid'])

  // Count paid invoices
  const { count: paidInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('status', 'paid')

  // Check insurance status
  const { data: leasesWithInsurance } = await supabase
    .from('gallery_leases')
    .select('insurance_status')
    .eq('buyer_id', userId)
    .eq('status', 'active')

  let insuranceStatus: 'ok' | 'missing' | 'expiring' = 'ok'
  if (leasesWithInsurance && leasesWithInsurance.length > 0) {
    const hasMissing = leasesWithInsurance.some(
      (l) => l.insurance_status === 'missing' || l.insurance_status === 'expired'
    )
    const hasExpiring = leasesWithInsurance.some(
      (l) => l.insurance_status === 'expiring_soon'
    )

    if (hasMissing) {
      insuranceStatus = 'missing'
    } else if (hasExpiring) {
      insuranceStatus = 'expiring'
    }
  }

  return {
    activeLeases: activeLeases || 0,
    openOrders: openOrders || 0,
    paidInvoices: paidInvoices || 0,
    insuranceStatus,
  }
}

/**
 * Get recent activities for buyer
 */
export async function getBuyerRecentActivities(
  userId: string,
  limit: number = 10
): Promise<BuyerActivity[]> {
  const supabase = await createClient()
  const activities: BuyerActivity[] = []

  // Get recent orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, created_at, artworks(title)')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (orders) {
    orders.forEach((order) => {
      activities.push({
        id: order.id,
        type: 'order',
        title: 'Ny ordre',
        description: `Ordre for "${(order.artworks as any)?.title || 'Kunstværk'}"`,
        date: order.created_at,
        status: order.status,
      })
    })
  }

  // Get recent lease payments
  const { data: leasePayments } = await supabase
    .from('gallery_lease_payments')
    .select(
      `
      id,
      status,
      due_date,
      paid_date,
      gallery_leases!inner(
        buyer_id,
        artworks(title)
      )
    `
    )
    .eq('gallery_leases.buyer_id', userId)
    .order('due_date', { ascending: false })
    .limit(5)

  if (leasePayments) {
    leasePayments.forEach((payment: any) => {
      activities.push({
        id: payment.id,
        type: 'lease_payment',
        title: payment.status === 'paid' ? 'Leasingbetaling gennemført' : 'Leasingbetaling forfalden',
        description: `Betaling for "${payment.gallery_leases?.artworks?.title || 'Kunstværk'}"`,
        date: payment.paid_date || payment.due_date,
        status: payment.status,
      })
    })
  }

  // Sort all activities by date
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return activities.slice(0, limit)
}

/**
 * Get recent orders for buyer (mini table)
 */
export async function getBuyerRecentOrders(
  userId: string,
  limit: number = 5
): Promise<BuyerOrder[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      amount_cents,
      currency,
      status,
      created_at,
      artworks(id, title, image_url)
    `
    )
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching buyer orders:', error)
    return []
  }

  return (data || []).map((order) => ({
    id: order.id,
    artwork: {
      id: (order.artworks as any)?.id || '',
      title: (order.artworks as any)?.title || 'Ukendt kunstværk',
      image_url: (order.artworks as any)?.image_url || null,
    },
    amount_cents: order.amount_cents,
    currency: order.currency,
    status: order.status,
    created_at: order.created_at,
  }))
}

/**
 * Get active leases for buyer (mini table)
 */
export async function getBuyerActiveLeases(
  userId: string,
  limit: number = 5
): Promise<BuyerLease[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_leases')
    .select(
      `
      id,
      monthly_price_cents,
      currency,
      status,
      end_date,
      artworks(id, title, image_url)
    `
    )
    .eq('buyer_id', userId)
    .in('status', ['active', 'expiring_soon'])
    .order('end_date', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching buyer leases:', error)
    return []
  }

  return (data || []).map((lease) => {
    const endDate = new Date(lease.end_date)
    const today = new Date()
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    )

    return {
      id: lease.id,
      artwork: {
        id: (lease.artworks as any)?.id || '',
        title: (lease.artworks as any)?.title || 'Ukendt kunstværk',
        image_url: (lease.artworks as any)?.image_url || null,
      },
      monthly_price_cents: lease.monthly_price_cents,
      currency: lease.currency,
      status: lease.status,
      end_date: lease.end_date,
      days_remaining: daysRemaining,
    }
  })
}

/**
 * Get insurance status for buyer's leases
 */
export async function getBuyerInsuranceStatus(
  userId: string
): Promise<{
  missing: BuyerInsuranceItem[]
  expiring: BuyerInsuranceItem[]
  valid: BuyerInsuranceItem[]
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_leases')
    .select(
      `
      id,
      insurance_status,
      insurance_coverage_end,
      artworks(title)
    `
    )
    .eq('buyer_id', userId)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching insurance status:', error)
    return { missing: [], expiring: [], valid: [] }
  }

  const missing: BuyerInsuranceItem[] = []
  const expiring: BuyerInsuranceItem[] = []
  const valid: BuyerInsuranceItem[] = []

  data?.forEach((lease: any) => {
    const item: BuyerInsuranceItem = {
      lease_id: lease.id,
      artwork_title: lease.artworks?.title || 'Ukendt kunstværk',
      status: lease.insurance_status,
      coverage_end: lease.insurance_coverage_end,
    }

    if (lease.insurance_status === 'missing' || lease.insurance_status === 'expired') {
      missing.push(item)
    } else if (lease.insurance_status === 'expiring_soon') {
      expiring.push(item)
    } else if (lease.insurance_status === 'valid') {
      valid.push(item)
    }
  })

  return { missing, expiring, valid }
}

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
