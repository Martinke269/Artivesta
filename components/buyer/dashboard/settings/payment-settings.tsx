'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, FileText, Building2 } from 'lucide-react';
import { BuyerPaymentInfo } from '@/lib/supabase/buyer-settings-queries';

interface PaymentSettingsProps {
  paymentInfo: BuyerPaymentInfo;
}

export function PaymentSettings({ paymentInfo }: PaymentSettingsProps) {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Betalingskort',
      icon: CreditCard,
      description: 'Betal med Visa, Mastercard eller andre kort',
    },
    {
      id: 'invoice',
      name: 'Faktura',
      icon: FileText,
      description: 'Modtag faktura med betalingsfrist',
    },
    {
      id: 'bank_transfer',
      name: 'Bankoverførsel',
      icon: Building2,
      description: 'Betal direkte via bankoverførsel',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Betalingsmetode</CardTitle>
          <CardDescription>
            Vælg din foretrukne betalingsmetode for fremtidige køb
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isActive = paymentInfo.default_payment_method === method.id;

            return (
              <div
                key={method.id}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  isActive ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.name}</p>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Standard
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  {isActive ? 'Valgt' : 'Vælg'}
                </Button>
              </div>
            );
          })}
          <p className="text-sm text-muted-foreground">
            Ændring af betalingsmetode kommer snart
          </p>
        </CardContent>
      </Card>

      {/* Invoice Information */}
      <Card>
        <CardHeader>
          <CardTitle>Fakturaoplysninger</CardTitle>
          <CardDescription>
            Oplysninger der bruges til fakturering
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                CVR-nummer
              </p>
              <p className="text-sm">
                {paymentInfo.invoice_cvr || 'Ikke angivet'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Faktura email
              </p>
              <p className="text-sm">
                {paymentInfo.invoice_email || 'Ikke angivet'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Faktura adresse
            </p>
            <p className="text-sm">
              {paymentInfo.invoice_address || 'Ikke angivet'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Betalingshistorik</CardTitle>
          <CardDescription>
            Seneste betalinger og transaktioner
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentInfo.last_payment_date && paymentInfo.last_payment_amount ? (
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Seneste betaling</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(paymentInfo.last_payment_date)}
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(paymentInfo.last_payment_amount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-sm font-semibold">
                Ingen betalinger endnu
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dine betalinger vil blive vist her
              </p>
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="w-full" disabled>
              Se fuld betalingshistorik
            </Button>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Fuld historik kommer snart
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
