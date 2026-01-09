"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Artwork {
  id: string
  title: string
  description: string
  price_cents: number
  currency: string
  image_url: string
  status: string
  created_at: string
}

export default function MyArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error("Error loading artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", deleteId)

      if (error) throw error

      setArtworks(artworks.filter((a) => a.id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting artwork:", error)
    }
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      available: { label: "Tilgængelig", variant: "default" },
      sold: { label: "Solgt", variant: "secondary" },
      reserved: { label: "Reserveret", variant: "destructive" },
    }
    const config = variants[status] || variants.available
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Kunstnerplatform
          </Link>
          <Link href="/upload">
            <Button>Upload Nyt Kunstværk</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Mine Kunstværker</h2>
          <p className="text-gray-600">
            Administrer dine uploadede kunstværker
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">
                Du har ikke uploadet nogen kunstværker endnu
              </p>
              <Link href="/upload">
                <Button>Upload dit første kunstværk</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden">
                <div className="relative h-64 bg-gray-200">
                  {artwork.image_url ? (
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Intet billede
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(artwork.status)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{artwork.title}</CardTitle>
                  <CardDescription>
                    {new Date(artwork.created_at).toLocaleDateString("da-DK")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {artwork.description || "Ingen beskrivelse"}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatPrice(artwork.price_cents, artwork.currency)}
                  </span>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteId(artwork.id)}
                    disabled={artwork.status === "sold"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil permanent slette kunstværket. Denne handling kan ikke fortrydes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Slet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
