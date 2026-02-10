// ============================================================================
// BUYER INVOICES TYPES
// ============================================================================

export interface BuyerInvoicesStats {
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
}

export interface BuyerInvoiceDetail {
  id: string
  invoice_number: string
  invoice_type: 'order' | 'leasing'
  date: string
  due_date: string
  amount_cents: number
  vat_cents: number
  total_cents: number
  currency: string
  status: 'paid' | 'overdue' | 'unpaid'
  payment_method: string | null
  pdf_url: string | null
  
  // Related order or lease
  related_item: {
    id: string
    type: 'order' | 'leasing'
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
    order_date?: string
    leasing_period?: {
      start: string
      end: string
      monthly_price_cents: number
    }
  }
  
  // Payment history
  payment_history: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}

export interface BuyerInvoicesFilters {
  search?: string
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  galleryId?: string
  sortBy?: 'newest' | 'highest_amount' | 'status'
}
