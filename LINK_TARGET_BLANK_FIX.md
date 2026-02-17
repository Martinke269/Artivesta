# Link Target Blank Fix

## Problem
Links i applikationen åbnede i samme vindue/fane, hvilket førte brugere væk fra chat-interfacet når de klikkede på links.

## Løsning
Tilføjet `target="_blank"` og `rel="noopener noreferrer"` til alle relevante eksterne og informative links, så de åbner i nye faner.

## Ændrede Filer

### 1. components/cookie-consent.tsx
- Cookie-politik link åbner nu i ny fane

### 2. components/layout/site-footer.tsx
- Alle footer-links åbner nu i nye faner:
  - For virksomheder: Oversigt, Kuratering, Custom kunst
  - For kunstnere: Bliv kunstner, Escrow-betaling
  - Juridisk: Handelsbetingelser, Cookie-politik, Privatlivspolitik

### 3. components/home/cta-section.tsx
- Handelsbetingelser link åbner nu i ny fane

## Teknisk Implementation
```tsx
// Før
<Link href="/cookies" className="...">
  cookie-politik
</Link>

// Efter
<Link href="/cookies" className="..." target="_blank" rel="noopener noreferrer">
  cookie-politik
</Link>
```

## Sikkerhed
`rel="noopener noreferrer"` er tilføjet for at:
- **noopener**: Forhindre den nye side i at få adgang til `window.opener`
- **noreferrer**: Forhindre at referrer-information sendes til den nye side

## Bemærk
Interne navigationslinks (som `/signup`, `/login`, osv.) forbliver som standard Next.js Links uden `target="_blank"`, da disse er en del af applikationens normale flow og ikke skal åbne i nye faner.

## Test
1. Klik på links i footer - de skal åbne i nye faner
2. Klik på cookie-politik link - skal åbne i ny fane
3. Klik på handelsbetingelser i CTA-sektionen - skal åbne i ny fane
4. Chat-interfacet skal forblive åbent når links klikkes

## Dato
17. februar 2026
