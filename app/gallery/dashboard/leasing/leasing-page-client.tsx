'use client'

import { useState, useEffect, useMemo } from 'react'
import { LeasingSummaryCards } from '@/components/gallery/dashboard/leasing-summary-cards'
import { LeasingFilters } from '@/components/gallery/dashboard/leasing-filters'
import { LeasingTable } from '@/components/gallery/dashboard/leasing-table'
import { LeasingDetailsDrawer } from '@/components/gallery/dashboard/leasing-details-drawer'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  Download,
  FileText,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LeasingPageClientProps {
  initialLeases: any[]
  galleryId: string
  artists: Array<{ id: string; name: string }>
}

export function LeasingPageClient({
  initialLeases,
  galleryId,
  artists,
}: LeasingPageClientProps) {
  const { toast } = useToast()
  const [leases, setLeases] = useState(initialLeases)
  const [filteredLeases, setFilteredLeases] = useState(initialLeases)
  const [selectedLease, setSelectedLease] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filters, setFilters] = useState<any>({})

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...leases]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (lease) =>
          lease.artwork?.title?.toLowerCase().includes(searchLower) ||
          lease.artwork?.artist?.name?.toLowerCase().includes(searchLower) ||
          lease.buyer?.full_name?.toLowerCase().includes(searchLower) ||
          lease.buyer?.email?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status) {
      const now = new Date()
      filtered = filtered.filter((lease) => {
        const endDate = new Date(lease.end_date)
        const daysUntilEnd = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        switch (filters.status) {
          case 'active':
            return lease.status === 'active' && daysUntilEnd > 30
          case 'expiring_soon':
            return lease.status === 'active' && daysUntilEnd <= 30 && daysUntilEnd > 0
          case 'overdue':
            return lease.status === 'active' && endDate < now
          case 'completed':
            return lease.status === 'completed'
          case 'cancelled':
            return lease.status === 'cancelled'
          default:
            return true
        }
      })
    }

    // Insurance status filter
    if (filters.insurance_status) {
      const now = new Date()
      filtered = filtered.filter((lease) => {
        if (!lease.insurance_policy_number) {
          return filters.insurance_status === 'missing'
        }

        if (!lease.insurance_expiry_date) {
          return filters.insurance_status === 'missing'
        }

        const expiryDate = new Date(lease.insurance_expiry_date)
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        switch (filters.insurance_status) {
          case 'valid':
            return daysUntilExpiry > 30
          case 'expiring_soon':
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0
          case 'expired':
            return expiryDate < now
          default:
            return true
        }
      })
    }

    // Insurance holder filter
    if (filters.insurance_holder) {
      if (filters.insurance_holder === 'missing') {
        filtered = filtered.filter((lease) => !lease.insurance_holder)
      } else {
        filtered = filtered.filter(
          (lease) => lease.insurance_holder === filters.insurance_holder
        )
      }
    }

    // Artist filter
    if (filters.artist_id) {
      filtered = filtered.filter(
        (lease) => lease.artwork?.artist?.id === filters.artist_id
      )
    }

    // Date filters
    if (filters.start_date) {
      const startDate = new Date(filters.start_date)
      filtered = filtered.filter(
        (lease) => new Date(lease.start_date) >= startDate
      )
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date)
      filtered = filtered.filter((lease) => new Date(lease.end_date) <= endDate)
    }

    // Price filters
    if (filters.min_price) {
      const minPrice = parseFloat(filters.min_price)
      filtered = filtered.filter((lease) => lease.monthly_price >= minPrice)
    }

    if (filters.max_price) {
      const maxPrice = parseFloat(filters.max_price)
      filtered = filtered.filter((lease) => lease.monthly_price <= maxPrice)
    }

    setFilteredLeases(filtered)
  }, [filters, leases])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const now = new Date()
    const activeLeases = leases.filter((l) => l.status === 'active').length
    const expiringSoon = leases.filter((l) => {
      if (l.status !== 'active') return false
      const endDate = new Date(l.end_date)
      const daysUntilEnd = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysUntilEnd <= 60 && daysUntilEnd > 0
    }).length

    const insuranceOk = leases.filter((l) => {
      if (!l.insurance_policy_number) return false
      if (!l.insurance_expiry_date) return false
      const expiryDate = new Date(l.insurance_expiry_date)
      return expiryDate > now
    }).length

    const insuranceMissing = leases.length - insuranceOk

    const monthlyRevenue = leases
      .filter((l) => l.status === 'active')
      .reduce((sum, l) => sum + l.monthly_price, 0)

    return {
      active_leases: activeLeases,
      expiring_soon: expiringSoon,
      insurance_ok: insuranceOk,
      insurance_missing: insuranceMissing,
      total_monthly_revenue: monthlyRevenue * 100, // Convert to cents
    }
  }, [leases])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // In a real implementation, this would fetch fresh data from the API
      // For now, we'll just simulate a refresh
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Data opdateret',
        description: 'Leasingdata er blevet opdateret.',
      })
    } catch (error) {
      toast({
        title: 'Fejl',
        description: 'Kunne ikke opdatere data. Prøv igen.',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewDetails = (lease: any) => {
    setSelectedLease(lease)
    setIsDrawerOpen(true)
  }

  const handleGenerateInvoice = async (leaseId: string) => {
    try {
      toast({
        title: 'Genererer faktura',
        description: 'Fakturaen bliver genereret...',
      })
      // In a real implementation, this would call an API to generate the invoice
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: 'Faktura genereret',
        description: 'Fakturaen er klar til download.',
      })
    } catch (error) {
      toast({
        title: 'Fejl',
        description: 'Kunne ikke generere faktura. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateInsurance = async (leaseId: string) => {
    try {
      toast({
        title: 'Opdaterer forsikring',
        description: 'Forsikringsoplysninger opdateres...',
      })
      // In a real implementation, this would open a dialog to update insurance
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Forsikring opdateret',
        description: 'Forsikringsoplysninger er blevet opdateret.',
      })
    } catch (error) {
      toast({
        title: 'Fejl',
        description: 'Kunne ikke opdatere forsikring. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  const handleExtendLease = async (leaseId: string) => {
    try {
      toast({
        title: 'Forlænger leasing',
        description: 'Leasingaftalen forlænges...',
      })
      // In a real implementation, this would open a dialog to extend the lease
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Leasing forlænget',
        description: 'Leasingaftalen er blevet forlænget.',
      })
    } catch (error) {
      toast({
        title: 'Fejl',
        description: 'Kunne ikke forlænge leasing. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelLease = async (leaseId: string) => {
    try {
      toast({
        title: 'Annullerer leasing',
        description: 'Leasingaftalen annulleres...',
      })
      // In a real implementation, this would call an API to cancel the lease
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: 'Leasing annulleret',
        description: 'Leasingaftalen er blevet annulleret.',
      })
    } catch (error) {
      toast({
        title: 'Fejl',
        description: 'Kunne ikke annullere leasing. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  const handleExportData = () => {
    toast({
      title: 'Eksporterer data',
      description: 'Leasingdata eksporteres til CSV...',
    })
    // In a real implementation, this would export the data to CSV
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leasing</h1>
          <p className="text-muted-foreground">
            Administrer kunstværk leasingaftaler
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Opdater
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Eksporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <LeasingSummaryCards summary={summaryStats} />

      {/* Alerts for issues */}
      {summaryStats.insurance_missing > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {summaryStats.insurance_missing} leasingaftale
            {summaryStats.insurance_missing > 1 ? 'r' : ''} har forsikringsproblemer
            der kræver opmærksomhed.
          </AlertDescription>
        </Alert>
      )}

      {summaryStats.expiring_soon > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {summaryStats.expiring_soon} leasingaftale
            {summaryStats.expiring_soon > 1 ? 'r' : ''} udløber inden for 60 dage.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <LeasingFilters onFilterChange={setFilters} artists={artists} />

      {/* Table */}
      <LeasingTable
        leases={filteredLeases}
        onViewDetails={handleViewDetails}
        onGenerateInvoice={handleGenerateInvoice}
        onUpdateInsurance={handleUpdateInsurance}
        onExtendLease={handleExtendLease}
        onCancelLease={handleCancelLease}
      />

      {/* Details Drawer */}
      <LeasingDetailsDrawer
        lease={selectedLease}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onGenerateInvoice={handleGenerateInvoice}
        onUpdateInsurance={handleUpdateInsurance}
        onExtendLease={handleExtendLease}
        onCancelLease={handleCancelLease}
      />
    </div>
  )
}
