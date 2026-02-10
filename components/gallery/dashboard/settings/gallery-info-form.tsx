'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import { GallerySettings } from '@/lib/supabase/gallery-settings-queries'

interface GalleryInfoFormProps {
  settings: GallerySettings
  onUpdate: (updates: Partial<GallerySettings>) => Promise<void>
  isOwnerOrManager: boolean
}

export function GalleryInfoForm({ settings, onUpdate, isOwnerOrManager }: GalleryInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    gallery_name: settings.gallery_name,
    description: settings.description || '',
    address: settings.address,
    city: settings.city,
    postal_code: settings.postal_code,
    country: settings.country,
    website: settings.website || '',
    email: settings.email,
    phone: settings.phone || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwnerOrManager) return

    setIsLoading(true)
    try {
      await onUpdate(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallerioplysninger</CardTitle>
        <CardDescription>
          Grundlæggende information om dit galleri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gallery_name">Gallerinavn *</Label>
              <Input
                id="gallery_name"
                value={formData.gallery_name}
                onChange={(e) => handleChange('gallery_name', e.target.value)}
                disabled={!isOwnerOrManager}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!isOwnerOrManager}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={!isOwnerOrManager}
              rows={4}
              placeholder="Fortæl om dit galleri..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={!isOwnerOrManager}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">By *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                disabled={!isOwnerOrManager}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postnummer *</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                disabled={!isOwnerOrManager}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled={!isOwnerOrManager}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={!isOwnerOrManager}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                disabled={!isOwnerOrManager}
                placeholder="https://..."
              />
            </div>
          </div>

          {isOwnerOrManager && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gem ændringer
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
