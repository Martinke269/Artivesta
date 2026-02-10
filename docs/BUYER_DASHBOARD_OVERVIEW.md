# Buyer Dashboard Overview Page

## 📋 Overview

The Buyer Dashboard Overview Page provides buyers (business users) with a comprehensive view of their orders, leasing agreements, and insurance status.

**Route:** `/buyer/dashboard`

**Access:** Authenticated users with `role = 'business'`

---

## 🎯 Functionality

### 1. Summary Cards (4 Cards)

Displays key metrics at a glance:

- **Aktive leasingaftaler**: Count of active leasing agreements
- **Åbne ordrer**: Count of pending/paid orders
- **Betalte fakturaer**: Count of paid invoices
- **Forsikringsstatus**: Overall insurance status (OK/Udløber snart/Mangler)

### 2. Recent Activities

Timeline of recent buyer activities:
- New orders
- Lease payments (paid/overdue)
- Insurance reminders
- System notifications

Features:
- Scrollable list (max 10 items)
- Activity type icons
- Status badges
- Relative timestamps in Danish

### 3. Orders Mini-Table

Shows the 5 most recent orders:
- Artwork image and title
- Order ID (truncated)
- Order date
- Amount
- Status badge

Link: "Se alle" → `/buyer/dashboard/orders`

### 4. Leasing Mini-Table

Shows the 5 most active leasing agreements:
- Artwork image and title
- Monthly price
- Days remaining
- Status badge

Link: "Se alle" → `/buyer/dashboard/leasing`

### 5. Insurance Status

Categorized insurance overview:

**Manglende forsikring (Missing)**
- Red alert
- List of artworks without insurance
- Call-to-action to contact gallery

**Udløber snart (Expiring Soon)**
- Yellow warning
- List of artworks with insurance expiring within 30 days
- Expiration dates

**Gyldig forsikring (Valid)**
- Green confirmation
- List of artworks with valid insurance
- Coverage end dates

---

## 🔒 Security

### RLS Policies

All queries respect Row Level Security:

**Orders Table:**
- Buyers can only view orders where `buyer_id = auth.uid()`

**Leases Tables:**
- `leases`: Buyers can view where `lessee_id = auth.uid()`
- `gallery_leases`: Buyers can view where `buyer_id = auth.uid()`

**Lease Payments:**
- Buyers can only view payments for their own leases

**Invoices:**
- Buyers can only view invoices where `recipient_id = auth.uid()`

### Access Control

- Page requires authentication
- Redirects to `/auth/login` if not authenticated
- Redirects to `/` if user role is not `business`
- No gallery or artist data is exposed

---

## 🧩 Components

### Server Components

**`app/buyer/dashboard/page.tsx`**
- Main page component
- Fetches all dashboard data
- Handles authentication and authorization

### Client Components

**`components/buyer/dashboard/summary-cards.tsx`**
- Displays 4 summary metric cards
- Dynamic insurance status badge

**`components/buyer/dashboard/recent-activities.tsx`**
- Scrollable activity timeline
- Activity type icons and status badges
- Danish relative timestamps

**`components/buyer/dashboard/orders-mini-table.tsx`**
- Compact order list with images
- Price formatting
- Status badges
- Link to full orders page

**`components/buyer/dashboard/leasing-mini-table.tsx`**
- Compact lease list with images
- Days remaining calculation
- Status badges
- Link to full leasing page

**`components/buyer/dashboard/insurance-status.tsx`**
- Categorized insurance display
- Color-coded alerts
- Expiration date formatting

---

## 📊 Queries

### `lib/supabase/buyer-queries.ts`

**`getBuyerOverviewStats(userId)`**
- Returns: `BuyerOverviewStats`
- Counts active leases, open orders, paid invoices
- Determines overall insurance status

**`getBuyerRecentActivities(userId, limit = 10)`**
- Returns: `BuyerActivity[]`
- Fetches recent orders and lease payments
- Sorts by date descending

**`getBuyerRecentOrders(userId, limit = 5)`**
- Returns: `BuyerOrder[]`
- Fetches recent orders with artwork details
- Includes images and pricing

**`getBuyerActiveLeases(userId, limit = 5)`**
- Returns: `BuyerLease[]`
- Fetches active/expiring leases
- Calculates days remaining

