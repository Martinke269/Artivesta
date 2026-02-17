# Supabase Build-Time Initialization Fix

## Problem
Next.js build was failing because Supabase client initialization was happening at module load time, attempting to access environment variables with the `!` assertion operator. This caused build failures when environment variables were not available during the build process.

## Solution
Implemented **lazy initialization** for all Supabase client creation. Environment variables are now read inside functions at runtime, not at module load time.

## Files Modified

### 1. `lib/supabase/client.ts`
**Changes:**
- Moved env var reading inside the `createClient()` function
- Returns `null` if env vars are missing (instead of throwing)
- Only logs warnings in browser context, not during build
- Supports both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

**Before:**
```typescript
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
}
```

**After:**
```typescript
export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase environment variables are missing.')
    }
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
```

### 2. `lib/supabase/server.ts`
**Changes:**
- Moved env var reading inside the `createClient()` function
- Returns `null` if env vars are missing
- Logs warning when env vars are missing
- Maintains async function signature for cookie handling

**Key improvement:** Environment variables are read at runtime, not at module load.

### 3. `utils/supabase/client.ts`
**Changes:**
- Moved env var reading inside the `createClient()` function
- Returns placeholder client if env vars are missing (for build compatibility)
- Only logs errors in browser context
- Supports both env var naming conventions

**Key improvement:** Build succeeds even without env vars by using placeholder values.

### 4. `utils/supabase/server.ts`
**Changes:**
- Moved env var reading inside the `createClient()` function
- Uses placeholder values if env vars are missing
- Maintains full cookie handling functionality

**Key improvement:** Server-side rendering works during build without requiring env vars.

### 5. `lib/supabase/middleware.ts`
**Changes:**
- Moved env var reading inside the `updateSession()` function
- Early return if env vars are missing (skips Supabase initialization)
- Logs warning when skipping
- Supports both env var naming conventions

**Before:**
```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  { /* ... */ }
)
```

**After:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables missing in middleware.')
  return supabaseResponse
}

const supabase = createServerClient(supabaseUrl, supabaseKey, { /* ... */ })
```

### 6. `utils/supabase/middleware.ts`
**Changes:**
- Same pattern as `lib/supabase/middleware.ts`
- Early return if env vars are missing
- Graceful degradation during build

## Key Principles Applied

### 1. **Lazy Initialization**
All environment variable access happens inside functions, not at module load time:
```typescript
// ❌ BAD - Runs at module load
const supabase = createClient(process.env.VAR!)

// ✅ GOOD - Runs at runtime
function getClient() {
  const var = process.env.VAR
  return createClient(var)
}
```

### 2. **No Assertion Operators**
Removed all `!` assertion operators that would throw errors:
```typescript
// ❌ BAD - Throws if missing
process.env.NEXT_PUBLIC_SUPABASE_URL!

// ✅ GOOD - Handles missing gracefully
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!url) return null
```

### 3. **Graceful Degradation**
Build succeeds even without env vars:
- Browser client: Returns null or placeholder
- Server client: Returns null or placeholder
- Middleware: Skips Supabase initialization

### 4. **Runtime Detection**
Only log errors/warnings in appropriate contexts:
```typescript
if (typeof window !== 'undefined') {
  console.error('Missing env vars')
}
```

## Benefits

1. **Build Success**: Next.js build completes even without Supabase env vars
2. **No Runtime Errors**: Graceful handling of missing configuration
3. **Better DX**: Clear warnings when env vars are missing
4. **Backward Compatible**: Supports both old and new env var names
5. **Type Safe**: Proper TypeScript types with null handling

## Testing

To verify the fix works:

```bash
# Build without env vars (should succeed)
npm run build

# Build with env vars (should succeed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
npm run build
```

## Migration Notes

If you're using these Supabase clients in your code, be aware:

1. **`lib/supabase/client.ts`** now returns `SupabaseClient | null`
2. **`lib/supabase/server.ts`** now returns `Promise<SupabaseClient | null>`
3. Add null checks where needed:

```typescript
const supabase = createClient()
if (!supabase) {
  // Handle missing client
  return
}
// Use supabase safely
```

## Environment Variables

Ensure these are set in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

## Summary

All Supabase client initialization has been refactored to use lazy initialization, ensuring:
- ✅ No code runs at module load time
- ✅ Environment variables are read at runtime
- ✅ Build succeeds without env vars
- ✅ Graceful error handling
- ✅ Clear warnings for missing configuration
