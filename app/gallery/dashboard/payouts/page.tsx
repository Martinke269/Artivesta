import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PayoutsPageClient } from './payouts-page-client'

export const metadata = {
  title: 'Payouts | Gallery Dashboard',
  description: 'Manage your gallery payouts and view payment history',
} as const

export default async function PayoutsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground">
          Administrer udbetalinger og se betalingshistorik
        </p>
      </div>

      <PayoutsPageClient galleryId={gallery.id} />
    </div>
  )
}
