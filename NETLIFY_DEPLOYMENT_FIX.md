# Netlify Deployment Fix Guide

## Problemer Identificeret

### 1. **KRITISK: Forkert Publish Directory**
- **Problem**: `netlify.toml` har `publish = ".next"` 
- **Løsning**: For Next.js på Netlify skal det være `publish = ".next/standalone"` ELLER bare bruge default (ingen publish setting)
- **Årsag**: Netlify's Next.js plugin håndterer automatisk output directory

### 2. **Environment Variables Mangler Værdier**
- **Problem**: Alle env vars i `netlify.toml` er tomme strenge `""`
- **Løsning**: Disse skal sættes i Netlify Dashboard, IKKE i netlify.toml
- **Årsag**: Sikkerhedsmæssige årsager - secrets skal ikke committes til git

### 3. **Output Configuration Mangler**
- **Problem**: `next.config.mjs` mangler output mode for Netlify
- **Løsning**: Tilføj `output: 'standalone'` for optimal Netlify deployment

### 4. **Supabase Environment Variable Mismatch**
- **Problem**: `next.config.mjs` refererer til `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- **Problem**: `netlify.toml` refererer til `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Løsning**: Standardiser til `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Løsninger

### Fix 1: Opdater netlify.toml
```toml
[build]
  command = "npm run build"
  # Fjern publish - lad Netlify plugin håndtere det

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"
  NODE_VERSION = "18"
  # Fjern tomme env vars - sæt dem i Netlify Dashboard i stedet
```

### Fix 2: Opdater next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Vigtigt for Netlify
  eslint: {
    ignoreDuringBuilds: true
  },
  // Fjern env block - Next.js håndterer NEXT_PUBLIC_ automatisk
};

export default nextConfig;
```

### Fix 3: Sæt Environment Variables i Netlify Dashboard

Gå til: **Site settings → Environment variables** og tilføj:

**Påkrævet:**
```
NEXT_PUBLIC_SUPABASE_URL=https://znkvmklheuidkffvbtvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[din_anon_key]
NEXT_PUBLIC_SITE_URL=https://[dit-site-navn].netlify.app
```

**Valgfri (hvis du bruger Stripe):**
```
STRIPE_SECRET_KEY=[din_stripe_secret]
STRIPE_WEBHOOK_SECRET=[din_webhook_secret]
SUPABASE_SERVICE_ROLE_KEY=[din_service_role_key]
```

**VIGTIGT:** Sæt disse for **alle** deployment contexts:
- Production
- Deploy Previews  
- Branch deploys

### Fix 4: Verificer .gitignore
Sørg for at `.env.local` er i `.gitignore` så secrets ikke committes.

## Deployment Steps

1. **Commit ændringerne:**
   ```bash
   git add netlify.toml next.config.mjs
   git commit -m "Fix Netlify deployment configuration"
   git push origin main
   ```

2. **Sæt Environment Variables i Netlify:**
   - Log ind på Netlify Dashboard
   - Vælg dit site
   - Gå til Site settings → Environment variables
   - Tilføj alle påkrævede variables
   - Klik "Save"

3. **Trigger ny deployment:**
   - Gå til Deploys tab
   - Klik "Trigger deploy" → "Deploy site"
   - Eller push en ny commit til GitHub

## Troubleshooting

### Build fejler med "Cannot find module"
- Verificer at alle dependencies er i `package.json`
- Kør `npm install` lokalt for at teste

### Environment variables ikke tilgængelige
- Tjek at de er sat for korrekt deployment context
- Husk `NEXT_PUBLIC_` prefix for client-side variables
- Genstart deployment efter at have ændret env vars

### 404 på dynamiske routes
- Verificer at `output: 'standalone'` er i next.config.mjs
- Tjek at `@netlify/plugin-nextjs` er i netlify.toml

### Supabase connection fejler
- Verificer URL format: `https://[project-ref].supabase.co`
- Tjek at anon key er korrekt kopieret
- Test connection lokalt først

## Yderligere Optimering

### Tilføj Custom Domain
1. Gå til Domain settings i Netlify
2. Klik "Add custom domain"
3. Følg DNS instruktioner

### Enable Automatic Deploys
- Netlify deployer automatisk ved push til main branch
- Konfigurer branch deploys under Site settings → Build & deploy

### Performance
- Netlify's Next.js plugin håndterer automatisk:
  - Image optimization
  - ISR (Incremental Static Regeneration)
  - Edge functions
  - Caching headers

## Support Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
