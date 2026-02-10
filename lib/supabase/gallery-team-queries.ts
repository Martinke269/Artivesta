import { SupabaseClient } from '@supabase/supabase-js'

// Types
export interface TeamMember {
  id: string
  gallery_id: string
  user_id: string
  role: 'owner' | 'manager' | 'curator' | 'staff'
  status: 'pending' | 'active' | 'inactive'
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  created_at: string
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
  invited_by_user: {
    full_name: string | null
    email: string
  } | null
}

export interface GalleryArtist {
  id: string
  artist_id: string
  gallery_id: string
  status: 'active' | 'invited' | 'inactive'
  artwork_count: number
  artist: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface TeamSummary {
  total_members: number
  active_members: number
  pending_invitations: number
  total_artists: number
  active_artists: number
}

/**
 * Get all team members for a gallery
 */
export async function getGalleryTeamMembers(
  supabase: SupabaseClient,
  galleryId: string
) {
  const { data, error } = await supabase
    .from('gallery_users')
    .select(`
      *,
      user:profiles!gallery_users_user_id_fkey(
        id,
        email,
        full_name,
        avatar_url
      ),
      invited_by_user:profiles!gallery_users_invited_by_fkey(
        full_name,
        email
      )
    `)
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false })

  return { data: data as TeamMember[] | null, error }
}

/**
 * Get all artists associated with a gallery
 */
export async function getGalleryArtistsWithDetails(
  supabase: SupabaseClient,
  galleryId: string
) {
  // Get unique artists from gallery_artworks
  const { data, error } = await supabase
    .from('gallery_artworks')
    .select(`
      id,
      gallery_id,
      artwork:artworks!inner(
        artist_id,
        artist:profiles!artworks_artist_id_fkey(
          id,
          email,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('gallery_id', galleryId)

  if (error) return { data: null, error }

  // Group by artist and count artworks
  const artistMap = new Map<string, GalleryArtist>()
  
  data?.forEach((item: any) => {
    const artistId = item.artwork.artist_id
    const artist = item.artwork.artist
    
    if (artistMap.has(artistId)) {
      const existing = artistMap.get(artistId)!
      existing.artwork_count++
    } else {
      artistMap.set(artistId, {
        id: item.id,
        artist_id: artistId,
        gallery_id: item.gallery_id,
        status: 'active',
        artwork_count: 1,
        artist: {
          id: artist.id,
          email: artist.email,
          full_name: artist.full_name,
          avatar_url: artist.avatar_url,
        },
      })
    }
  })

  return { data: Array.from(artistMap.values()), error: null }
}

/**
 * Get team summary statistics
 */
export async function getTeamSummary(
  supabase: SupabaseClient,
  galleryId: string
) {
  // Get team members count
  const { data: members, error: membersError } = await supabase
    .from('gallery_users')
    .select('id, status', { count: 'exact' })
    .eq('gallery_id', galleryId)

  if (membersError) return { data: null, error: membersError }

  const totalMembers = members?.length || 0
  const activeMembers = members?.filter((m) => m.status === 'active').length || 0
  const pendingInvitations = members?.filter((m) => m.status === 'pending').length || 0

  // Get unique artists count
  const { data: artworks, error: artworksError } = await supabase
    .from('gallery_artworks')
    .select('artwork:artworks!inner(artist_id)')
    .eq('gallery_id', galleryId)

  if (artworksError) return { data: null, error: artworksError }

  const uniqueArtists = new Set(
    artworks?.map((a: any) => a.artwork.artist_id) || []
  )

  const summary: TeamSummary = {
    total_members: totalMembers,
    active_members: activeMembers,
    pending_invitations: pendingInvitations,
    total_artists: uniqueArtists.size,
    active_artists: uniqueArtists.size, // All are considered active for now
  }

  return { data: summary, error: null }
}

/**
 * Invite a team member
 */
export async function inviteTeamMember(
  supabase: SupabaseClient,
  galleryId: string,
  email: string,
  role: 'manager' | 'curator' | 'staff',
  invitedBy: string
) {
  // First check if user exists
  const { data: existingUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (userError && userError.code !== 'PGRST116') {
    return { data: null, error: userError }
  }

  // If user doesn't exist, we'll need to create an invitation record
  // For now, we'll just return an error
  if (!existingUser) {
    return {
      data: null,
      error: new Error('User not found. They need to sign up first.'),
    }
  }

  // Check if already a member
  const { data: existing, error: existingError } = await supabase
    .from('gallery_users')
    .select('id')
    .eq('gallery_id', galleryId)
    .eq('user_id', existingUser.id)
    .single()

  if (existing) {
    return {
      data: null,
      error: new Error('User is already a team member'),
    }
  }

  // Create invitation
  const { data, error } = await supabase
    .from('gallery_users')
    .insert({
      gallery_id: galleryId,
      user_id: existingUser.id,
      role,
      invited_by: invitedBy,
      status: 'pending',
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  supabase: SupabaseClient,
  memberId: string,
  role: 'manager' | 'curator' | 'staff'
) {
  const { data, error } = await supabase
    .from('gallery_users')
    .update({ role })
    .eq('id', memberId)
    .select()
    .single()

  return { data, error }
}

/**
 * Remove team member
 */
export async function removeTeamMember(
  supabase: SupabaseClient,
  memberId: string
) {
  const { error } = await supabase
    .from('gallery_users')
    .delete()
    .eq('id', memberId)

  return { error }
}

/**
 * Cancel invitation
 */
export async function cancelInvitation(
  supabase: SupabaseClient,
  memberId: string
) {
  const { error } = await supabase
    .from('gallery_users')
    .delete()
    .eq('id', memberId)
    .eq('status', 'pending')

  return { error }
}

/**
 * Remove artist from gallery
 */
export async function removeArtistFromGallery(
  supabase: SupabaseClient,
  galleryId: string,
  artistId: string
) {
  // First get all artwork IDs by this artist
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('id')
    .eq('artist_id', artistId)

  if (artworksError) return { error: artworksError }

  const artworkIds = artworks?.map((a) => a.id) || []

  if (artworkIds.length === 0) {
    return { error: null }
  }

  // Remove all artworks by this artist from the gallery
  const { error } = await supabase
    .from('gallery_artworks')
    .delete()
    .eq('gallery_id', galleryId)
    .in('artwork_id', artworkIds)

  return { error }
}

/**
 * Check user's role in gallery
 */
export async function getUserGalleryRole(
  supabase: SupabaseClient,
  galleryId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('gallery_users')
    .select('role, status')
    .eq('gallery_id', galleryId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  return { data, error }
}
