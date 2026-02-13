# Stripe Connect API Reference

Complete API reference for the Stripe Connect integration in Art Is Safe.

## Base URL

All API endpoints are relative to: `/api/stripe`

## Authentication

All endpoints require authentication via Supabase session cookies. Unauthenticated requests will receive a `401 Unauthorized` response.

## Authorization

All endpoints verify that the authenticated user has access to the requested gallery via RLS policies.

---

## Connect Endpoints

### POST /connect/onboard

Creates a Stripe Connect account and returns an onboarding URL.

**Request Body:**
```json
{
  "galleryId": "uuid",
  "email": "gallery@example.com",
  "country": "DK",  // optional, defaults to "DK"
  "businessType": "company"  // optional, defaults to "company"
}
```

**Response:**
```json
{
  "success": true,
  "onboardingUrl": "https://connect.stripe.com/...",
  "accountId": "acct_..."
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (user doesn't own gallery)
- `404` - Gallery not found
- `500` - Server error

---

### POST /connect/refresh

Generates a new onboarding link if the previous one expired.

**Request Body:**
```json
{
  "galleryId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "onboardingUrl": "https://connect.stripe.com/..."
}
```

---

### GET /connect/status

Returns the onboarding and payout status for a gallery.

**Query Parameters:**
- `galleryId` (required): UUID of the gallery

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acct_...",
    "payoutsEnabled": true,
    "chargesEnabled": true,
    "onboardingStatus": "complete",
    "detailsSubmitted": true,
    "requirements": {
      "currently_due": [],
      "eventually_due": [],
      "past_due": [],
      "disabled_reason": null
    },
    "lastUpdated": "2026-02-11T18:00:00Z"
  }
}
```

---

## Payout Endpoints

### GET /payouts

Returns payout history for a gallery with pagination and filtering.

**Query Parameters:**
- `galleryId` (required): UUID of the gallery
- `limit` (optional): Number of results (1-100, default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (`pending`, `in_transit`, `paid`, `failed`, `canceled`)
- `startDate` (optional): ISO 8601 datetime
- `endDate` (optional): ISO 8601 datetime

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gallery_id": "uuid",
      "payout_id": "po_...",
      "amount": 50000,
      "currency": "dkk",
      "status": "paid",
      "arrival_date": "2026-02-15T00:00:00Z",
      "method": "standard",
      "type": "bank_account",
      "created_at": "2026-02-11T18:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Transfer Endpoints

### GET /transfers

Returns transfer history for a gallery with pagination and filtering.

**Query Parameters:**
- `galleryId` (required): UUID of the gallery
- `limit` (optional): Number of results (1-100, default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (`completed`, `reversed`, `pending`)
- `startDate` (optional): ISO 8601 datetime
- `endDate` (optional): ISO 8601 datetime

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gallery_id": "uuid",
      "transfer_id": "tr_...",
      "amount": 45000,
      "currency": "dkk",
      "destination": "acct_...",
      "source_transaction": "ch_...",
      "status": "completed",
      "metadata": {
        "order_id": "uuid",
        "lease_id": null
      },
      "created_at": "2026-02-11T18:00:00Z"
    }
  ],
  "pagination": {
    "total": 120,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Escrow Endpoints

### POST /escrow/release

Releases escrow funds for a lease or order by creating a transfer to the gallery's Stripe account.

**Request Body:**
```json
{
  "leaseId": "uuid",  // either leaseId or orderId required
  "orderId": "uuid",  // either leaseId or orderId required
  "amount": 45000,  // optional, defaults to full escrow amount
  "reason": "Lease completed successfully"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "transfer": {
    "id": "tr_...",
    "amount": 45000,
    "currency": "dkk",
    "destination": "acct_...",
    "created": 1707674400
  },
  "escrow": {
    "id": "uuid",
    "status": "released",
    "released_at": "2026-02-11T18:00:00Z"
  }
}
```

**Errors:**
- `400` - Validation error or Stripe error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Escrow record not found
- `500` - Server error

---

## Alert Endpoints

### GET /alerts

Returns alerts for a gallery with pagination and filtering.

**Query Parameters:**
- `galleryId` (required): UUID of the gallery
- `limit` (optional): Number of results (1-100, default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `severity` (optional): Filter by severity (`info`, `warning`, `high`, `critical`)
- `resolved` (optional): Filter by resolved status (boolean)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "gallery_id": "uuid",
      "alert_type": "payout_failed",
      "severity": "critical",
      "message": "Payout failed: Insufficient funds",
      "metadata": {
        "payout_id": "po_...",
        "failure_code": "insufficient_funds"
      },
      "resolved": false,
      "resolved_at": null,
      "resolved_note": null,
      "created_at": "2026-02-11T18:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### POST /alerts

Updates an alert (mark as resolved, add notes).

**Request Body:**
```json
{
  "alertId": "uuid",
  "resolved": true,
  "resolvedNote": "Issue fixed by updating bank account"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "resolved": true,
    "resolved_at": "2026-02-11T18:00:00Z",
    "resolved_note": "Issue fixed by updating bank account"
  }
}
```

---

## Health Endpoint

### GET /health

Returns Stripe Connect health metrics for a gallery.

**Query Parameters:**
- `galleryId` (required): UUID of the gallery

**Response:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",  // "healthy" | "warning" | "critical"
    "score": 100,  // 0-100
    "lastWebhookAt": "2026-02-11T18:00:00Z",
    "metrics": {
      "failedEvents": 0,
      "pendingPayouts": 2,
      "unresolvedAlerts": 0,
      "criticalAlerts": 0
    },
    "account": {
      "payoutsEnabled": true,
      "chargesEnabled": true,
      "onboardingStatus": "complete",
      "lastUpdated": "2026-02-11T17:00:00Z"
    }
  }
}
```

**Health Score Calculation:**
- Base score: 100
- -30 if payouts not enabled
- -30 if charges not enabled
- -10 if failed events in last 24h
- -20 if critical unresolved alerts
- -10 if more than 5 unresolved alerts

---

## Webhook Endpoint

### POST /webhook

Receives and processes Stripe webhook events.

**Headers:**
- `stripe-signature` (required): Stripe webhook signature

**Supported Events:**
- `account.updated`
- `account.external_account.*`
- `payout.paid`
- `payout.failed`
- `payout.canceled`
- `transfer.created`
- `transfer.updated`
- `transfer.reversed`
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`
- `application_fee.created`
- `application_fee.refunded`

**Response:**
```json
{
  "received": true
}
```

**Security:**
- Validates Stripe signature
- Uses raw request body
- Implements idempotency via event_id checking
- All database operations use service role key

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for resource)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints inherit Next.js and Vercel rate limiting. For production use, consider implementing additional rate limiting at the application level.

---

## Best Practices

1. **Always check health status** before critical operations
2. **Handle webhook events idempotently** - events may be delivered multiple times
3. **Monitor alerts regularly** - set up notifications for critical alerts
4. **Verify account status** before attempting transfers
5. **Use pagination** for large result sets
6. **Implement retry logic** for transient errors
7. **Log all Stripe operations** for audit trails
