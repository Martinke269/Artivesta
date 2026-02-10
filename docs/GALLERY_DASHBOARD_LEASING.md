# Gallery Dashboard - Leasing Module

## Overview

The Leasing module provides galleries with comprehensive tools to manage artwork leasing agreements, including contract tracking, insurance management, payment monitoring, and automated alerts for expiring leases.

## Features

### 1. Leasing Overview
- **Summary Cards**: Quick metrics showing active leases, expiring agreements, insurance status, and monthly revenue
- **Real-time Alerts**: Notifications for leases expiring within 60 days and insurance issues
- **Export Functionality**: Export leasing data to CSV for external analysis

### 2. Lease Management
- **Comprehensive Tracking**: Monitor all lease agreements with detailed information
- **Status Indicators**: Visual badges showing lease status (Active, Expiring Soon, Overdue, Completed, Cancelled)
- **Sortable Table**: Sort by artwork, artist, lessee, period, or price
- **Detailed View**: Drawer interface showing complete lease information

### 3. Insurance Management
- **Policy Tracking**: Monitor insurance policy numbers, providers, and expiry dates
- **Holder Information**: Track whether insurance is held by gallery, buyer, or external party
- **Expiry Alerts**: Automatic warnings for policies expiring within 30 days
- **Status Badges**: Visual indicators for insurance validity

### 4. Advanced Filtering
- **Search**: Find leases by artwork title, artist name, or lessee information
- **Status Filters**: Filter by active, expiring soon, overdue, completed, or cancelled
- **Insurance Filters**: Filter by insurance status (valid, expiring soon, expired, missing)
- **Date Range**: Filter by start and end dates
- **Price Range**: Filter by monthly lease price
- **Artist Filter**: Filter by specific artists

### 5. Lease Actions
- **Generate Invoice**: Create invoices for lease payments
- **Update Insurance**: Modify insurance information
- **Extend Lease**: Extend active lease agreements
- **Cancel Lease**: Cancel active leases with proper documentation

## File Structure

```
app/gallery/dashboard/leasing/
├── page.tsx                      # Server component - data fetching
└── leasing-page-client.tsx       # Client component - UI and interactions

components/gallery/dashboard/
├── leasing-summary-cards.tsx     # Summary statistics cards
├── leasing-filters.tsx           # Advanced filtering interface
├── leasing-table.tsx             # Main leasing table with sorting
└── leasing-details-drawer.tsx    # Detailed lease information drawer

lib/supabase/
└── gallery-leasing-queries.ts    # Database queries for leasing data
```

## Database Schema

### artwork_leases Table
```sql
- id: UUID (Primary Key)
- artwork_id: UUID (Foreign Key to artworks)
- buyer_id: UUID (Foreign Key to profiles)
- gallery_id: UUID (Foreign Key to galleries)
- start_date: DATE
- end_date: DATE
- duration_months: INTEGER
- monthly_price: INTEGER (in cents)
- total_price: INTEGER (in cents)
- deposit_amount: INTEGER (in cents, optional)
- status: TEXT (active, completed, cancelled)
- delivery_address: TEXT
- insurance_policy_number: TEXT
- insurance_provider: TEXT
- insurance_expiry_date: DATE
- insurance_holder: TEXT (gallery, buyer, external)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Component Details

### LeasingSummaryCards
Displays key metrics:
- Active leases count
- Total monthly revenue
- Leases expiring within 60 days
- Insurance status (OK vs Missing)

**Props:**
```typescript
interface LeasingSummaryCardsProps {
  summary: {
    active_leases: number
    total_monthly_revenue: number  // in cents
    expiring_soon: number
    insurance_ok: number
    insurance_missing: number
  }
}
```

### LeasingFilters
Provides comprehensive filtering options:
- Text search across artwork, artist, and lessee
- Status dropdown (active, expiring soon, overdue, completed, cancelled)
- Insurance status dropdown
- Insurance holder dropdown
- Artist dropdown
- Date range inputs
- Price range inputs

**Props:**
```typescript
interface LeasingFiltersProps {
  onFilterChange: (filters: any) => void
  artists?: Array<{ id: string; name: string }>
}
```

### LeasingTable
Main table displaying lease information:
- Sortable columns
- Status and insurance badges
- Hover actions menu
- Empty state handling

**Props:**
```typescript
interface LeasingTableProps {
  leases: any[]
  onViewDetails: (lease: any) => void
  onGenerateInvoice?: (leaseId: string) => void
  onUpdateInsurance?: (leaseId: string) => void
  onExtendLease?: (leaseId: string) => void
  onCancelLease?: (leaseId: string) => void
}
```

### LeasingDetailsDrawer
Comprehensive lease information display:
- Status overview with description
- Artwork details with image
- Lessee contact information
- Lease period and pricing
- Insurance details with alerts
- Notes and metadata
- Action buttons

**Props:**
```typescript
interface LeasingDetailsDrawerProps {
  lease: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerateInvoice?: (leaseId: string) => void
  onUpdateInsurance?: (leaseId: string) => void
  onExtendLease?: (leaseId: string) => void
  onCancelLease?: (leaseId: string) => void
}
```

## Status Logic

### Lease Status
- **Active**: Lease is currently active and not expiring within 30 days
- **Expiring Soon**: Active lease ending within 30 days
- **Overdue**: Lease end date has passed but status is still active
- **Completed**: Lease has been properly completed
- **Cancelled**: Lease was cancelled before completion

### Insurance Status
- **Valid**: Insurance policy exists and expires more than 30 days from now
- **Expiring Soon**: Insurance expires within 30 days
- **Expired**: Insurance expiry date has passed
- **Missing**: No insurance policy number or expiry date

## Query Functions

### getGalleryLeases
Fetches all leases for a gallery with related data:
```typescript
const { data, error } = await getGalleryLeases(supabase, galleryId)
```

Returns leases with:
- Artwork information (title, image, artist)
- Buyer information (name, email, phone, company)
- All lease details and insurance information

### getGalleryArtists
Fetches artists associated with a gallery for filtering:
```typescript
const { data, error } = await getGalleryArtists(supabase, galleryId)
```

Returns array of artists with id and name.

### getLeasingSummary
Calculates summary statistics:
```typescript
const { data, error } = await getLeasingSummary(supabase, galleryId)
```

Returns:
- active_leases: Count of active leases
- total_monthly_revenue: Sum of monthly prices (in cents)
- expiring_soon: Count expiring within 60 days
- insurance_ok: Count with valid insurance
- insurance_missing: Count with missing/expired insurance

## Security (RLS)

All leasing queries enforce Row Level Security:
- Galleries can only view their own leases
- Queries filter by gallery_id automatically
- No cross-gallery data leakage

## Usage Example

```typescript
// In a server component
import { getGalleryLeases, getGalleryArtists } from '@/lib/supabase/gallery-leasing-queries'

