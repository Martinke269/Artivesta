# Security Fix: gallery_stripe_dashboard View

## Issue Identified

**Date:** February 11, 2026  
**Severity:** CRITICAL  
**Lint Code:** `0010_security_definer_view`

### Problem

The `gallery_stripe_dashboard` view was created with PostgreSQL's default `SECURITY DEFINER` mode, which caused it to execute with the permissions of its creator (likely a highly privileged database administrator) rather than the querying user's permissions.

### Security Impact

**Data at Risk:**
- Stripe account IDs for all galleries
- Onboarding status information
- Payout amounts and transfer volumes
- Financial metrics including commissions
- Alert information about payment failures

**Potential Consequences:**
- Any authenticated user could bypass Row Level Security (RLS)
- Competitor galleries could view each other's financial data
- Malicious actors could identify vulnerable galleries
- GDPR and financial data protection violations
- Loss of trust from gallery partners
- Legal liability exposure

## Root Cause

When the Stripe Connect system was implemented in `supabase/migrations/add_stripe_connect_system.sql`, the view was created without the `security_invoker=on` flag. PostgreSQL defaults to `SECURITY DEFINER` for backwards compatibility, which is dangerous for views in the public schema that are accessible via APIs.

## Solution Applied

### Migration: `fix_gallery_stripe_dashboard_security_invoker`

**Applied:** February 11, 2026

The fix involved:

1. **Dropping the insecure view:**
   ```sql
   DROP VIEW IF EXISTS public.gallery_stripe_dashboard;
   ```

2. **Recreating with security_invoker=on:**
   ```sql
   CREATE VIEW public.gallery_stripe_dashboard
     WITH (security_invoker=on)  -- Critical security flag
     AS
   SELECT
     g.id AS gallery_id,
     g.gallery_name,
     sa.stripe_account_id,
     -- ... rest of view definition
   ```

### How This Works

With `security_invoker=on`:
- The view executes with the permissions of the **querying user**
- RLS policies on underlying tables (`galleries`, `stripe_accounts`, `stripe_payouts`, etc.) are properly enforced
- Galleries can only see their own Stripe data
- Admin users maintain elevated access through their existing RLS policies
- No functionality is lost, only security is properly enforced

## Verification

The fix ensures:

1. ✅ Gallery users can only query their own Stripe data
2. ✅ Admin users can still access all data (via their RLS policies)
3. ✅ The view returns correct aggregated metrics
4. ✅ No performance degradation
5. ✅ RLS policies are properly enforced

## Prevention

To prevent similar issues in the future:

### Best Practices

1. **Always use security_invoker for public views:**
   ```sql
   CREATE VIEW public.my_view
     WITH (security_invoker=on)
     AS ...
   ```

2. **Run Supabase Security Advisor regularly:**
   - Check for `security_definer_view` lints
   - Address all ERROR-level security issues immediately

3. **Code Review Checklist:**
   - [ ] All views in public schema use `security_invoker=on`
   - [ ] RLS policies are tested with different user roles
   - [ ] No sensitive data exposed without proper access control

4. **Testing:**
   - Test views with non-admin users
   - Verify RLS policies block unauthorized access
   - Use Supabase's built-in security testing tools

## Related Documentation

- [Supabase Security Advisor Lint 0010](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)
- [PostgreSQL SECURITY INVOKER Documentation](https://www.postgresql.org/docs/current/sql-createview.html)
- [RLS Security Implementation](RLS_SECURITY_IMPLEMENTATION.md)
- [Stripe Connect Implementation](docs/STRIPE_CONNECT_IMPLEMENTATION.md)

## Timeline

- **Issue Created:** During Stripe Connect implementation
- **Issue Discovered:** February 11, 2026 (via Supabase Security Advisor)
- **Issue Fixed:** February 11, 2026 (same day)
- **Exposure Window:** Minimal (caught before production deployment)

## Lessons Learned

1. **Default is Dangerous:** PostgreSQL's `SECURITY DEFINER` default is a security trap
2. **Automated Scanning Works:** Supabase Security Advisor caught this before production
3. **Fast Response Critical:** Security issues should be fixed immediately
4. **Documentation Matters:** Clear documentation helps prevent recurrence

## Status

✅ **RESOLVED** - The security vulnerability has been fixed and verified.

The `gallery_stripe_dashboard` view now properly enforces RLS policies and galleries can only access their own financial data.
