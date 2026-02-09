import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Return a message indicating that the migration should be run via SQL
    return NextResponse.json({
      success: true,
      message: 'Please run the migration using the SQL migration file in supabase/migrations/migrate_to_new_categories.sql',
      info: 'This can be executed via the Supabase dashboard or using the Supabase CLI'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
