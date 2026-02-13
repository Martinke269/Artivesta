# Stripe Connect Implementation Guide

## Overview

This document describes the full Stripe Connect (Standard Accounts) integration in Art Is Safe, enabling galleries to receive payouts directly to their bank accounts.

## Architecture

### Database Schema

The Stripe Connect system uses the following tables:

1. **stripe_accounts** - Connected account information
2. **stripe_payouts** - Payout history from Stripe
3. **stripe_transfers** - Platform-to-gallery transfers
4. **stripe_events** - Webhook event audit log
5. **stripe_application_fees** - Commission tracking
6. **stripe_escrow** - Escrow management for leases
7. **stripe_alerts** - System alerts and notifications

All tables have comprehensive RLS policies ensuring galleries can only access their own data.

### Key Features

- **Standard Accounts**: Galleries maintain their own Stripe accounts
- **Onboarding Flow**: Seamless account creation and verification
- **Automatic Transfers**: Commission-based transfers after sales
- **Escrow System**: Hold and release funds for leases
- **Webhook Processing**: Real-time event handling
- **Alert System**: Proactive notifications for issues
- **Founder-OS Integration**: Metrics for business intelligence

## Security Considerations

### RLS Policies

All Stripe-related tables enforce strict RLS:
- Galleries can only view their own Stripe data
- Admin users have SELECT-only access for support
- Service role bypasses RLS for webhook processing

### Data Protection

- Sensitive Stripe data is never exposed to clients
- All Stripe operations use server-side API routes
- Webhook signatures are verified before processing
- Payment intents use application fees (not direct charges)

## Commission Logic

```typescript
// Example: 20% commission on 10,000 DKK sale
const salePrice = 1000000; // cents
const commissionRate = 20; // percent

const applicationFeeAmount = Math.round(salePrice * 0.20); // 200000 cents
const transferAmount = salePrice - applicationFeeAmount; // 800000 cents
```

## Onboarding Flow

### Step 1: Create Account

```typescript
POST /api/stripe/connect/onboard
{
  "galleryId": "uuid",
  "email": "gallery@example.com"
}
```

Response includes `onboardingUrl` for Stripe-hosted onboarding.

### Step 2: Complete Onboarding

User completes Stripe onboarding form. Stripe redirects to:
```
/gallery/dashboard/stripe/onboarding/complete?account_id=acct_xxx
```

### Step 3: Verify Status

```typescript
GET /api/stripe/connect/status?galleryId=uuid
```

Returns account status including `payouts_enabled` and `charges_enabled`.

## Payment Flow

### 1. Customer Purchase

```typescript
// Create payment intent with application fee
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000000, // 10,000 DKK
  currency: 'dkk',
  application_fee_amount: 200000, // 2,000 DKK commission
  transfer_data: {
    destination: 'acct_gallery123',
  },
});
```

### 2. Automatic Transfer

After successful payment, Stripe automatically:
1. Collects the application fee (commission)
2. Transfers remaining amount to gallery's connected account

### 3. Database Recording

Webhook handler records:
- Transfer in `stripe_transfers` table
- Application fee in `stripe_application_fees` table
- Updates order status

## Escrow System

For leases and high-value purchases:

### Hold Funds

```typescript
await createEscrowRecord({
  galleryId: 'uuid',
  leaseId: 'uuid',
  amount: 500000,
  currency: 'dkk',
  releaseScheduledFor: new Date('2026-03-01'),
});
```

### Release Funds

Cron job runs daily to release scheduled escrows:

```typescript
POST /api/cron/release-escrow
```

Or manual release via admin:

```typescript
POST /api/stripe/escrow/release
{
  "escrowId": "uuid"
}
```

## Webhook Events

The system handles these Stripe webhook events:

### Account Events
- `account.updated` - Update account status and requirements
- `account.external_account.created` - Bank account added
- `account.external_account.deleted` - Bank account removed

### Payout Events
- `payout.paid` - Record successful payout
- `payout.failed` - Create alert for failed payout
- `payout.canceled` - Update payout status

### Transfer Events
- `transfer.created` - Record new transfer
- `transfer.failed` - Create alert and update status
- `transfer.reversed` - Handle transfer reversal

### Charge Events
- `charge.succeeded` - Process successful payment
- `charge.failed` - Handle payment failure
- `charge.refunded` - Process refund

