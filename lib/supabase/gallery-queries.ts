import { SupabaseClient } from '@supabase/supabase-js'

export interface GalleryStats {
  totalArtists: number
  totalArtworks: number
  totalSales: number
  totalRevenue: number
  pendingInvitations: number
  activeListings: number
}

export interface GalleryArtist {
  id: string
  name: string
  email: string
  artworks_count: number
  total_sales: number
  joined_at: string
  status: 'active' | 'pending' | 'inactive'
}

export interface ActivityItem {
  id: string
  type: 'artist_joined' | 'artwork_added' | 'sale_completed' | 'invitation_sent'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export async function getGalleryStats(
  supabase: SupabaseClient,
  galleryId: string
): Promise<GalleryStats> {
  // Get total artists
  const { count: totalArtists } = await supabase
    .from('gallery_artists')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  // Get pending invitations
  const { count: pendingInvitations } = await supabase
    .from('gallery_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', galleryId)
    .eq('status', 'pending')

  // Get artworks from gallery artists
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select('artist_id')
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  const artistIds = galleryArtists?.map((ga) => ga.artist_id) || []

  let totalArtworks = 0
  let activeListings = 0

  if (artistIds.length > 0) {
    const { count: artworksCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .in('artist_id', artistIds)

    const { count: activeCount } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .in('artist_id', artistIds)
      .eq('status', 'available')

    totalArtworks = artworksCount || 0
    activeListings = activeCount || 0
  }

  // Get sales data
  const { data: salesData } = await supabase
    .from('orders')
    .select('total_amount')
    .in('artwork_id', artistIds.length > 0 ? artistIds : [])
    .eq('status', 'completed')

  const totalSales = salesData?.length || 0
  const totalRevenue = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  return {
    totalArtists: totalArtists || 0,
    totalArtworks,
    totalSales,
    totalRevenue,
    pendingInvitations: pendingInvitations || 0,
    activeListings,
  }
}

export async function getGalleryArtists(
  supabase: SupabaseClient,
  galleryId: string
): Promise<GalleryArtist[]> {
  const { data: galleryArtists } = await supabase
    .from('gallery_artists')
    .select(`
      artist_id,
      status,
      joined_at,
      profiles:artist_id (
        id,
        full_name,
        email
      )
    `)
    .eq('gallery_id', galleryId)
    .order('joined_at', { ascending: false })

  if (!galleryArtists) return []

  // Get artwork counts and sales for each artist
  const artistsWithStats = await Promise.all(
    galleryArtists.map(async (ga: any) => {
      const { count: artworksCount } = await supabase
        .from('artworks')
        .select('*', { count: 'exact', head: true })
        .eq('artist_id', ga.artist_id)

      const { data: salesData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('artist_id', ga.artist_id)
        .eq('status', 'completed')

      const totalSales = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      return {
        id: ga.artist_id,
        name: ga.profiles?.full_name || 'Unknown Artist',
        email: ga.profiles?.email || '',
        artworks_count: artworksCount || 0,
        total_sales: totalSales,
        joined_at: ga.joined_at,
        status: ga.status,
      }
    })
  )

  return artistsWithStats
}

export async function getRecentActivity(
  supabase: SupabaseClient,
  galleryId: string
): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = []

  // Get recent artist joins
  const { data: recentJoins } = await supabase
    .from('gallery_artists')
    .select(`
      artist_id,
      joined_at,
      profiles:artist_id (
        full_name
      )
    `)
    .eq('gallery_id', galleryId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(5)

  recentJoins?.forEach((join: any) => {
    activities.push({
      id: `join-${join.artist_id}`,
      type: 'artist_joined',
      description: `${join.profiles?.full_name || 'An artist'} joined the gallery`,
      timestamp: join.joined_at,
    })
  })

  // Get recent invitations
  const { data: recentInvites } = await supabase
    .from('gallery_invitations')
    .select('id, email, created_at')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false })
    .limit(5)

  recentInvites?.forEach((invite) => {
    activities.push({
      id: `invite-${invite.id}`,
      type: 'invitation_sent',
      description: `Invitation sent to ${invite.email}`,
      timestamp: invite.created_at,
    })
  })

  // Sort all activities by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return activities.slice(0, 10)
}
