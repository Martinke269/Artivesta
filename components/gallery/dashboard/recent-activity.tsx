import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityItem } from '@/lib/supabase/gallery-queries'
import { UserPlus, Image as ImageIcon, TrendingUp, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { da } from 'date-fns/locale'

interface RecentActivityProps {
  activity: ActivityItem[]
}

export function RecentActivity({ activity }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'artist_joined':
        return UserPlus
      case 'artwork_added':
        return ImageIcon
      case 'sale_completed':
        return TrendingUp
      case 'invitation_sent':
        return Mail
      default:
        return UserPlus
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'artist_joined':
        return 'bg-blue-50 text-blue-600'
      case 'artwork_added':
        return 'bg-purple-50 text-purple-600'
      case 'sale_completed':
        return 'bg-green-50 text-green-600'
      case 'invitation_sent':
        return 'bg-orange-50 text-orange-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seneste aktivitet</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Ingen aktivitet endnu
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Aktivitet vil blive vist her, når der sker noget i dit galleri.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => {
              const Icon = getActivityIcon(item.type)
              const colorClass = getActivityColor(item.type)
              
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                        locale: da,
                      })}
                    </p>
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
