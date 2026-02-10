'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, X, Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ARTWORK_CATEGORIES, getArtTypesForCategory, getDimensionFields } from '@/lib/artwork-constants'
import type { GalleryArtistOption } from '@/lib/supabase/gallery-upload-queries'

interface UploadArtworkFormProps {
  galleryId: string
  artists: GalleryArtistOption[]
}

interface PricingRecommendation {
  recommended_price_cents: number
  confidence_score: number
  price_range: {
    min_cents: number
    max_cents: number
  }
  market_position: 'underpriced' | 'fair' | 'overpriced'
}

interface MetadataIssue {
  type: string
  severity: 'critical' | 'warning' | 'info'
  message: string
}

export function UploadArtworkForm({ galleryId, artists }: UploadArtworkFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isGettingPricing, setIsGettingPricing] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [artistId, setArtistId] = useState('')
  const [category, setCategory] = useState('')
  const [artType, setArtType] = useState('')
  const [medium, setMedium] = useState('')
  const [description, setDescription] = useState('')
  const [priceCents, setPriceCents] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  // Dimensions state (dynamic based on category)
  const [dimensions, setDimensions] = useState<Record<string, string>>({})
  
  // Image upload state
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  // AI features state
  const [pricingRecommendation, setPricingRecommendation] = useState<PricingRecommendation | null>(null)
  const [metadataIssues, setMetadataIssues] = useState<MetadataIssue[]>([])

  const dimensionFields = category ? getDimensionFields(category) : []
  const artTypes = category ? getArtTypesForCategory(category as any) : []

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + images.length > 5) {
      toast({
        title: 'For mange billeder',
        description: 'Du kan maksimalt uploade 5 billeder',
        variant: 'destructive',
      })
      return
    }

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    
    setImages([...images, ...files])
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    )

    if (files.length + images.length > 5) {
      toast({
        title: 'For mange billeder',
        description: 'Du kan maksimalt uploade 5 billeder',
        variant: 'destructive',
      })
      return
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImages([...images, ...files])
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const generateDescription = async () => {
    if (!title || !category) {
      toast({
        title: 'Manglende information',
        description: 'Udfyld titel og kategori først',
        variant: 'destructive',
      })
      return
    }

    setIsGeneratingDescription(true)

    try {
      const response = await fetch('/api/gallery/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          artType,
          medium,
          dimensions: Object.fromEntries(
            Object.entries(dimensions).map(([key, value]) => [key, parseFloat(value) || 0])
          ),
        }),
      })

      if (!response.ok) throw new Error('Failed to generate description')

      const data = await response.json()
      setDescription(data.description)

      toast({
        title: 'Beskrivelse genereret',
        description: 'AI har genereret en SEO-optimeret beskrivelse',
      })
    } catch (error) {
      console.error('Error generating description:', error)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke generere beskrivelse',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const getPricingSuggestion = async () => {
    if (!artistId || !category || !medium) {
      toast({
        title: 'Manglende information',
        description: 'Vælg kunstner, kategori og medium først',
        variant: 'destructive',
      })
      return
    }

    setIsGettingPricing(true)

    try {
      const supabase = createClient()
      
      // Get artist name
      const { data: artist } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', artistId)
        .single()

      const response = await fetch('/api/pricing/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medium: `${category} - ${medium}`,
          dimensions: dimensions.width_cm && dimensions.height_cm
            ? `${dimensions.width_cm}x${dimensions.height_cm}`
            : undefined,
          year_created: new Date().getFullYear(),
        }),
      })

      if (!response.ok) throw new Error('Failed to get pricing')

      const data = await response.json()
      
      if (data.recommendation) {
        setPricingRecommendation(data.recommendation)
        
        // Optionally set the price
        setPriceCents((data.recommendation.recommended_price_cents / 100).toString())

        toast({
          title: 'Prisforslag hentet',
          description: `Anbefalet pris: ${(data.recommendation.recommended_price_cents / 100).toLocaleString('da-DK')} kr.`,
        })
      } else {
        toast({
          title: 'Ingen markedsdata',
          description: 'Der er ikke nok data til at give et prisforslag',
        })
      }
    } catch (error) {
      console.error('Error getting pricing:', error)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke hente prisforslag',
        variant: 'destructive',
      })
    } finally {
      setIsGettingPricing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title || !artistId || !category || !priceCents || images.length === 0) {
      toast({
        title: 'Manglende felter',
        description: 'Udfyld alle påkrævede felter og upload mindst ét billede',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Upload images to Supabase Storage
      const imageUrls: string[] = []
      
      for (const image of images) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${galleryId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('artwork-images')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('artwork-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      // Prepare artwork data
      const artworkData: any = {
        gallery_id: galleryId,
        artist_id: artistId,
        title,
        description,
        category,
        tags: artType ? [artType] : [],
        price_cents: Math.round(parseFloat(priceCents) * 100),
        image_url: imageUrls[0], // Primary image
        status: 'draft', // Start as draft
      }

      // Add medium if provided
      if (medium) {
        artworkData.style = medium
      }

      // Add video URL if provided
      if (videoUrl) {
        artworkData.video_url = videoUrl
      }

      // Add dimensions based on category
      dimensionFields.forEach((field) => {
        const value = dimensions[field.name]
        if (value) {
          if (field.type === 'number') {
            artworkData[field.name] = parseFloat(value)
          } else {
            artworkData[field.name] = value
          }
        }
      })

      // Insert artwork
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .insert(artworkData)
        .select()
        .single()

      if (artworkError) throw artworkError

      // Run metadata validation
      const validationResponse = await fetch('/api/gallery/validate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId,
          artworkId: artwork.id,
        }),
      })

      if (validationResponse.ok) {
        const validationData = await validationResponse.json()
        if (validationData.issues && validationData.issues.length > 0) {
          setMetadataIssues(validationData.issues)
        }
      }

      toast({
        title: 'Kunstværk oprettet',
        description: 'Kunstværket er blevet uploadet som kladde',
      })

      // Redirect to artworks page
      router.push('/gallery/dashboard/artworks')
      router.refresh()
    } catch (error) {
      console.error('Error uploading artwork:', error)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke uploade kunstværk',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Grundlæggende Information</CardTitle>
          <CardDescription>Udfyld de grundlæggende oplysninger om kunstværket</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Indtast kunstværkets titel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Kunstner *</Label>
            <Select value={artistId} onValueChange={setArtistId} required>
              <SelectTrigger>
                <SelectValue placeholder="Vælg kunstner" />
              </SelectTrigger>
              <SelectContent>
                {artists.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Ingen kunstnere tilknyttet galleriet
                  </div>
                ) : (
                  artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {artists.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Du skal først invitere kunstnere til dit galleri
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value)
                setArtType('')
                setDimensions({})
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Vælg kategori" />
              </SelectTrigger>
              <SelectContent>
                {ARTWORK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && artTypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="artType">Kunsttype</Label>
              <Select value={artType} onValueChange={setArtType}>
                <SelectTrigger>
                  <SelectValue placeholder="Vælg kunsttype (valgfri)" />
                </SelectTrigger>
                <SelectContent>
                  {artTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="medium">Medium</Label>
            <Input
              id="medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="f.eks. Akryl på lærred, Bronze, Giclée print"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      {dimensionFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dimensioner</CardTitle>
            <CardDescription>Angiv kunstværkets dimensioner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dimensionFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && '*'}
                  </Label>
                  {field.type === 'number' ? (
                    <div className="flex gap-2">
                      <Input
                        id={field.name}
                        type="number"
                        step={field.step || 0.1}
                        min={field.min || 0}
                        value={dimensions[field.name] || ''}
                        onChange={(e) =>
                          setDimensions({ ...dimensions, [field.name]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                      {field.unit && (
                        <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                          {field.unit}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Input
                      id={field.name}
                      type="text"
                      value={dimensions[field.name] || ''}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, [field.name]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pris</CardTitle>
          <CardDescription>Angiv salgsprisen for kunstværket</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Pris (DKK) *</Label>
            <div className="flex gap-2">
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
                placeholder="0.00"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={getPricingSuggestion}
                disabled={isGettingPricing || !artistId || !category}
              >
                {isGettingPricing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-2">AI Prisforslag</span>
              </Button>
            </div>
          </div>

          {pricingRecommendation && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Anbefalet pris:</span>
                    <span className="text-lg font-bold">
                      {(pricingRecommendation.recommended_price_cents / 100).toLocaleString('da-DK')} kr.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Prisinterval:</span>
                    <span>
                      {(pricingRecommendation.price_range.min_cents / 100).toLocaleString('da-DK')} -{' '}
                      {(pricingRecommendation.price_range.max_cents / 100).toLocaleString('da-DK')} kr.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence:</span>
                    <span>{Math.round(pricingRecommendation.confidence_score * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Markedsposition:</span>
                    <Badge
                      variant={
                        pricingRecommendation.market_position === 'fair'
                          ? 'default'
                          : pricingRecommendation.market_position === 'underpriced'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {pricingRecommendation.market_position === 'fair' && 'Fair pris'}
                      {pricingRecommendation.market_position === 'underpriced' && 'Underpriset'}
                      {pricingRecommendation.market_position === 'overpriced' && 'Overpriset'}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Beskrivelse</CardTitle>
          <CardDescription>Beskriv kunstværket for potentielle købere</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Beskrivelse</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateDescription}
                disabled={isGeneratingDescription || !title || !category}
              >
                {isGeneratingDescription ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-2">Generér beskrivelse</span>
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv kunstværket, dets inspiration, teknik og betydning..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Billeder *</CardTitle>
          <CardDescription>Upload billeder af kunstværket (mindst 1, maks 5)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Træk og slip billeder her, eller klik for at vælge
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG eller WEBP (maks 5 billeder)
            </p>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {index === 0 && (
                    <Badge className="absolute bottom-2 left-2">Primært billede</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video URL */}
      <Card>
        <CardHeader>
          <CardTitle>Video (valgfri)</CardTitle>
          <CardDescription>Tilføj en YouTube video af kunstværket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">YouTube URL</Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Metadata Issues */}
      {metadataIssues.length > 0 && (
        <Alert variant={metadataIssues.some((i) => i.severity === 'critical') ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Metadata advarsler:</p>
              <ul className="list-disc list-inside space-y-1">
                {metadataIssues.map((issue, index) => (
                  <li key={index} className="text-sm">
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploader...
            </>
          ) : (
            'Upload Kunstværk'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/gallery/dashboard/artworks')}
          disabled={isSubmitting}
        >
          Annuller
        </Button>
      </div>
    </form>
  )
}
