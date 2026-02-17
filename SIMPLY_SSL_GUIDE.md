# SSL Certifikat Opsætning via Simply.com

## Hurtig Guide til SSL på www.artissafe.dk

Denne guide hjælper dig med at aktivere gratis Let's Encrypt SSL-certifikat via Simply.com kontrolpanel.

---

## Trin 1: Log ind på Simply.com Kontrolpanel

1. Gå til: https://www.simply.com/dk/controlpanel/
2. Log ind med dine Simply.com legitimationsoplysninger
3. Du vil se en oversigt over dine domæner

---

## Trin 2: Vælg Dit Domæne

1. Find og klik på **artissafe.dk** i listen over domæner
2. Du vil nu se domænets kontrolpanel med forskellige indstillinger

---

## Trin 3: Naviger til SSL/TLS Indstillinger

Simply.com's kontrolpanel kan have forskellige layouts, så kig efter en af disse:

**Option A: SSL/TLS Menu**
- Klik på "SSL/TLS" i venstre menu
- Eller find "Sikkerhed" sektionen

**Option B: Webhotel/Hosting Menu**
- Gå til "Webhotel" eller "Hosting"
- Find SSL-indstillinger under hosting-konfiguration

**Option C: Direkte SSL Link**
- Nogle kontrolpaneler har en "Aktiver SSL" knap direkte på domæne-oversigten

---

## Trin 4: Aktiver Let's Encrypt SSL

1. Find **"Let's Encrypt SSL"** eller **"Gratis SSL"** option
2. Du vil se mulighed for at aktivere SSL for:
   - `artissafe.dk` (root domain)
   - `www.artissafe.dk` (www subdomain)

3. **Vælg BEGGE domæner:**
   - ✅ artissafe.dk
   - ✅ www.artissafe.dk

4. Klik på **"Aktiver"**, **"Installer"** eller **"Bestil SSL"** knappen

---

## Trin 5: Vent på Certifikat Udstedelse

**Hvad sker der nu?**
- Let's Encrypt verificerer at du ejer domænet
- Dette sker automatisk via DNS-verifikation
- Processen tager typisk **5-15 minutter**
- I sjældne tilfælde kan det tage op til 1 time

**Du vil modtage:**
- En email når certifikatet er aktiveret
- Status opdatering i kontrolpanelet

**Mens du venter:**
- Lad kontrolpanel-siden være åben
- Refresh siden efter 5-10 minutter for at se status

---

## Trin 6: Verificer SSL Status

### I Simply.com Kontrolpanel:
1. Gå tilbage til SSL/TLS sektionen
2. Tjek at status viser:
   - ✅ **Aktiv** eller **Installeret**
   - Udløbsdato (typisk 90 dage frem)
   - Certifikat type: Let's Encrypt

### Test i Browser:
1. Åbn en ny browser tab
2. Gå til: **https://www.artissafe.dk**
3. Tjek at:
   - ✅ Låseikonet vises i adresselinjen
   - ✅ Ingen sikkerhedsadvarsler
   - ✅ Siden loader korrekt

### Klik på Låseikonet:
- Vælg "Forbindelsen er sikker" eller "Certificate"
- Verificer:
  - Udstedt af: Let's Encrypt
  - Gyldigt for: artissafe.dk og www.artissafe.dk
  - Udløber: [dato 90 dage frem]

---

## Trin 7: Test HTTPS Redirect

Din `.htaccess` fil er allerede konfigureret til at redirecte HTTP til HTTPS.

**Test dette:**

1. Gå til: **http://www.artissafe.dk** (bemærk http, ikke https)
2. Du skal automatisk blive redirected til: **https://www.artissafe.dk**
3. Test også: **http://artissafe.dk** → skal redirecte til **https://artissafe.dk**

---

## Automatisk Fornyelse

**Godt nyt!** Let's Encrypt certifikater fornyes automatisk:

- Certifikatet er gyldigt i **90 dage**
- Simply.com fornyer automatisk **30 dage før udløb**
- Du modtager en email når fornyelsen sker
- **Ingen handling krævet fra din side**

---

## Hvis SSL Ikke Aktiveres

### Problem 1: DNS Peger Ikke Korrekt

**Løsning:**
1. Gå til DNS-indstillinger i Simply.com kontrolpanel
2. Verificer at A-records peger på Simply.com's server IP
3. Kontakt Simply.com support for korrekt IP-adresse

### Problem 2: "Domæne Ikke Verificeret" Fejl

**Løsning:**
1. Vent 24-48 timer hvis du lige har ændret DNS
2. Tjek at domænet er aktivt og ikke parkeret
3. Kontakt Simply.com support

### Problem 3: SSL Option Ikke Tilgængelig

**Løsning:**
1. Tjek at din hosting-pakke inkluderer SSL (de fleste gør)
2. Opgrader hosting-pakke hvis nødvendigt
3. Kontakt Simply.com support: +45 46 90 25 25

---

## Verificer SSL Sikkerhed

### Online SSL Test:

**SSL Labs Test (Anbefalet):**
1. Gå til: https://www.ssllabs.com/ssltest/
2. Indtast: `www.artissafe.dk`
3. Klik "Submit"
4. Vent på test (tager 2-3 minutter)
5. Mål: **A eller A+ rating**

**Hvad testes:**
- Certifikat gyldighed
- Kryptering styrke
- Protokol support (TLS 1.2, TLS 1.3)
- Sikkerhedskonfiguration

### Command Line Test:

