import { NextRequest, NextResponse } from 'next/server';
import { getPendingEmailNotifications, markNotificationEmailSent } from '@/lib/supabase/art-briefs-queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending notifications
    const notifications = await getPendingEmailNotifications();

    let sentCount = 0;
    let errorCount = 0;

    // Send emails for each notification
    for (const notification of notifications) {
      try {
        const user = notification.user as any;
        const brief = notification.brief as any;

        // Prepare email content based on notification type
        const subject = notification.title;
        const html = `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <hr>
          <h3>Kunstbrief detaljer:</h3>
          <ul>
            <li><strong>Type:</strong> ${brief.art_type || 'Ikke angivet'}</li>
            <li><strong>Stil:</strong> ${brief.style || 'Ikke angivet'}</li>
            <li><strong>Budget:</strong> ${brief.budget_min_dkk ? `${brief.budget_min_dkk} - ${brief.budget_max_dkk} DKK` : 'Ikke angivet'}</li>
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/art-briefs/${brief.id}">Se kunstbrief</a></p>
        `;

        // TODO: Integrate with actual email provider (Resend, SendGrid, etc.)
        // For now, just log the email that would be sent
        console.log('Email would be sent:', {
          to: user.email,
          subject,
          html,
        });

        // Mark as sent
        await markNotificationEmailSent(notification.id);
        sentCount++;
      } catch (error) {
        console.error(`Error sending email for notification ${notification.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Error in send-art-brief-emails cron:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
