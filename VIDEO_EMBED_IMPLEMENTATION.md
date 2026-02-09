# Video Embed Implementation

## Overview
This document describes the implementation of YouTube video embedding for artworks, galleries, and artist profiles in ArtIsSafe.

## Implementation Date
February 9, 2026

## Features Implemented

### 1. Database Schema
Added `video_url` fields to three tables:
- `artworks.video_url` - For artwork presentation videos
- `galleries.video_url` - For gallery introduction videos  
- `profiles.video_url` - For artist/user profile videos

**Migration:** `supabase/migrations/add_video_url_fields.sql`

### 2. Video Embed Component
Created a reusable `VideoEmbed` component with the following features:

**Location:** `components/video-embed.tsx`

**Features:**
- ✅ Responsive 16:9 aspect ratio
- ✅ Lazy loading (iframe loads only when user clicks play)
- ✅ YouTube thumbnail preview with play button
- ✅ Automatic YouTube URL detection and ID extraction
- ✅ Support for multiple YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - `https://www.youtube.com/v/VIDEO_ID`
- ✅ Error handling for invalid URLs
- ✅ Accessibility features (ARIA labels)
- ✅ Hover effects and smooth transitions

**Props:**
```typescript
interface VideoEmbedProps {
  url: string          // YouTube video URL
  title?: string       // Optional title for accessibility
  className?: string   // Optional additional CSS classes
}
```

### 3. Upload Form Integration
Updated the artwork upload form to include video URL input:

**Location:** `app/upload/page.tsx`

**Changes:**
- Added `videoUrl` state variable
- Added video URL input field with Danish placeholder text
- Integrated video_url into the artwork insert query
- Positioned after image URL field for logical flow

### 4. Artwork Detail Page
Updated artwork detail pages to display videos:

**Locations:**
- `app/artwork/[id]/page.tsx` (server component)
- `app/artwork/[id]/artwork-detail-client.tsx` (client component)

**Changes:**
- Added `video_url` to Artwork interface
- Restructured layout to accommodate both image and video
- Video displays below the main image when available
- Conditional rendering (only shows if video_url exists)

## Usage Examples

### For Artists (Upload Form)
1. Navigate to `/upload`
2. Fill in artwork details
3. Add image URL from Assets
4. **NEW:** Add YouTube video URL (optional)
5. Submit form

### For Buyers (Artwork Detail)
1. Navigate to artwork detail page
2. View main artwork image
3. **NEW:** If video available, see "Video" section below image
4. Click play button to watch video
5. Video loads with autoplay in responsive iframe

## Technical Details

### YouTube URL Parsing
The component uses a regex pattern to extract video IDs:
```javascript
const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
```

### Lazy Loading Implementation
- Initial state shows YouTube thumbnail image
- Thumbnail URL: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
- Click triggers state change to load iframe
- Iframe URL includes `autoplay=1` and `rel=0` parameters

### Responsive Design
- Uses Tailwind's `aspect-video` utility for 16:9 ratio
- Absolute positioning for iframe to fill container
- Works seamlessly on mobile and desktop

## Future Enhancements (Not Implemented)

The following were explicitly NOT implemented per requirements:
- ❌ YouTube API integration
- ❌ Server-side video uploads
- ❌ Video hosting on ArtIsSafe servers
- ❌ Video transcoding or processing
- ❌ Multiple video support per artwork
- ❌ Video analytics or tracking

## Database Indexes

Created partial indexes for performance:
```sql
CREATE INDEX idx_artworks_video_url ON artworks(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX idx_galleries_video_url ON galleries(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX idx_profiles_video_url ON profiles(video_url) WHERE video_url IS NOT NULL;
```

These indexes only include rows with non-null video URLs, optimizing query performance.

## Security Considerations

- ✅ No direct video file uploads (reduces storage/bandwidth costs)
- ✅ No server-side processing required
- ✅ YouTube handles all video hosting and streaming
- ✅ URL validation prevents invalid embeds
- ✅ Lazy loading reduces initial page load
- ✅ No API keys or authentication required

## Browser Compatibility

The implementation uses standard HTML5 iframe embedding, which is supported by:
- ✅ Chrome/Edge (all recent versions)
- ✅ Firefox (all recent versions)
- ✅ Safari (all recent versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Impact

- **Initial Load:** Minimal (only thumbnail image loads)
- **After Click:** Standard YouTube iframe load time
- **Bandwidth:** Reduced due to lazy loading
- **SEO:** No negative impact (content still indexable)

## Maintenance Notes

### To Add Video Support to Other Entities:
1. Add `video_url TEXT` column to database table
2. Create partial index if needed
3. Add video URL input to relevant form
4. Import and use `<VideoEmbed>` component in detail view
5. Update TypeScript interfaces to include `video_url`

### To Support Additional Video Platforms:
1. Update `extractYouTubeId()` function or create new extraction function
2. Update embed URL generation logic
3. Update thumbnail URL logic (if platform supports it)
4. Test with various URL formats

## Testing Checklist

- [x] Database migration applied successfully
- [x] Video URL field appears in upload form
- [x] Video URL saves to database correctly
- [x] Video displays on artwork detail page
- [x] Lazy loading works (thumbnail → iframe)
- [x] Invalid URLs show error message
- [x] Responsive layout works on mobile
- [x] Play button hover effects work
- [x] Video autoplays after clicking play
- [x] No console errors or warnings

## Related Files

### Created:
- `components/video-embed.tsx`
- `VIDEO_EMBED_IMPLEMENTATION.md` (this file)

### Modified:
- `app/upload/page.tsx`
- `app/artwork/[id]/page.tsx`
- `app/artwork/[id]/artwork-detail-client.tsx`

### Database:
- Migration: `add_video_url_fields` (applied via Supabase MCP)

## Support

For issues or questions about video embedding:
1. Check YouTube URL format is correct
2. Verify video is public (not private/unlisted)
3. Test URL in browser first
4. Check browser console for errors
5. Verify database field is populated

## Conclusion

The video embed feature provides a simple, stable, and user-friendly way for artists to showcase their work through video without requiring complex server infrastructure or API integrations. The implementation follows best practices for performance, accessibility, and user experience.
