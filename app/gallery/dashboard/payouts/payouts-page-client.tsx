'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PayoutSummaryCards } from '@/components/gallery/dashboard/payout-summary-cards'
import { PayoutsFilters } from '@/components/gallery/dashboard/payouts-filters'
import { PayoutsTable } from '@/components/gallery/dashboard/payouts-table'
import { PayoutDetailsDrawer } from '@/components/gallery/dashboard/payout-details-drawer'
import {
  getGalleryPayouts,
  getPayoutStats,
  getPayoutDetails,
  getGalleryArtistsForPayoutFilter,
  PayoutFilters,
  PayoutStats,
  GalleryPayout,
  PayoutDetails,
} from '@/lib/supabase/gallery-payouts-queries'

interface PayoutsPageClientProps {
  galleryId: string
}

export function PayoutsPageClient({ galleryId }: PayoutsPageClientProps) {
  const [payouts, setPayouts] = useState<GalleryPayout[]>([])
  const [stats, setStats] = useState<PayoutStats>({
    totalPaidOut: 0,
    pendingPayouts: 0,
    totalCommission: 0,
    completedPayoutsCount: 0,
  })
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = useState<PayoutFilters>({})
  const [sortBy, setSortBy] = useState<'newest' | 'highest_payout' | 'status'>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const supabase = createClient()

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [payoutsData, statsData, artistsData] = await Promise.all([
        getGalleryPayouts(supabase, galleryId, filters, sortBy),
        getPayoutStats(supabase, galleryId),
        getGalleryArtistsForPayoutFilter(supabase, galleryId),
      ])

      setPayouts(payoutsData)
      setStats(statsData)
      setArtists(artistsData)
    } catch (error) {
      console.error('Error fetching payouts data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [galleryId, filters, sortBy])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFiltersChange = (newFilters: PayoutFilters) => {
    setFilters(newFilters)
  }

  const handleSortChange = (newSort: 'newest' | 'highest_payout' | 'status') => {
    setSortBy(newSort)
  }

  const handleViewDetails = (payoutId: string) => {
    setSelectedPayoutId(payoutId)
    setIsDrawerOpen(true)
  }

  const handleFetchPayoutDetails = async (payoutId: string): Promise<PayoutDetails | null> => {
    return await getPayoutDetails(supabase, payoutId)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <PayoutSummaryCards stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <PayoutsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        artists={artists}
      />

      {/* Table */}
      <PayoutsTable
        payouts={payouts}
        isLoading={isLoading}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onViewDetails={handleViewDetails}
      />

      {/* Details Drawer */}
      <PayoutDetailsDrawer
        payoutId={selectedPayoutId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onFetchDetails={handleFetchPayoutDetails}
      />
    </div>
  )
}
