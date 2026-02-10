# Gallery Dashboard Analytics Page

## Overview

The Analytics Page provides comprehensive performance tracking and insights for gallery owners. It displays metrics across 5 key sections with interactive visualizations and detailed breakdowns.

**Route:** `/gallery/dashboard/analytics`

## Features

### 1. Performance Overview (Quick Stats)
Four key performance indicators displayed as cards:
- **Total Views**: Aggregate views across all artworks
- **Total Inquiries**: Number of buyer inquiries received
- **Conversion Rate**: Percentage of views that convert to inquiries
- **Top Category**: Best performing artwork category by views

### 2. Views Over Time (Line Chart)
Interactive line chart showing daily view trends:
- Toggle between 30-day and 90-day periods
- Hover tooltips with formatted dates and view counts
- Smooth line visualization using Recharts
- Responsive design adapts to screen size

### 3. Artwork Performance Table
Sortable table with detailed artwork metrics:
- **Columns:**
  - Thumbnail image
  - Title and artist name
  - Views (30 days)
  - Inquiries (30 days)
  - Conversion rate with performance badge
  - Status (active/draft/sold/reserved)
  - Actions (view artwork link)
- **Sorting:** Click column headers to sort by views, inquiries, or conversion rate
- **Performance Badges:**
  - Excellent (≥5% conversion) - Green
  - Good (≥2% conversion) - Blue
  - Average (≥1% conversion) - Yellow
  - Low (<1% conversion) - Gray

### 4. Category Breakdown (Bar Chart)
Dual-bar chart comparing views and inquiries by category:
- Color-coded bars for views (primary) and inquiries (secondary)
- Hover tooltips with exact counts
- Legend for easy interpretation
- Responsive layout

### 5. Funnel Analysis
Visual conversion funnel tracking user journey:
- **Steps:**
  1. Views (100% baseline)
  2. Detail Page Views (~60% of views)
  3. Inquiries (actual inquiry count)
  4. Purchases (completed orders)
- **Displays:**
  - Step number and name
  - User count at each stage
  - Percentage of total views
  - Drop-off percentage between steps
  - Visual progress bars with gradient

## UI Components

### Layout
- Responsive grid system
- Card-based sections
- Consistent spacing and typography
- Loading skeletons (handled by server component)
- Empty states for no data scenarios

### Interactive Elements
- Time period toggle (30/90 days)
- Sortable table columns
- Hover tooltips on charts
- Clickable artwork links
- Performance badges

### Charts
- **Line Chart**: Recharts LineChart component
- **Bar Chart**: Recharts BarChart component
- **Funnel**: Custom gradient progress bars

## Data Flow

### Server Component (`page.tsx`)
1. Authenticates user
2. Verifies gallery role
3. Fetches all analytics data in parallel:
   - Stats for 30 and 90 days
   - Views over time data
   - Artwork performance metrics
   - Category breakdown
   - Funnel data
4. Passes data to client component

### Client Component (`analytics-page-client.tsx`)
1. Manages UI state (time period, sorting)
2. Renders all 5 sections
3. Handles user interactions
4. Formats data for display

## Database Queries

### Tables Used
- `gallery_artists`: Gallery-artist relationships
- `artworks`: Artwork details
- `artwork_analytics`: View counts and metrics
- `buyer_interest`: Inquiry tracking
- `orders`: Purchase data
- `profiles`: Artist information

### Key Queries
All queries in `lib/supabase/gallery-analytics-queries.ts`:

1. **getAnalyticsStats**: Aggregate statistics
2. **getViewsOverTime**: Daily view data
3. **getArtworkPerformance**: Per-artwork metrics
4. **getCategoryBreakdown**: Category-level aggregation
5. **getFunnelData**: Conversion funnel metrics

## Security

### RLS Policies
- All queries filter by gallery_id
- Only active gallery artists' artworks are included
- User must be authenticated and have gallery role
- No direct artwork_id exposure without ownership verification

### Data Access
- Gallery can only see data for their own artists
- No cross-gallery data leakage
- Proper authentication checks at page level

## Edge Cases

### No Data Scenarios
- **No Artists**: Shows zero stats, empty states
- **No Artworks**: Shows zero stats, "No artworks found" message
- **No Analytics**: Shows zero views/inquiries, empty charts
- **No Categories**: Shows "N/A" for top category

### Data Integrity
- Handles missing analytics records (defaults to 0)
- Handles missing artist profiles (shows "Unknown Artist")
- Handles missing images (shows placeholder)
- Prevents division by zero in conversion calculations

### Performance
- Parallel data fetching for faster load times
- Efficient queries with proper indexing
- Pagination not needed (reasonable dataset size)
- Client-side sorting for instant feedback

## Testing Guide

### Manual Testing Checklist

#### 1. Access Control
- [ ] Non-authenticated users redirected to login
- [ ] Non-gallery users redirected to dashboard
- [ ] Gallery users can access page

#### 2. Performance Overview
- [ ] All 4 stat cards display correctly
- [ ] Numbers format with locale separators
- [ ] Conversion rate shows 2 decimal places
- [ ] Top category displays correctly

#### 3. Views Over Time Chart
- [ ] Chart renders without errors
- [ ] 30-day toggle works
- [ ] 90-day toggle works
- [ ] Hover tooltips show formatted dates
- [ ] Responsive on mobile

