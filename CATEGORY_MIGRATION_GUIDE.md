# Category Migration Guide

## New Category System

### 6 Main Categories (Single-Select)
1. Maleri
2. Skulptur & Keramik
3. Grafik & Kunsttryk
4. Fotografi
5. Digital Kunst
6. Tegning

### Art Types by Category

**Maleri:** Abstrakt maleri, Figurativt maleri, Mixed media, Collage, Akryl, Olie, Moderne maleri, Minimalistisk maleri

**Skulptur & Keramik:** Skulpturer, Keramik, Stentøj, Bronzeskulpturer, Glas, Installationer

**Grafik & Kunsttryk:** Litografi, Serigrafi, Giclée, Kunsttryk, Plakater, Grafiske værker

**Fotografi:** Kunstfotografi, Sort/hvid foto, Farvefoto, Naturfoto, Arkitekturfoto

**Digital Kunst:** Digital illustration, Digitalt maleri, AI-genereret kunst, Grafiske digitale værker

**Tegning:** Blyant, Tusch, Kul, Pastel, Akvarel

## Migration Steps

### 1. Apply Database Migration

Go to Supabase Dashboard > SQL Editor and run the migration from `supabase/migrations/migrate_to_new_categories.sql`

### 2. Verify Changes

Check that all artworks now have one of the 6 new categories.

### 3. Test Upload Form

Visit /upload and verify the new category selection with art types works correctly.

## Updated Files

- lib/artwork-constants.ts
- app/upload/page.tsx
- supabase/migrations/migrate_to_new_categories.sql
