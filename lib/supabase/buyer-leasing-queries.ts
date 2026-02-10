import { createClient } from '@/utils/supabase/server'

// ============================================================================
// BUYER LEASING PAGE QUERIES
// ============================================================================

export interface BuyerLeasingStats {
  activeLeases: number
  totalMonthlyPayment: number
  expiringWithin60Days: number
  insuranceStatus: 'ok' | 'missing' | 'expiring'
}

export interface BuyerLeaseDetail {
  id: string
  artwork: {
    id: string
    title: string
    artist_name: string
    image_url: string | null
    category: string | null
  }
  gallery: {
    id: string
    name: string
    address: string | null
    city: string | null
    postal_code: string | null
    email: string | null
    phone: string | null
  }
  monthly_price_cents: number
  currency: string
  start_date: string
  end_date: string
  days_remaining: number
  status: 'active' | 'expiring_soon' | 'overdue' | 'completed' | 'cancelled'
  contract_id: string | null
  contract_url: string | null
  insurance_holder: string | null
  insurance_company: string | null
  insurance_policy_number: string | null
  insurance_coverage_start: string | null
  insurance_coverage_end: string | null
  insurance_status: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  insurance_documents: any[]
  payment_history: Array<{
    id: string
    amount_cents: number
    due_date: string
    paid_date: string | null
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  }>
}

export interface BuyerLeasingFilters {
  search?: string
  status?: string
  insuranceStatus?: string
  galleryId?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  sortBy?: 'newest' | 'highest_price' | 'status'
}

export interface InsuranceGroup {
  missing: BuyerLeaseDetail[]
  expiring: BuyerLeaseDetail[]
  valid: BuyerLeaseDetail[]
}

/**
 * Get leasing statistics for buyer
 */
export async function getBuyerLeasingStats(
  userId: string
): Promise<BuyerLeasingStats> {
  const supabase = await createClient()

  // Get all active leases
  const { data: leases } = await supabase
    .from('gallery_leases')
    .select('monthly_price_cents, end_date, insurance_status')
    .eq('buyer_id', userId)
    .in('status', ['active', 'expiring_soon'])

  if (!leases || leases.length === 0) {
    return {
      activeLeases: 0,
      totalMonthlyPayment: 0,
      expiringWithin60Days: 0,
      insuranceStatus: 'ok',
    }
  }

  // Calculate stats
  const activeLeases = leases.length
  const totalMonthlyPayment = leases.reduce(
    (sum, lease) => sum + lease.monthly_price_cents,
    0
  )

  const today = new Date()
  const sixtyDaysFromNow = new Date()
  sixtyDaysFromNow.setDate(today.getDate() + 60)

  const expiringWithin60Days = leases.filter((lease) => {
    const endDate = new Date(lease.end_date)
    return endDate <= sixtyDaysFromNow && endDate > today
  }).length

  // Determine insurance status
  const hasMissing = leases.some(
    (l) => l.insurance_status === 'missing' || l.insurance_status === 'expired'
  )
  const hasExpiring = leases.some((l) => l.insurance_status === 'expiring_soon')

  let insuranceStatus: 'ok' | 'missing' | 'expiring' = 'ok'
  if (hasMissing) {
    insuranceStatus = 'missing'
  } else if (hasExpiring) {
    insuranceStatus = 'expiring'
  }

  return {
    activeLeases,
    totalMonthlyPayment,
    expiringWithin60Days,
    insuranceStatus,
  }
}

/**
 * Get all leases for buyer with filters
 */
