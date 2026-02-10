# Buyer Dashboard - Invoices Page

## Overview

The Buyer Invoices Page provides a comprehensive interface for buyers to view and manage all their invoices from both orders and leasing agreements. The page includes summary statistics, advanced filtering, detailed invoice information, and payment history tracking.

## Route

```
/buyer/dashboard/invoices
```

## Features

### 1. Summary Cards

Three key metrics displayed at the top:

- **Antal Fakturaer**: Total number of invoices
- **Betalte Fakturaer**: Number of paid invoices (green badge)
- **Ubetalte Fakturaer**: Number of unpaid invoices (orange badge, highlighted)

### 2. Invoice Table

Displays all invoices with the following columns:

- **Faktura ID**: Unique invoice identifier
- **Type**: Badge indicating "Ordre" or "Leasing"
- **Dato**: Invoice creation date
- **Forfaldsdato**: Due date
- **Beløb**: Total amount including VAT
- **Status**: Badge showing "Betalt", "Ubetalt", or "Forfalden"
- **Handlinger**: Action buttons (View details, Download PDF)

#### Status Logic

- **Betalt (Paid)**: Invoice status is 'paid'
- **Forfalden (Overdue)**: Invoice is unpaid and more than 30 days old
- **Ubetalt (Unpaid)**: Invoice is unpaid but not yet overdue

### 3. Filters (Collapsible)

Advanced filtering options:

- **Search**: Search by invoice ID, artwork title, artist name, or gallery name
- **Sort**: Newest, Highest amount, Status
- **Status**: All, Paid, Unpaid, Overdue
- **Type**: All, Order, Leasing
- **Gallery**: Filter by specific gallery
- **Date Range**: From date and to date
- **Price Range**: Minimum and maximum price

### 4. Invoice Details Drawer

Comprehensive invoice information displayed in a side drawer:

#### A. Invoice Information

- Faktura ID
- Dato (Invoice date)
- Forfaldsdato (Due date)
- Status badge
- Beløb (Amount before VAT)
- Moms (25% VAT)
- Total (Amount including VAT)
- Betalingsmetode (Payment method, if available)
- Download PDF button (if PDF available)

#### B. Related Order or Lease

**For Orders:**
- Artwork image, title, and artist name
- Gallery name
- Ordre ID
- Ordredato (Order date)

**For Leasing:**
- Artwork image, title, and artist name
- Gallery name
- Leasingperiode (Start and end dates)
- Månedlig pris (Monthly price)

**Gallery Contact:**
- Email
- Phone

#### C. Payment History

Timeline of payment events with:
- Event status
- Timestamp
- Optional notes

## Components

### Query Layer

**File**: `lib/supabase/buyer-invoices-queries.ts`

#### Interfaces

```typescript
interface BuyerInvoicesStats {
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
}

interface BuyerInvoiceDetail {
  id: string
  invoice_number: string
  invoice_type: 'order' | 'leasing'
  date: string
  due_date: string
  amount_cents: number
  vat_cents: number
  total_cents: number
  currency: string
  status: 'paid' | 'overdue' | 'unpaid'
  payment_method: string | null
  pdf_url: string | null
  related_item: {
    id: string
    type: 'order' | 'leasing'
    artwork: { ... }
    gallery: { ... } | null
    order_date?: string
    leasing_period?: { ... }
  }
  payment_history: Array<{ ... }>
}

interface BuyerInvoicesFilters {
  search?: string
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  galleryId?: string
  sortBy?: 'newest' | 'highest_amount' | 'status'
}
```

#### Functions

- `getBuyerInvoicesStats(userId)`: Get invoice statistics
- `getBuyerInvoices(userId, filters)`: Get all invoices with filters
- `getBuyerInvoiceById(userId, invoiceId)`: Get single invoice
- `getBuyerInvoiceGalleries(userId)`: Get list of galleries

### UI Components

