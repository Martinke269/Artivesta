import { SupabaseClient } from '@supabase/supabase-js'

export interface GalleryArtistOption {
  id: string
  name: string
  email: string
}

/**
 * Get all active artists associated with a gallery for the artist dropdown
 */
export async function getGalleryArtistsForUpload(
  supabase: SupabaseClient,
  galleryId: string
): Promise<GalleryArtistOption[]> {
  // Get artists from gallery_users table where role is not 'owner' or 'manager'
  // These would be the actual artists
  const { data: galleryUsers, error: galleryUsersError } = await supabase
    .from('gallery_users')
    .select(`
      user_id,
      status,
      profiles:user_id (
        id,
        name,
        email,
        role
      )
    `)
    .eq('gallery_id', galleryId)
    .eq('status', 'active')

  if (galleryUsersError || !galleryUsers) {
    console.error('Error fetching gallery users:', galleryUsersError)
    return []
  }

  // Filter to only include users with 'artist' role
  const artists = galleryUsers
    .filter((gu: any) => gu.profiles?.role === 'artist')
    .map((gu: any) => ({
      id: gu.user_id,
      name: gu.profiles?.name || 'Unknown Artist',
      email: gu.profiles?.email || '',
    }))

  return artists
}

/**
 * Check if user has permission to upload artworks for a gallery
 */
export async function canUploadForGallery(
  supabase: SupabaseClient,
  galleryId: string,
  userId: string
): Promise<boolean> {
  // Check if user is gallery owner
  const { data: gallery } = await supabase
    .from('galleries')
    .select('owner_id')
    .eq('id', galleryId)
    .single()

  if (gallery?.owner_id === userId) {
    return true
  }

  // Check if user is gallery team member with appropriate role
  const { data: galleryUser } = await supabase
    .from('gallery_users')
    .select('role, status')
    .eq('gallery_id', galleryId)
    .eq('user_id', userId)
    .single()

  if (galleryUser && galleryUser.status === 'active' && 
      ['owner', 'manager', 'curator'].includes(galleryUser.role)) {
    return true
  }

  return false
}

/**
 * Create artwork metadata validation after upload
 */
export async function validateArtworkMetadata(
  supabase: SupabaseClient,
  galleryId: string,
  artworkId: string
): Promise<{
  hasIssues: boolean
  issues: Array<{
    type: string
    severity: 'critical' | 'warning' | 'info'
    message: string
  }>
}> {
  // Call the database function to validate metadata
  const { error } = await supabase.rpc('validate_gallery_artwork_metadata', {
    p_gallery_id: galleryId,
    p_artwork_id: artworkId,
  })

  if (error) {
    console.error('Error validating artwork metadata:', error)
  }

  // Fetch validation results
  const { data: validations } = await supabase
    .from('gallery_metadata_validations')
    .select('validation_type, severity, message')
    .eq('gallery_id', galleryId)
    .eq('artwork_id', artworkId)
    .order('severity', { ascending: false })

  const issues = validations?.map((v) => ({
    type: v.validation_type,
    severity: v.severity as 'critical' | 'warning' | 'info',
    message: v.message,
  })) || []

  return {
    hasIssues: issues.length > 0,
    issues,
  }
}
