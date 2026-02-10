import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getGalleryLeases } from '@/lib/supabase/gallery-leasing-queries'
import { getGalleryArtists } from '@/lib/supabase/gallery-queries'
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
  const leases = await getGalleryLeases(gallery.id)

  // Fetch artists for filter
  const artists = await getGalleryArtists(supabase, gallery.id)

  return (
    <LeasingPageClient
      initialLeases={leases || []}
      galleryId={gallery.id}
      artists={artists || []}
    />
  )
}
