import { createClient } from '@/utils/supabase/server'
import type { BuyerInvoiceDetail, BuyerInvoicesFilters } from './buyer-invoices-types'

// ============================================================================
// BUYER INVOICES LIST QUERIES
// ============================================================================

/**
 * Get all invoices for buyer with filters
 */
export async function getBuyerInvoices(
  userId: string,
  filters: BuyerInvoicesFilters = {}
): Promise<BuyerInvoiceDetail[]> {
  const supabase = await createClient()

  // Get all invoices for buyer
  let query = supabase
    .from('invoices')
    .select(
      `
      id,
      invoice_number,
      amount_cents,
      commission_cents,
      status,
      created_at,
      order_id,
      orders!invoices_order_id_fkey(
        id,
        amount_cents,
        currency,
        status,
        payment_intent_id,
        created_at,
        artworks!inner(
          id,
          title,
          image_url,
          gallery_id,
          artist_id,
          profiles!artworks_artist_id_fkey(name)
        )
      )
    `
    )
    .eq('recipient_id', userId)
    .eq('invoice_type', 'buyer')

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

  const { data: invoices, error } = await query

  if (error) {
    console.error('Error fetching buyer invoices:', error)
    return []
  }

  if (!invoices || invoices.length === 0) {
    return []
  }

  // Get lease payments for invoices (if any)
  const { data: leasePayments } = await supabase
    .from('lease_payments')
    .select(
      `
      id,
      lease_id,
      amount_cents,
      currency,
      due_date,
      paid_date,
      status,
      payment_method,
      created_at,
      leases!inner(
        id,
        gallery_id,
        artwork_id,
        buyer_id,
        monthly_price_cents,
        start_date,
        end_date,
        artworks!inner(
          id,
          title,
          image_url,
          artist_id,
          profiles!artworks_artist_id_fkey(name)
        )
      )
    `
    )
    .eq('leases.buyer_id', userId)

  // Get gallery information
  const galleryIds = [
    ...invoices
      .map((i: any) => i.orders?.artworks?.gallery_id)
      .filter((id): id is string => id !== null && id !== undefined),
    ...(leasePayments || [])
      .map((lp: any) => lp.leases?.gallery_id)
      .filter((id): id is string => id !== null && id !== undefined),
  ]

  let galleriesMap: Map<string, any> = new Map()

  if (galleryIds.length > 0) {
    const uniqueGalleryIds = Array.from(new Set(galleryIds))
    const { data: galleries } = await supabase
      .from('galleries')
      .select('id, gallery_name, email, phone')
      .in('id', uniqueGalleryIds)

    if (galleries) {
      galleries.forEach((g) => galleriesMap.set(g.id, g))
    }
  }

  // Transform order invoices
  const orderInvoices: BuyerInvoiceDetail[] = invoices
    .filter((invoice: any) => invoice.order_id && invoice.orders)
    .map((invoice: any) => {
      const order = invoice.orders
      const artwork = order?.artworks
      const galleryId = artwork?.gallery_id
      const gallery = galleryId ? galleriesMap.get(galleryId) : null

      // Calculate VAT (25% in Denmark)
      const vatCents = Math.round(invoice.amount_cents * 0.25)
      const totalCents = invoice.amount_cents + vatCents

      // Determine status
      let status: 'paid' | 'overdue' | 'unpaid' = 'unpaid'
      if (invoice.status === 'paid') {
        status = 'paid'
      } else {
        // Check if overdue (more than 30 days old)
        const invoiceDate = new Date(invoice.created_at)
        const daysSinceInvoice = Math.floor(
          (Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceInvoice > 30) {
          status = 'overdue'
        }
      }

      // Build payment history
      const paymentHistory: Array<{
        status: string
        timestamp: string
        note?: string
      }> = [
        {
          status: 'Faktura oprettet',
          timestamp: invoice.created_at,
        },
      ]

      if (invoice.status === 'sent') {
        paymentHistory.push({
          status: 'Faktura sendt',
          timestamp: invoice.created_at,
        })
      }

      if (invoice.status === 'paid') {
        paymentHistory.push({
          status: 'Betaling modtaget',
          timestamp: order.created_at,
        })
      }

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_type: 'order' as const,
        date: invoice.created_at,
        due_date: new Date(
          new Date(invoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        amount_cents: invoice.amount_cents,
        vat_cents: vatCents,
        total_cents: totalCents,
        currency: order.currency || 'DKK',
        status,
        payment_method: order.payment_intent_id ? 'Stripe' : null,
        pdf_url: null,
        related_item: {
          id: order.id,
          type: 'order' as const,
          artwork: {
            id: artwork?.id || '',
            title: artwork?.title || 'Ukendt kunstværk',
            artist_name: artwork?.profiles?.name || 'Ukendt kunstner',
            image_url: artwork?.image_url || null,
          },
          gallery: gallery
            ? {
                id: gallery.id,
                name: gallery.gallery_name,
                email: gallery.email,
                phone: gallery.phone,
              }
            : null,
          order_date: order.created_at,
        },
        payment_history: paymentHistory,
      }
    })

  // Transform lease payment invoices
  const leaseInvoices: BuyerInvoiceDetail[] = (leasePayments || []).map(
    (payment: any) => {
      const lease = payment.leases
      const artwork = lease?.artworks
      const galleryId = lease?.gallery_id
      const gallery = galleryId ? galleriesMap.get(galleryId) : null

      // Calculate VAT (25% in Denmark)
      const vatCents = Math.round(payment.amount_cents * 0.25)
      const totalCents = payment.amount_cents + vatCents

      // Determine status
      let status: 'paid' | 'overdue' | 'unpaid' = 'unpaid'
      if (payment.status === 'paid') {
        status = 'paid'
      } else if (payment.status === 'overdue') {
        status = 'overdue'
      }

      // Build payment history
      const paymentHistory: Array<{
        status: string
        timestamp: string
        note?: string
      }> = [
        {
          status: 'Leasingbetaling oprettet',
          timestamp: payment.created_at,
          note: `Forfaldsdato: ${new Date(payment.due_date).toLocaleDateString('da-DK')}`,
        },
      ]

      if (payment.paid_date) {
        paymentHistory.push({
          status: 'Betaling gennemført',
          timestamp: payment.paid_date,
        })
      }

      return {
        id: payment.id,
        invoice_number: `LP-${payment.id.slice(0, 8).toUpperCase()}`,
        invoice_type: 'leasing' as const,
        date: payment.created_at,
        due_date: payment.due_date,
        amount_cents: payment.amount_cents,
        vat_cents: vatCents,
        total_cents: totalCents,
        currency: payment.currency || 'DKK',
        status,
        payment_method: payment.payment_method || null,
        pdf_url: null,
        related_item: {
          id: lease.id,
          type: 'leasing' as const,
          artwork: {
            id: artwork?.id || '',
            title: artwork?.title || 'Ukendt kunstværk',
            artist_name: artwork?.profiles?.name || 'Ukendt kunstner',
            image_url: artwork?.image_url || null,
          },
          gallery: gallery
            ? {
                id: gallery.id,
                name: gallery.gallery_name,
                email: gallery.email,
                phone: gallery.phone,
              }
            : null,
          leasing_period: {
            start: lease.start_date,
            end: lease.end_date,
            monthly_price_cents: lease.monthly_price_cents,
          },
        },
        payment_history: paymentHistory,
      }
    }
  )

  // Combine and sort all invoices
  let allInvoices = [...orderInvoices, ...leaseInvoices]

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    allInvoices = allInvoices.filter((inv) => inv.status === filters.status)
  }

  // Apply type filter
  if (filters.type && filters.type !== 'all') {
    allInvoices = allInvoices.filter((inv) => inv.invoice_type === filters.type)
  }

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    allInvoices = allInvoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(searchLower) ||
        inv.related_item.artwork.title.toLowerCase().includes(searchLower) ||
        inv.related_item.artwork.artist_name.toLowerCase().includes(searchLower) ||
        inv.related_item.gallery?.name?.toLowerCase().includes(searchLower)
    )
  }

  // Apply gallery filter
  if (filters.galleryId && filters.galleryId !== 'all') {
    allInvoices = allInvoices.filter(
      (inv) => inv.related_item.gallery?.id === filters.galleryId
    )
  }

  // Sort by date (newest first) if not already sorted
  if (!filters.sortBy || filters.sortBy === 'newest') {
    allInvoices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } else if (filters.sortBy === 'highest_amount') {
    allInvoices.sort((a, b) => b.total_cents - a.total_cents)
  } else if (filters.sortBy === 'status') {
    const statusOrder = { overdue: 0, unpaid: 1, paid: 2 }
    allInvoices.sort(
      (a, b) => statusOrder[a.status] - statusOrder[b.status]
    )
  }

  return allInvoices
}

/**
 * Get list of galleries that buyer has invoices from
 */
export async function getBuyerInvoiceGalleries(
  userId: string
): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient()

  // Get galleries from orders
  const { data: orderInvoices } = await supabase
    .from('invoices')
    .select(
      `
      orders!inner(
        artworks!inner(
          gallery_id,
          galleries(id, gallery_name)
        )
      )
    `
    )
    .eq('recipient_id', userId)
    .eq('invoice_type', 'buyer')

  // Get galleries from leases
  const { data: leases } = await supabase
    .from('leases')
    .select(
      `
      gallery_id,
      galleries(id, gallery_name)
    `
    )
    .eq('buyer_id', userId)

  const galleriesMap = new Map<string, string>()

  // Add galleries from orders
  orderInvoices?.forEach((invoice: any) => {
    const gallery = invoice.orders?.artworks?.galleries
    if (gallery?.id && gallery?.gallery_name) {
      galleriesMap.set(gallery.id, gallery.gallery_name)
    }
  })

  // Add galleries from leases
  leases?.forEach((lease: any) => {
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
