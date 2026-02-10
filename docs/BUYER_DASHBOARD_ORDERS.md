# Buyer Dashboard - Orders Page

## Overview

The Buyer Orders Page provides a comprehensive interface for buyers to view and manage all their artwork orders. The page includes summary statistics, advanced filtering, detailed order information, and payment history.

## Route

```
/buyer/dashboard/orders
```

## Features

### 1. Summary Cards

Three key metrics displayed at the top:

- **Antal ordrer**: Total number of orders
- **Afventende betalinger**: Orders awaiting payment (highlighted in orange if > 0)
- **Gennemførte køb**: Paid and completed orders

### 2. Orders Table

Displays all orders with the following columns:

- **Billede**: Artwork thumbnail
- **Kunstværk**: Artwork title and artist name
- **Galleri**: Gallery name (or "Direkte salg" for direct sales)
- **Ordredato**: Order date
- **Status**: Order status badge
- **Beløb**: Order amount in DKK
- **Handlinger**: "Se detaljer" button

#### Status Types

- `pending`: Afventer betaling (secondary badge)
- `paid`: Betalt (default badge)
- `completed`: Gennemført (default badge)
- `cancelled`: Annulleret (destructive badge)

### 3. Filters

#### Quick Filters

- **Search**: Search by artwork title, artist name, or gallery name
- **Status**: Filter by order status (all, pending, paid, completed, cancelled)
- **Sort**: Sort by newest, highest amount, or status

#### Advanced Filters (Collapsible)

- **Date Range**: Filter by order date (from/to)
- **Price Range**: Filter by order amount (min/max in DKK)
- **Gallery**: Filter by specific gallery

### 4. Order Details Drawer

Clicking "Se detaljer" opens a side drawer with comprehensive order information:

#### A. Kunstværk Section

- Artwork image
- Title
- Artist name
- Category

#### B. Ordreoplysninger Section

- Order ID (truncated)
- Order date
- Status badge
- Amount
- Payment method (if available)
- Download invoice button (if available)

#### C. Gallerioplysninger Section (if applicable)

- Gallery name
- Address with postal code and city
- Email (clickable mailto link)
- Phone (clickable tel link)

#### D. Betalingshistorik Section

Timeline of order events:

- Ordre oprettet
- Betaling gennemført (if paid/completed)
- Ordre gennemført (if completed)
- Ordre annulleret (if cancelled)

Each event shows timestamp with date and time.

## Components

### Server Components

- `app/buyer/dashboard/orders/page.tsx`: Main server page with data fetching

### Client Components

- `app/buyer/dashboard/orders/orders-page-client.tsx`: Main client wrapper with state management
- `components/buyer/dashboard/orders-summary-cards.tsx`: Summary statistics cards
- `components/buyer/dashboard/orders-filters.tsx`: Filter controls
- `components/buyer/dashboard/orders-table.tsx`: Orders table with loading and empty states
- `components/buyer/dashboard/order-details-drawer.tsx`: Order details side drawer

## Database Queries

Located in `lib/supabase/buyer-queries.ts`:

### getBuyerOrdersStats(userId: string)

Returns order statistics:

```typescript
{
  totalOrders: number
  pendingPayments: number
  completedPurchases: number
}
```

### getBuyerOrders(userId: string, filters?: BuyerOrdersFilters)

Returns array of order details with optional filtering:

```typescript
{
  id: string
  artwork: {
    id: string
    title: string
    artist_name: string
    image_url: string | null
    category: string | null
  }
  gallery: {
    id: string | null
    name: string | null
    address: string | null
    city: string | null
    postal_code: string | null
    email: string | null
    phone: string | null
  } | null
  order_date: string
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  amount_cents: number
  currency: string
  payment_method: string | null
  invoice_id: string | null
  invoice_url: string | null
  payment_history: Array<{
    status: string
    timestamp: string
    note?: string
  }>
}
```

