import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function GalleryDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user has a gallery profile
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, name, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  if (!gallery) {
    redirect('/join/gallery')
  }

  if (!gallery.onboarding_completed) {
    redirect('/onboarding/gallery')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
