'use client'

import { useState } from 'react'
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
import { Eye, Download, FileText } from 'lucide-react'
import { BuyerInvoiceDetail } from '@/lib/supabase/buyer-invoices-queries'

interface InvoicesTableProps {
  invoices: BuyerInvoiceDetail[];
  onViewDetails: (invoice: BuyerInvoiceDetail) => void;
  isLoading?: boolean;
}

export function InvoicesTable({
  invoices,
  onViewDetails,
  isLoading = false,
}: InvoicesTableProps) {
  const getStatusBadge = (status: 'paid' | 'overdue' | 'unpaid') => {
    const variants = {
      paid: { variant: 'default' as const, label: 'Betalt', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      unpaid: { variant: 'secondary' as const, label: 'Ubetalt', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      overdue: { variant: 'destructive' as const, label: 'Forfalden', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
    }
    const config = variants[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: 'order' | 'leasing') => {
    return type === 'order' ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Ordre
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        Leasing
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
              <TableHead>Faktura ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Forfaldsdato</TableHead>
              <TableHead>Beløb</TableHead>
              <TableHead>Status</TableHead>
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
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
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

  if (invoices.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Ingen fakturaer fundet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Der er ingen fakturaer der matcher dine filtre.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Faktura ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dato</TableHead>
            <TableHead>Forfaldsdato</TableHead>
            <TableHead>Beløb</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                {invoice.invoice_number}
              </TableCell>
              <TableCell>{getTypeBadge(invoice.invoice_type)}</TableCell>
              <TableCell>{formatDate(invoice.date)}</TableCell>
              <TableCell>{formatDate(invoice.due_date)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(invoice.total_cents, invoice.currency)}
              </TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(invoice)}
                    title="Se detaljer"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {invoice.pdf_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      title="Download PDF"
                    >
                      <a
                        href={invoice.pdf_url}
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
