# ART IS SAFE - Art Marketplace MVP

En moderne platform hvor kunstnere kan uploade og sælge deres kunst til virksomheder med sikker escrow-betaling.

## Funktioner

### For Kunstnere
- Upload kunstværker med billede, titel, beskrivelse og pris
- Administrer egne kunstværker
- Se salgshistorik
- Modtag betalinger via escrow-system med 20% kommission

### For Virksomheder (Købere)
- Browse tilgængelige kunstværker
- Køb kunst direkte fra kunstnere
- Se ordrehistorik
- Sikker betaling gennem escrow

### For Admin (Mellemmand)
- Se alle ordrer og deres status
- Godkend udbetalinger til kunstnere
- Gennemfør betalinger med automatisk fakturagenerering
- 20% kommission på alle salg

## Teknologi Stack

- **Framework**: Next.js 14 med App Router
- **Styling**: Tailwind CSS + shadcn/ui komponenter
- **Database**: Supabase (PostgreSQL)
- **Autentifikation**: Supabase Auth
- **Type Safety**: TypeScript

## Database Schema

### Tabeller

1. **profiles** - Brugerprofiler (kunstnere, virksomheder, admin)
2. **artworks** - Kunstværker med billeder og priser
3. **orders** - Ordrer med escrow-status
4. **payouts** - Udbetalinger til kunstnere
5. **invoices** - Fakturaer til købere og sælgere

### Sikkerhed

- Row Level Security (RLS) aktiveret på alle tabeller
- Brugere kan kun se og redigere deres egne data
- Admin har fuld adgang til alle data
- Kunstnere kan kun uploade egne kunstværker
- Virksomheder kan kun se tilgængelige kunstværker

## Opsætning

### Forudsætninger

- Node.js 18+ installeret
- Supabase projekt oprettet
- Supabase credentials i `.env.local`

### Installation

1. Installer dependencies:
```bash
npm install
```

2. Konfigurer Supabase:
   - Opret et Supabase projekt på https://supabase.com
   - Kør SQL schema fra `supabase/schema.sql` i Supabase SQL Editor
   - Tilføj credentials til `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=din-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
```

3. Start development server:
```bash
npm run dev
```

4. Åbn http://localhost:3000

## Brugerroller

### Artist (Kunstner)
- Kan uploade kunstværker
- Kan se egne kunstværker og salg
- Modtager 80% af salgsprisen (efter 20% kommission)

### Business (Virksomhed)
- Kan browse og købe kunstværker
- Kan se ordrehistorik
- Betaler fuld pris som deponeres i escrow

### Admin (Mellemmand)
- Kan se alle ordrer
- Godkender udbetalinger til kunstnere
- Modtager 20% kommission
- Genererer fakturaer automatisk

## Betalingsflow

1. **Køb**: Virksomhed køber kunst → penge deponeres i escrow (status: "held")
2. **Ordre oprettet**: Ordre oprettes med status "pending"
3. **Payout anmodning**: System opretter payout-anmodning til kunstner
4. **Admin godkendelse**: Admin godkender udbetalingen
5. **Gennemførelse**: 
   - Admin gennemfører betaling
   - 20% kommission fratrækkes
   - 80% udbetales til kunstner
   - Escrow frigives (status: "released")
   - Fakturaer genereres og sendes til både køber og sælger

## API Routes

Alle data håndteres via Supabase client-side queries med RLS sikkerhed.

## Deployment

Platformen kan deployes til:
- Vercel (anbefalet for Next.js)
- Netlify
- Enhver Node.js hosting platform

Husk at konfigurere environment variables i din hosting platform.

## Sikkerhed

- Alle database queries er beskyttet af Row Level Security
- Passwords håndteres sikkert af Supabase Auth
- Escrow-system sikrer at penge kun frigives ved admin godkendelse
- Fakturaer genereres automatisk ved gennemført betaling

## Support

For spørgsmål eller problemer, kontakt admin.
