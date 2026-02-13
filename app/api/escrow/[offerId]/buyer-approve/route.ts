import { NextRequest, NextResponse } from 'next/server';
import { buyerApproveEscrow, getOfferById, getEscrowApproval } from '@/lib/supabase/offers-queries';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/escrow/[offerId]/buyer-approve
 * Buyer approves escrow release
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
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

    const offerId = params.offerId;

    // Verify offer exists and user is buyer
    const offer = await getOfferById(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (offer.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only buyer can approve' },
        { status: 403 }
      );
    }

    // Verify payment has been made
    if (!offer.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment not completed yet' },
        { status: 400 }
      );
    }

    // Check if escrow approval exists
    const existingApproval = await getEscrowApproval(offerId);
    if (!existingApproval) {
      return NextResponse.json(
        { error: 'Escrow approval not found' },
        { status: 404 }
      );
    }

    if (existingApproval.buyer_approved) {
      return NextResponse.json(
        { error: 'Buyer has already approved' },
        { status: 400 }
      );
    }

    if (existingApproval.funds_released) {
      return NextResponse.json(
        { error: 'Funds have already been released' },
        { status: 400 }
      );
    }

    // Approve escrow
    const approval = await buyerApproveEscrow(offerId);

    return NextResponse.json({
      approval,
      message: 'Buyer approval recorded',
      both_approved: approval.both_approved,
    });
  } catch (error) {
    console.error('Error approving escrow (buyer):', error);
    return NextResponse.json(
      { error: 'Failed to approve escrow' },
      { status: 500 }
    );
  }
}
