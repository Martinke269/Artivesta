# Art Marketplace MVP - Development Prompt

## Project Overview

Create a simple PHP-based art marketplace with escrow-like Stripe PaymentIntent (manual capture), 20% commission, and SQLite database. The system should be minimal, production-ready, and easy to deploy.

## Technical Requirements

- **Language**: PHP 7.4+
- **Database**: SQLite
- **Payment**: Stripe API (manual capture for escrow)
- **Authentication**: HTTP Basic Auth for admin
- **Dependencies**: None (use cURL for Stripe API)
- **UI Language**: Danish

## Core Features

1. **Public Marketplace**
   - Browse available artworks
   - View artwork details
   - Purchase with email (no user registration required)

2. **Payment Processing**
   - Stripe PaymentIntent with `capture_method: manual`
   - Funds authorized but not captured (escrow)
   - Admin manually captures after verification

3. **Admin Panel**
   - HTTP Basic authentication
   - View all orders and payouts
   - Verify orders (creates payout records)
   - Capture payments from Stripe
   - Generate invoices

4. **Commission System**
   - 20% platform commission (configurable)
   - Automatic calculation on each transaction
   - Tracked in payouts table

## File Structure

```
/
├── config.php          # Configuration array
├── init_db.php        # Database initialization (run once, then protect/delete)
├── index.php          # Homepage - browse artworks
├── artwork.php        # Artwork detail and purchase page
├── create_order.php   # Order creation and Stripe PaymentIntent
├── webhook.php        # Stripe webhook handler
├── admin.php          # Admin panel (HTTP Basic auth)
├── invoice.php        # Invoice generator
├── styles.css         # Stylesheet
├── README.md          # Documentation
├── db/
│   └── schema.sql     # Database schema reference
└── data/
    └── artmarket.sqlite  # SQLite database (created by init_db.php)
```

## Configuration (config.php)

```php
<?php
return [
  'stripe_secret' => 'sk_test_xxx',
  'stripe_publishable' => 'pk_test_xxx',
  'stripe_webhook_secret' => 'whsec_xxx',
  'admin_user' => 'admin',
  'admin_pass' => 'changeme',
  'db_path' => __DIR__ . '/data/artmarket.sqlite',
  'commission_rate' => 0.20,
  'base_url' => 'https://yourdomain.com/artmarket'
];
```

## Database Schema

### users
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- email (TEXT)
- name (TEXT)
- role (TEXT)

### artworks
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- artist_name (TEXT)
- title (TEXT)
- description (TEXT)
- price_cents (INTEGER) - Store prices in cents/øre
- currency (TEXT DEFAULT 'DKK')
- status (TEXT DEFAULT 'listed') - Values: 'listed', 'sold'

### orders
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- artwork_id (INTEGER)
- buyer_email (TEXT)
- amount_cents (INTEGER)
- currency (TEXT)
- status (TEXT DEFAULT 'pending') - Values: 'pending', 'deposited', 'verified', 'captured'
- stripe_pi_id (TEXT) - Stripe PaymentIntent ID
- created_at (TEXT)

### payouts
- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- order_id (INTEGER)
- seller_name (TEXT)
- amount_cents (INTEGER) - Amount to seller after commission
- commission_cents (INTEGER) - Platform commission
- status (TEXT DEFAULT 'pending')
- created_at (TEXT)

## Implementation Details

### 1. Database Initialization (init_db.php)

- Check if database already exists
- Create data directory if needed
- Create all tables
- Insert sample artworks
- Exit with message
- **Important**: Must be protected or deleted after first run

### 2. Homepage (index.php)

- Load config
- Connect to database
- Query artworks with status='listed'
- Display in grid/list format
- Show: title, artist name, description, price
- Link to artwork detail page

### 3. Artwork Detail (artwork.php)

- Get artwork ID from URL parameter
- Display full artwork details
- Show purchase form with email input
- Submit to create_order.php

### 4. Order Creation (create_order.php)

- Validate artwork_id and buyer_email
- Fetch artwork from database
- Create Stripe PaymentIntent via cURL:
  ```php
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'amount' => $amount,
    'currency' => strtolower($currency),
    'payment_method_types[]' => 'card',
    'capture_method' => 'manual',
    'metadata[artwork_id]' => $artwork_id,
    'metadata[buyer_email]' => $buyer_email
  ]));
  ```
