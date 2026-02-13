# RLS Table Audit Report
**Generated:** 2026-02-11  
**Database:** Art Marketplace MVP  
**Total Tables:** 61  
**Tables with RLS Enabled:** 61 (100%)  
**Tables with NO Policies:** 12 (CRITICAL SECURITY ISSUE)

---

## Executive Summary

### ✅ Good News
- All 61 tables have Row Level Security (RLS) **ENABLED**
- 49 tables have at least one policy defined
- Multi-tenant isolation is generally well-implemented for core tables

### 🚨 CRITICAL ISSUES
- **12 tables have RLS enabled but NO policies defined** - This means these tables are completely inaccessible to all users, including legitimate ones
- Several tables have overly permissive public access
- Some tables lack proper INSERT/UPDATE/DELETE policies
- Admin-only tables may be missing service_role access

---

## Tables WITHOUT Any Policies (CRITICAL)

These tables have RLS enabled but **zero policies**, making them completely inaccessible:

### 1. **commission_history** 🔴 CRITICAL
- **Contains:** User financial data (sales, commissions, transaction counts)
- **Columns:** user_id, total_sales_cents, total_commission_cents, transaction_count
- **Risk:** Artists/galleries cannot view their own commission history
- **Required Policies:** 
  - Users view own history
  - Admin view all

### 2. **commission_rules** 🔴 CRITICAL
- **Contains:** Commission calculation rules, rates, tier rules
- **Columns:** entity_type, entity_id, base_rate_percent, fixed_amount_cents, tier_rules
- **Risk:** System cannot apply commission rules; admin cannot manage
- **Required Policies:**
  - Admin full access
  - Service role read access for calculations

### 3. **escrow_disputes** 🔴 CRITICAL
- **Contains:** Order disputes, evidence, resolutions
- **Columns:** order_id, raised_by, dispute_reason, evidence_urls, status, resolution
- **Risk:** Users cannot raise or view disputes; admin cannot resolve
- **Required Policies:**
  - Order parties can create/view own disputes
  - Admin full access

### 4. **escrow_releases** 🔴 CRITICAL
- **Contains:** Financial release records, amounts, approvals
- **Columns:** order_id, amount_cents, released_to, approved_by, transaction_id
- **Risk:** Escrow system cannot function; financial tracking broken
- **Required Policies:**
  - Order parties view own releases
  - Admin full access
  - Service role insert for automated releases

### 5. **gallery_artworks** 🔴 CRITICAL
- **Contains:** Gallery-artwork relationships, consignment terms, commission rates
- **Columns:** gallery_id, artwork_id, commission_percentage, leasing_enabled, published
- **Risk:** Gallery system completely broken; artworks cannot be displayed
- **Required Policies:**
  - Gallery team full access to own artworks
  - Artists view artworks where they're the artist
  - Public view published artworks

### 6. **gallery_locations** 🔴 CRITICAL
- **Contains:** Physical gallery locations, addresses, capacity
- **Columns:** gallery_id, location_name, address, city, is_primary
- **Risk:** Gallery location management broken
- **Required Policies:**
  - Gallery team manage own locations
  - Public view active gallery locations

### 7. **insurance_policies** 🔴 CRITICAL
- **Contains:** Lease insurance policies, coverage amounts, premiums
- **Columns:** lease_id, policy_number, coverage_amount_cents, premium_cents
- **Risk:** Insurance tracking broken; buyers cannot view policies
- **Required Policies:**
  - Lease parties view own insurance
  - Admin full access

### 8. **lease_renewals** 🔴 CRITICAL
- **Contains:** Lease renewal records, new rates, approvals
- **Columns:** lease_id, new_monthly_rate_cents, renewal_type, approved_by
- **Risk:** Lease renewal system broken
- **Required Policies:**
  - Lease parties view own renewals
  - Lessors create/approve renewals
  - Admin full access

### 9. **notification_templates** 🔴 CRITICAL
- **Contains:** System notification templates
- **Columns:** template_name, template_type, body_template, variables
- **Risk:** Notification system cannot access templates
- **Required Policies:**
  - Admin full access
  - Service role read access

### 10. **project_artworks** 🔴 CRITICAL
- **Contains:** Buyer project-artwork relationships
- **Columns:** project_id, artwork_id, installation_date, location_notes
- **Risk:** Buyer project management broken
- **Required Policies:**
  - Project owner full access
  - Admin view all

