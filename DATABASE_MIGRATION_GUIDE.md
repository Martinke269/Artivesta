# Database Migration Guide

## Important: Run This Migration First

Before using the new category and dimension features, you need to run the database migration to add the required columns to your Supabase database.

## Quick Migration Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `dboyqhwlbbjdfhdgdpkc`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run Migration**
   - Open the file: `supabase/migrations/add_artwork_dimensions_and_metadata.sql`
   - Copy all the SQL content
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)

4. **Verify Success**
   - You should see a success message
   - The migration adds columns safely using `IF NOT EXISTS`, so it's safe to run multiple times

### Option 2: Using psql (Command Line)

If you have direct database access:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" -f supabase/migrations/add_artwork_dimensions_and_metadata.sql
```

### Option 3: Copy-Paste SQL Directly

If you prefer, here's the complete SQL to run:

```sql
-- Add metadata columns
ALTER TABLE artworks 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS dominant_colors TEXT[];

-- Add dimension columns
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_tags ON artworks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_artworks_colors ON artworks USING GIN(dominant_colors);
```

## Verification

After running the migration, verify it worked:

1. Go to Supabase Dashboard → Table Editor
2. Select the `artworks` table
3. Check that these new columns exist:
   - category
   - style
   - tags
   - dominant_colors
   - width_cm, height_cm, depth_cm
   - weight_kg
   - area_sqm
   - pixel_dimensions, aspect_ratio, file_format
   - element_count
   - mounting_requirements
   - acoustic_effect
   - price_per_sqm_cents
   - custom_dimensions_description

## What This Migration Does

✅ **Safe**: Uses `IF NOT EXISTS` - won't break if columns already exist
✅ **Non-destructive**: Preserves all existing artwork data
✅ **Backward compatible**: Existing artworks continue to work
✅ **Performance**: Adds indexes for faster filtering

## Troubleshooting

### "Column already exists" error
This is fine! It means the column was already added. The migration is idempotent.

### Permission denied
Make sure you're logged in as a user with database admin privileges in Supabase.

### Connection timeout
Try refreshing the Supabase dashboard and running the query again.

## After Migration

Once the migration is complete:
1. The upload form will show dynamic dimension fields
2. Artists can select from 16 different categories
3. Each category shows relevant dimension fields
4. Filtering by category will work with all new categories

## Need Help?

If you encounter issues:
1. Check the Supabase logs in the dashboard
2. Verify your database connection
3. Ensure you have the correct project selected
4. Try running the SQL in smaller chunks if needed

---

**Note**: The Supabase MCP server experienced connection timeouts during automated migration, so manual execution via the dashboard is recommended.
