# Buyer Dashboard - Leasing Page

## Overview

The Buyer Leasing page provides buyers with a comprehensive interface to manage and monitor their artwork leasing agreements. This includes tracking active leases, monitoring insurance status, viewing payment history, and managing lease renewals.

## File Structure

```
app/buyer/dashboard/leasing/
├── page.tsx                    # Server component - data fetching
└── leasing-page-client.tsx     # Client component - UI logic

components/buyer/dashboard/
├── leasing-summary-cards.tsx   # Stats overview cards
├── leasing-filters.tsx         # Filter controls
├── leasing-table.tsx           # Leases table display
└── leasing-details-drawer.tsx  # Detailed lease information

lib/supabase/
└── buyer-leasing-queries.ts    # Database queries
```

## Features

### 1. Summary Cards
- **Active Leases**: Total number of active leasing agreements
- **Total Monthly Payment**: Combined monthly payment across all leases
- **Expiring Within 60 Days**: Leases requiring attention
- **Insurance Status**: Overall insurance health indicator

### 2. Filtering System
**Basic Filters:**
- Search (artwork, artist, gallery)
- Status (active, expiring_soon, overdue, completed, cancelled)
- Insurance Status (valid, expiring_soon, expired, missing)
- Sort By (newest, highest_price, status)

**Advanced Filters:**
- Gallery selection
- Date range (start/end dates)
- Price range (monthly payment)

### 3. Leasing Table
Displays all leases with:
- Artwork thumbnail and details
- Gallery information
- Monthly price
- End date and days remaining
- Status badge
- Insurance status badge
- Action buttons

### 4. Lease Details Drawer
Comprehensive lease information:
- **Artwork Details**: Image, title, artist, category
- **Lease Terms**: Status, monthly price, start/end dates, days remaining
- **Contract**: Download link if available
- **Insurance**: Status, holder, company, policy number, coverage period, documents
- **Gallery Contact**: Name, address, email, phone
- **Payment History**: All payments with dates and status

## Database Schema

### Tables Used
- `gallery_leases`: Main lease records
- `gallery_lease_payments`: Payment history
- `artworks`: Artwork information
- `galleries`: Gallery details
- `profiles`: Artist information

### Key Fields
```typescript
interface BuyerLeaseDetail {
  id: string
  artwork: {
    id: string
    title: string
    artist_name: string
    image_url: string | null
    category: string | null
  }
  gallery: {
    id: string
    name: string
    address: string | null
    city: string | null
    postal_code: string | null
    email: string | null
    phone: string | null
  }
  monthly_price_cents: number
  currency: string
  start_date: string
  end_date: string
  days_remaining: number
  status: 'active' | 'expiring_soon' | 'overdue' | 'completed' | 'cancelled'
  contract_id: string | null
  contract_url: string | null
  insurance_holder: string | null
  insurance_company: string | null
  insurance_policy_number: string | null
  insurance_coverage_start: string | null
  insurance_coverage_end: string | null
  insurance_status: 'valid' | 'expiring_soon' | 'expired' | 'missing'
  insurance_documents: any[]
  payment_history: Array<{
    id: string
    amount_cents: number
    due_date: string
    paid_date: string | null
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  }>
}
```

## Security

### RLS Policies
All queries respect Row Level Security:
- Buyers can only view their own leases (`buyer_id = auth.uid()`)
- Gallery information is filtered to only show relevant details
- Payment history is restricted to the lease owner

### Data Access
- Server-side data fetching with authentication check
- Redirect to login if not authenticated
- No client-side data mutations

## UI Components

### Status Badges
- **Active**: Green badge
- **Expiring Soon**: Yellow badge
- **Overdue**: Red badge
- **Completed**: Gray outline badge
- **Cancelled**: Gray outline badge

### Insurance Badges
- **Valid**: Green with checkmark icon
- **Expiring Soon**: Yellow with clock icon
- **Expired**: Red with alert icon
- **Missing**: Red with alert icon

### Payment Status Badges
- **Paid**: Green badge
- **Pending**: Yellow badge
- **Overdue**: Red badge
- **Cancelled**: Gray outline badge

## User Experience

### Visual Indicators
- Days remaining color-coded:
  - ≤30 days: Red (urgent)
  - ≤60 days: Yellow (warning)
  - >60 days: Normal

### Responsive Design
- Mobile-friendly table with horizontal scroll
- Drawer slides from right on desktop
- Full-screen drawer on mobile
- Collapsible advanced filters

### Empty States
- Clear message when no leases found
- Helpful text for filtered results

## Performance

### Optimization Strategies
1. **Parallel Data Fetching**: Stats, leases, and galleries fetched simultaneously
2. **Client-Side Filtering**: Fast filtering without server round-trips
3. **Memoization**: Stats and initial data cached in state
4. **Lazy Loading**: Drawer content only rendered when opened

### Data Loading
```typescript
const [stats, leases, galleries] = await Promise.all([
  getBuyerLeasingStats(user.id),
  getBuyerLeases(user.id),
  getBuyerLeaseGalleries(user.id),
])
```

## Integration Points

### Navigation
- Accessible from buyer dashboard sidebar
- Direct link from overview page leasing mini-table
- Breadcrumb navigation support

### Related Features
- Links to gallery contact information
- Contract document downloads
- Insurance document downloads
- Payment history tracking

## Future Enhancements

### Potential Features
1. **Lease Renewal**: In-app renewal requests
2. **Payment Management**: Direct payment processing
3. **Insurance Upload**: Buyer-uploaded insurance documents
4. **Notifications**: Email/SMS alerts for expiring leases
5. **Export**: Download lease data as PDF/CSV
6. **Calendar Integration**: Add lease dates to calendar
7. **Artwork Swap**: Request to change leased artwork
8. **Early Termination**: Request to end lease early

### Analytics
- Track most popular lease durations
- Monitor insurance compliance rates
- Analyze payment patterns
- Identify renewal opportunities

## Testing Checklist

- [ ] Page loads with correct data
- [ ] All filters work correctly
- [ ] Search functionality works
- [ ] Sorting works for all columns
- [ ] Drawer opens with correct lease details
- [ ] Insurance status displays correctly
- [ ] Payment history shows all payments
- [ ] Gallery contact links work
- [ ] Document downloads work
- [ ] Mobile responsive design works
- [ ] Empty states display correctly
- [ ] Error handling works
- [ ] Authentication redirect works

## Maintenance Notes

### Regular Updates
- Monitor insurance expiration dates
- Update payment status regularly
- Sync with gallery lease management
- Maintain accurate days remaining calculations

### Data Integrity
- Ensure lease status updates automatically
- Verify insurance status calculations
- Validate payment history accuracy
- Check gallery information currency

## Support

For issues or questions:
1. Check RLS policies in Supabase
2. Verify query functions in `buyer-leasing-queries.ts`
3. Review component props and state management
4. Test with different lease scenarios
5. Validate insurance status logic
