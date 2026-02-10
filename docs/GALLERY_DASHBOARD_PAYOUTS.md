# Gallery Dashboard - Payouts Page

## Overview

The Payouts Page provides galleries with comprehensive payout management and payment history tracking. This module displays all payouts from completed orders, including detailed breakdowns of commissions, escrow events, and Stripe payment logs.

## Route

```
/gallery/dashboard/payouts
```

## Features

### 1. Payout Summary Cards

Four summary cards displaying key metrics:

- **Total Udbetalt (DKK)**: Total amount paid out to the gallery
- **Pending Payouts**: Amount awaiting payout
- **Kommission Betalt**: Total platform commission (20%)
- **Gennemførte Udbetalinger**: Number of completed payouts

### 2. Payouts Table

Comprehensive table with the following columns:

- **Kunstværk**: Artwork thumbnail and title
- **Kunstner**: Artist name
- **Køber**: Buyer (masked as "Business Customer" for privacy)
- **Ordre ID**: Shortened order identifier
- **Udbetaling (80%)**: Net payout amount after commission
- **Kommission (20%)**: Platform commission amount
- **Udbetalt dato**: Date of payout completion
- **Status**: Payout status badge (Pending, Approved, Paid, Rejected)
- **Actions**: View details button

#### Sorting Options

- Newest first (default)
- Highest payout
- Status

### 3. Filters

Advanced filtering system with:

- **Search**: Search by artwork title
- **Status**: Filter by payout status (Pending, Approved, Paid, Rejected)
- **Artist**: Filter by specific artist
- **Date Range**: From/To date filters
- **Price Range**: Min/Max payout amount

### 4. Payout Details Drawer

Detailed side drawer showing:

#### Artwork Information
- Artwork image, title, artist name
- Buyer information (masked)

#### Order Information
- Order ID
- Order date
- Order status
- Escrow status
- Payment Intent ID

#### Payout Breakdown
- Total order amount
- Platform commission (20%)
- Net payout amount (80%)

#### Payout Status
- Current status with icon
- Payout date (if completed)
- Approval information (approver name and date)

#### Escrow Timeline
- Chronological list of escrow events
- Event types: held, released, partial_release, refunded, disputed
- Amount, reason, and initiator for each event

#### Stripe Event Logs
- Recent Stripe webhook events
- Event type, timestamp, and processing status

#### Actions
- Download invoice (if available)
- View order details link

## Components

### Query Functions (`lib/supabase/gallery-payouts-queries.ts`)

- `getGalleryPayouts()`: Fetch all payouts for a gallery with filters and sorting
- `getPayoutStats()`: Get payout statistics
- `getPayoutDetails()`: Get detailed information for a specific payout
- `getGalleryArtistsForPayoutFilter()`: Get artist list for filter dropdown

### UI Components

- `PayoutSummaryCards`: Summary statistics cards
- `PayoutsFilters`: Search and filter controls
- `PayoutsTable`: Main payouts table with sorting
- `PayoutDetailsDrawer`: Detailed payout information drawer
- `PayoutsPageClient`: Client-side page orchestrator

### Page Components

- `app/gallery/dashboard/payouts/page.tsx`: Server-side page with auth checks
- `app/gallery/dashboard/payouts/payouts-page-client.tsx`: Client-side logic

## Data Flow

1. **Server-side** (`page.tsx`):
   - Authenticates user
   - Verifies gallery_owner role
   - Fetches gallery ID
   - Passes gallery ID to client component

2. **Client-side** (`payouts-page-client.tsx`):
   - Manages state for payouts, filters, sorting
   - Fetches data using query functions
   - Handles user interactions
   - Opens details drawer

3. **Query Layer** (`gallery-payouts-queries.ts`):
   - Queries payouts table with joins to orders, artworks, profiles
   - Applies RLS policies (only gallery's own payouts)
   - Masks buyer identity for privacy
   - Calculates commission breakdown

## Security

### RLS Policies

The payouts table has RLS enabled with the following policy:

```sql
CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
```

### Data Masking

- Buyer identity is always masked as "Business Customer"
- Only order IDs are shown (shortened to 8 characters)
- Full payment intent IDs are truncated in the UI

### Access Control

- Only authenticated users with `gallery_owner` role can access
- Gallery must exist and be owned by the user
- RLS ensures galleries only see their own payouts

## Database Schema

### Payouts Table

```sql
CREATE TABLE payouts (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  seller_id UUID REFERENCES profiles(id),
  amount_cents INTEGER NOT NULL,
  commission_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Related Tables

- `orders`: Order information
- `artworks`: Artwork details
- `profiles`: User/artist information
- `escrow_events`: Escrow timeline
- `stripe_webhook_logs`: Stripe event logs
- `invoices`: Invoice records

## Edge Cases

### No Payouts

- Empty state displayed with helpful message
- Suggests checking filters

### No Gallery Artists

- Returns empty array
- No payouts can be shown

### Missing Data

- Handles missing artwork images gracefully
- Shows placeholder for missing data
- Truncates long IDs appropriately

### Failed Queries

- Errors logged to console
- Loading states prevent UI flicker
- Graceful fallbacks for missing data

## Testing Checklist

- [ ] Summary cards display correct totals
- [ ] Table loads and displays payouts
- [ ] Sorting works correctly (newest, highest, status)
- [ ] Search filters by artwork title
- [ ] Status filter works
- [ ] Artist filter works
- [ ] Date range filter works
- [ ] Price range filter works
- [ ] Details drawer opens with correct data
- [ ] Escrow timeline displays events
- [ ] Stripe logs display correctly
- [ ] Buyer identity is masked
- [ ] RLS prevents unauthorized access
- [ ] Empty states display correctly
- [ ] Loading states work properly
- [ ] Responsive design works on mobile
- [ ] Invoice download link works (if available)

## Performance Considerations

- Queries use indexes on `seller_id` and `status`
- Joins are optimized with proper foreign keys
- Client-side caching via React state
- Pagination could be added for large datasets
- Drawer lazy-loads details on demand

## Future Enhancements

- [ ] Export payouts to CSV
- [ ] Bulk payout approval (admin)
- [ ] Payout notifications
- [ ] Payout analytics charts
- [ ] Automatic payout scheduling
- [ ] Multi-currency support
- [ ] Payout disputes handling
- [ ] Integration with accounting software

## Related Documentation

- [Gallery Dashboard Orders](./GALLERY_DASHBOARD_ORDERS.md)
- [Gallery Dashboard Analytics](./GALLERY_DASHBOARD_ANALYTICS.md)
- [RLS Security Implementation](../RLS_SECURITY_IMPLEMENTATION.md)
- [AI Behavior Monitoring System](../AI_BEHAVIOR_MONITORING_SYSTEM.md)
