'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyInfoForm } from '@/components/buyer/dashboard/settings/company-info-form';
import { NotificationSettings } from '@/components/buyer/dashboard/settings/notification-settings';
import { PaymentSettings } from '@/components/buyer/dashboard/settings/payment-settings';
import { SecuritySettings } from '@/components/buyer/dashboard/settings/security-settings';
import {
  BuyerSettings,
  BuyerNotificationSettings,
  BuyerPaymentInfo,
  updateBuyerInfo,
  updateNotificationSettings,
} from '@/lib/supabase/buyer-settings-queries';
import { createClient } from '@/utils/supabase/client';
import { Building2, Bell, CreditCard, Shield } from 'lucide-react';

interface SettingsPageClientProps {
  settings: BuyerSettings;
  notificationSettings: BuyerNotificationSettings;
  paymentInfo: BuyerPaymentInfo;
}

export function SettingsPageClient({
  settings,
  notificationSettings,
  paymentInfo,
}: SettingsPageClientProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('company');

  const handleUpdateCompanyInfo = async (updates: Partial<BuyerSettings>) => {
    const result = await updateBuyerInfo(supabase, settings.id, updates);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleUpdateNotifications = async (
    updates: Partial<BuyerNotificationSettings>
  ) => {
    const result = await updateNotificationSettings(
      supabase,
      settings.id,
      updates
    );
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Indstillinger</h1>
        <p className="text-muted-foreground">
          Administrer dine virksomhedsoplysninger, notifikationer og sikkerhed
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Virksomhed</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifikationer</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Betaling</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sikkerhed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanyInfoForm
            settings={settings}
            onUpdate={handleUpdateCompanyInfo}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings
            settings={notificationSettings}
            onUpdate={handleUpdateNotifications}
          />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <PaymentSettings paymentInfo={paymentInfo} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
