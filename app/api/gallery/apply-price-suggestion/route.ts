import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's gallery
    const { data: gallery } = await supabase
      .from('galleries')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    const { artworkId, suggestedPriceCents } = await request.json()

    if (!artworkId || !suggestedPriceCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify artwork belongs to gallery
    const { data: artwork } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artworkId)
      .single()

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    // Check if artist belongs to gallery
    const { data: galleryArtist } = await supabase
      .from('gallery_artists')
      .select('id')
      .eq('gallery_id', gallery.id)
      .eq('artist_id', artwork.artist_id)
      .eq('status', 'active')
      .single()

    if (!galleryArtist) {
      return NextResponse.json(
        { error: 'Artwork does not belong to your gallery' },
        { status: 403 }
      )
    }

    // Update artwork price
    const { error: updateError } = await supabase
      .from('artworks')
      .update({ price_cents: suggestedPriceCents })
      .eq('id', artworkId)

    if (updateError) {
      console.error('Error updating artwork price:', updateError)
      return NextResponse.json({ error: 'Failed to update price' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in apply-price-suggestion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
