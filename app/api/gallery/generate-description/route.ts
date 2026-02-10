import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/gallery/generate-description
 * Generate SEO-optimized description for artwork using AI
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, category, artType, medium, dimensions } = body

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    // Generate AI description based on artwork details
    const description = generateArtworkDescription({
      title,
      category,
      artType,
      medium,
      dimensions,
    })

    return NextResponse.json({
      description,
      message: 'Description generated successfully',
    })
  } catch (error) {
    console.error('Error generating description:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface ArtworkDetails {
  title: string
  category: string
  artType?: string
  medium?: string
  dimensions?: {
    width?: number
    height?: number
    depth?: number
  }
}

function generateArtworkDescription(details: ArtworkDetails): string {
  const { title, category, artType, medium, dimensions } = details

  // Build description parts
  const parts: string[] = []

  // Opening statement
  parts.push(`"${title}" er et ${category.toLowerCase()}`)

  // Add art type if available
  if (artType) {
    parts[0] += ` i stilen ${artType.toLowerCase()}`
  }

  // Add medium if available
  if (medium) {
    parts.push(`Værket er skabt med ${medium.toLowerCase()}`)
  }

  // Add dimensions if available
  if (dimensions?.width && dimensions?.height) {
    const dimText = dimensions.depth
      ? `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm`
      : `${dimensions.width} × ${dimensions.height} cm`
    parts.push(`med dimensionerne ${dimText}`)
  }

  // Add category-specific descriptions
  const categoryDescriptions: Record<string, string> = {
    Maleri:
      'Dette maleri vil tilføje karakter og personlighed til ethvert rum, hvad enten det er i hjemmet eller på kontoret.',
    'Skulptur & Keramik':
      'Denne skulptur er perfekt til at skabe et visuelt fokuspunkt i både private og erhvervsmæssige miljøer.',
    'Grafik & Kunsttryk':
      'Dette kunsttryk kombinerer kunstnerisk kvalitet med tilgængelighed og er ideelt til moderne indretning.',
    Fotografi:
      'Dette fotografiske værk fanger et unikt øjeblik og vil berige enhver væg med sin visuelle fortælling.',
    'Digital Kunst':
      'Dette digitale kunstværk repræsenterer den moderne kunstscenes innovative tilgang til kreativitet.',
    Tegning:
      'Denne tegning viser kunstnerens tekniske kunnen og evne til at skabe udtryk gennem simple, men kraftfulde streger.',
  }

  if (categoryDescriptions[category]) {
    parts.push(categoryDescriptions[category])
  }

  // Add closing statement about authenticity
  parts.push(
    'Værket leveres med ægthedscertifikat og er klar til ophængning eller udstilling.'
  )

  // Join all parts with proper punctuation
  return parts.join('. ') + '.'
}
