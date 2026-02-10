# Gallery Dashboard - Orders Page

## Overview

The Orders Page provides comprehensive order management functionality for gallery owners, allowing them to track, manage, and analyze all orders from their represented artists.

## Route

```
/gallery/dashboard/orders
```

## Features

### 1. Order Statistics Dashboard

Four key metric cards displaying:
- **Total Orders**: Total number of orders with pending count
- **Total Revenue**: Total sales revenue with average order value
- **Commission**: Total commission earned (20% of revenue)
- **Payout**: Total payout to artists (80% of revenue) with completed orders count

### 2. Orders Table

Comprehensive table displaying:
- **Thumbnail**: Artwork image preview
- **Artwork Title**: Name of the sold artwork
- **Artist Name**: Name of the selling artist
- **Buyer Name**: Masked as "Business Customer" for privacy
- **Order Date**: Relative time (e.g., "2 days ago")
- **Status Badges**: 
  - Order status (Pending, Paid, Completed, Cancelled)
  - Escrow status (In Escrow, Released, Refunded)
  - Payout status (if applicable)
- **Price**: Full order price
- **Commission**: 20% commission amount
- **Payout**: 80% payout amount to artist
- **Actions Menu**:
  - View order details
  - Mark as shipped (for paid orders)
  - Download invoice (disabled - future feature)

### 3. Advanced Filtering

Multiple filter options:
- **Search**: Search by artwork title
- **Sort By**:
  - Newest first (default)
  - Highest price
  - Status
- **Status Filter**: Filter by order status (multiple selection)
- **Artist Filter**: Filter by specific artist
- **Date Range**: Filter by order date range
- **Price Range**: Filter by min/max price

### 4. Order Details Drawer

Comprehensive order information panel showing:

#### Artwork Information
- Artwork image and title
- Artist name
- Current status badges

#### Order Timeline
- Order creation date and time
- Payment received status
- Shipping status (when applicable)

#### Payment Details
- Order price
- Commission breakdown (20%)
- Net payout to artist (80%)
- Stripe Payment Intent ID

#### Escrow Status
- Current escrow status
- Escrow event history with:
  - Event type (held, released, refunded, disputed, etc.)
  - Amount
  - Reason (if provided)
  - Timestamp
  - Initiated by (if applicable)

#### Payout Details
- Payout status
- Approval information
- Completion date

#### Stripe Events
- Webhook event log
- Event types and processing status
- Timestamps

#### Buyer Information
- Masked buyer identity ("Business Customer")
- Privacy notice

#### Actions
- Download invoice (disabled - future feature)
- Contact seller (disabled - future feature)

## Components

### Main Components

1. **`app/gallery/dashboard/orders/page.tsx`**
   - Server component
   - Authentication and authorization checks
   - Gallery ownership verification
   - Renders OrdersPageClient

2. **`app/gallery/dashboard/orders/orders-page-client.tsx`**
   - Client component
   - State management for orders, filters, and drawer
   - Data loading and error handling
   - Coordinates all sub-components

3. **`components/gallery/dashboard/orders-table.tsx`**
   - Displays orders in a responsive table
   - Status badges and formatting
   - Actions dropdown menu
   - Empty state handling

4. **`components/gallery/dashboard/orders-filters.tsx`**
   - Search input
   - Sort dropdown
   - Multiple filter popovers
   - Active filter count and clear functionality

5. **`components/gallery/dashboard/order-details-drawer.tsx`**
   - Sheet/drawer component
   - Comprehensive order details display
   - Escrow and payment event timelines
   - Stripe webhook logs

### Database Queries

**`lib/supabase/gallery-orders-queries.ts`**

Key functions:
- `getGalleryOrders()`: Fetch orders with filters and sorting
- `getOrderDetails()`: Fetch detailed order information
- `getOrderStats()`: Calculate order statistics
- `getGalleryArtistsForFilter()`: Get artist list for filter dropdown
- `markOrderAsShipped()`: Update order status to completed

## Data Flow

```
1. User navigates to /gallery/dashboard/orders
2. Server component verifies authentication and gallery ownership
3. OrdersPageClient loads:
   - Orders list (with filters)
   - Order statistics
   - Artist list for filters
4. User interactions:
   - Apply filters → Reload orders
   - Change sort → Reload orders
   - View order → Open drawer with details
   - Mark as shipped → Update order status
```

## Security

### RLS (Row Level Security)

All queries respect Supabase RLS policies:

1. **Orders Access**:
   - Gallery can only see orders where `seller_id` matches their artists
   - Uses `gallery_artists` table to determine artist relationships
   - Buyer identity is masked for privacy

2. **Escrow Events**:
   - Only visible for orders the gallery has access to
   - Respects order ownership through RLS

3. **Stripe Webhook Logs**:
   - Admin-only access by default
   - Gallery sees logs for their related orders only

4. **Payout Information**:
   - Only visible for orders belonging to gallery's artists
   - Sensitive financial data protected

### Privacy Measures

- **Buyer Identity**: Always masked as "Business Customer"
- **Payment Details**: Only commission and payout amounts shown
- **Contact Information**: Buyer contact details never exposed

## UI/UX Features

### Responsive Design
- Mobile-friendly table layout
- Collapsible filters on small screens
- Touch-friendly action buttons

### Loading States
- Skeleton loaders for initial load
- Inline loading for actions
- Smooth transitions

### Empty States
- Helpful message when no orders exist
- Clear call-to-action guidance

