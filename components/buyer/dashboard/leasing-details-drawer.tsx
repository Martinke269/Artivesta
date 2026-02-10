'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import type { BuyerLeaseDetail } from '@/lib/supabase/buyer-leasing-queries'

interface LeasingDetailsDrawerProps {
  lease: BuyerLeaseDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeasingDetailsDrawer({
  lease,
  open,
  onOpenChange,
}: LeasingDetailsDrawerProps) {
  if (!lease) return null

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      active: { variant: 'default', label: 'Aktiv' },
      expiring_soon: { variant: 'secondary', label: 'Udløber snart' },
      overdue: { variant: 'destructive', label: 'Forsinket' },
      completed: { variant: 'outline', label: 'Afsluttet' },
      cancelled: { variant: 'outline', label: 'Annulleret' },
    }

    const config = variants[status] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInsuranceBadge = (status: string) => {
    const config: Record<
      string,
      {
        icon: React.ReactNode
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        label: string
      }
    > = {
      valid: {
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default',
        label: 'Gyldig',
      },
      expiring_soon: {
        icon: <Clock className="h-4 w-4" />,
        variant: 'secondary',
        label: 'Udløber snart',
      },
      expired: {
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'destructive',
        label: 'Udløbet',
      },
      missing: {
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'destructive',
        label: 'Mangler',
      },
    }

    const item = config[status] || config.missing
    return (
      <Badge variant={item.variant} className="flex items-center gap-1">
        {item.icon}
        {item.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      paid: { variant: 'default', label: 'Betalt' },
      pending: { variant: 'secondary', label: 'Afventer' },
      overdue: { variant: 'destructive', label: 'Forsinket' },
      cancelled: { variant: 'outline', label: 'Annulleret' },
    }

    const config = variants[status] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Leasingaftale detaljer</SheetTitle>
          <SheetDescription>
            Komplet information om din leasingaftale
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Artwork Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Kunstværk</h3>
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <Avatar className="h-20 w-20 rounded-md">
                <AvatarImage
                  src={lease.artwork.image_url || undefined}
                  alt={lease.artwork.title}
                />
                <AvatarFallback className="rounded-md">
                  {lease.artwork.title.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">{lease.artwork.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {lease.artwork.artist_name}
                </p>
                {lease.artwork.category && (
                  <Badge variant="outline" className="mt-2">
                    {lease.artwork.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lease Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Aftaledetaljer</h3>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(lease.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Månedlig pris</span>
                <span className="font-medium">
                  {formatCurrency(lease.monthly_price_cents)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Startdato</span>
                <span className="text-sm">{formatDate(lease.start_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Slutdato</span>
                <span className="text-sm">{formatDate(lease.end_date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dage tilbage</span>
                <span
                  className={`text-sm font-medium ${
                    lease.days_remaining <= 30
                      ? 'text-destructive'
                      : lease.days_remaining <= 60
                        ? 'text-yellow-600'
                        : ''
                  }`}
                >
                  {lease.days_remaining} dage
                </span>
              </div>
              {lease.contract_url && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={lease.contract_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Se kontrakt
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Insurance Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Forsikring</h3>
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getInsuranceBadge(lease.insurance_status)}
              </div>
              {lease.insurance_holder && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Forsikringstager</span>
                  <span className="text-sm">{lease.insurance_holder}</span>
                </div>
              )}
              {lease.insurance_company && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Forsikringsselskab</span>
                  <span className="text-sm">{lease.insurance_company}</span>
                </div>
              )}
              {lease.insurance_policy_number && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Policenummer</span>
                  <span className="text-sm font-mono">
                    {lease.insurance_policy_number}
                  </span>
                </div>
              )}
              {lease.insurance_coverage_start && lease.insurance_coverage_end && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dækningsperiode</span>
                    <span className="text-sm">
                      {formatDate(lease.insurance_coverage_start)} -{' '}
                      {formatDate(lease.insurance_coverage_end)}
                    </span>
                  </div>
                </>
              )}
              {lease.insurance_documents && lease.insurance_documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Dokumenter</span>
                  {lease.insurance_documents.map((doc: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        {doc.name || `Dokument ${index + 1}`}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Gallery Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Galleri</h3>
            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <p className="font-medium">{lease.gallery.name}</p>
              </div>
              {lease.gallery.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p>{lease.gallery.address}</p>
                    {lease.gallery.postal_code && lease.gallery.city && (
                      <p>
                        {lease.gallery.postal_code} {lease.gallery.city}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {lease.gallery.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${lease.gallery.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {lease.gallery.email}
                  </a>
                </div>
              )}
              {lease.gallery.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${lease.gallery.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {lease.gallery.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment History */}
          {lease.payment_history && lease.payment_history.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Betalingshistorik</h3>
              <div className="space-y-2">
                {lease.payment_history.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Forfald: {formatDate(payment.due_date)}
                        </span>
                      </div>
                      {payment.paid_date && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-muted-foreground">
                            Betalt: {formatDate(payment.paid_date)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {formatCurrency(payment.amount_cents)}
                      </span>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
