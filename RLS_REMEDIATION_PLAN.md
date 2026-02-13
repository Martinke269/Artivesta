# RLS Remediation Plan
**Generated:** 2026-02-11  
**Database:** Art Marketplace MVP  
**Total Issues Found:** 47  
**Critical Issues:** 12  
**High Priority Issues:** 18  
**Medium Priority Issues:** 12  
**Low Priority Issues:** 5

---

## 🚨 CRITICAL PRIORITY (Immediate Action Required)

These issues represent complete system breakage or severe data leakage risks. Deploy immediately.

---

### 1. commission_history - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Users cannot view their commission history.

**Impact:** Commission tracking completely broken; artists/galleries cannot see earnings.

**SQL Fix:**
```sql
-- Allow users to view their own commission history
CREATE POLICY "Users can view own commission history"
ON commission_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all commission history
CREATE POLICY "Admins can view all commission history"
ON commission_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow system to insert commission history records
CREATE POLICY "System can insert commission history"
ON commission_history
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

### 2. commission_rules - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Commission calculation system cannot function.

**Impact:** Cannot apply commission rules; admin cannot manage rules; financial calculations broken.

**SQL Fix:**
```sql
-- Allow admins to manage commission rules
CREATE POLICY "Admins can manage commission rules"
ON commission_rules
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

-- Allow service role to read commission rules for calculations
CREATE POLICY "Service role can read commission rules"
ON commission_rules
FOR SELECT
TO service_role
USING (true);
```

---

### 3. escrow_disputes - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Users cannot raise or view disputes.

**Impact:** Dispute resolution system completely broken; order parties cannot escalate issues.

**SQL Fix:**
```sql
-- Allow order parties to create disputes
CREATE POLICY "Order parties can create disputes"
ON escrow_disputes
FOR INSERT
TO authenticated
WITH CHECK (
  raised_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = escrow_disputes.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- Allow order parties to view their disputes
CREATE POLICY "Order parties can view own disputes"
ON escrow_disputes
FOR SELECT
TO authenticated
USING (
  raised_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = escrow_disputes.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- Allow admins to manage all disputes
CREATE POLICY "Admins can manage disputes"
ON escrow_disputes
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
```

---

### 4. escrow_releases - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Escrow release tracking broken.

**Impact:** Financial release system cannot function; payment tracking broken.

**SQL Fix:**
```sql
-- Allow order parties to view their escrow releases
CREATE POLICY "Order parties can view own releases"
ON escrow_releases
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = escrow_releases.order_id
    AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);

-- Allow admins to manage all releases
CREATE POLICY "Admins can manage releases"
ON escrow_releases
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

-- Allow service role to insert automated releases
CREATE POLICY "Service role can insert releases"
ON escrow_releases
FOR INSERT
TO service_role
WITH CHECK (true);
```

---

### 5. gallery_artworks - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Gallery system completely broken.

**Impact:** Galleries cannot display artworks; artists cannot see their gallery listings; public cannot browse.

**SQL Fix:**
```sql
-- Allow gallery team to manage their artworks
CREATE POLICY "Gallery team can manage own artworks"
ON gallery_artworks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_artworks.gallery_id
    AND galleries.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM gallery_users
    WHERE gallery_users.gallery_id = gallery_artworks.gallery_id
    AND gallery_users.user_id = auth.uid()
    AND gallery_users.status = 'active'
  )
)
WITH CHECK (
  added_by = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_artworks.gallery_id
      AND galleries.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM gallery_users
      WHERE gallery_users.gallery_id = gallery_artworks.gallery_id
      AND gallery_users.user_id = auth.uid()
      AND gallery_users.role IN ('owner', 'manager')
      AND gallery_users.status = 'active'
    )
  )
);

-- Allow artists to view their artworks in galleries
CREATE POLICY "Artists can view own artworks in galleries"
ON gallery_artworks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM artworks
    WHERE artworks.id = gallery_artworks.artwork_id
    AND artworks.artist_id = auth.uid()
  )
);

