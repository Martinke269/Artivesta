# Manglende Funktioner til Fuldt Funktionel Escrow Platform

## Nuværende Status
Platformen har allerede implementeret:
- ✅ Stripe Connect integration med escrow system
- ✅ Gallery og buyer dashboards
- ✅ Orders tabel med `stripe_payment_link_id` og `escrow_status`
- ✅ Stripe escrow tabel til at holde penge
- ✅ Automatisk kommissionsberegning (20%)
- ✅ Webhook håndtering

## Manglende Kritiske Funktioner

### 1. PRISFORHANDLING & TILBUD SYSTEM ⚠️ MANGLER
**Problem:** Der er ingen måde for køber og sælger at forhandle pris før betaling.

**Hvad der mangler:**
- `price_negotiations` tabel til at spore forhandlinger
- UI hvor køber kan sende tilbud på kunstværk
- UI hvor sælger kan acceptere/afvise/modtilbud
- Notifikationssystem for nye tilbud
- Historik over prisforhandlinger

**Database struktur der mangler:**
```sql
CREATE TABLE price_negotiations (
  id UUID PRIMARY KEY,
  artwork_id UUID REFERENCES artworks(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  original_price_cents INTEGER,
  offered_price_cents INTEGER,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
  counter_price_cents INTEGER,
  message TEXT,
  created_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);
```

### 2. STRIPE PAYMENT LINK GENERERING ⚠️ MANGLER
**Problem:** Når sælger accepterer pris, skal der automatisk genereres et Stripe Payment Link.

**Hvad der mangler:**
- API endpoint: `POST /api/stripe/create-payment-link`
- Funktion til at generere Stripe Payment Link med:
  - Aftalt pris
  - 20% platform kommission
  - Automatisk escrow hold
  - Link til køber via email/dashboard
- Integration med `orders` tabel (`stripe_payment_link_id`)

**Eksempel implementation:**
```typescript
// app/api/stripe/create-payment-link/route.ts
const paymentLink = await stripe.paymentLinks.create({
  line_items: [{
    price_data: {
      currency: 'dkk',
      product_data: { name: artwork.title },
      unit_amount: agreedPriceCents,
    },
    quantity: 1,
  }],
  application_fee_amount: Math.round(agreedPriceCents * 0.20), // 20%
  on_behalf_of: sellerStripeAccountId,
  transfer_data: { destination: sellerStripeAccountId },
  metadata: { order_id: orderId },
});
```

### 3. DUAL GODKENDELSE SYSTEM ⚠️ MANGLER
**Problem:** Både køber og sælger skal godkende før penge frigives fra escrow.

**Hvad der mangler:**
- `order_approvals` tabel til at spore godkendelser
- UI i seller dashboard: "Godkend levering" knap
- UI i buyer dashboard: "Godkend modtagelse" knap
- Logik: Kun når BEGGE har godkendt, frigives penge
- Email notifikationer når den anden part godkender

**Database struktur der mangler:**
```sql
CREATE TABLE order_approvals (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  seller_approved BOOLEAN DEFAULT false,
  seller_approved_at TIMESTAMPTZ,
  buyer_approved BOOLEAN DEFAULT false,
  buyer_approved_at TIMESTAMPTZ,
  both_approved BOOLEAN GENERATED ALWAYS AS (seller_approved AND buyer_approved) STORED,
  funds_released BOOLEAN DEFAULT false,
  funds_released_at TIMESTAMPTZ
);
```

### 4. AUTOMATISK ESCROW FRIGIVELSE ⚠️ DELVIST IMPLEMENTERET
**Problem:** Når begge parter godkender, skal pengene automatisk frigives minus kommission.

**Hvad der mangler:**
- API endpoint: `POST /api/orders/[id]/approve` (for både køber og sælger)
- Trigger funktion der tjekker om begge har godkendt
- Automatisk kald til Stripe Transfer API
- Beregning: `transfer_amount = amount_cents * 0.80` (minus 20% kommission)
- Opdatering af `stripe_escrow` status til 'released'
- Opdatering af `orders` status til 'completed'

**Eksempel implementation:**
```typescript
// Når begge har godkendt
if (sellerApproved && buyerApproved) {
  const commissionAmount = Math.round(orderAmount * 0.20);
  const transferAmount = orderAmount - commissionAmount;
  
  // Frigiv penge til sælger
  await stripe.transfers.create({
    amount: transferAmount,
    currency: 'dkk',
    destination: sellerStripeAccountId,
    transfer_group: orderId,
  });
  
  // Opdater escrow status
  await updateEscrowStatus(orderId, 'released');
}
```

### 5. MOMS HÅNDTERING ⚠️ MANGLER
**Problem:** 20% kommission + moms er ikke implementeret korrekt.

