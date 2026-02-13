import { NextRequest, NextResponse } from 'next/server';
import { rejectOffer, getOfferById } from '@/lib/supabase/offers-queries';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/offers/[id]/reject
 * Reject an offer (seller only)
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
        { error: 'Only seller can reject offer' },
        { status: 403 }
      );
    }

    if (offer.status !== 'pending') {
      return NextResponse.json(
        { error: 'Offer is not pending' },
        { status: 400 }
      );
    }

    // Reject offer
    const rejectedOffer = await rejectOffer(offerId);

    return NextResponse.json({ offer: rejectedOffer });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    return NextResponse.json(
      { error: 'Failed to reject offer' },
      { status: 500 }
    );
  }
}
