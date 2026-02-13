import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { queueEmailNotification } from '@/lib/email/email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { offer_id, reason, description, attachments = [] } = body;

    if (!offer_id || !reason || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get offer to verify user is buyer or seller
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*, buyer:profiles!buyer_id(email), seller:profiles!seller_id(email)')
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    // Verify user is buyer or seller
    const isBuyer = offer.buyer_id === user.id;
    const isSeller = offer.seller_id === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const initiatorRole = isBuyer ? 'buyer' : 'seller';

    // Create dispute
    const { data: dispute, error: disputeError } = await supabase
      .from('offer_disputes')
      .insert({
        offer_id,
        initiator_id: user.id,
        initiator_role: initiatorRole,
        reason,
        description,
        attachments,
      })
      .select()
      .single();

    if (disputeError) {
      console.error('Failed to create dispute:', disputeError);
      return NextResponse.json(
        { error: 'Failed to create dispute' },
        { status: 500 }
      );
    }

    // Update offer status to disputed
    await supabase
      .from('offers')
      .update({ enhanced_status: 'disputed' })
      .eq('id', offer_id);

    // Create admin alert
    await supabase.from('admin_alerts').insert({
      alert_type: 'escrow_issue',
      severity: 'high',
      title: 'Ny tvist oprettet',
      message: `En ${initiatorRole} har oprettet en tvist for offer ${offer_id}`,
      offer_id,
      metadata: {
        dispute_id: dispute.id,
        reason,
        initiator_role: initiatorRole,
      },
    });

    // Queue email notifications
    const otherPartyId = isBuyer ? offer.seller_id : offer.buyer_id;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Notify other party
    await queueEmailNotification(
      otherPartyId,
      'dispute_created',
      {
        offer_id,
        reason,
        dashboard_url: `${siteUrl}/dashboard/offers/${offer_id}`,
      },
      offer_id
    );

    // Notify admin (get first admin user)
    const { data: adminUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      await queueEmailNotification(
        adminUser.id,
        'dispute_created',
        {
          offer_id,
          reason,
          initiator_role: initiatorRole,
          dashboard_url: `${siteUrl}/admin/disputes/${dispute.id}`,
        },
        offer_id
      );
    }

    return NextResponse.json({ dispute });
  } catch (error: any) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