### 11. **tier_triggers** 🔴 CRITICAL
- **Contains:** Partner tier evaluation triggers
- **Columns:** user_id, trigger_type, trigger_value, new_tier_id
- **Risk:** Tier system cannot evaluate or upgrade users
- **Required Policies:**
  - Users view own triggers
  - Admin full access
  - Service role insert for automated triggers

### 12. **user_tier_history** 🔴 CRITICAL
- **Contains:** Historical tier changes for users
- **Columns:** user_id, tier_id, start_date, end_date, reason
- **Risk:** Users cannot view tier history; analytics broken
- **Required Policies:**
  - Users view own history
  - Admin view all

---

## Tables WITH Policies - Detailed Analysis

### Core User & Profile Tables

#### **profiles** ✅ GOOD
- **RLS:** ON
- **Policies:** 3
  - ✅ Users can insert own profile
  - ✅ Users can update own profile
  - ✅ Users can view all profiles (needed for artist/gallery discovery)
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via auth.uid()

#### **user_preferences** ✅ GOOD
- **RLS:** ON
- **Policies:** 4 (SELECT, INSERT, UPDATE, DELETE)
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via user_id = auth.uid()

#### **notification_preferences** ✅ GOOD
- **RLS:** ON
- **Policies:** 1 (ALL commands)
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via user_id = auth.uid()

---

### Artwork & Sales Tables

#### **artworks** ✅ GOOD
- **RLS:** ON
- **Policies:** 4
  - ✅ Anyone can view available/leased artworks OR own artworks
  - ✅ Artists can insert own artworks (with role check)
  - ✅ Artists can update own artworks
  - ✅ Artists can delete own artworks
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via artist_id = auth.uid()

#### **orders** ⚠️ NEEDS IMPROVEMENT
- **RLS:** ON
- **Policies:** 3
  - ✅ Buyers can create orders (buyer_id = auth.uid())
  - ✅ Users can view own orders (buyer/seller/admin)
  - ✅ Admins can update orders
- **Missing:**
  - ❌ Sellers cannot update order status
  - ❌ No DELETE policy (may be intentional)
- **Tenant Isolation:** ✅ Enforced

#### **payouts** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Users view own payouts
  - ✅ Admins manage all payouts
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via seller_id = auth.uid()

#### **invoices** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Users view own invoices
  - ✅ Admins manage all invoices
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via recipient_id = auth.uid()

---

### Leasing System Tables

#### **leases** ✅ GOOD
- **RLS:** ON
- **Policies:** 4
  - ✅ Users create leases (lessee or lessor)
  - ✅ Users view own leases
  - ✅ Lease parties can update
  - ✅ Buyers can view own leases (duplicate policy)
- **Issues:** Minor - duplicate SELECT policy
- **Tenant Isolation:** ✅ Enforced via lessee_id/lessor_id

#### **lease_payments** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Users view own lease payments (via lease relationship)
  - ✅ Buyers view own lease payments (duplicate)
- **Issues:** Minor - duplicate policy
- **Tenant Isolation:** ✅ Enforced via lease relationship

---

### Gallery System Tables

#### **galleries** ✅ GOOD
- **RLS:** ON
- **Policies:** 4
  - ✅ Anyone can view active galleries
  - ✅ Gallery owners can create galleries (with role check)
  - ✅ Users can create galleries (duplicate, less restrictive)
  - ✅ Owners can update galleries
- **Issues:** Duplicate INSERT policies (one with role check, one without)
- **Tenant Isolation:** ✅ Enforced via owner_id = auth.uid()

#### **gallery_users** ⚠️ NEEDS IMPROVEMENT
- **RLS:** ON
- **Policies:** 1
  - ✅ Gallery members can view users
- **Missing:**
  - ❌ No INSERT policy (cannot add team members)
  - ❌ No UPDATE policy (cannot change roles)
  - ❌ No DELETE policy (cannot remove members)
- **Tenant Isolation:** ✅ Enforced

#### **gallery_leases** ✅ GOOD
- **RLS:** ON
- **Policies:** 6
  - ✅ Gallery team create leases
  - ✅ Gallery team update leases
  - ✅ Gallery team delete leases
  - ✅ Gallery team view leases
  - ✅ Buyers view own leases
  - ✅ Duplicate buyer view policy
- **Issues:** Minor - duplicate SELECT policy
- **Tenant Isolation:** ✅ Enforced

