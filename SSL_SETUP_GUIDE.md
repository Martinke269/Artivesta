# SSL Certifikat Opsætning for www.artissafe.dk

## Oversigt
Denne guide hjælper dig med at sikre SSL/TLS certifikat for www.artissafe.dk domænet, som har DNS-redirect til dette Next.js projekt.

## Deployment Platform

Du har to hovedmuligheder for SSL-opsætning:

### Option 1: Simply.com Hosting med Let's Encrypt (Anbefalet)

Hvis du vil hoste direkte på Simply.com:

#### Trin 1: Aktiver SSL i Simply.com Kontrolpanel

1. Log ind på https://www.simply.com/dk/controlpanel/
2. Vælg dit domæne (artissafe.dk)
3. Gå til "SSL/TLS" eller "Sikkerhed" sektionen
4. Vælg "Let's Encrypt SSL" eller "Gratis SSL"
5. Aktiver SSL for både:
   - `artissafe.dk`
   - `www.artissafe.dk`
6. Klik "Aktiver" eller "Installer"

#### Trin 2: Vent på Certifikat Udstedelse
- Let's Encrypt certifikater udstedes typisk inden for 5-15 minutter
- Du modtager en email når certifikatet er aktivt
- Certifikatet fornyes automatisk hver 90. dag

#### Trin 3: Verificer DNS Records
Sørg for at DNS peger korrekt:

```
Type: A
Name: @
Value: [Simply.com server IP]

Type: A
Name: www
Value: [Simply.com server IP]
```

Eller brug CNAME for www:
```
Type: CNAME
Name: www
Value: artissafe.dk
```

#### Trin 4: Opdater .htaccess for HTTPS Redirect

Sørg for at din `.htaccess` fil tvinger HTTPS:

```apache
# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Redirect www to non-www (valgfrit)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^www\.artissafe\.dk [NC]
  RewriteRule ^(.*)$ https://artissafe.dk/$1 [L,R=301]
</IfModule>
```

#### Trin 5: Test SSL Konfiguration
```bash
# Test SSL certifikat
curl -I https://www.artissafe.dk

# Verificer redirect
curl -I http://www.artissafe.dk
```

---

### Option 2: Cloudflare (Gratis SSL + CDN)

Cloudflare tilbyder gratis SSL, CDN, og DDoS beskyttelse.

#### Trin 1: Opret Cloudflare Konto
1. Gå til https://www.cloudflare.com
2. Opret gratis konto
3. Tilføj domæne: `artissafe.dk`

#### Trin 2: Opdater Nameservers hos Simply.com
Cloudflare vil give dig 2 nameservers, f.eks.:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

Log ind på Simply.com og opdater nameservers:
1. Gå til domæne indstillinger
2. Find "Nameservers" eller "DNS"
3. Skift til custom nameservers
4. Indtast Cloudflare's nameservers

#### Trin 3: Konfigurer DNS i Cloudflare
Tilføj DNS records i Cloudflare dashboard:

```
Type: A
Name: @
Value: [Din server IP]
Proxy: Enabled (orange cloud)

Type: A
Name: www
Value: [Din server IP]
Proxy: Enabled (orange cloud)
```

#### Trin 4: Aktiver SSL i Cloudflare
1. Gå til "SSL/TLS" i Cloudflare dashboard
2. Vælg SSL mode: "Full" eller "Full (strict)"
3. Aktiver "Always Use HTTPS"
4. Aktiver "Automatic HTTPS Rewrites"

#### Trin 5: Verificer
- Vent 5-10 minutter på DNS propagering
- Besøg https://www.artissafe.dk
- Tjek SSL status i Cloudflare dashboard

---

## Miljøvariabler Opdatering

Når SSL er aktiveret, opdater `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://www.artissafe.dk
```

Eller hvis du bruger non-www:
```env
NEXT_PUBLIC_SITE_URL=https://artissafe.dk
```

## Next.js Konfiguration

