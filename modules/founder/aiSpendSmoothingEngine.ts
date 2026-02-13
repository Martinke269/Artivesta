/**
 * AI Spend Smoothing Engine
 * Provides smoothed spending metrics to avoid reactionary decisions based on daily spikes
 */

import { createClient } from '@/utils/supabase/server';

export interface SmoothedMetrics {
  dailyAverage: number;
  weeklyAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
  projectedMonthlySpend: number;
  confidence: number; // 0-1, based on data availability
}

const ART_IS_SAFE_PROJECT_ID = '00000000-0000-0000-0000-000000000002';

/**
 * Get smoothed AI spend metrics using configurable window
 */
export async function getSmoothedMetrics(
  projectId: string = ART_IS_SAFE_PROJECT_ID,
  windowDays?: number
): Promise<SmoothedMetrics> {
  const supabase = await createClient();

  // Get smoothing settings
  const { data: settings } = await supabase
    .from('founder_settings')
    .select('ai_spend_smoothing_enabled, ai_spend_smoothing_window_days')
    .single();

  if (!settings?.ai_spend_smoothing_enabled) {
    // Return raw metrics if smoothing is disabled
    return getRawMetrics(projectId);
  }

  const window = windowDays || settings.ai_spend_smoothing_window_days || 7;

  // Get spend data for the window period
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - window);

  const { data: spendData } = await supabase
    .from('ai_spend_logs')
    .select('amount, created_at')
    .eq('project_id', projectId)
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: true });

  if (!spendData || spendData.length === 0) {
    return {
      dailyAverage: 0,
      weeklyAverage: 0,
      trend: 'stable',
      volatility: 0,
      projectedMonthlySpend: 0,
      confidence: 0,
    };
  }

  // Group by day
  const dailyTotals = new Map<string, number>();
  spendData.forEach((log) => {
    const day = new Date(log.created_at).toISOString().split('T')[0];
    dailyTotals.set(day, (dailyTotals.get(day) || 0) + Number(log.amount));
  });

  // Calculate daily average
  const dailyValues = Array.from(dailyTotals.values());
  const dailyAverage = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;

  // Calculate weekly average (last 7 days)
  const last7Days = Array.from(dailyTotals.entries())
    .slice(-7)
    .map(([_, value]) => value);
  const weeklyAverage = last7Days.length > 0
    ? last7Days.reduce((sum, val) => sum + val, 0) / last7Days.length
    : dailyAverage;

  // Calculate trend (compare first half vs second half of window)
  const midpoint = Math.floor(dailyValues.length / 2);
  const firstHalf = dailyValues.slice(0, midpoint);
  const secondHalf = dailyValues.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const trendThreshold = 0.1; // 10% change
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (secondHalfAvg > firstHalfAvg * (1 + trendThreshold)) {
    trend = 'increasing';
  } else if (secondHalfAvg < firstHalfAvg * (1 - trendThreshold)) {
    trend = 'decreasing';
  }

  // Calculate volatility (coefficient of variation)
  const mean = dailyAverage;
  const variance = dailyValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyValues.length;
  const stdDev = Math.sqrt(variance);
  const volatility = mean > 0 ? stdDev / mean : 0;

  // Project monthly spend
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthlySpend = dailyAverage * daysInMonth;

  // Calculate confidence (based on data availability)
  const confidence = Math.min(dailyValues.length / window, 1);

  return {
    dailyAverage,
    weeklyAverage,
    trend,
    volatility,
    projectedMonthlySpend,
    confidence,
  };
}

/**
 * Get raw (unsmoothed) metrics
 */
async function getRawMetrics(projectId: string): Promise<SmoothedMetrics> {
  const supabase = await createClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { data: todayData } = await supabase
    .from('ai_spend_logs')
    .select('amount')
    .eq('project_id', projectId)
    .gte('created_at', startOfDay.toISOString());

  const dailySpend = todayData?.reduce((sum, log) => sum + Number(log.amount), 0) || 0;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthlySpend = dailySpend * daysInMonth;

  return {
    dailyAverage: dailySpend,
    weeklyAverage: dailySpend,
    trend: 'stable',
    volatility: 0,
    projectedMonthlySpend,
    confidence: 0.1,
  };
}

/**
 * Get smoothed budget recommendation
 * Uses historical data to suggest optimal budget allocation
 */
