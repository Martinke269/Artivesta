# Buyer Dashboard - Insurance Page

## Overview

The Insurance Page allows buyers to view and manage insurance information for all their leased artworks. This module provides comprehensive insurance tracking, status monitoring, and detailed information about coverage for each leased piece.

**Route:** `/buyer/dashboard/insurance`

## Features

### 1. Summary Cards
Four key metrics displayed at the top of the page:
- **Forsikrede værker**: Total number of artworks with valid or expiring insurance
- **Udløber snart**: Insurance policies expiring within 60 days
- **Udløbet forsikring**: Expired insurance policies requiring renewal
- **Mangler forsikring**: Artworks without insurance coverage

### 2. Insurance Table
Comprehensive table displaying all insurance records with the following columns:
- **Billede**: Thumbnail image of the artwork
- **Kunstværk**: Artwork title and artist name
- **Galleri**: Gallery name
- **Forsikringshaver**: Who holds the insurance (Galleri/Køber/Ekstern/Mangler)
- **Forsikringsselskab**: Insurance company name
- **Policenummer**: Insurance policy number
- **Dækningsperiode**: Coverage start and end dates
- **Status**: Insurance status badge (Gyldig/Udløber snart/Udløbet/Mangler)
- **Handlinger**: "Se detaljer" button to view full details

### 3. Advanced Filters
Collapsible filter panel with the following options:
- **Search**: Search by artwork, artist, gallery, insurance company, or policy number
- **Status**: Filter by insurance status (Gyldig/Udløber snart/Udløbet/Mangler)
- **Forsikringshaver**: Filter by insurance holder (Galleri/Køber/Ekstern/Mangler)
- **Galleri**: Filter by specific gallery
- **Dækningsstart fra**: Filter by coverage start date
- **Dækningsslut til**: Filter by coverage end date
- **Min. månedlig pris**: Filter by minimum monthly lease price
- **Maks. månedlig pris**: Filter by maximum monthly lease price
- **Sortering**: Sort by Nyeste/Udløber snart/Status

### 4. Insurance Details Drawer
Sliding drawer that displays comprehensive information when "Se detaljer" is clicked:

#### A. Kunstværk Section
- Artwork thumbnail
- Title
- Artist name
- Category

#### B. Forsikringsoplysninger Section
- Status badge with days remaining (if expiring soon)
- Insurance holder
- Insurance company
- Policy number
- Coverage period (formatted dates)
- Insurance documents (if available)

#### C. Tilknyttet Leasingaftale Section
- Monthly lease price
- Lease start date
- Lease end date
- Days remaining in lease
- Gallery information
- Link to leasing details page

#### D. Historik Section
- Placeholder for future insurance history features
- Will include renewals, previous policies, and notes

## Technical Implementation

### File Structure
```
lib/supabase/
  └── buyer-insurance-queries.ts          # Database queries

components/buyer/dashboard/
  ├── insurance-summary-cards.tsx         # Summary statistics cards
  ├── insurance-filters.tsx               # Filter controls
  ├── insurance-table.tsx                 # Main insurance table
  └── insurance-details-drawer.tsx        # Details drawer

app/buyer/dashboard/insurance/
  ├── page.tsx                            # Server component
  └── insurance-page-client.tsx           # Client component
```

### Database Schema

The insurance data is stored in the `gallery_leases` table with the following relevant fields:

```sql
CREATE TABLE gallery_leases (
  id UUID PRIMARY KEY,
  gallery_id UUID REFERENCES galleries(id),
  artwork_id UUID REFERENCES artworks(id),
  buyer_id UUID REFERENCES profiles(id),
  
  -- Insurance fields
  insurance_holder TEXT CHECK (insurance_holder IN ('gallery', 'buyer', 'external', 'missing')),
  insurance_company TEXT,
  insurance_policy_number TEXT,
  insurance_coverage_start DATE,
  insurance_coverage_end DATE,
  insurance_status TEXT CHECK (insurance_status IN ('valid', 'expiring_soon', 'expired', 'missing')),
  insurance_documents JSONB DEFAULT '[]'::jsonb,
  
  -- Other lease fields...
)
```

### Key Queries

#### `getBuyerInsuranceStats(userId: string)`
Returns summary statistics:
- Total insured artworks
- Policies expiring within 60 days
- Expired policies
- Missing insurance

#### `getBuyerInsuranceRecords(userId: string, filters: BuyerInsuranceFilters)`
Returns filtered list of insurance records with:
- Artwork details (title, artist, image, category)
- Gallery information
- Insurance details (holder, company, policy number, coverage dates, status)
- Lease information (monthly price, dates, days remaining)
- Payment history

#### `getBuyerInsuranceGalleries(userId: string)`
Returns list of galleries the buyer has leases with for filter dropdown.

#### `getInsuranceDaysRemaining(coverageEnd: string | null)`
Utility function to calculate days until insurance expires.

### Row Level Security (RLS)

The existing RLS policies ensure buyers can only view insurance information for their own leases:

```sql
CREATE POLICY "Buyers can view own leases"
  ON gallery_leases FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());
```

This policy automatically filters all queries to only return leases where the authenticated user is the buyer.

## UI Components

