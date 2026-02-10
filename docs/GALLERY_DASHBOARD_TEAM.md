# Gallery Dashboard - Team Page

## Overview

Team Page er en komplet løsning til at administrere galleriets teammedlemmer, deres roller og tilknyttede kunstnere. Siden giver ejere og managers mulighed for at invitere nye medlemmer, ændre roller og administrere adgang til galleriet.

## Route

```
/gallery/dashboard/team
```

## Funktionalitet

### 1. Team Oversigt (Summary Cards)

Fire informationskort der viser:
- **Teammedlemmer**: Totalt antal medlemmer og antal aktive
- **Tilknyttede Kunstnere**: Antal kunstnere med værker i galleriet
- **Afventende Invitationer**: Antal invitationer der venter på accept
- **Team Status**: Overordnet status for teamet

### 2. Teammedlemmer Tabel

Viser alle teammedlemmer med:
- Profilbillede og navn
- Rolle (Ejer, Manager, Kurator, Assistent)
- Email
- Status (Aktiv / Inviteret)
- Inviteret dato
- Handlinger (Rediger rolle, Fjern medlem, Annuller invitation)

**Funktioner:**
- Sortering efter oprettelsesdato
- Hover-effekt for handlingsknapper
- Rollebaseret adgangskontrol til handlinger
- Bekræftelsesdialog før fjernelse

### 3. Kunstnere Tabel

Viser alle kunstnere tilknyttet galleriet:
- Profilbillede og navn
- Email
- Antal værker i galleriet
- Status (Aktiv)
- Handlinger (Fjern fra galleri)

**Funktioner:**
- Automatisk gruppering af kunstnere fra værker
- Tæller antal værker per kunstner
- Bekræftelsesdialog før fjernelse

### 4. Invitationer

**Team Invitation Form:**
- Email input (skal være eksisterende bruger)
- Rolle dropdown (Manager, Kurator, Assistent)
- Rollebeskrivelser
- Informationsboks om invitationsprocessen

**Rolle Edit Dialog:**
- Modal til at ændre eksisterende medlemmers roller
- Dropdown med tilgængelige roller baseret på brugerens egen rolle
- Rollebeskrivelser
- Gem/Annuller handlinger

## Roller og Tilladelser

### Ejer (Owner)
- Fuld adgang til alle funktioner
- Kan invitere alle rolletyper inkl. managers
- Kan ændre alle roller undtagen andre ejere
- Kan fjerne alle medlemmer undtagen sig selv
- Kan fjerne kunstnere fra galleriet

### Manager
- Kan invitere kuratorer og assistenter
- Kan ændre roller for kuratorer og assistenter
- Kan fjerne kuratorer og assistenter
- Kan fjerne kunstnere fra galleriet
- Kan ikke ændre managers eller ejere

### Kurator
- Kan se alle teammedlemmer og kunstnere
- Kan ikke invitere eller ændre roller
- Kan ikke fjerne medlemmer eller kunstnere
- Read-only adgang til team-siden

### Assistent (Staff)
- Kan se alle teammedlemmer og kunstnere
- Kan ikke invitere eller ændre roller
- Kan ikke fjerne medlemmer eller kunstnere
- Read-only adgang til team-siden

## UI Komponenter

### Komponenter Brugt

1. **TeamSummaryCards** (`components/gallery/dashboard/team-summary-cards.tsx`)
   - Viser fire summary cards
   - Ikoner fra lucide-react
   - Responsive grid layout

2. **TeamMembersTable** (`components/gallery/dashboard/team-members-table.tsx`)
   - Tabel med alle teammedlemmer
   - Dropdown menu for handlinger
   - Rollebaseret visning af handlinger
   - Alert dialog for bekræftelse

3. **ArtistsTable** (`components/gallery/dashboard/artists-table.tsx`)
   - Tabel med alle kunstnere
   - Viser antal værker
   - Dropdown menu for handlinger
   - Alert dialog for bekræftelse

4. **TeamInviteForm** (`components/gallery/dashboard/team-invite-form.tsx`)
   - Dialog-baseret invitation form
   - Email og rolle input
   - Rollebeskrivelser
   - Informationsboks

5. **EditRoleDialog** (`components/gallery/dashboard/edit-role-dialog.tsx`)
   - Modal til rolleændring
   - Rolle dropdown
   - Rollebeskrivelser
   - Gem/Annuller handlinger

### shadcn/ui Komponenter

- Card, CardContent, CardHeader, CardTitle, CardDescription
- Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- Badge
- Button
- Avatar, AvatarFallback, AvatarImage
- DropdownMenu
- AlertDialog
- Dialog
- Input
- Label
- Select
- Skeleton
- Alert, AlertDescription
- Separator

## Database Queries

### Queries Brugt (`lib/supabase/gallery-team-queries.ts`)

1. **getTeamSummary**
   - Henter statistik for teamet
   - Tæller medlemmer, kunstnere og invitationer

2. **getGalleryTeamMembers**
   - Henter alle teammedlemmer med brugerdata
   - Inkluderer inviteret-af information
   - Sorteret efter oprettelsesdato

