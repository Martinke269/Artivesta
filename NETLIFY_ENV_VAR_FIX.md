# Netlify Environment Variables Fix

## Problem
Netlify build fejlede med fejlen:
```
Error: Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

## Root Cause
Koden brugte `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`, men Netlify havde kun `NEXT_PUBLIC_SUPABASE_ANON_KEY` konfigureret i environment variables.

## Solution Implemented
Opdateret `utils/supabase/client.ts` til at understøtte begge variable navne:
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` (primær)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fallback for bagudkompatibilitet)

## Required Netlify Configuration

For at få buildet til at virke, skal du tilføje følgende environment variables i Netlify:

### Gå til Netlify Dashboard:
1. Log ind på Netlify
2. Vælg dit site
3. Gå til **Site settings** → **Build & deploy** → **Environment** → **Environment variables**

### Tilføj følgende variables:

#### Required (Kritiske):
```
NEXT_PUBLIC_SUPABASE_URL=https://znkvmklheuidkffvbtvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[din Supabase anon key]
```

#### Optional (Hvis du allerede har dem):
```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=[samme værdi som ANON_KEY]
NEXT_PUBLIC_SITE_URL=[din site URL]
STRIPE_SECRET_KEY=[din Stripe secret key]
STRIPE_WEBHOOK_SECRET=[din Stripe webhook secret]
SUPABASE_SERVICE_ROLE_KEY=[din Supabase service role key]
SUPABASE_URL=[samme som NEXT_PUBLIC_SUPABASE_URL]
```

### Find dine Supabase keys:
1. Gå til [Supabase Dashboard](https://supabase.com/dashboard)
2. Vælg dit projekt (znkvmklheuidkffvbtvn)
3. Gå til **Settings** → **API**
4. Kopier:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (kun hvis nødvendigt)

## After Adding Variables

1. Gem alle environment variables i Netlify
2. Trigger et nyt deploy:
   - Gå til **Deploys** tab
   - Klik **Trigger deploy** → **Deploy site**
3. Buildet skulle nu gennemføres succesfuldt

## Verification

Efter deployment, tjek at:
- ✅ Build gennemføres uden fejl
- ✅ Site loader korrekt
- ✅ Supabase forbindelse virker (login/signup)
- ✅ Ingen console errors relateret til Supabase

## Node Version Note

Netlify bruger Node 18.x, men Supabase anbefaler Node 20+. Dette er kun en warning og påvirker ikke funktionaliteten. Hvis du vil opdatere:

1. Tilføj en `.nvmrc` fil i projektets rod:
   ```
   20
   ```
2. Eller tilføj til `netlify.toml`:
   ```toml
   [build.environment]
   NODE_VERSION = "20"
   ```

## Status
✅ **FIXED** - Koden understøtter nu begge variable navne
⏳ **PENDING** - Netlify environment variables skal konfigureres manuelt

## Related Files
- `utils/supabase/client.ts` - Opdateret til at understøtte begge variable navne
- `netlify.toml` - Build konfiguration
- `.env.local` - Lokale environment variables (ikke i git)
