'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw } from 'lucide-react';

interface PriceEvaluation {
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
  evaluated_at: string;
}

interface PriceEvaluationCardProps {
  artworkId: string;
  canEvaluate?: boolean;
}

export function PriceEvaluationCard({ artworkId, canEvaluate = false }: PriceEvaluationCardProps) {
  const [evaluation, setEvaluation] = useState<PriceEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/pricing/evaluate?artwork_id=${artworkId}`);
      
      if (response.ok) {
        const data = await response.json();
        setEvaluation(data.evaluation);
      } else if (response.status === 404) {
        setEvaluation(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to fetch evaluation');
      }
    } catch (err) {
      console.error('Error fetching evaluation:', err);
      setError('Failed to fetch evaluation');
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    try {
      setEvaluating(true);
      setError(null);
      const response = await fetch('/api/pricing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork_id: artworkId })
      });

      if (response.ok) {
        const data = await response.json();
        setEvaluation(data.evaluation);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to evaluate price');
      }
    } catch (err) {
      console.error('Error evaluating price:', err);
      setError('Failed to evaluate price');
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, [artworkId]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK'
    }).format(cents / 100);
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'underpriced':
        return <Badge variant="default" className="bg-blue-500">Underpriset</Badge>;
      case 'fairly_priced':
        return <Badge variant="default" className="bg-green-500">Rimeligt priset</Badge>;
      case 'overpriced':
        return <Badge variant="default" className="bg-orange-500">Overpriset</Badge>;
      case 'insufficient_data':
        return <Badge variant="secondary">Utilstrækkelige data</Badge>;
      default:
        return null;
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'underpriced':
        return <TrendingDown className="h-5 w-5 text-blue-500" />;
      case 'fairly_priced':
        return <Minus className="h-5 w-5 text-green-500" />;
      case 'overpriced':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'insufficient_data':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prisevaluering</CardTitle>
          <CardDescription>Indlæser markedsdata...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error && !evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prisevaluering</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {canEvaluate && (
            <Button 
              onClick={runEvaluation} 
              disabled={evaluating}
              className="mt-4"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Evaluerer...
                </>
              ) : (
                'Kør prisevaluering'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prisevaluering</CardTitle>
          <CardDescription>
            Ingen evaluering tilgængelig endnu
          </CardDescription>
        </CardHeader>
        {canEvaluate && (
          <CardContent>
            <Button 
              onClick={runEvaluation} 
              disabled={evaluating}
            >
              {evaluating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Evaluerer...
                </>
              ) : (
                'Kør prisevaluering'
              )}
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getRecommendationIcon(evaluation.recommendation)}
              Prisevaluering
            </CardTitle>
            <CardDescription>
              Baseret på {evaluation.comparable_sales_count} sammenlignelige salg
            </CardDescription>
          </div>
          {getRecommendationBadge(evaluation.recommendation)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nuværende pris</p>
            <p className="text-2xl font-bold">
              {formatPrice(evaluation.current_price_cents)}
            </p>
          </div>
          {evaluation.market_median_price_cents && (
            <div>
              <p className="text-sm text-muted-foreground">Markedsmedian</p>
              <p className="text-2xl font-bold">
                {formatPrice(evaluation.market_median_price_cents)}
              </p>
            </div>
          )}
        </div>

        {evaluation.price_deviation_percent !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground">Prisafvigelse</p>
            <p className={`text-lg font-semibold ${
              evaluation.price_deviation_percent < -20 ? 'text-blue-500' :
              evaluation.price_deviation_percent > 30 ? 'text-orange-500' :
              'text-green-500'
            }`}>
              {evaluation.price_deviation_percent > 0 ? '+' : ''}
              {evaluation.price_deviation_percent.toFixed(1)}%
            </p>
          </div>
        )}

        {evaluation.market_avg_price_cents && evaluation.market_min_price_cents && evaluation.market_max_price_cents && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Markedsinterval</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Min</p>
                <p className="font-medium">{formatPrice(evaluation.market_min_price_cents)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gennemsnit</p>
                <p className="font-medium">{formatPrice(evaluation.market_avg_price_cents)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max</p>
                <p className="font-medium">{formatPrice(evaluation.market_max_price_cents)}</p>
              </div>
            </div>
          </div>
        )}

        <Alert>
          <AlertDescription>{evaluation.evaluation_notes}</AlertDescription>
        </Alert>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Tillid: {(evaluation.confidence_score * 100).toFixed(0)}%
          </span>
          <span>
            Evalueret: {new Date(evaluation.evaluated_at).toLocaleDateString('da-DK')}
          </span>
        </div>

        {canEvaluate && (
          <Button 
            onClick={runEvaluation} 
            disabled={evaluating}
            variant="outline"
            className="w-full"
          >
            {evaluating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Evaluerer...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Opdater evaluering
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
