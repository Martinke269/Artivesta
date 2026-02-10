# Gallery Dashboard - AI Insights Page

## Overview

The AI Insights Page provides galleries with AI-powered recommendations and analytics to optimize their artwork portfolio performance. The page displays four key sections with actionable insights based on market data, buyer behavior, and artwork metadata.

**Route:** `/gallery/dashboard/ai-insights`

## Features

### 1. Price Suggestions Section
Displays AI-recommended price adjustments based on market analysis.

### 2. 90-Day Diagnostics Section
Analyzes artworks that have been listed for 90+ days without selling.

### 3. Metadata Issues Section
Identifies artworks with missing or problematic metadata.

### 4. Behavior Insights Section
Provides AI-generated insights based on buyer behavior patterns and market trends.

## Technical Implementation

### File Structure
- `app/gallery/dashboard/ai-insights/page.tsx` - Main page
- `components/gallery/dashboard/ai-insights/` - Section components
- `lib/supabase/gallery-ai-insights-queries.ts` - Data queries
- `app/api/gallery/apply-price-suggestion/route.ts` - API endpoint

### Security
- RLS policies ensure gallery only sees own artworks
- API route validates gallery ownership
- Price changes trigger database triggers

## Testing
All sections include empty states and error handling.

## Status
 Completed and ready for use
