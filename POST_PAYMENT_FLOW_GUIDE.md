# Post-Payment Flow Guide

Dette dokument beskriver det komplette flow efter en betaling er gennemført på platformen.

## Oversigt

Efter en vellykket betaling gennemgår brugeren følgende flow:

1. **Stripe Webhook** modtager betalingsbekræftelse
2. **Onboarding Wizard** guider brugeren gennem opsætning
3. **Dashboard** bliver tilgængeligt med fuld funktionalitet

---

## 1. Stripe Webhook Flow

### Webhook Endpoint
`/api/stripe/webhook`

### Betalingsrelaterede Events

#### `payment_intent.succeeded`
- Opdaterer offer med payment intent ID
- Holder midler i escrow indtil begge parter godkender
- Logger event i `stripe_events` tabellen

#### `charge.succeeded`
- Opdaterer ordre status til `paid`
- Gemmer Stripe charge ID
- Trigger notifikationer til køber og sælger

#### `account.updated`
- Opdaterer gallery's Stripe Connect status
- Tjekker om onboarding er komplet
- Aktiverer payouts hvis godkendt

### Sikkerhed
- Verificerer webhook signature
- Bruger Supabase admin client
- Logger alle events for audit trail

---

## 2. Gallery Onboarding Flow

### URL: `/onboarding/gallery`

### Step 1: Gallery Profile
**Formål:** Opret galleri profil med grundlæggende information

**Felter:**
- Gallery navn (påkrævet)
- Email (påkrævet)
- Adresse, by, postnummer (påkrævet)
- Land (default: Denmark)
- Telefon (valgfri)
- Website (valgfri)
- Beskrivelse (valgfri)
- Logo URL (valgfri)

**Database:**
- Opretter eller opdaterer record i `galleries` tabellen
- Sætter `onboarding_step` til 2

### Step 2: First Artwork
**Formål:** Upload første kunstværk for AI analyse

**Felter:**
- Titel (påkrævet)
- Kunstner navn (påkrævet)
- Beskrivelse (påkrævet)
- Pris i DKK (påkrævet)
- Kategori (påkrævet)
- Dimensioner: bredde, højde, dybde (valgfri)
- Billede URL (påkrævet)

**Proces:**
1. Opretter artwork i `artworks` tabellen
2. Linker til gallery via `gallery_artworks`
3. Kalder `/api/gallery/generate-insights` for AI analyse
4. Sætter `onboarding_step` til 3

**AI Features:**
- Automatisk prisforslagsanalyse
- Metadata kvalitetsvurdering
- Markedspositionering

### Step 3: Connect Stripe
**Formål:** Opsæt betalingsmodtagelse via Stripe Connect

**Proces:**
1. Kalder `/api/stripe/connect` endpoint
2. Opretter Stripe Connect account link
3. Redirecter til Stripe onboarding
4. Return URL: `/onboarding/gallery?step=4`
5. Refresh URL: `/onboarding/gallery?step=3`

**Stripe Setup:**
- Express account type
- Automatisk payouts
- 20% platform commission
- Direkte bank transfers

### Step 4: Complete
**Formål:** Afslut onboarding og vis næste skridt

**Funktioner:**
- Markerer `onboarding_completed` som true
- Viser AI insights fra første artwork
- Guider til næste handlinger:
  1. Publicer første kunstværk
  2. Upload flere kunstværker
  3. Inviter team medlemmer

**Redirect:** `/gallery/dashboard`

---

## 3. Gallery Dashboard

### URL: `/gallery/dashboard`

### Dashboard Komponenter

#### Stats Overview
4 nøgletal kort:
- Total Revenue (samlet omsætning)
- Active Artworks (aktive kunstværker)
- Pending Orders (afventende ordrer)
- Total Artists (antal kunstnere)

#### AI Insights Snapshot
Hurtig oversigt over:
- Price suggestions (prisforslag)
- Metadata issues (metadata problemer)
- 90-day diagnostics (90-dages diagnostik)
- Behavior insights (adfærdsindsigter)

#### Recent Activity
Seneste aktiviteter:
- Nye ordrer
- Artwork uploads
- Price changes
- Team actions

#### Artists List
Oversigt over tilknyttede kunstnere med:
- Navn og profilbillede
- Antal kunstværker
- Total salg
- Quick actions

#### Quick Actions
Hurtige genveje til:
- Upload nyt kunstværk
- Inviter kunstner
- Se AI insights
- Administrer team

### Dashboard Navigation

**Hovedmenu:**
- 📊 Overview (dashboard)
- 🎨 Artworks (kunstværk administration)
- 📦 Orders (ordre håndtering)
- 💰 Payouts (udbetalinger)
- 🏢 Leasing (leasing kontrakter)
- 👥 Team (team administration)
- 🤖 AI Insights (AI anbefalinger)
- 📈 Analytics (analyser)
- ⚙️ Settings (indstillinger)

