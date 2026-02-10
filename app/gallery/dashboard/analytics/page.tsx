import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getAnalyticsStats,
  getViewsOverTime,
  getArtworkPerformance,
  getCategoryBreakdown,
  getFunnelData,
} from '@/lib/supabase/gallery-analytics-queries'
import { AnalyticsPageClient } from './analytics-page-client'

export const metadata = {
  title: 'Analytics | Gallery Dashboard',
  description: 'View performance analytics for your gallery',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is a gallery
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'gallery') {
    redirect('/gallery/dashboard')
  }

  // Fetch all analytics data
  const [stats30, stats90, viewsData30, viewsData90, artworkPerformance, categoryBreakdown, funnelData] =
    await Promise.all([
      getAnalyticsStats(supabase, user.id, 30),
      getAnalyticsStats(supabase, user.id, 90),
      getViewsOverTime(supabase, user.id, 30),
      getViewsOverTime(supabase, user.id, 90),
      getArtworkPerformance(supabase, user.id, 30),
      getCategoryBreakdown(supabase, user.id),
      getFunnelData(supabase, user.id),
    ])

  return (
    <AnalyticsPageClient
      stats30={stats30}
      stats90={stats90}
      viewsData30={viewsData30}
      viewsData90={viewsData90}
      artworkPerformance={artworkPerformance}
      categoryBreakdown={categoryBreakdown}
      funnelData={funnelData}
    />
  )
}