### Error Handling
- User-friendly error messages
- Retry functionality
- Toast notifications for actions

## Status Badges

### Order Status
- **Pending** (Outline): Order created, awaiting payment
- **Paid** (Secondary): Payment received, in escrow
- **Completed** (Default/Green): Order fulfilled, payment released
- **Cancelled** (Destructive/Red): Order cancelled

### Escrow Status
- **In Escrow** (Secondary): Funds held securely
- **Released** (Default/Green): Funds released to artist
- **Refunded** (Destructive/Red): Funds returned to buyer

### Payout Status
- **Pending** (Outline): Awaiting approval
- **Approved** (Secondary): Approved, awaiting transfer
- **Completed** (Default/Green): Transferred to artist
- **Rejected** (Destructive/Red): Payout rejected

## Commission Structure

- **Platform Commission**: 20% of order value
- **Artist Payout**: 80% of order value
- Calculated automatically for all orders
- Displayed clearly in order details

## Future Enhancements

### Planned Features
1. **Invoice Generation**: PDF invoice download
2. **Bulk Actions**: Process multiple orders at once
3. **Export Functionality**: Export orders to CSV/Excel
4. **Email Notifications**: Automated order status updates
5. **Shipping Integration**: Track shipments
6. **Refund Processing**: Handle refunds through UI
7. **Dispute Management**: Manage order disputes
8. **Advanced Analytics**: Order trends and insights

### Integration Points
- Stripe Connect for payments
- Email service for notifications
- Shipping providers for tracking
- Accounting software for bookkeeping

## Testing Checklist

### Functional Testing
- [ ] Orders load correctly for gallery
- [ ] Filters work as expected
- [ ] Sorting functions properly
- [ ] Order details drawer displays all information
- [ ] Mark as shipped updates status
- [ ] Statistics calculate correctly
- [ ] Empty states display when appropriate
- [ ] Error states handle failures gracefully

### Security Testing
- [ ] RLS prevents unauthorized access
- [ ] Buyer identity is always masked
- [ ] Gallery can only see own orders
- [ ] Payment details are secure
- [ ] Escrow events are properly filtered

### UI/UX Testing
- [ ] Responsive on all screen sizes
- [ ] Loading states display correctly
- [ ] Badges use correct colors
- [ ] Actions are intuitive
- [ ] Filters are easy to use
- [ ] Drawer scrolls properly

### Performance Testing
- [ ] Orders load quickly
- [ ] Filters don't cause lag
- [ ] Large order lists perform well
- [ ] Drawer opens smoothly

## Edge Cases

### Handled Edge Cases
1. **No Orders**: Empty state with helpful message
2. **No Artists**: Filters adapt to show no artist filter
3. **Missing Images**: Placeholder icon displayed
4. **Long Titles**: Text truncation with ellipsis
5. **Large Numbers**: Proper number formatting
6. **Date Formatting**: Localized Danish format

### Known Limitations
1. **Invoice Download**: Not yet implemented
2. **Contact Seller**: Not yet implemented
3. **Bulk Operations**: Single order actions only
4. **Export**: No export functionality yet

## Database Schema

### Primary Tables Used

```sql
-- Orders
orders (
  id, artwork_id, buyer_id, seller_id,
  amount_cents, currency, status, escrow_status,
  payment_intent_id, created_at, updated_at
)

-- Artworks (for order details)
artworks (
  id, title, image_url, artist_id
)

-- Profiles (for artist names)
profiles (
  id, name
)

-- Payouts
payouts (
  id, order_id, seller_id, amount_cents,
  commission_cents, net_amount_cents, status,
  approved_at, completed_at
)

-- Escrow Events
escrow_events (
  id, order_id, event_type, amount_cents,
  reason, initiated_by, created_at
)

-- Stripe Webhook Logs
stripe_webhook_logs (
  id, event_id, event_type, event_data,
  processing_status, related_order_id, created_at
)

-- Gallery Artists (for filtering)
gallery_artists (
  gallery_id, artist_id, status
)
```

## API Endpoints

No custom API endpoints required. All data access through Supabase client queries with RLS.

## Localization

All text is in Danish:
- Status labels
- Date formatting (da-DK locale)
- Number formatting (Danish thousands separator)
- Relative time formatting

## Accessibility

- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support
- Screen reader friendly
- High contrast status badges

## Performance Optimizations

1. **Parallel Data Loading**: Orders, stats, and artists load simultaneously
2. **Efficient Queries**: Only fetch required fields
3. **Client-side Filtering**: Search happens client-side for speed
4. **Lazy Loading**: Drawer content loads on demand
5. **Memoization**: Prevent unnecessary re-renders

## Maintenance Notes

### Regular Tasks
- Monitor query performance
- Review RLS policies
- Update status badge colors if needed
- Check for new Stripe event types

### Dependencies
- Supabase client
- shadcn/ui components
- date-fns for date formatting
- Lucide icons

## Support & Troubleshooting

### Common Issues

**Orders not loading**
- Check RLS policies
- Verify gallery_artists relationships
- Check Supabase connection

**Filters not working**
- Verify filter state management
- Check query parameters
- Review filter logic

**Drawer not opening**
- Check order ID is valid
- Verify RLS allows access
- Review error logs

## Conclusion

The Orders Page provides a comprehensive, secure, and user-friendly interface for gallery owners to manage all aspects of their orders, from initial sale through payment and fulfillment, with full transparency into the escrow and payout process.
