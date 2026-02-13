-- =====================================================
-- RLS REMEDIATION PHASE 3: MEDIUM PRIORITY FIXES
-- =====================================================
-- Generated: 2026-02-11
-- Purpose: Address medium priority RLS issues
-- - Remove duplicate policies
-- - Review and restrict public access where appropriate
-- =====================================================

-- =====================================================
-- 31. galleries - Remove Duplicate INSERT Policy
-- =====================================================
-- Problem: Two INSERT policies exist - one with role check, one without
-- Solution: Keep the more restrictive policy with role check

DROP POLICY IF EXISTS "Users can create galleries" ON galleries;
-- Keep "Gallery owners can create galleries" (more restrictive)

-- =====================================================
-- 32. leases - Remove Duplicate SELECT Policy
-- =====================================================
-- Problem: Duplicate buyer view policies
-- Solution: Keep the more general "Users can view own leases"

DROP POLICY IF EXISTS "Buyers can view own leases" ON leases;
-- Keep "Users can view own leases"

-- =====================================================
-- 33. lease_payments - Remove Duplicate SELECT Policy
-- =====================================================
-- Problem: Duplicate buyer view policies
-- Solution: Keep the more general policy

DROP POLICY IF EXISTS "Buyers can view own lease payments" ON lease_payments;
-- Keep "Users can view own lease payments"

-- =====================================================
-- 34. gallery_leases - Remove Duplicate SELECT Policy
-- =====================================================
-- Problem: Duplicate buyer view policies
-- Solution: Keep "Buyers can view own gallery leases"

DROP POLICY IF EXISTS "Buyers can view own leases" ON gallery_leases;
-- Keep "Buyers can view own gallery leases"

-- =====================================================
-- 35. gallery_lease_payments - Remove Duplicate SELECT Policy
-- =====================================================
-- Problem: Duplicate buyer view policies
-- Solution: Keep "Buyers can view own gallery lease payments"

DROP POLICY IF EXISTS "Buyers can view own lease payments" ON gallery_lease_payments;
-- Keep "Buyers can view own gallery lease payments"

-- =====================================================
-- 36. news_events - Restrict Public Access
-- =====================================================
-- Problem: Public read access may expose internal news/events
-- Solution: Restrict to authenticated users only
-- Note: If public access is intentional for public news, this can be reverted

DROP POLICY IF EXISTS "Allow public read access to news_events" ON news_events;

CREATE POLICY "Authenticated users can view news events"
ON news_events
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage news events
CREATE POLICY "Admins can manage news events"
ON news_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the changes:

-- 1. Check for remaining duplicate policies
-- SELECT schemaname, tablename, policyname, COUNT(*)
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY schemaname, tablename, policyname
-- HAVING COUNT(*) > 1;

-- 2. Verify galleries has only one INSERT policy
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'galleries' AND cmd = 'INSERT';

-- 3. Verify leases has no duplicate SELECT policies
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'leases' AND cmd = 'SELECT';

-- 4. Verify lease_payments has no duplicate SELECT policies
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'lease_payments' AND cmd = 'SELECT';

-- 5. Verify gallery_leases has no duplicate SELECT policies
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'gallery_leases' AND cmd = 'SELECT';

-- 6. Verify gallery_lease_payments has no duplicate SELECT policies
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'gallery_lease_payments' AND cmd = 'SELECT';

-- 7. Verify news_events no longer has public access
-- SELECT policyname, cmd, roles, qual
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'news_events';

-- =====================================================
-- ROLLBACK INSTRUCTIONS
-- =====================================================
-- If issues arise, rollback by recreating the dropped policies:

-- Rollback galleries duplicate policy:
-- CREATE POLICY "Users can create galleries" ON galleries FOR INSERT TO authenticated WITH CHECK (true);

-- Rollback leases duplicate policy:
-- CREATE POLICY "Buyers can view own leases" ON leases FOR SELECT TO authenticated USING (lessee_id = auth.uid());

-- Rollback lease_payments duplicate policy:
-- CREATE POLICY "Buyers can view own lease payments" ON lease_payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM leases WHERE leases.id = lease_payments.lease_id AND leases.lessee_id = auth.uid()));

-- Rollback gallery_leases duplicate policy:
-- CREATE POLICY "Buyers can view own leases" ON gallery_leases FOR SELECT TO authenticated USING (buyer_id = auth.uid());

-- Rollback gallery_lease_payments duplicate policy:
-- CREATE POLICY "Buyers can view own lease payments" ON gallery_lease_payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM gallery_leases WHERE gallery_leases.id = gallery_lease_payments.lease_id AND gallery_leases.buyer_id = auth.uid()));

-- Rollback news_events public access:
-- DROP POLICY IF EXISTS "Authenticated users can view news events" ON news_events;
-- DROP POLICY IF EXISTS "Admins can manage news events" ON news_events;
-- CREATE POLICY "Allow public read access to news_events" ON news_events FOR SELECT TO public USING (true);

-- =====================================================
-- PHASE 3 COMPLETE
-- =====================================================
-- Summary:
-- ✅ Removed 5 duplicate policies
-- ✅ Restricted news_events to authenticated users
-- ✅ Added admin management for news_events
-- ✅ Improved policy consistency across lease tables
-- ✅ Reduced policy complexity and maintenance burden
-- =====================================================
