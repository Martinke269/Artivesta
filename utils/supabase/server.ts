import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase server client with lazy initialization.
 * Safe to import at module level - environment variables are only read at runtime.
 * 
 * @returns Supabase server client with placeholder values if env vars are missing
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  // Read environment variables inside the function (lazy initialization)
  // Support both NEXT_PUBLIC_SUPABASE_ANON_KEY (standard) and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY (legacy)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

  // During build time (SSG), environment variables might not be available
  // Use placeholder values that will be replaced at runtime
  const url = supabaseUrl || 'https://placeholder.supabase.co'
  const key = supabaseKey || 'placeholder-anon-key'

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: any }) =>
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