3. **getGalleryArtistsWithDetails**
   - Henter unikke kunstnere fra gallery_artworks
   - Grupperer og tæller værker per kunstner
   - Returnerer kunstnerdata fra profiles

4. **getUserGalleryRole**
   - Henter brugerens rolle i galleriet
   - Bruges til adgangskontrol

5. **inviteTeamMember**
   - Opretter invitation til eksisterende bruger
   - Validerer at bruger ikke allerede er medlem
   - Sætter status til 'pending'

6. **updateTeamMemberRole**
   - Opdaterer rolle for eksisterende medlem
   - Kun tilgængelig for ejere og managers

7. **removeTeamMember**
   - Fjerner medlem fra galleriet
   - Sletter fra gallery_users

8. **cancelInvitation**
   - Annullerer pending invitation
   - Sletter fra gallery_users hvor status='pending'

9. **removeArtistFromGallery**
   - Fjerner alle kunstnerens værker fra galleriet
   - Sletter fra gallery_artworks

## UI Flow

### Invitation Flow

1. Bruger klikker "Send Invitation"
2. Dialog åbnes med form
3. Bruger indtaster email og vælger rolle
4. System validerer:
   - Email findes i systemet
   - Bruger er ikke allerede medlem
5. Invitation oprettes med status 'pending'
6. Toast bekræftelse vises
7. Tabel opdateres med ny invitation

### Rolle Ændring Flow

1. Bruger klikker "Rediger rolle" i dropdown
2. Dialog åbnes med nuværende rolle
3. Bruger vælger ny rolle
4. Klikker "Gem Ændringer"
5. Rolle opdateres i database
6. Toast bekræftelse vises
7. Tabel opdateres

### Fjern Medlem Flow

1. Bruger klikker "Fjern medlem" i dropdown
2. Alert dialog vises med bekræftelse
3. Bruger bekræfter
4. Medlem fjernes fra database
5. Toast bekræftelse vises
6. Tabel opdateres

### Fjern Kunstner Flow

1. Bruger klikker "Fjern fra galleri" i dropdown
2. Alert dialog vises med bekræftelse
3. Bruger bekræfter
4. Alle kunstnerens værker fjernes fra galleriet
5. Toast bekræftelse vises
6. Tabel opdateres

## Edge Cases

### 1. Ingen Teammedlemmer
- Viser empty state med ikon og tekst
- Opfordrer til at invitere medlemmer

### 2. Ingen Kunstnere
- Viser empty state med ikon og tekst
- Forklarer at kunstnere tilknyttes via værker

### 3. Bruger Findes Ikke
- Fejlbesked: "User not found. They need to sign up first."
- Toast med fejl vises

### 4. Bruger Allerede Medlem
- Fejlbesked: "User is already a team member"
- Toast med fejl vises

### 5. Manglende Tilladelser
- Handlingsknapper vises ikke
- Invitation form viser besked om manglende tilladelser

### 6. Netværksfejl
- Error state vises med fejlbesked
- Alert med fejlinformation

### 7. Loading State
- Skeleton loaders for alle sektioner
- Vises under initial load

### 8. Ejer Kan Ikke Fjerne Sig Selv
- Handlinger vises ikke for ejerens egen række
- Forhindrer utilsigtet tab af adgang

## Sikkerhed

### RLS Policies

Alle queries respekterer eksisterende RLS policies:

1. **gallery_users table**
   - Kun medlemmer kan se galleriets teammedlemmer
   - Kun ejere og managers kan oprette invitationer
   - Kun ejere og managers kan opdatere roller
   - Kun ejere og managers kan slette medlemmer

2. **gallery_artworks table**
   - Kun medlemmer kan se galleriets værker
   - Kun ejere og managers kan fjerne værker

3. **profiles table**
   - Offentlig læseadgang til profiler
   - Bruges til at vise brugerdata

### Frontend Validering

1. **Rolle Ændringer**
   - Ejere kan ændre alle roller undtagen andre ejere
   - Managers kan kun ændre kuratorer og assistenter
   - Kuratorer og assistenter kan ikke ændre roller

2. **Fjernelse af Medlemmer**
   - Ejere kan fjerne alle undtagen sig selv
   - Managers kan kun fjerne kuratorer og assistenter
   - Kuratorer og assistenter kan ikke fjerne nogen

3. **Invitation**
   - Kun ejere kan invitere managers
   - Managers kan invitere kuratorer og assistenter
   - Kuratorer og assistenter kan ikke invitere

### Backend Validering

Alle mutations valideres også i databasen via RLS policies, så frontend-validering er kun første lag af sikkerhed.

## Testplan

### Funktionel Testing

#### 1. Team Oversigt
- [ ] Summary cards viser korrekte tal
- [ ] Tal opdateres efter ændringer
- [ ] Responsive layout fungerer

#### 2. Teammedlemmer Tabel
- [ ] Alle medlemmer vises korrekt
- [ ] Roller vises med korrekte badges
- [ ] Status vises korrekt (Aktiv/Inviteret)
- [ ] Handlinger vises kun for autoriserede brugere
- [ ] Hover-effekt fungerer
- [ ] Empty state vises når ingen medlemmer

