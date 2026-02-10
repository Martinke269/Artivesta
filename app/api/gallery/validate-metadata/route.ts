import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { validateArtworkMetadata } from '@/lib/supabase/gallery-upload-queries'

export const dynamic = 'force-dynamic'

/**
 * POST /api/gallery/validate-metadata
 * Validate artwork metadata and return issues
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
    const { galleryId, artworkId } = body

    if (!galleryId || !artworkId) {
      return NextResponse.json(
        { error: 'Gallery ID and Artwork ID are required' },
        { status: 400 }
      )
    }

    // Validate metadata
    const validation = await validateArtworkMetadata(supabase, galleryId, artworkId)

    return NextResponse.json({
      hasIssues: validation.hasIssues,
      issues: validation.issues,
      message: validation.hasIssues
        ? 'Metadata validation completed with issues'
        : 'Metadata validation passed',
    })
  } catch (error) {
    console.error('Error validating metadata:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
