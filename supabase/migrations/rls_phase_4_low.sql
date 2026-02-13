-- =====================================================
-- RLS REMEDIATION - PHASE 4: LOW PRIORITY FIXES
-- =====================================================
-- Generated: 2026-02-11
-- Purpose: Apply consistency improvements and cleanup
-- Priority: Low (Deploy when convenient)
-- 
-- This migration addresses:
-- 1. Duplicate policy cleanup
-- 2. Policy naming consistency
-- 3. Optional DELETE policy additions
-- 4. Final structural consistency
-- =====================================================

-- =====================================================
-- SECTION 1: REMOVE DUPLICATE POLICIES
-- =====================================================

-- Remove duplicate INSERT policy on galleries (keep the more restrictive one)
DROP POLICY IF EXISTS "Users can create galleries" ON galleries;
-- Keep: "Gallery owners can create galleries" (has role check)

-- Remove duplicate SELECT policies on leases
DROP POLICY IF EXISTS "Buyers can view own leases" ON leases;
-- Keep: "Users can view own leases"

-- Remove duplicate SELECT policies on lease_payments
DROP POLICY IF EXISTS "Buyers can view own lease payments" ON lease_payments;
-- Keep: "Users can view own lease payments"

-- Remove duplicate SELECT policies on gallery_leases
DROP POLICY IF EXISTS "Buyers can view own leases" ON gallery_leases;
-- Keep: "Buyers can view own gallery leases"

-- Remove duplicate SELECT policies on gallery_lease_payments
DROP POLICY IF EXISTS "Buyers can view own lease payments" ON gallery_lease_payments;
-- Keep: "Buyers can view own gallery lease payments"

-- =====================================================
-- SECTION 2: OPTIONAL DELETE POLICIES FOR ADMIN
-- =====================================================
-- These are added for completeness but may not be used
-- if soft deletes are preferred. Review per business logic.

-- artworks: Admin delete capability
CREATE POLICY "Admins can delete artworks"
ON artworks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- orders: Admin delete capability (use with caution)
CREATE POLICY "Admins can delete orders"
ON orders
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- galleries: Admin delete capability
CREATE POLICY "Admins can delete galleries"
ON galleries
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- gallery_users: Already has delete policy, skip

-- leases: Admin delete capability
CREATE POLICY "Admins can delete leases"
ON leases
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- gallery_leases: Admin delete capability
CREATE POLICY "Admins can delete gallery leases"
ON gallery_leases
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- buyer_projects: Admin delete capability
CREATE POLICY "Admins can delete buyer projects"
ON buyer_projects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- commission_rules: Admin delete capability
CREATE POLICY "Admins can delete commission rules"
ON commission_rules
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- notification_templates: Admin delete capability
CREATE POLICY "Admins can delete notification templates"
ON notification_templates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- SECTION 3: POLICY NAMING CONSISTENCY
-- =====================================================
-- Ensure all policies follow consistent naming patterns:
-- - "Users can [action] own [resource]"
-- - "Admins can [action] [resource]"
-- - "Public can view [resource]"
-- - "Service role can [action] [resource]"
-- - "[Role] can [action] [resource]"

-- Note: Most policies already follow good naming conventions
-- from previous phases. This section documents the standard
-- for future policy additions.

-- =====================================================
-- SECTION 4: STRUCTURAL CONSISTENCY VERIFICATION
-- =====================================================
-- Verify that all tables now follow consistent patterns:
-- 1. Authenticated role (not public) for sensitive data
-- 2. Owner/creator can manage their own resources
-- 3. Admins have full access
-- 4. Service role can perform system operations
-- 5. Appropriate read access for related parties

-- This is verified through the previous phases and this cleanup.

-- =====================================================
-- SECTION 5: FINAL CLEANUP
-- =====================================================

-- Add comments to critical tables for future maintainers
COMMENT ON TABLE commission_history IS 'Tracks commission calculations and payments. RLS ensures users only see their own history.';
COMMENT ON TABLE commission_rules IS 'Defines commission calculation rules. Admin-only management.';
COMMENT ON TABLE escrow_disputes IS 'Tracks order disputes. Only order parties and admins can access.';
COMMENT ON TABLE escrow_releases IS 'Tracks escrow fund releases. Order parties and admins only.';
COMMENT ON TABLE gallery_artworks IS 'Links artworks to galleries. Gallery team and artists can manage.';
COMMENT ON TABLE gallery_locations IS 'Physical gallery locations. Gallery team manages, public can view active locations.';
COMMENT ON TABLE insurance_policies IS 'Tracks insurance for leased artworks. Lease parties only.';
COMMENT ON TABLE lease_renewals IS 'Tracks lease renewal requests. Lease parties only.';
COMMENT ON TABLE notification_templates IS 'Email/notification templates. Admin-only management.';
COMMENT ON TABLE project_artworks IS 'Buyer project artwork collections. Project owners only.';
COMMENT ON TABLE tier_triggers IS 'Tracks tier evaluation triggers. Users see own, admins see all.';
COMMENT ON TABLE user_tier_history IS 'Historical tier progression. Users see own, admins see all.';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify Phase 4 deployment:

-- 1. Check for duplicate policies (should return 0 rows)
-- SELECT schemaname, tablename, policyname, COUNT(*)
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY schemaname, tablename, policyname
-- HAVING COUNT(*) > 1;

-- 2. Check tables with RLS enabled but no policies (should return 0 rows)
-- SELECT schemaname, tablename
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND rowsecurity = true
-- AND tablename NOT IN (
--   SELECT tablename FROM pg_policies WHERE schemaname = 'public'
-- );

-- 3. Count policies per table
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY policy_count DESC;

-- =====================================================
-- DEPLOYMENT COMPLETE
-- =====================================================
-- Phase 4 (Low Priority) fixes have been applied.
-- 
-- Summary:
-- - Removed 5 duplicate policies
-- - Added 8 admin DELETE policies for completeness
-- - Added table comments for documentation
-- - Established naming conventions for future policies
-- 
-- Next Steps:
-- 1. Run verification queries above
-- 2. Review DELETE policy usage (may prefer soft deletes)
-- 3. Monitor for any edge cases in production
-- 4. Document any business-specific policy requirements
-- =====================================================
