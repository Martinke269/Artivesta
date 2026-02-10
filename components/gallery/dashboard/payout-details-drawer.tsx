'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { PayoutDetails } from '@/lib/supabase/gallery-payouts-queries'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface PayoutDetailsDrawerProps {
  payoutId: string | null
  isOpen: boolean
  onClose: () => void
  onFetchDetails: (payoutId: string) => Promise<PayoutDetails | null>
}

export function PayoutDetailsDrawer({
  payoutId,
  isOpen,
  onClose,
  onFetchDetails,
}: PayoutDetailsDrawerProps) {
  const [details, setDetails] = useState<PayoutDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && payoutId) {
      setIsLoading(true)
      onFetchDetails(payoutId)
        .then((data) => setDetails(data))
        .finally(() => setIsLoading(false))
    } else {
      setDetails(null)
    }
  }, [isOpen, payoutId, onFetchDetails])

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
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: da })
    } catch {
      return '-'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getEscrowEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'held':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'released':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'refunded':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'disputed':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Payout Details</SheetTitle>
          <SheetDescription>
            Detaljeret information om udbetalingen
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : details ? (
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
            <div className="space-y-6 py-6">
              {/* Artwork Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Kunstværk</h3>
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {details.artwork_image_url ? (
                      <Image
                        src={details.artwork_image_url}
                        alt={details.artwork_title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{details.artwork_title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Kunstner: {details.artist_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Køber: {details.buyer_name}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Ordre Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ordre ID:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {details.order_details.id.slice(0, 8)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ordre dato:</span>
                    <span>{formatDate(details.order_details.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ordre status:</span>
                    <Badge variant="secondary">{details.order_details.order_status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escrow status:</span>
                    <Badge variant="secondary">{details.order_details.escrow_status}</Badge>
                  </div>
                  {details.order_details.payment_intent_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Intent:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {details.order_details.payment_intent_id.slice(0, 16)}...
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Payout Breakdown */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Udbetaling Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total ordre beløb:</span>
                    <span className="font-medium">
                      {formatCurrency(details.order_details.amount_cents)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform kommission (20%):</span>
                    <span className="text-red-600">
                      -{formatCurrency(details.commission_cents)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Netto udbetaling (80%):</span>
                    <span className="text-green-600">
                      {formatCurrency(details.net_amount_cents)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payout Status */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Udbetaling Status</h3>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  {getStatusIcon(details.status)}
                  <div className="flex-1">
                    <p className="font-medium capitalize">{details.status}</p>
                    {details.payout_date && (
                      <p className="text-sm text-muted-foreground">
                        Udbetalt: {formatDate(details.payout_date)}
                      </p>
                    )}
                    {details.approved_at && details.approved_by_name && (
                      <p className="text-sm text-muted-foreground">
                        Godkendt af {details.approved_by_name} den {formatDate(details.approved_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Escrow Timeline */}
              {details.escrow_events.length > 0 && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Escrow Timeline</h3>
                    <div className="space-y-3">
                      {details.escrow_events.map((event) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getEscrowEventIcon(event.event_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {event.event_type.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(event.created_at)}
                                </p>
                              </div>
                              <span className="text-sm font-medium">
                                {formatCurrency(event.amount_cents)}
                              </span>
                            </div>
                            {event.reason && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.reason}
                              </p>
                            )}
                            {event.initiated_by_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Initieret af: {event.initiated_by_name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Stripe Events */}
              {details.stripe_events.length > 0 && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Stripe Event Logs</h3>
                    <div className="space-y-2">
                      {details.stripe_events.slice(0, 5).map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{event.event_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.created_at)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              event.processing_status === 'processed'
                                ? 'default'
                                : event.processing_status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {event.processing_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {details.invoice_id && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/api/invoices/${details.invoice_id}`} target="_blank">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/gallery/dashboard/orders`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Se ordre detaljer
                  </a>
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Ingen data tilgængelig</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
