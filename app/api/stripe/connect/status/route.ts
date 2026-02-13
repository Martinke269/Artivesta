import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAccountDetails, canReceivePayouts, getAccountRequirements } from '@/lib/stripe/stripe-connect';
import { upsertStripeAccount } from '@/lib/supabase/stripe-accounts-queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stripe/connect/status?galleryId=xxx
 * Gets the current status of a gallery's Stripe Connect account
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

    // Get Stripe account from database
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('gallery_id', galleryId)
      .single();

    if (!stripeAccount || !stripeAccount.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        message: 'No Stripe account connected',
      });
    }

    // Fetch latest account details from Stripe
    const account = await getAccountDetails(stripeAccount.stripe_account_id);

    // Update database with latest status
    await upsertStripeAccount({
      galleryId,
      stripeAccountId: account.id,
      onboardingStatus: account.details_submitted ? 'complete' : 'incomplete',
      payoutsEnabled: account.payouts_enabled || false,
      chargesEnabled: account.charges_enabled || false,
      detailsSubmitted: account.details_submitted || false,
      requirements: account.requirements,
      capabilities: account.capabilities,
    });

    const requirements = getAccountRequirements(account);
    const canPayout = canReceivePayouts(account);

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      canReceivePayouts: canPayout,
      requirements: {
        currentlyDue: requirements.currentlyDue,
        eventuallyDue: requirements.eventuallyDue,
        pastDue: requirements.pastDue,
        pendingVerification: requirements.pendingVerification,
        disabledReason: requirements.disabled,
      },
      country: account.country,
      defaultCurrency: account.default_currency,
    });
  } catch (error) {
    console.error('Stripe status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch account status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
