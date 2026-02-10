'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { BuyerInvoicesStats } from '@/lib/supabase/buyer-invoices-queries'

interface InvoicesSummaryCardsProps {
  stats: BuyerInvoicesStats;
  isLoading?: boolean;
}

export function InvoicesSummaryCards({
  stats,
  isLoading = false,
}: InvoicesSummaryCardsProps) {
  const cards = [
    {
      title: 'Antal Fakturaer',
      value: stats.totalInvoices,
      icon: FileText,
      description: 'Totalt antal fakturaer',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Betalte Fakturaer',
      value: stats.paidInvoices,
      icon: CheckCircle2,
      description: 'Gennemførte betalinger',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ubetalte Fakturaer',
      value: stats.unpaidInvoices,
      icon: AlertCircle,
      description: 'Afventer betaling',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
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
