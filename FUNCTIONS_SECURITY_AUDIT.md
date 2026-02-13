# Functions Security Audit - STEP 2

**Audit Date:** 2026-02-11  
**Project:** Art Marketplace MVP  
**Database:** Supabase (znkvmklheuidkffvbtvn)

## Executive Summary

⚠️ **CRITICAL SECURITY ISSUE IDENTIFIED**

**12 out of 16 functions (75%) are running as SECURITY DEFINER**, which means they can bypass Row Level Security (RLS) policies and access data across all users.

## Audit Results

### 🔴 HIGH-RISK: Functions Running as SECURITY DEFINER

These functions can bypass RLS and pose significant security risks:

1. **`update_news_events_updated_at`** - DEFINER
2. **`get_project_monthly_ai_spend`** - DEFINER
3. **`update_prediction_accuracy`** - DEFINER
4. **`get_project_daily_ai_spend`** - DEFINER
5. **`get_smoothed_ai_spend`** - DEFINER
6. **`validate_gallery_artwork_metadata`** - DEFINER
7. **`generate_first_artwork_insights`** - DEFINER
8. **`can_gallery_publish_artworks`** - DEFINER
9. **`complete_gallery_onboarding`** - DEFINER
10. **`update_gallery_lease_statuses`** - DEFINER
11. **`update_gallery_lease_payment_statuses`** - DEFINER
12. **`generate_gallery_lease_payments`** - DEFINER

### ✅ SAFE: Functions Running as SECURITY INVOKER

These functions respect RLS policies (correct behavior):

1. **`calculate_commission`** - INVOKER ✅
2. **`get_gallery_lease_days_remaining`** - INVOKER ✅
3. **`update_buyer_notification_settings_updated_at`** - INVOKER ✅
4. **`update_updated_at_column`** - INVOKER ✅

## Security Impact

### Why SECURITY DEFINER is Dangerous:

1. **Bypasses RLS Policies**: Functions run with the privileges of the function owner (typically postgres superuser), not the calling user
2. **Cross-User Data Access**: Can read/write data belonging to any user
3. **Workflow Exploitation**: Automated workflows and AI systems can exploit these functions
4. **Data Leak Risk**: A single vulnerability in function logic can expose all user data

### Specific Risks in This Project:

- **Gallery functions** can access artworks, orders, and payments across all galleries
- **AI spend functions** can read financial data across all projects
- **Lease functions** can modify payment statuses for any user
- **Onboarding functions** can manipulate user states without proper authorization

## Recommended Actions

### Priority 1: Immediate Review (Critical Functions)

These functions handle sensitive operations and should be reviewed first:

1. `complete_gallery_onboarding` - Modifies user state
2. `generate_gallery_lease_payments` - Creates financial records
3. `update_gallery_lease_payment_statuses` - Modifies payment data
4. `can_gallery_publish_artworks` - Authorization check

**Action:** Review each function's code to determine if DEFINER is truly necessary.

### Priority 2: Convert to INVOKER (Preferred Solution)

For most functions, SECURITY INVOKER is the correct choice:

- `validate_gallery_artwork_metadata`
- `generate_first_artwork_insights`
- `update_gallery_lease_statuses`
- `get_project_monthly_ai_spend`
- `get_project_daily_ai_spend`
- `get_smoothed_ai_spend`
- `update_prediction_accuracy`
- `update_news_events_updated_at`

**Action:** Change these to SECURITY INVOKER and ensure RLS policies are properly configured.

### Priority 3: Add Internal Security Checks

If DEFINER is legitimately required (rare cases):

1. Add explicit permission checks inside the function
2. Validate user ownership/access rights
3. Log all function calls for audit trail
4. Document why DEFINER is necessary

## SQL Query Used

```sql
SELECT 
  routine_schema,
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public';
```

## Next Steps

1. **Review function definitions** - Examine the actual SQL code for each DEFINER function
2. **Identify legitimate DEFINER needs** - Determine which functions truly require elevated privileges
3. **Create migration plan** - Convert functions to INVOKER where possible
4. **Test thoroughly** - Ensure RLS policies work correctly after conversion
5. **Document decisions** - Record why any function remains as DEFINER

## Related Security Work

- ✅ Views Security Audit (VIEWS_SECURITY_AUDIT_COMPLETE.md)
- ✅ RLS Implementation (RLS_SECURITY_IMPLEMENTATION.md)
- 🔄 Functions Audit (this document)
- ⏳ Triggers Audit (pending)
- ⏳ Policies Audit (pending)

## Conclusion

This audit reveals a significant security gap. The majority of functions bypass RLS, creating potential data leak vectors. Immediate action is required to:

1. Convert functions to SECURITY INVOKER where possible
2. Add explicit security checks to remaining DEFINER functions
3. Ensure all data access respects user permissions

**Status:** ⚠️ REQUIRES IMMEDIATE ATTENTION
