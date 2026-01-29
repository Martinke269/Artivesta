/**
 * Pricing Advisor Service
 * Provides pricing recommendations when artists upload new artworks
 */

import { createClient } from '@/utils/supabase/server';

export interface PricingRecommendation {
  suggested_price_cents: number;
  price_range_min_cents: number;
  price_range_max_cents: number;
  confidence: number;
  comparable_sales_count: number;
  reasoning: string;
  market_insights: string[];
}

/**
 * Get pricing recommendation for a new artwork before it's uploaded
 */
export async function getPricingRecommendation(
  artistName: string,
  medium?: string,
  dimensions?: string,
  yearCreated?: number
): Promise<PricingRecommendation | null> {
  try {
    const supabase = await createClient();

    // Fetch market sales for this artist
    const { data: marketSales, error } = await supabase
      .from('market_sales')
      .select('*')
      .ilike('artist_name', `%${artistName}%`)
      .order('sale_date', { ascending: false })
      .limit(100);

    if (error || !marketSales || marketSales.length === 0) {
      // No market data for this artist, try to find similar artists by medium
      if (medium) {
        const { data: similarSales } = await supabase
          .from('market_sales')
          .select('*')
          .ilike('medium', `%${medium}%`)
          .order('sale_date', { ascending: false })
          .limit(50);

        if (similarSales && similarSales.length > 0) {
          return generateRecommendationFromSales(
            similarSales,
            medium,
            dimensions,
            yearCreated,
            false // Not artist-specific
          );
        }
      }

      return null;
    }

    return generateRecommendationFromSales(
      marketSales,
      medium,
      dimensions,
      yearCreated,
      true // Artist-specific
    );
  } catch (error) {
    console.error('Error getting pricing recommendation:', error);
    return null;
  }
}

function generateRecommendationFromSales(
  sales: any[],
  medium?: string,
  dimensions?: string,
  yearCreated?: number,
  isArtistSpecific: boolean = true
): PricingRecommendation {
  // Filter comparable sales
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);

  let comparableSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    if (saleDate < cutoffDate) return false;

    // Filter by medium if provided
    if (medium && sale.medium) {
      const saleMedium = sale.medium.toLowerCase();
      const artworkMedium = medium.toLowerCase();
      if (!saleMedium.includes(artworkMedium) && !artworkMedium.includes(saleMedium)) {
        return false;
      }
    }

    // Filter by similar dimensions if provided
    if (dimensions && sale.dimensions) {
      const artworkSize = parseDimensions(dimensions);
      const saleSize = parseDimensions(sale.dimensions);
      
      if (artworkSize && saleSize) {
        const sizeRatio = Math.max(artworkSize, saleSize) / Math.min(artworkSize, saleSize);
        if (sizeRatio > 1.5) return false;
      }
    }

    return true;
  });

  // If we have too few comparable sales, use all sales
  if (comparableSales.length < 3) {
    comparableSales = sales.slice(0, 20);
  }

  // Calculate statistics
  const prices = comparableSales.map(s => s.sale_price_cents).sort((a, b) => a - b);
  
  if (prices.length === 0) {
    return {
      suggested_price_cents: 0,
      price_range_min_cents: 0,
      price_range_max_cents: 0,
      confidence: 0,
      comparable_sales_count: 0,
      reasoning: 'Ingen markedsdata tilgængelig',
      market_insights: []
    };
  }

  const sum = prices.reduce((acc, price) => acc + price, 0);
  const avg = Math.round(sum / prices.length);
  
  const median = prices.length % 2 === 0
    ? Math.round((prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2)
    : prices[Math.floor(prices.length / 2)];

  // Calculate price range (25th to 75th percentile)
  const q1Index = Math.floor(prices.length * 0.25);
  const q3Index = Math.floor(prices.length * 0.75);
  const priceRangeMin = prices[q1Index];
  const priceRangeMax = prices[q3Index];

  // Calculate confidence based on sample size and recency
  const recentSales = comparableSales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return saleDate >= oneYearAgo;
  }).length;

  let confidence = Math.min(0.95, 0.4 + (comparableSales.length / 20) * 0.3 + (recentSales / comparableSales.length) * 0.25);
  
  if (!isArtistSpecific) {
    confidence *= 0.7; // Lower confidence for non-artist-specific data
  }

  // Generate insights
  const insights: string[] = [];

  if (isArtistSpecific) {
    insights.push(`Baseret på ${comparableSales.length} salg af dine værker`);
  } else {
    insights.push(`Baseret på ${comparableSales.length} salg af lignende værker`);
  }

  if (recentSales > 0) {
    insights.push(`${recentSales} salg inden for det seneste år`);
  }

  const priceVariation = ((priceRangeMax - priceRangeMin) / median) * 100;
  if (priceVariation < 30) {
    insights.push('Stabil prisudvikling på markedet');
  } else if (priceVariation > 70) {
    insights.push('Høj prisvariabilitet - markedet er volatilt');
  }

  // Check for price trends
  const recentPrices = comparableSales
    .filter(sale => {
      const saleDate = new Date(sale.sale_date);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return saleDate >= twoYearsAgo;
    })
    .sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime());

  if (recentPrices.length >= 5) {
    const firstHalf = recentPrices.slice(0, Math.floor(recentPrices.length / 2));
    const secondHalf = recentPrices.slice(Math.floor(recentPrices.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.sale_price_cents, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.sale_price_cents, 0) / secondHalf.length;
    
    const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (trend > 15) {
      insights.push('📈 Stigende pristendens på markedet');
    } else if (trend < -15) {
      insights.push('📉 Faldende pristendens på markedet');
    }
  }

  // Generate reasoning
  let reasoning = '';
  if (isArtistSpecific) {
    reasoning = `Anbefalet pris baseret på dine tidligere salg. Medianprisen for sammenlignelige værker er ${formatPrice(median)}.`;
  } else {
    reasoning = `Anbefalet pris baseret på lignende værker på markedet. Medianprisen er ${formatPrice(median)}.`;
  }

  if (comparableSales.length < 5) {
    reasoning += ' Bemærk: Begrænset markedsdata tilgængelig.';
  }

  return {
    suggested_price_cents: median,
    price_range_min_cents: priceRangeMin,
    price_range_max_cents: priceRangeMax,
    confidence,
    comparable_sales_count: comparableSales.length,
    reasoning,
    market_insights: insights
  };
}

function parseDimensions(dimensions: string): number | null {
  try {
    const numbers = dimensions.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return parseInt(numbers[0]) * parseInt(numbers[1]);
    }
  } catch (error) {
    console.error('Error parsing dimensions:', error);
  }
  return null;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK'
  }).format(cents / 100);
}
