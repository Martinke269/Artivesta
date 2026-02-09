"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { ARTWORK_CATEGORIES, ARTWORK_STYLES, ARTWORK_COLORS, getArtTypesForCategory, ArtworkCategory } from "@/lib/artwork-constants"
import { ArtworkDimensionsFields } from "@/components/artwork-dimensions-fields"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [category, setCategory] = useState<ArtworkCategory | "">("")
  const [style, setStyle] = useState("")
  const [selectedArtTypes, setSelectedArtTypes] = useState<string[]>([])
  const [customTags, setCustomTags] = useState("")
  const [colors, setColors] = useState<string[]>([])
  const [dimensions, setDimensions] = useState<Record<string, any>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkArtistProfile()
  }, [])

  const checkArtistProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, profile_completed")
        .eq("id", user.id)
        .single()

      if (error) throw error

      if (profile.role !== "artist") {
        router.push("/")
        return
      }

      if (!profile.profile_completed) {
        setProfileCompleted(false)
      } else {
        setProfileCompleted(true)
      }
    } catch (error) {
      console.error("Error checking profile:", error)
    } finally {
      setCheckingProfile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Du skal være logget ind")

      const priceCents = Math.round(parseFloat(price) * 100)
      if (isNaN(priceCents) || priceCents <= 0) {
        throw new Error("Ugyldig pris")
      }

      // Combine art types and custom tags
      const customTagArray = customTags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      const allTags = [...selectedArtTypes, ...customTagArray]

      // Prepare dimension data - convert string values to appropriate types
      const dimensionData: Record<string, any> = {}
      Object.entries(dimensions).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          // Convert numeric fields
          if (key.includes("_cm") || key.includes("_kg") || key.includes("_sqm") || key === "element_count") {
            const numValue = parseFloat(value as string)
            if (!isNaN(numValue)) {
              dimensionData[key] = numValue
            }
          } else if (key === "price_per_sqm_cents") {
            const numValue = Math.round(parseFloat(value as string) * 100)
            if (!isNaN(numValue)) {
              dimensionData[key] = numValue
            }
          } else if (key === "acoustic_effect") {
            dimensionData[key] = !!value
          } else {
            dimensionData[key] = value
          }
        }
      })

      const { error: insertError } = await supabase
        .from("artworks")
        .insert({
          artist_id: user.id,
          title,
          description,
          price_cents: priceCents,
          currency: "DKK",
          image_url: imageUrl,
          video_url: videoUrl || null,
          status: "available",
          category: category || null,
          style: style || null,
          tags: allTags.length > 0 ? allTags : null,
          dominant_colors: colors.length > 0 ? colors : null,
          ...dimensionData,
        })

      if (insertError) throw insertError

      router.push("/my-artworks")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Indlæser...</p>
      </div>
    )
  }

  if (!profileCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold">
              Kunstnerplatform
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                Profil ikke komplet
              </CardTitle>
              <CardDescription>
                Du skal udfylde din kunstnerprofil før du kan uploade kunstværker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                For at give købere den bedste oplevelse, skal du først oprette din kunstnerprofil 
                med en beskrivelse af dig selv og dit arbejde.
              </p>
              <div className="flex gap-4">
                <Link href="/artist/profile" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Opret profil nu
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Tilbage til forsiden
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Kunstnerplatform
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Kunstværk</CardTitle>
            <CardDescription>
              Del dit kunstværk med potentielle købere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kunstværkets titel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beskrivelse</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beskriv dit kunstværk..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Pris (DKK) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Hovedkategori *</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => {
                    setCategory(value as ArtworkCategory)
                    // Reset dimensions and art types when category changes
                    setDimensions({})
                    setSelectedArtTypes([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg hovedkategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTWORK_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Vælg én hovedkategori for dit kunstværk
                </p>
              </div>

              {/* Dynamic dimension fields based on category */}
              {category && (
                <ArtworkDimensionsFields
                  category={category}
                  dimensions={dimensions}
                  onDimensionChange={(name, value) => {
                    setDimensions(prev => ({ ...prev, [name]: value }))
                  }}
                />
              )}

              {/* Art Types - shown only when category is selected */}
              {category && (
                <div className="space-y-2">
                  <Label>Kunstarter (vælg relevante)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {getArtTypesForCategory(category).map(artType => (
                      <div key={artType} className="flex items-center space-x-2">
                        <Checkbox
                          id={artType}
                          checked={selectedArtTypes.includes(artType)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedArtTypes([...selectedArtTypes, artType])
                            } else {
                              setSelectedArtTypes(selectedArtTypes.filter(t => t !== artType))
                            }
                          }}
                        />
                        <label
                          htmlFor={artType}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {artType}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Vælg de kunstarter der passer til dit værk
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="customTags">Ekstra tags (valgfri, kommasepareret)</Label>
                <Input
                  id="customTags"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  placeholder="moderne, farverig, eksklusiv"
                />
                <p className="text-sm text-gray-500">
                  Tilføj yderligere beskrivende tags adskilt med komma
                </p>
              </div>

              <div className="space-y-2">
                <Label>Dominerende farver</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ARTWORK_COLORS.map(color => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={color.value}
                        checked={colors.includes(color.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setColors([...colors, color.value])
                          } else {
                            setColors(colors.filter(c => c !== color.value))
                          }
                        }}
                      />
                      <label
                        htmlFor={color.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {color.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Billede URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-gray-500">
                  Upload dit billede til Assets og indsæt URL'en her
                </p>
              </div>

              {imageUrl && (
                <div className="space-y-2">
                  <Label>Forhåndsvisning</Label>
                  <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setError("Kunne ikke indlæse billede")}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL (valgfri)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500">
                  Indsæt et YouTube-link for at vise en video af dit kunstværk
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Uploader..." : "Upload Kunstværk"}
                </Button>
                <Link href="/my-artworks" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuller
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
