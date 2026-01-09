"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  }
}

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadUser()
    loadArtworks()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      
      if (profile) {
        setUserRole(profile.role)
      }
    }
  }

  const loadArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          *,
          profiles:artist_id (name)
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false })

      if (error) throw error
      setArtworks(data || [])
    } catch (error) {
      console.error("Error loading artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kunstnerplatform</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {userRole === "artist" && (
                  <>
                    <Link href="/upload">
                      <Button variant="outline">Upload Kunst</Button>
                    </Link>
                    <Link href="/my-artworks">
                      <Button variant="outline">Mine Kunstværker</Button>
                    </Link>
                  </>
                )}
                {userRole === "business" && (
                  <Link href="/orders">
                    <Button variant="outline">Mine Ordrer</Button>
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline">Admin Panel</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout}>
                  Log ud
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Log ind</Button>
                </Link>
                <Link href="/signup">
                  <Button>Opret konto</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Udforsk Kunst</h2>
          <p className="text-gray-600">
            Køb originale kunstværker direkte fra kunstnere
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
                Ingen kunstværker tilgængelige endnu
              </p>
              {userRole === "artist" && (
                <Link href="/upload">
                  <Button>Upload dit første kunstværk</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                  <Badge className="absolute top-2 right-2">
                    {artwork.status === "available" ? "Tilgængelig" : "Solgt"}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{artwork.title}</CardTitle>
                  <CardDescription>
                    Af {artwork.profiles?.name || "Ukendt kunstner"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {artwork.description}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatPrice(artwork.price_cents, artwork.currency)}
                  </span>
                  {user && userRole === "business" && (
                    <Link href={`/artwork/${artwork.id}`}>
                      <Button>Køb nu</Button>
                    </Link>
                  )}
                  {!user && (
                    <Link href="/signup">
                      <Button>Køb nu</Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
