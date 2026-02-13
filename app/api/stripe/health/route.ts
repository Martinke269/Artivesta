import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stripe/health
 * Returns Stripe Connect health metrics for a gallery
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get gallery ID from query params
    const searchParams = request.nextUrl.searchParams;
    const galleryId = searchParams.get('galleryId');

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Missing required parameter: galleryId' },
        { status: 400 }
      );
    }

    // Verify user has access to this gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, owner_id')
      .eq('id', galleryId)
      .single();

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    if (gallery.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get last webhook timestamp
    const { data: lastWebhook } = await supabase
      .from('stripe_events')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Count failed events in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: failedEventsCount } = await supabase
      .from('stripe_events')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false)
      .gte('created_at', oneDayAgo);

    // Count pending payouts
    const { count: pendingPayoutsCount } = await supabase
      .from('stripe_payouts')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
      .in('status', ['pending', 'in_transit']);

    // Count unresolved alerts
    const { count: unresolvedAlertsCount } = await supabase
      .from('stripe_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
      .eq('resolved', false);

    // Count critical unresolved alerts
    const { count: criticalAlertsCount } = await supabase
      .from('stripe_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId)
      .eq('resolved', false)
      .eq('severity', 'critical');

    // Get account status
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('payouts_enabled, charges_enabled, onboarding_status, updated_at')
      .eq('gallery_id', galleryId)
      .single();

    // Calculate health score (0-100)
    let healthScore = 100;
    
    if (!stripeAccount?.payouts_enabled) healthScore -= 30;
    if (!stripeAccount?.charges_enabled) healthScore -= 30;
    if ((failedEventsCount || 0) > 0) healthScore -= 10;
    if ((criticalAlertsCount || 0) > 0) healthScore -= 20;
    if ((unresolvedAlertsCount || 0) > 5) healthScore -= 10;

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical';
    if (healthScore >= 80) {
      status = 'healthy';
    } else if (healthScore >= 50) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return NextResponse.json({
      success: true,
      health: {
        status,
        score: Math.max(0, healthScore),
        lastWebhookAt: lastWebhook?.created_at || null,
        metrics: {
          failedEvents: failedEventsCount || 0,
          pendingPayouts: pendingPayoutsCount || 0,
          unresolvedAlerts: unresolvedAlertsCount || 0,
          criticalAlerts: criticalAlertsCount || 0,
        },
        account: {
          payoutsEnabled: stripeAccount?.payouts_enabled || false,
          chargesEnabled: stripeAccount?.charges_enabled || false,
          onboardingStatus: stripeAccount?.onboarding_status || 'not_started',
          lastUpdated: stripeAccount?.updated_at || null,
        },
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch health metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
