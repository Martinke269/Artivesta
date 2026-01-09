"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

      const { error: insertError } = await supabase
        .from("artworks")
        .insert({
          artist_id: user.id,
          title,
          description,
          price_cents: priceCents,
          currency: "DKK",
          image_url: imageUrl,
          status: "available",
        })

      if (insertError) throw insertError

      router.push("/my-artworks")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
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