1. **InvoicesSummaryCards** (`components/buyer/dashboard/invoices-summary-cards.tsx`)
   - Displays three summary cards
   - Loading skeleton states
   - Color-coded icons

2. **InvoicesFilters** (`components/buyer/dashboard/invoices-filters.tsx`)
   - Collapsible filter panel
   - Search and sort controls
   - Multiple filter options
   - Clear filters button

3. **InvoicesTable** (`components/buyer/dashboard/invoices-table.tsx`)
   - Responsive table layout
   - Status and type badges
   - Action buttons
   - Loading skeleton
   - Empty state

4. **InvoiceDetailsDrawer** (`components/buyer/dashboard/invoice-details-drawer.tsx`)
   - Side drawer with full invoice details
   - Artwork display with image
   - Payment history timeline
   - Gallery contact information

5. **InvoicesPageClient** (`app/buyer/dashboard/invoices/invoices-page-client.tsx`)
   - Client-side state management
   - Filter application logic
   - Drawer control

### Page Route

**File**: `app/buyer/dashboard/invoices/page.tsx`

- Server component
- Authentication check
- Parallel data fetching
- SEO metadata

## Data Flow

1. **Server-side** (page.tsx):
   - Authenticate user
   - Fetch invoice stats, invoices, and galleries in parallel
   - Pass data to client component

2. **Client-side** (invoices-page-client.tsx):
   - Manage filter state
   - Apply filters to invoices
   - Handle drawer open/close
   - Pass data to child components

3. **Database Queries**:
   - Query `invoices` table for order invoices
   - Query `lease_payments` table for leasing invoices
   - Join with `orders`, `leases`, `artworks`, `galleries`, and `profiles`
   - Apply RLS policies (buyers can only see their own invoices)

## Security

### RLS Policies

The existing RLS policies ensure:

1. **Invoices Table**:
   ```sql
   CREATE POLICY "Users can view own invoices"
     ON invoices FOR SELECT
     TO authenticated
     USING (recipient_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
   ```

2. **Lease Payments**: Accessed through leases table with buyer_id check

3. **Data Isolation**:
   - Buyers can only see invoices where they are the recipient
   - Gallery internal data is not exposed
   - Artist information is limited to public profile data

## Edge Cases

### 1. No Invoices

**Scenario**: Buyer has no invoices yet

**Handling**:
- Empty state with icon and message
- "Ingen fakturaer fundet" message
- Helpful text explaining the situation

### 2. Missing Gallery Information

**Scenario**: Invoice for artwork without gallery (direct artist sale)

**Handling**:
- Gallery section shows null
- No gallery contact information displayed
- Artwork and artist information still shown

### 3. Missing PDF

**Scenario**: Invoice doesn't have a PDF generated yet

**Handling**:
- Download PDF button is not displayed
- All other invoice information is available

### 4. Overdue Invoices

**Scenario**: Invoice is more than 30 days old and unpaid

**Handling**:
- Status automatically set to "Forfalden"
- Orange badge displayed
- Highlighted in filters

### 5. Leasing Payment Invoices

**Scenario**: Monthly leasing payments treated as invoices

**Handling**:
- Invoice number format: `LP-{payment_id}`
- Type badge shows "Leasing"
- Leasing period information displayed
- Monthly price shown

### 6. Multiple Filters Active

**Scenario**: User applies multiple filters simultaneously

**Handling**:
- All filters applied in sequence
- "Ryd filtre" button appears
- Filter count indicator
- Results update in real-time

## Testing Guide

### Manual Testing Checklist

#### Summary Cards
- [ ] Verify total invoice count is correct
- [ ] Verify paid invoices count
- [ ] Verify unpaid invoices count
- [ ] Check loading skeleton displays correctly

