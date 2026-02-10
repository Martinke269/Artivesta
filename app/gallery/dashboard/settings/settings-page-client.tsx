'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import {
  GallerySettings,
  GalleryNotificationSettings,
  GalleryPaymentInfo,
  updateGalleryInfo,
  updateNotificationSettings,
  deleteGallery,
} from '@/lib/supabase/gallery-settings-queries'
import { GalleryInfoForm } from '@/components/gallery/dashboard/settings/gallery-info-form'
import { NotificationSettings } from '@/components/gallery/dashboard/settings/notification-settings'
import { PaymentSettings } from '@/components/gallery/dashboard/settings/payment-settings'
import { SecuritySettings } from '@/components/gallery/dashboard/settings/security-settings'

interface SettingsPageClientProps {
  galleryId: string
  settings: GallerySettings
  notificationSettings: GalleryNotificationSettings
  paymentInfo: GalleryPaymentInfo
  userRole: 'owner' | 'manager' | 'curator' | 'staff'
  userId: string
}

export function SettingsPageClient({
  galleryId,
  settings: initialSettings,
  notificationSettings: initialNotificationSettings,
  paymentInfo,
  userRole,
  userId,
}: SettingsPageClientProps) {
  const [settings, setSettings] = useState(initialSettings)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const isOwner = userRole === 'owner'
  const isOwnerOrManager = userRole === 'owner' || userRole === 'manager'

  const handleUpdateGalleryInfo = async (updates: Partial<GallerySettings>) => {
    try {
      const { data, error } = await updateGalleryInfo(supabase, galleryId, updates)

      if (error) throw error

      if (data) {
        setSettings(data)
      }

      toast({
        title: 'Ændringer gemt',
        description: 'Gallerioplysningerne er blevet opdateret',
      })

      router.refresh()
    } catch (error) {
      console.error('Error updating gallery info:', error)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke gemme ændringer. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateNotifications = async (
    updates: Partial<GalleryNotificationSettings>
  ) => {
    try {
      const { error } = await updateNotificationSettings(supabase, galleryId, userId, updates)

      if (error) throw error

      toast({
        title: 'Notifikationer opdateret',
        description: 'Dine notifikationsindstillinger er blevet gemt',
      })
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke opdatere notifikationer. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteGallery = async () => {
    try {
      const { error } = await deleteGallery(supabase, galleryId)

      if (error) throw error

      toast({
        title: 'Galleri slettet',
        description: 'Dit galleri er blevet permanent slettet',
      })

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Error deleting gallery:', error)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke slette galleriet. Prøv igen.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Indstillinger</h1>
        <p className="text-muted-foreground">
          Administrer dit galleris indstillinger og præferencer
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="info">Gallerioplysninger</TabsTrigger>
          <TabsTrigger value="notifications">Notifikationer</TabsTrigger>
          <TabsTrigger value="payment">Betaling</TabsTrigger>
          <TabsTrigger value="security">Sikkerhed</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <GalleryInfoForm
            settings={settings}
            onUpdate={handleUpdateGalleryInfo}
            isOwnerOrManager={isOwnerOrManager}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            settings={initialNotificationSettings}
            onUpdate={handleUpdateNotifications}
          />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <PaymentSettings paymentInfo={paymentInfo} isOwner={isOwner} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings
            userRole={userRole}
            isOwner={isOwner}
            onDeleteGallery={handleDeleteGallery}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
