# Stripe Connect Setup Guide

This guide will help you set up Stripe Connect for Art Is Safe's marketplace functionality.

## Prerequisites

- A Stripe account (sign up at https://stripe.com if you don't have one)
- Access to your Stripe Dashboard

## Step 1: Get Your API Keys

### 1.1 Navigate to API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Click on **Developers** in the left sidebar
3. Click on **API keys**

### 1.2 Copy Your Keys

You'll see two types of keys:

**For Testing (Development):**
- **Publishable key**: Starts with `pk_test_...`
- **Secret key**: Starts with `sk_test_...` (click "Reveal test key")

**For Production:**
- **Publishable key**: Starts with `pk_live_...`
- **Secret key**: Starts with `sk_live_...` (click "Reveal live key")

### 1.3 Update .env.local

Replace the placeholder values in your `.env.local` file:

```env
# For testing/development
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here

# For production
# STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key_here
```

## Step 2: Enable Stripe Connect

### 2.1 Activate Connect

1. In your Stripe Dashboard, click on **Connect** in the left sidebar
2. Click **Get started** if this is your first time
3. Choose **Standard accounts** (this is what Art Is Safe uses)
4. Complete the Connect onboarding form

### 2.2 Configure Connect Settings

1. Go to **Connect** → **Settings**
2. Under **Branding**, add:
   - Business name: "Art Is Safe"
   - Business icon/logo
   - Brand color
3. Under **Customer experience**, configure:
   - Statement descriptor: "ARTISSAFE"
   - Support email: your support email
   - Support phone: your support phone

## Step 3: Set Up Webhooks

Webhooks allow Stripe to notify your application about events (payments, payouts, etc.).

### 3.1 Create Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   - **Development**: `https://your-dev-url.com/api/stripe/webhook`
   - **Production**: `https://www.artissafe.dk/api/stripe/webhook`

### 3.2 Select Events to Listen To

Select the following events (these are required for the system to work):

**Account events:**
- `account.updated`
- `account.external_account.created`
- `account.external_account.deleted`

**Payout events:**
- `payout.paid`
- `payout.failed`
- `payout.canceled`

**Transfer events:**
- `transfer.created`
- `transfer.failed`
- `transfer.reversed`

**Charge events:**
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`

**Dispute events:**
- `charge.dispute.created`
- `charge.dispute.closed`

**Payment Intent events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 3.3 Get Webhook Secret

1. After creating the endpoint, click on it
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)
4. Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## Step 4: Configure Platform Settings

### 4.1 Set Commission Rate

The default commission rate is 20%. To change it:

1. Update the commission logic in `lib/stripe/stripe-connect.ts`
2. Or configure it in your database settings

### 4.2 Set Payout Schedule

1. Go to **Connect** → **Settings** → **Payouts**
2. Configure default payout schedule for connected accounts:
   - **Daily**: Fastest, but may have higher fees
   - **Weekly**: Good balance
   - **Monthly**: Lowest fees, but slower

## Step 5: Test the Integration

### 5.1 Test Onboarding Flow

1. Create a test gallery account in your application
2. Navigate to the Stripe onboarding page
3. Complete the onboarding with test data:
   - Use test bank account: `000123456789` (routing: `110000000`)
   - Use test SSN: `000-00-0000`
   - Use any valid address

### 5.2 Test Payment Flow

1. Create a test artwork listing
2. Make a test purchase using test card: `4242 4242 4242 4242`
3. Verify:
   - Payment succeeds
   - Transfer is created to gallery account
   - Commission is recorded
   - Webhook events are processed

### 5.3 Test Webhook Delivery

1. Go to **Developers** → **Webhooks** → Your endpoint
2. Click on any event
3. Click **Send test webhook**
4. Verify your application receives and processes it correctly

## Step 6: Production Checklist

Before going live with real payments:

- [ ] Switch to live API keys (`sk_live_...` and `pk_live_...`)
- [ ] Create production webhook endpoint
- [ ] Update webhook secret to production value
- [ ] Complete Stripe account verification
- [ ] Enable Connect in production mode
- [ ] Test with real bank account (small amount)
- [ ] Set up monitoring and alerts
- [ ] Review Stripe's compliance requirements
- [ ] Configure tax settings if applicable
- [ ] Set up fraud prevention rules

## Step 7: Monitoring and Maintenance

### 7.1 Monitor Webhook Health

1. Regularly check **Developers** → **Webhooks**
2. Look for failed deliveries
3. Set up alerts for webhook failures

### 7.2 Monitor Payouts

1. Check **Connect** → **Payouts** regularly
2. Monitor for failed payouts
3. Set up alerts for payout issues

### 7.3 Review Disputes

1. Monitor **Payments** → **Disputes**
2. Respond to disputes promptly
3. Keep evidence for all transactions

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct and accessible
2. Verify webhook secret matches `.env.local`
3. Check server logs for errors
4. Use Stripe CLI to test locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Onboarding Link Not Working

1. Verify account ID is correct
2. Check if onboarding is already complete
3. Generate a new onboarding link via API

### Transfers Failing

1. Check connected account status
2. Verify account has completed onboarding
3. Check for negative balance
4. Review Stripe Dashboard for specific error

### Payouts Failing

1. Verify bank account details are correct
2. Check account verification status
3. Review payout schedule settings
4. Contact Stripe support if issue persists

## Security Best Practices

1. **Never commit API keys to version control**
   - Keys are in `.env.local` which is gitignored
   - Use environment variables in production

2. **Verify webhook signatures**
   - Always verify `stripe-signature` header
   - This is handled automatically in the webhook route

3. **Use HTTPS in production**
   - Stripe requires HTTPS for webhooks
   - Your production URL must use SSL/TLS

4. **Restrict API key permissions**
   - Use restricted keys when possible
   - Limit access to only required operations

5. **Monitor for suspicious activity**
   - Set up Stripe Radar for fraud detection
   - Review transactions regularly
   - Set up alerts for unusual patterns

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Connect Guide**: https://stripe.com/docs/connect
- **Stripe Support**: https://support.stripe.com
- **Stripe Status**: https://status.stripe.com

## Next Steps

After completing this setup:

1. Test the complete payment flow
2. Test gallery onboarding
3. Test webhook processing
4. Review the Stripe Dashboard
5. Set up monitoring and alerts
6. Train your team on Stripe operations

For questions or issues, refer to the main implementation documentation in `docs/STRIPE_CONNECT_IMPLEMENTATION.md`.
