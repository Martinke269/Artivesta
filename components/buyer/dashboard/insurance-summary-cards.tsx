'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, XCircle, FileWarning } from 'lucide-react'
import { BuyerInsuranceStats } from '@/lib/supabase/buyer-insurance-queries'

interface InsuranceSummaryCardsProps {
  stats: BuyerInsuranceStats
  isLoading?: boolean
}

export function InsuranceSummaryCards({
  stats,
  isLoading = false,
}: InsuranceSummaryCardsProps) {
  const cards = [
    {
      title: 'Forsikrede værker',
      value: stats.totalInsured,
      icon: Shield,
      description: 'Aktive forsikringer',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Udløber snart',
      value: stats.expiringSoon,
      icon: AlertTriangle,
      description: 'Inden for 60 dage',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Udløbet forsikring',
      value: stats.expired,
      icon: XCircle,
      description: 'Kræver fornyelse',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Mangler forsikring',
      value: stats.missing,
      icon: FileWarning,
      description: 'Ingen forsikring',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </CardTitle>
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
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
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
