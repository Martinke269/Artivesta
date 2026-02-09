"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Artwork {
  id: string
  title: string
  description: string
  price_cents: number
  currency: string
  image_url: string
  status: string
  artist_id: string
  category: string | null
  style: string | null
  tags: string[] | null
  dominant_colors: string[] | null
  profiles: {
    name: string
  }
}

interface ArtworkGridProps {
  artworks: Artwork[]
  loading: boolean
  user: any
  userRole: string | null
  clearFilters: () => void
  totalCount: number
}

export function ArtworkGrid({ artworks, loading, user, userRole, clearFilters, totalCount }: ArtworkGridProps) {
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  return (
    <main id="find-kunst" className="container mx-auto px-4 py-8 md:py-12 scroll-mt-20">
      <div className="mb-8 md:mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Udforsk Kunst
        </h2>
        <p className="text-gray-600 text-base md:text-lg">
          Original kunst perfekt til erhvervslivet
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="animate-pulse border-purple-100">
                <div className="h-64 md:h-80 bg-gradient-to-br from-purple-100 to-pink-100" />
                <CardHeader>
                  <div className="h-5 md:h-6 bg-purple-100 rounded mb-2" />
                  <div className="h-3 md:h-4 bg-purple-100 rounded w-2/3" />
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : artworks.length === 0 ? (
        <Card className="border-purple-100 bg-white/80 backdrop-blur">
          <CardContent className="py-12 md:py-16 text-center">
            <Palette className="h-12 w-12 md:h-16 md:w-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 text-base md:text-lg">
              {totalCount === 0 
                ? "Ingen kunstværker tilgængelige endnu"
                : "Ingen kunstværker matcher dine filtre"}
            </p>
            {totalCount > 0 && (
              <Button 
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Ryd filtre
              </Button>
            )}
            {userRole === "artist" && totalCount === 0 && (
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Upload dit første kunstværk
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-purple-100 bg-white/80 backdrop-blur group hover:-translate-y-2">
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                {artwork.image_url ? (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Palette className="h-12 w-12 md:h-16 md:w-16 text-purple-300" />
                  </div>
                )}
                <Badge className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 text-purple-700 border-purple-200 text-xs">
                  {artwork.status === "available" ? "Tilgængelig" : "Solgt"}
                </Badge>
                {artwork.category && (
                  <Badge className="absolute top-3 md:top-4 left-3 md:left-4 bg-purple-600 text-white text-xs">
                    {artwork.category}
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl line-clamp-1">{artwork.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Palette className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="line-clamp-1">{artwork.profiles?.name || "Ukendt kunstner"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">
                  {artwork.description}
                </p>
                {artwork.tags && artwork.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artwork.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 pt-4">
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {formatPrice(artwork.price_cents, artwork.currency)}
                </span>
                {user && userRole === "business" && (
                  <Link href={`/artwork/${artwork.id}`} className="group/button">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group-hover/button:scale-105">
                      Køb nu
                    </Button>
                  </Link>
                )}
                {!user && (
                  <Link href="/signup" className="group/button">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group-hover/button:scale-105">
                      Køb nu
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  )
}
