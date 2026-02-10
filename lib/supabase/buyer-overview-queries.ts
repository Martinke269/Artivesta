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
