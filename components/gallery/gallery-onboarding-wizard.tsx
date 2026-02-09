'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Upload, 
  CreditCard, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface GalleryOnboardingWizardProps {
  userId: string
  existingGallery: any
}

export default function GalleryOnboardingWizard({ userId, existingGallery }: GalleryOnboardingWizardProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(existingGallery?.onboarding_step || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [galleryId, setGalleryId] = useState(existingGallery?.id || null)

  // Step 1: Gallery Profile
  const [galleryData, setGalleryData] = useState({
    gallery_name: existingGallery?.gallery_name || '',
    address: existingGallery?.address || '',
    city: existingGallery?.city || '',
    postal_code: existingGallery?.postal_code || '',
    country: existingGallery?.country || 'Denmark',
    website: existingGallery?.website || '',
    email: existingGallery?.email || '',
    phone: existingGallery?.phone || '',
    description: existingGallery?.description || '',
    logo_url: existingGallery?.logo_url || '',
  })

  // Step 2: First Artwork
  const [artworkData, setArtworkData] = useState({
    title: '',
    artist_name: '',
    description: '',
    price_cents: '',
    category: 'painting',
    width_cm: '',
    height_cm: '',
    depth_cm: '',
    image_url: '',
  })

  const steps = [
    { number: 1, title: 'Gallery Profile', icon: Building2 },
    { number: 2, title: 'First Artwork', icon: Upload },
    { number: 3, title: 'Connect Stripe', icon: CreditCard },
    { number: 4, title: 'Complete', icon: CheckCircle2 },
  ]

  const progress = (currentStep / steps.length) * 100

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (galleryId) {
        // Update existing gallery
        const { error: updateError } = await supabase
          .from('galleries')
          .update({
            ...galleryData,
            onboarding_step: 2,
          })
          .eq('id', galleryId)

        if (updateError) throw updateError
      } else {
        // Create new gallery
        const { data, error: insertError } = await supabase
          .from('galleries')
          .insert({
            owner_id: userId,
            ...galleryData,
            onboarding_step: 2,
          })
          .select()
          .single()

        if (insertError) throw insertError
        setGalleryId(data.id)
      }

      setCurrentStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create artwork
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .insert({
          artist_id: userId,
          gallery_id: galleryId,
          title: artworkData.title,
          description: artworkData.description,
          price_cents: parseInt(artworkData.price_cents) * 100,
          category: artworkData.category,
          width_cm: artworkData.width_cm ? parseFloat(artworkData.width_cm) : null,
          height_cm: artworkData.height_cm ? parseFloat(artworkData.height_cm) : null,
          depth_cm: artworkData.depth_cm ? parseFloat(artworkData.depth_cm) : null,
          image_url: artworkData.image_url,
          status: 'available',
        })
        .select()
        .single()

      if (artworkError) throw artworkError

      // Link artwork to gallery
      const { error: linkError } = await supabase
        .from('gallery_artworks')
        .insert({
          gallery_id: galleryId,
          artwork_id: artwork.id,
          added_by: userId,
          published: false,
        })

      if (linkError) throw linkError

      // Generate AI insights
      await fetch('/api/gallery/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gallery_id: galleryId,
          artwork_id: artwork.id,
        }),
      })

      // Update gallery onboarding step
      await supabase
        .from('galleries')
        .update({ onboarding_step: 3 })
        .eq('id', galleryId)

      setCurrentStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStripeConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create Stripe Connect account link
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gallery_id: galleryId,
          return_url: `${window.location.origin}/onboarding/gallery?step=4`,
          refresh_url: `${window.location.origin}/onboarding/gallery?step=3`,
        }),
      })

      const { url, error: stripeError } = await response.json()

      if (stripeError) throw new Error(stripeError)

      // Redirect to Stripe
      window.location.href = url
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      // Mark onboarding as complete
      const { error: completeError } = await supabase
        .from('galleries')
        .update({
          onboarding_completed: true,
          onboarding_step: 4,
        })
        .eq('id', galleryId)

      if (completeError) throw completeError

      // Redirect to dashboard
      router.push('/gallery/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Gallery Onboarding</h1>
          <Badge variant="secondary">
            Step {currentStep} of {steps.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex justify-between mt-6">
          {steps.map((step) => {
            const Icon = step.icon
            const isComplete = currentStep > step.number
            const isCurrent = currentStep === step.number
            
            return (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isComplete
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span className={`text-sm text-center ${isCurrent ? 'font-semibold' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Gallery Profile</CardTitle>
            <CardDescription>
              Tell us about your gallery. This information will be visible to potential buyers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gallery_name">Gallery Name *</Label>
                  <Input
                    id="gallery_name"
                    value={galleryData.gallery_name}
                    onChange={(e) => setGalleryData({ ...galleryData, gallery_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={galleryData.email}
                    onChange={(e) => setGalleryData({ ...galleryData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={galleryData.address}
                  onChange={(e) => setGalleryData({ ...galleryData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={galleryData.city}
                    onChange={(e) => setGalleryData({ ...galleryData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={galleryData.postal_code}
                    onChange={(e) => setGalleryData({ ...galleryData, postal_code: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={galleryData.country}
                    onChange={(e) => setGalleryData({ ...galleryData, country: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={galleryData.phone}
                    onChange={(e) => setGalleryData({ ...galleryData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://"
                    value={galleryData.website}
                    onChange={(e) => setGalleryData({ ...galleryData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Tell collectors about your gallery..."
                  value={galleryData.description}
                  onChange={(e) => setGalleryData({ ...galleryData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://"
                  value={galleryData.logo_url}
                  onChange={(e) => setGalleryData({ ...galleryData, logo_url: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Upload your logo to a service like Imgur and paste the URL here
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Upload Your First Artwork
            </CardTitle>
            <CardDescription>
              Add your first artwork to get AI-powered insights and recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleArtworkSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Artwork Title *</Label>
                  <Input
                    id="title"
                    value={artworkData.title}
                    onChange={(e) => setArtworkData({ ...artworkData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artist Name *</Label>
                  <Input
                    id="artist_name"
                    value={artworkData.artist_name}
                    onChange={(e) => setArtworkData({ ...artworkData, artist_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={artworkData.description}
                  onChange={(e) => setArtworkData({ ...artworkData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_cents">Price (DKK) *</Label>
                  <Input
                    id="price_cents"
                    type="number"
                    min="100"
                    value={artworkData.price_cents}
                    onChange={(e) => setArtworkData({ ...artworkData, price_cents: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={artworkData.category}
                    onChange={(e) => setArtworkData({ ...artworkData, category: e.target.value })}
                    required
                  >
                    <option value="painting">Painting</option>
                    <option value="sculpture">Sculpture</option>
                    <option value="photography">Photography</option>
                    <option value="digital_art">Digital Art</option>
                    <option value="mixed_media">Mixed Media</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width_cm">Width (cm)</Label>
                  <Input
                    id="width_cm"
                    type="number"
                    step="0.1"
                    value={artworkData.width_cm}
                    onChange={(e) => setArtworkData({ ...artworkData, width_cm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    step="0.1"
                    value={artworkData.height_cm}
                    onChange={(e) => setArtworkData({ ...artworkData, height_cm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depth_cm">Depth (cm)</Label>
                  <Input
                    id="depth_cm"
                    type="number"
                    step="0.1"
                    value={artworkData.depth_cm}
                    onChange={(e) => setArtworkData({ ...artworkData, depth_cm: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://"
                  value={artworkData.image_url}
                  onChange={(e) => setArtworkData({ ...artworkData, image_url: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500">
                  Upload your artwork image to a service like Imgur and paste the URL here
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Stripe Account</CardTitle>
            <CardDescription>
              Connect Stripe to receive payments. This is required before you can publish artworks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                You'll be redirected to Stripe to complete the setup. This only takes a few minutes.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Secure Payment Processing</p>
                  <p className="text-sm text-gray-600">
                    Stripe handles all payment processing securely
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Automatic Payouts</p>
                  <p className="text-sm text-gray-600">
                    Receive payments directly to your bank account
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">20% Commission</p>
                  <p className="text-sm text-gray-600">
                    Industry-leading rate with transparent pricing
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStripeConnect} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Stripe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Onboarding Complete!
            </CardTitle>
            <CardDescription>
              Your gallery is ready to go. Start publishing artworks and accepting orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Your first artwork has been analyzed by our AI. Check your dashboard for insights!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">What's Next?</h3>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Publish Your Artwork</p>
                  <p className="text-sm text-gray-600">
                    Review AI insights and publish your first artwork
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Upload More Artworks</p>
                  <p className="text-sm text-gray-600">
                    Build your collection and reach more collectors
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Invite Team Members</p>
                  <p className="text-sm text-gray-600">
                    Add managers, curators, and staff to help manage your gallery
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleComplete} className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
