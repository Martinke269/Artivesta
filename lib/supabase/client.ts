import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase browser client with lazy initialization.
 * Safe to import at module level - environment variables are only read at runtime.
 * 
 * @returns Supabase browser client or null if environment variables are missing
 */
export function createClient(): SupabaseClient | null {
  // Read environment variables inside the function (lazy initialization)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if environment variables are missing (e.g., during build)
  if (!supabaseUrl || !supabaseKey) {
    // Only log warning in browser context, not during build
    if (typeof window !== 'undefined') {
      console.warn('Supabase environment variables are missing. Client will not be initialized.')
    }
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
