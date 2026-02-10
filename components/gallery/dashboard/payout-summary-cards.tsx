'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Clock, TrendingUp, CheckCircle } from 'lucide-react'
import { PayoutStats } from '@/lib/supabase/gallery-payouts-queries'

interface PayoutSummaryCardsProps {
  stats: PayoutStats
  isLoading?: boolean
}

export function PayoutSummaryCards({ stats, isLoading }: PayoutSummaryCardsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const cards = [
    {
      title: 'Total Udbetalt',
      value: formatCurrency(stats.totalPaidOut),
      icon: DollarSign,
      description: 'Samlet udbetalt beløb',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Payouts',
      value: formatCurrency(stats.pendingPayouts),
      icon: Clock,
      description: 'Afventer udbetaling',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Kommission Betalt',
      value: formatCurrency(stats.totalCommission),
      icon: TrendingUp,
      description: '20% platform fee',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Gennemførte Udbetalinger',
      value: stats.completedPayoutsCount.toString(),
      icon: CheckCircle,
      description: 'Antal udbetalinger',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
