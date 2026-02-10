'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { OrdersTable } from '@/components/gallery/dashboard/orders-table'
import { OrdersFilters } from '@/components/gallery/dashboard/orders-filters'
import { OrderDetailsDrawer } from '@/components/gallery/dashboard/order-details-drawer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, TrendingUp, DollarSign, Package, Clock } from 'lucide-react'
import {
  getGalleryOrders,
  getOrderStats,
  getGalleryArtistsForFilter,
  markOrderAsShipped,
  type GalleryOrder,
  type OrderFilters,
  type OrderStats,
} from '@/lib/supabase/gallery-orders-queries'
import { useToast } from '@/hooks/use-toast'

interface OrdersPageClientProps {
  galleryId: string
}

export function OrdersPageClient({ galleryId }: OrdersPageClientProps) {
  const [orders, setOrders] = useState<GalleryOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([])
  const [filters, setFilters] = useState<OrderFilters>({})
  const [sortBy, setSortBy] = useState<'newest' | 'highest_price' | 'status'>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [galleryId, filters, sortBy])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Load orders, stats, and artists in parallel
      const [ordersData, statsData, artistsData] = await Promise.all([
        getGalleryOrders(supabase, galleryId, filters, sortBy),
        getOrderStats(supabase, galleryId),
        getGalleryArtistsForFilter(supabase, galleryId),
      ])

      setOrders(ordersData)
      setStats(statsData)
      setArtists(artistsData)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Kunne ikke indlæse ordrer. Prøv igen senere.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsDrawerOpen(true)
  }

  const handleMarkAsShipped = async (orderId: string) => {
    try {
      const supabase = createClient()
      const result = await markOrderAsShipped(supabase, orderId)

      if (result.success) {
        toast({
          title: 'Ordre opdateret',
          description: 'Ordren er markeret som afsendt.',
        })
        // Reload orders
        loadData()
      } else {
        toast({
          title: 'Fejl',
          description: result.error || 'Kunne ikke opdatere ordren.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error marking order as shipped:', err)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke opdatere ordren.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total ordrer</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} afventer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total omsætning</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalRevenue / 100).toLocaleString('da-DK')} kr
              </div>
              <p className="text-xs text-muted-foreground">
                Gennemsnit: {(stats.averageOrderValue / 100).toLocaleString('da-DK')} kr
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kommission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalCommission / 100).toLocaleString('da-DK')} kr
              </div>
              <p className="text-xs text-muted-foreground">20% af omsætning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Udbetaling</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(stats.totalPayout / 100).toLocaleString('da-DK')} kr
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedOrders} gennemført
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Ordrer</CardTitle>
          <CardDescription>
            Administrer og følg op på alle ordrer fra dine kunstnere
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            artists={artists}
          />
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading && !stats ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <OrdersTable
              orders={orders}
              isLoading={isLoading}
              onViewOrder={handleViewOrder}
              onMarkAsShipped={handleMarkAsShipped}
            />
          )}
        </CardContent>
      </Card>

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        orderId={selectedOrderId}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  )
}
