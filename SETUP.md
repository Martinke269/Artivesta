# Opsætningsguide - Kunstnerplatform

Denne guide hjælper dig med at sætte kunstnerplatformen op fra bunden.

## Trin 1: Supabase Projekt

1. Gå til [https://supabase.com](https://supabase.com) og opret en gratis konto
2. Klik på "New Project"
3. Vælg et navn til dit projekt (f.eks. "kunstnerplatform")
4. Vælg en database password (gem den sikkert!)
5. Vælg en region tæt på dig (f.eks. "West EU (London)")
6. Klik "Create new project" og vent på at projektet bliver oprettet

## Trin 2: Database Schema

1. I dit Supabase projekt, gå til "SQL Editor" i venstre menu
2. Klik "New query"
3. Åbn filen `supabase/schema.sql` i dette projekt
4. Kopier HELE indholdet af filen
5. Indsæt det i Supabase SQL Editor
6. Klik "Run" (eller tryk Ctrl/Cmd + Enter)
7. Vent til alle kommandoer er kørt (du skulle se "Success. No rows returned")

## Trin 3: Environment Variables

1. I Supabase, gå til "Project Settings" (tandhjul-ikonet nederst i venstre menu)
2. Klik på "API" i venstre menu
3. Find følgende værdier:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

4. Opret en `.env.local` fil i projektets rod (hvis den ikke allerede findes)
5. Tilføj følgende linjer (erstat med dine værdier):

```
NEXT_PUBLIC_SUPABASE_URL=https://dit-projekt-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=din-anon-key-her
```

## Trin 4: Installer Dependencies

Kør følgende kommando i terminalen:

```bash
npm install
```

## Trin 5: Start Development Server

```bash
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000) i din browser.

## Trin 6: Opret Admin Bruger

1. Gå til signup siden og opret en bruger
2. Gå til Supabase Dashboard → "Table Editor" → "profiles" tabellen
3. Find din bruger og ændr `role` kolonnen fra "artist" eller "business" til "admin"
4. Log ud og ind igen
5. Du har nu adgang til Admin Panel

## Test Platformen

### Som Kunstner:
1. Opret en konto med rolle "Kunstner"
2. Gå til "Upload Kunst"
3. Upload et kunstværk (brug Assets UI til at uploade billeder)
4. Se dit kunstværk på forsiden

### Som Virksomhed:
1. Opret en anden konto med rolle "Virksomhed"
2. Browse kunstværker på forsiden
3. Klik på et kunstværk og køb det
4. Se din ordre under "Mine Ordrer"

### Som Admin:
1. Log ind med din admin konto
2. Gå til "Admin Panel"
3. Se ordrer under "Ordrer" tab
4. Godkend udbetalinger under "Udbetalinger" tab
5. Gennemfør betalinger (dette genererer fakturaer automatisk)

## Fejlfinding

### "Failed to fetch" eller connection errors
- Tjek at dine Supabase credentials i `.env.local` er korrekte
- Genstart development serveren efter at have ændret `.env.local`

### "Permission denied" eller RLS errors
- Tjek at du har kørt hele SQL schema korrekt
- Tjek at RLS policies er aktiveret i Supabase

### Kan ikke se data
- Tjek at du er logget ind
- Tjek at din bruger har den rigtige rolle i `profiles` tabellen

## Næste Skridt

- Tilføj rigtig betalingsintegration (f.eks. Stripe)
- Implementer email notifikationer
- Generer PDF fakturaer
- Tilføj billedupload direkte til Supabase Storage
- Implementer søgning og filtrering af kunstværker

## Support

Hvis du støder på problemer, tjek:
1. Supabase logs i Dashboard → "Logs"
2. Browser console for JavaScript errors
3. Next.js terminal output for server errors
