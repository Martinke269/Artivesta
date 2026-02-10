'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, Key, Smartphone } from 'lucide-react';

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Din rolle</CardTitle>
          <CardDescription>
            Information om din adgang og rettigheder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Køber</p>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Du har fuld adgang til at købe kunst og administrere dine ordrer
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 text-sm font-medium">Dine rettigheder:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Køb og leas kunstværker</li>
              <li>• Administrer ordrer og leasingaftaler</li>
              <li>• Se fakturaer og betalinger</li>
              <li>• Administrer forsikringer</li>
              <li>• Opdater virksomhedsoplysninger</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Adgangskode</CardTitle>
          <CardDescription>
            Administrer din adgangskode og login-sikkerhed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-2">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Adgangskode</p>
                <p className="text-sm text-muted-foreground">
                  Sidst ændret for mere end 90 dage siden
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Skift adgangskode
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Ændring af adgangskode kommer snart
          </p>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>To-faktor autentificering (2FA)</CardTitle>
          <CardDescription>
            Tilføj et ekstra lag af sikkerhed til din konto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-muted p-2">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">2FA via SMS eller app</p>
                  <Badge variant="outline">Kommer snart</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Beskyt din konto med en ekstra verifikationskode
                </p>
              </div>
            </div>
            <Switch disabled />
          </div>
          <p className="text-sm text-muted-foreground">
            To-faktor autentificering vil snart være tilgængelig
          </p>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Login aktivitet</CardTitle>
          <CardDescription>
            Se dine seneste login-forsøg og aktive sessioner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-semibold">
              Login historik kommer snart
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Du vil kunne se alle dine login-aktiviteter her
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