- Insert order into database with status='deposited'
- Display confirmation with order ID
- Note: This is simplified - full implementation needs Stripe Elements/Checkout

### 5. Webhook Handler (webhook.php)

- Receive Stripe webhook events
- Parse JSON payload
- Handle 'payment_intent.succeeded' event
- Update order status to 'deposited'
- Log to webhook.log file
- Return 200 OK

### 6. Admin Panel (admin.php)

**Authentication:**
- Check PHP_AUTH_USER and PHP_AUTH_PW
- Compare with config values
- Return 401 if not authenticated

**Actions:**
- **Verify Order**: 
  - Update order status to 'verified'
  - Calculate commission (amount * commission_rate)
  - Calculate seller amount (amount - commission)
  - Insert payout record
  - Update artwork status to 'sold'
  
- **Capture Payment**:
  - Call Stripe API to capture PaymentIntent
  - Update order status to 'captured'
  
**Display:**
- Table of all orders with actions
- Table of all payouts
- Links to invoices

### 7. Invoice (invoice.php)

- Get order ID from URL parameter
- Join orders with artworks table
- Calculate commission and seller amount
- Display formatted invoice with:
  - Order details
  - Artwork details
  - Payment breakdown
  - Stripe PaymentIntent ID
- Print button (hide on print)

### 8. Styling (styles.css)

- Clean, modern design
- Responsive layout
- Card-based artwork display
- Professional table styling
- Form styling
- Print-friendly invoice styles

## Payment Flow

1. **Buyer purchases artwork**
   - Submits email on artwork page
   - create_order.php creates Stripe PaymentIntent with manual capture
   - Order stored with status='deposited'

2. **Payment authorized (escrow)**
   - Funds authorized on buyer's card
   - NOT captured yet
   - Webhook updates order status

3. **Admin verification**
   - Admin reviews order in admin panel
   - Clicks "Verify" to create payout record
   - Commission calculated and stored

4. **Payment capture**
   - Admin clicks "Capture" 
   - Stripe API captures the payment
   - Funds transferred
   - Order status updated to 'captured'

## Security Considerations

1. **Input Validation**
   - Use `intval()` for IDs
   - Use `htmlspecialchars()` for output
   - Use prepared statements for SQL

2. **Authentication**
   - HTTP Basic Auth for admin panel
   - Check credentials on every admin request

3. **Database**
   - Use PDO with prepared statements
   - Set ERRMODE_EXCEPTION
   - Validate all inputs

4. **Stripe**
   - Use webhook signature verification (when configured)
   - Store API keys in config file (not in code)
   - Use manual capture for escrow protection

## Testing

**Stripe Test Cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Any future expiry, any 3-digit CVC

**Test Flow:**
1. Run init_db.php to create database
2. Browse to index.php
3. Click artwork to view details
4. Enter email and submit
5. Note order ID
6. Access admin.php (use configured credentials)
7. Verify order
8. Capture payment
9. View invoice

## Deployment Checklist

- [ ] Update Stripe keys in config.php (production keys)
- [ ] Set strong admin password in config.php
- [ ] Run init_db.php once
- [ ] Protect or delete init_db.php
- [ ] Configure Stripe webhook endpoint
- [ ] Enable HTTPS
- [ ] Set proper file permissions (data directory writable)
- [ ] Test complete purchase flow
- [ ] Verify webhook is working

## Danish UI Text

- "Pris" = Price
- "Køb" = Buy
- "Tilbage til markedsplads" = Back to marketplace
- "Betaling reserveret" = Payment reserved
- "DB findes allerede" = Database already exists
- "DB oprettet" = Database created
- "Artwork ikke fundet" = Artwork not found

## Commission Example

For a 1500 DKK artwork with 20% commission:
- Buyer pays: 1500 DKK
- Platform commission: 300 DKK (20%)
- Artist receives: 1200 DKK (80%)

## Notes

- Prices stored in cents/øre (multiply by 100)
- Currency defaults to DKK but can be changed per artwork
- No user registration required for buyers
- Admin panel uses HTTP Basic Auth (simple but effective)
- Webhook signature verification should be added for production
- Full Stripe Checkout/Elements integration needed for production
- Consider migrating to MySQL/PostgreSQL for production scale