### getBuyerOrderGalleries(userId: string)

Returns list of galleries the buyer has ordered from:

```typescript
Array<{
  id: string
  name: string
}>
```

## Security

### Row Level Security (RLS)

The orders table has RLS policies that ensure:

- Buyers can only view their own orders (`buyer_id = auth.uid()`)
- Sellers can view orders they're involved in (`seller_id = auth.uid()`)
- Admins can view all orders

### Data Access

- Gallery information is only shown if the artwork is associated with a gallery
- No internal gallery data or sensitive information is exposed
- Invoice URLs are only shown if available

## UI/UX Features

### Loading States

- Skeleton loaders for summary cards
- Skeleton loaders for table rows
- Smooth transitions

### Empty States

- "Ingen ordrer fundet" message when no orders match filters
- Clear messaging for empty results

### Responsive Design

- Mobile-friendly table layout
- Collapsible filters for mobile
- Responsive drawer width

### Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly

## Edge Cases

### No Orders

- Shows empty state with message
- Summary cards show zeros

### No Gallery Information

- Shows "Direkte salg" instead of gallery name
- Gallery section hidden in drawer

### Missing Invoice

- Invoice download button not shown if no invoice URL

### Missing Artwork Image

- Shows placeholder with "Intet billede" text

### Long Gallery Names

- Text truncation with ellipsis
- Full name visible in drawer

## Testing Checklist

### Functionality

- [ ] Summary cards display correct counts
- [ ] Search filters orders correctly
- [ ] Status filter works for all statuses
- [ ] Sort options work correctly
- [ ] Date range filter works
- [ ] Price range filter works
- [ ] Gallery filter works
- [ ] Order details drawer opens with correct data
- [ ] Invoice download link works (if available)
- [ ] Gallery contact links work (mailto/tel)

### Security

- [ ] Buyers can only see their own orders
- [ ] RLS policies prevent unauthorized access
- [ ] No sensitive gallery data exposed
- [ ] Gallery information only shown for gallery orders

### UI/UX

- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Responsive on mobile devices
- [ ] Filters collapse/expand smoothly
- [ ] Drawer opens/closes smoothly
- [ ] All Danish text is correct

### Edge Cases

- [ ] Handles orders with no gallery
- [ ] Handles orders with no invoice
- [ ] Handles orders with no artwork image
- [ ] Handles very long artwork/gallery names
- [ ] Handles large number of orders (pagination if needed)

## Future Enhancements

### Potential Features

1. **Pagination**: Add pagination for large order lists
2. **Export**: Export orders to CSV/PDF
3. **Bulk Actions**: Select multiple orders for bulk operations
4. **Order Tracking**: Add shipping/delivery tracking
5. **Reorder**: Quick reorder functionality
6. **Reviews**: Add artwork review after delivery
7. **Notifications**: Email notifications for order status changes
8. **Refunds**: Request refund functionality
9. **Support**: Direct support chat from order details

### Performance Optimizations

1. **Virtual Scrolling**: For very large order lists
2. **Image Optimization**: Lazy load artwork thumbnails
3. **Caching**: Cache frequently accessed orders
4. **Incremental Loading**: Load orders in batches

## Related Documentation

- [Buyer Dashboard Overview](./BUYER_DASHBOARD_OVERVIEW.md)
- [Gallery Dashboard Orders](./GALLERY_DASHBOARD_ORDERS.md)
- [RLS Security Implementation](../RLS_SECURITY_IMPLEMENTATION.md)

## Maintenance Notes

### Regular Tasks

- Monitor query performance
- Review RLS policies
- Update status labels if needed
- Check for broken invoice links

### Known Limitations

- No pagination (all orders loaded at once)
- Client-side filtering (may be slow with many orders)
- No real-time updates (requires page refresh)

## Support

For issues or questions:

1. Check RLS policies in Supabase
2. Verify order data in database
3. Check browser console for errors
4. Review query logs in Supabase