#### **gallery_lease_payments** ✅ GOOD
- **RLS:** ON
- **Policies:** 5
  - ✅ Gallery team create payments
  - ✅ Gallery team update payments
  - ✅ Gallery team view payments
  - ✅ Buyers view own payments
  - ✅ Duplicate buyer view policy
- **Issues:** Minor - duplicate SELECT policy
- **Tenant Isolation:** ✅ Enforced

#### **gallery_onboarding_insights** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Gallery team update insights
  - ✅ Gallery team view insights
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced

#### **gallery_metadata_validations** ✅ GOOD
- **RLS:** ON
- **Policies:** 1
  - ✅ Gallery team view validations
- **Missing:**
  - ❌ No INSERT policy (system may need to create)
- **Tenant Isolation:** ✅ Enforced

#### **gallery_payment_links** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Gallery team create payment links
  - ✅ Gallery team view payment links
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced

---

### Buyer System Tables

#### **buyer_interest** ✅ GOOD
- **RLS:** ON
- **Policies:** 5
  - ✅ Buyers create own interest records
  - ✅ Buyers view own interest records
  - ✅ Buyers delete own interest records
  - ✅ Artists/galleries view interest on own artworks
  - ✅ Admins full access
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced

#### **buyer_locations** ✅ GOOD
- **RLS:** ON
- **Policies:** 1 (ALL commands)
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via buyer_id = auth.uid()

#### **buyer_projects** ✅ GOOD
- **RLS:** ON
- **Policies:** 1 (ALL commands)
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via buyer_id = auth.uid()

#### **buyer_notification_settings** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 3
  - ⚠️ Users insert own settings (role: public - should be authenticated)
  - ⚠️ Users update own settings (role: public - should be authenticated)
  - ⚠️ Users view own settings (role: public - should be authenticated)
- **Issues:** Uses {public} role instead of {authenticated}
- **Tenant Isolation:** ✅ Enforced via user_id = auth.uid()

---

### Escrow System Tables

#### **escrow_events** ✅ GOOD
- **RLS:** ON
- **Policies:** 1
  - ✅ Users view own escrow events (via order relationship)
- **Missing:**
  - ❌ No INSERT policy (system needs to create events)
- **Tenant Isolation:** ✅ Enforced via order relationship

---

### Pricing & AI System Tables

#### **price_history** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Artists/galleries view own artwork price history
  - ✅ Admins full access
- **Issues:** None
- **Tenant Isolation:** ✅ Enforced via artwork relationship

#### **calculations** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Calculations viewable by everyone (role: public)
- **Issues:** Public access to pricing calculations
- **Tenant Isolation:** ❌ None - public access

#### **calculation_inputs** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access to calculation inputs
- **Tenant Isolation:** ❌ None - public access

#### **calculation_factors** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access
- **Tenant Isolation:** ❌ None - public access

#### **calculation_metadata** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access
- **Tenant Isolation:** ❌ None - public access

#### **calculation_performance** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access to performance metrics
- **Tenant Isolation:** ❌ None - public access

#### **calculation_errors** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access to error logs
- **Tenant Isolation:** ❌ None - public access

#### **calculation_edge_cases** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access
- **Tenant Isolation:** ❌ None - public access

#### **predictions** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access to AI predictions
- **Tenant Isolation:** ❌ None - public access

#### **prediction_runs** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 2
  - ⚠️ Public read access
  - ✅ Service role manage
- **Issues:** Public access to prediction runs
- **Tenant Isolation:** ❌ None - public access

#### **prediction_stats** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Public read access
- **Issues:** Public access to prediction statistics
- **Tenant Isolation:** ❌ None - public access

#### **algorithm_versions** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 1
  - ⚠️ Viewable by everyone (role: public)
- **Issues:** Public access to algorithm versions
- **Tenant Isolation:** ❌ None - public access

---

### Market Data Tables

#### **matches** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 2
  - ⚠️ Public read access
  - ✅ Service role insert
- **Issues:** Public access to match data
- **Tenant Isolation:** ❌ None - public access

#### **teams** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 2
  - ⚠️ Public read access
  - ✅ Service role insert
- **Issues:** Public access to team data
- **Tenant Isolation:** ❌ None - public access

#### **news_events** ⚠️ OVERLY PERMISSIVE
- **RLS:** ON
- **Policies:** 2
  - ⚠️ Public read access
  - ✅ Service role full access
