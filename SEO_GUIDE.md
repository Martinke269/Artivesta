# SEO Optimeringsguide

Dette dokument beskriver SEO-optimeringerne implementeret på kunstmarkedspladsen og hvordan man vedligeholder dem.

## Implementerede SEO-funktioner

### 1. Metadata og Open Graph

**Placering:** `app/layout.tsx`

Implementeret:
- ✅ Dynamiske title tags med template
- ✅ Meta descriptions optimeret til søgemaskiner
- ✅ Keywords relevante for kunstmarkedet
- ✅ Open Graph tags til sociale medier
- ✅ Twitter Card metadata
- ✅ Canonical URLs
- ✅ Viewport og theme color
- ✅ Dansk sprog (lang="da")

**Eksempel:**
```typescript
export const metadata: Metadata = {
  title: {
    default: 'Kunstmarkedsplads - Køb og sælg original kunst online',
    template: '%s | Kunstmarkedsplads'
  },
  description: 'Danmarks førende online markedsplads...',
  // ... mere metadata
};
```

### 2. Robots.txt

**Placering:** `app/robots.ts`

Konfigureret til:
- ✅ Tillad alle søgemaskiner at crawle offentlige sider
- ✅ Bloker admin, API og auth endpoints
- ✅ Reference til sitemap
- ✅ Dynamisk genereret baseret på miljø

**URL:** `/robots.txt`

### 3. Sitemap

**Placering:** `app/sitemap.ts`

Funktioner:
- ✅ Dynamisk genereret fra database
- ✅ Inkluderer alle tilgængelige kunstværker
- ✅ Statiske sider med prioriteter
- ✅ Change frequency for hver side
- ✅ Last modified timestamps

**URL:** `/sitemap.xml`

Opdateres automatisk når:
- Nye kunstværker uploades
- Kunstværker opdateres
- Kunstværker slettes

### 4. Struktureret Data (JSON-LD)

**Placering:** `lib/structured-data.ts`

Implementerede schemas:
- ✅ **Product Schema** - For kunstværker
- ✅ **Organization Schema** - For markedspladsen
- ✅ **WebSite Schema** - Med søgefunktionalitet
- ✅ **BreadcrumbList Schema** - For navigation
- ✅ **ItemList Schema** - For kunstværkslister
- ✅ **Person Schema** - For kunstnerprofiler

**Brug:**
```tsx
import { StructuredData } from '@/components/structured-data';
import { generateArtworkSchema } from '@/lib/structured-data';

// I din page component
<StructuredData data={generateArtworkSchema(artwork, baseUrl)} />
```

### 5. Performance Optimering

Implementeret:
- ✅ Next.js Image optimization
- ✅ Font optimization (next/font)
- ✅ Static generation hvor muligt
- ✅ Dynamic imports for store komponenter
- ✅ Lazy loading af billeder

## Side-specifik SEO

### Forsiden (/)

**Metadata:**
- Title: "Kunstmarkedsplads - Køb og sælg original kunst online"
- Description: Fokus på hovedfunktionalitet
- Priority: 1.0 (højeste)

**Struktureret data:**
- Organization schema
- WebSite schema med søgefunktion

### Kunstværkssider (/artwork/[id])

**Metadata:**
- Dynamisk title med kunstværkets navn
- Description fra kunstværkets beskrivelse
- Open Graph billede fra kunstværket
- Priority: 0.9

**Struktureret data:**
- Product schema med pris og tilgængelighed
- Breadcrumb schema
- Artist information

**Implementering:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const artwork = await fetchArtwork(params.id);
  
  return {
    title: artwork.title,
    description: artwork.description,
    openGraph: {
      images: [artwork.image_url],
    },
  };
}
```

### Upload-siden (/upload)

**Metadata:**
- Title: "Upload kunstværk"
- Description: Fokus på kunstnerfunktionalitet
- Priority: 0.8
- Robots: noindex (privat side)

## Best Practices

### 1. Billeder

**Altid inkluder:**
- Alt text beskrivende for kunstværket
- Width og height attributter
- Optimerede formater (WebP med fallback)
- Lazy loading for billeder under folden

**Eksempel:**
```tsx
<Image
  src={artwork.image_url}
  alt={`${artwork.title} af ${artwork.artist.name}`}
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

### 2. Interne Links

