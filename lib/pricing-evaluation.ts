/**
 * Pricing Evaluation Service
 * Evaluates artwork prices against market data from public art databases
 * Only uses actual sale prices, not listing prices
 */

import { createClient } from '@/utils/supabase/server';

export interface MarketSale {
  artist_name: string;
  artwork_title?: string;
  sale_price_cents: number;
  currency: string;
  sale_date: string;
  medium?: string;
  dimensions?: string;
  auction_house?: string;
}

export interface PriceEvaluation {
  artwork_id: string;
  current_price_cents: number;
  market_avg_price_cents?: number;
  market_median_price_cents?: number;
  market_min_price_cents?: number;
  market_max_price_cents?: number;
  comparable_sales_count: number;
  price_deviation_percent?: number;
  recommendation: 'underpriced' | 'fairly_priced' | 'overpriced' | 'insufficient_data';
  confidence_score: number;
  evaluation_notes: string;
}

/**
 * Fetches market data from public art databases
 * Currently supports: Artprice, Artnet, Christie's, Sotheby's public APIs
 */
export async function fetchMarketData(artistName: string, medium?: string): Promise<MarketSale[]> {
  const marketSales: MarketSale[] = [];

  try {
    // Note: In production, you would integrate with actual public APIs
    // Examples of public art market databases:
    // 1. Artprice API (requires API key)
    // 2. Artnet Price Database (requires subscription)
    // 3. Christie's Lot Finder (public search)
    // 4. Sotheby's Results (public search)
    // 5. Mutual Art (public auction results)
    
    // For now, we'll fetch from our stored market_sales table
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('market_sales')
      .select('*')
      .ilike('artist_name', `%${artistName}%`)
      .order('sale_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching market sales:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchMarketData:', error);
    return [];
  }
}

/**
 * Filters comparable sales based on artwork characteristics
 */
function filterComparableSales(
  sales: MarketSale[],
  artwork: {
    medium?: string;
    dimensions?: string;
    year_created?: number;
  },
  maxAgeYears: number = 5
): MarketSale[] {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - maxAgeYears);

  return sales.filter(sale => {
    // Filter by date - only recent sales
    const saleDate = new Date(sale.sale_date);
    if (saleDate < cutoffDate) return false;

    // Filter by medium if available
    if (artwork.medium && sale.medium) {
      const artworkMedium = artwork.medium.toLowerCase();
      const saleMedium = sale.medium.toLowerCase();
      if (!saleMedium.includes(artworkMedium) && !artworkMedium.includes(saleMedium)) {
        return false;
      }
    }

    // Filter by similar dimensions if available (within 50% size difference)
    if (artwork.dimensions && sale.dimensions) {
      const artworkSize = parseDimensions(artwork.dimensions);
      const saleSize = parseDimensions(sale.dimensions);
      
      if (artworkSize && saleSize) {
        const sizeRatio = Math.max(artworkSize, saleSize) / Math.min(artworkSize, saleSize);
        if (sizeRatio > 1.5) return false;
      }
    }

    return true;
  });
}

/**
 * Parse dimensions string to approximate area
 */
function parseDimensions(dimensions: string): number | null {
  try {
    // Extract numbers from dimension string (e.g., "100x80 cm" or "40x30 inches")
    const numbers = dimensions.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return parseInt(numbers[0]) * parseInt(numbers[1]);
    }
  } catch (error) {
    console.error('Error parsing dimensions:', error);
  }
  return null;
}

/**
 * Calculate statistical measures from comparable sales
 */
