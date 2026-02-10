'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import type { BuyerOrder } from '@/lib/supabase/buyer-overview-queries'

interface OrdersMiniTableProps {
  orders: BuyerOrder[]
}

export function OrdersMiniTable({ orders }: OrdersMiniTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
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

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seneste ordrer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Ingen ordrer endnu
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Seneste ordrer</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/buyer/dashboard/orders">
            Se alle
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
            >
              {/* Artwork Image */}
              <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {order.artwork.image_url ? (
                  <Image
                    src={order.artwork.image_url}
                    alt={order.artwork.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Order Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {order.artwork.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ordre #{order.id.slice(0, 8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.created_at), 'dd. MMM yyyy', { locale: da })}
                </p>
              </div>

              {/* Price and Status */}
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-semibold">
                  {formatPrice(order.amount_cents, order.currency)}
                </p>
                {getStatusBadge(order.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
