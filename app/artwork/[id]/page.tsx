"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Artwork {
  id: string
  title: string
  description: string
  price_cents: number
  currency: string
  image_url: string
  status: string
  artist_id: string
  profiles: {
    name: string
    email: string
  }
}

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadArtwork()
  }, [params.id])

  const loadArtwork = async () => {
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          *,
          profiles:artist_id (name, email)
        `)
        .eq("id", params.id)
        .single()

      if (error) throw error
      setArtwork(data)
    } catch (error) {
      console.error("Error loading artwork:", error)
      setError("Kunne ikke indlæse kunstværk")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!artwork) return
    
    setError("")
    setPurchasing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          artwork_id: artwork.id,
          buyer_id: user.id,
          seller_id: artwork.artist_id,
          amount_cents: artwork.price_cents,
          currency: artwork.currency,
          status: "pending",
          escrow_status: "held",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create payout request with 20% commission
      const commissionCents = Math.round(artwork.price_cents * 0.2)
      const netAmountCents = artwork.price_cents - commissionCents

      const { error: payoutError } = await supabase
        .from("payouts")
        .insert({
          order_id: order.id,
          seller_id: artwork.artist_id,
          amount_cents: artwork.price_cents,
          commission_cents: commissionCents,
          net_amount_cents: netAmountCents,
          status: "pending",
        })

      if (payoutError) throw payoutError

      // Update artwork status
      const { error: updateError } = await supabase
        .from("artworks")
        .update({ status: "sold" })
        .eq("id", artwork.id)

      if (updateError) throw updateError

      // In a real app, this would redirect to payment
      router.push("/orders")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setPurchasing(false)
    }
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold">
              Kunstnerplatform
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <div className="h-96 bg-gray-200" />
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold">
              Kunstnerplatform
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Kunstværk ikke fundet</p>
              <Link href="/">
                <Button>Tilbage til forsiden</Button>
              </Link>
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbage til oversigt
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
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
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{artwork.title}</h1>
                <Badge variant={artwork.status === "available" ? "default" : "secondary"}>
                  {artwork.status === "available" ? "Tilgængelig" : "Solgt"}
                </Badge>
              </div>
              <p className="text-lg text-gray-600">
                Af {artwork.profiles?.name || "Ukendt kunstner"}
              </p>
            </div>

            {artwork.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Beskrivelse</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold">
                  {formatPrice(artwork.price_cents, artwork.currency)}
                </span>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {artwork.status === "available" ? (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? "Behandler..." : "Køb nu"}
                </Button>
              ) : (
                <Button size="lg" className="w-full" disabled>
                  Ikke tilgængelig
                </Button>
              )}

              <p className="text-sm text-gray-500 mt-4 text-center">
                Betalingen håndteres sikkert gennem vores escrow-system
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
