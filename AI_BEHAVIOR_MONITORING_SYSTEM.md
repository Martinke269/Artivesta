# AI Behavior Monitoring & Anomaly Detection System

## Overview

This document describes the comprehensive AI-assisted behavior monitoring and anomaly detection system implemented for ArtIsSafe. This system is designed to help the AI understand pricing behavior, detect accidental mispricing, and maintain high-quality data across the platform.

**Important:** This is NOT a fraud detection system. It is an AI learning layer designed to improve data quality, reduce accidental errors, and protect both buyers and sellers.

## System Architecture

### Database Tables

#### 1. `price_history`
Tracks all price changes for AI learning and approval flows.
- Stores old/new prices and percentage change
- Flags changes requiring approval (>20%)
- Tracks seller and buyer approval status

#### 2. `buyer_interest`
Tracks buyer interest for price change notifications.
- Records view, favorite, inquiry, and offer events
- Used to determine if price change approvals need buyer consent

#### 3. `payment_deviations`
Tracks Stripe Connect payment deviations from listed prices.
- Detects when payment amount differs >20% from listed price
- Requires both buyer and seller approval
- Notifies admin automatically

#### 4. `artwork_removal_events`
Tracks artwork removals for AI pattern learning.
- Records removals without sale, lease, or escrow
- Flags unusual removals for admin review
- Captures analytics data for AI learning

#### 5. `ai_diagnostics`
Stores AI-generated diagnostic reports for long-term listings.
- Automatically generated for artworks listed 90+ days
- Includes view counts, click counts, inquiry counts
- Provides AI recommendations for improvement

#### 6. `admin_alerts`
Centralized alert system for admin dashboard.
- Three severity levels: critical, warning, info
- 17 different alert types
- Tracks resolution status and notes

#### 7. `ai_behavior_insights`
Stores AI-learned patterns and insights.
- Pricing patterns, category trends, seller/buyer behavior
- Seasonal trends and market shifts
- Confidence scores and sample sizes

#### 8. `artwork_analytics`
Tracks artwork performance metrics.
- View count, click count, inquiry count
- Favorite count, share count
- Last viewed timestamp

#### 9. `stripe_webhook_logs`
Tracks all Stripe webhook events.
- Stores event data and processing status
- Logs failures for admin review
- Links to related orders

#### 10. `escrow_events`
Tracks all escrow-related events.
- Held, released, partial release, refunded, disputed
- Flags anomalies for admin notification
- Stores reason and metadata

#### 11. `gallery_commission_changes`
Tracks commission rate changes.
- Records old and new commission percentages
- Notifies admin of changes
- Stores reason for change

#### 12. `audit_log`
Comprehensive audit trail for security monitoring.
- Logs all significant actions
- Detects RLS bypass attempts
- Stores IP address and user agent

## Trigger Functions

### 1. Price Change Monitoring (`check_price_change`)
**Trigger:** BEFORE UPDATE on artworks table

**Behavior:**
- Calculates percentage change
- Checks for buyer interest
- If change >20%:
  - Locks artwork with status `price_change_pending_approval`
  - Creates admin alert
  - Requires seller approval
  - Requires buyer approval if interest exists
- Blocks invalid prices (≤1 DKK)

### 2. Artwork Removal Tracking (`track_artwork_removal`)
**Trigger:** BEFORE DELETE on artworks table

**Behavior:**
- Checks if artwork had orders, leases, or escrow
- Calculates days active
- Retrieves analytics data
- Flags as unusual if no orders/leases/escrow
- Creates admin alert if unusual

### 3. Long-term Listing Check (`check_long_term_listings`)
**Scheduled:** Via cron job (daily recommended)

**Behavior:**
- Finds artworks listed 90+ days
- Generates AI diagnostic report
- Creates admin alert
- Provides recommendations

## API Routes

### 1. `/api/behavior/price-approval`
**POST:** Approve or reject price changes
- Actions: `approve_seller`, `approve_buyer`, `reject`
- Validates user permissions
- Updates approval status
- Reverts price if rejected

