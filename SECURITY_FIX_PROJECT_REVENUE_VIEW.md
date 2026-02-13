# Security Fix: project_revenue View

## Issue Resolved
**Date:** February 11, 2026  
**Severity:** CRITICAL (ERROR level)  
**Advisory:** Supabase Security Advisor - security_definer_view

## Problem Description

The `project_revenue` view was created with PostgreSQL's default `SECURITY DEFINER` mode, which caused it to execute with the permissions of the database administrator who created it, rather than the querying user's permissions. This effectively bypassed all Row Level Security (RLS) policies on the underlying `orders` table.

### Security Impact

**Data Exposure Risk:**
- Any authenticated user could query the view and see aggregated revenue data for the entire platform
- This included:
  - Total daily revenue across all orders
  - Commission revenue calculations
  - Artist payout amounts
  - Order counts
- The view bypassed the carefully designed RLS policies that restrict users to only seeing their own orders

**Business Impact:**
- Competitive intelligence leak (artists seeing total platform revenue)
- Business model exposure (commission structures visible to all users)
- Strategic data leak (complete financial performance visible to competitors)

## Solution Implemented

Applied migration `fix_project_revenue_security_definer` which:

1. **Dropped the insecure view**
2. **Recreated with `security_invoker=on`**

```sql
CREATE OR REPLACE VIEW project_revenue
  WITH (security_invoker=on)
AS
SELECT
  '00000000-0000-0000-0000-000000000002'::UUID as project_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as order_count,
  SUM(amount_cents / 100.0) as total_revenue,
  SUM(amount_cents / 100.0 * 0.15) as commission_revenue,
  SUM(amount_cents / 100.0 * 0.85) as artist_payout
FROM orders
WHERE status IN ('completed', 'paid')
GROUP BY DATE_TRUNC('day', created_at);
```

## Security Posture After Fix

With `security_invoker=on`, the view now:
- ✅ Respects RLS policies on the `orders` table
- ✅ Only allows admin users to query the view (per existing RLS policies)
- ✅ Prevents unauthorized access to sensitive financial data
- ✅ Maintains the principle of least privilege

## Verification

**View Configuration Confirmed:**
```
view_name: project_revenue
view_options: ["security_invoker=on"]
```

**Security Advisor Status:**
- ❌ Before: ERROR - security_definer_view detected
- ✅ After: No security_definer_view errors reported

## Migration File

Location: `supabase/migrations/fix_project_revenue_security_definer.sql`

## Best Practices Going Forward

1. **Always use `security_invoker=on` for views** unless there's a specific, documented reason to use `SECURITY DEFINER`
2. **Review all views** when creating them to ensure they don't bypass RLS policies
3. **Run Security Advisor regularly** to catch similar issues early
4. **Document any intentional use of SECURITY DEFINER** with clear security justification

## Related Documentation

- [Supabase Database Linter - Security Definer View](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)
- PostgreSQL SECURITY INVOKER vs SECURITY DEFINER documentation

## Status

✅ **RESOLVED** - Critical security vulnerability successfully patched