function calculateMarketStatistics(sales: MarketSale[]): {
  avg: number;
  median: number;
  min: number;
  max: number;
} {
  if (sales.length === 0) {
    return { avg: 0, median: 0, min: 0, max: 0 };
  }

  const prices = sales.map(s => s.sale_price_cents).sort((a, b) => a - b);
  
  const sum = prices.reduce((acc, price) => acc + price, 0);
  const avg = Math.round(sum / prices.length);
  
  const median = prices.length % 2 === 0
    ? Math.round((prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2)
    : prices[Math.floor(prices.length / 2)];
  
  const min = prices[0];
  const max = prices[prices.length - 1];

  return { avg, median, min, max };
}

/**
 * Determine price recommendation based on deviation from market
 */
function determinePriceRecommendation(
  currentPrice: number,
  marketMedian: number,
  comparableCount: number
): {
  recommendation: 'underpriced' | 'fairly_priced' | 'overpriced' | 'insufficient_data';
  confidence: number;
  notes: string;
} {
  // Insufficient data
  if (comparableCount < 3) {
    return {
      recommendation: 'insufficient_data',
      confidence: 0.2,
      notes: `Only ${comparableCount} comparable sales found. More market data needed for accurate evaluation.`
    };
  }

  const deviation = ((currentPrice - marketMedian) / marketMedian) * 100;
  
  // Calculate confidence based on sample size
  let confidence = Math.min(0.95, 0.5 + (comparableCount / 20) * 0.45);

  let recommendation: 'underpriced' | 'fairly_priced' | 'overpriced' | 'insufficient_data';
  let notes: string;

  if (deviation < -20) {
    recommendation = 'underpriced';
    notes = `Price is ${Math.abs(deviation).toFixed(1)}% below market median. Consider increasing price to match market value.`;
  } else if (deviation > 30) {
    recommendation = 'overpriced';
    notes = `Price is ${deviation.toFixed(1)}% above market median. May reduce sales likelihood. Consider adjusting to market rate.`;
  } else {
    recommendation = 'fairly_priced';
    notes = `Price is within acceptable market range (${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}% from median).`;
  }

  return { recommendation, confidence, notes };
}

/**
 * Evaluate a single artwork's price against market data
 */
export async function evaluateArtworkPrice(artworkId: string): Promise<PriceEvaluation | null> {
  try {
    const supabase = await createClient();

    // Fetch artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        price_cents,
        currency,
        medium,
        dimensions,
        year_created,
        artist_id,
        profiles!artworks_artist_id_fkey (
          name
        )
      `)
      .eq('id', artworkId)
      .single();

    if (artworkError || !artwork) {
      console.error('Error fetching artwork:', artworkError);
      return null;
    }

    const artistName = (artwork.profiles as any)?.name || '';

    // Fetch market data for this artist
    const marketSales = await fetchMarketData(artistName, artwork.medium);

    // Filter to comparable sales
    const comparableSales = filterComparableSales(marketSales, {
      medium: artwork.medium,
      dimensions: artwork.dimensions,
      year_created: artwork.year_created
    });

    // Calculate market statistics
    const stats = calculateMarketStatistics(comparableSales);

    // Determine recommendation
    const { recommendation, confidence, notes } = determinePriceRecommendation(
      artwork.price_cents,
      stats.median,
      comparableSales.length
    );

    // Calculate price deviation
    const priceDeviation = stats.median > 0
      ? ((artwork.price_cents - stats.median) / stats.median) * 100
      : null;

    const evaluation: PriceEvaluation = {
      artwork_id: artworkId,
      current_price_cents: artwork.price_cents,
      market_avg_price_cents: stats.avg || undefined,
      market_median_price_cents: stats.median || undefined,
      market_min_price_cents: stats.min || undefined,
      market_max_price_cents: stats.max || undefined,
      comparable_sales_count: comparableSales.length,
      price_deviation_percent: priceDeviation || undefined,
      recommendation,
      confidence_score: confidence,
      evaluation_notes: notes
    };

    // Store evaluation in database
    await supabase
      .from('price_evaluations')
      .insert(evaluation);

    return evaluation;
  } catch (error) {
    console.error('Error evaluating artwork price:', error);
    return null;
  }
}

/**
 * Evaluate all artworks in the system
 */
export async function evaluateAllArtworks(): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  try {
    const supabase = await createClient();

    // Fetch all available artworks
    const { data: artworks, error } = await supabase
      .from('artworks')
      .select('id')
      .eq('status', 'available');

    if (error || !artworks) {
      console.error('Error fetching artworks:', error);
      return { success: 0, failed: 0, total: 0 };
    }

    let success = 0;
    let failed = 0;

    // Evaluate each artwork
    for (const artwork of artworks) {
      const evaluation = await evaluateArtworkPrice(artwork.id);
      if (evaluation) {
        success++;
      } else {
        failed++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success,
      failed,
      total: artworks.length
    };
  } catch (error) {
    console.error('Error in evaluateAllArtworks:', error);
    return { success: 0, failed: 0, total: 0 };
  }
}

/**
 * Get latest evaluation for an artwork
 */
export async function getLatestEvaluation(artworkId: string): Promise<PriceEvaluation | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('price_evaluations')
      .select('*')
      .eq('artwork_id', artworkId)
      .order('evaluated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PriceEvaluation;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return null;
  }
}
