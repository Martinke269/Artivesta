import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { TeamPageClient } from './team-page-client'

export const metadata = {
  title: 'Team | Galleri Dashboard',
  description: 'Administrer dit galleri team og kunstnere',
}

export default async function TeamPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's gallery
  const { data: galleryUser, error: galleryError } = await supabase
    .from('gallery_users')
    .select('gallery_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (galleryError || !galleryUser) {
    redirect('/gallery/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          Administrer teammedlemmer, roller og tilknyttede kunstnere
        </p>
      </div>

      <TeamPageClient galleryId={galleryUser.gallery_id} userId={user.id} />
    </div>
  )
}
