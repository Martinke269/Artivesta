'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import type { BuyerOrderDetail } from '@/lib/supabase/buyer-orders-queries'

interface OrdersTableProps {
  orders: BuyerOrderDetail[]
  onViewDetails: (order: BuyerOrderDetail) => void
  isLoading?: boolean
}

const statusConfig = {
  pending: {
    label: 'Afventer betaling',
    variant: 'secondary' as const,
  },
  paid: {
    label: 'Betalt',
    variant: 'default' as const,
  },
  completed: {
    label: 'Gennemført',
    variant: 'default' as const,
  },
  cancelled: {
    label: 'Annulleret',
    variant: 'destructive' as const,
  },
}

function formatCurrency(cents: number, currency: string = 'DKK'): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function OrdersTable({ orders, onViewDetails, isLoading }: OrdersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Billede</TableHead>
              <TableHead>Kunstværk</TableHead>
              <TableHead>Galleri</TableHead>
              <TableHead>Ordredato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Beløb</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-12 w-12 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Ingen ordrer fundet</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Billede</TableHead>
            <TableHead>Kunstværk</TableHead>
            <TableHead>Galleri</TableHead>
            <TableHead>Ordredato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Beløb</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const status = statusConfig[order.status]
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="relative h-12 w-12 overflow-hidden rounded">
                    {order.artwork.image_url ? (
                      <Image
                        src={order.artwork.image_url}
                        alt={order.artwork.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                        Intet billede
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.artwork.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.artwork.artist_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {order.gallery ? (
                    <div className="text-sm">{order.gallery.name}</div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Direkte salg</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(order.order_date)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.amount_cents, order.currency)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Se detaljer
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
