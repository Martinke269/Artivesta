import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase browser client with lazy initialization.
 * Safe to import at module level - environment variables are only read at runtime.
 * 
 * @returns Supabase browser client with placeholder values if env vars are missing
 */
export function createClient(): SupabaseClient {
  // Read environment variables inside the function (lazy initialization)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Support both variable names for backwards compatibility
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time (SSG), environment variables might not be available
  // Return a client with placeholder values that will work at build time
  if (!supabaseUrl || !supabaseKey) {
    // Only throw error in browser context (not during build)
    if (typeof window !== 'undefined') {
      console.error(
        'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) in your environment.'
      )
    }
    
    // Return a client with placeholder values for build-time
    // This prevents build failures while still allowing runtime detection of missing vars
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