#### 3. Kunstnere Tabel
- [ ] Alle kunstnere vises korrekt
- [ ] Antal værker tælles korrekt
- [ ] Handlinger vises kun for autoriserede brugere
- [ ] Empty state vises når ingen kunstnere

#### 4. Invitationer
- [ ] Dialog åbner og lukker korrekt
- [ ] Email validering fungerer
- [ ] Rolle dropdown viser korrekte options
- [ ] Invitation sendes korrekt
- [ ] Toast bekræftelse vises
- [ ] Tabel opdateres efter invitation

#### 5. Rolle Ændring
- [ ] Dialog åbner med korrekt medlem
- [ ] Rolle dropdown viser korrekte options
- [ ] Rolle opdateres korrekt
- [ ] Toast bekræftelse vises
- [ ] Tabel opdateres efter ændring

#### 6. Fjernelse
- [ ] Alert dialog vises før fjernelse
- [ ] Medlem fjernes korrekt
- [ ] Kunstner fjernes korrekt (alle værker)
- [ ] Toast bekræftelse vises
- [ ] Tabel opdateres efter fjernelse

### Sikkerhedstesting

#### 1. Rollebaseret Adgang
- [ ] Ejer kan se alle handlinger
- [ ] Manager kan kun se relevante handlinger
- [ ] Kurator kan ikke se handlinger
- [ ] Assistent kan ikke se handlinger

#### 2. Invitation Regler
- [ ] Kun ejer kan invitere managers
- [ ] Manager kan invitere kuratorer og assistenter
- [ ] Kurator kan ikke invitere
- [ ] Assistent kan ikke invitere

#### 3. Rolle Ændring Regler
- [ ] Ejer kan ændre alle roller undtagen andre ejere
- [ ] Manager kan kun ændre kuratorer og assistenter
- [ ] Kurator kan ikke ændre roller
- [ ] Assistent kan ikke ændre roller

#### 4. Fjernelse Regler
- [ ] Ejer kan ikke fjerne sig selv
- [ ] Ejer kan fjerne alle andre
- [ ] Manager kan kun fjerne kuratorer og assistenter
- [ ] Kurator kan ikke fjerne nogen
- [ ] Assistent kan ikke fjerne nogen

### Edge Case Testing

- [ ] Ingen teammedlemmer viser empty state
- [ ] Ingen kunstnere viser empty state
- [ ] Bruger findes ikke viser fejl
- [ ] Bruger allerede medlem viser fejl
- [ ] Netværksfejl håndteres korrekt
- [ ] Loading state vises under load

### Responsiv Testing

- [ ] Desktop layout (1920px)
- [ ] Laptop layout (1366px)
- [ ] Tablet layout (768px)
- [ ] Mobile layout (375px)
- [ ] Summary cards stacker korrekt
- [ ] Tabeller scroller horisontalt på mobile

### Performance Testing

- [ ] Initial load under 2 sekunder
- [ ] Tabel render med 50+ medlemmer
- [ ] Smooth scroll i tabeller
- [ ] Ingen memory leaks ved gentagne handlinger

## Fejlhåndtering

### Brugervenlige Fejlbeskeder

1. **Invitation Fejl**
   - "Kunne ikke sende invitation" + specifik årsag
   - Toast med fejlbesked

2. **Rolle Opdatering Fejl**
   - "Kunne ikke opdatere rolle"
   - Toast med fejlbesked

3. **Fjernelse Fejl**
   - "Kunne ikke fjerne teammedlem/kunstner"
   - Toast med fejlbesked

4. **Load Fejl**
   - Alert med "Kunne ikke indlæse teamdata"
   - Mulighed for at prøve igen

### Logging

Alle fejl logges til console med:
- Fejltype
- Fejlbesked
- Stack trace (i development)

## Fremtidige Forbedringer

### Potentielle Features

1. **Bulk Handlinger**
   - Vælg flere medlemmer
   - Fjern flere på én gang
   - Ændre rolle for flere

2. **Søgning og Filtrering**
   - Søg efter navn/email
   - Filtrer efter rolle
   - Filtrer efter status

3. **Email Notifikationer**
   - Send email ved invitation
   - Send email ved rolleændring
   - Send email ved fjernelse

4. **Aktivitetslog**
   - Vis historik for rolleændringer
   - Vis hvem der har inviteret hvem
   - Vis hvem der har fjernet medlemmer

5. **Kunstner Invitation**
   - Direkte invitation af kunstnere
   - Kunstner-specifik onboarding
   - Kunstner status tracking

6. **Team Analytics**
   - Aktivitetsgraf
   - Medlemsfordeling
   - Kunstner performance

## Konklusion

Team Page er en komplet løsning til galleri team management med:
- ✅ Rollebaseret adgangskontrol
- ✅ Intuitivt UI med shadcn/ui
- ✅ Omfattende fejlhåndtering
- ✅ RLS sikkerhed
- ✅ Responsive design
- ✅ Loading og empty states
- ✅ Toast notifikationer
- ✅ Bekræftelsesdialogger

Siden er klar til produktion og følger alle best practices for sikkerhed og brugeroplevelse.