export async function getBuyerLeases(
  userId: string,
  filters: BuyerLeasingFilters = {}
): Promise<BuyerLeaseDetail[]> {
  const supabase = await createClient()

  let query = supabase
    .from('gallery_leases')
    .select(
      `
      id,
      monthly_price_cents,
      currency,
      start_date,
      end_date,
      status,
      contract_id,
      contract_url,
      insurance_holder,
      insurance_company,
      insurance_policy_number,
      insurance_coverage_start,
      insurance_coverage_end,
      insurance_status,
      insurance_documents,
      artworks!inner(
        id,
        title,
        image_url,
        category,
        artist_id,
        profiles!artworks_artist_id_fkey(name)
      ),
      galleries!inner(
        id,
        gallery_name,
        address,
        city,
        postal_code,
        email,
        phone
      )
    `
    )
    .eq('buyer_id', userId)

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply insurance status filter
  if (filters.insuranceStatus && filters.insuranceStatus !== 'all') {
    query = query.eq('insurance_status', filters.insuranceStatus)
  }

  // Apply date filters
  if (filters.dateFrom) {
    query = query.gte('start_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('end_date', filters.dateTo)
  }

  // Apply price filters
  if (filters.priceMin !== undefined) {
    query = query.gte('monthly_price_cents', filters.priceMin * 100)
  }
  if (filters.priceMax !== undefined) {
    query = query.lte('monthly_price_cents', filters.priceMax * 100)
  }

  // Apply gallery filter
  if (filters.galleryId && filters.galleryId !== 'all') {
    query = query.eq('galleries.id', filters.galleryId)
  }

  // Apply sorting
  switch (filters.sortBy) {
    case 'highest_price':
      query = query.order('monthly_price_cents', { ascending: false })
      break
    case 'status':
      query = query.order('status', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('start_date', { ascending: false })
      break
  }

  const { data: leases, error } = await query

  if (error) {
    console.error('Error fetching buyer leases:', error)
    return []
  }

  if (!leases || leases.length === 0) {
    return []
  }

  // Get payment history for all leases
  const leaseIds = leases.map((l) => l.id)
  const { data: payments } = await supabase
    .from('gallery_lease_payments')
    .select('id, lease_id, amount_cents, due_date, paid_date, status')
    .in('lease_id', leaseIds)
    .order('due_date', { ascending: true })

  // Group payments by lease_id
  const paymentsMap = new Map<string, any[]>()
  payments?.forEach((payment) => {
    if (!paymentsMap.has(payment.lease_id)) {
      paymentsMap.set(payment.lease_id, [])
    }
    paymentsMap.get(payment.lease_id)!.push(payment)
  })

  // Transform data
  const transformedLeases: BuyerLeaseDetail[] = leases.map((lease: any) => {
    const artwork = lease.artworks
    const gallery = lease.galleries

    const endDate = new Date(lease.end_date)
    const today = new Date()
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    )

    const paymentHistory = (paymentsMap.get(lease.id) || []).map((p: any) => ({
      id: p.id,
      amount_cents: p.amount_cents,
      due_date: p.due_date,
      paid_date: p.paid_date,
      status: p.status,
    }))

    return {
      id: lease.id,
      artwork: {
        id: artwork?.id || '',
        title: artwork?.title || 'Ukendt kunstværk',
        artist_name: artwork?.profiles?.name || 'Ukendt kunstner',
        image_url: artwork?.image_url || null,
        category: artwork?.category || null,
      },
      gallery: {
        id: gallery?.id || '',
        name: gallery?.gallery_name || 'Ukendt galleri',
        address: gallery?.address || null,
        city: gallery?.city || null,
        postal_code: gallery?.postal_code || null,
        email: gallery?.email || null,
        phone: gallery?.phone || null,
      },
      monthly_price_cents: lease.monthly_price_cents,
      currency: lease.currency,
      start_date: lease.start_date,
      end_date: lease.end_date,
      days_remaining: daysRemaining,
      status: lease.status,
      contract_id: lease.contract_id,
      contract_url: lease.contract_url,
      insurance_holder: lease.insurance_holder,
      insurance_company: lease.insurance_company,
      insurance_policy_number: lease.insurance_policy_number,
      insurance_coverage_start: lease.insurance_coverage_start,
      insurance_coverage_end: lease.insurance_coverage_end,
      insurance_status: lease.insurance_status,
      insurance_documents: lease.insurance_documents || [],
      payment_history: paymentHistory,
    }
  })

  // Apply search filter (client-side for simplicity)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    return transformedLeases.filter(
      (lease) =>
        lease.artwork.title.toLowerCase().includes(searchLower) ||
        lease.artwork.artist_name.toLowerCase().includes(searchLower) ||
        lease.gallery.name.toLowerCase().includes(searchLower)
    )
  }

  return transformedLeases
}

/**
 * Get single lease details for buyer
 */
export async function getBuyerLeaseById(
  userId: string,
  leaseId: string
): Promise<BuyerLeaseDetail | null> {
  const leases = await getBuyerLeases(userId, {})
  return leases.find((l) => l.id === leaseId) || null
}

/**
 * Get list of galleries that buyer has leases with
 */
export async function getBuyerLeaseGalleries(
  userId: string
): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient()

  const { data: leases } = await supabase
    .from('gallery_leases')
    .select(
      `
      galleries!inner(id, gallery_name)
    `
    )
    .eq('buyer_id', userId)

  if (!leases) return []

  const galleriesMap = new Map<string, string>()

  leases.forEach((lease: any) => {
    const gallery = lease.galleries
    if (gallery?.id && gallery?.gallery_name) {
      galleriesMap.set(gallery.id, gallery.gallery_name)
    }
  })

  return Array.from(galleriesMap.entries()).map(([id, name]) => ({
    id,
    name,
  }))
}

/**
 * Get leases grouped by insurance status
 */
export async function getBuyerLeasesGroupedByInsurance(
  userId: string
): Promise<InsuranceGroup> {
  const leases = await getBuyerLeases(userId, {})

  const missing: BuyerLeaseDetail[] = []
  const expiring: BuyerLeaseDetail[] = []
  const valid: BuyerLeaseDetail[] = []

  leases.forEach((lease) => {
    // Only include active and expiring_soon leases
    if (lease.status !== 'active' && lease.status !== 'expiring_soon') {
      return
    }

    if (
      lease.insurance_status === 'missing' ||
      lease.insurance_status === 'expired'
    ) {
      missing.push(lease)
    } else if (lease.insurance_status === 'expiring_soon') {
      expiring.push(lease)
    } else if (lease.insurance_status === 'valid') {
      valid.push(lease)
    }
  })

  return { missing, expiring, valid }
}
