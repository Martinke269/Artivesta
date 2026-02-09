# Artwork Categories and Dynamic Dimensions Update

This document describes the updates made to the ArtIsSafe platform's category system and dynamic dimension fields.

## Overview

The platform now supports an expanded category system with 16 different artwork types, each with its own set of relevant dimension fields that appear dynamically based on the selected category.

## New Category System

### Traditionelle kunstformer (Traditional Art Forms)
- **Maleri** (Painting)
- **Tegning** (Drawing)
- **Grafik** (Graphics/Prints)
- **Collage** (Collage)
- **Fotografi** (Photography)

### Rumlige kunstformer (Spatial Art Forms)
- **Skulptur** (Sculpture)
- **Installation / Væginstallation** (Installation / Wall Installation)
- **Tekstilkunst** (Textile Art)
- **Mural / Vægmaleri** (Mural / Wall Painting)

### Moderne kunstformer (Modern Art Forms)
- **Digital kunst** (Digital Art)
- **Generativ kunst** (Generative Art)
- **Mixed Media** (Mixed Media)

### Fleksible kategorier (Flexible Categories)
- **Abstrakt** (Abstract)
- **Custom kunst** (Custom Art)
- **Andet** (Other)

## Dynamic Dimension Fields

Each category has specific dimension fields that appear when the category is selected:

### 2D Artworks (Maleri, Tegning, Grafik, Collage, Fotografi, Abstrakt)
- Width (cm) - Required
- Height (cm) - Required
- Depth (cm) - Optional

### Skulptur (3D Artworks)
- Height (cm) - Required
- Width (cm) - Required
- Depth (cm) - Required
- Weight (kg) - Required

### Installation / Væginstallation
- Total Width (cm) - Required
- Total Height (cm) - Required
- Depth (cm) - Required
- Number of Elements - Optional
- Mounting Requirements (text) - Required

### Tekstilkunst
- Width (cm) - Required
- Height (cm) - Required
- Weight (kg) - Optional
- Acoustic Effect (checkbox) - Optional

### Mural / Vægmaleri
- Area (m²) - Required
- Max Width (cm) - Required
- Max Height (cm) - Required
- Price per m² - Optional

### Digital kunst & Generativ kunst
- Pixel Dimensions (e.g., 4000x3000 px) - Required
- Aspect Ratio (e.g., 16:9) - Required
- File Format (e.g., PNG, JPEG) - Required

### Mixed Media
- Width (cm) - Required
- Height (cm) - Required
- Depth (cm) - Required

### Custom kunst
- Dimension Description (text) - Required
- Width (cm) - Optional
- Height (cm) - Optional
- Depth (cm) - Optional

### Andet
- Description (text) - Required

## Database Schema Changes

New columns added to the `artworks` table:

### Metadata Fields
- `category` (TEXT) - Artwork category
- `style` (TEXT) - Artwork style
- `tags` (TEXT[]) - Array of tags
- `dominant_colors` (TEXT[]) - Array of dominant colors

### Dimension Fields
- `width_cm` (NUMERIC) - Width in centimeters
- `height_cm` (NUMERIC) - Height in centimeters
- `depth_cm` (NUMERIC) - Depth in centimeters
- `weight_kg` (NUMERIC) - Weight in kilograms
- `area_sqm` (NUMERIC) - Area in square meters
- `pixel_dimensions` (TEXT) - Pixel dimensions for digital art
- `aspect_ratio` (TEXT) - Aspect ratio for digital art
- `file_format` (TEXT) - File format for digital art
- `element_count` (INTEGER) - Number of elements in installation
- `mounting_requirements` (TEXT) - Mounting requirements for installations
- `acoustic_effect` (BOOLEAN) - Whether textile art has acoustic properties
- `price_per_sqm_cents` (INTEGER) - Price per square meter for murals
- `custom_dimensions_description` (TEXT) - Custom dimension description

### Indexes
New indexes for improved query performance:
- `idx_artworks_category` - Category filtering
- `idx_artworks_style` - Style filtering
- `idx_artworks_tags` - GIN index for tag searches
- `idx_artworks_colors` - GIN index for color searches

## Implementation Files

### Core Files Created/Updated

1. **`lib/artwork-constants.ts`** - New file
   - Centralized constants for categories, styles, and colors
   - Dimension field configurations for each category
   - TypeScript types for type safety

2. **`components/artwork-dimensions-fields.tsx`** - New file
   - Reusable component for rendering dynamic dimension fields
   - Handles number inputs, text inputs, textareas, and checkboxes
   - Automatically shows/hides fields based on category

3. **`app/upload/page.tsx`** - Updated
   - Integrated new category system
   - Added dynamic dimension fields
   - Handles dimension data conversion and submission

4. **`components/home/search-filters.tsx`** - Updated
   - Uses new centralized category constants
   - Supports all 16 categories in filtering

5. **`supabase/schema.sql`** - Updated
   - Documents the complete database schema
   - Includes all new columns and indexes

6. **`supabase/migrations/add_artwork_dimensions_and_metadata.sql`** - New file
   - Migration script to add new columns to existing database
   - Safe to run on production (uses IF NOT EXISTS)

## Running the Database Migration

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/add_artwork_dimensions_and_metadata.sql`
4. Paste and run the SQL

### Option 2: Via Supabase CLI (if available)
```bash
supabase db push
```

### Option 3: Manual SQL Execution
Connect to your database and run:
```sql
-- See supabase/migrations/add_artwork_dimensions_and_metadata.sql for full SQL
```

## Data Compatibility

- **Existing artworks**: All existing artwork data is preserved. New columns are nullable.
- **Backward compatibility**: Artworks without dimension data will continue to work normally.
- **Forward compatibility**: New artworks will have rich dimension data based on their category.

## User Experience

### For Artists
1. Select artwork category from expanded list
2. Relevant dimension fields appear automatically
3. Only required fields for that category must be filled
4. Clear labels with units (cm, kg, m², etc.)
5. Helpful placeholders for text fields

### For Buyers
1. Can filter by all 16 categories
2. Dimension information displayed appropriately per artwork type
3. Better search and discovery through enhanced metadata

## Testing Checklist

- [ ] Upload artwork with each category type
- [ ] Verify correct dimension fields appear for each category
- [ ] Test form validation (required vs optional fields)
- [ ] Verify data saves correctly to database
- [ ] Test filtering by new categories
- [ ] Verify existing artworks still display correctly
- [ ] Test dimension data display on artwork detail pages

## Future Enhancements

Potential future improvements:
- Dimension-based filtering (e.g., artworks under 50cm width)
- Size recommendations based on room dimensions
- Automatic price suggestions based on dimensions
- Dimension validation (e.g., reasonable ranges)
- Unit conversion (cm to inches, etc.)

## Notes

- The dimension fields are stored in the database but only the relevant ones are populated based on category
- The UI automatically handles showing/hiding fields
- All dimension conversions (e.g., price per m² to cents) are handled in the upload form
- The system is designed to be easily extensible for new categories or dimension types
