import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Approve price change (seller)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { artworkId, action, buyerId } = await request.json()

    if (!artworkId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve_seller') {
      const { error } = await supabase.rpc('approve_price_change_seller', {
        p_artwork_id: artworkId
      })

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Price change approved by seller' })
    } else if (action === 'approve_buyer') {
      if (!buyerId) {
        return NextResponse.json({ error: 'Buyer ID required' }, { status: 400 })
      }

      const { error } = await supabase.rpc('approve_price_change_buyer', {
        p_artwork_id: artworkId,
        p_buyer_id: buyerId
      })

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Price change approved by buyer' })
    } else if (action === 'reject') {
      const { error } = await supabase.rpc('reject_price_change', {
        p_artwork_id: artworkId,
        p_rejected_by: user.id
      })

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Price change rejected and reverted' })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Price approval error:', error)
    return NextResponse.json(
      { error: 'Failed to process price approval' },
      { status: 500 }
    )
  }
}

// Get pending price approvals
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')

    let query = supabase
      .from('price_history')
      .select(`
        *,
        artworks:artwork_id (
          id,
          title,
          artist_id,
          price_cents
        )
      `)
      .eq('requires_approval', true)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (artworkId) {
      query = query.eq('artwork_id', artworkId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get price approvals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price approvals' },
      { status: 500 }
    )
  }
}
