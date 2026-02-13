import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Cron job to process offer and escrow timeouts
 * Should be called every hour via Vercel Cron or similar
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const results = {
      expired_offers: 0,
      stalled_approvals: 0,
      errors: [] as string[],
    };

    // 1. Expire old offers
    try {
      const { data: expiredOffers, error: expireError } = await supabase.rpc(
        'expire_old_offers'
      );

      if (expireError) {
        results.errors.push(`Expire offers error: ${expireError.message}`);
      } else {
        results.expired_offers = expiredOffers || 0;
      }
    } catch (error: any) {
      results.errors.push(`Expire offers exception: ${error.message}`);
    }

    // 2. Check for stalled approvals
    try {
      const { data: stalledCount, error: stalledError } = await supabase.rpc(
        'check_stalled_approvals'
      );

      if (stalledError) {
        results.errors.push(`Stalled approvals error: ${stalledError.message}`);
      } else {
        results.stalled_approvals = stalledCount || 0;
      }
    } catch (error: any) {
      results.errors.push(`Stalled approvals exception: ${error.message}`);
    }

    // 3. Send deadline warnings (7 days before deadline)
    try {
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 7);

      const { data: approachingDeadlines } = await supabase
        .from('escrow_approvals')
        .select('*, offer:offers(*)')
        .lt('approval_deadline', warningDate.toISOString())
        .eq('both_approved', false)
        .eq('is_stalled', false);

      if (approachingDeadlines) {
        for (const approval of approachingDeadlines) {
          const offer = approval.offer as any;
          
          // Send warning to buyer if not approved
          if (!approval.buyer_approved) {
            await supabase.rpc('queue_email_notification', {
              p_recipient_id: offer.buyer_id,
              p_notification_type: 'approval_deadline_warning',
              p_subject: 'Påmindelse: Godkend din transaktion',
              p_template_data: {
                offer_id: offer.id,
                deadline: approval.approval_deadline,
                dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/offers/${offer.id}`,
              },
              p_offer_id: offer.id,
            });
          }

          // Send warning to seller if not approved
          if (!approval.seller_approved) {
            await supabase.rpc('queue_email_notification', {
              p_recipient_id: offer.seller_id,
              p_notification_type: 'approval_deadline_warning',
              p_subject: 'Påmindelse: Godkend din transaktion',
              p_template_data: {
                offer_id: offer.id,
                deadline: approval.approval_deadline,
                dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/offers/${offer.id}`,
              },
              p_offer_id: offer.id,
            });
          }
        }
      }
    } catch (error: any) {
      results.errors.push(`Deadline warnings exception: ${error.message}`);
    }

    console.log('Timeout processing completed:', results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error processing timeouts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