**Best practices:**
- Brug beskrivende anchor text
- Inkluder title attribut
- Link til relaterede kunstværker
- Breadcrumb navigation på alle sider

### 3. URL Struktur

**Nuværende struktur:**
```
/ (forside)
/artwork/[id] (kunstværk)
/upload (upload)
/my-artworks (mine værker)
/orders (ordrer)
/admin/* (admin - noindex)
```

**Fremtidige forbedringer:**
```
/artist/[slug] (kunstnerprofil)
/category/[slug] (kategori)
/search?q=[query] (søgning)
```

### 4. Content Guidelines

**For kunstværksbeskrivelser:**
- Minimum 150 tegn
- Inkluder kunstnerens navn
- Beskriv medium og teknik
- Nævn dimensioner
- Fortæl historien bag værket

**For kunstnerprofiler:**
- Biografisk information
- Kunstnerisk stil
- Tidligere udstillinger
- Uddannelse

## Monitoring og Vedligeholdelse

### Google Search Console

**Setup:**
1. Tilføj site property
2. Verificer ejerskab
3. Submit sitemap: `https://your-domain.com/sitemap.xml`
4. Overvåg crawl errors
5. Tjek Core Web Vitals

**Vigtige metrics:**
- Impressions
- Click-through rate (CTR)
- Average position
- Coverage issues

### Performance Monitoring

**Tools:**
- Google PageSpeed Insights
- Lighthouse (Chrome DevTools)
- WebPageTest
- GTmetrix

**Mål:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.8s

### Regelmæssige Opgaver

**Ugentligt:**
- Tjek for crawl errors i Search Console
- Verificer sitemap opdateres korrekt
- Overvåg Core Web Vitals

**Månedligt:**
- Gennemgå top performing pages
- Identificer sider med lav CTR
- Opdater metadata for underperformende sider
- Tjek for broken links

**Kvartalsvis:**
- Keyword research og optimering
- Konkurrentanalyse
- Content audit
- Backlink analyse

## Teknisk SEO Checklist

- ✅ HTTPS aktiveret
- ✅ Mobile-responsive design
- ✅ Fast loading times
- ✅ Structured data implementeret
- ✅ XML sitemap genereret
- ✅ Robots.txt konfigureret
- ✅ Canonical URLs sat
- ✅ 404 error page
- ✅ Breadcrumb navigation
- ✅ Image optimization
- ✅ Internal linking structure
- ✅ Meta descriptions på alle sider
- ✅ Alt text på alle billeder
- ✅ Semantic HTML (h1, h2, etc.)
- ✅ Schema markup

## Fremtidige Forbedringer

### Kort sigt (1-3 måneder)
1. **Blog/Content Marketing**
   - Kunstnerinterviews
   - Kunstguides
   - Markedstendenser
   - SEO-optimerede artikler

2. **Kunstnerprofiler**
   - Dedikerede sider for hver kunstner
   - Portfolio visning
   - Biografier
   - Social media integration

3. **Kategorisider**
   - Maleri, skulptur, fotografi, etc.
   - Optimerede landing pages
   - Filtreringsmuligheder

### Mellemlang sigt (3-6 måneder)
1. **Internationalisering**
   - Engelsk version
   - hreflang tags
   - Multi-language sitemap

2. **Rich Snippets**
   - Review ratings
   - Price ranges
   - Availability status
   - Artist information

3. **Video Content**
   - Kunstner interviews
   - Behind-the-scenes
   - Kunstværk close-ups
   - Video schema markup

### Lang sigt (6-12 måneder)
1. **AI-genereret Content**
   - Automatiske kunstværksbeskrivelser
   - SEO-optimerede titler
   - Meta descriptions

2. **Advanced Analytics**
   - User behavior tracking
   - Conversion optimization
   - A/B testing af metadata

3. **Link Building**
   - Kunstblogger outreach
   - Gallery partnerships
   - Press releases
   - Guest posting

## Miljøvariabler

Tilføj til `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Dette bruges til:
- Canonical URLs
- Open Graph URLs
- Sitemap generation
- Structured data

## Support og Ressourcer

**Dokumentation:**
- [Next.js SEO](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)

**Tools:**
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/)
- [Ahrefs](https://ahrefs.com/)
- [SEMrush](https://www.semrush.com/)

## Kontakt

For SEO-relaterede spørgsmål eller problemer, kontakt systemadministrator.
