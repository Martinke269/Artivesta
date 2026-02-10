'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { da } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  Shield,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeasingTableProps {
  leases: any[]
  onViewDetails: (lease: any) => void
  onGenerateInvoice?: (leaseId: string) => void
  onUpdateInsurance?: (leaseId: string) => void
  onExtendLease?: (leaseId: string) => void
  onCancelLease?: (leaseId: string) => void
}

export function LeasingTable({
  leases,
  onViewDetails,
  onGenerateInvoice,
  onUpdateInsurance,
  onExtendLease,
  onCancelLease,
}: LeasingTableProps) {
  const [sortField, setSortField] = useState<string>('start_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedLeases = [...leases].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle nested fields
    if (sortField === 'artwork_title') {
      aValue = a.artwork?.title || ''
      bValue = b.artwork?.title || ''
    } else if (sortField === 'artist_name') {
      aValue = a.artwork?.artist?.name || ''
      bValue = b.artwork?.artist?.name || ''
    } else if (sortField === 'buyer_name') {
      aValue = a.buyer?.full_name || a.buyer?.email || ''
      bValue = b.buyer?.full_name || b.buyer?.email || ''
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getStatusBadge = (lease: any) => {
    const now = new Date()
    const endDate = new Date(lease.end_date)
    const daysUntilEnd = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (lease.status === 'cancelled') {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          Annulleret
        </Badge>
      )
    }

    if (lease.status === 'completed') {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Afsluttet
        </Badge>
      )
    }

    if (endDate < now) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Forsinket
        </Badge>
      )
    }

    if (daysUntilEnd <= 30) {
      return (
        <Badge variant="outline" className="gap-1 border-orange-500 bg-orange-50 text-orange-700">
          <Clock className="h-3 w-3" />
          Udløber snart
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="gap-1 border-green-500 bg-green-50 text-green-700">
        <CheckCircle className="h-3 w-3" />
        Aktiv
      </Badge>
    )
  }

  const getInsuranceBadge = (lease: any) => {
    if (!lease.insurance_policy_number) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Mangler
        </Badge>
      )
    }

    if (!lease.insurance_expiry_date) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          Ukendt udløb
        </Badge>
      )
    }

    const now = new Date()
    const expiryDate = new Date(lease.insurance_expiry_date)
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (expiryDate < now) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Udløbet
        </Badge>
      )
    }

    if (daysUntilExpiry <= 30) {
      return (
        <Badge variant="outline" className="gap-1 border-orange-500 bg-orange-50 text-orange-700">
          <Clock className="h-3 w-3" />
          Udløber snart
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="gap-1 border-green-500 bg-green-50 text-green-700">
        <Shield className="h-3 w-3" />
        Gyldig
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const getInsuranceHolder = (holder: string) => {
    const holders: Record<string, string> = {
      gallery: 'Galleri',
      buyer: 'Køber',
      external: 'Ekstern',
    }
    return holders[holder] || holder
  }

  if (leases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Ingen leasingaftaler</h3>
        <p className="text-sm text-muted-foreground">
          Der er ingen leasingaftaler der matcher dine filtre.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('artwork_title')}
            >
              <div className="flex items-center gap-2">
                Kunstværk
                {sortField === 'artwork_title' && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('artist_name')}
            >
              <div className="flex items-center gap-2">
                Kunstner
                {sortField === 'artist_name' && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('buyer_name')}
            >
              <div className="flex items-center gap-2">
                Lejer
                {sortField === 'buyer_name' && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('start_date')}
            >
              <div className="flex items-center gap-2">
                Periode
                {sortField === 'start_date' && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('monthly_price')}
            >
              <div className="flex items-center gap-2">
                Månedlig pris
                {sortField === 'monthly_price' && (
                  <span className="text-xs">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Forsikring</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeases.map((lease) => (
            <TableRow key={lease.id} className="group">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {lease.artwork?.title || 'Ukendt'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ID: {lease.artwork?.id?.slice(0, 8)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {lease.artwork?.artist?.name || 'Ukendt'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {lease.buyer?.full_name || 'Ukendt'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lease.buyer?.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {formatDate(lease.start_date)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    til {formatDate(lease.end_date)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({lease.duration_months} mdr.)
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {formatCurrency(lease.monthly_price)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Total: {formatCurrency(lease.total_price)}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(lease)}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getInsuranceBadge(lease)}
                  {lease.insurance_holder && (
                    <span className="text-xs text-muted-foreground">
                      {getInsuranceHolder(lease.insurance_holder)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Åbn menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewDetails(lease)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Se detaljer
                    </DropdownMenuItem>
                    {onGenerateInvoice && (
                      <DropdownMenuItem
                        onClick={() => onGenerateInvoice(lease.id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Generer faktura
                      </DropdownMenuItem>
                    )}
                    {onUpdateInsurance && (
                      <DropdownMenuItem
                        onClick={() => onUpdateInsurance(lease.id)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Opdater forsikring
                      </DropdownMenuItem>
                    )}
                    {onExtendLease &&
                      lease.status === 'active' &&
                      new Date(lease.end_date) > new Date() && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onExtendLease(lease.id)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Forlæng leasing
                          </DropdownMenuItem>
                        </>
                      )}
                    {onCancelLease &&
                      lease.status === 'active' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onCancelLease(lease.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuller leasing
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
