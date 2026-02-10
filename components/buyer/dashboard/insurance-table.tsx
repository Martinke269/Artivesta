'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { BuyerLeaseDetail } from '@/lib/supabase/buyer-leasing-queries'
import { getInsuranceDaysRemaining } from '@/lib/supabase/buyer-insurance-queries'

interface InsuranceTableProps {
  records: BuyerLeaseDetail[]
  onViewDetails: (record: BuyerLeaseDetail) => void
  isLoading?: boolean
}

export function InsuranceTable({
  records,
  onViewDetails,
  isLoading = false,
}: InsuranceTableProps) {
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
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Billede</TableHead>
              <TableHead>Kunstværk</TableHead>
              <TableHead>Galleri</TableHead>
              <TableHead>Forsikringshaver</TableHead>
              <TableHead>Forsikringsselskab</TableHead>
              <TableHead>Policenummer</TableHead>
              <TableHead>Dækningsperiode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-12 w-12 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Ingen forsikringer fundet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Der er ingen forsikringer, der matcher dine filtre.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Billede</TableHead>
              <TableHead>Kunstværk</TableHead>
              <TableHead>Galleri</TableHead>
              <TableHead>Forsikringshaver</TableHead>
              <TableHead>Forsikringsselskab</TableHead>
              <TableHead>Policenummer</TableHead>
              <TableHead>Dækningsperiode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const daysRemaining = getInsuranceDaysRemaining(
                record.insurance_coverage_end
              )

              return (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded">
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
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.artwork.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.artwork.artist_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{record.gallery.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getInsuranceHolderLabel(record.insurance_holder)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {record.insurance_company || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {record.insurance_policy_number || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {record.insurance_coverage_start &&
                      record.insurance_coverage_end ? (
                        <>
                          {formatDate(record.insurance_coverage_start)} →{' '}
                          {formatDate(record.insurance_coverage_end)}
                          {record.insurance_status === 'expiring_soon' && (
                            <div className="mt-1 text-xs text-yellow-600">
                              {daysRemaining} dage tilbage
                            </div>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.insurance_status)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(record)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Se detaljer
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
