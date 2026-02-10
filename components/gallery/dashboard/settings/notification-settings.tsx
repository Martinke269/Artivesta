'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GalleryNotificationSettings } from '@/lib/supabase/gallery-settings-queries'

interface NotificationSettingsProps {
  settings: GalleryNotificationSettings
  onUpdate: (settings: Partial<GalleryNotificationSettings>) => Promise<void>
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleToggle = async (key: keyof GalleryNotificationSettings, value: boolean) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    await onUpdate({ [key]: value })
  }

  const notificationOptions = [
    {
      key: 'new_orders' as const,
      label: 'Nye ordrer',
      description: 'Få besked når der kommer nye ordrer',
    },
    {
      key: 'new_leasing_agreements' as const,
      label: 'Nye leasingaftaler',
      description: 'Få besked når der indgås nye leasingaftaler',
    },
    {
      key: 'expiring_leases' as const,
      label: 'Udløbende leasingaftaler',
      description: 'Få besked når leasingaftaler snart udløber',
    },
    {
      key: 'insurance_warnings' as const,
      label: 'Forsikringsadvarsler',
      description: 'Få besked om forsikringsrelaterede advarsler',
    },
    {
      key: 'new_artists' as const,
      label: 'Nye kunstnere i galleriet',
      description: 'Få besked når nye kunstnere tilføjes',
    },
    {
      key: 'system_notifications' as const,
      label: 'Systemmeddelelser',
      description: 'Få vigtige systemmeddelelser og opdateringer',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifikationer</CardTitle>
        <CardDescription>
          Vælg hvilke notifikationer du vil modtage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor={option.key} className="text-base font-medium">
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
            <Switch
              id={option.key}
              checked={localSettings[option.key]}
              onCheckedChange={(checked) => handleToggle(option.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
