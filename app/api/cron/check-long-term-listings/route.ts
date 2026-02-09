import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Cron job to check for artworks listed for 90+ days
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Call the database function to check long-term listings
    const { error } = await supabase.rpc('check_long_term_listings')

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Long-term listings check completed' 
    })
  } catch (error) {
    console.error('Check long-term listings error:', error)
    return NextResponse.json(
      { error: 'Failed to check long-term listings' },
      { status: 500 }
    )
  }
}
