'use client'

import { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import type { BuyerLeaseDetail } from '@/lib/supabase/buyer-leasing-queries'

interface LeasingTableProps {
  leases: BuyerLeaseDetail[]
  onViewDetails: (lease: BuyerLeaseDetail) => void
}

export function LeasingTable({ leases, onViewDetails }: LeasingTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      active: { variant: 'default', label: 'Aktiv' },
      expiring_soon: { variant: 'secondary', label: 'Udløber snart' },
      overdue: { variant: 'destructive', label: 'Forsinket' },
      completed: { variant: 'outline', label: 'Afsluttet' },
      cancelled: { variant: 'outline', label: 'Annulleret' },
    }

    const config = variants[status] || { variant: 'outline' as const, label: status }
    return (
      <Badge variant={config.variant} className="whitespace-nowrap">
        {config.label}
      </Badge>
    )
  }

  const getInsuranceBadge = (status: string) => {
    const config: Record<
      string,
      { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      valid: {
        icon: <CheckCircle className="h-3 w-3" />,
        variant: 'default',
        label: 'Gyldig',
      },
      expiring_soon: {
        icon: <Clock className="h-3 w-3" />,
        variant: 'secondary',
        label: 'Udløber snart',
      },
      expired: {
        icon: <AlertCircle className="h-3 w-3" />,
        variant: 'destructive',
        label: 'Udløbet',
      },
      missing: {
        icon: <AlertCircle className="h-3 w-3" />,
        variant: 'destructive',
        label: 'Mangler',
      },
    }

    const item = config[status] || config.missing
    return (
      <Badge variant={item.variant} className="flex items-center gap-1 whitespace-nowrap">
        {item.icon}
        {item.label}
      </Badge>
    )
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (leases.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">Ingen leasingaftaler fundet</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kunstværk</TableHead>
            <TableHead>Galleri</TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort('monthly_price')}
            >
              Månedlig pris
            </TableHead>
            <TableHead
              className="cursor-pointer hover:text-foreground"
              onClick={() => handleSort('end_date')}
            >
              Slutdato
            </TableHead>
            <TableHead>Dage tilbage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Forsikring</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leases.map((lease) => (
            <TableRow key={lease.id}>
              {/* Artwork */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage
                      src={lease.artwork.image_url || undefined}
                      alt={lease.artwork.title}
                    />
                    <AvatarFallback className="rounded-md">
                      {lease.artwork.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lease.artwork.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {lease.artwork.artist_name}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Gallery */}
              <TableCell>
                <div className="min-w-0">
                  <p className="truncate font-medium">{lease.gallery.name}</p>
                  {lease.gallery.city && (
                    <p className="truncate text-sm text-muted-foreground">
                      {lease.gallery.city}
                    </p>
                  )}
                </div>
              </TableCell>

              {/* Monthly Price */}
              <TableCell>
                <span className="font-medium">
                  {formatCurrency(lease.monthly_price_cents)}
                </span>
              </TableCell>

              {/* End Date */}
              <TableCell>
                <span className="text-sm">{formatDate(lease.end_date)}</span>
              </TableCell>

              {/* Days Remaining */}
              <TableCell>
                <span
                  className={`text-sm font-medium ${
                    lease.days_remaining <= 30
                      ? 'text-destructive'
                      : lease.days_remaining <= 60
                        ? 'text-yellow-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {lease.days_remaining} dage
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>{getStatusBadge(lease.status)}</TableCell>

              {/* Insurance */}
              <TableCell>{getInsuranceBadge(lease.insurance_status)}</TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(lease)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Detaljer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
