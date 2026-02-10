'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react'
import type { BuyerPaymentsStats } from '@/lib/supabase/buyer-payments-types'

interface PaymentsSummaryCardsProps {
  stats: BuyerPaymentsStats
}

export function PaymentsSummaryCards({ stats }: PaymentsSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Antal betalinger</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPayments}</div>
          <p className="text-xs text-muted-foreground">
            Alle betalinger i systemet
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Gennemførte betalinger
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successfulPayments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalPayments > 0
              ? `${Math.round((stats.successfulPayments / stats.totalPayments) * 100)}% af alle betalinger`
              : 'Ingen betalinger endnu'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fejlede betalinger
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.failedPayments}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.failedPayments > 0
              ? 'Kræver opmærksomhed'
              : 'Ingen fejlede betalinger'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
