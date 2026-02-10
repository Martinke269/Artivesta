import { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface PriceSuggestion {
  id: string
  artwork_id: string
  artwork_title: string
  artwork_image_url: string | null
  artist_name: string
  current_price_cents: number
  suggested_price_cents: number
  confidence_score: number
  price_badge: 'underpriced' | 'fair' | 'overpriced'
  market_deviation_percentage: number
  created_at: string
}

export interface NinetyDayDiagnostic {
  id: string
  artwork_id: string
  artwork_title: string
  artwork_image_url: string | null
  artist_name: string
  days_active: number
  view_count: number
  inquiry_count: number
  price_cents: number
  diagnosis: string[]
  recommendations: string[]
  created_at: string
}

export interface MetadataIssue {
  id: string
  artwork_id: string
  artwork_title: string
  artwork_image_url: string | null
  artist_name: string
  validation_type: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  auto_fixed: boolean
  created_at: string
}

export interface BehaviorInsight {
  id: string
  insight_type: 'opportunity' | 'warning' | 'trend' | 'recommendation'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  affected_artworks: number
  action_suggestions: string[]
  metadata: Record<string, any>
  created_at: string
}

// ============================================================================
// PRICE SUGGESTIONS
// ============================================================================

export async function getPriceSuggestions(
  supabase: SupabaseClient,
  galleryId: string
): Promise<PriceSuggestion[]> {
  // Get gallery's artist IDs
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get artworks for the gallery
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id')
    .in('artist_id', artistIds)

  const artworkIds = artworks?.map((a) => a.id) || []

  if (artworkIds.length === 0) {
    return []
  }

  // Get price evaluations for gallery artworks
  const { data: evaluations } = await supabase
    .from('price_evaluations')
    .select(`
      id,
      artwork_id,
      current_price_cents,
      suggested_price_cents,
      confidence_score,
      market_deviation_percentage,
      price_badge,
      created_at,
      artworks:artwork_id (
        id,
        title,
        image_url,
        artist_id,
        profiles:artist_id (
          full_name
        )
      )
    `)
    .in('artwork_id', artworkIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!evaluations) return []

  return evaluations
    .filter((e: any) => e.artworks && artistIds.includes(e.artworks.artist_id))
    .map((e: any) => ({
      id: e.id,
      artwork_id: e.artwork_id,
      artwork_title: e.artworks?.title || 'Unknown',
      artwork_image_url: e.artworks?.image_url,
      artist_name: e.artworks?.profiles?.full_name || 'Unknown Artist',
      current_price_cents: e.current_price_cents,
      suggested_price_cents: e.suggested_price_cents,
      confidence_score: e.confidence_score,
      price_badge: e.price_badge,
      market_deviation_percentage: e.market_deviation_percentage,
      created_at: e.created_at,
    }))
}

// ============================================================================
// 90-DAY DIAGNOSTICS
// ============================================================================

export async function getNinetyDayDiagnostics(
  supabase: SupabaseClient,
  galleryId: string
): Promise<NinetyDayDiagnostic[]> {
  // Get gallery's artist IDs
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get AI diagnostics for gallery artworks
  const { data: diagnostics } = await supabase
    .from('ai_diagnostics')
    .select(`
      id,
      artwork_id,
      days_active,
      view_count,
      inquiry_count,
      price_level,
      recommendations,
      created_at,
      artworks:artwork_id (
        id,
        title,
        image_url,
        price_cents,
        artist_id,
        profiles:artist_id (
          full_name
        )
      )
    `)
    .gte('days_active', 90)
    .order('days_active', { ascending: false })

  if (!diagnostics) return []

  return diagnostics
    .filter((d: any) => d.artworks && artistIds.includes(d.artworks.artist_id))
    .map((d: any) => {
      const diagnosis: string[] = []
      const recommendations: string[] = []

      // Generate diagnosis based on metrics
      if (d.view_count < 10) {
        diagnosis.push('Lav synlighed')
        recommendations.push('Forbedre SEO metadata og tags')
      }

      if (d.inquiry_count === 0) {
        diagnosis.push('Ingen forespørgsler')
        recommendations.push('Overvej prisjustering eller bedre beskrivelse')
      }

      if (d.price_level === 'very_high') {
        diagnosis.push('Høj pris i forhold til marked')
        recommendations.push('Analyser konkurrerende værker i samme kategori')
      }

      if (d.view_count > 50 && d.inquiry_count === 0) {
        diagnosis.push('Høj interesse men ingen konvertering')
        recommendations.push('Prisen kan være for høj eller beskrivelsen uklar')
      }

      // Add recommendations from database if available
      if (d.recommendations && Array.isArray(d.recommendations)) {
        recommendations.push(...d.recommendations)
      }

      return {
        id: d.id,
        artwork_id: d.artwork_id,
        artwork_title: d.artworks?.title || 'Unknown',
        artwork_image_url: d.artworks?.image_url,
        artist_name: d.artworks?.profiles?.full_name || 'Unknown Artist',
        days_active: d.days_active,
        view_count: d.view_count,
        inquiry_count: d.inquiry_count,
        price_cents: d.artworks?.price_cents || 0,
        diagnosis: diagnosis.length > 0 ? diagnosis : ['Ingen specifikke problemer identificeret'],
        recommendations: recommendations.length > 0 ? recommendations : ['Fortsæt med at promovere værket'],
        created_at: d.created_at,
      }
    })
}

// ============================================================================
// METADATA ISSUES
// ============================================================================

export async function getMetadataIssues(
  supabase: SupabaseClient,
  galleryId: string
): Promise<MetadataIssue[]> {
  // Get metadata validations for gallery
  const { data: validations } = await supabase
    .from('gallery_metadata_validations')
    .select(`
      id,
      artwork_id,
      validation_type,
      severity,
      message,
      auto_fixed,
      created_at,
      artworks:artwork_id (
        id,
        title,
        image_url,
        artist_id,
        profiles:artist_id (
          full_name
        )
      )
    `)
    .eq('gallery_id', galleryId)
    .order('severity', { ascending: true })
    .order('created_at', { ascending: false })

  if (!validations) return []

  return validations.map((v: any) => ({
    id: v.id,
    artwork_id: v.artwork_id,
    artwork_title: v.artworks?.title || 'Unknown',
    artwork_image_url: v.artworks?.image_url,
    artist_name: v.artworks?.profiles?.full_name || 'Unknown Artist',
    validation_type: v.validation_type,
    severity: v.severity,
    message: v.message,
    auto_fixed: v.auto_fixed,
    created_at: v.created_at,
  }))
}

export async function getMetadataIssuesSummary(
  supabase: SupabaseClient,
  galleryId: string
): Promise<{ type: string; count: number; severity: string }[]> {
  const { data: summary } = await supabase
    .from('gallery_metadata_validations')
    .select('validation_type, severity')
    .eq('gallery_id', galleryId)

  if (!summary) return []

  // Group by validation type and severity
  const grouped = summary.reduce((acc: any, item: any) => {
    const key = `${item.validation_type}-${item.severity}`
    if (!acc[key]) {
      acc[key] = {
        type: item.validation_type,
        severity: item.severity,
        count: 0,
      }
    }
    acc[key].count++
    return acc
  }, {})

  return Object.values(grouped)
}

// ============================================================================
// BEHAVIOR INSIGHTS
// ============================================================================

export async function getBehaviorInsights(
  supabase: SupabaseClient,
  galleryId: string
): Promise<BehaviorInsight[]> {
  const insights: BehaviorInsight[] = []

  // Get gallery's artist IDs
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  if (artistIds.length === 0) {
    return []
  }

  // Get artworks for the gallery
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id, title, price_cents, category, created_at')
    .in('artist_id', artistIds)

  if (!artworks || artworks.length === 0) {
    return []
  }

  const artworkIds = artworks.map((a) => a.id)

  // 1. Check for high buyer interest
  const { data: highInterest } = await supabase
    .from('buyer_interest')
    .select('artwork_id, interest_type')
    .in('artwork_id', artworkIds)
    .eq('interest_type', 'inquiry')

  if (highInterest && highInterest.length > 0) {
    const artworkInterestMap = highInterest.reduce((acc: any, item: any) => {
      acc[item.artwork_id] = (acc[item.artwork_id] || 0) + 1
      return acc
    }, {})

    const highInterestArtworks = Object.entries(artworkInterestMap)
      .filter(([_, count]) => (count as number) >= 3)
      .map(([artworkId]) => artworkId)

    if (highInterestArtworks.length > 0) {
      insights.push({
        id: 'high-buyer-interest',
        insight_type: 'opportunity',
        priority: 'high',
        title: 'Høj køberinteresse',
        description: `${highInterestArtworks.length} værk${highInterestArtworks.length > 1 ? 'er' : ''} har modtaget flere forespørgsler. Dette er stærke salgsmuligheder.`,
        affected_artworks: highInterestArtworks.length,
        action_suggestions: [
          'Følg op på forespørgsler inden for 24 timer',
          'Overvej at fremhæve disse værker i markedsføring',
        ],
        metadata: { artwork_ids: highInterestArtworks },
        created_at: new Date().toISOString(),
      })
    }
  }

  // 2. Check for price history patterns
  const { data: priceChanges } = await supabase
    .from('price_history')
    .select('artwork_id, old_price_cents, new_price_cents, created_at')
    .in('artwork_id', artworkIds)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (priceChanges && priceChanges.length > 5) {
    insights.push({
      id: 'frequent-price-changes',
      insight_type: 'warning',
      priority: 'medium',
      title: 'Hyppige prisændringer',
      description: `${priceChanges.length} prisændringer i de sidste 30 dage. Hyppige ændringer kan signalere usikkerhed til købere.`,
      affected_artworks: new Set(priceChanges.map((p: any) => p.artwork_id)).size,
      action_suggestions: [
        'Brug AI-prisforslag til at finde den rigtige pris første gang',
        'Lad priser være stabile i mindst 60 dage',
      ],
      metadata: { price_changes_count: priceChanges.length },
      created_at: new Date().toISOString(),
    })
  }

  // 3. Check for unusual removals
  const { data: unusualRemovals } = await supabase
    .from('artwork_removal_events')
    .select('artwork_id, days_active, view_count')
    .in('artist_id', artistIds)
    .eq('unusual_removal', true)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

  if (unusualRemovals && unusualRemovals.length > 0) {
    insights.push({
      id: 'unusual-removals',
      insight_type: 'warning',
      priority: 'medium',
      title: 'Værker fjernet uden salg',
      description: `${unusualRemovals.length} værk${unusualRemovals.length > 1 ? 'er' : ''} er blevet fjernet uden at blive solgt i de sidste 90 dage.`,
      affected_artworks: unusualRemovals.length,
      action_suggestions: [
        'Analyser hvorfor værker fjernes før salg',
        'Overvej at justere priser før fjernelse',
      ],
      metadata: { removal_count: unusualRemovals.length },
      created_at: new Date().toISOString(),
    })
  }

  // 4. Check for trending categories
  const categoryCount = artworks.reduce((acc: any, artwork: any) => {
    acc[artwork.category] = (acc[artwork.category] || 0) + 1
    return acc
  }, {})

  const topCategory = Object.entries(categoryCount).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  )[0]

  if (topCategory && (topCategory[1] as number) >= 3) {
    insights.push({
      id: 'trending-category',
      insight_type: 'trend',
      priority: 'low',
      title: 'Populær kategori',
      description: `${topCategory[0]} er din mest repræsenterede kategori med ${topCategory[1]} værker.`,
      affected_artworks: topCategory[1] as number,
      action_suggestions: [
        'Fremhæv denne kategori i din markedsføring',
        'Overvej at udvide med flere kunstnere i denne kategori',
      ],
      metadata: { category: topCategory[0], count: topCategory[1] },
      created_at: new Date().toISOString(),
    })
  }

  // 5. Check view-to-inquiry ratio
  const { data: analytics } = await supabase
    .from('artwork_analytics')
    .select('artwork_id, view_count')
    .in('artwork_id', artworkIds)
    .gte('view_count', 20)

  if (analytics && analytics.length > 0) {
    const lowConversionArtworks = []

    for (const analytic of analytics) {
      const { count: inquiryCount } = await supabase
        .from('buyer_interest')
        .select('*', { count: 'exact', head: true })
        .eq('artwork_id', analytic.artwork_id)
        .eq('interest_type', 'inquiry')

      const conversionRate = (inquiryCount || 0) / analytic.view_count

      if (conversionRate < 0.05) {
        // Less than 5% conversion
        lowConversionArtworks.push(analytic.artwork_id)
      }
    }

    if (lowConversionArtworks.length > 0) {
      insights.push({
        id: 'low-conversion-rate',
        insight_type: 'recommendation',
        priority: 'medium',
        title: 'Lav konverteringsrate',
        description: `${lowConversionArtworks.length} værk${lowConversionArtworks.length > 1 ? 'er' : ''} har mange visninger men få forespørgsler.`,
        affected_artworks: lowConversionArtworks.length,
        action_suggestions: [
          'Forbedre beskrivelser og billeder',
          'Overvej prisjustering',
          'Tilføj mere kontekst om kunstneren',
        ],
        metadata: { artwork_ids: lowConversionArtworks },
        created_at: new Date().toISOString(),
      })
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return insights
}

// ============================================================================
// APPLY PRICE SUGGESTION
// ============================================================================

export async function applyPriceSuggestion(
  supabase: SupabaseClient,
  artworkId: string,
  suggestedPriceCents: number
): Promise<void> {
  const { error } = await supabase
    .from('artworks')
    .update({ price_cents: suggestedPriceCents })
    .eq('id', artworkId)

  if (error) throw error
}
