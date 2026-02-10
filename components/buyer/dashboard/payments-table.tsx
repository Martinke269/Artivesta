'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Download, CreditCard } from 'lucide-react'
import { BuyerPaymentDetail } from '@/lib/supabase/buyer-payments-queries'

interface PaymentsTableProps {
  payments: BuyerPaymentDetail[]
  onViewDetails: (payment: BuyerPaymentDetail) => void
  isLoading?: boolean
}

export function PaymentsTable({
  payments,
  onViewDetails,
  isLoading = false,
}: PaymentsTableProps) {
  const getStatusBadge = (
    status: 'completed' | 'rejected' | 'failed' | 'pending'
  ) => {
    const variants = {
      completed: {
        label: 'Gennemført',
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
      },
      pending: {
        label: 'Afventer',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      },
      failed: {
        label: 'Fejlet',
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
      },
      rejected: {
        label: 'Afvist',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      },
    }
    const config = variants[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: 'order' | 'leasing' | 'invoice') => {
    const variants = {
      order: {
        label: 'Ordre',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      leasing: {
        label: 'Leasing',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      invoice: {
        label: 'Faktura',
        className: 'bg-gray-50 text-gray-700 border-gray-200',
      },
    }
    const config = variants[type]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentMethodBadge = (
    method: 'card' | 'invoice' | 'bank_transfer' | null
  ) => {
    if (!method) return <span className="text-sm text-muted-foreground">-</span>

    const variants = {
      card: { label: 'Kort', className: 'bg-indigo-50 text-indigo-700' },
      invoice: { label: 'Faktura', className: 'bg-amber-50 text-amber-700' },
      bank_transfer: {
        label: 'Bankoverførsel',
        className: 'bg-teal-50 text-teal-700',
      },
    }
    const config = variants[method]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (cents: number, currency: string = 'DKK') => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Betaling ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Beløb</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Betalingsmetode</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Ingen betalinger fundet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Der er ingen betalinger der matcher dine filtre.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Betaling ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dato</TableHead>
            <TableHead>Beløb</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Betalingsmetode</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {payment.payment_id}
              </TableCell>
              <TableCell>{getTypeBadge(payment.type)}</TableCell>
              <TableCell>{formatDate(payment.date)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(payment.total_cents, payment.currency)}
              </TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(payment)}
                    title="Se detaljer"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {payment.receipt_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      title="Download kvittering"
                    >
                      <a
                        href={payment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