### InsuranceSummaryCards
- Displays 4 metric cards with icons and color coding
- Green for insured, yellow for expiring, red for expired, gray for missing
- Loading skeleton states
- Responsive grid layout (2 columns on mobile, 4 on desktop)

### InsuranceFilters
- Search bar with icon
- Sort dropdown
- Collapsible advanced filters panel
- "Ryd filtre" button when filters are active
- Responsive layout

### InsuranceTable
- Responsive table with horizontal scroll on mobile
- Image thumbnails with fallback for missing images
- Status badges with appropriate colors
- Date formatting in Danish locale
- Empty state when no records match filters
- Loading skeleton states

### InsuranceDetailsDrawer
- Full-height sliding drawer from right
- Organized into logical sections with icons
- Formatted dates and prices
- Links to related pages
- Responsive layout

## Status Logic

### Insurance Status Calculation
Insurance status is automatically calculated based on coverage dates:

- **valid**: Coverage end date is more than 30 days in the future
- **expiring_soon**: Coverage end date is within 30 days
- **expired**: Coverage end date has passed
- **missing**: No insurance information provided

### Status Badge Colors
- **Gyldig** (Valid): Green badge
- **Udløber snart** (Expiring Soon): Yellow badge
- **Udløbet** (Expired): Red badge
- **Mangler** (Missing): Gray outline badge

## Edge Cases

### No Insurance Records
- Empty state displayed with icon and message
- Suggests checking filters if none match

### Missing Insurance Information
- Displays "-" for missing fields
- "Ikke angivet" for optional text fields
- Handles null values gracefully

### No Coverage Dates
- Shows "-" when dates are missing
- Doesn't calculate days remaining

### No Insurance Documents
- Documents section hidden when array is empty
- Placeholder ready for future document uploads

## User Flow

1. **Landing**: User navigates to `/buyer/dashboard/insurance`
2. **Overview**: Sees summary cards with key metrics
3. **Browse**: Views table of all insurance records
4. **Filter**: Uses search and filters to find specific records
5. **Details**: Clicks "Se detaljer" to view comprehensive information
6. **Navigate**: Can link to related leasing details from drawer

## Performance Considerations

- All data fetched server-side for initial page load
- Client-side filtering for instant response
- Parallel data fetching using `Promise.all()`
- Optimized queries with specific field selection
- Indexed database columns for fast filtering

## Future Enhancements

### Potential Features
1. **Document Upload**: Allow buyers to upload insurance documents
2. **Renewal Reminders**: Email notifications for expiring insurance
3. **Insurance History**: Track policy changes and renewals
4. **Claims Tracking**: Record and track insurance claims
5. **Export**: Download insurance records as PDF or CSV
6. **Bulk Actions**: Update multiple insurance records at once
7. **Insurance Comparison**: Compare policies across galleries
8. **Coverage Calculator**: Estimate insurance costs

### Technical Improvements
1. **Real-time Updates**: WebSocket updates for status changes
2. **Caching**: Cache frequently accessed data
3. **Pagination**: For buyers with many leases
4. **Advanced Search**: Full-text search across all fields
5. **Analytics**: Insurance cost trends and insights

## Testing Checklist

### Functionality
- [ ] Summary cards display correct statistics
- [ ] Table shows all insurance records
- [ ] Filters work correctly (all combinations)
- [ ] Search finds records by all searchable fields
- [ ] Sorting works for all options
- [ ] Details drawer opens with correct information
- [ ] Link to leasing page works
- [ ] Empty states display correctly
- [ ] Loading states display correctly

### Security
- [ ] Buyers can only see their own insurance records
- [ ] RLS policies prevent unauthorized access
- [ ] No sensitive gallery data exposed
- [ ] Authentication required for page access

### UI/UX
- [ ] Responsive on all screen sizes
- [ ] Status badges use correct colors
- [ ] Dates formatted in Danish locale
- [ ] Prices formatted correctly
- [ ] Images load with proper fallbacks
- [ ] Drawer scrolls properly on mobile
- [ ] Filter panel collapses/expands smoothly
- [ ] All text in Danish

### Performance
- [ ] Page loads quickly
- [ ] Filtering is instant
- [ ] No unnecessary re-renders
- [ ] Images optimized with Next.js Image

## Troubleshooting

### Common Issues

**Issue**: No insurance records showing
- **Solution**: Check if user has any active leases with insurance data

**Issue**: Filters not working
- **Solution**: Verify filter state is being updated correctly

**Issue**: Dates showing incorrectly
- **Solution**: Check date formatting and locale settings

**Issue**: Images not loading
- **Solution**: Verify image URLs and Next.js Image configuration

**Issue**: RLS blocking queries
- **Solution**: Verify user is authenticated and buyer_id matches

## Related Documentation

- [Buyer Dashboard Overview](./BUYER_DASHBOARD_OVERVIEW.md)
- [Buyer Dashboard Leasing](./BUYER_DASHBOARD_LEASING.md)
- [Gallery Dashboard Leasing](./GALLERY_DASHBOARD_LEASING.md)
- [Database Schema](../supabase/migrations/add_gallery_leasing_system.sql)

## Conclusion

The Buyer Insurance Page provides a comprehensive solution for buyers to monitor and manage insurance coverage for their leased artworks. The implementation follows best practices for security, performance, and user experience, while maintaining consistency with other dashboard modules.