```bash
# Test SSL certifikat
curl -I https://www.artissafe.dk

# Forventet output:
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains; preload

# Tjek certifikat detaljer
openssl s_client -connect www.artissafe.dk:443 -servername www.artissafe.dk

# Tjek udløbsdato
echo | openssl s_client -servername www.artissafe.dk -connect www.artissafe.dk:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Din Kode Er Klar

Din `.htaccess` fil har allerede:

✅ **HTTPS Redirect:**
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

✅ **HSTS Header:**
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

✅ **Security Headers:**
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy

**Ingen kode-ændringer nødvendige!**

---

## Opdater Miljøvariabler (Valgfrit)

Hvis du har hardcoded URLs i din `.env.local`:

```env
# Opdater fra http til https
NEXT_PUBLIC_SITE_URL=https://www.artissafe.dk
```

---

## Monitoring og Vedligeholdelse

### Opsæt SSL Monitoring (Anbefalet):

**UptimeRobot (Gratis):**
1. Gå til: https://uptimerobot.com
2. Opret gratis konto
3. Tilføj monitor for: https://www.artissafe.dk
4. Aktiver SSL certifikat monitoring
5. Modtag email hvis certifikat udløber eller siden er nede

**Hvad overvåges:**
- ✅ SSL certifikat gyldighed
- ✅ Certifikat udløbsdato
- ✅ Website uptime
- ✅ Response time

---

## Troubleshooting

### "Din forbindelse er ikke privat" Fejl

**Årsager:**
1. SSL certifikat er ikke aktiveret endnu (vent 15 min)
2. DNS propagering ikke færdig (vent 24-48 timer)
3. Browser cache (ryd cache og prøv igen)

**Løsning:**
```bash
# Tjek SSL status
curl -I https://www.artissafe.dk

# Hvis fejl, vent og prøv igen
# Eller kontakt Simply.com support
```

### Mixed Content Warnings

**Problem:** Nogle ressourcer loader via HTTP i stedet for HTTPS

**Løsning:**
1. Åbn browser developer tools (F12)
2. Se console for "Mixed Content" advarsler
3. Find HTTP URLs i din kode
4. Opdater til HTTPS eller relative URLs

**Eksempel:**
```javascript
// ❌ Dårligt
<img src="http://www.artissafe.dk/image.jpg" />

// ✅ Godt
<img src="/image.jpg" />
// eller
<img src="https://www.artissafe.dk/image.jpg" />
```

### Redirect Loop

**Problem:** Siden redirecter i en uendelig loop

**Løsning:**
1. Tjek at Simply.com's server korrekt sender HTTPS header
2. Kontakt Simply.com support hvis problemet fortsætter
3. De kan justere server-konfiguration

---

## Support Kontakt

### Simply.com Support:
- **Telefon:** +45 46 90 25 25
- **Email:** support@simply.com
- **Hjælpecenter:** https://www.simply.com/dk/hjaelp/
- **Chat:** Tilgængelig i kontrolpanelet

### Hvornår Skal Du Kontakte Support?

1. SSL aktiveres ikke efter 1 time
2. "Domæne ikke verificeret" fejl
3. SSL option ikke tilgængelig i kontrolpanel
4. Certifikat fornyes ikke automatisk
5. Tekniske problemer med server-konfiguration

**Når du kontakter support, nævn:**
- Domæne: artissafe.dk
- Problem: SSL certifikat aktivering
- Hvad du har prøvet
- Eventuelle fejlmeddelelser

---

## Checklist: Er SSL Korrekt Konfigureret?

Gå gennem denne checklist:

- [ ] SSL aktiveret i Simply.com kontrolpanel
- [ ] Certifikat status: Aktiv
- [ ] https://www.artissafe.dk loader uden fejl
- [ ] Låseikon vises i browser
- [ ] http://www.artissafe.dk redirecter til https
- [ ] SSL Labs test giver A eller A+ rating
- [ ] Ingen "Mixed Content" advarsler
- [ ] HSTS header er aktiv
- [ ] Monitoring er sat op (UptimeRobot)

**Hvis alle er tjekket af: Tillykke! SSL er korrekt konfigureret! 🎉**

---

## Næste Skridt Efter SSL

1. **Test hele websitet:**
   - Gennemgå alle sider
   - Test alle funktioner
   - Verificer at alt loader korrekt

2. **Opdater Google Search Console:**
   - Tilføj https://www.artissafe.dk som ny property
   - Submit sitemap igen

3. **Opdater sociale medier:**
   - Facebook, LinkedIn, etc.
   - Opdater URL til HTTPS version

4. **Opdater eksterne links:**
   - Email signaturer
   - Visitkort
   - Marketing materialer

---

## Yderligere Sikkerhed (Valgfrit)

### HSTS Preload:

Når SSL har kørt stabilt i 30 dage:

1. Gå til: https://hstspreload.org/
2. Indtast: artissafe.dk
3. Submit til HSTS preload list
4. Dette gør at browsere ALTID bruger HTTPS

### Content Security Policy:

Din `.htaccess` har allerede en CSP header. Overvej at stramme den:

```apache
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://dboyqhwlbbjdfhdgdpkc.supabase.co;"
```

---

## Konklusion

SSL-opsætning via Simply.com er simpelt:

1. ✅ Log ind på kontrolpanel
2. ✅ Aktiver Let's Encrypt SSL
3. ✅ Vent 5-15 minutter
4. ✅ Verificer at det virker
5. ✅ Automatisk fornyelse håndteres af Simply.com

**Din kode er allerede klar med korrekte security headers og HTTPS redirect!**

Ved problemer: Kontakt Simply.com support på +45 46 90 25 25
