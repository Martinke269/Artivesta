import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import ArtworkDetailClient from "./artwork-detail-client"

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
  width_cm: number | null
  height_cm: number | null
  depth_cm: number | null
  created_year: number | null
  profiles: {
    name: string
    email: string
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient()
  
  const { data: artwork } = await supabase
    .from("artworks")
    .select(`
      *,
      profiles:artist_id (name, email)
    `)
    .eq("id", params.id)
    .single()

  if (!artwork) {
    return {
      title: "Kunstværk ikke fundet",
    }
  }

  const price = new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: artwork.currency,
  }).format(artwork.price_cents / 100)

  const dimensions = artwork.width_cm && artwork.height_cm 
    ? `${artwork.width_cm}x${artwork.height_cm}${artwork.depth_cm ? `x${artwork.depth_cm}` : ''} cm`
    : ''

  const description = artwork.description 
    ? `${artwork.description.substring(0, 155)}...`
    : `${artwork.title} af ${artwork.profiles?.name}. Original kunst til salg for ${price}. ${dimensions}`

  return {
    title: `${artwork.title} - ${artwork.profiles?.name}`,
    description,
    keywords: [
      artwork.title,
      artwork.profiles?.name,
      'original kunst',
      'køb kunst',
      artwork.category,
      artwork.style,
      'dansk kunst',
      'kunstværk til salg'
    ].filter(Boolean),
    openGraph: {
      title: `${artwork.title} - ${artwork.profiles?.name}`,
      description,
      images: artwork.image_url ? [
        {
          url: artwork.image_url,
          width: 1200,
          height: 630,
          alt: `${artwork.title} af ${artwork.profiles?.name}`,
        }
      ] : [],
      type: 'website',
      locale: 'da_DK',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${artwork.title} - ${artwork.profiles?.name}`,
      description,
      images: artwork.image_url ? [artwork.image_url] : [],
    },
    alternates: {
      canonical: `/artwork/${params.id}`,
    },
  }
}

export default async function ArtworkDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: artwork, error } = await supabase
    .from("artworks")
    .select(`
      *,
      profiles:artist_id (name, email)
    `)
    .eq("id", params.id)
    .single()

  if (error || !artwork) {
    notFound()
  }

  // Generate structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.artissafe.dk'
  
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": artwork.title,
    "description": artwork.description || `${artwork.title} af ${artwork.profiles?.name}`,
    "image": artwork.image_url,
    "brand": {
      "@type": "Brand",
      "name": artwork.profiles?.name
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/artwork/${artwork.id}`,
      "priceCurrency": artwork.currency,
      "price": (artwork.price_cents / 100).toFixed(2),
      "availability": artwork.status === "available" 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Person",
        "name": artwork.profiles?.name
      }
    },
    "category": artwork.category || "Kunst",
    "artMedium": artwork.style || "Mixed Media",
    "artform": "Painting",
    "creator": {
      "@type": "Person",
      "name": artwork.profiles?.name
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Forside",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": artwork.title,
        "item": `${baseUrl}/artwork/${artwork.id}`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArtworkDetailClient artwork={artwork} />
    </>
  )
}