export async function getSmoothedBudgetRecommendation(
  projectId: string = ART_IS_SAFE_PROJECT_ID
): Promise<{
  recommendedMonthlyBudget: number;
  reasoning: string;
  confidence: number;
}> {
  const metrics = await getSmoothedMetrics(projectId);

  // Base recommendation on projected spend with buffer
  const bufferMultiplier = 1.2; // 20% buffer
  const recommendedBudget = metrics.projectedMonthlySpend * bufferMultiplier;

  let reasoning = `Based on ${Math.round(metrics.confidence * 100)}% data confidence, `;
  
  if (metrics.trend === 'increasing') {
    reasoning += 'spending is trending upward. Consider increasing budget allocation.';
  } else if (metrics.trend === 'decreasing') {
    reasoning += 'spending is trending downward. Current budget may be sufficient.';
  } else {
    reasoning += 'spending is stable. Current projection is reliable.';
  }

  if (metrics.volatility > 0.5) {
    reasoning += ' High volatility detected - recommend larger buffer.';
  }

  return {
    recommendedMonthlyBudget: Math.ceil(recommendedBudget),
    reasoning,
    confidence: metrics.confidence,
  };
}

/**
 * Detect spending anomalies
 */
export async function detectSpendingAnomalies(
  projectId: string = ART_IS_SAFE_PROJECT_ID
): Promise<{
  hasAnomaly: boolean;
  anomalyType?: 'spike' | 'sustained_increase' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  message: string;
}> {
  const supabase = await createClient();
  const metrics = await getSmoothedMetrics(projectId);

  // Get today's spend
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { data: todayData } = await supabase
    .from('ai_spend_logs')
    .select('amount')
    .eq('project_id', projectId)
    .gte('created_at', startOfDay.toISOString());

  const todaySpend = todayData?.reduce((sum, log) => sum + Number(log.amount), 0) || 0;

  // Check for spike (today's spend > 2x daily average)
  if (todaySpend > metrics.dailyAverage * 2 && metrics.dailyAverage > 0) {
    return {
      hasAnomaly: true,
      anomalyType: 'spike',
      severity: todaySpend > metrics.dailyAverage * 3 ? 'high' : 'medium',
      message: `Today's spend (${todaySpend.toFixed(2)}) is ${(todaySpend / metrics.dailyAverage).toFixed(1)}x the daily average`,
    };
  }

  // Check for sustained increase
  if (metrics.trend === 'increasing' && metrics.weeklyAverage > metrics.dailyAverage * 1.5) {
    return {
      hasAnomaly: true,
      anomalyType: 'sustained_increase',
      severity: 'medium',
      message: 'Spending has been consistently increasing over the past week',
    };
  }

  // Check for unusual volatility
  if (metrics.volatility > 1.0) {
    return {
      hasAnomaly: true,
      anomalyType: 'unusual_pattern',
      severity: 'low',
      message: 'Spending pattern is highly volatile and unpredictable',
    };
  }

  return {
    hasAnomaly: false,
    severity: 'low',
    message: 'No anomalies detected',
  };
}

/**
 * Get spending forecast for next N days
 */
export async function getForecast(
  projectId: string = ART_IS_SAFE_PROJECT_ID,
  days: number = 7
): Promise<{
  forecast: Array<{ date: string; predictedSpend: number; confidence: number }>;
  totalPredicted: number;
}> {
  const metrics = await getSmoothedMetrics(projectId);

  const forecast = [];
  const now = new Date();

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(now.getDate() + i);

    // Simple forecast: use smoothed average with trend adjustment
    let predictedSpend = metrics.dailyAverage;

    if (metrics.trend === 'increasing') {
      predictedSpend *= 1 + (0.05 * i); // 5% increase per day
    } else if (metrics.trend === 'decreasing') {
      predictedSpend *= 1 - (0.05 * i); // 5% decrease per day
    }

    // Confidence decreases with distance
    const confidence = metrics.confidence * (1 - (i / (days * 2)));

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      predictedSpend: Math.max(0, predictedSpend),
      confidence: Math.max(0, confidence),
    });
  }

  const totalPredicted = forecast.reduce((sum, day) => sum + day.predictedSpend, 0);

  return {
    forecast,
    totalPredicted,
  };
}