### Dispute Events
- `charge.dispute.created` - Create critical alert
- `charge.dispute.closed` - Update escrow if applicable

## API Routes

### Onboarding

```typescript
POST /api/stripe/connect/onboard
GET  /api/stripe/connect/refresh
GET  /api/stripe/connect/status
```

### Payouts

```typescript
GET /api/stripe/connect/payouts?galleryId=uuid&limit=10&offset=0
```

### Transfers

```typescript
GET /api/stripe/connect/transfers?galleryId=uuid&limit=10&offset=0
```

### Webhooks

```typescript
POST /api/stripe/webhook
```

## UI Components

### Gallery Dashboard Pages

1. **Stripe Onboarding** (`/gallery/dashboard/stripe/onboarding`)
   - Connect with Stripe button
   - Onboarding status display
   - Refresh link for incomplete onboarding

2. **Payouts** (`/gallery/dashboard/stripe/payouts`)
   - Payout history table
   - Status indicators
   - Next payout date
   - Filters and search

3. **Transfers** (`/gallery/dashboard/stripe/transfers`)
   - Transfer history
   - Commission breakdown
   - Order/lease references

4. **Alerts** (`/gallery/dashboard/stripe/alerts`)
   - Active alerts
   - Alert history
   - Action buttons

## Alert Types

### Critical
- `payout_failed` - Payout to bank account failed
- `account_disabled` - Stripe account disabled
- `dispute_opened` - Customer dispute opened

### High
- `transfer_failed` - Transfer to gallery failed
- `missing_requirements` - Additional verification needed

### Medium
- `onboarding_incomplete` - Onboarding not finished
- `verification_needed` - Documents required

### Low/Info
- `compliance_issue` - Minor compliance notice

## Founder-OS Metrics

The following metrics are exposed to Founder-OS:

```typescript
{
  stripe_total_payouts: number,        // Total paid out to galleries
  stripe_total_commission: number,     // Total commission collected
  stripe_escrow_volume: number,        // Current escrow holdings
  stripe_payout_failures: number,      // Failed payout count
  stripe_transfer_failures: number,    // Failed transfer count
  stripe_onboarding_incomplete: number, // Incomplete onboardings
  stripe_risk_score: number            // Risk score (0-100)
}
```

Updated via:
```sql
SELECT update_founder_os_stripe_metrics();
```

## Testing

### Test Mode

Use Stripe test keys in development:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Test Webhooks

Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Monitoring

### Key Metrics to Monitor

1. **Payout Success Rate**: Should be > 99%
2. **Transfer Success Rate**: Should be > 99.5%
3. **Onboarding Completion Rate**: Target > 80%
4. **Average Time to Payout**: Track for user satisfaction
5. **Escrow Release Accuracy**: Should be 100%

### Alert Thresholds

- Critical: Immediate action required
- High: Action within 24 hours
- Medium: Action within 1 week
- Low: Review monthly

## Troubleshooting

### Payout Failed

1. Check `stripe_payouts` table for `failure_code`
2. Common causes:
   - Invalid bank account
   - Insufficient balance
   - Account restrictions
3. Create alert for gallery to update bank details

### Transfer Failed

1. Check `stripe_transfers` table for `failure_code`
2. Common causes:
   - Account not verified
   - Negative balance
   - Account disabled
3. May need to reverse order or refund customer

### Onboarding Stuck

1. Check `stripe_accounts.requirements` field
2. Generate new onboarding link
3. Contact gallery with specific requirements

## Compliance

### PCI Compliance

- Never store card details
- Use Stripe.js for card collection
- All payments processed by Stripe

### Data Retention

- Keep webhook events for 90 days
- Archive old payouts/transfers after 7 years
- Delete test data regularly

### GDPR

- Galleries can request data export
- Support data deletion requests
- Maintain audit trail

## Future Enhancements

1. **Instant Payouts**: Enable for eligible accounts
2. **Multi-Currency**: Support EUR, USD, etc.
3. **Payout Scheduling**: Let galleries choose payout frequency
4. **Advanced Analytics**: Detailed financial reports
5. **Tax Reporting**: Automated 1099/VAT forms

## Support

For Stripe-related issues:
1. Check Stripe Dashboard logs
2. Review webhook event history
3. Check `stripe_events` table
4. Contact Stripe support if needed

## References

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
