# Prisevalueringssystem

Dette dokument beskriver det automatiske prisevalueringssystem, der sammenligner kunstværkspriser med markedsdata fra offentlige kunstdatabaser.

## Oversigt

Prisevalueringssystemet analyserer løbende kunstværkernes priser og sammenligner dem med faktiske salgspriser (ikke udbudspriser) fra offentlige kunstmarkedsdatabaser. Systemet giver kunstnere og administratorer indsigt i, om deres værker er prissat korrekt i forhold til markedet.

## Funktioner

### 1. Markedsdataindsamling
- Henter data fra offentlige kunstdatabaser
- Fokuserer KUN på faktiske salgspriser (ikke udbudspriser)
- Understøtter flere datakilder:
  - Artprice API
  - Artnet Price Database
  - Christie's Lot Finder
  - Sotheby's Results
  - Mutual Art

### 2. Intelligent Prissammenligning
- Filtrerer sammenlignelige salg baseret på:
  - Kunstnerens navn
  - Medium (maleri, skulptur, etc.)
  - Dimensioner (±50% størrelsesforskel)
  - Salgsdato (kun de seneste 5 år)
- Beregner markedsstatistik:
  - Gennemsnitspris
  - Medianpris
  - Min/max prisinterval

### 3. Prisanbefalinger
Systemet giver en af fire anbefalinger:

- **Underpriset** (<-20% fra median): Prisen er væsentligt under markedsværdien
- **Rimeligt priset** (-20% til +30%): Prisen er inden for acceptabelt markedsinterval
- **Overpriset** (>+30% fra median): Prisen er væsentligt over markedsværdien
- **Utilstrækkelige data** (<3 sammenlignelige salg): Ikke nok data til pålidelig evaluering

### 4. Tillidsscore
- Beregnes baseret på antal sammenlignelige salg
- 0-100% skala
- Højere score ved flere sammenlignelige salg

## Database Schema

### Tabeller

#### `market_data_sources`
Gemmer information om datakilder:
```sql
- id: UUID
- name: TEXT (f.eks. "Artprice", "Christie's")
- api_endpoint: TEXT
- description: TEXT
- is_active: BOOLEAN
- last_sync_at: TIMESTAMPTZ
```

#### `market_sales`
Gemmer faktiske salgspriser fra markedet:
```sql
- id: UUID
- source_id: UUID (reference til market_data_sources)
- artist_name: TEXT
- artwork_title: TEXT
- sale_price_cents: INTEGER (pris i øre)
- currency: TEXT (standard: DKK)
- sale_date: DATE
- medium: TEXT (f.eks. "Oil on canvas")
- dimensions: TEXT (f.eks. "100x80 cm")
- auction_house: TEXT
```

#### `price_evaluations`
Gemmer prisevalueringer for kunstværker:
```sql
- id: UUID
- artwork_id: UUID
- current_price_cents: INTEGER
- market_avg_price_cents: INTEGER
- market_median_price_cents: INTEGER
- market_min_price_cents: INTEGER
- market_max_price_cents: INTEGER
- comparable_sales_count: INTEGER
- price_deviation_percent: DECIMAL
- recommendation: TEXT (underpriced/fairly_priced/overpriced/insufficient_data)
- confidence_score: DECIMAL (0-1)
- evaluation_notes: TEXT
- evaluated_at: TIMESTAMPTZ
```

#### Udvidelser til `artworks` tabel
```sql
- medium: TEXT
- dimensions: TEXT
- year_created: INTEGER
- category: TEXT
```

## API Endpoints

### 1. Evaluer Pris
**POST** `/api/pricing/evaluate`

Evaluerer et enkelt kunstværks pris eller alle kunstværker.

**Request Body:**
```json
{
  "artwork_id": "uuid",  // For enkelt evaluering
  "evaluate_all": true   // For bulk evaluering (kun admin)
}
```

