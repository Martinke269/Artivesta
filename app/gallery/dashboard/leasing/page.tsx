import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getGalleryLeases,
  getGalleryArtists,
} from '@/lib/supabase/gallery-leasing-queries'
import { LeasingPageClient } from './leasing-page-client'

export const metadata = {
  title: 'Leasing | Gallery Dashboard',
  description: 'Administrer kunstværk leasingaftaler',
}

export default async function LeasingPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get gallery profile
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (galleryError || !gallery) {
    redirect('/join/gallery')
  }

  // Fetch leasing data
  const { data: leases, error: leasesError } = await getGalleryLeases(
    supabase,
    gallery.id
  )

  if (leasesError) {
    console.error('Error fetching leases:', leasesError)
  }

  // Fetch artists for filter
  const { data: artists, error: artistsError } = await getGalleryArtists(
    supabase,
    gallery.id
  )

  if (artistsError) {
    console.error('Error fetching artists:', artistsError)
  }

  return (
    <LeasingPageClient
      initialLeases={leases || []}
      galleryId={gallery.id}
      artists={artists || []}
    />
  )
}