#### 4. Artwork Performance Table
- [ ] All artworks display
- [ ] Images load or show placeholder
- [ ] Sorting by views works
- [ ] Sorting by inquiries works
- [ ] Sorting by conversion works
- [ ] Performance badges show correct colors
- [ ] Status badges display correctly
- [ ] View artwork links work

#### 5. Category Breakdown Chart
- [ ] Chart renders with all categories
- [ ] Both bars (views/inquiries) display
- [ ] Legend shows correctly
- [ ] Hover tooltips work
- [ ] Responsive on mobile

#### 6. Funnel Analysis
- [ ] All 4 steps display
- [ ] Counts are accurate
- [ ] Percentages calculate correctly
- [ ] Drop-off percentages show
- [ ] Progress bars scale properly
- [ ] Visual gradient displays

#### 7. Empty States
- [ ] Empty state shows when no artworks
- [ ] Empty state shows when no data
- [ ] Messages are clear and helpful

#### 8. Responsive Design
- [ ] Desktop layout (4 columns for stats)
- [ ] Tablet layout (2 columns for stats)
- [ ] Mobile layout (1 column for stats)
- [ ] Charts scale properly
- [ ] Table scrolls horizontally on mobile

### Test Data Setup

```sql
-- Create test gallery
INSERT INTO profiles (id, email, role, full_name)
VALUES ('test-gallery-id', 'gallery@test.com', 'gallery', 'Test Gallery');

-- Create test artist
INSERT INTO profiles (id, email, role, full_name)
VALUES ('test-artist-id', 'artist@test.com', 'artist', 'Test Artist');

-- Link artist to gallery
INSERT INTO gallery_artists (gallery_id, artist_id, status)
VALUES ('test-gallery-id', 'test-artist-id', 'active');

-- Create test artwork
INSERT INTO artworks (id, artist_id, title, price_cents, status, category)
VALUES ('test-artwork-id', 'test-artist-id', 'Test Artwork', 100000, 'available', 'Painting');

-- Add analytics
INSERT INTO artwork_analytics (artwork_id, view_count)
VALUES ('test-artwork-id', 150);

-- Add inquiries
INSERT INTO buyer_interest (artwork_id, buyer_id, interest_type)
VALUES ('test-artwork-id', 'test-buyer-id', 'inquiry');

-- Add order
INSERT INTO orders (artwork_id, buyer_id, seller_id, status, total_amount)
VALUES ('test-artwork-id', 'test-buyer-id', 'test-artist-id', 'completed', 100000);
```

## Known Limitations

### Current Implementation
1. **Views Over Time**: Uses simulated daily distribution
   - Real implementation would need daily_analytics table
   - Current version distributes total views evenly with variance
   
2. **Detail Page Views**: Estimated at 60% of total views
   - Real implementation would track actual detail page views
   - Requires additional analytics tracking

3. **Time Period Filtering**: Stats calculated for all time
   - Currently shows all-time data regardless of toggle
   - Would need created_at filtering in queries

### Future Enhancements
1. Add date range picker for custom periods
2. Export analytics to CSV/PDF
3. Email reports scheduling
4. Comparison with previous periods
5. Goal setting and tracking
6. Real-time updates with WebSocket
7. Advanced filtering (by artist, status, etc.)
8. Cohort analysis
9. Revenue analytics integration
10. A/B testing insights

## File Structure

```
app/gallery/dashboard/analytics/
├── page.tsx                      # Server component
└── analytics-page-client.tsx     # Client component

lib/supabase/
└── gallery-analytics-queries.ts  # Database queries

docs/
└── GALLERY_DASHBOARD_ANALYTICS.md # This file
```

## Dependencies

- `recharts`: Chart library for visualizations
- `lucide-react`: Icons
- `@/components/ui/*`: shadcn/ui components
- `next/image`: Optimized images
- `next/link`: Client-side navigation

## Performance Considerations

### Optimization Strategies
1. **Parallel Queries**: All data fetched simultaneously
2. **Server-Side Rendering**: Initial data loaded on server
3. **Client-Side Sorting**: No server round-trip for sorting
4. **Memoization**: React state prevents unnecessary re-renders
5. **Image Optimization**: Next.js Image component

### Load Times
- Initial page load: ~1-2 seconds (depends on data volume)
- Time period toggle: Instant (client-side)
- Sorting: Instant (client-side)
- Chart interactions: Instant (client-side)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Responsive text sizing

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Troubleshooting

### Common Issues

**Charts not rendering:**
- Check recharts installation: `npm list recharts`
- Verify data format matches expected structure
- Check browser console for errors

**No data showing:**
- Verify gallery has active artists
- Check artists have artworks
- Verify RLS policies allow data access
- Check Supabase connection

**Sorting not working:**
- Verify client component is properly hydrated
- Check browser console for JavaScript errors
- Ensure data has numeric values for sorting

**Images not loading:**
- Check image URLs are valid
- Verify Supabase storage permissions
- Check Next.js image configuration

## Maintenance

### Regular Tasks
- Monitor query performance
- Review and optimize slow queries
- Update test data periodically
- Check for RLS policy changes
- Update documentation as features evolve

### Monitoring
- Track page load times
- Monitor error rates
- Review user feedback
- Analyze usage patterns

## Support

For issues or questions:
1. Check this documentation
2. Review related files
3. Check Supabase logs
4. Review browser console
5. Contact development team
