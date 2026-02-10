'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionUrl?: string
  actionLabel?: string
}

interface AIInsightsSnapshotProps {
  insights: AIInsight[]
  galleryId: string
}

export function AIInsightsSnapshot({ insights, galleryId }: AIInsightsSnapshotProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return Lightbulb
      case 'warning':
        return AlertTriangle
      case 'trend':
        return TrendingUp
      case 'recommendation':
        return Sparkles
      default:
        return Lightbulb
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'warning':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'trend':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'recommendation':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getImpactBadge = (impact: AIInsight['impact']) => {
    const variants = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    
    return (
      <Badge variant="outline" className={variants[impact]}>
        {impact === 'high' ? 'Høj prioritet' : impact === 'medium' ? 'Medium prioritet' : 'Lav prioritet'}
      </Badge>
    )
  }

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Indsigter</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/gallery/${galleryId}/insights`}>
              Se alle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Ingen indsigter endnu
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              AI-indsigter vil blive genereret baseret på dit galleris aktivitet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.slice(0, 3).map((insight) => {
              const Icon = getInsightIcon(insight.type)
              const colorClass = getInsightColor(insight.type)
              
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-2 ${colorClass} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        {getImpactBadge(insight.impact)}
                      </div>
                      <p className="text-sm opacity-90 mb-3">
                        {insight.description}
                      </p>
                      {insight.actionUrl && insight.actionLabel && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-white/80"
                          asChild
                        >
                          <Link href={insight.actionUrl}>
                            {insight.actionLabel}
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
