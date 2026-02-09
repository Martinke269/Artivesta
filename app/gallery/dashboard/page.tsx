import { createClient } from '@/utils/supabase/server'
import { DashboardHeader } from '@/components/gallery/dashboard/dashboard-header'
import { StatsOverview } from '@/components/gallery/dashboard/stats-overview'
import { ArtistsList } from '@/components/gallery/dashboard/artists-list'
import { RecentActivity } from '@/components/gallery/dashboard/recent-activity'
import { QuickActions } from '@/components/gallery/dashboard/quick-actions'
import { getGalleryStats, getGalleryArtists, getRecentActivity } from '@/lib/supabase/gallery-queries'

export default async function GalleryDashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch gallery data
  const { data: gallery } = await supabase
    .from('galleries')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!gallery) {
    return null
  }

  // Fetch dashboard data in parallel
  const [stats, artists, activity] = await Promise.all([
    getGalleryStats(supabase, gallery.id),
    getGalleryArtists(supabase, gallery.id),
    getRecentActivity(supabase, gallery.id),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader gallery={gallery} />
      
      <div className="mt-8 space-y-8">
        <StatsOverview stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ArtistsList artists={artists} galleryId={gallery.id} />
            <RecentActivity activity={activity} />
          </div>
          
          <div>
            <QuickActions galleryId={gallery.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
