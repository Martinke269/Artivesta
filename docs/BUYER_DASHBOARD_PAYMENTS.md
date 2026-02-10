# Buyer Dashboard - Payments Page

## Overview
Betalingssiden giver købere et komplet overblik over alle deres betalinger på tværs af ordrer, leasing og fakturaer.

## Route
`/buyer/dashboard/payments`

## Features

### 1. Summary Cards
Tre oversigtskort der viser:
- **Antal betalinger**: Totalt antal betalinger
- **Gennemførte betalinger**: Antal succesfulde betalinger
- **Fejlede betalinger**: Antal fejlede/afviste betalinger (fremhævet i rød)

### 2. Payments Table
Tabel med følgende kolonner:
- Betaling ID
- Type (Ordre / Leasing / Faktura)
- Dato
- Beløb
- Status (Gennemført / Afvist / Fejlet / Afventer)
- Betalingsmetode (Kort / Faktura / Bankoverførsel)
- Handlinger (Se detaljer, Download kvittering)

**Sortering:**
- Nyeste
- Højeste beløb
- Status

### 3. Payment Details Drawer
Når man klikker "Se detaljer" vises:

#### A. Betalingsoplysninger
- Betaling ID
- Dato
- Status
- Beløb
- Moms
- Betalingsmetode
- Kvittering (download)

#### B. Tilknyttet faktura
- Faktura ID
- Type (Ordre / Leasing)
- Forfaldsdato
- Beløb
- Link til faktura

#### C. Stripe Events
- Event type
- Timestamp
- Besked / metadata

#### D. Fejlbeskeder (hvis relevant)
- Afvisningsårsag
- Fejlkode
- Forslag til løsning (placeholder)

### 4. Filters
Collapsible filterpanel med:
- Søg efter betaling ID
- Status
- Type
- Betalingsmetode
- Dato-interval
- Pris-interval
- Galleri

## Components

### Main Components
- `app/buyer/dashboard/payments/page.tsx` - Server component
- `app/buyer/dashboard/payments/payments-page-client.tsx` - Client component

### UI Components
- `components/buyer/dashboard/payments-summary-cards.tsx` - Summary cards
- `components/buyer/dashboard/payments-filters.tsx` - Filter panel
- `components/buyer/dashboard/payments-table.tsx` - Payments table
- `components/buyer/dashboard/payment-details-drawer.tsx` - Details drawer

### Data Layer
- `lib/supabase/buyer-payments-queries.ts` - Main query exports
- `lib/supabase/buyer-payments-types.ts` - TypeScript types
- `lib/supabase/buyer-payments-stats.ts` - Statistics queries
- `lib/supabase/buyer-payments-list.ts` - List queries
- `lib/supabase/buyer-payments-details.ts` - Detail queries

## Database Schema

Betalingsdata hentes fra:
- `payments` tabel
- `orders` tabel (for ordre-betalinger)
- `leasing_agreements` tabel (for leasing-betalinger)
- `invoices` tabel (for faktura-betalinger)
- `artworks` tabel (for kunstværksinfo)
- `galleries` tabel (for galleriinfo)

## Security

### RLS Policies
Alle queries respekterer Row Level Security:
- Købere kan kun se deres egne betalinger
- Ingen galleri-interne data eksponeres
- Stripe-events filtreres for følsomme data

### Data Access
- Betalingsdata er kun tilgængelig for den autentificerede køber
- Gallerioplysninger er begrænset til offentlige felter
- Kunstneroplysninger er begrænset til offentlige felter

## UI/UX

### Responsive Design
- Mobile-first approach
- Tabel kollapser til cards på mobile
- Drawer fungerer på alle skærmstørrelser

### Loading States
- Skeleton loaders for alle sektioner
- Smooth transitions
- Error boundaries

### Empty States
- Informative beskeder når ingen betalinger findes
- Call-to-action for at komme i gang

### Status Badges
- **Gennemført**: Grøn badge
- **Afventer**: Gul badge
- **Fejlet**: Rød badge
- **Afvist**: Orange badge

## Edge Cases

### 1. Ingen betalinger
- Viser empty state med beskrivelse
- Foreslår at browse kunstværker

### 2. Fejlede betalinger
- Fremhæves tydeligt i UI
- Viser fejlbesked og forslag til løsning
- Link til support hvis nødvendigt

### 3. Manglende data
- Graceful fallbacks for manglende felter
- Placeholder tekst hvor relevant
- Ingen crashes ved incomplete data

### 4. Stripe events
- Filtrerer irrelevante events
- Formaterer timestamps korrekt
- Håndterer manglende metadata

## Testing

### Manual Testing Checklist
- [ ] Summary cards viser korrekte tal
- [ ] Tabel viser alle betalinger
- [ ] Sortering fungerer korrekt
- [ ] Filtre fungerer individuelt og kombineret
- [ ] Drawer viser alle detaljer korrekt
- [ ] Download kvittering fungerer
- [ ] Status badges viser korrekte farver
- [ ] Responsive design fungerer på alle devices
- [ ] Loading states vises korrekt
- [ ] Empty states vises når relevant
- [ ] Fejlhåndtering fungerer

### Security Testing
- [ ] RLS policies håndhæves
- [ ] Kun egne betalinger vises
- [ ] Ingen uautoriseret data eksponeres
- [ ] Stripe data er sikker

## Future Enhancements

### Potential Features
1. **Export funktionalitet**
   - CSV export af betalinger
   - PDF rapport generering

2. **Betalingshistorik graf**
   - Visualisering af betalinger over tid
   - Sammenligning mellem perioder

3. **Automatiske påmindelser**
   - Email notifikationer for fejlede betalinger
   - Påmindelser om kommende betalinger

4. **Bulk actions**
   - Download multiple kvitteringer
   - Batch status opdateringer

5. **Advanced filtering**
   - Gem filter presets
   - Quick filters for common scenarios

## Notes

- Alle UI tekster er på dansk
- Beløb vises i DKK med korrekt formatering
- Datoer formateres efter dansk standard
- Komponenter følger shadcn/ui design system
- TypeScript strict mode enabled
- Alle queries er optimeret for performance
