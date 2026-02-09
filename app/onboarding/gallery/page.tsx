import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import GalleryOnboardingWizard from '@/components/gallery/gallery-onboarding-wizard'

export const metadata = {
  title: 'Gallery Onboarding | ArtIsSafe',
  description: 'Complete your gallery setup',
}

export default async function GalleryOnboardingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'gallery_owner') {
    redirect('/')
  }

  // Check if gallery already exists
  const { data: existingGallery } = await supabase
    .from('galleries')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // If gallery is complete, redirect to dashboard
  if (existingGallery?.onboarding_completed) {
    redirect('/gallery/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <GalleryOnboardingWizard 
          userId={user.id}
          existingGallery={existingGallery}
        />
      </div>
    </div>
  )
}
