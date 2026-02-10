import { createClient } from '@/utils/supabase/server'
import type {
  BuyerPaymentDetail,
  BuyerPaymentsFilters,
} from './buyer-payments-types'

// ============================================================================
// BUYER PAYMENTS LIST QUERIES
// ============================================================================

/**
 * Get all payments for buyer with filters
 */
export async function getBuyerPayments(
  userId: string,
  filters: BuyerPaymentsFilters = {}
): Promise<BuyerPaymentDetail[]> {
  const supabase = await createClient()

  // Get all orders for buyer
  const { data: orders } = await supabase
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
        gallery_id,
        artist_id,
        profiles!artworks_artist_id_fkey(name)
      )
    `
    )
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  // Get all lease payments for buyer
  const { data: leasePayments } = await supabase
    .from('lease_payments')
    .select(
      `
      id,
      amount_cents,
      currency,
      status,
      payment_method,
      transaction_id,
      payment_date,
      due_date,
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
    .order('created_at', { ascending: false })

  // Get gallery information
  const galleryIds = [
    ...(orders || [])
      .map((o: any) => o.artworks?.gallery_id)
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

  // Get invoices for orders and leases
  const orderIds = (orders || []).map((o: any) => o.id)
  const leaseIds = (leasePayments || []).map((lp: any) => lp.leases?.id).filter(Boolean)

  let invoicesMap: Map<string, any> = new Map()

  if (orderIds.length > 0) {
    const { data: orderInvoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, order_id, created_at, amount_cents')
      .in('order_id', orderIds)
      .eq('invoice_type', 'buyer')

    if (orderInvoices) {
      orderInvoices.forEach((inv) => {
        if (inv.order_id) {
          invoicesMap.set(`order_${inv.order_id}`, inv)
        }
      })
    }
  }

  // Transform order payments
  const orderPayments: BuyerPaymentDetail[] = (orders || []).map(
    (order: any) => {
      const artwork = order.artworks
      const galleryId = artwork?.gallery_id
      const gallery = galleryId ? galleriesMap.get(galleryId) : null
      const invoice = invoicesMap.get(`order_${order.id}`)

      // Calculate VAT (25% in Denmark)
      const vatCents = Math.round(order.amount_cents * 0.25)
      const totalCents = order.amount_cents + vatCents

      // Determine payment status
      let status: 'completed' | 'rejected' | 'failed' | 'pending' = 'pending'
      if (
        order.status === 'completed' ||
        order.status === 'shipped' ||
        order.status === 'delivered'
      ) {
        status = 'completed'
      } else if (order.status === 'failed') {
        status = 'failed'
      } else if (order.status === 'cancelled' || order.status === 'refunded') {
        status = 'rejected'
      }

      // Determine payment method
      let paymentMethod: 'card' | 'invoice' | 'bank_transfer' | null = null
      if (order.payment_intent_id) {
        paymentMethod = 'card'
      }

      // Build Stripe events (mock data - in production, fetch from Stripe API)
      const stripeEvents: Array<{
        status: string
        timestamp: string
        note?: string
        metadata?: Record<string, any>
      }> = []

      if (order.payment_intent_id) {
        stripeEvents.push({
          status: 'Betalingsintention oprettet',
          timestamp: order.created_at,
          note: 'payment_intent.created',
          metadata: { payment_intent_id: order.payment_intent_id },
        })

        if (status === 'completed') {
          stripeEvents.push({
            status: 'Betaling gennemført',
            timestamp: order.updated_at || order.created_at,
            note: 'payment_intent.succeeded',
          })
        } else if (status === 'failed') {
          stripeEvents.push({
            status: 'Betaling fejlede',
            timestamp: order.updated_at || order.created_at,
            note: 'payment_intent.payment_failed',
          })
        }
      }

      // Build error info
      let errorInfo: {
        rejection_reason: string | null
        error_code: string | null
        suggested_solution: string | null
      } | null = null

      if (status === 'failed' || status === 'rejected') {
        errorInfo = {
          rejection_reason:
            status === 'rejected'
              ? 'Ordre annulleret'
              : 'Betalingen kunne ikke gennemføres',
          error_code: status === 'failed' ? 'payment_failed' : 'cancelled',
          suggested_solution:
            status === 'failed'
              ? 'Kontakt din bank eller prøv et andet betalingskort'
              : 'Kontakt galleriet for mere information',
        }
      }

      return {
        id: order.id,
        payment_id: order.payment_intent_id || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
        type: 'order' as const,
        date: order.created_at,
        amount_cents: order.amount_cents,
        vat_cents: vatCents,
        total_cents: totalCents,
        currency: order.currency || 'DKK',
        status,
        payment_method: paymentMethod,
        receipt_url: null, // TODO: Generate receipt URL
        related_invoice: invoice
          ? {
              id: invoice.id,
              invoice_number: invoice.invoice_number,
              type: 'order' as const,
              due_date: new Date(
                new Date(invoice.created_at).getTime() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              amount_cents: invoice.amount_cents,
              link_url: `/buyer/dashboard/invoices`, // TODO: Direct link to invoice
            }
          : null,
        related_item: {
          id: order.id,
          type: 'order' as const,
          order_date: order.created_at,
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
        },
        stripe_events: stripeEvents,
        error_info: errorInfo,
      }
    }
  )

  // Transform lease payments
  const leasingPayments: BuyerPaymentDetail[] = (leasePayments || []).map(
    (payment: any) => {
      const lease = payment.leases
      const artwork = lease?.artworks
      const galleryId = lease?.gallery_id
      const gallery = galleryId ? galleriesMap.get(galleryId) : null

      // Calculate VAT (25% in Denmark)
      const vatCents = Math.round(payment.amount_cents * 0.25)
      const totalCents = payment.amount_cents + vatCents

      // Determine payment status
      let status: 'completed' | 'rejected' | 'failed' | 'pending' = 'pending'
      if (payment.status === 'paid') {
        status = 'completed'
      } else if (payment.status === 'failed') {
        status = 'failed'
      } else if (payment.status === 'overdue') {
        status = 'pending' // Overdue is still pending
      }

      // Determine payment method
      let paymentMethod: 'card' | 'invoice' | 'bank_transfer' | null = null
      if (payment.payment_method) {
        if (payment.payment_method.includes('card')) {
          paymentMethod = 'card'
        } else if (payment.payment_method.includes('invoice')) {
          paymentMethod = 'invoice'
        } else if (payment.payment_method.includes('bank')) {
          paymentMethod = 'bank_transfer'
        }
      }

      // Build Stripe events
      const stripeEvents: Array<{
        status: string
        timestamp: string
        note?: string
        metadata?: Record<string, any>
      }> = []

      if (payment.transaction_id) {
        stripeEvents.push({
          status: 'Leasingbetaling oprettet',
          timestamp: payment.created_at,
          note: 'lease_payment.created',
          metadata: { transaction_id: payment.transaction_id },
        })

        if (status === 'completed' && payment.payment_date) {
          stripeEvents.push({
            status: 'Betaling gennemført',
            timestamp: payment.payment_date,
            note: 'lease_payment.succeeded',
          })
        } else if (status === 'failed') {
          stripeEvents.push({
            status: 'Betaling fejlede',
            timestamp: payment.created_at,
            note: 'lease_payment.failed',
          })
        }
      }

      // Build error info
      let errorInfo: {
        rejection_reason: string | null
        error_code: string | null
        suggested_solution: string | null
      } | null = null

      if (status === 'failed') {
        errorInfo = {
          rejection_reason: 'Leasingbetaling kunne ikke gennemføres',
          error_code: 'lease_payment_failed',
          suggested_solution:
            'Kontakt din bank eller prøv et andet betalingskort',
        }
      }

      return {
        id: payment.id,
        payment_id:
          payment.transaction_id || `LP-${payment.id.slice(0, 8).toUpperCase()}`,
        type: 'leasing' as const,
        date: payment.created_at,
        amount_cents: payment.amount_cents,
        vat_cents: vatCents,
        total_cents: totalCents,
        currency: payment.currency || 'DKK',
        status,
        payment_method: paymentMethod,
        receipt_url: null, // TODO: Generate receipt URL
        related_invoice: {
          id: payment.id,
          invoice_number: `LP-${payment.id.slice(0, 8).toUpperCase()}`,
          type: 'leasing' as const,
          due_date: payment.due_date,
          amount_cents: payment.amount_cents,
          link_url: `/buyer/dashboard/leasing`,
        },
        related_item: {
          id: lease.id,
          type: 'leasing' as const,
          leasing_period: {
            start: lease.start_date,
            end: lease.end_date,
            monthly_price_cents: lease.monthly_price_cents,
          },
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
        },
        stripe_events: stripeEvents,
        error_info: errorInfo,
      }
    }
  )

  // Combine all payments
  let allPayments = [...orderPayments, ...leasingPayments]

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    allPayments = allPayments.filter((p) => p.status === filters.status)
  }

  if (filters.type && filters.type !== 'all') {
    allPayments = allPayments.filter((p) => p.type === filters.type)
  }

  if (filters.payment_method && filters.payment_method !== 'all') {
    allPayments = allPayments.filter(
      (p) => p.payment_method === filters.payment_method
    )
  }

  if (filters.dateFrom) {
    allPayments = allPayments.filter(
      (p) => new Date(p.date) >= new Date(filters.dateFrom!)
    )
  }

  if (filters.dateTo) {
    allPayments = allPayments.filter(
      (p) => new Date(p.date) <= new Date(filters.dateTo!)
    )
  }

  if (filters.priceMin !== undefined) {
    allPayments = allPayments.filter(
      (p) => p.total_cents >= filters.priceMin! * 100
    )
  }

  if (filters.priceMax !== undefined) {
    allPayments = allPayments.filter(
      (p) => p.total_cents <= filters.priceMax! * 100
    )
  }

  if (filters.galleryId && filters.galleryId !== 'all') {
    allPayments = allPayments.filter(
      (p) => p.related_item.gallery?.id === filters.galleryId
    )
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    allPayments = allPayments.filter(
      (p) =>
        p.payment_id.toLowerCase().includes(searchLower) ||
        p.related_item.artwork.title.toLowerCase().includes(searchLower) ||
        p.related_item.artwork.artist_name.toLowerCase().includes(searchLower) ||
        p.related_item.gallery?.name?.toLowerCase().includes(searchLower)
    )
  }

  // Apply sorting
  if (filters.sortBy === 'highest_amount') {
    allPayments.sort((a, b) => b.total_cents - a.total_cents)
  } else if (filters.sortBy === 'status') {
    const statusOrder = { failed: 0, rejected: 1, pending: 2, completed: 3 }
    allPayments.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
  } else {
    // Default: newest first
    allPayments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  return allPayments
}

/**
 * Get list of galleries that buyer has payments with
 */
export async function getBuyerPaymentGalleries(
  userId: string
): Promise<Array<{ id: string; name: string }>> {
  const supabase = await createClient()

  // Get galleries from orders
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
  orders?.forEach((order: any) => {
    const gallery = order.artworks?.galleries
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
