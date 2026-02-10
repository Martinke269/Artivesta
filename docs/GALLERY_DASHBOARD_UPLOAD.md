# Gallery Dashboard Upload Artwork Page

## Overview

The Upload Artwork Page allows gallery owners and authorized team members to upload new artworks to their gallery with comprehensive metadata, AI-powered features, and validation.

**Route:** `/gallery/dashboard/upload`

## Features

### 1. Form Fields

#### Basic Information
- **Titel** (required) - Artwork title
- **Kunstner** (required) - Dropdown of gallery-associated artists
- **Kategori** (required) - Main category selection from 6 categories
- **Kunsttype** (optional) - Subcategory based on selected category
- **Medium** (optional) - Art medium (e.g., "Akryl på lærred")

#### Dynamic Dimensions
Dimension fields change based on selected category:
- **Maleri**: Width, Height, Depth (optional)
- **Skulptur & Keramik**: Height, Width, Depth, Weight
- **Grafik & Kunsttryk**: Width, Height, Depth (optional)
- **Fotografi**: Width, Height, Depth (optional)
- **Digital Kunst**: Pixel dimensions, Aspect ratio, File format
- **Tegning**: Width, Height, Depth (optional)

#### Pricing
- **Pris (DKK)** (required) - Sale price in Danish Kroner
- **AI Prisforslag** button - Get AI-powered pricing recommendation

#### Description
- **Beskrivelse** (optional) - Artwork description
- **Generér beskrivelse** button - AI-generated SEO-optimized description

#### Media
- **Billeder** (required, min 1, max 5) - Drag & drop or click to upload
- **Video URL** (optional) - YouTube video link

### 2. AI Features

#### AI Price Suggestion
- Calls `/api/pricing/advisor` endpoint
- Provides:
  - Recommended price
  - Price range (min-max)
  - Confidence score
  - Market position badge (underpriced/fair/overpriced)
- Requires: Artist, Category, and Medium to be filled

#### SEO Text Generator
- Calls `/api/gallery/generate-description` endpoint
- Generates Danish SEO-optimized description based on:
  - Title
  - Category
  - Art type
  - Medium
  - Dimensions
- Requires: Title and Category to be filled

#### Metadata Validation
- Automatically runs after artwork creation
- Calls `/api/gallery/validate-metadata` endpoint
- Checks for:
  - Unrealistic pricing (< 100 DKK or > 10,000,000 DKK)
  - Missing images
  - Missing or short description
  - Inconsistent dimensions
- Displays warnings with severity levels:
  - **Critical** - Must be fixed
  - **Warning** - Should be reviewed
  - **Info** - Optional improvements

### 3. Image Upload

#### Features
- Drag & drop support
- Click to browse files
- Multiple image selection
- Image preview with thumbnails
- Remove individual images
- Primary image indicator (first image)
- Maximum 5 images
- Supported formats: PNG, JPG, WEBP

#### Storage
- Images uploaded to Supabase Storage bucket: `artwork-images`
- Path structure: `{galleryId}/{timestamp}-{random}.{ext}`
- Public URLs generated automatically

### 4. Security & Permissions

#### RLS (Row Level Security)
- Only gallery owners can upload
- Gallery team members with roles: owner, manager, curator can upload
- Artists must be associated with the gallery
- Artworks created with `gallery_id` reference

#### Validation
- Server-side authentication check
- Permission verification via `canUploadForGallery()`
- Artist dropdown only shows gallery-associated artists
- Form validation for required fields

### 5. Workflow

1. User navigates to `/gallery/dashboard/upload`
2. System checks authentication and permissions
3. Loads gallery-associated artists
4. User fills form fields
5. (Optional) User clicks "AI Prisforslag" for pricing recommendation
6. (Optional) User clicks "Generér beskrivelse" for AI description
7. User uploads images (drag & drop or browse)
8. (Optional) User adds YouTube video URL
9. User submits form
10. Images uploaded to Supabase Storage
11. Artwork created in database with status: `draft`
12. Metadata validation runs automatically
13. User redirected to `/gallery/dashboard/artworks`