---

## 4. Buyer Dashboard

### URL: `/buyer/dashboard`

### Dashboard Komponenter

#### Summary Cards
- Total Purchases (samlede køb)
- Active Leases (aktive leasing)
- Pending Payments (afventende betalinger)
- Insurance Coverage (forsikringsdækning)

#### Recent Activities
- Nye køb
- Leasing opdateringer
- Betalinger
- Forsikringsændringer

#### Orders Mini Table
Seneste ordrer med status

#### Leasing Mini Table
Aktive leasing kontrakter

#### Insurance Status
Oversigt over forsikringsdækning

### Buyer Navigation

**Hovedmenu:**
- 📊 Overview (dashboard)
- 📦 Orders (mine ordrer)
- 🏢 Leasing (mine leasing)
- 🧾 Invoices (fakturaer)
- 💳 Payments (betalinger)
- 🛡️ Insurance (forsikring)
- ⚙️ Settings (indstillinger)

---

## 5. Post-Payment Features

### Escrow System
- Midler holdes indtil begge parter godkender
- Buyer approval: `/api/escrow/[offerId]/buyer-approve`
- Seller approval: `/api/escrow/[offerId]/seller-approve`
- Release: `/api/escrow/[offerId]/release`

### Automatic Payouts
- Stripe håndterer automatiske udbetalinger
- Standard payout schedule: dagligt
- Minimum payout: 100 DKK
- Direkte til bank konto

### AI-Powered Insights
- Prisoptimering baseret på markedsdata
- Metadata kvalitetsvurdering
- Adfærdsanalyse (90-dages trends)
- Automatiske anbefalinger

### Team Management
- Inviter team medlemmer
- Roller: Owner, Manager, Curator, Staff
- Granulære permissions
- Activity tracking

### Analytics
- Salgsstatistikker
- Kunstner performance
- Kategori trends
- Geografisk fordeling

---

## 6. Sikkerhed og RLS

### Row Level Security (RLS)
Alle tabeller har RLS policies der sikrer:
- Galleries kan kun se deres egne data
- Buyers kan kun se deres egne ordrer
- Artists kan kun se deres egne kunstværker
- Team medlemmer har begrænset adgang baseret på rolle

### Stripe Security
- Webhook signature verification
- Secure API keys (environment variables)
- PCI compliance via Stripe
- Encrypted payment data

### Data Privacy
- GDPR compliant
- User data encryption
- Audit logs for alle handlinger
- Secure file uploads

---

## 7. Fejlhåndtering

### Webhook Failures
- Automatisk retry via Stripe
- Event logging i database
- Admin alerts ved kritiske fejl
- Manual retry mulighed

### Payment Failures
- Automatisk notifikation til bruger
- Retry payment flow
- Support ticket creation
- Refund handling

### Onboarding Issues
- Step-by-step validation
- Clear error messages
- Progress saving (kan fortsætte senere)
- Support kontakt information

---

## 8. Testing Guide

### Test Onboarding Flow
1. Opret test bruger med rolle `gallery_owner`
2. Naviger til `/onboarding/gallery`
3. Udfyld Step 1 (Gallery Profile)
4. Upload test artwork i Step 2
5. Brug Stripe test mode i Step 3
6. Verificer dashboard adgang i Step 4

### Test Payment Flow
1. Brug Stripe test cards
2. Verificer webhook modtagelse
3. Tjek escrow status
4. Test approval flow
5. Verificer payout creation

### Test Dashboard
1. Verificer alle stats vises korrekt
2. Test AI insights generation
3. Verificer navigation fungerer
4. Test responsive design
5. Verificer RLS permissions

---

## 9. Næste Skridt Efter Onboarding

### For Galleries
1. **Publicer første kunstværk**
   - Gennemgå AI insights
   - Juster pris hvis nødvendigt
   - Aktivér listing

2. **Upload flere kunstværker**
   - Brug bulk upload hvis muligt
   - Sørg for høj kvalitet billeder
   - Udfyld alle metadata felter

3. **Inviter team**
   - Tilføj managers og curators
   - Sæt korrekte permissions
   - Træn i platform brug

4. **Optimer priser**
   - Følg AI anbefalinger
   - Monitor markedsdata
   - Juster baseret på performance

### For Buyers
1. **Gennemgå køb**
   - Verificer ordre detaljer
   - Godkend escrow release
   - Anmeld modtagelse

2. **Opsæt forsikring**
   - Vælg dækningsplan
   - Upload dokumentation
   - Aktivér automatisk fornyelse

3. **Udforsk leasing**
   - Se tilgængelige kunstværker
   - Beregn leasing omkostninger
   - Start leasing kontrakt

---

## Support

For hjælp med post-payment flow:
- Email: support@artissafe.dk
- Dokumentation: `/docs`
- Status page: status.artissafe.dk
