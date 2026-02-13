import { NextRequest, NextResponse } from 'next/server';
import { createOffer } from '@/lib/supabase/offers-queries';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/offers
 * Create a new price offer
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { artwork_id, seller_id, list_price_cents, offered_price_cents, message } = body;

    // Validation
    if (!artwork_id || !seller_id || !list_price_cents || !offered_price_cents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (offered_price_cents <= 0 || list_price_cents <= 0) {
      return NextResponse.json(
        { error: 'Prices must be positive' },
        { status: 400 }
      );
    }

    if (seller_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot make offer on your own artwork' },
        { status: 400 }
      );
    }

    // Create offer
    const offer = await createOffer({
      artwork_id,
      seller_id,
      list_price_cents,
      offered_price_cents,
      message,
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
