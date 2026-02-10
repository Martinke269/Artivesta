'use client'

import { BehaviorInsight } from '@/lib/supabase/gallery-ai-insights-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

interface BehaviorInsightsSectionProps {
  insights: BehaviorInsight[]
}

export function BehaviorInsightsSection({ insights }: BehaviorInsightsSectionProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      case 'recommendation':
        return <Target className="h-5 w-5 text-purple-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-gray-400" />
    }
  }

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'default'
      case 'warning':
        return 'destructive'
      case 'trend':
        return 'secondary'
      case 'recommendation':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getInsightTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      opportunity: 'Mulighed',
      warning: 'Advarsel',
      trend: 'Trend',
      recommendation: 'Anbefaling',
    }
    return labels[type] || type
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: 'Høj prioritet',
      medium: 'Medium prioritet',
      low: 'Lav prioritet',
    }
    return labels[priority] || priority
  }

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 dark:border-green-800'
      case 'warning':
        return 'border-orange-200 dark:border-orange-800'
      case 'trend':
        return 'border-blue-200 dark:border-blue-800'
      case 'recommendation':
        return 'border-purple-200 dark:border-purple-800'
      default:
        return 'border-gray-200 dark:border-gray-800'
    }
  }

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 dark:bg-green-950/20'
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950/20'
      case 'trend':
        return 'bg-blue-50 dark:bg-blue-950/20'
      case 'recommendation':
        return 'bg-purple-50 dark:bg-purple-950/20'
      default:
        return 'bg-gray-50 dark:bg-gray-950/20'
    }
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Adfærdsindsigter</CardTitle>
          <CardDescription>
            AI-genererede indsigter baseret på køberadfærd og trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">Ingen indsigter endnu</p>
            <p className="text-sm text-muted-foreground mt-2">
              Når der er nok data, vil AI generere indsigter om køberadfærd og markedstrends.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group insights by priority
  const highPriorityInsights = insights.filter((i) => i.priority === 'high')
  const mediumPriorityInsights = insights.filter((i) => i.priority === 'medium')
  const lowPriorityInsights = insights.filter((i) => i.priority === 'low')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adfærdsindsigter ({insights.length})</CardTitle>
        <CardDescription>
          AI-genererede indsigter baseret på køberadfærd, prishistorik og markedstrends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Priority Insights */}
        {highPriorityInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Badge variant="destructive">Høj prioritet</Badge>
              <span className="text-muted-foreground">
                ({highPriorityInsights.length})
              </span>
            </h3>
            <div className="space-y-3">
              {highPriorityInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 border-2 rounded-lg ${getInsightBorderColor(insight.insight_type)} ${getInsightBgColor(insight.insight_type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.insight_type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge
                            variant={getInsightBadgeVariant(insight.insight_type)}
                            className="mt-1"
                          >
                            {getInsightTypeLabel(insight.insight_type)}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {insight.affected_artworks} værk{insight.affected_artworks !== 1 ? 'er' : ''}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.action_suggestions.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <p className="text-xs font-medium">Anbefalede handlinger:</p>
                          <ul className="space-y-1">
                            {insight.action_suggestions.map((action, i) => (
                              <li
                                key={i}
                                className="text-xs text-muted-foreground flex items-start gap-2"
                              >
                                <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority Insights */}
        {mediumPriorityInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Badge variant="default">Medium prioritet</Badge>
              <span className="text-muted-foreground">
                ({mediumPriorityInsights.length})
              </span>
            </h3>
            <div className="space-y-3">
              {mediumPriorityInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 border rounded-lg ${getInsightBorderColor(insight.insight_type)} ${getInsightBgColor(insight.insight_type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.insight_type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge
                            variant={getInsightBadgeVariant(insight.insight_type)}
                            className="mt-1"
                          >
                            {getInsightTypeLabel(insight.insight_type)}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {insight.affected_artworks} værk{insight.affected_artworks !== 1 ? 'er' : ''}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.action_suggestions.length > 0 && (
                        <div className="space-y-1 pt-2">
                          <p className="text-xs font-medium">Anbefalede handlinger:</p>
                          <ul className="space-y-1">
                            {insight.action_suggestions.map((action, i) => (
                              <li
                                key={i}
                                className="text-xs text-muted-foreground flex items-start gap-2"
                              >
                                <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Priority Insights */}
        {lowPriorityInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Badge variant="secondary">Lav prioritet</Badge>
              <span className="text-muted-foreground">
                ({lowPriorityInsights.length})
              </span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {lowPriorityInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 border rounded-lg ${getInsightBorderColor(insight.insight_type)} ${getInsightBgColor(insight.insight_type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getInsightIcon(insight.insight_type)}</div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={getInsightBadgeVariant(insight.insight_type)}
                            className="text-xs"
                          >
                            {getInsightTypeLabel(insight.insight_type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.affected_artworks} værk{insight.affected_artworks !== 1 ? 'er' : ''}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
