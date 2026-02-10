'use client'

import { useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface LeasingDetailsDrawerProps {
  lease: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerateInvoice?: (leaseId: string) => void
  onUpdateInsurance?: (leaseId: string) => void
  onExtendLease?: (leaseId: string) => void
  onCancelLease?: (leaseId: string) => void
}

export function LeasingDetailsDrawer({
  lease,
  open,
  onOpenChange,
  onGenerateInvoice,
  onUpdateInsurance,
  onExtendLease,
  onCancelLease,
}: LeasingDetailsDrawerProps) {
  if (!lease) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('da-DK', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('da-DK', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusInfo = () => {
    const now = new Date()
    const endDate = new Date(lease.end_date)
    const daysUntilEnd = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (lease.status === 'cancelled') {
      return {
        badge: (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Annulleret
          </Badge>
        ),
        description: 'Denne leasingaftale er blevet annulleret.',
      }
    }

    if (lease.status === 'completed') {
      return {
        badge: (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Afsluttet
          </Badge>
        ),
        description: 'Denne leasingaftale er afsluttet.',
      }
    }

    if (endDate < now) {
      return {
        badge: (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Forsinket
          </Badge>
        ),
        description: `Leasingaftalen udløb for ${Math.abs(daysUntilEnd)} dage siden.`,
      }
    }

    if (daysUntilEnd <= 30) {
      return {
        badge: (
          <Badge variant="outline" className="gap-1 border-orange-500 bg-orange-50 text-orange-700">
            <Clock className="h-3 w-3" />
            Udløber snart
          </Badge>
        ),
        description: `Leasingaftalen udløber om ${daysUntilEnd} dage.`,
      }
    }

    return {
      badge: (
        <Badge variant="outline" className="gap-1 border-green-500 bg-green-50 text-green-700">
          <CheckCircle className="h-3 w-3" />
          Aktiv
        </Badge>
      ),
      description: `Leasingaftalen er aktiv og udløber om ${daysUntilEnd} dage.`,
    }
  }

  const getInsuranceInfo = () => {
    if (!lease.insurance_policy_number) {
      return {
        badge: (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Mangler forsikring
          </Badge>
        ),
        description: 'Der er ingen forsikring registreret for denne leasingaftale.',
        alert: true,
      }
    }

    if (!lease.insurance_expiry_date) {
      return {
        badge: (
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Ukendt udløb
          </Badge>
        ),
        description: 'Forsikring er registreret, men udløbsdato mangler.',
        alert: true,
      }
    }

    const now = new Date()
    const expiryDate = new Date(lease.insurance_expiry_date)
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (expiryDate < now) {
      return {
        badge: (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Udløbet
          </Badge>
        ),
        description: `Forsikringen udløb for ${Math.abs(daysUntilExpiry)} dage siden.`,
        alert: true,
      }
    }

    if (daysUntilExpiry <= 30) {
      return {
        badge: (
          <Badge variant="outline" className="gap-1 border-orange-500 bg-orange-50 text-orange-700">
            <Clock className="h-3 w-3" />
            Udløber snart
          </Badge>
        ),
        description: `Forsikringen udløber om ${daysUntilExpiry} dage.`,
        alert: true,
      }
    }

    return {
      badge: (
        <Badge variant="outline" className="gap-1 border-green-500 bg-green-50 text-green-700">
          <Shield className="h-3 w-3" />
          Gyldig
        </Badge>
      ),
      description: `Forsikringen er gyldig og udløber om ${daysUntilExpiry} dage.`,
      alert: false,
    }
  }

  const getInsuranceHolder = (holder: string) => {
    const holders: Record<string, string> = {
      gallery: 'Galleri',
      buyer: 'Køber',
      external: 'Ekstern forsikring',
    }
    return holders[holder] || holder
  }

  const statusInfo = getStatusInfo()
  const insuranceInfo = getInsuranceInfo()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Leasingaftale detaljer</SheetTitle>
          <SheetDescription>
            Komplet information om leasingaftalen
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="space-y-6 py-6">
            {/* Status Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Status</h3>
                {statusInfo.badge}
              </div>
              <p className="text-sm text-muted-foreground">
                {statusInfo.description}
              </p>
            </div>

            <Separator />

            {/* Artwork Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Kunstværk</h3>
              <div className="flex gap-4">
                {lease.artwork?.image_url && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                    <Image
                      src={lease.artwork.image_url}
                      alt={lease.artwork.title || 'Kunstværk'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{lease.artwork?.title || 'Ukendt'}</p>
                  <p className="text-sm text-muted-foreground">
                    {lease.artwork?.artist?.name || 'Ukendt kunstner'}
                  </p>
                  {lease.artwork?.id && (
                    <Link
                      href={`/artwork/${lease.artwork.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Se kunstværk
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Buyer/Lessee Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Lejer</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {lease.buyer?.full_name || 'Ukendt'}
                    </p>
                    {lease.buyer?.company_name && (
                      <p className="text-sm text-muted-foreground">
                        {lease.buyer.company_name}
                      </p>
                    )}
                  </div>
                </div>
                {lease.buyer?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${lease.buyer.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {lease.buyer.email}
                    </a>
                  </div>
                )}
                {lease.buyer?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${lease.buyer.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {lease.buyer.phone}
                    </a>
                  </div>
                )}
                {lease.delivery_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {lease.delivery_address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Lease Period Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Leasingperiode</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Startdato</p>
                  <p className="text-sm font-medium">
                    {formatDate(lease.start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Slutdato</p>
                  <p className="text-sm font-medium">
                    {formatDate(lease.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Varighed</p>
                  <p className="text-sm font-medium">
                    {lease.duration_months} måneder
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Priser</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Månedlig pris</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(lease.monthly_price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total pris</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(lease.total_price)}
                  </p>
                </div>
                {lease.deposit_amount && (
                  <div>
                    <p className="text-xs text-muted-foreground">Depositum</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(lease.deposit_amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Insurance Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Forsikring</h3>
                {insuranceInfo.badge}
              </div>
              {insuranceInfo.alert && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="text-sm text-orange-800">
                    {insuranceInfo.description}
                  </p>
                </div>
              )}
              {lease.insurance_policy_number && (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Policenummer</p>
                    <p className="text-sm font-medium">
                      {lease.insurance_policy_number}
                    </p>
                  </div>
                  {lease.insurance_holder && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Forsikringshaver
                      </p>
                      <p className="text-sm font-medium">
                        {getInsuranceHolder(lease.insurance_holder)}
                      </p>
                    </div>
                  )}
                  {lease.insurance_expiry_date && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Udløbsdato
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(lease.insurance_expiry_date)}
                      </p>
                    </div>
                  )}
                  {lease.insurance_provider && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Forsikringsselskab
                      </p>
                      <p className="text-sm font-medium">
                        {lease.insurance_provider}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {lease.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Noter</h3>
                  <p className="text-sm text-muted-foreground">{lease.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Metadata Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Metadata</h3>
              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Oprettet:</span>
                  <span>{formatDateTime(lease.created_at)}</span>
                </div>
                {lease.updated_at && lease.updated_at !== lease.created_at && (
                  <div className="flex justify-between">
                    <span>Opdateret:</span>
                    <span>{formatDateTime(lease.updated_at)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Leasing ID:</span>
                  <span className="font-mono">{lease.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-2 pt-4">
              {onGenerateInvoice && (
                <Button
                  onClick={() => onGenerateInvoice(lease.id)}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generer faktura
                </Button>
              )}
              {onUpdateInsurance && (
                <Button
                  onClick={() => onUpdateInsurance(lease.id)}
                  className="w-full"
                  variant="outline"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Opdater forsikring
                </Button>
              )}
              {onExtendLease &&
                lease.status === 'active' &&
                new Date(lease.end_date) > new Date() && (
                  <Button
                    onClick={() => onExtendLease(lease.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Forlæng leasing
                  </Button>
                )}
              {onCancelLease && lease.status === 'active' && (
                <Button
                  onClick={() => onCancelLease(lease.id)}
                  className="w-full"
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Annuller leasing
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