## Components

### Main Components

#### `app/gallery/dashboard/upload/page.tsx`
- Server component
- Handles authentication and authorization
- Fetches gallery and artists data
- Renders `UploadArtworkForm`

#### `components/gallery/dashboard/upload-artwork-form.tsx`
- Client component (769 lines)
- Main form with all fields and logic
- Handles state management
- Integrates AI features
- Manages image upload
- Submits artwork data

### Helper Functions

#### `lib/supabase/gallery-upload-queries.ts`
- `getGalleryArtistsForUpload()` - Fetch artists for dropdown
- `canUploadForGallery()` - Check upload permissions
- `validateArtworkMetadata()` - Run metadata validation

### API Endpoints

#### `POST /api/gallery/generate-description`
- Generates SEO-optimized description
- Input: title, category, artType, medium, dimensions
- Output: Generated description text

#### `POST /api/gallery/validate-metadata`
- Validates artwork metadata
- Input: galleryId, artworkId
- Output: hasIssues, issues array

#### `POST /api/pricing/advisor` (existing)
- Provides pricing recommendation
- Input: medium, dimensions, year_created
- Output: recommendation object

## Database Schema

### Tables Used

#### `artworks`
- Stores artwork data
- Fields: title, description, category, tags, price_cents, image_url, status, dimensions, etc.
- RLS: Gallery team can insert/update/delete

#### `galleries`
- Gallery information
- Used to verify ownership

#### `gallery_artists` (if exists)
- Links artists to galleries
- Used for artist dropdown

#### `gallery_metadata_validations`
- Stores validation issues
- Created by `validate_gallery_artwork_metadata()` function

## Edge Cases

### No Artists Available
- Form displays message: "Ingen kunstnere tilknyttet galleriet"
- User must invite artists first
- Submit button remains enabled but validation will fail

### Image Upload Failures
- Individual image upload errors caught
- User notified via toast
- Can retry upload

### AI Feature Failures
- Graceful degradation
- Error messages via toast
- User can continue without AI features

### Metadata Validation Failures
- Non-blocking
- Warnings displayed after creation
- Artwork still created as draft

### Missing Permissions
- Redirect to dashboard
- No error message (silent redirect)

## Testing Checklist

- [ ] Gallery owner can access upload page
- [ ] Non-gallery users redirected
- [ ] Artist dropdown shows only gallery artists
- [ ] Category selection updates dimension fields
- [ ] AI price suggestion works
- [ ] AI description generation works
- [ ] Image drag & drop works
- [ ] Image click-to-browse works
- [ ] Image removal works
- [ ] Maximum 5 images enforced
- [ ] Form validation works
- [ ] Artwork created with correct data
- [ ] Images uploaded to storage
- [ ] Metadata validation runs
- [ ] Redirect to artworks page works
- [ ] Toast notifications display correctly

## Future Improvements

1. **Bulk Upload** - Upload multiple artworks at once
2. **Image Editing** - Crop, rotate, adjust images before upload
3. **Auto-save Draft** - Save progress automatically
4. **Template System** - Save and reuse artwork templates
5. **Batch AI Operations** - Run AI features on multiple fields at once
6. **Advanced Validation** - Image quality check, duplicate detection
7. **Multi-language Support** - Support for English descriptions
8. **Video Upload** - Direct video upload instead of YouTube links

## Related Documentation

- [Gallery Dashboard Implementation](./GALLERY_DASHBOARD_IMPLEMENTATION.md)
- [Gallery Dashboard Artworks](./GALLERY_DASHBOARD_ARTWORKS.md)
- [RLS Security Implementation](../RLS_SECURITY_IMPLEMENTATION.md)
- [Video Embed Implementation](../VIDEO_EMBED_IMPLEMENTATION.md)