**Hvad der mangler:**
- Beregning af moms (25% i Danmark) på kommissionen
- Korrekt fakturering med moms
- `platform_fees` tabel til at spore kommission + moms
- Moms rapportering til Skat

**Korrekt beregning:**
```typescript
const salePrice = 10000; // DKK
const commissionRate = 0.20; // 20%
const vatRate = 0.25; // 25% moms

const commissionBeforeVat = salePrice * commissionRate; // 2000 DKK
const vatAmount = commissionBeforeVat * vatRate; // 500 DKK
const totalCommission = commissionBeforeVat + vatAmount; // 2500 DKK
const sellerReceives = salePrice - totalCommission; // 7500 DKK
```

### 6. NOTIFIKATIONSSYSTEM ⚠️ MANGLER
**Problem:** Brugere får ikke besked om vigtige events.

**Hvad der mangler:**
- Email notifikationer for:
  - Nyt pristilbud modtaget
  - Pristilbud accepteret/afvist
  - Payment link klar
  - Betaling modtaget (escrow hold)
  - Modpart har godkendt
  - Penge frigivet
- In-app notifikationer i dashboards
- SMS notifikationer (valgfrit)

### 7. TVIST HÅNDTERING ⚠️ MANGLER
**Problem:** Hvis køber eller sælger ikke godkender, er der ingen proces.

**Hvad der mangler:**
- "Åbn tvist" knap i dashboards
- Admin interface til at håndtere tvister
- Mulighed for refundering
- Mulighed for manuel frigivelse
- Tvist historik og dokumentation

### 8. TIMEOUT MEKANISME ⚠️ MANGLER
**Problem:** Hvis en part ikke godkender, hænger pengene i escrow for evigt.

**Hvad der mangler:**
- Automatisk frigivelse efter X dage hvis køber ikke klager
- Automatisk refundering efter Y dage hvis sælger ikke leverer
- Påmindelser før timeout
- Cron job til at tjekke timeouts

### 9. DASHBOARD UI KOMPONENTER ⚠️ DELVIST MANGLER

**Seller Dashboard mangler:**
- Pristilbud inbox
- "Send modtilbud" formular
- "Godkend levering" knap for hver ordre
- Escrow status visning

**Buyer Dashboard mangler:**
- "Send tilbud" formular på kunstværk
- Payment link visning
- "Godkend modtagelse" knap
- Escrow status visning

### 10. SIKKERHED & VALIDERING ⚠️ KRITISK
**Problem:** Manglende validering kan føre til svindel.

**Hvad der mangler:**
- Validering: Kun køber kan godkende modtagelse
- Validering: Kun sælger kan godkende levering
- Validering: Kan ikke ændre pris efter betaling
- Rate limiting på pristilbud
- Fraud detection
- KYC/AML checks for store transaktioner

## Prioriteret Implementation Plan

### FASE 1: KRITISK (Uge 1-2)
1. ✅ Prisforhandling system (database + API)
2. ✅ Stripe Payment Link generering
3. ✅ Dual godkendelse system (database + API)
4. ✅ Automatisk escrow frigivelse

### FASE 2: HØJTPRIORITERET (Uge 3-4)
5. ✅ Dashboard UI komponenter
6. ✅ Email notifikationssystem
7. ✅ Moms håndtering korrekt

### FASE 3: MEDIUM (Uge 5-6)
8. ✅ Tvist håndtering system
9. ✅ Timeout mekanisme
10. ✅ Admin interface til tvister

### FASE 4: SIKKERHED (Løbende)
11. ✅ Sikkerhedsvalidering
12. ✅ Fraud detection
13. ✅ Rate limiting
14. ✅ Audit logging

## Teknisk Arkitektur Oversigt

```
FLOW:
1. Køber ser kunstværk → Sender pristilbud
2. Sælger modtager notifikation → Accepterer/afviser/modtilbud
3. Ved accept → System genererer Stripe Payment Link
4. Køber betaler → Penge går til platform escrow
5. Sælger leverer → Klikker "Godkend levering"
6. Køber modtager → Klikker "Godkend modtagelse"
7. System tjekker: Begge godkendt? → Ja
8. System beregner: 80% til sælger, 20% + moms til platform
9. Stripe Transfer frigiver penge til sælger
10. Alle får email: "Transaktion gennemført"
```

## Estimeret Udviklingstid
- **Fase 1 (Kritisk):** 60-80 timer
- **Fase 2 (Høj):** 40-50 timer
- **Fase 3 (Medium):** 30-40 timer
- **Fase 4 (Sikkerhed):** 20-30 timer
- **Total:** 150-200 timer (4-5 ugers fuldtidsarbejde)

## Næste Skridt
1. Godkend denne plan
2. Start med Fase 1: Prisforhandling database migration
3. Implementer API endpoints
4. Byg UI komponenter
5. Test hele flowet end-to-end
6. Deploy til produktion med monitoring
