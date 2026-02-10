'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BuyerNotificationSettings } from '@/lib/supabase/buyer-settings-queries';

interface NotificationSettingsProps {
  settings: BuyerNotificationSettings;
  onUpdate: (settings: Partial<BuyerNotificationSettings>) => Promise<void>;
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = async (key: keyof BuyerNotificationSettings, value: boolean) => {
    // Optimistic update
    setLocalSettings((prev) => ({ ...prev, [key]: value }));

    try {
      await onUpdate({ [key]: value });
      toast({
        title: 'Notifikationer opdateret',
        description: 'Dine notifikationsindstillinger er blevet gemt.',
      });
    } catch (error) {
      // Revert on error
      setLocalSettings((prev) => ({ ...prev, [key]: !value }));
      toast({
        title: 'Fejl',
        description: 'Kunne ikke opdatere notifikationer. Prøv igen.',
        variant: 'destructive',
      });
    }
  };

  const notificationOptions = [
    {
      key: 'new_orders' as const,
      label: 'Nye ordrer',
      description: 'Få besked når du har afgivet en ny ordre',
    },
    {
      key: 'new_leasing' as const,
      label: 'Nye leasingaftaler',
      description: 'Få besked når en ny leasingaftale er oprettet',
    },
    {
      key: 'expiring_leases' as const,
      label: 'Udløber snart',
      description: 'Få besked når dine leasingaftaler snart udløber',
    },
    {
      key: 'insurance_warnings' as const,
      label: 'Forsikringsadvarsler',
      description: 'Få besked om forsikringsproblemer eller udløb',
    },
    {
      key: 'payment_failures' as const,
      label: 'Betalingsfejl',
      description: 'Få besked hvis en betaling fejler',
    },
    {
      key: 'system_notifications' as const,
      label: 'Systemmeddelelser',
      description: 'Få besked om vigtige systemopdateringer',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifikationer</CardTitle>
        <CardDescription>
          Vælg hvilke notifikationer du vil modtage via email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between space-x-4 rounded-lg border p-4"
          >
            <div className="flex-1 space-y-1">
              <Label htmlFor={option.key} className="cursor-pointer">
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
            <Switch
              id={option.key}
              checked={localSettings[option.key]}
              onCheckedChange={(checked) => handleToggle(option.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
