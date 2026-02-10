'use client'

import { useState, useEffect } from 'react'
import { PaymentsSummaryCards } from '@/components/buyer/dashboard/payments-summary-cards'
import { PaymentsFilters } from '@/components/buyer/dashboard/payments-filters'
import { PaymentsTable } from '@/components/buyer/dashboard/payments-table'
import { PaymentDetailsDrawer } from '@/components/buyer/dashboard/payment-details-drawer'
import {
  BuyerPaymentsStats,
  BuyerPaymentDetail,
  BuyerPaymentsFilters,
} from '@/lib/supabase/buyer-payments-queries'

interface PaymentsPageClientProps {
  userId: string;
  initialStats: BuyerPaymentsStats;
  initialPayments: BuyerPaymentDetail[];
  initialGalleries: Array<{ id: string; name: string }>;
}

export function PaymentsPageClient({
  userId,
  initialStats,
  initialPayments,
  initialGalleries,
}: PaymentsPageClientProps) {
  const [stats] = useState<BuyerPaymentsStats>(initialStats)
  const [payments, setPayments] = useState<BuyerPaymentDetail[]>(initialPayments)
  const [galleries] = useState(initialGalleries)
  const [filters, setFilters] = useState<BuyerPaymentsFilters>({
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
  const [selectedPayment, setSelectedPayment] = useState<BuyerPaymentDetail | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter payments client-side
  useEffect(() => {
    setIsLoading(true)
    
    let filtered = [...initialPayments]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (payment) =>
          payment.payment_id.toLowerCase().includes(searchLower) ||
          payment.related_item.artwork.title.toLowerCase().includes(searchLower) ||
          payment.related_item.artwork.artist_name.toLowerCase().includes(searchLower) ||
          payment.related_item.gallery?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((payment) => payment.status === filters.status)
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((payment) => payment.type === filters.type)
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((payment) => new Date(payment.date) >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filtered = filtered.filter((payment) => new Date(payment.date) <= toDate)
    }

    // Apply price filters
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter((payment) => payment.total_cents >= filters.priceMin! * 100)
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter((payment) => payment.total_cents <= filters.priceMax! * 100)
    }

    // Apply gallery filter
    if (filters.galleryId && filters.galleryId !== 'all') {
      filtered = filtered.filter((payment) => payment.related_item.gallery?.id === filters.galleryId)
    }

    // Apply sorting
    if (filters.sortBy === 'highest_amount') {
      filtered.sort((a, b) => b.total_cents - a.total_cents)
    } else if (filters.sortBy === 'status') {
      const statusOrder = { failed: 0, rejected: 1, pending: 2, completed: 3 }
      filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    } else {
      // Default: newest first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    setPayments(filtered)
    setIsLoading(false)
  }, [filters, initialPayments])

  const handleViewDetails = (payment: BuyerPaymentDetail) => {
    setSelectedPayment(payment)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <PaymentsSummaryCards stats={stats} />

      {/* Filters */}
      <PaymentsFilters
        filters={filters}
        onFiltersChange={setFilters}
        galleries={galleries}
      />

      {/* Payments Table */}
      <PaymentsTable
        payments={payments}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Payment Details Drawer */}
      <PaymentDetailsDrawer
        payment={selectedPayment}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
