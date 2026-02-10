'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, ArrowUpDown } from 'lucide-react'
import { GalleryPayout } from '@/lib/supabase/gallery-payouts-queries'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface PayoutsTableProps {
  payouts: GalleryPayout[]
  isLoading?: boolean
  sortBy: 'newest' | 'highest_payout' | 'status'
  onSortChange: (sort: 'newest' | 'highest_payout' | 'status') => void
  onViewDetails: (payoutId: string) => void
}

export function PayoutsTable({
  payouts,
  isLoading,
  sortBy,
  onSortChange,
  onViewDetails,
}: PayoutsTableProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: da })
    } catch {
      return '-'
    }
  }

  const getStatusBadge = (status: GalleryPayout['status']) => {
    const variants: Record<GalleryPayout['status'], { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      completed: { variant: 'default', label: 'Paid' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className={status === 'completed' ? 'bg-green-600' : ''}>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kunstværk</TableHead>
              <TableHead>Kunstner</TableHead>
              <TableHead>Køber</TableHead>
              <TableHead>Ordre ID</TableHead>
              <TableHead className="text-right">Udbetaling (80%)</TableHead>
              <TableHead className="text-right">Kommission (20%)</TableHead>
              <TableHead>Udbetalt dato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Ingen udbetalinger fundet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Der er ingen udbetalinger der matcher dine filtre. Prøv at justere dine søgekriterier.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Viser {payouts.length} udbetaling{payouts.length !== 1 ? 'er' : ''}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sorter efter:</span>
          <Select value={sortBy} onValueChange={(value: any) => onSortChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nyeste først</SelectItem>
              <SelectItem value="highest_payout">Højeste udbetaling</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kunstværk</TableHead>
              <TableHead>Kunstner</TableHead>
              <TableHead>Køber</TableHead>
              <TableHead>Ordre ID</TableHead>
              <TableHead className="text-right">Udbetaling (80%)</TableHead>
              <TableHead className="text-right">Kommission (20%)</TableHead>
              <TableHead>Udbetalt dato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {payout.artwork_image_url ? (
                        <Image
                          src={payout.artwork_image_url}
                          alt={payout.artwork_title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{payout.artwork_title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{payout.artist_name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{payout.buyer_name}</span>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {payout.order_id.slice(0, 8)}
                  </code>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payout.net_amount_cents)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(payout.commission_cents)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(payout.payout_date)}</span>
                </TableCell>
                <TableCell>{getStatusBadge(payout.status)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(payout.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
