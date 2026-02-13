import { NextRequest, NextResponse } from 'next/server';
import { acceptOffer, getOfferById } from '@/lib/supabase/offers-queries';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/offers/[id]/accept
 * Accept an offer (seller only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const offerId = params.id;

    // Verify offer exists and user is seller
    const offer = await getOfferById(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (offer.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Only seller can accept offer' },
        { status: 403 }
      );
    }

    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'Offer is not pending' },
        { status: 400 }
      );
    }

    // Accept offer
    const acceptedOffer = await acceptOffer(offerId);

    return NextResponse.json({ offer: acceptedOffer });
  } catch (error) {
    console.error('Error accepting offer:', error);
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    );
  }
}
