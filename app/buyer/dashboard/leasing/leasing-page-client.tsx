'use client'

import { useState, useEffect } from 'react'
import { LeasingSummaryCards } from '@/components/buyer/dashboard/leasing-summary-cards'
import { LeasingFilters } from '@/components/buyer/dashboard/leasing-filters'
import { LeasingTable } from '@/components/buyer/dashboard/leasing-table'
import { LeasingDetailsDrawer } from '@/components/buyer/dashboard/leasing-details-drawer'
import type {
  BuyerLeasingStats,
  BuyerLeaseDetail,
  BuyerLeasingFilters,
} from '@/lib/supabase/buyer-leasing-queries'

interface LeasingPageClientProps {
  initialStats: BuyerLeasingStats
  initialLeases: BuyerLeaseDetail[]
  galleries: Array<{ id: string; name: string }>
}

export function LeasingPageClient({
  initialStats,
  initialLeases,
  galleries,
}: LeasingPageClientProps) {
  const [stats] = useState<BuyerLeasingStats>(initialStats)
  const [allLeases] = useState<BuyerLeaseDetail[]>(initialLeases)
  const [filteredLeases, setFilteredLeases] = useState<BuyerLeaseDetail[]>(initialLeases)
  const [selectedLease, setSelectedLease] = useState<BuyerLeaseDetail | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<BuyerLeasingFilters>({
    search: '',
    status: 'all',
    insuranceStatus: 'all',
    sortBy: 'newest',
  })

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...allLeases]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (lease) =>
          lease.artwork.title.toLowerCase().includes(searchLower) ||
          lease.artwork.artist_name.toLowerCase().includes(searchLower) ||
          lease.gallery.name.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((lease) => lease.status === filters.status)
    }

    // Apply insurance status filter
    if (filters.insuranceStatus && filters.insuranceStatus !== 'all') {
      filtered = filtered.filter(
        (lease) => lease.insurance_status === filters.insuranceStatus
      )
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(
        (lease) => new Date(lease.start_date) >= fromDate
      )
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(
        (lease) => new Date(lease.end_date) <= toDate
      )
    }

    // Apply price filters
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(
        (lease) => lease.monthly_price_cents >= filters.priceMin! * 100
      )
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(
        (lease) => lease.monthly_price_cents <= filters.priceMax! * 100
      )
    }

    // Apply gallery filter
    if (filters.galleryId && filters.galleryId !== 'all') {
      filtered = filtered.filter(
        (lease) => lease.gallery.id === filters.galleryId
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'highest_price':
        filtered.sort((a, b) => b.monthly_price_cents - a.monthly_price_cents)
        break
      case 'status':
        filtered.sort((a, b) => a.status.localeCompare(b.status))
        break
      case 'newest':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )
        break
    }

    setFilteredLeases(filtered)
  }, [filters, allLeases])

  const handleViewDetails = (lease: BuyerLeaseDetail) => {
    setSelectedLease(lease)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <LeasingSummaryCards stats={stats} />

      {/* Filters */}
      <LeasingFilters
        filters={filters}
        onFiltersChange={setFilters}
        galleries={galleries}
      />

      {/* Leasing Table */}
      <LeasingTable leases={filteredLeases} onViewDetails={handleViewDetails} />

      {/* Lease Details Drawer */}
      <LeasingDetailsDrawer
        lease={selectedLease}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
