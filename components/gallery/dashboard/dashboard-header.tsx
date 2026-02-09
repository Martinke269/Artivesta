import { Building2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardHeaderProps {
  gallery: {
    id: string
    name: string
    description?: string
  }
}

export function DashboardHeader({ gallery }: DashboardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{gallery.name}</h1>
          {gallery.description && (
            <p className="mt-1 text-gray-600">{gallery.description}</p>
          )}
        </div>
      </div>
      
      <Button variant="outline" asChild>
        <Link href="/gallery/settings">
          <Settings className="mr-2 h-4 w-4" />
          Indstillinger
        </Link>
      </Button>
    </div>
  )
}
