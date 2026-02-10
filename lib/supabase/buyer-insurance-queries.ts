import { createClient } from '@/utils/supabase/server'
import { BuyerLeaseDetail } from './buyer-leasing-queries'
import type { BuyerInsuranceStats, BuyerInsuranceFilters } from './buyer-insurance-types'

// ============================================================================
// BUYER INSURANCE PAGE QUERIES
// ============================================================================

// Re-export types for convenience
export type { BuyerInsuranceStats, BuyerInsuranceFilters }

/**
 * Get insurance statistics for buyer
 */
export async function getBuyerInsuranceStats(
  userId: string
): Promise<BuyerInsuranceStats> {
  const supabase = await createClient()

  // Get all active and expiring_soon leases
  const { data: leases } = await supabase
    .from('gallery_leases')
    .select('insurance_status')
    .eq('buyer_id', userId)
    .in('status', ['active', 'expiring_soon'])

  if (!leases || leases.length === 0) {
    return {
      totalInsured: 0,
      expiringSoon: 0,
      expired: 0,
      missing: 0,
    }
  }

  const totalInsured = leases.filter(
    (l) => l.insurance_status === 'valid' || l.insurance_status === 'expiring_soon'
  ).length

  const expiringSoon = leases.filter(
    (l) => l.insurance_status === 'expiring_soon'
  ).length

  const expired = leases.filter((l) => l.insurance_status === 'expired').length

  const missing = leases.filter((l) => l.insurance_status === 'missing').length

  return {
    totalInsured,
    expiringSoon,
    expired,
    missing,
  }
}

/**
 * Get all insurance records for buyer with filters
 */
export async function getBuyerInsuranceRecords(
  userId: string,
  filters: BuyerInsuranceFilters = {}
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
    .in('status', ['active', 'expiring_soon']) // Only show active leases

  // Apply insurance status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('insurance_status', filters.status)
  }

  // Apply insurance holder filter
  if (filters.insuranceHolder && filters.insuranceHolder !== 'all') {
    query = query.eq('insurance_holder', filters.insuranceHolder)
  }

  // Apply date filters (for insurance coverage)
  if (filters.dateFrom) {
    query = query.gte('insurance_coverage_start', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('insurance_coverage_end', filters.dateTo)
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
    case 'expiring_soon':
      query = query.order('insurance_coverage_end', { ascending: true, nullsFirst: false })
      break
    case 'status':
      query = query.order('insurance_status', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('start_date', { ascending: false })
      break
  }

  const { data: leases, error } = await query

  if (error) {
    console.error('Error fetching buyer insurance records:', error)
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
        lease.gallery.name.toLowerCase().includes(searchLower) ||
        lease.insurance_company?.toLowerCase().includes(searchLower) ||
        lease.insurance_policy_number?.toLowerCase().includes(searchLower)
    )
  }

  return transformedLeases
}

/**
 * Get single insurance record details for buyer
 */
export async function getBuyerInsuranceRecordById(
  userId: string,
  leaseId: string
): Promise<BuyerLeaseDetail | null> {
  const records = await getBuyerInsuranceRecords(userId, {})
  return records.find((r) => r.id === leaseId) || null
}

/**
 * Get list of galleries that buyer has insurance with
 */
export async function getBuyerInsuranceGalleries(
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
    .in('status', ['active', 'expiring_soon'])

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
