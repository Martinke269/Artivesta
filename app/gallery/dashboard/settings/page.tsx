import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getGallerySettings,
  getNotificationSettings,
  getGalleryPaymentInfo,
} from '@/lib/supabase/gallery-settings-queries'
import { getUserGalleryRole } from '@/lib/supabase/gallery-team-queries'
import { SettingsPageClient } from './settings-page-client'

export const metadata = {
  title: 'Indstillinger | Galleri Dashboard',
  description: 'Administrer dit galleris indstillinger og præferencer',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's gallery
  let galleryId: string

  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (gallery) {
    galleryId = gallery.id
  } else {
    // Check if user is a team member
    const { data: teamMember } = await supabase
      .from('gallery_users')
      .select('gallery_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!teamMember) {
      redirect('/gallery/dashboard')
    }

    galleryId = teamMember.gallery_id
  }

  // Get user's role
  const { data: roleData } = await getUserGalleryRole(supabase, galleryId, user.id)
  const userRole = roleData?.role || 'staff'

  // Get gallery settings
  const { data: settings, error: settingsError } = await getGallerySettings(
    supabase,
    galleryId
  )

  if (settingsError || !settings) {
    console.error('Error fetching gallery settings:', settingsError)
    redirect('/gallery/dashboard')
  }

  // Get notification settings
  const { data: notificationSettings } = await getNotificationSettings(
    supabase,
    galleryId,
    user.id
  )

  // Get payment info
  const { data: paymentInfo } = await getGalleryPaymentInfo(supabase, galleryId)

  return (
    <SettingsPageClient
      galleryId={galleryId}
      settings={settings}
      notificationSettings={
        notificationSettings || {
          new_orders: true,
          new_leasing_agreements: true,
          expiring_leases: true,
          insurance_warnings: true,
          new_artists: true,
          system_notifications: true,
        }
      }
      paymentInfo={
        paymentInfo || {
          stripe_account_id: null,
          stripe_onboarding_complete: false,
          last_payout_date: null,
          last_payout_amount: null,
          payout_frequency: 'monthly',
          commission_percentage: 20,
        }
      }
      userRole={userRole}
      userId={user.id}
    />
  )
}
