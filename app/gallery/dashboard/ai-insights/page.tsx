import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getPriceSuggestions,
  getNinetyDayDiagnostics,
  getMetadataIssues,
  getBehaviorInsights,
} from '@/lib/supabase/gallery-ai-insights-queries'
import { PriceSuggestionsSection } from '@/components/gallery/dashboard/ai-insights/price-suggestions-section'
import { NinetyDayDiagnosticsSection } from '@/components/gallery/dashboard/ai-insights/ninety-day-diagnostics-section'
import { MetadataIssuesSection } from '@/components/gallery/dashboard/ai-insights/metadata-issues-section'
import { BehaviorInsightsSection } from '@/components/gallery/dashboard/ai-insights/behavior-insights-section'

export const metadata = {
  title: 'AI Insights | Gallery Dashboard',
  description: 'AI-powered insights and recommendations for your gallery',
}

export default async function AIInsightsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's gallery
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, gallery_name')
    .eq('owner_id', user.id)
    .single()

  if (!gallery) {
    redirect('/join/gallery')
  }

  // Fetch all AI insights data
  const [priceSuggestions, ninetyDayDiagnostics, metadataIssues, behaviorInsights] =
    await Promise.all([
      getPriceSuggestions(supabase, gallery.id),
      getNinetyDayDiagnostics(supabase, gallery.id),
      getMetadataIssues(supabase, gallery.id),
      getBehaviorInsights(supabase, gallery.id),
    ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground mt-2">
          AI-drevne anbefalinger og indsigter til at optimere dit galleris performance
        </p>
      </div>

      {/* Price Suggestions Section */}
      <PriceSuggestionsSection suggestions={priceSuggestions} />

      {/* 90-Day Diagnostics Section */}
      <NinetyDayDiagnosticsSection diagnostics={ninetyDayDiagnostics} />

      {/* Metadata Issues Section */}
      <MetadataIssuesSection issues={metadataIssues} />

      {/* Behavior Insights Section */}
      <BehaviorInsightsSection insights={behaviorInsights} />
    </div>
  )
}
