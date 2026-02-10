'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  FileText, 
  Receipt, 
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { BuyerOverviewStats } from '@/lib/supabase/buyer-overview-queries'

interface SummaryCardsProps {
  stats: BuyerOverviewStats
}

export function SummaryCards({ stats }: SummaryCardsProps) {
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

      {/* Open Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Åbne ordrer
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.openOrders}</div>
          <p className="text-xs text-muted-foreground">
            Afventer behandling
          </p>
        </CardContent>
      </Card>

      {/* Paid Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Betalte fakturaer
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.paidInvoices}</div>
          <p className="text-xs text-muted-foreground">
            I alt betalt
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
