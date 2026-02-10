import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { canUploadForGallery, getGalleryArtistsForUpload } from '@/lib/supabase/gallery-upload-queries'
import { UploadArtworkForm } from '@/components/gallery/dashboard/upload-artwork-form'

export default async function GalleryUploadPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's gallery
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, gallery_name, owner_id')
    .eq('owner_id', user.id)
    .single()

  if (!gallery) {
    redirect('/gallery/dashboard')
  }

  // Check permissions
  const hasPermission = await canUploadForGallery(supabase, gallery.id, user.id)

  if (!hasPermission) {
    redirect('/gallery/dashboard')
  }

  // Get gallery artists for dropdown
  const artists = await getGalleryArtistsForUpload(supabase, gallery.id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Kunstværk</h1>
        <p className="text-muted-foreground">
          Tilføj et nyt kunstværk til {gallery.gallery_name}
        </p>
      </div>

      <UploadArtworkForm galleryId={gallery.id} artists={artists} />
    </div>
  )
}
