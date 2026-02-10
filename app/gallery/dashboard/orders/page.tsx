import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { OrdersPageClient } from './orders-page-client'

export const metadata = {
  title: 'Ordrer | Gallery Dashboard',
  description: 'Administrer og følg op på alle ordrer fra dine kunstnere',
}

export default async function OrdersPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Check if user is a gallery owner
  if (profile?.role !== 'gallery_owner') {
    redirect('/gallery/dashboard')
  }

  // Get gallery
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!gallery) {
    redirect('/onboarding/gallery')
  }

  return <OrdersPageClient galleryId={gallery.id} />
}
