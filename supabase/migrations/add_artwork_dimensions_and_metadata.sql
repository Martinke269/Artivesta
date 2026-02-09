-- Migration: Add artwork dimensions and metadata fields
-- This migration adds new columns to the artworks table to support:
-- - Extended category system
-- - Dynamic dimension fields based on artwork type
-- - Enhanced metadata (tags, colors, style)

-- Add metadata columns
ALTER TABLE artworks 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS dominant_colors TEXT[];

-- Add dimension columns (used dynamically based on category)
ALTER TABLE artworks
  ADD COLUMN IF NOT EXISTS width_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS depth_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS area_sqm NUMERIC,
  ADD COLUMN IF NOT EXISTS pixel_dimensions TEXT,
  ADD COLUMN IF NOT EXISTS aspect_ratio TEXT,
  ADD COLUMN IF NOT EXISTS file_format TEXT,
  ADD COLUMN IF NOT EXISTS element_count INTEGER,
  ADD COLUMN IF NOT EXISTS mounting_requirements TEXT,
  ADD COLUMN IF NOT EXISTS acoustic_effect BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_per_sqm_cents INTEGER,
  ADD COLUMN IF NOT EXISTS custom_dimensions_description TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_artworks_colors ON artworks USING GIN(dominant_colors);

-- Note: Existing data is preserved. All new columns are nullable.
-- The application will handle dimension fields dynamically based on the category.
