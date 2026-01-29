import { NextRequest, NextResponse } from 'next/server';
import { evaluateAllArtworks } from '@/lib/pricing-evaluation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/evaluate-prices
 * Scheduled job to evaluate all artwork prices
 * 
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * to periodically evaluate all artworks against market data.
 * 
 * Recommended schedule: Daily at 2 AM UTC
 * 
 * To secure this endpoint, you can:
 * 1. Use Vercel Cron (automatically secured)
 * 2. Add an authorization header check
 * 3. Use IP whitelisting
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled price evaluation...');
    const startTime = Date.now();

    // Run evaluation for all artworks
    const result = await evaluateAllArtworks();

    const duration = Date.now() - startTime;

    console.log('Price evaluation completed:', {
      ...result,
      duration_ms: duration
    });

    return NextResponse.json({
      message: 'Price evaluation completed',
      ...result,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron evaluate-prices:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
