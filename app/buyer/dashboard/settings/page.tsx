import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import {
  getBuyerSettings,
  getNotificationSettings,
  getBuyerPaymentInfo,
} from '@/lib/supabase/buyer-settings-queries';
import { SettingsPageClient } from './settings-page-client';

export const metadata = {
  title: 'Indstillinger | Køber Dashboard',
  description: 'Administrer dine virksomhedsoplysninger, notifikationer og sikkerhed',
};

export default async function BuyerSettingsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all settings data
  const [settings, notificationSettings, paymentInfo] = await Promise.all([
    getBuyerSettings(supabase, user.id),
    getNotificationSettings(supabase, user.id),
    getBuyerPaymentInfo(supabase, user.id),
  ]);

  if (!settings) {
    redirect('/buyer/dashboard');
  }

  if (!notificationSettings) {
    redirect('/buyer/dashboard');
  }

  if (!paymentInfo) {
    redirect('/buyer/dashboard');
  }

  return (
    <SettingsPageClient
      settings={settings}
      notificationSettings={notificationSettings}
      paymentInfo={paymentInfo}
    />
  );
}
