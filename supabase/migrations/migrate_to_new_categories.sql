-- Migration: Update artwork categories to new 6-category system
-- This migration maps old categories to new ones and ensures all artworks have a valid category

-- Step 1: Update artworks with old categories to new categories
UPDATE artworks
SET category = CASE
  WHEN category = 'Maleri' THEN 'Maleri'
  WHEN category = 'Tegning' THEN 'Tegning'
  WHEN category = 'Grafik' THEN 'Grafik & Kunsttryk'
  WHEN category = 'Collage' THEN 'Maleri'
  WHEN category = 'Fotografi' THEN 'Fotografi'
  WHEN category = 'Skulptur' THEN 'Skulptur & Keramik'
  WHEN category = 'Installation / Væginstallation' THEN 'Skulptur & Keramik'
  WHEN category = 'Tekstilkunst' THEN 'Skulptur & Keramik'
  WHEN category = 'Mural / Vægmaleri' THEN 'Maleri'
  WHEN category = 'Digital kunst' THEN 'Digital Kunst'
  WHEN category = 'Generativ kunst' THEN 'Digital Kunst'
  WHEN category = 'Mixed Media' THEN 'Maleri'
  WHEN category = 'Abstrakt' THEN 'Maleri'
  WHEN category = 'Custom kunst' THEN 'Maleri'
  WHEN category = 'Andet' THEN 'Maleri'
  ELSE 'Maleri' -- Default fallback
END
WHERE category IS NOT NULL;

-- Step 2: Set default category for artworks without a category
UPDATE artworks
SET category = 'Maleri'
WHERE category IS NULL;

-- Step 3: Add a check constraint to ensure only valid categories are used
ALTER TABLE artworks
DROP CONSTRAINT IF EXISTS artworks_category_check;

ALTER TABLE artworks
ADD CONSTRAINT artworks_category_check
CHECK (category IN (
  'Maleri',
  'Skulptur & Keramik',
  'Grafik & Kunsttryk',
  'Fotografi',
  'Digital Kunst',
  'Tegning'
));

-- Step 4: Make category required (NOT NULL)
ALTER TABLE artworks
ALTER COLUMN category SET NOT NULL;

-- Step 5: Update the category index to improve query performance
DROP INDEX IF EXISTS idx_artworks_category;
CREATE INDEX idx_artworks_category ON artworks(category);

-- Step 6: Add comment to document the new category system
COMMENT ON COLUMN artworks.category IS 'Main artwork category - must be one of: Maleri, Skulptur & Keramik, Grafik & Kunsttryk, Fotografi, Digital Kunst, Tegning';
COMMENT ON COLUMN artworks.tags IS 'Art types and other tags - art types should correspond to the selected category';
