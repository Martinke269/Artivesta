/**
 * Email Notification Service for Art Is Safe Escrow Platform
 * Handles all email notifications for the offer/escrow flow
 */

import { createClient } from '@/utils/supabase/server';
import { EmailNotificationType } from '@/lib/supabase/offers-types';

// Email templates configuration
const EMAIL_TEMPLATES = {
  offer_created: {
    subject: 'Nyt pristilbud modtaget',
    getContent: (data: any) => `
      <h2>Du har modtaget et nyt pristilbud</h2>
      <p>En køber har sendt et pristilbud på dit kunstværk.</p>
      <p><strong>Tilbudt pris:</strong> ${formatPrice(data.offered_price_cents)} DKK</p>
      <p><strong>Listepris:</strong> ${formatPrice(data.list_price_cents)} DKK</p>
      ${data.message ? `<p><strong>Besked:</strong> ${data.message}</p>` : ''}
      <p><a href="${data.dashboard_url}">Se tilbud i dashboard</a></p>
    `,
  },
  offer_accepted: {
    subject: 'Dit pristilbud er accepteret',
    getContent: (data: any) => `
      <h2>Godt nyt! Dit pristilbud er accepteret</h2>
      <p>Sælgeren har accepteret dit pristilbud.</p>
      <p><strong>Aftalt pris:</strong> ${formatPrice(data.offered_price_cents)} DKK</p>
      <p>Du vil snart modtage et betalingslink.</p>
      <p><a href="${data.dashboard_url}">Se detaljer i dashboard</a></p>
    `,
  },
  offer_rejected: {
    subject: 'Dit pristilbud er afvist',
    getContent: (data: any) => `
      <h2>Dit pristilbud er afvist</h2>
      <p>Sælgeren har desværre afvist dit pristilbud.</p>
      <p><strong>Dit tilbud:</strong> ${formatPrice(data.offered_price_cents)} DKK</p>
      <p>Du kan sende et nyt tilbud hvis du ønsker.</p>
      <p><a href="${data.artwork_url}">Se kunstværk</a></p>
    `,
  },
  payment_link_ready: {
    subject: 'Betalingslink klar - Gennemfør dit køb',
    getContent: (data: any) => `
      <h2>Dit betalingslink er klar</h2>
      <p>Du kan nu gennemføre betalingen for dit kunstværk.</p>
      <p><strong>Beløb:</strong> ${formatPrice(data.amount_cents)} DKK</p>
      <p><strong>Vigtigt:</strong> Pengene holdes sikkert i escrow indtil både du og sælger har godkendt transaktionen.</p>
      <p><a href="${data.payment_link_url}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 6px;">Betal nu</a></p>
      <p><small>Linket udløber om ${data.hours_until_expiry} timer</small></p>
    `,
  },
  payment_received: {
    subject: 'Betaling modtaget - Escrow aktiveret',
    getContent: (data: any) => `
      <h2>Betaling modtaget</h2>
      <p>Køberens betaling er modtaget og holdes sikkert i escrow.</p>
      <p><strong>Beløb:</strong> ${formatPrice(data.amount_cents)} DKK</p>
      <p>Du kan nu levere kunstværket. Når du har leveret, skal du godkende leveringen i dashboard.</p>
      <p><a href="${data.dashboard_url}">Gå til dashboard</a></p>
    `,
  },
  seller_approved: {
    subject: 'Sælger har godkendt levering',
    getContent: (data: any) => `
      <h2>Sælger har godkendt levering</h2>
      <p>Sælgeren har bekræftet at kunstværket er leveret.</p>
      <p>Når du har modtaget kunstværket, skal du godkende modtagelsen i dashboard for at frigive pengene til sælger.</p>
      <p><a href="${data.dashboard_url}">Godkend modtagelse</a></p>
    `,
  },
  buyer_approved: {
    subject: 'Køber har godkendt modtagelse',
    getContent: (data: any) => `
      <h2>Køber har godkendt modtagelse</h2>
      <p>Køberen har bekræftet at kunstværket er modtaget i god stand.</p>
      <p>Pengene vil nu blive frigivet til dig.</p>
      <p><strong>Du modtager:</strong> ${formatPrice(data.seller_amount_cents)} DKK</p>
      <p><a href="${data.dashboard_url}">Se detaljer</a></p>
    `,
  },
  escrow_released: {
    subject: 'Escrow frigivet - Penge overført',
    getContent: (data: any) => `
      <h2>Escrow frigivet</h2>
      <p>Begge parter har godkendt, og pengene er nu frigivet.</p>
      <p><strong>Beløb:</strong> ${formatPrice(data.amount_cents)} DKK</p>
      <p><strong>Platform fee:</strong> ${formatPrice(data.platform_fee_cents)} DKK</p>
      <p><strong>Moms:</strong> ${formatPrice(data.vat_cents)} DKK</p>
      <p>Transaktionen er nu gennemført.</p>
      <p><a href="${data.dashboard_url}">Se kvittering</a></p>
    `,
  },
  price_deviation_alert: {
    subject: '[ADMIN] Prisafvigelse detekteret',
    getContent: (data: any) => `
      <h2>Prisafvigelse Alert</h2>
      <p>Et pristilbud afviger mere end 20% fra listepris.</p>
      <p><strong>Listepris:</strong> ${formatPrice(data.list_price_cents)} DKK</p>
      <p><strong>Tilbudt pris:</strong> ${formatPrice(data.offered_price_cents)} DKK</p>
      <p><strong>Afvigelse:</strong> ${data.deviation_percent}%</p>
      <p><a href="${data.admin_url}">Se i admin panel</a></p>
    `,
  },
  payment_failed: {
    subject: '[ADMIN] Betaling fejlet',
    getContent: (data: any) => `
      <h2>Betaling Fejlet</h2>
      <p>En betaling er fejlet og kræver opmærksomhed.</p>
      <p><strong>Offer ID:</strong> ${data.offer_id}</p>
      <p><strong>Beløb:</strong> ${formatPrice(data.amount_cents)} DKK</p>
      <p><strong>Fejl:</strong> ${data.error_message}</p>
      <p><a href="${data.admin_url}">Se detaljer</a></p>
    `,
  },
  offer_expired: {
    subject: 'Dit pristilbud er udløbet',
    getContent: (data: any) => `
      <h2>Dit pristilbud er udløbet</h2>
      <p>Dit pristilbud er udløbet uden at blive accepteret eller betalt.</p>
      <p><strong>Tilbudt pris:</strong> ${formatPrice(data.offered_price_cents)} DKK</p>
      <p>Du kan sende et nyt tilbud hvis du stadig er interesseret.</p>
      <p><a href="${data.artwork_url}">Se kunstværk</a></p>
    `,
  },
  approval_deadline_warning: {
    subject: 'Påmindelse: Godkend din transaktion',
    getContent: (data: any) => `
      <h2>Påmindelse om godkendelse</h2>
      <p>Din godkendelse er påkrævet for at gennemføre transaktionen.</p>
      <p><strong>Deadline:</strong> ${formatDate(data.deadline)}</p>
      <p>Hvis du ikke godkender inden deadline, vil transaktionen blive markeret som stalled.</p>
      <p><a href="${data.dashboard_url}">Godkend nu</a></p>
    `,
  },
  dispute_created: {
    subject: 'Tvist oprettet for din transaktion',
    getContent: (data: any) => `
      <h2>Tvist oprettet</h2>
      <p>En tvist er blevet oprettet for din transaktion.</p>
      <p><strong>Årsag:</strong> ${data.reason}</p>
      <p>Vores support team vil kontakte dig snarest.</p>
      <p><a href="${data.dashboard_url}">Se detaljer</a></p>
    `,
  },
  dispute_resolved: {
    subject: 'Din tvist er løst',
    getContent: (data: any) => `
      <h2>Tvist løst</h2>
      <p>Tvisten for din transaktion er blevet løst.</p>
      <p><strong>Løsning:</strong> ${data.resolution}</p>
      <p><a href="${data.dashboard_url}">Se detaljer</a></p>
    `,
  },
};