**Response:**
```json
{
  "message": "Evaluation completed",
  "evaluation": {
    "artwork_id": "uuid",
    "current_price_cents": 500000,
    "market_median_price_cents": 450000,
    "comparable_sales_count": 12,
    "price_deviation_percent": 11.1,
    "recommendation": "fairly_priced",
    "confidence_score": 0.85,
    "evaluation_notes": "Price is within acceptable market range (+11.1% from median)."
  }
}
```

**GET** `/api/pricing/evaluate?artwork_id=uuid`

Henter seneste evaluering for et kunstværk.

### 2. Importer Markedsdata
**POST** `/api/pricing/market-data`

Importerer salgspriser fra eksterne datakilder (kun admin).

**Request Body:**
```json
{
  "source_name": "Christie's",
  "sales_data": [
    {
      "artist_name": "Pablo Picasso",
      "artwork_title": "Les Demoiselles d'Avignon",
      "sale_price_cents": 15000000,
      "currency": "DKK",
      "sale_date": "2024-05-15",
      "medium": "Oil on canvas",
      "dimensions": "243.9 x 233.7 cm",
      "auction_house": "Christie's New York"
    }
  ]
}
```

**GET** `/api/pricing/market-data?artist_name=Picasso&limit=50`

Henter markedsdata for en kunstner.

### 3. Planlagt Evaluering (Cron)
**GET** `/api/cron/evaluate-prices`

Kører automatisk prisevaluering for alle kunstværker. Skal kaldes af en cron-service.

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

## Automatisering

### Daglig Evaluering
Systemet kan konfigureres til at køre automatisk dagligt via:

1. **Vercel Cron** (anbefalet for Vercel deployment):
   ```json
   // vercel.json
   {
     "crons": [{
       "path": "/api/cron/evaluate-prices",
       "schedule": "0 2 * * *"
     }]
   }
   ```

2. **GitHub Actions**:
   ```yaml
   # .github/workflows/evaluate-prices.yml
   name: Daily Price Evaluation
   on:
     schedule:
       - cron: '0 2 * * *'
   jobs:
     evaluate:
       runs-on: ubuntu-latest
       steps:
         - name: Trigger evaluation
           run: |
             curl -X GET https://your-domain.com/api/cron/evaluate-prices \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
   ```

3. **Ekstern Cron Service** (f.eks. cron-job.org):
   - URL: `https://your-domain.com/api/cron/evaluate-prices`
   - Schedule: Dagligt kl. 02:00 UTC
   - Header: `Authorization: Bearer <CRON_SECRET>`

## UI Komponenter

### PriceEvaluationCard
React-komponent der viser prisevaluering for et kunstværk.

**Props:**
- `artworkId: string` - ID på kunstværket
- `canEvaluate?: boolean` - Om brugeren kan køre ny evaluering

**Funktioner:**
- Viser aktuel pris vs. markedspris
- Prisafvigelse i procent
- Markedsinterval (min/gennemsnit/max)
- Anbefaling med farvekodet badge
- Tillidsscore
- Knap til at opdatere evaluering

**Brug:**
```tsx
import { PriceEvaluationCard } from '@/components/price-evaluation-card';

<PriceEvaluationCard 
  artworkId={artwork.id} 
  canEvaluate={isArtist || isAdmin} 
/>
```

### PricingAdvisorWidget
React-komponent der giver prisrådgivning når kunstnere uploader nye værker.

**Props:**
- `medium?: string` - Værkets medium (f.eks. "Oil on canvas")
- `dimensions?: string` - Værkets dimensioner (f.eks. "100x80 cm")
- `yearCreated?: number` - Året værket blev skabt
- `onPriceSelect?: (priceCents: number) => void` - Callback når bruger vælger anbefalet pris

**Funktioner:**
- Analyserer markedsdata baseret på kunstnerens tidligere salg
- Viser anbefalet pris med tillidsscore
- Viser prisinterval (min/max)
- Giver markedsindsigt (trends, volatilitet, etc.)
- Knap til at bruge den anbefalede pris direkte