**`getBuyerInsuranceStatus(userId)`**
- Returns: `{ missing, expiring, valid }`
- Categorizes leases by insurance status
- Includes coverage dates

---

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- 2-column layout on desktop (lg breakpoint)
- Stacked layout on mobile

### Loading States
- Server-side data fetching
- No loading skeletons needed (SSR)

### Empty States
- Friendly messages when no data
- Relevant icons
- Danish text

### Status Badges
- Color-coded by status
- Consistent across components
- Danish labels

### Danish Localization
- All UI text in Danish
- Date formatting with `da` locale
- Currency formatting (DKK)

---

## 🧪 Edge Cases

### No Data Scenarios

**No Orders:**
- Shows empty state with package icon
- Message: "Ingen ordrer endnu"

**No Leases:**
- Shows empty state with file icon
- Message: "Ingen aktive leasingaftaler"

**No Activities:**
- Shows empty state with bell icon
- Message: "Ingen aktiviteter endnu"

**No Insurance Issues:**
- Shows empty state with shield icon
- Message: "Ingen leasingaftaler med forsikring"

### Data Integrity

**Missing Artwork Data:**
- Fallback to "Ukendt kunstværk"
- Placeholder icon instead of image

**Missing Dates:**
- Graceful handling of null dates
- No display if date is missing

**Currency Handling:**
- Defaults to DKK
- Proper formatting with Intl.NumberFormat

---

## 🧪 Testing Guide

### Manual Testing

1. **Authentication**
   - [ ] Redirects to login when not authenticated
   - [ ] Redirects to home if not business user
   - [ ] Loads successfully for business users

2. **Summary Cards**
   - [ ] Displays correct counts
   - [ ] Insurance status updates correctly
   - [ ] Icons display properly

3. **Recent Activities**
   - [ ] Shows mixed activity types
   - [ ] Timestamps are in Danish
   - [ ] Status badges are correct
   - [ ] Scrolls when > 10 items

4. **Orders Mini-Table**
   - [ ] Shows up to 5 orders
   - [ ] Images load correctly
   - [ ] Prices format correctly
   - [ ] "Se alle" link works
   - [ ] Empty state shows when no orders

5. **Leasing Mini-Table**
   - [ ] Shows up to 5 leases
   - [ ] Days remaining calculates correctly
   - [ ] Status badges are accurate
   - [ ] "Se alle" link works
   - [ ] Empty state shows when no leases

6. **Insurance Status**
   - [ ] Categorizes correctly
   - [ ] Missing insurance shows red alert
   - [ ] Expiring shows yellow warning
   - [ ] Valid shows green confirmation
   - [ ] Dates format correctly
   - [ ] Empty state shows when no leases

7. **Responsive Design**
   - [ ] Mobile layout stacks correctly
   - [ ] Desktop shows 2-column layout
   - [ ] All components are readable on small screens

### RLS Testing

1. **Create test users:**
   - Business user A
   - Business user B

2. **Create test data:**
   - Orders for both users
   - Leases for both users

3. **Verify isolation:**
   - [ ] User A only sees their own orders
   - [ ] User A only sees their own leases
   - [ ] User A only sees their own activities
   - [ ] User B data is completely hidden from User A

---

## 🚀 Future Enhancements

### Phase 2 Features

1. **Quick Actions**
   - Pay overdue invoices
   - Renew expiring leases
   - Update insurance

2. **Notifications**
   - Real-time activity updates
   - Push notifications for important events

3. **Filters**
   - Filter activities by type
   - Date range selection

4. **Export**
   - Download order history
   - Export lease agreements

5. **Analytics**
   - Spending trends
   - Lease utilization

---

## 📝 Notes

- All UI text is in Danish as per requirements
- Uses shadcn/ui components throughout
- Follows the same pattern as Gallery Dashboard
- RLS ensures complete data isolation
- No backend changes required - uses existing tables
- Insurance tracking is specific to gallery leases

---

## ✅ Completion Checklist

- [x] RLS policies added for buyer access
- [x] Query functions created
- [x] Summary cards component
- [x] Recent activities component
- [x] Orders mini-table component
- [x] Leasing mini-table component
- [x] Insurance status component
- [x] Main page component
- [x] Documentation created
- [ ] Manual testing completed
- [ ] RLS testing completed
- [ ] User acceptance testing

---

**Status:** ✅ Module Complete - Ready for Testing

**Next Module:** Buyer Orders Page
