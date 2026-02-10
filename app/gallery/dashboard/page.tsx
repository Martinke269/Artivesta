import { createClient } from '@/utils/supabase/server'
import { DashboardHeader } from '@/components/gallery/dashboard/dashboard-header'
import { StatsOverview } from '@/components/gallery/dashboard/stats-overview'
import { AIInsightsSnapshot } from '@/components/gallery/dashboard/ai-insights-snapshot'
import { ArtistsList } from '@/components/gallery/dashboard/artists-list'
import { RecentActivity } from '@/components/gallery/dashboard/recent-activity'
import { QuickActions } from '@/components/gallery/dashboard/quick-actions'
import { getGalleryStats, getGalleryArtists, getRecentActivity, getAIInsights } from '@/lib/supabase/gallery-queries'

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
  const [stats, artists, activity, insights] = await Promise.all([
    getGalleryStats(supabase, gallery.id),
    getGalleryArtists(supabase, gallery.id),
    getRecentActivity(supabase, gallery.id),
    getAIInsights(supabase, gallery.id),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader gallery={gallery} />
      
      <div className="mt-8 space-y-8">
        {/* Quick Stats - 4 cards in a row */}
        <StatsOverview stats={stats} />
        
        {/* AI Insights Snapshot - Full width */}
        <AIInsightsSnapshot insights={insights} galleryId={gallery.id} />
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            <RecentActivity activity={activity} />
            <ArtistsList artists={artists} galleryId={gallery.id} />
          </div>
          
          {/* Right column - 1/3 width */}
          <div>
            <QuickActions galleryId={gallery.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