**GET:** Fetch pending price approvals
- Filters by artwork ID (optional)
- Returns approval status and artwork details

### 2. `/api/behavior/track-interest`
**POST:** Track buyer interest and increment analytics
- Interest types: view, favorite, inquiry, offer
- Records buyer interest
- Increments view count for views

### 3. `/api/behavior/admin-alerts`
**GET:** Fetch admin alerts
- Filters by severity, alert type, resolution status
- Returns counts by severity
- Limits to 50 most recent

**PATCH:** Update alert status
- Mark as read/resolved
- Add resolution notes
- Track resolved by user

### 4. `/api/cron/check-long-term-listings`
**GET:** Cron job for 90-day diagnostics
- Requires CRON_SECRET authorization
- Calls database function
- Returns success status

## Admin Dashboard

### Location
`/admin/behavior`

### Sections

#### 1. Alert Summary Cards
- Critical alerts count (red)
- Warning alerts count (yellow)
- Info alerts count (blue)

#### 2. Alerts Tab
- All unresolved alerts
- Severity-based styling
- Alert type badges
- Timestamps

#### 3. Price Approvals Tab
- Pending price change approvals
- Payment deviations
- Approval status indicators
- Percentage change badges

#### 4. AI Diagnostics Tab
- 90-day listing diagnostics
- Unusual removals
- Performance metrics
- AI recommendations

#### 5. Security Tab
- Escrow anomalies
- Stripe webhook failures
- RLS bypass attempts
- Security violations

## Alert Types

### Critical Alerts
1. **invalid_price** - Price set to ≤1 DKK
2. **off_platform_sale** - Artwork marked sold without Stripe payment
3. **rls_bypass_attempt** - Security violation detected
4. **stripe_dispute** - Payment dispute created

### Warning Alerts
1. **price_change_approval** - Price change >20% requires approval
2. **payment_deviation** - Payment differs >20% from listed price
3. **price_after_interest** - Price raised after buyer interest
4. **off_platform_payment** - Buyer attempts off-platform payment
5. **suspicious_metadata** - Extreme prices, missing images, inconsistent dimensions
6. **missed_lease_payment** - Leasing payment missed
7. **commission_change** - Gallery commission rate changed
8. **escrow_anomaly** - Refund, partial release, or dispute
9. **high_volume_upload** - >10 artworks uploaded in 1 hour
10. **stripe_webhook_failure** - Webhook processing failed
11. **stripe_refund** - Payment refunded

### Info Alerts
1. **unusual_removal** - Artwork removed without sale/lease/escrow
2. **long_term_listing** - Artwork listed 90+ days

## Approval Flows

### Price Change Approval (>20%)

1. **Seller changes price >20%**
   - Artwork status → `price_change_pending_approval`
   - Admin alert created
   - Price history record created

2. **Seller approves**
   - Calls `approve_price_change_seller(artwork_id)`
   - Updates seller_approved = true

3. **Buyer approves (if interest exists)**
   - Calls `approve_price_change_buyer(artwork_id, buyer_id)`
   - Updates buyer_approved = true

4. **Both approved**
   - Artwork status → `available`
   - Approval status → `approved`

5. **Either rejects**
   - Calls `reject_price_change(artwork_id, rejected_by)`
   - Price reverted to old price
   - Artwork status → `available`
   - Admin notified

### Payment Deviation Approval (>20%)

1. **Payment differs >20% from listed price**
   - Order status → `payment_review`
   - Payment deviation record created
   - Admin alert created

2. **Seller and buyer must approve**
   - Similar flow to price change approval

3. **Admin reviews**
   - Can approve or reject
   - Logs decision in admin_alerts

## Helper Functions

### Database Functions

