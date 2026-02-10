import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ArtworksPageClient } from './artworks-page-client'

export const metadata = {
  title: 'Værker | Galleri Dashboard',
  description: 'Administrer dine kunstværker',
}

export default async function ArtworksPage() {
  const supabase = await createClient()

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

  return <ArtworksPageClient galleryId={gallery.id} galleryName={gallery.gallery_name} />
}