- **Issues:** Public access (may be intentional for news)
- **Tenant Isolation:** ❌ None - public access

---

### Admin & System Tables

#### **alerts** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Admin view alerts
  - ✅ Admin manage alerts
- **Issues:** None
- **Tenant Isolation:** ✅ Admin-only

#### **audit_logs** ✅ GOOD
- **RLS:** ON
- **Policies:** 1
  - ✅ Admins view audit logs
- **Missing:**
  - ❌ No INSERT policy (system needs to create logs)
- **Tenant Isolation:** ✅ Admin-only

#### **system_events** ✅ GOOD
- **RLS:** ON
- **Policies:** 1
  - ✅ Admins view system events
- **Missing:**
  - ❌ No INSERT policy (system needs to create events)
- **Tenant Isolation:** ✅ Admin-only

#### **ai_spend_logs** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Admin view logs
  - ✅ System can insert logs
- **Issues:** None
- **Tenant Isolation:** ✅ Admin-only view

---

### Founder OS Tables

#### **founder_projects** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Admin view projects
  - ✅ Admin manage projects
- **Issues:** None
- **Tenant Isolation:** ✅ Admin-only

#### **founder_settings** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Admin view settings
  - ✅ Admin update settings
- **Issues:** None
- **Tenant Isolation:** ✅ Admin-only

#### **project_expenses** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Admin view expenses
  - ✅ Admin manage expenses
- **Issues:** None
- **Tenant Isolation:** ✅ Admin-only

---

### Partner Tier System Tables

#### **partner_tiers** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Anyone view tiers
  - ✅ Admins manage tiers
- **Issues:** None
- **Tenant Isolation:** Public read is intentional

#### **commission_calculations** ✅ GOOD
- **RLS:** ON
- **Policies:** 1
  - ✅ Users view own calculations
- **Missing:**
  - ❌ No INSERT policy (system needs to create)
- **Tenant Isolation:** ✅ Enforced via artist_id

---

### Notification System Tables

#### **notifications** ✅ GOOD
- **RLS:** ON
- **Policies:** 2
  - ✅ Users update own notifications
  - ✅ Users view own notifications
- **Missing:**
  - ❌ No INSERT policy (system needs to create)
- **Tenant Isolation:** ✅ Enforced via user_id = auth.uid()

---

## Summary Statistics

### Policy Coverage by Command Type

| Command | Tables with Policy | Tables Missing Policy |
|---------|-------------------|----------------------|
| SELECT  | 49 | 12 |
| INSERT  | 32 | 29 |
| UPDATE  | 28 | 33 |
| DELETE  | 10 | 51 |

### Security Posture by Category

| Category | Tables | RLS ON | Has Policies | Security Rating |
|----------|--------|--------|--------------|-----------------|
| Core User | 4 | 4 | 4 | ✅ GOOD |
| Artworks & Sales | 5 | 5 | 5 | ✅ GOOD |
| Leasing | 4 | 4 | 3 | ⚠️ FAIR |
| Gallery System | 10 | 10 | 8 | ⚠️ FAIR |
| Buyer System | 4 | 4 | 4 | ✅ GOOD |
| Escrow | 3 | 3 | 1 | 🔴 CRITICAL |
| Pricing/AI | 13 | 13 | 13 | ⚠️ OVERLY PERMISSIVE |
| Admin/System | 6 | 6 | 6 | ✅ GOOD |
| Founder OS | 3 | 3 | 3 | ✅ GOOD |
| Partner Tiers | 5 | 5 | 2 | 🔴 CRITICAL |

---

## Key Findings

### 🔴 Critical Issues (Immediate Action Required)
1. **12 tables have NO policies** - Completely inaccessible
2. **Escrow system broken** - disputes and releases have no policies
3. **Gallery artworks inaccessible** - Core gallery feature broken
4. **Commission system broken** - Rules and history inaccessible
5. **Insurance tracking broken** - No policies on insurance_policies

### ⚠️ High Priority Issues
1. **Overly permissive public access** - 13 pricing/AI tables accessible to everyone
2. **Missing INSERT policies** - System tables cannot be populated
3. **gallery_users incomplete** - Cannot manage team members
4. **buyer_notification_settings** - Uses public role instead of authenticated

### ✅ Strengths
1. All tables have RLS enabled
2. Core user/profile tables well-protected
3. Multi-tenant isolation generally enforced
4. Admin access properly restricted
5. Artwork ownership properly enforced
