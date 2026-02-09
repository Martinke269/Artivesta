import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Track buyer interest and increment analytics
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { artworkId, interestType } = await request.json()

    if (!artworkId || !interestType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate interest type
    const validTypes = ['view', 'favorite', 'inquiry', 'offer']
    if (!validTypes.includes(interestType)) {
      return NextResponse.json({ error: 'Invalid interest type' }, { status: 400 })
    }

    // Record buyer interest
    const { error: interestError } = await supabase.rpc('record_buyer_interest', {
      p_artwork_id: artworkId,
      p_buyer_id: user.id,
      p_interest_type: interestType
    })

    if (interestError) throw interestError

    // Increment view count if it's a view
    if (interestType === 'view') {
      const { error: viewError } = await supabase.rpc('increment_artwork_view', {
        p_artwork_id: artworkId
      })

      if (viewError) throw viewError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track interest error:', error)
    return NextResponse.json(
      { error: 'Failed to track interest' },
      { status: 500 }
    )
  }
}
