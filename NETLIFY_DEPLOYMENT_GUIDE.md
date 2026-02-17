# Netlify Deployment Guide

Dette projekt er nu konfigureret til deployment på Netlify.

## Opsætning

### 1. Opret Netlify-konto
Gå til [netlify.com](https://netlify.com) og opret en konto hvis du ikke allerede har en.

### 2. Forbind GitHub Repository
1. Log ind på Netlify
2. Klik på "Add new site" → "Import an existing project"
3. Vælg GitHub som provider
4. Autoriser Netlify til at få adgang til dine repositories
5. Vælg dit projekt repository

### 3. Konfigurer Build Settings
Netlify vil automatisk detektere Next.js projektet, men verificer følgende:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18.x eller nyere

### 4. Tilføj Environment Variables
I Netlify dashboard under "Site settings" → "Environment variables", tilføj:

```
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://din-netlify-site.netlify.app
STRIPE_SECRET_KEY=din_stripe_secret_key
STRIPE_WEBHOOK_SECRET=din_stripe_webhook_secret
```

### 5. Deploy
1. Klik "Deploy site"
2. Netlify vil automatisk bygge og deploye dit projekt
3. Efter deployment får du en URL som `https://random-name.netlify.app`

### 6. Custom Domain (Valgfrit)
1. Gå til "Domain settings" i Netlify dashboard
2. Klik "Add custom domain"
3. Følg instruktionerne for at pege dit domæne til Netlify

## Automatisk Deployment

Netlify vil automatisk deploye når du:
- Pusher til main/master branch
- Merger en pull request

## Netlify Plugin

Projektet bruger `@netlify/plugin-nextjs` som automatisk:
- Optimerer Next.js builds
- Håndterer ISR (Incremental Static Regeneration)
- Konfigurerer serverless functions
- Sætter korrekte headers og redirects

## Troubleshooting

### Build fejler
- Tjek build logs i Netlify dashboard
- Verificer at alle environment variables er sat korrekt
- Sørg for at Node version er 18.x eller nyere

### Environment Variables
- Husk at gendeploye efter at have ændret environment variables
- Brug `NEXT_PUBLIC_` prefix for variabler der skal være tilgængelige i browseren

### Cron Jobs
Netlify understøtter ikke cron jobs direkte. For scheduled tasks, brug:
- Netlify Scheduled Functions (Beta)
- Eller eksterne services som Vercel Cron, GitHub Actions, eller EasyCron

## Support

For mere information, se:
- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