#### Filters
- [ ] Test search by invoice ID
- [ ] Test search by artwork title
- [ ] Test search by artist name
- [ ] Test search by gallery name
- [ ] Test status filter (all, paid, unpaid, overdue)
- [ ] Test type filter (all, order, leasing)
- [ ] Test gallery filter
- [ ] Test date range filter
- [ ] Test price range filter
- [ ] Test sort options (newest, highest amount, status)
- [ ] Test clear filters button
- [ ] Test collapsible panel

#### Invoice Table
- [ ] Verify all columns display correctly
- [ ] Test status badges (colors and labels)
- [ ] Test type badges
- [ ] Test "Se detaljer" button
- [ ] Test "Download PDF" button (when available)
- [ ] Verify empty state displays when no results
- [ ] Test responsive layout on mobile

#### Invoice Details Drawer
- [ ] Test drawer opens on "Se detaljer" click
- [ ] Verify all invoice information displays
- [ ] Test VAT calculation (25%)
- [ ] Test total calculation
- [ ] Verify artwork image displays
- [ ] Test gallery contact information
- [ ] Test payment history timeline
- [ ] Test order-specific fields
- [ ] Test leasing-specific fields
- [ ] Test drawer close functionality

### Test Data Scenarios

1. **Order Invoice**:
   - Create test order
   - Verify invoice appears in list
   - Check all order-specific fields

2. **Leasing Invoice**:
   - Create test lease with payments
   - Verify lease payments appear as invoices
   - Check leasing-specific fields

3. **Mixed Invoices**:
   - Have both order and leasing invoices
   - Test type filter
   - Verify correct information for each type

4. **Status Variations**:
   - Create paid invoice
   - Create recent unpaid invoice
   - Create old unpaid invoice (overdue)
   - Verify status logic and badges

## Performance Considerations

1. **Parallel Data Fetching**: Stats, invoices, and galleries fetched simultaneously
2. **Client-side Filtering**: Fast filter application without server round-trips
3. **Optimized Queries**: Single query for orders, single query for leases
4. **Image Optimization**: Next.js Image component for artwork thumbnails
5. **Lazy Loading**: Drawer content only rendered when opened

## Future Enhancements

1. **PDF Generation**: Automatic PDF generation for all invoices
2. **Email Notifications**: Send invoice emails to buyers
3. **Payment Integration**: Direct payment from invoice page
4. **Export Functionality**: Export invoices to CSV/Excel
5. **Recurring Invoice Management**: Better handling of leasing payments
6. **Invoice Disputes**: Allow buyers to dispute invoices
7. **Payment Reminders**: Automatic reminders for overdue invoices
8. **Multi-currency Support**: Handle invoices in different currencies

## Related Documentation

- [Buyer Dashboard Overview](./BUYER_DASHBOARD_OVERVIEW.md)
- [Buyer Dashboard Orders](./BUYER_DASHBOARD_ORDERS.md)
- [Buyer Dashboard Leasing](./BUYER_DASHBOARD_LEASING.md)
- [Gallery Dashboard Payouts](./GALLERY_DASHBOARD_PAYOUTS.md)

## Troubleshooting

### Issue: Invoices not appearing

**Possible Causes**:
- RLS policy blocking access
- User not authenticated
- No invoices created yet

**Solution**:
- Check authentication status
- Verify RLS policies
- Check database for invoice records

### Issue: Incorrect invoice totals

**Possible Causes**:
- VAT calculation error
- Currency conversion issue

**Solution**:
- Verify VAT rate (25% for Denmark)
- Check amount_cents values in database
- Verify currency field

### Issue: Gallery information missing

**Possible Causes**:
- Artwork not associated with gallery
- Gallery deleted
- RLS policy issue

**Solution**:
- Check artwork.gallery_id field
- Verify gallery exists in database
- Check gallery RLS policies

## Conclusion

The Buyer Invoices Page provides a complete invoice management solution for buyers, combining order and leasing invoices in a single, easy-to-use interface. The page respects RLS policies, handles edge cases gracefully, and provides excellent UX with filtering, sorting, and detailed invoice views.
