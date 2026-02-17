# Løsning: DNS Konfiguration for SSL på Simply.com

## Problemet

Fejlmeddelelse: **"Let's Encrypt kan ikke benyttes når DNS for artissafe.dk ikke peger direkte på din Simply.com-webserver."**

Dette betyder at domænets DNS-records ikke peger korrekt på Simply.com's server.

---

## Løsning: Opdater DNS Records

### Trin 1: Find Simply.com Server IP-adresse

Du skal bruge den korrekte IP-adresse for din Simply.com webserver.

**Metode A: Tjek i Simply.com Kontrolpanel**
1. Log ind på https://www.simply.com/dk/controlpanel/
2. Gå til "Webhotel" eller "Hosting" for artissafe.dk
3. Find "Server Information" eller "Hosting Detaljer"
4. Noter IP-adressen (f.eks. 185.XX.XX.XX)

**Metode B: Kontakt Simply.com Support**
- Ring: +45 46 90 25 25
- Spørg: "Hvad er IP-adressen for min webserver til artissafe.dk?"

---

### Trin 2: Opdater DNS Records hos Simply.com

1. Log ind på https://www.simply.com/dk/controlpanel/
2. Vælg domænet **artissafe.dk**
3. Gå til **"DNS"** eller **"DNS-indstillinger"**

#### Konfigurer følgende DNS records:

**A Record for root domain:**
```
Type: A
Name: @ (eller artissafe.dk)
Value: [Simply.com server IP]
TTL: 3600
```

**A Record for www:**
```
Type: A  
Name: www
Value: [Simply.com server IP]
TTL: 3600
```

**Alternativt: CNAME for www (hvis A record ikke virker):**
```
Type: CNAME
Name: www
Value: artissafe.dk
TTL: 3600
```

---

### Trin 3: Gem Ændringer

1. Klik "Gem" eller "Opdater DNS"
2. Du vil se en besked om at ændringer kan tage op til 24-48 timer

---

### Trin 4: Vent på DNS Propagering

**Hvor lang tid tager det?**
- Minimum: 15-30 minutter
- Typisk: 2-4 timer
- Maksimum: 24-48 timer

**Mens du venter:**
- Lad DNS-indstillingerne være
- Rør ikke ved andre indstillinger
- Vent mindst 1 time før du prøver SSL igen

---

### Trin 5: Verificer DNS Propagering

#### Online DNS Check Tools:

**1. DNS Checker (Anbefalet):**
- Gå til: https://dnschecker.org/
- Indtast: `artissafe.dk`
- Vælg "A" record type
- Tjek at IP-adressen matcher Simply.com's server IP
- Gentag for `www.artissafe.dk`

**2. What's My DNS:**
- Gå til: https://www.whatsmydns.net/
- Indtast: `artissafe.dk`
- Tjek at IP-adressen er korrekt globalt

#### Command Line Check:

```bash
# Tjek A record for root domain
dig artissafe.dk A +short

# Tjek A record for www
dig www.artissafe.dk A +short

# Eller brug nslookup
nslookup artissafe.dk
nslookup www.artissafe.dk
```

**Forventet output:**
```
185.XX.XX.XX  (Simply.com's server IP)
```

---

### Trin 6: Prøv SSL Igen

Når DNS peger korrekt:

1. Gå tilbage til Simply.com kontrolpanel
2. Naviger til SSL/TLS indstillinger
3. Klik **"Aktiver HTTPS beskyttelse"** eller **"Tilføj eget SSL certifikat"**
4. Vælg **Let's Encrypt** option
5. Vælg både `artissafe.dk` og `www.artissafe.dk`
6. Klik "Aktiver"

Nu skulle Let's Encrypt kunne verificere domænet og udstede certifikatet!

---

## Alternativ Løsning: Køb SSL Certifikat

Hvis Let's Encrypt stadig ikke virker, kan du købe et SSL-certifikat:

### Option 1: Simply.com SSL Certifikat

1. I Simply.com kontrolpanel
2. Gå til SSL/TLS indstillinger
3. Vælg "Køb SSL Certifikat"
4. Følg købsprocessen (typisk 200-500 kr/år)

### Option 2: Brug Cloudflare (Gratis)