-- Allow public to view published artworks
CREATE POLICY "Public can view published gallery artworks"
ON gallery_artworks
FOR SELECT
TO authenticated
USING (published = true AND status = 'active');

-- Allow admins to view all
CREATE POLICY "Admins can view all gallery artworks"
ON gallery_artworks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

### 6. gallery_locations - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Gallery location management broken.

**Impact:** Galleries cannot manage physical locations; public cannot find galleries.

**SQL Fix:**
```sql
-- Allow gallery team to manage their locations
CREATE POLICY "Gallery team can manage own locations"
ON gallery_locations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_locations.gallery_id
    AND galleries.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM gallery_users
    WHERE gallery_users.gallery_id = gallery_locations.gallery_id
    AND gallery_users.user_id = auth.uid()
    AND gallery_users.role IN ('owner', 'manager')
    AND gallery_users.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_locations.gallery_id
    AND galleries.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM gallery_users
    WHERE gallery_users.gallery_id = gallery_locations.gallery_id
    AND gallery_users.user_id = auth.uid()
    AND gallery_users.role IN ('owner', 'manager')
    AND gallery_users.status = 'active'
  )
);

-- Allow public to view active gallery locations
CREATE POLICY "Public can view active gallery locations"
ON gallery_locations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_locations.gallery_id
    AND galleries.status = 'active'
  )
);
```

---

### 7. insurance_policies - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Insurance tracking broken.

**Impact:** Buyers cannot view insurance policies; lease insurance system non-functional.

**SQL Fix:**
```sql
-- Allow lease parties to view insurance policies
CREATE POLICY "Lease parties can view own insurance"
ON insurance_policies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leases
    WHERE leases.id = insurance_policies.lease_id
    AND (leases.lessee_id = auth.uid() OR leases.lessor_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM gallery_leases
    WHERE gallery_leases.id = insurance_policies.lease_id
    AND gallery_leases.buyer_id = auth.uid()
  )
);

-- Allow gallery team to view insurance for their leases
CREATE POLICY "Gallery team can view lease insurance"
ON insurance_policies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM gallery_leases gl
    JOIN galleries g ON gl.gallery_id = g.id
    WHERE gl.id = insurance_policies.lease_id
    AND (
      g.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM gallery_users
        WHERE gallery_users.gallery_id = g.id
        AND gallery_users.user_id = auth.uid()
        AND gallery_users.status = 'active'
      )
    )
  )
);

-- Allow admins to manage all insurance policies
CREATE POLICY "Admins can manage insurance policies"
ON insurance_policies
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

-- Allow service role to insert insurance policies
CREATE POLICY "Service role can insert insurance policies"
ON insurance_policies
FOR INSERT
TO service_role
WITH CHECK (true);
```

---

### 8. lease_renewals - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Lease renewal system broken.

**Impact:** Cannot track or process lease renewals; lessors cannot renew leases.

**SQL Fix:**
```sql
-- Allow lease parties to view their renewals
CREATE POLICY "Lease parties can view own renewals"
ON lease_renewals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM leases
    WHERE leases.id = lease_renewals.lease_id
    AND (leases.lessee_id = auth.uid() OR leases.lessor_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM gallery_leases gl
    WHERE gl.id = lease_renewals.lease_id
    AND (
      gl.buyer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM galleries g
        WHERE g.id = gl.gallery_id
        AND g.owner_id = auth.uid()
      )
    )
  )
);

-- Allow lessors to create renewals
CREATE POLICY "Lessors can create renewals"
ON lease_renewals
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM leases
    WHERE leases.id = lease_renewals.lease_id
    AND leases.lessor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM gallery_leases gl
    JOIN galleries g ON gl.gallery_id = g.id
    WHERE gl.id = lease_renewals.lease_id
    AND (
      g.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM gallery_users
        WHERE gallery_users.gallery_id = g.id
        AND gallery_users.user_id = auth.uid()
        AND gallery_users.role IN ('owner', 'manager')
        AND gallery_users.status = 'active'
      )
    )
  )
);

-- Allow admins to manage all renewals
CREATE POLICY "Admins can manage renewals"
ON lease_renewals
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
```

