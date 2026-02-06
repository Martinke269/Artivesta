# Deployment Guide til Simply.com

Denne guide hjælper dig med at deploye ART IS SAFE Next.js applikationen til Simply.com.

## Forudsætninger

- En Simply.com hosting konto med Node.js support
- SSH adgang til din Simply.com server
- Git installeret på serveren
- Node.js version 18 eller nyere

## Trin 1: Forbered Projektet Lokalt

### 1.1 Build Projektet
```bash
npm run build
```

Dette opretter en `.next` mappe med den optimerede produktionsbuild.

### 1.2 Test Produktionsbuild Lokalt
```bash
npm start
```

Verificer at applikationen kører korrekt på http://localhost:3000

## Trin 2: Konfigurer Simply.com Server

### 2.1 Log ind via SSH
```bash
ssh brugernavn@artissafe.dk
```

### 2.2 Installer Node.js (hvis ikke allerede installeret)
Simply.com har typisk Node.js installeret. Verificer versionen:
```bash
node --version
npm --version
```

Hvis Node.js ikke er installeret eller versionen er for gammel, kontakt Simply.com support.

### 2.3 Opret Projekt Mappe
```bash
mkdir -p ~/artissafe
cd ~/artissafe
```

## Trin 3: Upload Projektet

### Metode A: Via Git (Anbefalet)

1. Push dit projekt til et Git repository (GitHub, GitLab, etc.)
2. Clone på serveren:
```bash
cd ~/artissafe
git clone https://github.com/dit-brugernavn/art-marketplace-mvp.git .
```

### Metode B: Via FTP/SFTP

1. Brug en FTP klient (FileZilla, Cyberduck, etc.)
2. Upload alle projektfiler til `~/artissafe` mappen
3. Sørg for at uploade:
   - Alle source filer
   - `package.json` og `package-lock.json`
   - `.env.local` (med produktionsværdier)
   - `next.config.mjs`
   - Alle andre konfigurationsfiler

## Trin 4: Installer Dependencies

```bash
cd ~/artissafe
npm ci --production
```

Eller hvis du har brug for dev dependencies til build:
```bash
npm install
```

## Trin 5: Konfigurer Miljøvariabler

Opret eller rediger `.env.local` filen på serveren:

```bash
nano .env.local
```

Tilføj følgende (med dine faktiske værdier):
```
NEXT_PUBLIC_SUPABASE_URL=https://dboyqhwlbbjdfhdgdpkc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=din_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_anon_key
NEXT_PUBLIC_SITE_URL=https://www.artissafe.dk
```

## Trin 6: Build Applikationen

```bash
npm run build
```

Dette kan tage et par minutter. Vent til processen er færdig.

## Trin 7: Start Applikationen

### Metode A: Direkte Start (til test)
```bash
npm start
```

Dette starter serveren på port 3000. Test ved at besøge http://artissafe.dk:3000

### Metode B: Med PM2 (Anbefalet til produktion)

PM2 er en process manager der holder din app kørende og genstarter den automatisk ved fejl.

#### Installer PM2
```bash
npm install -g pm2
```

#### Start Applikationen med PM2
```bash
pm2 start npm --name "artissafe" -- start
```

#### Gem PM2 Konfiguration
```bash
pm2 save
pm2 startup
```

Følg instruktionerne fra `pm2 startup` kommandoen.

#### Nyttige PM2 Kommandoer
```bash
# Se status
pm2 status

# Se logs
pm2 logs artissafe

# Genstart app
pm2 restart artissafe

# Stop app
pm2 stop artissafe

# Slet app fra PM2
pm2 delete artissafe
```

## Trin 8: Konfigurer Reverse Proxy

Simply.com bruger typisk Apache eller Nginx. Du skal konfigurere en reverse proxy til at videresende trafik fra port 80/443 til din Next.js app på port 3000.

### For Apache (.htaccess)

Opret eller rediger `.htaccess` i din webroot:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>

<IfModule mod_proxy.c>
  ProxyPreserveHost On
  ProxyPass / http://localhost:3000/
  ProxyPassReverse / http://localhost:3000/
</IfModule>
```

### For Nginx

Kontakt Simply.com support for at få hjælp til Nginx konfiguration, eller hvis du har adgang til nginx config:

```nginx
server {
    listen 80;
    server_name artissafe.dk www.artissafe.dk;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Trin 9: SSL Certifikat

Simply.com tilbyder typisk gratis SSL certifikater via Let's Encrypt.

1. Log ind på Simply.com kontrolpanel
2. Gå til SSL/TLS indstillinger
3. Aktiver SSL for artissafe.dk og www.artissafe.dk
4. Vent på certifikat udstedelse (kan tage op til 24 timer)

## Trin 10: DNS Konfiguration

Sørg for at dit domæne peger på Simply.com serveren:

1. Log ind på Simply.com kontrolpanel
2. Gå til DNS indstillinger
3. Verificer at A-records peger korrekt:
   - `@` (root domain) → Simply.com server IP
   - `www` → Simply.com server IP

## Vedligeholdelse

### Opdatering af Applikationen

```bash
cd ~/artissafe
git pull origin main  # Hvis du bruger Git
npm install           # Installer nye dependencies
npm run build         # Rebuild applikationen
pm2 restart artissafe # Genstart med PM2
```

### Backup

Opret regelmæssige backups af:
- Projektfiler
- `.env.local` fil
- Supabase database (via Supabase dashboard)

### Monitoring

Overvåg din applikation med PM2:
```bash
pm2 monit
```

## Fejlfinding

### Applikationen starter ikke
1. Tjek logs: `pm2 logs artissafe`
2. Verificer miljøvariabler i `.env.local`
3. Tjek at port 3000 ikke er i brug: `lsof -i :3000`

### 502 Bad Gateway
1. Verificer at Next.js serveren kører: `pm2 status`
2. Tjek reverse proxy konfiguration
3. Genstart applikationen: `pm2 restart artissafe`

### Slow Performance
1. Tjek server ressourcer: `htop`
2. Overvej at opgradere hosting plan
3. Implementer caching strategier

## Support

### Simply.com Support
- Email: support@simply.com
- Telefon: +45 46 90 25 25
- Hjælpecenter: https://www.simply.com/dk/hjaelp/

### Next.js Dokumentation
- https://nextjs.org/docs/deployment

### Supabase Support
- https://supabase.com/docs

## Alternativ: Vercel Deployment

Hvis Simply.com ikke understøtter Node.js hosting godt nok, kan du overveje Vercel (lavet af Next.js teamet):

1. Push dit projekt til GitHub
2. Gå til https://vercel.com
3. Import dit GitHub repository
4. Tilføj miljøvariabler
5. Deploy med et klik
6. Konfigurer custom domain (artissafe.dk) i Vercel dashboard
7. Opdater DNS hos Simply.com til at pege på Vercel

Vercel er optimeret til Next.js og giver bedre performance og nemmere deployment.
