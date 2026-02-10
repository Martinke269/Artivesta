'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Clock, CheckCircle2 } from 'lucide-react'
import type { BuyerOrdersStats } from '@/lib/supabase/buyer-orders-queries'

interface OrdersSummaryCardsProps {
  stats: BuyerOrdersStats
  isLoading?: boolean
}

export function OrdersSummaryCards({ stats, isLoading }: OrdersSummaryCardsProps) {
  const cards = [
    {
      title: 'Antal ordrer',
      value: stats.totalOrders,
      icon: Package,
      description: 'Alle ordrer',
    },
    {
      title: 'Afventende betalinger',
      value: stats.pendingPayments,
      icon: Clock,
      description: 'Ordrer der afventer betaling',
      highlight: stats.pendingPayments > 0,
    },
    {
      title: 'Gennemførte køb',
      value: stats.completedPurchases,
      icon: CheckCircle2,
      description: 'Betalte og gennemførte ordrer',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardTitle>
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className={card.highlight ? 'border-orange-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.highlight ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.highlight ? 'text-orange-500' : ''}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