---

### 9. notification_templates - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Notification system cannot access templates.

**Impact:** Email/notification system broken; cannot send notifications to users.

**SQL Fix:**
```sql
-- Allow admins to manage notification templates
CREATE POLICY "Admins can manage notification templates"
ON notification_templates
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

-- Allow service role to read templates for sending notifications
CREATE POLICY "Service role can read notification templates"
ON notification_templates
FOR SELECT
TO service_role
USING (active = true);
```

---

### 10. project_artworks - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Buyer project management broken.

**Impact:** Buyers cannot manage artwork collections in projects.

**SQL Fix:**
```sql
-- Allow project owners to manage their project artworks
CREATE POLICY "Project owners can manage own project artworks"
ON project_artworks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM buyer_projects
    WHERE buyer_projects.id = project_artworks.project_id
    AND buyer_projects.buyer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM buyer_projects
    WHERE buyer_projects.id = project_artworks.project_id
    AND buyer_projects.buyer_id = auth.uid()
  )
);

-- Allow admins to view all project artworks
CREATE POLICY "Admins can view all project artworks"
ON project_artworks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

### 11. tier_triggers - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Tier evaluation system broken.

**Impact:** Cannot evaluate or upgrade user tiers; partner program non-functional.

**SQL Fix:**
```sql
-- Allow users to view their own tier triggers
CREATE POLICY "Users can view own tier triggers"
ON tier_triggers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to manage all tier triggers
CREATE POLICY "Admins can manage tier triggers"
ON tier_triggers
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

-- Allow service role to insert automated tier triggers
CREATE POLICY "Service role can insert tier triggers"
ON tier_triggers
FOR INSERT
TO service_role
WITH CHECK (true);
```

---

### 12. user_tier_history - NO POLICIES (CRITICAL)

**Problem:** Table has RLS enabled but zero policies. Tier history tracking broken.

**Impact:** Users cannot view tier progression; analytics broken.

**SQL Fix:**
```sql
-- Allow users to view their own tier history
CREATE POLICY "Users can view own tier history"
ON user_tier_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all tier history
CREATE POLICY "Admins can view all tier history"
ON user_tier_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow service role to insert tier history records
CREATE POLICY "Service role can insert tier history"
ON user_tier_history
FOR INSERT
TO service_role
WITH CHECK (true);
```

---

## ⚠️ HIGH PRIORITY (Deploy Within 24 Hours)

These issues represent security vulnerabilities or missing functionality that should be addressed quickly.

---

### 13. buyer_notification_settings - Overly Permissive Role

**Problem:** Policies use {public} role instead of {authenticated}, allowing unauthenticated access.

**Impact:** Security risk - unauthenticated users could potentially manipulate settings.

**SQL Fix:**
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own notification settings" ON buyer_notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON buyer_notification_settings;
DROP POLICY IF EXISTS "Users can view own notification settings" ON buyer_notification_settings;

-- Recreate with authenticated role
CREATE POLICY "Users can insert own notification settings"
ON buyer_notification_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
ON buyer_notification_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notification settings"
ON buyer_notification_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

---

### 14. gallery_users - Missing Write Policies

**Problem:** Only SELECT policy exists. Cannot add, update, or remove team members.

**Impact:** Gallery team management completely broken.

**SQL Fix:**
```sql
-- Allow gallery owners to add team members
CREATE POLICY "Gallery owners can add team members"
ON gallery_users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_users.gallery_id
    AND galleries.owner_id = auth.uid()
  )
);

