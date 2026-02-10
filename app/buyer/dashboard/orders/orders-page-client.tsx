'use client'

import { useState, useEffect } from 'react'
import { OrdersSummaryCards } from '@/components/buyer/dashboard/orders-summary-cards'
import { OrdersFilters } from '@/components/buyer/dashboard/orders-filters'
import { OrdersTable } from '@/components/buyer/dashboard/orders-table'
import { OrderDetailsDrawer } from '@/components/buyer/dashboard/order-details-drawer'
import type {
  BuyerOrdersStats,
  BuyerOrderDetail,
  BuyerOrdersFilters,
} from '@/lib/supabase/buyer-orders-queries'

interface OrdersPageClientProps {
  initialStats: BuyerOrdersStats
  initialOrders: BuyerOrderDetail[]
  galleries: Array<{ id: string; name: string }>
}

export function OrdersPageClient({
  initialStats,
  initialOrders,
  galleries,
}: OrdersPageClientProps) {
  const [stats] = useState<BuyerOrdersStats>(initialStats)
  const [allOrders] = useState<BuyerOrderDetail[]>(initialOrders)
  const [filteredOrders, setFilteredOrders] = useState<BuyerOrderDetail[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrderDetail | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<BuyerOrdersFilters>({
    search: '',
    status: 'all',
    sortBy: 'newest',
  })

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...allOrders]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.artwork.title.toLowerCase().includes(searchLower) ||
          order.artwork.artist_name.toLowerCase().includes(searchLower) ||
          order.gallery?.name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((order) => order.status === filters.status)
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(
        (order) => new Date(order.order_date) >= fromDate
      )
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(
        (order) => new Date(order.order_date) <= toDate
      )
    }

    // Apply price filters
    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(
        (order) => order.amount_cents >= filters.priceMin! * 100
      )
    }
    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(
        (order) => order.amount_cents <= filters.priceMax! * 100
      )
    }

    // Apply gallery filter
    if (filters.galleryId && filters.galleryId !== 'all') {
      filtered = filtered.filter(
        (order) => order.gallery?.id === filters.galleryId
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'highest_amount':
        filtered.sort((a, b) => b.amount_cents - a.amount_cents)
        break
      case 'status':
        filtered.sort((a, b) => a.status.localeCompare(b.status))
        break
      case 'newest':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        )
        break
    }

    setFilteredOrders(filtered)
  }, [filters, allOrders])

  const handleViewDetails = (order: BuyerOrderDetail) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <OrdersSummaryCards stats={stats} />

      {/* Filters */}
      <OrdersFilters
        filters={filters}
        onFiltersChange={setFilters}
        galleries={galleries}
      />

      {/* Orders Table */}
      <OrdersTable orders={filteredOrders} onViewDetails={handleViewDetails} />

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
