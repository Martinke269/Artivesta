# Gallery Dashboard Testing Guide

## Sådan tester du Gallery Dashboard som admin

Da der ikke er nogen eksisterende brugere eller gallerier i databasen endnu, skal du oprette test-data. Her er tre måder at gøre det på:

## Metode 1: Via UI (Anbefalet for test)

### Trin 1: Opret en test-bruger
1. Gå til `/auth/sign-up` i preview browseren
2. Opret en ny bruger med email og password
3. Bekræft email (hvis påkrævet)

### Trin 2: Opret et galleri
1. Efter login, gå til `/join/gallery`
2. Udfyld galleri-formularen:
   - Galleri navn
   - Beskrivelse
   - Kontaktinformation
3. Submit formularen

### Trin 3: Se dashboardet
1. Naviger til `/gallery/dashboard`
2. Du vil nu se det nye dashboard med:
   - Quick Stats (4 kort)
   - AI Insights Snapshot
   - Recent Activity
   - Quick Actions

## Metode 2: Via Supabase SQL Editor (Hurtigst)

Kør følgende SQL i Supabase SQL Editor for at oprette test-data:

```sql
-- 1. Find din bruger ID (eller opret en test bruger først via UI)
-- Antag din bruger ID er: 'your-user-id-here'

-- 2. Opret et test-galleri
INSERT INTO galleries (
  owner_id,
  name,
  description,
  email,
  phone,
  website,
  address,
  city,
  postal_code,
  country,
  commission_rate,
  status
) VALUES (
  'your-user-id-here',  -- Erstat med din faktiske user ID
  'Test Galleri',
  'Et test galleri til at demonstrere dashboard funktionalitet',
  'test@gallery.com',
  '+45 12 34 56 78',
  'https://testgallery.dk',
  'Testgade 123',
  'København',
  '1000',
  'Denmark',
  30.00,
  'active'
);

-- 3. Tilføj nogle test-invitationer (valgfrit)
INSERT INTO gallery_invitations (
  gallery_id,
  email,
  status
) VALUES (
  (SELECT id FROM galleries WHERE owner_id = 'your-user-id-here' LIMIT 1),
  'artist1@example.com',
  'pending'
),
(
  (SELECT id FROM galleries WHERE owner_id = 'your-user-id-here' LIMIT 1),
  'artist2@example.com',
  'pending'
);
```

## Metode 3: Via Supabase Dashboard UI

1. Gå til Supabase Dashboard → Table Editor
2. Vælg `galleries` tabellen
3. Klik "Insert row"
4. Udfyld felterne:
   - `owner_id`: Din bruger UUID (fra auth.users eller profiles)
   - `name`: "Test Galleri"
   - `description`: "Test beskrivelse"
   - `email`: "test@gallery.com"
   - `status`: "active"
   - `commission_rate`: 30
5. Gem rækken

## Dashboard Features du kan teste

### 1. Quick Stats
- **Kunstnere**: Viser antal aktive kunstnere
- **Kunstværker**: Viser antal værker og aktive listings
- **Salg**: Viser antal gennemførte salg
- **Omsætning**: Viser total omsætning

### 2. AI Insights Snapshot
Baseret på dit galleris data vil du se intelligente indsigter som:
- "Udvid dit kunstner-roster" (hvis du har < 3 kunstnere)
- "Afventende invitationer" (hvis du har pending invitations)
- "Ingen kunstværker endnu" (hvis ingen kunstnere har uploadet)
- Og flere...

### 3. Recent Activity
- Viser seneste aktiviteter
- Kunstner joins
- Invitationer sendt
- Med danske timestamps

### 4. Quick Actions
- Inviter kunstner
- Se alle kunstnere
- Se kunstværker
- Rapporter
- Kontrakter
- Indstillinger

## Fejlfinding

### Problem: "No gallery found"
**Løsning**: Du skal oprette et galleri først via `/join/gallery` eller SQL

### Problem: "Not authenticated"
**Løsning**: Log ind først via `/auth/login`

### Problem: Dashboard viser tomme stats
**Løsning**: Dette er normalt for et nyt galleri. AI Insights vil give dig anbefalinger om hvad du skal gøre næste.

## Test Scenarios

### Scenario 1: Nyt galleri (Empty State)
- Opret galleri
- Se dashboard
- Forvent: AI insight om at invitere kunstnere

### Scenario 2: Galleri med invitationer
- Opret galleri
- Send invitationer via `/gallery/invite` (når implementeret)
- Se dashboard
- Forvent: AI insight om afventende invitationer

### Scenario 3: Aktivt galleri
- Opret galleri
- Tilføj kunstnere (via SQL eller UI)
- Kunstnere uploader værker
- Se dashboard
- Forvent: Fuld statistik og positive AI insights

## Næste skridt efter test

1. Samle feedback på dashboard layout
2. Teste AI insights logik
3. Implementere manglende sider (artists, artworks, reports, etc.)
4. Tilføje flere AI insights baseret på reelle data patterns

## Hurtig Test Kommando

For at se dashboardet med mock data, kan du også midlertidigt ændre dashboard page til at vise mock data i stedet for at hente fra databasen - men det anbefales at teste med rigtige data for at sikre RLS policies virker korrekt.