-- Allow gallery owners and managers to update team members
CREATE POLICY "Gallery team can update members"
ON gallery_users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_users.gallery_id
    AND galleries.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM gallery_users gu
    WHERE gu.gallery_id = gallery_users.gallery_id
    AND gu.user_id = auth.uid()
    AND gu.role = 'owner'
    AND gu.status = 'active'
  )
);

-- Allow gallery owners to remove team members
CREATE POLICY "Gallery owners can remove team members"
ON gallery_users
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_users.gallery_id
    AND galleries.owner_id = auth.uid()
  )
);
```

---

### 15. orders - Sellers Cannot Update

**Problem:** Only admins can update orders. Sellers cannot update order status.

**Impact:** Sellers cannot mark orders as shipped or completed.

**SQL Fix:**
```sql
-- Allow sellers to update their orders
CREATE POLICY "Sellers can update own orders"
ON orders
FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());
```

---

### 16. escrow_events - Missing INSERT Policy

**Problem:** No INSERT policy. System cannot create escrow events.

**Impact:** Escrow event tracking broken.

**SQL Fix:**
```sql
-- Allow service role to insert escrow events
CREATE POLICY "Service role can insert escrow events"
ON escrow_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow admins to insert escrow events
CREATE POLICY "Admins can insert escrow events"
ON escrow_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

### 17. audit_logs - Missing INSERT Policy

**Problem:** No INSERT policy. System cannot create audit logs.

**Impact:** Audit trail broken; cannot track system changes.

**SQL Fix:**
```sql
-- Allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

### 18. system_events - Missing INSERT Policy

**Problem:** No INSERT policy. System cannot create system events.

**Impact:** System event tracking broken.

**SQL Fix:**
```sql
-- Allow service role to insert system events
CREATE POLICY "Service role can insert system events"
ON system_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert system events
CREATE POLICY "Authenticated users can insert system events"
ON system_events
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

### 19. notifications - Missing INSERT Policy

**Problem:** No INSERT policy. System cannot create notifications.

**Impact:** Notification system broken; users don't receive notifications.

**SQL Fix:**
```sql
-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications"
ON notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow system to insert notifications
CREATE POLICY "System can insert notifications"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

### 20. commission_calculations - Missing INSERT Policy

**Problem:** No INSERT policy. System cannot create commission calculations.

**Impact:** Commission calculation tracking broken.

**SQL Fix:**
```sql
-- Allow service role to insert commission calculations
CREATE POLICY "Service role can insert commission calculations"
ON commission_calculations
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow system to insert commission calculations
CREATE POLICY "System can insert commission calculations"
ON commission_calculations
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

### 21. gallery_metadata_validations - Missing INSERT Policy

**Problem:** No INSERT policy. System cannot create validation records.

**Impact:** Metadata validation tracking broken.

**SQL Fix:**
```sql
-- Allow service role to insert validations
CREATE POLICY "Service role can insert validations"
ON gallery_metadata_validations
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow gallery team to insert validations
CREATE POLICY "Gallery team can insert validations"
ON gallery_metadata_validations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM galleries
    WHERE galleries.id = gallery_metadata_validations.gallery_id
    AND galleries.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM gallery_users
    WHERE gallery_users.gallery_id = gallery_metadata_validations.gallery_id
    AND gallery_users.user_id = auth.uid()
    AND gallery_users.status = 'active'
  )
);
```

---

### 22-30. Pricing/AI Tables - Overly Permissive Public Access

**Problem:** 13 tables have public read access, exposing internal pricing algorithms and calculations.

**Impact:** Competitive intelligence leak; pricing strategy exposed.

**Tables Affected:**
- calculations
- calculation_inputs
- calculation_factors
- calculation_metadata
- calculation_performance
- calculation_errors
- calculation_edge_cases
- predictions
- prediction_runs
- prediction_stats
- algorithm_versions
- matches
- teams

