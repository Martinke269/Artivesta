# FASE 1 DEPLOYMENT SUMMARY - Escrow Platform Implementation

## Status: ✅ COMPLETED

Alle kritiske komponenter af Fase 1 er nu implementeret og klar til test.

## Implementerede Funktioner

### 1. ✅ Prisforhandlingssystem
**Database:**
- `offers` tabel med pristilbud, status tracking og price deviation alerts
- `admin_alerts` tabel til at advare admin ved prisafvigelser >20%
- Automatisk trigger der opretter alerts ved store prisafvigelser

**API Endpoints:**
- `POST /api/offers` - Opret nyt pristilbud
- `POST /api/offers/[id]/accept` - Acceptér tilbud (kun sælger)
- `POST /api/offers/[id]/reject` - Afvis tilbud (kun sælger)

**Queries:**
- `lib/supabase/offers-queries.ts` - Komplet query library
- `lib/supabase/offers-types.ts` - TypeScript types

### 2. ✅ Stripe Payment Link Generering
**API Endpoint:**
- `POST /api/payments/create-link` - Genererer Stripe Payment Link efter accepteret tilbud

**Funktionalitet:**
- Automatisk generering af payment link med aftalt pris
- Metadata inkluderer offer_id, artwork_id, buyer_id, seller_id
- Beregner automatisk 20% kommission + 25% moms
- Penge går til PLATFORM escrow (ikke direkte til sælger)
- Redirect efter betaling til buyer dashboard

### 3. ✅ Dual Godkendelsessystem
**Database:**
- `escrow_approvals` tabel med buyer_approved og seller_approved felter
- `both_approved` generated column (kun true når begge har godkendt)
- Tracking af hvornår hver part godkendte

**API Endpoints:**
- `POST /api/escrow/[offerId]/buyer-approve` - Køber godkender modtagelse
- `POST /api/escrow/[offerId]/seller-approve` - Sælger godkender levering

**Sikkerhed:**
- Kun køber kan godkende som køber
- Kun sælger kan godkende som sælger
- Validering at betaling er gennemført før godkendelse tillades

### 4. ✅ Automatisk Escrow Frigivelse
**API Endpoint:**
- `POST /api/escrow/[offerId]/release` - Frigiver penge til sælger

**Funktionalitet:**
- KRITISK: Tjekker at BEGGE parter har godkendt før frigivelse
- Beregner automatisk:
  - Platform fee: 20% af salgspris
  - Moms: 25% af platform fee
  - Sælger modtager: 80% - moms
- Opretter Stripe Transfer til sælgers connected account
- Opdaterer escrow_approvals med release detaljer
- Audit logging af alle transaktioner

**Eksempel Beregning:**
```
Salgspris: 10,000 DKK
Platform fee (20%): 2,000 DKK
Moms (25% af fee): 500 DKK
Sælger modtager: 7,500 DKK
```

### 5. ✅ Webhook Integration
**Nye Event Handlers:**
- `payment_intent.succeeded` - Opdaterer offer med payment_intent_id når betaling lykkes
- `payment_intent.payment_failed` - Opretter admin alert ved fejlet betaling

**Funktionalitet:**
- Automatisk opdatering af offers når betaling gennemføres
- Penge holdes i escrow indtil begge parter godkender
- Fejlhåndtering og alerting

## Database Schema

### Nye Tabeller

