'use client'

import { useState, useEffect } from 'react'
import { InvoicesSummaryCards } from '@/components/buyer/dashboard/invoices-summary-cards'
import { InvoicesFilters } from '@/components/buyer/dashboard/invoices-filters'
import { InvoicesTable } from '@/components/buyer/dashboard/invoices-table'
import { InvoiceDetailsDrawer } from '@/components/buyer/dashboard/invoice-details-drawer'
import {
  BuyerInvoicesStats,
  BuyerInvoiceDetail,
  BuyerInvoicesFilters,
} from '@/lib/supabase/buyer-invoices-queries'

interface InvoicesPageClientProps {
  initialStats: BuyerInvoicesStats;
  initialInvoices: BuyerInvoiceDetail[];
  initialGalleries: Array<{ id: string; name: string }>;
}

export function InvoicesPageClient({
  initialStats,
  initialInvoices,
  initialGalleries,
}: InvoicesPageClientProps) {
  const [stats] = useState<BuyerInvoicesStats>(initialStats)
  const [invoices, setInvoices] = useState<BuyerInvoiceDetail[]>(initialInvoices)
  const [galleries] = useState(initialGalleries)
  const [filters, setFilters] = useState<BuyerInvoicesFilters>({
    search: '',
    status: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: '',
    priceMin: undefined,
    priceMax: undefined,
    galleryId: 'all',
    sortBy: 'newest',
  })
  const [selectedInvoice, setSelectedInvoice] = useState<BuyerInvoiceDetail | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter invoices client-side
  useEffect(() => {
    setIsLoading(true)
    
    let filtered = [...initialInvoices]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(searchLower) ||
          inv.related_item.artwork.title.toLowerCase().includes(searchLower) ||
          inv.related_item.artwork.artist_name.toLowerCase().includes(searchLower) ||
          inv.related_item.gallery?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filters.status)
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((inv) => inv.invoice_type === filters.type)
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((inv) => new Date(inv.date) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filtered = filtered.filter((inv) => new Date(inv.date) <= toDate)
    }

    // Apply price filters
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((inv) => inv.total_cents >= filters.priceMin! * 100)
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((inv) => inv.total_cents <= filters.priceMax! * 100)
    }

    // Apply gallery filter
    if (filters.galleryId && filters.galleryId !== 'all') {
      filtered = filtered.filter((inv) => inv.related_item.gallery?.id === filters.galleryId)
    }

    // Apply sorting
    if (filters.sortBy === 'highest_amount') {
      filtered.sort((a, b) => b.total_cents - a.total_cents)
    } else if (filters.sortBy === 'status') {
      const statusOrder = { overdue: 0, unpaid: 1, paid: 2 }
      filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    } else {
      // Default: newest first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    setInvoices(filtered)
    setIsLoading(false)
  }, [filters, initialInvoices])

  const handleViewDetails = (invoice: BuyerInvoiceDetail) => {
    setSelectedInvoice(invoice)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InvoicesSummaryCards stats={stats} />

      {/* Filters */}
      <InvoicesFilters
        filters={filters}
        onFiltersChange={setFilters}
        galleries={galleries}
      />

      {/* Invoices Table */}
      <InvoicesTable
        invoices={invoices}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Invoice Details Drawer */}
      <InvoiceDetailsDrawer
        invoice={selectedInvoice}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