**SQL Fix:**
```sql
-- For each table, drop public policy and add authenticated policy

-- calculations
DROP POLICY IF EXISTS "Calculations are viewable by everyone" ON calculations;
CREATE POLICY "Authenticated users can view calculations"
ON calculations
FOR SELECT
TO authenticated
USING (true);

-- calculation_inputs
DROP POLICY IF EXISTS "Calculation inputs are viewable by everyone" ON calculation_inputs;
CREATE POLICY "Authenticated users can view calculation inputs"
ON calculation_inputs
FOR SELECT
TO authenticated
USING (true);

-- calculation_factors
DROP POLICY IF EXISTS "Calculation factors are viewable by everyone" ON calculation_factors;
CREATE POLICY "Authenticated users can view calculation factors"
ON calculation_factors
FOR SELECT
TO authenticated
USING (true);

-- calculation_metadata
DROP POLICY IF EXISTS "Calculation metadata is viewable by everyone" ON calculation_metadata;
CREATE POLICY "Authenticated users can view calculation metadata"
ON calculation_metadata
FOR SELECT
TO authenticated
USING (true);

-- calculation_performance
DROP POLICY IF EXISTS "Performance metrics are viewable by everyone" ON calculation_performance;
CREATE POLICY "Authenticated users can view performance metrics"
ON calculation_performance
FOR SELECT
TO authenticated
USING (true);

-- calculation_errors
DROP POLICY IF EXISTS "Calculation errors are viewable by everyone" ON calculation_errors;
CREATE POLICY "Authenticated users can view calculation errors"
ON calculation_errors
FOR SELECT
TO authenticated
USING (true);

-- calculation_edge_cases
DROP POLICY IF EXISTS "Calculation edge cases are viewable by everyone" ON calculation_edge_cases;
CREATE POLICY "Authenticated users can view calculation edge cases"
ON calculation_edge_cases
FOR SELECT
TO authenticated
USING (true);

-- predictions
DROP POLICY IF EXISTS "Allow public read access to predictions" ON predictions;
CREATE POLICY "Authenticated users can view predictions"
ON predictions
FOR SELECT
TO authenticated
USING (true);

-- prediction_runs
DROP POLICY IF EXISTS "Allow public read access to prediction_runs" ON prediction_runs;
CREATE POLICY "Authenticated users can view prediction runs"
ON prediction_runs
FOR SELECT
TO authenticated
USING (true);

-- prediction_stats
DROP POLICY IF EXISTS "Allow public read access to prediction stats" ON prediction_stats;
CREATE POLICY "Authenticated users can view prediction stats"
ON prediction_stats
FOR SELECT
TO authenticated
USING (true);

-- algorithm_versions
DROP POLICY IF EXISTS "Algorithm versions are viewable by everyone" ON algorithm_versions;
CREATE POLICY "Authenticated users can view algorithm versions"
ON algorithm_versions
FOR SELECT
TO authenticated
USING (true);

-- matches (may want to keep public for transparency)
-- Evaluate if public access is intentional for sports data
DROP POLICY IF EXISTS "Allow public read access to matches" ON matches;
CREATE POLICY "Authenticated users can view matches"
ON matches
FOR SELECT
TO authenticated
USING (true);

-- teams (may want to keep public for transparency)
-- Evaluate if public access is intentional for sports data
DROP POLICY IF EXISTS "Allow public read access to teams" ON teams;
CREATE POLICY "Authenticated users can view teams"
ON teams
FOR SELECT
TO authenticated
USING (true);
```

---

## 📋 MEDIUM PRIORITY (Deploy Within 1 Week)

These issues represent minor security improvements or cleanup tasks.

---

### 31. galleries - Duplicate INSERT Policies

**Problem:** Two INSERT policies exist - one with role check, one without.

**Impact:** Inconsistent security; less restrictive policy takes precedence.

