# Netlify Stripe Build Fix

## Problem
The Netlify build was failing with the error:
```
Error: STRIPE_SECRET_KEY is not set in environment variables
```

This occurred because the Stripe Connect library (`lib/stripe/stripe-connect.ts`) was initializing the Stripe client at module load time (during build), but the `STRIPE_SECRET_KEY` environment variable wasn't available in the Netlify build environment.

## Solution Implemented

### 1. Refactored Stripe Initialization (Code Fix)
Changed `lib/stripe/stripe-connect.ts` to use **lazy initialization** instead of module-level initialization:

**Before:**
```typescript
// This runs at module load time (during build)
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});
```

**After:**
```typescript
let stripeInstance: Stripe | null = null;

// This only runs when actually called (at runtime)
function getStripe(): Stripe {
  if (!stripeInstance) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(stripeKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}
```

All Stripe functions now call `getStripe()` internally, ensuring Stripe is only initialized when actually needed (at request time), not during the build process.

### 2. Updated netlify.toml
Added environment variable declarations to `netlify.toml`:

```toml
[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
  NODE_VERSION = "18"
  NEXT_PUBLIC_SITE_URL = ""
  NEXT_PUBLIC_SUPABASE_URL = ""
  NEXT_PUBLIC_SUPABASE_ANON_KEY = ""
  SUPABASE_SERVICE_ROLE_KEY = ""
  STRIPE_SECRET_KEY = ""
  STRIPE_WEBHOOK_SECRET = ""
```

**Note:** The empty strings are placeholders. The actual values must be set in the Netlify dashboard.

## Required Action in Netlify Dashboard

You must add the following environment variables in your Netlify site settings:

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings → Build & deploy → Environment → Environment variables**
3. Add the following variables with their actual values:

### Required Variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret (starts with `whsec_`)
- `NEXT_PUBLIC_SITE_URL` - Your site URL (e.g., `https://yourdomain.com`)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Where to Find These Values:

**Stripe Keys:**
- Dashboard: https://dashboard.stripe.com/apikeys
- Get your secret key (for production use `sk_live_`, for testing use `sk_test_`)
- Get webhook secret from: https://dashboard.stripe.com/webhooks

**Supabase Keys:**
- Dashboard: https://supabase.com/dashboard/project/[your-project]/settings/api
- Copy the Project URL, anon key, and service_role key

### Important Security Notes:
- ⚠️ **NEVER** commit actual secret keys to your repository
- ⚠️ Use test keys (`sk_test_`) for development/staging environments
- ⚠️ Use live keys (`sk_live_`) only for production environments
- ⚠️ The `service_role` key bypasses RLS - handle with extreme care

## Testing the Fix

After adding the environment variables in Netlify:

1. Trigger a new deploy (or push a commit)
2. The build should now complete successfully
3. Verify that Stripe API routes work correctly at runtime

## Benefits of This Approach

1. **Build-time safety**: The build won't fail if environment variables are temporarily missing
2. **Runtime validation**: Errors only occur when Stripe is actually used, with clear error messages
3. **Performance**: Stripe client is only initialized once per serverless function instance
4. **Best practice**: Follows Next.js recommendations for handling secrets in API routes

## Additional Notes

- The Node.js 18 deprecation warnings can be addressed separately by updating `NODE_VERSION` in netlify.toml to "20" or "22"
- All API routes using Stripe already have `export const dynamic = 'force-dynamic';` to prevent build-time execution
- The lazy initialization pattern is now consistent across all Stripe operations

## Related Files Modified
- `lib/stripe/stripe-connect.ts` - Refactored to use lazy initialization
- `netlify.toml` - Added environment variable declarations
