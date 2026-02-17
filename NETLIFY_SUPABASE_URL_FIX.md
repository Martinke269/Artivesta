# Netlify Supabase URL Fix

## Problem
The Netlify build fails with error: `Error: supabaseUrl is required.`

The build error occurs because the Stripe webhook route (`app/api/stripe/webhook/route.ts`) creates a Supabase client using `process.env.NEXT_PUBLIC_SUPABASE_URL`, but this environment variable is not configured in Netlify.

## Root Cause
Looking at the Netlify resolved config (from the error logs), the environment variables include:
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ `NEXT_PUBLIC_SUPABASE_URL` (MISSING)

The webhook route at line 10-11 tries to create a Supabase client:
```typescript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // ← This is undefined on Netlify
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // ...
);
```

## Solution

### Step 1: Add Missing Environment Variable to Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site
3. Navigate to: **Site settings** → **Build & deploy** → **Environment** → **Environment variables**
4. Click **Add a variable** or **Add environment variable**
5. Add the following:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://znkvmklheuidkffvbtvn.supabase.co`
   - **Scopes**: Select all (Production, Deploy Previews, Branch deploys)
6. Click **Save**

### Step 2: Verify All Required Environment Variables

Ensure these environment variables are set in Netlify:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://znkvmklheuidkffvbtvn.supabase.co` | **REQUIRED** - Missing from current config |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | ✅ Already set |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | ✅ Already set (keep secret!) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.artissafe.dk` | ✅ Already set |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | ✅ Already set |
| `STRIPE_WEBHOOK_SECRET` | Your webhook secret | ✅ Already set |
| `NEXT_TELEMETRY_DISABLED` | `1` | ✅ Already set |
| `NODE_VERSION` | `20` | ✅ Already set |

### Step 3: Trigger a New Deploy

After adding the environment variable:

1. In Netlify dashboard, go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Or push a new commit to trigger automatic deployment

### Step 4: Verify the Build

Monitor the build logs to confirm:
- ✅ No "supabaseUrl is required" error
- ✅ Build completes successfully
- ✅ All pages are generated without errors

## Additional Recommendations

### 1. Update Node.js Version (Optional but Recommended)

The build logs show warnings about Node.js 18 being deprecated:
```
⚠️  Node.js 18 and below are deprecated and will no longer be supported 
    in future versions of @supabase/supabase-js
```

The `NODE_VERSION` environment variable is already set to `20` in Netlify, which is good. This warning should disappear after the next successful build.

### 2. Test Locally Before Deploying

Always test the build locally first:
```bash
npm run build
```

This will catch environment variable issues before deployment.

### 3. Keep .env.local Updated

Ensure your local `.env.local` matches the Netlify environment variables (except for secret values which should be different between local/production).

## Verification Checklist

After deploying, verify:

- [ ] Build completes without errors
- [ ] No "supabaseUrl is required" errors in logs
- [ ] Webhook route is accessible: `https://www.artissafe.dk/api/stripe/webhook`
- [ ] Stripe webhooks can successfully call your endpoint
- [ ] Database operations work correctly in production

## Troubleshooting

### If the error persists after adding the variable:

1. **Clear Netlify cache**: In Netlify dashboard → **Site settings** → **Build & deploy** → **Build settings** → Click **Clear cache and retry deploy**

2. **Verify variable name exactly matches**: It must be `NEXT_PUBLIC_SUPABASE_URL` (case-sensitive)

3. **Check variable scope**: Ensure the variable is available for the deployment context (Production/Deploy Preview/Branch)

4. **Inspect build logs**: Look for the environment variables section to confirm the variable is being loaded

### If you see other Supabase-related errors:

- Verify `SUPABASE_SERVICE_ROLE_KEY` is correctly set (this is different from the anon key)
- Ensure the Supabase project is active and accessible
- Check Supabase project settings for any API restrictions

## Related Files

- `app/api/stripe/webhook/route.ts` - The file that requires the Supabase URL
- `.env.local` - Local environment variables (for reference only, not deployed)
- `netlify.toml` - Netlify configuration file

## Summary

The fix is straightforward: add `NEXT_PUBLIC_SUPABASE_URL=https://znkvmklheuidkffvbtvn.supabase.co` to your Netlify environment variables and redeploy. This will resolve the build error and allow the Stripe webhook route to properly initialize the Supabase client.
