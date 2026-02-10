'use client'

import { useState } from 'react'
import Image from 'next/image'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal, Eye, Package, FileText } from 'lucide-react'
import { GalleryOrder } from '@/lib/supabase/gallery-orders-queries'

interface OrdersTableProps {
  orders: GalleryOrder[]
  isLoading: boolean
  onViewOrder: (orderId: string) => void
  onMarkAsShipped?: (orderId: string) => void
}

export function OrdersTable({
  orders,
  isLoading,
  onViewOrder,
  onMarkAsShipped,
}: OrdersTableProps) {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      paid: 'secondary',
      completed: 'default',
      cancelled: 'destructive',
    }

    const labels: Record<string, string> = {
      pending: 'Afventer',
      paid: 'Betalt',
      completed: 'Gennemført',
      cancelled: 'Annulleret',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getEscrowBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      held: 'secondary',
      released: 'default',
      refunded: 'destructive',
    }

    const labels: Record<string, string> = {
      held: 'I Escrow',
      released: 'Frigivet',
      refunded: 'Refunderet',
    }

    return (
      <Badge variant={variants[status] || 'secondary'} className="text-xs">
        {labels[status] || status}
      </Badge>
    )
  }

  const getPayoutBadge = (status?: string) => {
    if (!status) return null

    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      approved: 'secondary',
      completed: 'default',
      rejected: 'destructive',
    }

    const labels: Record<string, string> = {
      pending: 'Afventer',
      approved: 'Godkendt',
      completed: 'Udbetalt',
      rejected: 'Afvist',
    }

    return (
      <Badge variant={variants[status] || 'outline'} className="text-xs">
        {labels[status] || status}
      </Badge>
    )
  }

  const handleMarkAsShipped = async (orderId: string) => {
    if (!onMarkAsShipped) return
    setProcessingOrderId(orderId)
    try {
      await onMarkAsShipped(orderId)
    } finally {
      setProcessingOrderId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Ingen ordrer endnu</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Når dine kunstnere får salg, vil ordrerne vises her.
        </p>
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
            <TableHead>Kunstner</TableHead>
            <TableHead>Køber</TableHead>
            <TableHead>Dato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Pris</TableHead>
            <TableHead className="text-right">Kommission</TableHead>
            <TableHead className="text-right">Udbetaling</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="group">
              <TableCell>
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                  {order.artwork_image_url ? (
                    <Image
                      src={order.artwork_image_url}
                      alt={order.artwork_title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{order.artwork_title}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.artist_name}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {order.buyer_name}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.order_date), {
                    addSuffix: true,
                    locale: da,
                  })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(order.order_status)}
                  {getEscrowBadge(order.escrow_status)}
                  {order.has_payout && getPayoutBadge(order.payout_status)}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {(order.price_cents / 100).toLocaleString('da-DK')} kr
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {(order.commission_cents / 100).toLocaleString('da-DK')} kr
              </TableCell>
              <TableCell className="text-right font-medium text-green-600">
                {(order.payout_cents / 100).toLocaleString('da-DK')} kr
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={processingOrderId === order.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Åbn menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewOrder(order.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Se ordre
                    </DropdownMenuItem>
                    {order.order_status === 'paid' && onMarkAsShipped && (
                      <DropdownMenuItem
                        onClick={() => handleMarkAsShipped(order.id)}
                        disabled={processingOrderId === order.id}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Marker som afsendt
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem disabled>
                      <FileText className="mr-2 h-4 w-4" />
                      Download faktura
                    </DropdownMenuItem>
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
