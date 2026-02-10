'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  DollarSign, 
  Clock, 
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { BuyerLeasingStats } from '@/lib/supabase/buyer-leasing-queries'

interface LeasingSummaryCardsProps {
  stats: BuyerLeasingStats
}

export function LeasingSummaryCards({ stats }: LeasingSummaryCardsProps) {
  const getInsuranceIcon = () => {
    switch (stats.insuranceStatus) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'expiring':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'missing':
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getInsuranceText = () => {
    switch (stats.insuranceStatus) {
      case 'ok':
        return 'OK'
      case 'expiring':
        return 'Udløber snart'
      case 'missing':
        return 'Mangler'
    }
  }

  const getInsuranceVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (stats.insuranceStatus) {
      case 'ok':
        return 'default'
      case 'expiring':
        return 'secondary'
      case 'missing':
        return 'destructive'
    }
  }

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
      {/* Active Leases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aktive leasingaftaler
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeLeases}</div>
          <p className="text-xs text-muted-foreground">
            Løbende aftaler
          </p>
        </CardContent>
      </Card>

      {/* Total Monthly Payment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Månedlig samlet betaling
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalMonthlyPayment)}
          </div>
          <p className="text-xs text-muted-foreground">
            I alt per måned
          </p>
        </CardContent>
      </Card>

      {/* Expiring Within 60 Days */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Udløber inden for 60 dage
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringWithin60Days}</div>
          <p className="text-xs text-muted-foreground">
            {stats.expiringWithin60Days === 0 ? 'Ingen aftaler' : 'Kræver handling'}
          </p>
        </CardContent>
      </Card>

      {/* Insurance Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Forsikringsstatus
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={getInsuranceVariant()} className="flex items-center gap-1">
              {getInsuranceIcon()}
              {getInsuranceText()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.insuranceStatus === 'ok' && 'Alle forsikringer er aktive'}
            {stats.insuranceStatus === 'expiring' && 'Nogle forsikringer udløber snart'}
            {stats.insuranceStatus === 'missing' && 'Manglende forsikringer'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