1. **approve_price_change_seller(artwork_id)** - Seller approves price change
2. **approve_price_change_buyer(artwork_id, buyer_id)** - Buyer approves price change
3. **reject_price_change(artwork_id, rejected_by)** - Reject and revert price change
4. **check_price_approval_complete(artwork_id)** - Check if all approvals received
5. **increment_artwork_view(artwork_id)** - Increment view count
6. **record_buyer_interest(artwork_id, buyer_id, interest_type)** - Record interest
7. **check_payment_deviation(order_id, artwork_id, listed_price, payment_price)** - Check deviation
8. **log_escrow_event(order_id, event_type, amount, initiated_by, reason)** - Log escrow event
9. **log_stripe_webhook(event_id, event_type, event_data, order_id)** - Log webhook
10. **check_high_volume_uploads()** - Detect spam uploads
11. **log_audit_event(user_id, action, entity_type, entity_id, old_values, new_values, rls_bypass)** - Audit logging

## Security Considerations

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only view their own data
- Admins can view all data
- Artists can view their own artwork data
- Buyers can view their own interest/order data

### RLS Bypass Detection
The system logs and alerts on any attempts to bypass RLS:
- Monitors unauthorized access attempts
- Creates critical alerts
- Logs in audit_log table
- Includes IP address and user agent

### Data Protection
- All sensitive operations require authentication
- Admin-only endpoints verify admin role
- Cron jobs require CRON_SECRET
- Audit trail for all significant actions

## Integration Points

### Artwork Upload/Edit
- Automatically tracks price changes
- Validates price ranges
- Records in price_history

### Artwork Viewing
- Calls `increment_artwork_view()`
- Records buyer interest
- Updates analytics

### Order Creation
- Checks payment deviation
- Logs escrow events
- Creates alerts if needed

### Stripe Webhooks
- Logs all webhook events
- Detects failures
- Creates alerts for disputes/refunds

### Artwork Deletion
- Tracks removal event
- Flags unusual removals
- Preserves analytics data

## Cron Jobs

### Daily Jobs
1. **Check Long-term Listings** (`/api/cron/check-long-term-listings`)
   - Runs daily at 2 AM
   - Generates diagnostics for 90+ day listings
   - Creates admin alerts

2. **Check High Volume Uploads** (call `check_high_volume_uploads()`)
   - Runs hourly
   - Detects spam behavior
   - Creates admin alerts

### Configuration (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/check-long-term-listings",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## AI Learning Opportunities

The system collects data for AI to learn:

1. **Pricing Patterns**
   - Price changes over time
   - Category-specific pricing
   - Seasonal variations

2. **Buyer Behavior**
   - Interest patterns
   - Conversion rates
   - Price sensitivity

3. **Seller Behavior**
   - Pricing strategies
   - Upload patterns
   - Response to feedback

4. **Market Trends**
   - Category performance
   - Price level distributions
   - Time-to-sale metrics

5. **Anomaly Detection**
   - Unusual pricing
   - Suspicious patterns
   - Quality issues

## Future Enhancements

1. **Machine Learning Integration**
   - Automated price recommendations
   - Anomaly detection algorithms
   - Predictive analytics

2. **Advanced Diagnostics**
   - Image quality analysis
   - SEO optimization suggestions
   - Competitive pricing analysis

3. **Automated Actions**
   - Auto-approve low-risk changes
   - Auto-flag high-risk patterns
   - Smart notifications

4. **Reporting**
   - Weekly admin summaries
   - Artist performance reports
   - Market trend reports

## Maintenance

### Regular Tasks
1. Review unresolved alerts weekly
2. Analyze AI diagnostics monthly
3. Review audit logs for security issues
4. Update alert thresholds based on data

### Monitoring
1. Alert counts by severity
2. Approval flow completion rates
3. False positive rates
4. System performance metrics

## Support

For questions or issues with the behavior monitoring system:
1. Check admin dashboard for alerts
2. Review audit logs for security issues
3. Consult this documentation
4. Contact development team

---

**Last Updated:** 2026-02-09
**Version:** 1.0.0
**Status:** Production Ready
