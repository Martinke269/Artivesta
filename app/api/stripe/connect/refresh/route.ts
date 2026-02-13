import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAccountLink } from '@/lib/stripe/stripe-connect';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/connect/refresh
 * Creates a new onboarding link for incomplete onboarding
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { galleryId } = body;

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Missing required field: galleryId' },
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
      return NextResponse.json(
        { error: 'No Stripe account found. Please start onboarding first.' },
        { status: 404 }
      );
    }

    // Create new account link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const accountLink = await createAccountLink({
      accountId: stripeAccount.stripe_account_id,
      refreshUrl: `${baseUrl}/gallery/dashboard/settings?tab=payments&refresh=true`,
      returnUrl: `${baseUrl}/gallery/dashboard/settings?tab=payments&success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Stripe refresh error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create refresh link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