Hvis DNS-problemet fortsætter, kan du bruge Cloudflare som mellemled:

1. **Opret Cloudflare konto:**
   - Gå til https://www.cloudflare.com
   - Opret gratis konto
   - Tilføj domæne: artissafe.dk

2. **Opdater Nameservers:**
   - Cloudflare giver dig 2 nameservers
   - Gå til Simply.com DNS-indstillinger
   - Skift nameservers til Cloudflare's

3. **Konfigurer DNS i Cloudflare:**
   ```
   Type: A
   Name: @
   Value: [Simply.com server IP]
   Proxy: Enabled (orange cloud)
   
   Type: A
   Name: www
   Value: [Simply.com server IP]
   Proxy: Enabled (orange cloud)
   ```

4. **Aktiver SSL i Cloudflare:**
   - Gå til SSL/TLS settings
   - Vælg "Full" mode
   - Aktiver "Always Use HTTPS"

**Fordele ved Cloudflare:**
- ✅ Gratis SSL certifikat
- ✅ CDN (hurtigere loading)
- ✅ DDoS beskyttelse
- ✅ Nemmere DNS management

---

## Troubleshooting

### Problem: DNS ændringer virker ikke

**Løsning 1: Ryd DNS Cache**
```bash
# På Windows
ipconfig /flushdns

# På Mac/Linux
sudo dscacheutil -flushcache
```

**Løsning 2: Tjek Nameservers**
1. Verificer at nameservers peger på Simply.com
2. Hvis de peger på en anden udbyder, skal du opdatere dem

```bash
# Tjek nameservers
dig artissafe.dk NS +short
```

**Forventet output (Simply.com):**
```
ns1.simply.com
ns2.simply.com
```

### Problem: "Domæne ikke fundet" fejl

**Løsning:**
1. Tjek at domænet er aktivt hos Simply.com
2. Verificer at domænet ikke er udløbet
3. Kontakt Simply.com support

### Problem: SSL aktiveres stadig ikke efter DNS fix

**Løsning:**
1. Vent yderligere 24 timer på fuld DNS propagering
2. Prøv at deaktivere og genaktivere SSL
3. Kontakt Simply.com support med fejlmeddelelsen

---

## Verificer Korrekt Opsætning

### Checklist før SSL aktivering:

- [ ] DNS A record for @ peger på Simply.com IP
- [ ] DNS A record for www peger på Simply.com IP
- [ ] DNS propagering er færdig (tjek med dnschecker.org)
- [ ] Domænet loader korrekt på http://artissafe.dk
- [ ] Domænet loader korrekt på http://www.artissafe.dk
- [ ] Nameservers peger på Simply.com

**Når alle er tjekket af, prøv SSL aktivering igen!**

---

## Support

### Simply.com Support:
- **Telefon:** +45 46 90 25 25 (Hverdage 8-22, Weekend 10-18)
- **Email:** support@simply.com
- **Chat:** Tilgængelig i kontrolpanelet

### Hvad skal du sige til support?

"Hej, jeg prøver at aktivere Let's Encrypt SSL for artissafe.dk, men får fejlen at DNS ikke peger på webserveren. Kan I hjælpe mig med at:
1. Verificere den korrekte IP-adresse for min webserver
2. Tjekke at DNS er konfigureret korrekt
3. Aktivere SSL når DNS er korrekt"

---

## Forventet Timeline

| Trin | Tid |
|------|-----|
| Opdater DNS records | 5 minutter |
| DNS propagering starter | 15-30 minutter |
| DNS propagering færdig | 2-24 timer |
| Aktiver SSL | 5 minutter |
| SSL certifikat udstedes | 5-15 minutter |
| **Total tid** | **2-24 timer** |

---

## Næste Skridt

1. ✅ Find Simply.com server IP-adresse
2. ✅ Opdater DNS A records
3. ✅ Vent på DNS propagering (2-24 timer)
4. ✅ Verificer DNS med dnschecker.org
5. ✅ Aktiver Let's Encrypt SSL
6. ✅ Test https://www.artissafe.dk

**Din kode er allerede klar - du skal bare få DNS og SSL konfigureret korrekt!**
