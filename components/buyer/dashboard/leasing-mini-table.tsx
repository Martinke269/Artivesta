'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { BuyerLease } from '@/lib/supabase/buyer-overview-queries'

interface LeasingMiniTableProps {
  leases: BuyerLease[]
}

export function LeasingMiniTable({ leases }: LeasingMiniTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      expiring_soon: 'secondary',
      overdue: 'destructive',
      completed: 'outline',
      cancelled: 'destructive',
    }

    const labels: Record<string, string> = {
      active: 'Aktiv',
      expiring_soon: 'Udløber snart',
      overdue: 'Forfalden',
      completed: 'Afsluttet',
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

  if (leases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktive leasingaftaler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Ingen aktive leasingaftaler
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aktive leasingaftaler</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/buyer/dashboard/leasing">
            Se alle
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leases.map((lease) => (
            <div
              key={lease.id}
              className="flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
            >
              {/* Artwork Image */}
              <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                {lease.artwork.image_url ? (
                  <Image
                    src={lease.artwork.image_url}
                    alt={lease.artwork.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Lease Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {lease.artwork.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(lease.monthly_price_cents, lease.currency)}/måned
                </p>
                <p className="text-xs text-muted-foreground">
                  {lease.days_remaining} dage tilbage
                </p>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(lease.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
