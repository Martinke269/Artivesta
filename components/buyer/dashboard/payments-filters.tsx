'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, Search, X } from 'lucide-react'
import { BuyerPaymentsFilters } from '@/lib/supabase/buyer-payments-queries'

interface PaymentsFiltersProps {
  filters: BuyerPaymentsFilters
  onFiltersChange: (filters: BuyerPaymentsFilters) => void
  galleries: Array<{ id: string; name: string }>
}

export function PaymentsFilters({
  filters,
  onFiltersChange,
  galleries,
}: PaymentsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof BuyerPaymentsFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      type: 'all',
      payment_method: 'all',
      dateFrom: '',
      dateTo: '',
      priceMin: undefined,
      priceMax: undefined,
      galleryId: 'all',
      sortBy: 'newest',
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    (filters.payment_method && filters.payment_method !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.galleryId && filters.galleryId !== 'all')

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søg efter betaling ID, kunstværk, kunstner..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sorter efter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Nyeste</SelectItem>
            <SelectItem value="highest_amount">Højeste beløb</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <span>Filtre</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Ryd filtre
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle statusser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statusser</SelectItem>
                  <SelectItem value="completed">Gennemført</SelectItem>
                  <SelectItem value="pending">Afventer</SelectItem>
                  <SelectItem value="failed">Fejlet</SelectItem>
                  <SelectItem value="rejected">Afvist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle typer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle typer</SelectItem>
                  <SelectItem value="order">Ordre</SelectItem>
                  <SelectItem value="leasing">Leasing</SelectItem>
                  <SelectItem value="invoice">Faktura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label>Betalingsmetode</Label>
              <Select
                value={filters.payment_method || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('payment_method', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle metoder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle metoder</SelectItem>
                  <SelectItem value="card">Kort</SelectItem>
                  <SelectItem value="invoice">Faktura</SelectItem>
                  <SelectItem value="bank_transfer">Bankoverførsel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gallery Filter */}
            <div className="space-y-2">
              <Label>Galleri</Label>
              <Select
                value={filters.galleryId || 'all'}
                onValueChange={(value) => handleFilterChange('galleryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle gallerier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle gallerier</SelectItem>
                  {galleries.map((gallery) => (
                    <SelectItem key={gallery.id} value={gallery.id}>
                      {gallery.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label>Fra dato</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Til dato</Label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            {/* Price Min */}
            <div className="space-y-2">
              <Label>Min. pris (DKK)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMin',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>

            {/* Price Max */}
            <div className="space-y-2">
              <Label>Maks. pris (DKK)</Label>
              <Input
                type="number"
                placeholder="Ubegrænset"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMax',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
