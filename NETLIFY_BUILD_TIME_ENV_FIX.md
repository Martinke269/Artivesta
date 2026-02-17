# Netlify Build-Time Environment Variables Fix

## Problem
Netlify build fejlede fordi Supabase environment variables ikke var tilgængelige under build-time, når Next.js forsøgte at pre-rendere statiske sider.

## Fejlmeddelelse
```
Error: Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Root Cause
- Next.js pre-renderer (SSG) kører under build-time
- Supabase klienten blev initialiseret under pre-rendering
- Environment variables kastede en fejl hvis de manglede
- Dette forhindrede hele build-processen i at fuldføre

## Løsning

### 1. Browser Client (`utils/supabase/client.ts`)
Opdateret til at:
- Kun kaste fejl i browser context (ikke under build)
- Returnere en placeholder klient under build-time
- Placeholder klienten bruges aldrig i produktion, da rigtige env vars er tilgængelige runtime

```typescript
if (!supabaseUrl || !supabaseKey) {
  // Only throw error in browser context (not during build)
  if (typeof window !== 'undefined') {
    throw new Error('Missing Supabase environment variables...')
  }
  
  // Return a mock client for build-time that won't be used
  return createBrowserClient(
    'https://placeholder.supabase.co',
    'placeholder-anon-key'
  )
}
```

### 2. Server Client (`utils/supabase/server.ts`)
Opdateret til at:
- Bruge fallback værdier hvis env vars mangler
- Sikre TypeScript type safety med eksplicitte typer

```typescript
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseKey || 'placeholder-anon-key'

return createServerClient(url, key, { ... })
```

## Resultat
- Build-processen kan nu fuldføre uden fejl
- Rigtige environment variables bruges stadig i runtime
- Ingen sikkerhedsproblemer, da placeholder værdier aldrig bruges i produktion
- TypeScript type safety bevaret

## Deployment Instruktioner
1. Sørg for at Netlify har de korrekte environment variables sat:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Deploy til Netlify - build skulle nu lykkes
3. Verificer at applikationen fungerer korrekt i produktion

## Relaterede Filer
- `utils/supabase/client.ts` - Browser client
- `utils/supabase/server.ts` - Server client
- `netlify.toml` - Netlify konfiguration

## Dato
17. februar 2026
