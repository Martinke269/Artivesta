import { NextRequest, NextResponse } from 'next/server';
import { processPendingEmails } from '@/lib/email/email-service';

export const dynamic = 'force-dynamic';

/**
 * Cron job to send pending email notifications
 * Should be called every 5-10 minutes via Vercel Cron or similar
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process up to 50 emails per run
    const results = await processPendingEmails(50);

    console.log('Email processing completed:', results);

    return NextResponse.json({
      success: true,
      processed: results.processed,
      failed: results.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error processing emails:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
