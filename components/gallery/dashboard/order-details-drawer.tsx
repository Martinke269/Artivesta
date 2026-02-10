'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Package,
  Calendar,
  CreditCard,
  Shield,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { OrderDetails } from '@/lib/supabase/gallery-orders-queries'
import { createClient } from '@/utils/supabase/client'
import { getOrderDetails } from '@/lib/supabase/gallery-orders-queries'

interface OrderDetailsDrawerProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDrawer({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDrawerProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (orderId && open) {
      loadOrderDetails()
    }
  }, [orderId, open])

  const loadOrderDetails = async () => {
    if (!orderId) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const details = await getOrderDetails(supabase, orderId)
      setOrder(details)
    } catch (error) {
      console.error('Error loading order details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'paid':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'cancelled':
        return <X className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

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

  const getEscrowStatusBadge = (status: string) => {
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
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      held: 'Midler tilbageholdt',
      released: 'Midler frigivet',
      partial_release: 'Delvis frigivelse',
      refunded: 'Refunderet',
      disputed: 'Tvist oprettet',
      dispute_resolved: 'Tvist løst',
    }
    return labels[type] || type
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Ordredetaljer</SheetTitle>
              <SheetDescription>
                Komplet information om ordren og betalingsstatus
              </SheetDescription>
            </SheetHeader>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : order ? (
              <div className="space-y-6">
                {/* Artwork Info */}
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {order.artwork_image_url ? (
                      <Image
                        src={order.artwork_image_url}
                        alt={order.artwork_title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {order.artwork_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Af {order.artist_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(order.order_status)}
                      {getEscrowStatusBadge(order.escrow_status)}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Timeline */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ordre tidslinje
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(order.order_status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ordre oprettet</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), 'PPP \'kl.\' HH:mm', {
                            locale: da,
                          })}
                        </p>
                      </div>
                    </div>
                    {order.order_status !== 'pending' && (
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Betaling modtaget</p>
                          <p className="text-xs text-muted-foreground">
                            Midler i escrow
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Payment Details */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Betalingsdetaljer
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ordre pris</span>
                      <span className="font-medium">
                        {(order.price_cents / 100).toLocaleString('da-DK')} kr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Kommission (20%)
                      </span>
                      <span className="text-muted-foreground">
                        -{(order.commission_cents / 100).toLocaleString('da-DK')} kr
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Udbetaling til kunstner</span>
                      <span className="font-semibold text-green-600">
                        {(order.payout_cents / 100).toLocaleString('da-DK')} kr
                      </span>
                    </div>
                    {order.payment_intent_id && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground">
                          Payment Intent: {order.payment_intent_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Escrow Status */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Escrow status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Midler status</p>
                        <p className="text-xs text-muted-foreground">
                          {order.escrow_status === 'held' &&
                            'Midler tilbageholdt i escrow'}
                          {order.escrow_status === 'released' &&
                            'Midler frigivet til kunstner'}
                          {order.escrow_status === 'refunded' &&
                            'Midler refunderet til køber'}
                        </p>
                      </div>
                      {getEscrowStatusBadge(order.escrow_status)}
                    </div>

                    {order.escrow_events.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Escrow hændelser</p>
                        <div className="space-y-2">
                          {order.escrow_events.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start gap-2 text-xs p-2 bg-muted/50 rounded"
                            >
                              <div className="flex-1">
                                <p className="font-medium">
                                  {getEventTypeLabel(event.event_type)}
                                </p>
                                <p className="text-muted-foreground">
                                  {(event.amount_cents / 100).toLocaleString('da-DK')}{' '}
                                  kr
                                </p>
                                {event.reason && (
                                  <p className="text-muted-foreground mt-1">
                                    {event.reason}
                                  </p>
                                )}
                                <p className="text-muted-foreground mt-1">
                                  {format(new Date(event.created_at), 'PPP HH:mm', {
                                    locale: da,
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payout Status */}
                {order.payout_details && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Udbetalingsstatus
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge
                            variant={
                              order.payout_details.status === 'completed'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {order.payout_details.status === 'pending' && 'Afventer'}
                            {order.payout_details.status === 'approved' &&
                              'Godkendt'}
                            {order.payout_details.status === 'completed' &&
                              'Udbetalt'}
                            {order.payout_details.status === 'rejected' && 'Afvist'}
                          </Badge>
                        </div>
                        {order.payout_details.completed_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Udbetalt dato
                            </span>
                            <span>
                              {format(
                                new Date(order.payout_details.completed_at),
                                'PPP',
                                { locale: da }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Stripe Events */}
                {order.stripe_events.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Stripe hændelser</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {order.stripe_events.map((event) => (
                          <div
                            key={event.id}
                            className="text-xs p-2 bg-muted/50 rounded"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{event.event_type}</span>
                              <Badge
                                variant={
                                  event.processing_status === 'processed'
                                    ? 'default'
                                    : event.processing_status === 'failed'
                                    ? 'destructive'
                                    : 'outline'
                                }
                                className="text-xs"
                              >
                                {event.processing_status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              {format(new Date(event.created_at), 'PPP HH:mm', {
                                locale: da,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Buyer Info */}
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Køber information</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{order.buyer_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Køber identitet er maskeret af hensyn til privatlivets fred
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    Download faktura
                  </Button>
                  <Button variant="outline" disabled>
                    Kontakt sælger
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Kunne ikke indlæse ordredetaljer
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
