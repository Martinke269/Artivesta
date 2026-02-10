'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Download, MapPin, Mail, Phone, Clock } from 'lucide-react'
import type { BuyerOrderDetail } from '@/lib/supabase/buyer-orders-queries'

interface OrderDetailsDrawerProps {
  order: BuyerOrderDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
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
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function OrderDetailsDrawer({
  order,
  open,
  onOpenChange,
}: OrderDetailsDrawerProps) {
  if (!order) return null

  const status = statusConfig[order.status]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Ordredetaljer</SheetTitle>
          <SheetDescription>
            Ordre ID: {order.id.slice(0, 8)}...
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Artwork Section */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Kunstværk</h3>
            <div className="space-y-3 rounded-lg border p-4">
              {order.artwork.image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={order.artwork.image_url}
                    alt={order.artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <div className="font-medium">{order.artwork.title}</div>
                <div className="text-sm text-muted-foreground">
                  {order.artwork.artist_name}
                </div>
                {order.artwork.category && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Kategori: {order.artwork.category}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Ordreoplysninger</h3>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ordre ID</span>
                <span className="text-sm font-mono">{order.id.slice(0, 13)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dato</span>
                <span className="text-sm">{formatDate(order.order_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Beløb</span>
                <span className="text-sm font-medium">
                  {formatCurrency(order.amount_cents, order.currency)}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Betalingsmetode
                  </span>
                  <span className="text-sm">{order.payment_method}</span>
                </div>
              )}
              {order.invoice_url && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={order.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download faktura
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Gallery Information */}
          {order.gallery && (
            <>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Gallerioplysninger</h3>
                <div className="space-y-3 rounded-lg border p-4">
                  <div>
                    <div className="font-medium">{order.gallery.name}</div>
                  </div>
                  {order.gallery.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div>{order.gallery.address}</div>
                        <div>
                          {order.gallery.postal_code} {order.gallery.city}
                        </div>
                      </div>
                    </div>
                  )}
                  {order.gallery.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${order.gallery.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {order.gallery.email}
                      </a>
                    </div>
                  )}
                  {order.gallery.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${order.gallery.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {order.gallery.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment History */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Betalingshistorik</h3>
            <div className="space-y-3 rounded-lg border p-4">
              {order.payment_history.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{event.status}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </div>
                    {event.note && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {event.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