**SQL Fix:**
```sql
-- Drop the less restrictive policy
DROP POLICY IF EXISTS "Users can create galleries" ON galleries;

-- Keep the more restrictive policy with role check
-- "Gallery owners can create galleries" already exists
```

---

### 32-34. Duplicate SELECT Policies

**Problem:** Several tables have duplicate SELECT policies.

**Impact:** Unnecessary complexity; no security impact.

**Tables:**
- leases (duplicate buyer view policy)
- lease_payments (duplicate buyer view policy)
- gallery_leases (duplicate buyer view policy)
- gallery_lease_payments (duplicate buyer view policy)

**SQL Fix:**
```sql
-- leases
DROP POLICY IF EXISTS "Buyers can view own leases" ON leases;
-- Keep "Users can view own leases"

-- lease_payments
DROP POLICY IF EXISTS "Buyers can view own lease payments" ON lease_payments;
-- Keep "Users can view own lease payments"

-- gallery_leases
DROP POLICY IF EXISTS "Buyers can view own leases" ON gallery_leases;
-- Keep "Buyers can view own gallery leases"

-- gallery_lease_payments
DROP POLICY IF EXISTS "Buyers can view own lease payments" ON gallery_lease_payments;
-- Keep "Buyers can view own gallery lease payments"
```

---

### 35. news_events - Public Access Review

**Problem:** Public read access to news events.

**Impact:** May be intentional for public news; review business requirements.

**SQL Fix (if restricting):**
```sql
-- Only if public access is NOT intentional
DROP POLICY IF EXISTS "Allow public read access to news_events" ON news_events;
CREATE POLICY "Authenticated users can view news events"
ON news_events
FOR SELECT
TO authenticated
USING (true);
```

---

## 🔧 LOW PRIORITY (Deploy When Convenient)

These are minor improvements or optimizations.

---

### 36-40. Missing DELETE Policies

**Problem:** Most tables lack DELETE policies.

**Impact:** May be intentional (soft deletes preferred); review per table.

**Recommendation:** Evaluate if hard deletes should be allowed. If yes, add admin-only DELETE policies:

```sql
-- Template for adding DELETE policies
CREATE POLICY "Admins can delete [table_name]"
ON [table_name]
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

---

## 📊 Deployment Strategy

### Phase 1: CRITICAL (Deploy Immediately)
1. Deploy fixes 1-12 (tables with NO policies)
2. Test each system:
   - Commission tracking
   - Escrow disputes
   - Gallery artwork display
   - Insurance policies
   - Lease renewals
   - Notifications
   - Project management
   - Tier system

### Phase 2: HIGH PRIORITY (Deploy Within 24 Hours)
1. Deploy fixes 13-21 (missing write policies, security issues)
2. Deploy fixes 22-30 (pricing/AI table restrictions)
3. Test:
   - Gallery team management
   - Order updates by sellers
   - System event logging
   - Notification delivery
   - Pricing data access

### Phase 3: MEDIUM PRIORITY (Deploy Within 1 Week)
1. Deploy fixes 31-35 (cleanup, duplicate policies)
2. Review and adjust based on business requirements

### Phase 4: LOW PRIORITY (Deploy When Convenient)
1. Review DELETE policy requirements
2. Add as needed per business logic

---

## 🧪 Testing Checklist

After deploying each phase, verify:

### Critical Systems
- [ ] Users can view their commission history
- [ ] Commission rules are applied correctly
- [ ] Users can raise and view disputes
- [ ] Escrow releases are tracked
- [ ] Gallery artworks are visible
- [ ] Gallery locations are manageable
- [ ] Insurance policies are viewable
- [ ] Lease renewals work
- [ ] Notifications are sent
- [ ] Project artworks are manageable
- [ ] Tier triggers fire correctly
- [ ] Tier history is tracked

### High Priority Systems
- [ ] Gallery team members can be added/removed
- [ ] Sellers can update order status
