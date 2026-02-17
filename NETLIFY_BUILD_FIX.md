# Netlify Build Error Fix - Supabase Environment Variables

## Problem
The Netlify build was failing with the error:
```
Error: Neither apiKey nor config.authenticator provided
```

This occurred during the Next.js build process when trying to collect page data for API routes.

## Root Cause
The Supabase environment variables were not properly configured in Netlify's build environment. The build process requires these variables to be present, even though the API routes use `export const dynamic = 'force-dynamic'`.

## Solution

### 1. Update Environment Variable Names (COMPLETED ✅)
Updated `utils/supabase/server.ts` to support both naming conventions:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (standard, used by Netlify)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` (legacy, used locally)

### 2. Configure Netlify Environment Variables (ACTION REQUIRED ⚠️)

You must add the following environment variables in Netlify:

**Go to:** Netlify Dashboard → Your Site → Site settings → Build & deploy → Environment variables

Add these variables:

#### Required Supabase Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://znkvmklheuidkffvbtvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpua3Zta2xoZXVpZGtmZnZidHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzk1NDYsImV4cCI6MjA4NTcxNTU0Nn0.YzgeOSDfV1lVxHO42tB9gAcesmvsYVKF8LWcRkG9Uz8
SUPABASE_SERVICE_ROLE_KEY=[GET FROM SUPABASE DASHBOARD]
```

**⚠️ IMPORTANT:** 
- Get your actual `SUPABASE_SERVICE_ROLE_KEY` from: Supabase Dashboard → Settings → API → service_role key
- **NEVER** commit this key to git or expose it publicly
- This key bypasses Row Level Security (RLS) - use only in server-side code

#### Required Stripe Variables:
```
STRIPE_SECRET_KEY=[YOUR STRIPE SECRET KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR STRIPE PUBLISHABLE KEY]
STRIPE_WEBHOOK_SECRET=[YOUR STRIPE WEBHOOK SECRET]
```

#### Required Site Variables:
```
NEXT_PUBLIC_SITE_URL=https://www.artissafe.dk
NEXT_TELEMETRY_DISABLED=1
NODE_VERSION=20
```

### 3. How to Add Environment Variables in Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Build & deploy** → **Environment variables**
4. Click **Add a variable**
5. For each variable:
   - Enter the **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (the actual value from your .env.local)
   - Select **All scopes** (or specific deploy contexts if needed)
   - Click **Create variable**

### 4. Trigger a New Deploy

After adding all environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Monitor the build logs to ensure it completes successfully

## Verification

After deployment, verify:

1. ✅ Build completes without errors
2. ✅ No "Neither apiKey nor config.authenticator provided" errors
3. ✅ API routes are accessible
4. ✅ Supabase authentication works
5. ✅ Database queries execute properly

## Additional Notes

### Environment Variable Naming
- **Client-side variables** must start with `NEXT_PUBLIC_` (exposed to browser)
- **Server-side variables** should NOT start with `NEXT_PUBLIC_` (kept secret)
- The `SUPABASE_SERVICE_ROLE_KEY` is server-only and bypasses RLS

### Security Best Practices
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Never commit sensitive keys to version control
- Use different keys for development and production
- Rotate keys regularly
- Monitor Supabase logs for suspicious activity

### Node.js Version
The build logs showed warnings about Node.js 18 being deprecated. We've set `NODE_VERSION=20` in the environment variables to use a supported version.

## Troubleshooting

If the build still fails:

1. **Check env var values**: Ensure no trailing spaces or quotes
2. **Check env var names**: Must match exactly (case-sensitive)
3. **Check Supabase project**: Ensure it's active and accessible
4. **Check build logs**: Look for specific error messages
5. **Clear build cache**: Netlify → Deploys → Options → Clear cache and retry deploy

## Related Files Modified
- `utils/supabase/server.ts` - Updated to support both env var naming conventions
- `netlify.toml` - Already configured with correct environment variable names

## Next Steps
1. Add all environment variables to Netlify (see section 2 above)
2. Trigger a new deploy
3. Verify the site works correctly
4. Monitor for any runtime errors

---

**Status:** Code changes complete ✅ | Environment variables need to be added in Netlify ⚠️
