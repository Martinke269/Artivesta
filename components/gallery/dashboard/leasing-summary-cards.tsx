'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar, Shield, AlertTriangle } from 'lucide-react'
import type { LeasingSummary } from '@/lib/supabase/gallery-leasing-queries'

interface LeasingSummaryCardsProps {
  summary: LeasingSummary
}

export function LeasingSummaryCards({ summary }: LeasingSummaryCardsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aktive Leasingaftaler
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.active_leases}</div>
          <p className="text-xs text-muted-foreground">
            Aktive og snart udløbende
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Månedlig Indtægt
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.total_monthly_revenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Samlet månedlig lejeindtægt
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Udløber Snart
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.expiring_soon}</div>
          <p className="text-xs text-muted-foreground">
            Inden for 60 dage
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Forsikringsstatus
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-green-600">
              {summary.insurance_ok}
            </div>
            <span className="text-sm text-muted-foreground">/</span>
            <div className="text-2xl font-bold text-red-600">
              {summary.insurance_missing}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            OK / Mangler
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