// Helper functions
function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Queue an email notification to be sent
 */
export async function queueEmailNotification(
  recipientId: string,
  notificationType: EmailNotificationType,
  templateData: Record<string, any>,
  offerId?: string
) {
  const supabase = await createClient();

  const template = EMAIL_TEMPLATES[notificationType];
  if (!template) {
    throw new Error(`Unknown notification type: ${notificationType}`);
  }

  const subject = template.subject;

  // Get recipient email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', recipientId)
    .single();

  if (!profile) {
    throw new Error('Recipient not found');
  }

  // Queue notification
  const { data, error } = await supabase
    .from('email_notifications')
    .insert({
      recipient_id: recipientId,
      recipient_email: profile.email,
      notification_type: notificationType,
      subject,
      template_data: templateData,
      offer_id: offerId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to queue email notification:', error);
    throw error;
  }

  return data;
}

/**
 * Send a queued email notification
 * This would integrate with your email provider (SendGrid, Resend, etc.)
 */
export async function sendQueuedEmail(notificationId: string) {
  const supabase = await createClient();

  // Get notification
  const { data: notification, error: fetchError } = await supabase
    .from('email_notifications')
    .select('*')
    .eq('id', notificationId)
    .single();

  if (fetchError || !notification) {
    throw new Error('Notification not found');
  }

  const template = EMAIL_TEMPLATES[notification.notification_type as EmailNotificationType];
  if (!template) {
    throw new Error(`Unknown notification type: ${notification.notification_type}`);
  }

  const htmlContent = template.getContent(notification.template_data);

  try {
    // TODO: Integrate with actual email provider
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Art Is Safe <noreply@artissafe.com>',
    //   to: notification.recipient_email,
    //   subject: notification.subject,
    //   html: htmlContent,
    // });

    // For now, just log
    console.log('Email would be sent:', {
      to: notification.recipient_email,
      subject: notification.subject,
      type: notification.notification_type,
    });

    // Mark as sent
    await supabase
      .from('email_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    return { success: true };
  } catch (error: any) {
    // Mark as failed
    await supabase
      .from('email_notifications')
      .update({
        status: 'failed',
        error_message: error.message,
        retry_count: notification.retry_count + 1,
      })
      .eq('id', notificationId);

    throw error;
  }
}

/**
 * Process pending email notifications
 * This should be called by a cron job
 */
export async function processPendingEmails(limit: number = 10) {
  const supabase = await createClient();

  const { data: notifications, error } = await supabase
    .from('email_notifications')
    .select('*')
    .eq('status', 'pending')
    .lt('retry_count', 3)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !notifications) {
    console.error('Failed to fetch pending notifications:', error);
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const notification of notifications) {
    try {
      await sendQueuedEmail(notification.id);
      processed++;
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);
      failed++;
    }
  }

  return { processed, failed };
}