const { data: leases } = await getGalleryLeases(supabase, galleryId)
const { data: artists } = await getGalleryArtists(supabase, galleryId)

// Pass to client component
<LeasingPageClient
  initialLeases={leases || []}
  galleryId={galleryId}
  artists={artists || []}
/>
```

## Filtering Logic

The client component applies filters client-side for instant feedback:

1. **Search**: Matches against artwork title, artist name, buyer name, and buyer email
2. **Status**: Calculates days until end date and filters accordingly
3. **Insurance**: Checks policy existence and expiry dates
4. **Date Range**: Filters by start_date and end_date
5. **Price Range**: Filters by monthly_price
6. **Artist**: Filters by artwork.artist.id

## Future Enhancements

### Planned Features
1. **Invoice Generation**: Automated invoice creation and PDF export
2. **Payment Tracking**: Monitor lease payment status and history
3. **Contract Templates**: Customizable lease agreement templates
4. **Email Notifications**: Automated reminders for expiring leases and insurance
5. **Renewal Workflow**: Streamlined process for extending leases
6. **Analytics Dashboard**: Detailed leasing performance metrics
7. **Document Management**: Upload and store lease contracts and insurance documents

### API Endpoints (To Be Implemented)
- `POST /api/gallery/leasing/create` - Create new lease
- `PATCH /api/gallery/leasing/[id]` - Update lease details
- `POST /api/gallery/leasing/[id]/extend` - Extend lease period
- `POST /api/gallery/leasing/[id]/cancel` - Cancel lease
- `POST /api/gallery/leasing/[id]/invoice` - Generate invoice
- `GET /api/gallery/leasing/export` - Export leasing data

## Testing Checklist

- [ ] Summary cards display correct statistics
- [ ] All filters work correctly
- [ ] Table sorting functions properly
- [ ] Status badges show correct states
- [ ] Insurance badges show correct states
- [ ] Details drawer displays all information
- [ ] Action buttons trigger appropriate handlers
- [ ] Empty states display correctly
- [ ] Responsive design works on mobile
- [ ] RLS prevents unauthorized access

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes for status indicators
- Focus indicators on all interactive elements

## Performance Considerations

- Client-side filtering for instant feedback
- Memoized summary calculations
- Optimized database queries with proper indexes
- Lazy loading of lease details
- Efficient re-rendering with React hooks

## Troubleshooting

### Common Issues

**Leases not displaying:**
- Check RLS policies on artwork_leases table
- Verify gallery_id is correct
- Check console for query errors

**Filters not working:**
- Verify filter state is updating
- Check filter logic in useEffect
- Ensure data structure matches expectations

**Summary cards showing wrong data:**
- Check summary calculation logic
- Verify date comparisons are correct
- Ensure price values are in correct format (cents)

## Related Documentation

- [Gallery Dashboard Overview](./GALLERY_DASHBOARD_IMPLEMENTATION.md)
- [Gallery Dashboard Testing Guide](./GALLERY_DASHBOARD_TESTING_GUIDE.md)
- [Database Schema](../supabase/migrations/add_gallery_leasing_system.sql)
- [RLS Security](../RLS_SECURITY_IMPLEMENTATION.md)
