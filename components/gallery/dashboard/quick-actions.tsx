import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Image, Settings, BarChart3, FileText, Users } from 'lucide-react'
import Link from 'next/link'

interface QuickActionsProps {
  galleryId: string
}

export function QuickActions({ galleryId }: QuickActionsProps) {
  const actions = [
    {
      title: 'Inviter kunstner',
      description: 'Send invitation til en ny kunstner',
      icon: UserPlus,
      href: `/gallery/${galleryId}/invite`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Se alle kunstnere',
      description: 'Administrer dine kunstnere',
      icon: Users,
      href: `/gallery/${galleryId}/artists`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Se kunstværker',
      description: 'Gennemse alle værker',
      icon: Image,
      href: `/gallery/${galleryId}/artworks`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rapporter',
      description: 'Se salgsrapporter og statistik',
      icon: BarChart3,
      href: `/gallery/${galleryId}/reports`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Kontrakter',
      description: 'Administrer kontrakter',
      icon: FileText,
      href: `/gallery/${galleryId}/contracts`,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Indstillinger',
      description: 'Rediger galleri-indstillinger',
      icon: Settings,
      href: `/gallery/settings`,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hurtige handlinger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.title}
              variant="outline"
              className="w-full justify-start h-auto py-3"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-lg ${action.bgColor} shrink-0`}>
                    <Icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-gray-900">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
