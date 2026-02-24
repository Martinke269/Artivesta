import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase browser client with lazy initialization.
 * Safe to import at module level - environment variables are only read at runtime.
 * 
 * @returns Supabase browser client
 * @throws Error if environment variables are missing
 */
export function createClient(): SupabaseClient {
  // Read environment variables inside the function (lazy initialization)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Throw error if environment variables are missing
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
