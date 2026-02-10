'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import type { BuyerInsuranceItem } from '@/lib/supabase/buyer-overview-queries'

interface InsuranceStatusProps {
  missing: BuyerInsuranceItem[]
  expiring: BuyerInsuranceItem[]
  valid: BuyerInsuranceItem[]
}

export function InsuranceStatus({ missing, expiring, valid }: InsuranceStatusProps) {
  const totalLeases = missing.length + expiring.length + valid.length

  if (totalLeases === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forsikringsstatus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Ingen leasingaftaler med forsikring
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forsikringsstatus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Missing Insurance */}
        {missing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-sm">Manglende forsikring</h3>
              <Badge variant="destructive" className="ml-auto">
                {missing.length}
              </Badge>
            </div>
            <Alert variant="destructive">
              <AlertDescription>
                Følgende kunstværker mangler forsikring. Kontakt dit galleri for at få oprettet forsikring.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              {missing.map((item) => (
                <div
                  key={item.lease_id}
                  className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium">{item.artwork_title}</span>
                  </div>
                  <Badge variant="destructive">Mangler</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiring Insurance */}
        {expiring.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-sm">Udløber snart</h3>
              <Badge variant="secondary" className="ml-auto">
                {expiring.length}
              </Badge>
            </div>
            <Alert>
              <AlertDescription>
                Følgende forsikringer udløber inden for 30 dage. Kontakt dit galleri for fornyelse.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              {expiring.map((item) => (
                <div
                  key={item.lease_id}
                  className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">{item.artwork_title}</span>
                    </div>
                    {item.coverage_end && (
                      <p className="text-xs text-muted-foreground ml-7">
                        Udløber {format(new Date(item.coverage_end), 'dd. MMM yyyy', { locale: da })}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">Udløber snart</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valid Insurance */}
        {valid.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-sm">Gyldig forsikring</h3>
              <Badge variant="default" className="ml-auto">
                {valid.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {valid.map((item) => (
                <div
                  key={item.lease_id}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{item.artwork_title}</span>
                    </div>
                    {item.coverage_end && (
                      <p className="text-xs text-muted-foreground ml-7">
                        Gyldig til {format(new Date(item.coverage_end), 'dd. MMM yyyy', { locale: da })}
                      </p>
                    )}
                  </div>
                  <Badge variant="default">OK</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
