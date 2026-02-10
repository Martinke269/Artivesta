'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  Bell 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { da } from 'date-fns/locale'
import type { BuyerActivity } from '@/lib/supabase/buyer-overview-queries'

interface RecentActivitiesProps {
  activities: BuyerActivity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: BuyerActivity['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />
      case 'lease_payment':
        return <CreditCard className="h-4 w-4" />
      case 'insurance':
        return <Shield className="h-4 w-4" />
      case 'system':
        return <Bell className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      completed: 'default',
      cancelled: 'destructive',
      overdue: 'destructive',
    }

    const labels: Record<string, string> = {
      pending: 'Afventer',
      paid: 'Betalt',
      completed: 'Gennemført',
      cancelled: 'Annulleret',
      overdue: 'Forfalden',
    }

    return (
      <Badge variant={variants[status] || 'outline'} className="ml-auto">
        {labels[status] || status}
      </Badge>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seneste aktiviteter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Ingen aktiviteter endnu
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seneste aktiviteter</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.date), {
                      addSuffix: true,
                      locale: da,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
