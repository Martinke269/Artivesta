"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VideoEmbed } from "@/components/video-embed"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

interface Artwork {
  id: string
  title: string
  description: string
  price_cents: number
  currency: string
  image_url: string
  video_url: string | null
  status: string
  artist_id: string
  category: string | null
  style: string | null
  tags: string[] | null
  width_cm: number | null
  height_cm: number | null
  depth_cm: number | null
  profiles: {
    name: string
    email: string
  }
}

export default function ArtworkDetailClient({ artwork }: { artwork: Artwork }) {
  const router = useRouter()
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handlePurchase = async () => {
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

  const dimensions = artwork.width_cm && artwork.height_cm 
    ? `${artwork.width_cm} × ${artwork.height_cm}${artwork.depth_cm ? ` × ${artwork.depth_cm}` : ''} cm`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            ART IS SAFE
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbage til oversigt
          </Link>
        </nav>

        <article className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Media Section */}
          <div className="space-y-4">
            {/* Image */}
            <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {artwork.image_url ? (
                <Image
                  src={artwork.image_url}
                  alt={`${artwork.title} af ${artwork.profiles?.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Intet billede
                </div>
              )}
            </div>

            {/* Video */}
            {artwork.video_url && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Video</h2>
                <VideoEmbed 
                  url={artwork.video_url} 
                  title={`Video af ${artwork.title}`}
                />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <header>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{artwork.title}</h1>
                <Badge variant={artwork.status === "available" ? "default" : "secondary"}>
                  {artwork.status === "available" ? "Tilgængelig" : "Solgt"}
                </Badge>
              </div>
              <p className="text-lg text-gray-600">
                Af <span itemProp="creator">{artwork.profiles?.name || "Ukendt kunstner"}</span>
              </p>
            </header>

            {artwork.description && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Beskrivelse</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {artwork.description}
                </p>
              </section>
            )}

            {(artwork.category || artwork.style || artwork.tags || dimensions) && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Detaljer</h2>
                <dl className="space-y-2 text-sm">
                  {artwork.category && (
                    <>
                      <dt className="inline font-medium">Kategori: </dt>
                      <dd className="inline">{artwork.category}</dd>
                    </>
                  )}
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div>
                      <dt className="inline font-medium">Kunstarter: </dt>
                      <dd className="inline">
                        <div className="inline-flex flex-wrap gap-1 mt-1">
                          {artwork.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                  {artwork.style && (
                    <div>
                      <dt className="inline font-medium">Stil: </dt>
                      <dd className="inline">{artwork.style}</dd>
                    </div>
                  )}
                  {dimensions && (
                    <div>
                      <dt className="inline font-medium">Dimensioner: </dt>
                      <dd className="inline">{dimensions}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            <section className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold" itemProp="price">
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
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
