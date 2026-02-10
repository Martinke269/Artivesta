'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { GalleryPaymentInfo } from '@/lib/supabase/gallery-settings-queries'

interface PaymentSettingsProps {
  paymentInfo: GalleryPaymentInfo
  isOwner: boolean
}

export function PaymentSettings({ paymentInfo, isOwner }: PaymentSettingsProps) {
  const isConnected = paymentInfo.stripe_account_id && paymentInfo.stripe_onboarding_complete

  return (
    <Card>
      <CardHeader>
        <CardTitle>Betalings- og udbetalingsindstillinger</CardTitle>
        <CardDescription>
          Administrer dine betalingsindstillinger og se udbetalingsoversigt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stripe Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Stripe Status</h3>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? 'Din Stripe-konto er forbundet og klar til betalinger'
                  : 'Forbind din Stripe-konto for at modtage betalinger'}
              </p>
            </div>
            {isConnected ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Forbundet
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Ikke forbundet
              </Badge>
            )}
          </div>
        </div>

        {/* Account Details */}
        {isConnected && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Konto-ID</p>
                <p className="text-sm font-mono">{paymentInfo.stripe_account_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Udbetalingsfrekvens</p>
                <p className="text-sm capitalize">{paymentInfo.payout_frequency}</p>
              </div>
            </div>

            {paymentInfo.last_payout_date && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seneste udbetaling</p>
                  <p className="text-sm">
                    {new Date(paymentInfo.last_payout_date).toLocaleDateString('da-DK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Beløb</p>
                  <p className="text-sm font-semibold">
                    {((paymentInfo.last_payout_amount || 0) / 100).toLocaleString('da-DK')} kr.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Commission Info */}
        <div className="space-y-2 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Kommissionsoversigt</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{paymentInfo.commission_percentage}%</span>
            <span className="text-sm text-muted-foreground">
              af hvert salg går til galleriet
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Kunstneren modtager {100 - paymentInfo.commission_percentage}% af salgsprisen
          </p>
        </div>

        {/* Actions */}
        {isOwner && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {!isConnected ? (
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Forbind Stripe
              </Button>
            ) : (
              <>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Åbn Stripe Dashboard
                </Button>
                <Button variant="outline">Opdater kontooplysninger</Button>
              </>
            )}
          </div>
        )}

        {!isOwner && (
          <p className="text-sm text-muted-foreground">
            Kun galleriets ejer kan ændre betalingsindstillinger
          </p>
        )}
      </CardContent>
    </Card>
  )
}
