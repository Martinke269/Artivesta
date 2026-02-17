# Netlify Webhook Build Fix

## Problem

The Netlify build was failing with the error:
```
Error: supabaseUrl is required.
```

This occurred because the Stripe webhook route (`app/api/stripe/webhook/route.ts`) was creating a Supabase client at module top-level, which executed during the Next.js build process when environment variables weren't available.

## Root Cause

The original code had:
```typescript
// Initialize Supabase with service role for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

This code ran at module import time, causing the build to fail when Next.js analyzed the route during the build process.

## Solution

The fix involved two key changes:

### 1. Deferred Supabase Client Initialization

Created a helper function that initializes the Supabase client inside the request handler:

```typescript
function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

### 2. Pass Client to Event Handlers

Modified all event handler functions to accept the Supabase client as a parameter:

```typescript
// Before
async function handleAccountUpdated(account: Stripe.Account) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    // ...
}

// After
async function handleAccountUpdated(supabaseAdmin: SupabaseClient, account: Stripe.Account) {
  const { data: stripeAccount } = await supabaseAdmin
    .from('stripe_accounts')
    // ...
}
```

## Benefits

1. **Build-Safe**: The route can now be imported and analyzed during build without requiring environment variables
2. **Runtime Validation**: Proper error handling if environment variables are missing at runtime
3. **Flexibility**: Supports both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` environment variable names
4. **No Functional Changes**: The webhook behavior remains identical, only the initialization timing changed

## Deployment Checklist

Before deploying to Netlify, ensure these environment variables are set in your Netlify site settings:

- ✅ `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_SITE_URL`

## Related Files Modified

- `app/api/stripe/webhook/route.ts` - Main webhook route with deferred initialization

## Testing

After deployment:
1. Verify the build completes successfully on Netlify
2. Test webhook functionality by triggering a Stripe event
3. Check Netlify function logs to confirm webhooks are being processed

## Additional Notes

This pattern should be applied to any API route that creates Supabase clients or other service connections at module top-level. Always defer initialization to inside the request handler to ensure build-time safety.