#### offers
```sql
- id (UUID, PK)
- artwork_id (UUID, FK)
- buyer_id (UUID, FK)
- seller_id (UUID, FK)
- list_price_cents (INTEGER)
- offered_price_cents (INTEGER)
- status (TEXT: pending, accepted, rejected, expired)
- message (TEXT, nullable)
- payment_link_id (TEXT, nullable)
- payment_link_url (TEXT, nullable)
- stripe_payment_intent_id (TEXT, nullable)
- price_deviation_alert_sent (BOOLEAN)
- accepted_at (TIMESTAMPTZ, nullable)
- rejected_at (TIMESTAMPTZ, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### escrow_approvals
```sql
- id (UUID, PK)
- offer_id (UUID, FK, UNIQUE)
- buyer_approved (BOOLEAN)
- buyer_approved_at (TIMESTAMPTZ, nullable)
- seller_approved (BOOLEAN)
- seller_approved_at (TIMESTAMPTZ, nullable)
- both_approved (BOOLEAN, GENERATED)
- funds_released (BOOLEAN)
- funds_released_at (TIMESTAMPTZ, nullable)
- stripe_transfer_id (TEXT, nullable)
- platform_fee_cents (INTEGER, nullable)
- vat_cents (INTEGER, nullable)
- seller_amount_cents (INTEGER, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### admin_alerts
```sql
- id (UUID, PK)
- alert_type (TEXT: price_deviation, escrow_issue, payment_failed, other)
- severity (TEXT: low, medium, high, critical)
- title (TEXT)
- message (TEXT)
- offer_id (UUID, FK, nullable)
- metadata (JSONB)
- is_read (BOOLEAN)
- resolved (BOOLEAN)
- resolved_at (TIMESTAMPTZ, nullable)
- created_at (TIMESTAMPTZ)
```

### Database Functions

#### calculate_escrow_amounts(p_total_price_cents INTEGER)
Beregner automatisk:
- platform_fee_cents (20%)
- vat_cents (25% af fee)
- seller_amount_cents (rest)

#### check_price_deviation()
Trigger function der automatisk:
- Beregner prisafvigelse i procent
- Opretter admin alert hvis >20% afvigelse
- Sætter severity baseret på afvigelsens størrelse

## Row Level Security (RLS)

Alle tabeller har RLS aktiveret med policies:

### offers
- Køber og sælger kan se deres egne tilbud
- Kun køber kan oprette tilbud
- Kun sælger kan opdatere (acceptere/afvise)
- Admin kan se alle

### escrow_approvals
- Køber og sælger kan se deres egne approvals
- Kun køber kan opdatere buyer_approved
- Kun sælger kan opdatere seller_approved
- Admin kan se alle

### admin_alerts
- Kun admin kan se og opdatere

## API Flow - Komplet Transaktion

```
1. Køber sender pristilbud
   POST /api/offers
   {
     artwork_id, seller_id, list_price_cents, 
     offered_price_cents, message
   }

2. Sælger accepterer tilbud
   POST /api/offers/[id]/accept
   → Trigger opretter escrow_approval record

3. Sælger genererer payment link
   POST /api/payments/create-link
   { offer_id }
   → Returnerer payment_link_url

4. Køber betaler via Stripe Payment Link
   → Stripe webhook: payment_intent.succeeded
   → Opdaterer offer.stripe_payment_intent_id
   → Penge holdes i platform escrow

5. Sælger leverer og godkender
   POST /api/escrow/[offerId]/seller-approve
   → Opdaterer seller_approved = true

6. Køber modtager og godkender
   POST /api/escrow/[offerId]/buyer-approve
   → Opdaterer buyer_approved = true
   → both_approved = true (generated)

7. System frigiver penge (kan være automatisk eller manuel trigger)
   POST /api/escrow/[offerId]/release
   → Tjekker both_approved = true
   → Beregner beløb (20% + moms)
   → Stripe Transfer til sælger
   → Opdaterer escrow_approvals med release data
```

## Sikkerhedsfunktioner

### Validering
- ✅ Kun køber kan oprette tilbud
- ✅ Kun sælger kan acceptere/afvise
- ✅ Kun køber kan godkende som køber
- ✅ Kun sælger kan godkende som sælger
- ✅ Penge kan KUN frigives når begge har godkendt
- ✅ Kan ikke ændre pris efter accept
- ✅ Kan ikke godkende før betaling er gennemført

### Price Deviation Alerts
- ✅ Automatisk alert hvis pris afviger >20% fra listepris
- ✅ Severity baseret på afvigelsens størrelse:
  - >50%: high
  - >30%: medium
  - >20%: low

### Audit Trail
- ✅ Alle Stripe events logges i stripe_events
- ✅ Alle transfers logges med metadata
- ✅ Timestamps for alle godkendelser
- ✅ Console logging af kritiske operationer

## Test Checklist

### Prisforhandling
- [ ] Køber kan oprette tilbud
- [ ] Sælger kan se tilbud
- [ ] Sælger kan acceptere tilbud
- [ ] Sælger kan afvise tilbud
- [ ] Admin alert oprettes ved >20% prisafvigelse

### Payment Link
- [ ] Payment link genereres efter accept
- [ ] Link indeholder korrekt pris
- [ ] Metadata er korrekt
- [ ] Redirect fungerer efter betaling

### Betaling & Escrow
- [ ] Betaling via Stripe Payment Link fungerer
- [ ] Webhook opdaterer offer korrekt
- [ ] Penge holdes i escrow (ikke udbetalt til sælger)

### Dual Godkendelse
- [ ] Sælger kan godkende levering
- [ ] Køber kan godkende modtagelse
- [ ] both_approved sættes korrekt
- [ ] Kan ikke godkende før betaling

### Escrow Frigivelse
- [ ] Kan IKKE frigive før begge har godkendt
- [ ] Beregning er korrekt (20% + 25% moms)
- [ ] Stripe Transfer oprettes korrekt
- [ ] Sælger modtager korrekt beløb
- [ ] Database opdateres korrekt

## Næste Skridt (Fase 2)

1. **Dashboard UI Komponenter**
   - Pristilbud inbox for sælger
   - "Send tilbud" formular for køber
   - "Godkend levering" knap for sælger
   - "Godkend modtagelse" knap for køber
   - Escrow status visning

2. **Email Notifikationer**
   - Nyt pristilbud modtaget
   - Pristilbud accepteret/afvist
   - Payment link klar
   - Betaling modtaget
   - Modpart har godkendt
   - Penge frigivet

3. **Admin Interface**
   - Se alle pristilbud
   - Se price deviation alerts
   - Manuel escrow frigivelse
   - Tvist håndtering

## Miljøvariabler Påkrævet

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Deployment Instruktioner

1. **Database Migration**
   ```bash
   # Migrationen er allerede kørt via Supabase MCP
   # Verificer at tabellerne eksisterer:
   # - offers
   # - escrow_approvals
   # - admin_alerts
   ```

2. **Stripe Webhook Setup**
   ```bash
   # Tilføj webhook endpoint i Stripe Dashboard:
   # URL: https://your-domain.com/api/stripe/webhook
   # Events: payment_intent.succeeded, payment_intent.payment_failed
   ```

3. **Test i Stripe Test Mode**
   - Brug test cards: 4242 4242 4242 4242
   - Verificer webhook events modtages
   - Test hele flowet end-to-end

## Kendte Begrænsninger

1. **Ingen automatisk escrow release**
   - Kræver manuel API kald til /api/escrow/[offerId]/release
   - Kan implementeres som cron job eller automatisk trigger i Fase 2

2. **Ingen UI komponenter endnu**
   - Alle operationer skal testes via API calls
   - Dashboard UI kommer i Fase 2

3. **Ingen email notifikationer**
   - Brugere får ikke besked om status ændringer
   - Kommer i Fase 2

4. **Ingen timeout mekanisme**
   - Escrow kan hænge hvis en part ikke godkender
   - Timeout system kommer i Fase 3

## Support & Debugging

### Logs at Tjekke
- Supabase: `stripe_events` tabel for webhook events
- Supabase: `admin_alerts` for price deviation alerts
- Server logs: Console.log output fra API routes

### Common Issues
1. **Payment link virker ikke**: Tjek STRIPE_SECRET_KEY
2. **Webhook fejler**: Verificer STRIPE_WEBHOOK_SECRET
3. **RLS fejl**: Tjek at user er authenticated og har korrekt rolle
4. **Escrow release fejler**: Verificer at both_approved = true

## Konklusion

Fase 1 er nu komplet implementeret med alle kritiske funktioner:
- ✅ Prisforhandling med price deviation alerts
- ✅ Automatisk Stripe Payment Link generering
- ✅ Dual godkendelsessystem
- ✅ Escrow frigivelse med korrekt kommission + moms
- ✅ Webhook integration

Systemet er klar til test og kan håndtere hele transaktionsflowet fra pristilbud til penge frigivelse.
