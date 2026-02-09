import { Users, Image, TrendingUp, DollarSign, Mail, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GalleryStats } from '@/lib/supabase/gallery-queries'

interface StatsOverviewProps {
  stats: GalleryStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Kunstnere',
      value: stats.totalArtists,
      icon: Users,
      description: 'Aktive kunstnere',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Kunstværker',
      value: stats.totalArtworks,
      icon: Image,
      description: `${stats.activeListings} aktive`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Salg',
      value: stats.totalSales,
      icon: TrendingUp,
      description: 'Gennemførte salg',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Omsætning',
      value: `${stats.totalRevenue.toLocaleString('da-DK')} kr`,
      icon: DollarSign,
      description: 'Total omsætning',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Invitationer',
      value: stats.pendingInvitations,
      icon: Mail,
      description: 'Afventer svar',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Aktive listings',
      value: stats.activeListings,
      icon: Eye,
      description: 'Synlige værker',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