**Brug:**
```tsx
import { PricingAdvisorWidget } from '@/components/pricing-advisor-widget';

<PricingAdvisorWidget 
  medium={formData.medium}
  dimensions={formData.dimensions}
  yearCreated={formData.year_created}
  onPriceSelect={(priceCents) => {
    setFormData({ ...formData, price_cents: priceCents });
  }}
/>
```

## Sikkerhed

### Row Level Security (RLS)
Alle tabeller har RLS aktiveret:

- **market_data_sources**: Alle kan læse, kun admin kan ændre
- **market_sales**: Alle kan læse, kun admin kan indsætte
- **price_evaluations**: Kunstnere kan se egne, admin kan se alle

### API Sikkerhed
- Alle endpoints kræver autentificering
- Bulk-operationer kræver admin-rolle
- Cron endpoint beskyttet med secret token

## Datakilder

### Offentlige Kunstdatabaser

1. **Artprice** (artprice.com)
   - Verdens største kunstpris-database
   - 30+ millioner auktionsresultater
   - API tilgængelig med abonnement

2. **Artnet** (artnet.com)
   - Omfattende auktionsresultater
   - Pris-database API
   - Kræver abonnement

3. **Christie's Lot Finder** (christies.com)
   - Offentligt søgbar database
   - Historiske auktionsresultater
   - Gratis adgang til søgning

4. **Sotheby's Results** (sothebys.com)
   - Auktionsresultater
   - Offentligt tilgængelig
   - Søgbar database

5. **Mutual Art** (mutualart.com)
   - Gratis auktionsresultater
   - API tilgængelig
   - Omfattende kunstnerdata

### Integration
For at integrere med disse datakilder:

1. Opret API-nøgler hos de relevante tjenester
2. Tilføj API-nøgler til `.env.local`:
   ```
   ARTPRICE_API_KEY=your_key
   ARTNET_API_KEY=your_key
   ```
3. Implementer data-fetch funktioner i `lib/pricing-evaluation.ts`
4. Kør import via `/api/pricing/market-data` endpoint

## Eksempel: Manuel Import af Markedsdata

```bash
curl -X POST https://your-domain.com/api/pricing/market-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "source_name": "Christies",
    "sales_data": [
      {
        "artist_name": "Asger Jorn",
        "artwork_title": "Untitled",
        "sale_price_cents": 125000000,
        "currency": "DKK",
        "sale_date": "2024-11-20",
        "medium": "Oil on canvas",
        "dimensions": "130 x 195 cm",
        "auction_house": "Christies London"
      }
    ]
  }'
```

## Vedligeholdelse

### Regelmæssige Opgaver
1. **Opdater markedsdata**: Importer nye salgspriser månedligt
2. **Rens gamle data**: Fjern salg ældre end 5 år årligt
3. **Verificer datakilder**: Tjek at API-integrationer virker
4. **Gennemgå evalueringer**: Kontroller evalueringskvalitet kvartalsvis

### Monitoring
Overvåg følgende metrics:
- Antal evalueringer per dag
- Gennemsnitlig tillidsscore
- Antal kunstværker med utilstrækkelige data
- API fejlrate for datakilder

## Fremtidige Forbedringer

1. **Machine Learning**: Implementer ML-model til bedre prisforudsigelser
2. **Flere Datakilder**: Integrer med flere internationale databaser
3. **Trend Analyse**: Vis prisudvikling over tid
4. **Kunstner Benchmarking**: Sammenlign kunstnere i samme kategori
5. **Email Notifikationer**: Send alerts ved betydelige prisafvigelser
6. **Bulk Import**: CSV/Excel upload af markedsdata
7. **API Rate Limiting**: Implementer rate limiting for eksterne API-kald

## Support

For spørgsmål eller problemer, kontakt systemadministrator eller se projektets README.md.
