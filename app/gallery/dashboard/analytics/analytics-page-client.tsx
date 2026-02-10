'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Eye, MessageSquare, TrendingUp, Tag, ArrowUpDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type {
  AnalyticsStats,
  ViewsOverTimeData,
  ArtworkPerformance,
  CategoryBreakdown,
  FunnelData,
} from '@/lib/supabase/gallery-analytics-queries'

interface AnalyticsPageClientProps {
  stats30: AnalyticsStats
  stats90: AnalyticsStats
  viewsData30: ViewsOverTimeData[]
  viewsData90: ViewsOverTimeData[]
  artworkPerformance: ArtworkPerformance[]
  categoryBreakdown: CategoryBreakdown[]
  funnelData: FunnelData[]
}

type SortField = 'views' | 'inquiries' | 'conversionRate'
type SortDirection = 'asc' | 'desc'

export function AnalyticsPageClient({
  stats30,
  stats90,
  viewsData30,
  viewsData90,
  artworkPerformance,
  categoryBreakdown,
  funnelData,
}: AnalyticsPageClientProps) {
  const [timePeriod, setTimePeriod] = useState<'30' | '90'>('30')
  const [sortField, setSortField] = useState<SortField>('views')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const currentStats = timePeriod === '30' ? stats30 : stats90
  const currentViewsData = timePeriod === '30' ? viewsData30 : viewsData90

  // Sort artwork performance
  const sortedArtworks = [...artworkPerformance].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    return (a[sortField] - b[sortField]) * multiplier
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getPerformanceBadge = (conversionRate: number) => {
    if (conversionRate >= 5) {
      return <Badge className="bg-green-500">Excellent</Badge>
    } else if (conversionRate >= 2) {
      return <Badge className="bg-blue-500">Good</Badge>
    } else if (conversionRate >= 1) {
      return <Badge className="bg-yellow-500">Average</Badge>
    } else {
      return <Badge variant="secondary">Low</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      available: { label: 'Active', variant: 'default' },
      draft: { label: 'Draft', variant: 'secondary' },
      sold: { label: 'Sold', variant: 'outline' },
      reserved: { label: 'Reserved', variant: 'outline' },
    }

    const config = statusMap[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track performance and insights for your gallery
        </p>
      </div>

      {/* Time Period Toggle */}
      <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as '30' | '90')}>
        <TabsList>
          <TabsTrigger value="30">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90">Last 90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={timePeriod} className="space-y-8 mt-6">
          {/* Section 1: Performance Overview */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Performance Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last {timePeriod} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.totalInquiries.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last {timePeriod} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.conversionRate.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Views to inquiries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats.topCategory}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Most viewed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 2: Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Daily views for all artworks</CardDescription>
            </CardHeader>
            <CardContent>
              {currentViewsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentViewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => {
                        const date = new Date(value as string)
                        return date.toLocaleDateString('da-DK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      }}
                      formatter={(value: number) => [value, 'Views']}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Artwork Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Artwork Performance</CardTitle>
              <CardDescription>Performance metrics for all artworks</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedArtworks.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleSort('views')}
                          >
                            Views
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleSort('inquiries')}
                          >
                            Inquiries
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleSort('conversionRate')}
                          >
                            Conversion
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedArtworks.map((artwork) => (
                        <TableRow key={artwork.id}>
                          <TableCell>
                            <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                              {artwork.image_url ? (
                                <Image
                                  src={artwork.image_url}
                                  alt={artwork.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                  No image
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{artwork.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {artwork.artist_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{artwork.views.toLocaleString()}</TableCell>
                          <TableCell>{artwork.inquiries.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{artwork.conversionRate.toFixed(2)}%</span>
                              {getPerformanceBadge(artwork.conversionRate)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(artwork.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/artwork/${artwork.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No artworks found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Performance by artwork category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
                    <Bar dataKey="inquiries" fill="hsl(var(--chart-2))" name="Inquiries" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Funnel Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Track user journey from views to purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {funnelData.length > 0 ? (
                <div className="space-y-4">
                  {funnelData.map((step, index) => {
                    const isFirst = index === 0
                    const dropOff =
                      index > 0
                        ? ((funnelData[index - 1].count - step.count) / funnelData[index - 1].count) * 100
                        : 0

                    return (
                      <div key={step.step} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{step.step}</div>
                              <div className="text-sm text-muted-foreground">
                                {step.count.toLocaleString()} users
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{step.percentage.toFixed(1)}%</div>
                            {!isFirst && (
                              <div className="text-sm text-red-500">-{dropOff.toFixed(1)}% drop-off</div>
                            )}
                          </div>
                        </div>
                        <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 transition-all"
                            style={{ width: `${step.percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                            {step.count.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
