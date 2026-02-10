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
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { BuyerOrdersFilters } from '@/lib/supabase/buyer-orders-queries'

interface OrdersFiltersProps {
  filters: BuyerOrdersFilters
  onFiltersChange: (filters: BuyerOrdersFilters) => void
  galleries: Array<{ id: string; name: string }>
}

export function OrdersFilters({
  filters,
  onFiltersChange,
  galleries,
}: OrdersFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as 'newest' | 'highest_amount' | 'status',
    })
  }

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value })
  }

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value })
  }

  const handlePriceMinChange = (value: string) => {
    const num = value ? parseFloat(value) : undefined
    onFiltersChange({ ...filters, priceMin: num })
  }

  const handlePriceMaxChange = (value: string) => {
    const num = value ? parseFloat(value) : undefined
    onFiltersChange({ ...filters, priceMax: num })
  }

  const handleGalleryChange = (value: string) => {
    onFiltersChange({ ...filters, galleryId: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      sortBy: 'newest',
      dateFrom: undefined,
      dateTo: undefined,
      priceMin: undefined,
      priceMax: undefined,
      galleryId: 'all',
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    (filters.galleryId && filters.galleryId !== 'all')

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søg efter kunstværk, kunstner eller galleri..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle status</SelectItem>
              <SelectItem value="pending">Afventer betaling</SelectItem>
              <SelectItem value="paid">Betalt</SelectItem>
              <SelectItem value="completed">Gennemført</SelectItem>
              <SelectItem value="cancelled">Annulleret</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sorter efter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nyeste</SelectItem>
              <SelectItem value="highest_amount">Højeste beløb</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Avancerede filtre</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Ryd filtre
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fra dato</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleDateFromChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Til dato</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleDateToChange(e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label htmlFor="priceMin">Min. pris (DKK)</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="0"
                value={filters.priceMin || ''}
                onChange={(e) => handlePriceMinChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMax">Maks. pris (DKK)</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="100000"
                value={filters.priceMax || ''}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
              />
            </div>

            {/* Gallery Filter */}
            {galleries.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="gallery">Galleri</Label>
                <Select
                  value={filters.galleryId || 'all'}
                  onValueChange={handleGalleryChange}
                >
                  <SelectTrigger id="gallery">
                    <SelectValue placeholder="Vælg galleri" />
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
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
