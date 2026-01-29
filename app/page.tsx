"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { ArtistUSPSection } from "@/components/home/artist-usp-section"
import { BuyerUSPSection } from "@/components/home/buyer-usp-section"
import { FeaturesSection } from "@/components/home/features-section"
import { SearchFilters } from "@/components/home/search-filters"
import { ArtworkGrid } from "@/components/home/artwork-grid"
import { CTASection } from "@/components/home/cta-section"
import Script from "next/script"

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

export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStyle, setSelectedStyle] = useState<string>("all")
  const [selectedColor, setSelectedColor] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    loadUser()
    loadArtworks()
  }, [])

  useEffect(() => {
    filterArtworks()
  }, [artworks, searchQuery, selectedCategory, selectedStyle, selectedColor, priceRange])

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
      setFilteredArtworks(data || [])
    } catch (error) {
      console.error("Error loading artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterArtworks = () => {
    let filtered = [...artworks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(artwork => 
        artwork.title.toLowerCase().includes(query) ||
        artwork.description?.toLowerCase().includes(query) ||
        artwork.profiles?.name.toLowerCase().includes(query) ||
        artwork.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(artwork => artwork.category === selectedCategory)
    }

    // Style filter
    if (selectedStyle !== "all") {
      filtered = filtered.filter(artwork => artwork.style === selectedStyle)
    }

    // Color filter
    if (selectedColor !== "all") {
      filtered = filtered.filter(artwork => 
        artwork.dominant_colors?.includes(selectedColor)
      )
    }

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter(artwork => {
        const price = artwork.price_cents / 100
        switch (priceRange) {
          case "0-5000":
            return price <= 5000
          case "5000-10000":
            return price > 5000 && price <= 10000
          case "10000-20000":
            return price > 10000 && price <= 20000
          case "20000+":
            return price > 20000
          default:
            return true
        }
      })
    }

    setFilteredArtworks(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStyle("all")
    setSelectedColor("all")
    setPriceRange("all")
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ART IS SAFE",
    "url": "https://www.artissafe.com",
    "description": "Danmarks førende markedsplads for erhvervskunst. Køb original kunst direkte fra kunstnere med sikker escrow-betaling.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.artissafe.com/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ART IS SAFE",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.artissafe.com/logo.png"
      }
    }
  }

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ART IS SAFE",
    "url": "https://www.artissafe.com",
    "logo": "https://www.artissafe.com/logo.png",
    "description": "Professionel kunstmarkedsplads for virksomheder og kunstnere",
    "sameAs": [
      "https://www.facebook.com/artissafe",
      "https://www.instagram.com/artissafe",
      "https://www.linkedin.com/company/artissafe"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@artissafe.com",
      "availableLanguage": ["Danish"]
    }
  }

  return (
    <>
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <SiteHeader user={user} userRole={userRole} />

      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        clearFilters={clearFilters}
        filteredCount={filteredArtworks.length}
        totalCount={artworks.length}
      />

      <HeroSection 
        user={user} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ArtistUSPSection />
          <BuyerUSPSection />
        </div>
      </div>

      <div id="artwork-grid">
        <ArtworkGrid
          artworks={filteredArtworks}
          loading={loading}
          user={user}
          userRole={userRole}
          clearFilters={clearFilters}
          totalCount={artworks.length}
        />
      </div>
      
      <FeaturesSection />

      <CTASection />

        <SiteFooter />
      </div>
    </>
  )
}
