'use client'

import { useState, useEffect } from 'react'
import { InsuranceSummaryCards } from '@/components/buyer/dashboard/insurance-summary-cards'
import { InsuranceFilters } from '@/components/buyer/dashboard/insurance-filters'
import { InsuranceTable } from '@/components/buyer/dashboard/insurance-table'
import { InsuranceDetailsDrawer } from '@/components/buyer/dashboard/insurance-details-drawer'
import type {
  BuyerInsuranceStats,
  BuyerInsuranceFilters,
} from '@/lib/supabase/buyer-insurance-types'
import type { BuyerLeaseDetail } from '@/lib/supabase/buyer-leasing-queries'

interface InsurancePageClientProps {
  initialStats: BuyerInsuranceStats
  initialRecords: BuyerLeaseDetail[]
  galleries: Array<{ id: string; name: string }>
}

export function InsurancePageClient({
  initialStats,
  initialRecords,
  galleries,
}: InsurancePageClientProps) {
  const [stats] = useState<BuyerInsuranceStats>(initialStats)
  const [records, setRecords] = useState<BuyerLeaseDetail[]>(initialRecords)
  const [filteredRecords, setFilteredRecords] =
    useState<BuyerLeaseDetail[]>(initialRecords)
  const [filters, setFilters] = useState<BuyerInsuranceFilters>({
    search: '',
    status: 'all',
    insuranceHolder: 'all',
    galleryId: 'all',
    sortBy: 'newest',
  })
  const [selectedRecord, setSelectedRecord] = useState<BuyerLeaseDetail | null>(
    null
  )
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Apply filters whenever filters or records change
  useEffect(() => {
    let filtered = [...records]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.artwork.title.toLowerCase().includes(searchLower) ||
          record.artwork.artist_name.toLowerCase().includes(searchLower) ||
          record.gallery.name.toLowerCase().includes(searchLower) ||
          record.insurance_company?.toLowerCase().includes(searchLower) ||
          record.insurance_policy_number?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(
        (record) => record.insurance_status === filters.status
      )
    }

    // Apply insurance holder filter
    if (filters.insuranceHolder && filters.insuranceHolder !== 'all') {
      filtered = filtered.filter(
        (record) => record.insurance_holder === filters.insuranceHolder
      )
    }

    // Apply gallery filter
    if (filters.galleryId && filters.galleryId !== 'all') {
      filtered = filtered.filter(
        (record) => record.gallery.id === filters.galleryId
      )
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (record) =>
          record.insurance_coverage_start &&
          record.insurance_coverage_start >= filters.dateFrom!
      )
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (record) =>
          record.insurance_coverage_end &&
          record.insurance_coverage_end <= filters.dateTo!
      )
    }

    // Apply price filters
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(
        (record) => record.monthly_price_cents >= filters.priceMin! * 100
      )
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(
        (record) => record.monthly_price_cents <= filters.priceMax! * 100
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'expiring_soon':
        filtered.sort((a, b) => {
          const aEnd = a.insurance_coverage_end || ''
          const bEnd = b.insurance_coverage_end || ''
          return aEnd.localeCompare(bEnd)
        })
        break
      case 'status':
        filtered.sort((a, b) =>
          a.insurance_status.localeCompare(b.insurance_status)
        )
        break
      case 'newest':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )
        break
    }

    setFilteredRecords(filtered)
  }, [filters, records])

  const handleViewDetails = (record: BuyerLeaseDetail) => {
    setSelectedRecord(record)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <InsuranceSummaryCards stats={stats} />

      {/* Filters */}
      <InsuranceFilters
        filters={filters}
        onFiltersChange={setFilters}
        galleries={galleries}
      />

      {/* Table */}
      <InsuranceTable
        records={filteredRecords}
        onViewDetails={handleViewDetails}
      />

      {/* Details Drawer */}
      <InsuranceDetailsDrawer
        record={selectedRecord}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
