'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Building2,
  Shield,
  FileText,
  ExternalLink,
  Clock,
  DollarSign,
} from 'lucide-react'
import { BuyerLeaseDetail } from '@/lib/supabase/buyer-leasing-queries'
import { getInsuranceDaysRemaining } from '@/lib/supabase/buyer-insurance-queries'

interface InsuranceDetailsDrawerProps {
  record: BuyerLeaseDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InsuranceDetailsDrawer({
  record,
  open,
  onOpenChange,
}: InsuranceDetailsDrawerProps) {
  if (!record) return null

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      valid: { variant: 'default', label: 'Gyldig' },
      expiring_soon: { variant: 'secondary', label: 'Udløber snart' },
      expired: { variant: 'destructive', label: 'Udløbet' },
      missing: { variant: 'outline', label: 'Mangler' },
    }

    const config = variants[status] || variants.missing
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInsuranceHolderLabel = (holder: string | null) => {
    const labels: Record<string, string> = {
      gallery: 'Galleri',
      buyer: 'Køber',
      external: 'Ekstern',
      missing: 'Mangler',
    }
    return labels[holder || 'missing'] || 'Ukendt'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: record.currency,
    }).format(cents / 100)
  }

  const daysRemaining = getInsuranceDaysRemaining(record.insurance_coverage_end)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Forsikringsdetaljer</SheetTitle>
          <SheetDescription>
            Komplet information om forsikring for dette kunstværk
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Artwork Section */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-semibold">
              <FileText className="mr-2 h-4 w-4" />
              Kunstværk
            </h3>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded">
                  {record.artwork.image_url ? (
                    <Image
                      src={record.artwork.image_url}
                      alt={record.artwork.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      Intet billede
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{record.artwork.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {record.artwork.artist_name}
                  </p>
                  {record.artwork.category && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.artwork.category}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Insurance Information */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-semibold">
              <Shield className="mr-2 h-4 w-4" />
              Forsikringsoplysninger
            </h3>
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(record.insurance_status)}
                  </div>
                </div>
                {record.insurance_status === 'expiring_soon' && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">
                      {daysRemaining} dage tilbage
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Forsikringshaver</p>
                  <p className="text-sm text-muted-foreground">
                    {getInsuranceHolderLabel(record.insurance_holder)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Forsikringsselskab</p>
                  <p className="text-sm text-muted-foreground">
                    {record.insurance_company || 'Ikke angivet'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Policenummer</p>
                  <p className="text-sm text-muted-foreground">
                    {record.insurance_policy_number || 'Ikke angivet'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Dækningsperiode</p>
                  <p className="text-sm text-muted-foreground">
                    {record.insurance_coverage_start &&
                    record.insurance_coverage_end
                      ? `${formatDate(record.insurance_coverage_start)} - ${formatDate(record.insurance_coverage_end)}`
                      : 'Ikke angivet'}
                  </p>
                </div>
              </div>

              {record.insurance_documents &&
                record.insurance_documents.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-sm font-medium">Dokumenter</p>
                      <div className="space-y-2">
                        {record.insurance_documents.map((doc: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <span className="text-sm">{doc.name || `Dokument ${index + 1}`}</span>
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>

          <Separator />

          {/* Leasing Agreement */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-semibold">
              <Building2 className="mr-2 h-4 w-4" />
              Tilknyttet leasingaftale
            </h3>
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Månedlig pris</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(record.monthly_price_cents)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Startdato</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(record.start_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Slutdato</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(record.end_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Dage tilbage</p>
                  <p className="text-sm text-muted-foreground">
                    {record.days_remaining} dage
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium">Galleri</p>
                <p className="text-sm text-muted-foreground">
                  {record.gallery.name}
                </p>
                {record.gallery.city && (
                  <p className="text-xs text-muted-foreground">
                    {record.gallery.city}
                  </p>
                )}
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/buyer/dashboard/leasing">
                  Se leasingdetaljer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* History Section (Placeholder) */}
          <div>
            <h3 className="mb-3 flex items-center text-sm font-semibold">
              <Clock className="mr-2 h-4 w-4" />
              Historik
            </h3>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Ingen historik tilgængelig
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
