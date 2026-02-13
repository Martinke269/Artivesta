import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  createConnectAccount,
  createAccountLink,
} from '@/lib/stripe/stripe-connect';
import { upsertStripeAccount } from '@/lib/supabase/stripe-accounts-queries';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/connect/onboard
 * Creates a Stripe Connect account and returns onboarding URL
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
    const { galleryId, email } = body;

    if (!galleryId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: galleryId, email' },
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

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id, onboarding_complete')
      .eq('gallery_id', galleryId)
      .single();

    let stripeAccountId: string;

    if (existingAccount && existingAccount.stripe_account_id) {
      stripeAccountId = existingAccount.stripe_account_id;
    } else {
      // Create new Stripe Connect account
      const account = await createConnectAccount({
        email,
        country: 'DK',
        businessType: 'company',
      });

      stripeAccountId = account.id;

      // Save to database
      await upsertStripeAccount({
        galleryId,
        stripeAccountId: account.id,
        onboardingStatus: 'pending',
        payoutsEnabled: false,
        chargesEnabled: false,
        detailsSubmitted: false,
        email,
        businessType: 'company',
      });
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const accountLink = await createAccountLink({
      accountId: stripeAccountId,
      refreshUrl: `${baseUrl}/gallery/dashboard/settings?tab=payments&refresh=true`,
      returnUrl: `${baseUrl}/gallery/dashboard/settings?tab=payments&success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId: stripeAccountId,
    });
  } catch (error) {
    console.error('Stripe onboarding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create onboarding link',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
