'use client'

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
import { Download, FileText, Calendar, CreditCard, Building2, Package } from 'lucide-react'
import { BuyerPaymentDetail } from '@/lib/supabase/buyer-payments-queries'
import Image from 'next/image'

interface PaymentDetailsDrawerProps {
  payment: BuyerPaymentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailsDrawer({
  payment,
  open,
  onOpenChange,
}: PaymentDetailsDrawerProps) {
  if (!payment) return null

  const formatCurrency = (cents: number, currency: string = 'DKK') => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: 'completed' | 'rejected' | 'failed' | 'pending') => {
    const variants = {
      completed: { label: 'Gennemført', className: 'bg-green-100 text-green-800' },
      pending: { label: 'Afventer', className: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Fejlet', className: 'bg-red-100 text-red-800' },
      rejected: { label: 'Afvist', className: 'bg-orange-100 text-orange-800' },
    }
    const config = variants[status]
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Betalingdetaljer</SheetTitle>
          <SheetDescription>
            Betaling {payment.payment_id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Betalingoplysninger</h3>
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Betaling ID</span>
                </div>
                <span className="font-medium">{payment.payment_id}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Dato</span>
                </div>
                <span className="font-medium">{formatDate(payment.date)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Forfaldsdato</span>
                </div>
                <span className="font-medium">{formatDate(payment.related_invoice?.due_date || payment.date)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(payment.status)}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Beløb</span>
                <span className="font-medium">
                  {formatCurrency(payment.amount_cents, payment.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Moms (25%)</span>
                <span className="font-medium">
                  {formatCurrency(payment.vat_cents, payment.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  {formatCurrency(payment.total_cents, payment.currency)}
                </span>
              </div>

              {payment.payment_method && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Betalingsmetode</span>
                    </div>
                    <span className="font-medium">{payment.payment_method}</span>
                  </div>
                </>
              )}

              {payment.receipt_url && (
                <>
                  <Separator />
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Related Order or Lease */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              {payment.type === 'order' ? 'Tilknyttet Ordre' : 'Tilknyttet Leasing'}
            </h3>
            <div className="rounded-lg border p-4">
              {/* Artwork */}
              <div className="flex gap-4">
                {payment.related_item.artwork.image_url && (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={payment.related_item.artwork.image_url}
                      alt={payment.related_item.artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium">{payment.related_item.artwork.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {payment.related_item.artwork.artist_name}
                  </p>
                  {payment.related_item.gallery && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{payment.related_item.gallery.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Order or Lease Details */}
              {payment.type === 'order' && payment.related_item.order_date && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ordre ID</span>
                    <span className="font-medium">{payment.related_item.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ordredato</span>
                    <span className="font-medium">{formatDate(payment.related_item.order_date)}</span>
                  </div>
                </div>
              )}

              {payment.type === 'leasing' && payment.related_item.leasing_period && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Leasingperiode</span>
                    <span className="font-medium">
                      {formatDate(payment.related_item.leasing_period.start)} -{' '}
                      {formatDate(payment.related_item.leasing_period.end)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Månedlig pris</span>
                    <span className="font-medium">
                      {formatCurrency(payment.related_item.leasing_period.monthly_price_cents, payment.currency)}
                    </span>
                  </div>
                </div>
              )}

              {/* Gallery Contact */}
              {payment.related_item.gallery && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Galleri kontakt</h4>
                    {payment.related_item.gallery.email && (
                      <p className="text-sm text-muted-foreground">
                        {payment.related_item.gallery.email}
                      </p>
                    )}
                    {payment.related_item.gallery.phone && (
                      <p className="text-sm text-muted-foreground">
                        {payment.related_item.gallery.phone}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-4">
            <h3 className="font-semibold">Betalingshistorik</h3>
            <div className="space-y-3">
              {payment.stripe_events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{event.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(event.timestamp)}
                    </p>
                    {event.note && (
                      <p className="text-xs text-muted-foreground">{event.note}</p>
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
