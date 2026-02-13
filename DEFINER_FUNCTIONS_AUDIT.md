# DEFINER Functions Security Audit

## Executive Summary

After analyzing all database functions, **only 2 functions should have SECURITY DEFINER**:

1. `check_long_term_listings()` - Cron job function
2. `update_gallery_lease_statuses()` - System maintenance function

All other functions (29 total) should be changed to **SECURITY INVOKER** (default).

---

## Functions That MUST Be DEFINER (2)

### 1. `check_long_term_listings()`
**File:** `add_ai_behavior_monitoring.sql`  
**Reason:** Called by cron job without user context  
**Usage:** `app/api/cron/check-long-term-listings/route.ts`  
**Justification:** Needs to scan all artworks across all users to create diagnostics

### 2. `update_gallery_lease_statuses()` 
**File:** `add_gallery_leasing_system.sql`  
**Reason:** System maintenance function that updates lease statuses  
**Justification:** Should be called by cron job to update statuses across all galleries

---

## Functions That Should Be SECURITY INVOKER (29)

### Category: Trigger Functions (4)
These run in the context of the triggering operation and don't need DEFINER:

1. ✅ `update_updated_at_column()` - Generic trigger, no DEFINER needed
2. ❌ `check_price_change()` - **REMOVE DEFINER** - Runs as artwork owner
3. ❌ `track_artwork_removal()` - **REMOVE DEFINER** - Runs as artwork owner
4. ✅ `update_artwork_analytics_updated_at()` - No DEFINER currently

### Category: User-Callable Functions (16)
These are called by authenticated users and should run with their permissions:

5. ❌ `approve_price_change_seller()` - **REMOVE DEFINER** - Seller approves their own price
6. ❌ `approve_price_change_buyer()` - **REMOVE DEFINER** - Buyer approves for artwork they're interested in
7. ❌ `check_price_approval_complete()` - **REMOVE DEFINER** - Internal helper, can use INVOKER
8. ❌ `reject_price_change()` - **REMOVE DEFINER** - User rejects their own price change
9. ❌ `increment_artwork_view()` - **REMOVE DEFINER** - User views artwork
10. ❌ `record_buyer_interest()` - **REMOVE DEFINER** - User records their own interest
11. ❌ `check_payment_deviation()` - **REMOVE DEFINER** - Called during order creation
12. ❌ `log_escrow_event()` - **REMOVE DEFINER** - Called during order operations
13. ❌ `log_stripe_webhook()` - **REMOVE DEFINER** - Called by webhook handler
14. ❌ `check_high_volume_uploads()` - **REMOVE DEFINER** - Can be INVOKER with proper RLS
15. ❌ `log_audit_event()` - **REMOVE DEFINER** - Logs user's own actions
16. ❌ `generate_gallery_lease_payments()` - **REMOVE DEFINER** - Gallery generates their own payments
17. ❌ `update_gallery_lease_payment_statuses()` - **REMOVE DEFINER** - Can be cron or user-called
18. ❌ `validate_gallery_artwork_metadata()` - **REMOVE DEFINER** - Gallery validates their own artwork
19. ❌ `generate_first_artwork_insights()` - **REMOVE DEFINER** - Gallery generates for their artwork
20. ❌ `can_gallery_publish_artworks()` - **REMOVE DEFINER** - Gallery checks their own status

### Category: Utility Functions (5)
Pure calculation functions that don't need elevated privileges:

21. ✅ `get_gallery_lease_days_remaining()` - IMMUTABLE, no DEFINER needed
22. ✅ `get_lease_days_remaining()` - IMMUTABLE, no DEFINER needed
23. ✅ `get_project_monthly_ai_spend()` - Read-only, no DEFINER needed
24. ✅ `get_project_daily_ai_spend()` - Read-only, no DEFINER needed
25. ✅ `get_smoothed_ai_spend()` - Read-only, no DEFINER needed

### Category: Leasing System (4)
26. ❌ `update_lease_statuses()` - **REMOVE DEFINER** - Can be cron or user-called
27. ❌ `update_lease_payment_statuses()` - **REMOVE DEFINER** - Can be cron or user-called
28. ❌ `generate_lease_payments()` - **REMOVE DEFINER** - User generates their own payments
29. ❌ `complete_gallery_onboarding()` - **REMOVE DEFINER** - Gallery completes their own onboarding

---

## Why Most Functions Don't Need DEFINER

### 1. **RLS Handles Security**
All tables have proper RLS policies. Functions running as SECURITY INVOKER will respect these policies automatically.

### 2. **User Context Is Correct**
Most functions are called by users operating on their own data:
- Artists manage their own artworks
- Galleries manage their own leases
- Buyers track their own interest

### 3. **DEFINER Creates Security Risks**
- Bypasses RLS policies
- Can leak data across users
- Makes security auditing harder
- Violates principle of least privilege

### 4. **Trigger Functions Don't Need DEFINER**
Triggers run in the context of the DML operation (INSERT/UPDATE/DELETE), which already has the correct user context.

---

## Implementation Plan

### Step 1: Update Cron-Only Functions
Keep DEFINER only for:
- `check_long_term_listings()`
- `update_gallery_lease_statuses()`

### Step 2: Remove DEFINER from All Others
Create migration to ALTER all 27 functions to remove SECURITY DEFINER.

### Step 3: Test RLS Policies
Ensure all RLS policies are correct so INVOKER functions work properly.

---

## Security Benefits

1. **Principle of Least Privilege**: Functions only have the permissions of the calling user
2. **RLS Enforcement**: All data access goes through RLS policies
3. **Audit Trail**: Actions are attributed to the correct user
4. **Reduced Attack Surface**: No privilege escalation through functions
5. **Easier Security Review**: Clear separation between system and user operations

---

## Next Steps

1. Create migration to remove SECURITY DEFINER from 27 functions
2. Test all affected functionality
3. Verify RLS policies handle all access patterns
4. Document the 2 remaining DEFINER functions clearly
