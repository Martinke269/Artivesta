import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase server client with lazy initialization.
 * Safe to import at module level - environment variables are only read at runtime.
 * 
 * IMPORTANT: Don't put this client in a global variable. Always create a new client 
 * within each function when using it (especially important for Fluid compute).
 * 
 * @returns Supabase server client or null if environment variables are missing
 */
export async function createClient(): Promise<SupabaseClient | null> {
  const cookieStore = await cookies()

  // Read environment variables inside the function (lazy initialization)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if environment variables are missing (e.g., during build)
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables are missing. Server client will not be initialized.')
    return null
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
