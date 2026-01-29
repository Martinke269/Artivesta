'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Info, Sparkles } from 'lucide-react';

interface PricingRecommendation {
  suggested_price_cents: number;
  price_range_min_cents: number;
  price_range_max_cents: number;
  confidence: number;
  comparable_sales_count: number;
  reasoning: string;
  market_insights: string[];
}

interface PricingAdvisorWidgetProps {
  medium?: string;
  dimensions?: string;
  yearCreated?: number;
  onPriceSelect?: (priceCents: number) => void;
}

export function PricingAdvisorWidget({
  medium,
  dimensions,
  yearCreated,
  onPriceSelect
}: PricingAdvisorWidgetProps) {
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pricing/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medium,
          dimensions,
          year_created: yearCreated
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.recommendation) {
          setRecommendation(data.recommendation);
        } else {
          setError('Ingen markedsdata tilgængelig for at give en anbefaling');
        }
      } else {
        setError(data.error || 'Kunne ikke hente prisanbefaling');
      }
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Kunne ikke hente prisanbefaling');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return 'Høj tillid';
    if (confidence >= 0.5) return 'Moderat tillid';
    return 'Lav tillid';
  };

  if (!recommendation && !error) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Prisrådgivning
          </CardTitle>
          <CardDescription>
            Få en anbefalet pris baseret på markedsdata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={getRecommendation} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Analyserer markedet...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Få prisanbefaling
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Baseret på faktiske salgspriser fra offentlige kunstdatabaser
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Prisrådgivning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={getRecommendation} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Prøv igen
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) return null;

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Prisanbefaling
          </CardTitle>
          <Badge 
            variant="outline" 
            className={getConfidenceColor(recommendation.confidence)}
          >
            {getConfidenceLabel(recommendation.confidence)} ({(recommendation.confidence * 100).toFixed(0)}%)
          </Badge>
        </div>
        <CardDescription>
          {recommendation.reasoning}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suggested Price */}
        <div className="text-center p-6 bg-background rounded-lg border-2 border-primary">
          <p className="text-sm text-muted-foreground mb-2">Anbefalet pris</p>
          <p className="text-4xl font-bold text-primary">
            {formatPrice(recommendation.suggested_price_cents)}
          </p>
          {onPriceSelect && (
            <Button 
              onClick={() => onPriceSelect(recommendation.suggested_price_cents)}
              className="mt-4"
              size="sm"
            >
              Brug denne pris
            </Button>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Markedsinterval
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Minimum</p>
              <p className="text-lg font-semibold">
                {formatPrice(recommendation.price_range_min_cents)}
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Maximum</p>
              <p className="text-lg font-semibold">
                {formatPrice(recommendation.price_range_max_cents)}
              </p>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        {recommendation.market_insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Markedsindsigt</p>
            <div className="space-y-2">
              {recommendation.market_insights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 text-sm p-3 bg-background rounded-lg border"
                >
                  <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Baseret på {recommendation.comparable_sales_count} sammenlignelige salg fra offentlige kunstdatabaser
        </div>

        {/* Refresh Button */}
        <Button 
          onClick={getRecommendation} 
          disabled={loading}
          variant="outline"
          className="w-full"
          size="sm"
        >
          {loading ? 'Opdaterer...' : 'Opdater anbefaling'}
        </Button>
      </CardContent>
    </Card>
  );
}
