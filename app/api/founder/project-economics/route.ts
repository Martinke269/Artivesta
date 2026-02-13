import { NextResponse } from 'next/server';
import { getProjectEconomics } from '@/modules/founder/aiSpendGuard';
import { getSmoothedMetrics, detectSpendingAnomalies, getForecast } from '@/modules/founder/aiSpendSmoothingEngine';

export const dynamic = 'force-dynamic';

const ART_IS_SAFE_PROJECT_ID = '00000000-0000-0000-0000-000000000002';

/**
 * GET /api/founder/project-economics
 * Returns comprehensive economic metrics for Art Is Safe project
 */
export async function GET() {
  try {
    // Get all economic data
    const [economics, smoothedMetrics, anomalies, forecast] = await Promise.all([
      getProjectEconomics(ART_IS_SAFE_PROJECT_ID),
      getSmoothedMetrics(ART_IS_SAFE_PROJECT_ID),
      detectSpendingAnomalies(ART_IS_SAFE_PROJECT_ID),
      getForecast(ART_IS_SAFE_PROJECT_ID, 7),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        // Core economics
        economics,
        
        // Smoothed metrics
        smoothedMetrics,
        
        // Anomaly detection
        anomalies,
        
        // 7-day forecast
        forecast,
        
        // Summary metrics for dashboard
        summary: {
          aiSpendStatus: getSpendStatus(economics.aiBudgetPercentageUsed),
          bufferStatus: getBufferStatus(economics.aiBufferRemaining, economics.aiEffectiveBudget),
          runwayStatus: getRunwayStatus(economics.runwayMonths),
          trendStatus: smoothedMetrics.trend,
          hasAnomalies: anomalies.hasAnomaly,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching project economics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project economics',
      },
      { status: 500 }
    );
  }
}

function getSpendStatus(percentageUsed: number): 'healthy' | 'warning' | 'critical' {
  if (percentageUsed < 70) return 'healthy';
  if (percentageUsed < 90) return 'warning';
  return 'critical';
}

function getBufferStatus(
  bufferRemaining: number,
  effectiveBudget: number
): 'healthy' | 'warning' | 'critical' {
  const bufferPercentage = (bufferRemaining / effectiveBudget) * 100;
  if (bufferPercentage > 15) return 'healthy';
  if (bufferPercentage > 5) return 'warning';
  return 'critical';
}

function getRunwayStatus(runwayMonths: number | null): 'healthy' | 'warning' | 'critical' {
  if (runwayMonths === null) return 'healthy'; // Infinite runway
  if (runwayMonths > 6) return 'healthy';
  if (runwayMonths > 3) return 'warning';
  return 'critical';
}