Opdater `next.config.mjs` hvis nødvendigt:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force HTTPS in production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

## Verificering af SSL

### Online Tools
1. **SSL Labs Test**: https://www.ssllabs.com/ssltest/analyze.html?d=www.artissafe.dk
2. **Why No Padlock**: https://www.whynopadlock.com/
3. **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

### Command Line
```bash
# Tjek certifikat detaljer
openssl s_client -connect www.artissafe.dk:443 -servername www.artissafe.dk

# Tjek certifikat udløbsdato
echo | openssl s_client -servername www.artissafe.dk -connect www.artissafe.dk:443 2>/dev/null | openssl x509 -noout -dates

# Test HTTPS redirect
curl -I http://www.artissafe.dk
```

### Browser Verificering
1. Besøg https://www.artissafe.dk
2. Klik på låseikonet i adresselinjen
3. Verificer:
   - ✅ Certifikat er gyldigt
   - ✅ Udstedt af Let's Encrypt eller Cloudflare
   - ✅ Gyldig til dato er i fremtiden
   - ✅ Domæne matcher (www.artissafe.dk)

## Troubleshooting

### Problem: "Your connection is not private" fejl

**Løsning:**
1. Vent på DNS propagering (op til 48 timer)
2. Ryd browser cache
3. Tjek at certifikatet er korrekt installeret
4. Verificer DNS records peger korrekt

### Problem: Mixed Content Warnings

**Løsning:**
1. Sørg for at alle ressourcer (billeder, scripts, CSS) bruger HTTPS
2. Opdater hardcoded HTTP URLs til HTTPS
3. Brug relative URLs hvor muligt: `/images/logo.png` i stedet for `http://...`

### Problem: Certifikat fornyes ikke automatisk

**Løsning:**
- **Vercel**: Automatisk, ingen handling nødvendig
- **Simply.com**: Kontakt support hvis auto-renewal fejler
- **Cloudflare**: Automatisk, ingen handling nødvendig

### Problem: www vs non-www redirect loop

**Løsning:**
Vælg én version og redirect den anden:

**Prefer www:**
```apache
RewriteCond %{HTTP_HOST} ^artissafe\.dk [NC]
RewriteRule ^(.*)$ https://www.artissafe.dk/$1 [L,R=301]
```

**Prefer non-www:**
```apache
RewriteCond %{HTTP_HOST} ^www\.artissafe\.dk [NC]
RewriteRule ^(.*)$ https://artissafe.dk/$1 [L,R=301]
```

## Anbefalinger

### For Produktion
1. ✅ Brug Simply.com Let's Encrypt for direkte hosting
2. ✅ Eller brug Cloudflare for ekstra sikkerhed og CDN
3. ✅ HSTS er allerede aktiveret i .htaccess
4. ✅ Security headers er allerede konfigureret
5. ✅ Overvåg certifikat udløbsdatoer

### Sikkerhed Best Practices
```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]
```

## Support Kontakter

### Simply.com
- **Email**: support@simply.com
- **Telefon**: +45 46 90 25 25
- **Hjælpecenter**: https://www.simply.com/dk/hjaelp/

### Cloudflare
- **Dokumentation**: https://developers.cloudflare.com/ssl/
- **Community**: https://community.cloudflare.com/

## Næste Skridt

1. Vælg deployment platform (Simply.com anbefales for direkte hosting)
2. Følg relevante trin ovenfor
3. Verificer SSL efter setup
4. Opdater miljøvariabler
5. Test alle sider og funktionalitet
6. Overvåg SSL status regelmæssigt

## Automatisk Monitoring

Overvej at sætte monitoring op:
- **UptimeRobot**: https://uptimerobot.com (gratis SSL monitoring)
- **StatusCake**: https://www.statuscake.com
- **Pingdom**: https://www.pingdom.com

Disse services kan advare dig hvis:
- SSL certifikatet er ved at udløbe
- Siden er nede
- SSL konfiguration har problemer
