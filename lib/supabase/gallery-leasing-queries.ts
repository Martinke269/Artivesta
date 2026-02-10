import { createClient } from '@/utils/supabase/server'

export interface GalleryLease {
  id: string
  gallery_id: string
  artwork_id: string
  buyer_id: string
  monthly_price_cents: number
  currency: string
  start_date: string
  end_date: string
  status: 'active' | 'expiring_soon' | 'overdue' | 'completed' | 'cancelled'
  contract_id: string | null
  contract_url: string | null
  insurance_holder: 'gallery' | 'buyer' | 'external' | 'missing' | null
  insurance_company: string | null
  insurance_policy_number: string | null
  insurance_coverage_start: string | null
  insurance_coverage_end: string | null
  insurance_status: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  insurance_documents: any[]
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  artwork: {
    id: string
    title: string
    image_url: string | null
    category: string | null
    artist_id: string
    artist: {
      name: string
    }
  }
  buyer: {
    name: string
  }
}

export interface LeasePayment {
  id: string
  lease_id: string
  amount_cents: number
  currency: string
  due_date: string
  paid_date: string | null
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  payment_method: string | null
  transaction_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LeasingSummary {
  active_leases: number
  total_monthly_revenue: number
  expiring_soon: number
  insurance_ok: number
  insurance_missing: number
}

export async function getGalleryLeases(
  galleryId: string,
  filters?: {
    search?: string
    status?: string
    insurance_status?: string
    insurance_holder?: string
    artist_id?: string
    start_date?: string
    end_date?: string
    min_price?: number
    max_price?: number
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('gallery_leases')
    .select(`
      *,
      artwork:artworks!inner (
        id,
        title,
        image_url,
        category,
        artist_id,
        artist:profiles!artworks_artist_id_fkey (
          name
        )
      ),
      buyer:profiles!gallery_leases_buyer_id_fkey (
        name
      )
    `)
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.search) {
    query = query.ilike('artwork.title', `%${filters.search}%`)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.insurance_status) {
    query = query.eq('insurance_status', filters.insurance_status)
  }

  if (filters?.insurance_holder) {
    query = query.eq('insurance_holder', filters.insurance_holder)
  }

  if (filters?.artist_id) {
    query = query.eq('artwork.artist_id', filters.artist_id)
  }

  if (filters?.start_date) {
    query = query.gte('start_date', filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte('end_date', filters.end_date)
  }

  if (filters?.min_price) {
    query = query.gte('monthly_price_cents', filters.min_price * 100)
  }

  if (filters?.max_price) {
    query = query.lte('monthly_price_cents', filters.max_price * 100)
  }

  const { data, error } = await query

  if (error) throw error
  return data as GalleryLease[]
}

export async function getGalleryLease(leaseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_leases')
    .select(`
      *,
      artwork:artworks!inner (
        id,
        title,
        image_url,
        category,
        artist_id,
        artist:profiles!artworks_artist_id_fkey (
          name
        )
      ),
      buyer:profiles!gallery_leases_buyer_id_fkey (
        name
      )
    `)
    .eq('id', leaseId)
    .single()

  if (error) throw error
  return data as GalleryLease
}

export async function getLeasePayments(leaseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_lease_payments')
    .select('*')
    .eq('lease_id', leaseId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data as LeasePayment[]
}

export async function getLeasingSummary(galleryId: string): Promise<LeasingSummary> {
  const supabase = await createClient()

  // Get all active and expiring soon leases
  const { data: leases, error } = await supabase
    .from('gallery_leases')
    .select('monthly_price_cents, status, insurance_status, end_date')
    .eq('gallery_id', galleryId)
    .in('status', ['active', 'expiring_soon'])

  if (error) throw error

  const now = new Date()
  const sixtyDaysFromNow = new Date()
  sixtyDaysFromNow.setDate(now.getDate() + 60)

  const summary: LeasingSummary = {
    active_leases: leases?.filter(l => l.status === 'active' || l.status === 'expiring_soon').length || 0,
    total_monthly_revenue: leases?.reduce((sum, l) => sum + (l.monthly_price_cents || 0), 0) || 0,
    expiring_soon: leases?.filter(l => {
      const endDate = new Date(l.end_date)
      return endDate <= sixtyDaysFromNow && endDate > now
    }).length || 0,
    insurance_ok: leases?.filter(l => l.insurance_status === 'valid').length || 0,
    insurance_missing: leases?.filter(l => l.insurance_status === 'missing' || l.insurance_status === 'expired').length || 0,
  }

  return summary
}

export async function getInsuranceStatusBreakdown(galleryId: string) {
  const supabase = await createClient()

  const { data: leases, error } = await supabase
    .from('gallery_leases')
    .select('insurance_status, insurance_coverage_end, insurance_holder')
    .eq('gallery_id', galleryId)
    .in('status', ['active', 'expiring_soon'])

  if (error) throw error

  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)

  return {
    missing: leases?.filter(l => !l.insurance_holder || l.insurance_holder === 'missing').length || 0,
    expired: leases?.filter(l => l.insurance_status === 'expired').length || 0,
    expiring_soon: leases?.filter(l => {
      if (!l.insurance_coverage_end) return false
      const endDate = new Date(l.insurance_coverage_end)
      return endDate <= thirtyDaysFromNow && endDate > now
    }).length || 0,
    valid: leases?.filter(l => l.insurance_status === 'valid').length || 0,
  }
}

export async function updateLeaseInsurance(
  leaseId: string,
  insurance: {
    insurance_holder: 'gallery' | 'buyer' | 'external' | 'missing'
    insurance_company?: string
    insurance_policy_number?: string
    insurance_coverage_start?: string
    insurance_coverage_end?: string
    insurance_status: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_leases')
    .update(insurance)
    .eq('id', leaseId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markLeaseAsReturned(leaseId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gallery_leases')
    .update({ status: 'completed' })
    .eq('id', leaseId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLeasePaymentStatus(
  paymentId: string,
  status: 'pending' | 'paid' | 'overdue' | 'cancelled',
  paid_date?: string,
  payment_method?: string,
  transaction_id?: string
) {
  const supabase = await createClient()

  const updates: any = { status }
  if (paid_date) updates.paid_date = paid_date
  if (payment_method) updates.payment_method = payment_method
  if (transaction_id) updates.transaction_id = transaction_id

  const { data, error } = await supabase
    .from('gallery_lease_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}
