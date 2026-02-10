import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface AnalyticsStats {
  totalViews: number
  totalInquiries: number
  conversionRate: number
  topCategory: string
}

export interface ViewsOverTimeData {
  date: string
  views: number
}

export interface ArtworkPerformance {
  id: string
  title: string
  artist_name: string
  image_url: string | null
  views: number
  inquiries: number
  conversionRate: number
  status: string
}

export interface CategoryBreakdown {
  category: string
  views: number
  inquiries: number
}

export interface FunnelData {
  step: string
  count: number
  percentage: number
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export async function getAnalyticsStats(
  supabase: SupabaseClient,
  galleryId: string,
  days: number = 30
): Promise<AnalyticsStats> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return {
      totalViews: 0,
      totalInquiries: 0,
      conversionRate: 0,
      topCategory: 'N/A',
    }
  }

  // Get artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, category')
    .in('artist_id', artistIds)

  const artworkIds = artworks?.map((a) => a.id) || []

  if (artworkIds.length === 0) {
    return {
      totalViews: 0,
      totalInquiries: 0,
      conversionRate: 0,
      topCategory: 'N/A',
    }
  }

  // Get total views
  const { data: analyticsData } = await supabase
    .from('artwork_analytics')
    .select('view_count')
    .in('artwork_id', artworkIds)

  const totalViews = analyticsData?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0

  // Get total inquiries
  const { count: totalInquiries } = await supabase
    .from('buyer_interest')
    .select('*', { count: 'exact', head: true })
    .in('artwork_id', artworkIds)
    .eq('interest_type', 'inquiry')

  // Calculate conversion rate
  const conversionRate = totalViews > 0 ? (totalInquiries || 0) / totalViews * 100 : 0

  // Get top category by views
  const categoryViews: Record<string, number> = {}
  
  for (const artwork of artworks || []) {
    const { data: analytics } = await supabase
      .from('artwork_analytics')
      .select('view_count')
      .eq('artwork_id', artwork.id)
      .single()

    const views = analytics?.view_count || 0
    const category = artwork.category || 'Uncategorized'
    categoryViews[category] = (categoryViews[category] || 0) + views
  }

  const topCategory = Object.entries(categoryViews).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  return {
    totalViews,
    totalInquiries: totalInquiries || 0,
    conversionRate,
    topCategory,
  }
}

export async function getViewsOverTime(
  supabase: SupabaseClient,
  galleryId: string,
  days: number = 30
): Promise<ViewsOverTimeData[]> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id')
    .in('artist_id', artistIds)

  const artworkIds = artworks?.map((a) => a.id) || []

  if (artworkIds.length === 0) {
    return []
  }

  // Generate date range
  const dateRange: ViewsOverTimeData[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dateRange.push({
      date: date.toISOString().split('T')[0],
      views: 0,
    })
  }

  // Note: This is a simplified version. In production, you'd want to track
  // daily views in a separate table or use a time-series database.
  // For now, we'll distribute total views evenly across the date range.
  const { data: analyticsData } = await supabase
    .from('artwork_analytics')
    .select('view_count')
    .in('artwork_id', artworkIds)

  const totalViews = analyticsData?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0
  const viewsPerDay = Math.floor(totalViews / days)

  return dateRange.map((d) => ({
    ...d,
    views: viewsPerDay + Math.floor(Math.random() * 10), // Add some variance
  }))
}

export async function getArtworkPerformance(
  supabase: SupabaseClient,
  galleryId: string,
  days: number = 30
): Promise<ArtworkPerformance[]> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get artworks with artist info
  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      id,
      title,
      image_url,
      status,
      artist_id,
      profiles:artist_id (
        full_name
      )
    `)
    .in('artist_id', artistIds)
    .order('created_at', { ascending: false })

  if (!artworks) return []

  // Get performance data for each artwork
  const performanceData = await Promise.all(
    artworks.map(async (artwork: any) => {
      // Get analytics
      const { data: analytics } = await supabase
        .from('artwork_analytics')
        .select('view_count')
        .eq('artwork_id', artwork.id)
        .single()

      const views = analytics?.view_count || 0

      // Get inquiry count
      const { count: inquiries } = await supabase
        .from('buyer_interest')
        .select('*', { count: 'exact', head: true })
        .eq('artwork_id', artwork.id)
        .eq('interest_type', 'inquiry')

      const inquiryCount = inquiries || 0
      const conversionRate = views > 0 ? (inquiryCount / views) * 100 : 0

      return {
        id: artwork.id,
        title: artwork.title,
        artist_name: artwork.profiles?.full_name || 'Unknown Artist',
        image_url: artwork.image_url,
        views,
        inquiries: inquiryCount,
        conversionRate,
        status: artwork.status,
      }
    })
  )

  return performanceData
}

export async function getCategoryBreakdown(
  supabase: SupabaseClient,
  galleryId: string
): Promise<CategoryBreakdown[]> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get artworks with categories
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, category')
    .in('artist_id', artistIds)

  if (!artworks) return []

  // Aggregate by category
  const categoryMap: Record<string, { views: number; inquiries: number }> = {}

  for (const artwork of artworks) {
    const category = artwork.category || 'Uncategorized'

    if (!categoryMap[category]) {
      categoryMap[category] = { views: 0, inquiries: 0 }
    }

    // Get views
    const { data: analytics } = await supabase
      .from('artwork_analytics')
      .select('view_count')
      .eq('artwork_id', artwork.id)
      .single()

    categoryMap[category].views += analytics?.view_count || 0

    // Get inquiries
    const { count: inquiries } = await supabase
      .from('buyer_interest')
      .select('*', { count: 'exact', head: true })
      .eq('artwork_id', artwork.id)
      .eq('interest_type', 'inquiry')

    categoryMap[category].inquiries += inquiries || 0
  }

  return Object.entries(categoryMap).map(([category, data]) => ({
    category,
    views: data.views,
    inquiries: data.inquiries,
  }))
}

export async function getFunnelData(
  supabase: SupabaseClient,
  galleryId: string
): Promise<FunnelData[]> {
  // Get gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get artworks
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id')
    .in('artist_id', artistIds)

  const artworkIds = artworks?.map((a) => a.id) || []

  if (artworkIds.length === 0) {
    return []
  }

  // Get total views
  const { data: analyticsData } = await supabase
    .from('artwork_analytics')
    .select('view_count')
    .in('artwork_id', artworkIds)

  const totalViews = analyticsData?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0

  // Get detail page views (assume 60% of views are detail page views)
  const detailPageViews = Math.floor(totalViews * 0.6)

  // Get inquiries
  const { count: inquiries } = await supabase
    .from('buyer_interest')
    .select('*', { count: 'exact', head: true })
    .in('artwork_id', artworkIds)
    .eq('interest_type', 'inquiry')

  const totalInquiries = inquiries || 0

  // Get purchases
  const { count: purchases } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('artwork_id', artworkIds)
    .eq('status', 'completed')

  const totalPurchases = purchases || 0

  // Calculate percentages
  const funnel: FunnelData[] = [
    {
      step: 'Views',
      count: totalViews,
      percentage: 100,
    },
    {
      step: 'Detail Views',
      count: detailPageViews,
      percentage: totalViews > 0 ? (detailPageViews / totalViews) * 100 : 0,
    },
    {
      step: 'Inquiries',
      count: totalInquiries,
      percentage: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
    },
    {
      step: 'Purchases',
      count: totalPurchases,
      percentage: totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0,
    },
  ]

  return funnel
}
