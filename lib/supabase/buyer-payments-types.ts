// ============================================================================
// BUYER PAYMENTS TYPES
// ============================================================================

export interface BuyerPaymentsStats {
  totalPayments: number
  successfulPayments: number
  failedPayments: number
}

export interface BuyerPaymentDetail {
  id: string
  payment_id: string
  type: 'order' | 'leasing' | 'invoice'
  date: string
  amount_cents: number
  vat_cents: number
  total_cents: number
  currency: string
  status: 'completed' | 'rejected' | 'failed' | 'pending'
  payment_method: 'card' | 'invoice' | 'bank_transfer' | null
  receipt_url: string | null
  
  // Related invoice
  related_invoice: {
    id: string
    invoice_number: string
    type: 'order' | 'leasing'
    due_date: string
    amount_cents: number
    link_url: string | null
  } | null
  
  // Related item (order or lease)
  related_item: {
    id: string
    type: 'order' | 'leasing'
    order_date?: string
    leasing_period?: {
      start: string
      end: string
      monthly_price_cents: number
    }
    artwork: {
      id: string
      title: string
      artist_name: string
      image_url: string | null
    }
    gallery: {
      id: string | null
      name: string | null
      email: string | null
      phone: string | null
    } | null
  }
  
  // Stripe events
  stripe_events: Array<{
    status: string
    timestamp: string
    note?: string
    metadata?: Record<string, any>
  }>
  
  // Error information (if applicable)
  error_info: {
    rejection_reason: string | null
    error_code: string | null
    suggested_solution: string | null
  } | null
}

export interface BuyerPaymentsFilters {
  search?: string
  status?: string
  type?: string
  payment_method?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  galleryId?: string
  sortBy?: 'newest' | 'highest_amount' | 'status'
}
