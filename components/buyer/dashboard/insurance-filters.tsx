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
import type { BuyerInsuranceFilters } from '@/lib/supabase/buyer-insurance-types'

interface InsuranceFiltersProps {
  filters: BuyerInsuranceFilters
  onFiltersChange: (filters: BuyerInsuranceFilters) => void
  galleries: Array<{ id: string; name: string }>
}

export function InsuranceFilters({
  filters,
  onFiltersChange,
  galleries,
}: InsuranceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleInsuranceHolderChange = (value: string) => {
    onFiltersChange({ ...filters, insuranceHolder: value })
  }

  const handleGalleryChange = (value: string) => {
    onFiltersChange({ ...filters, galleryId: value })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as 'newest' | 'expiring_soon' | 'status',
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

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      insuranceHolder: 'all',
      galleryId: 'all',
      sortBy: 'newest',
    })
    setIsOpen(false)
  }

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.insuranceHolder && filters.insuranceHolder !== 'all') ||
    (filters.galleryId && filters.galleryId !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søg efter kunstværk, kunstner, galleri, forsikringsselskab..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sorter efter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nyeste</SelectItem>
              <SelectItem value="expiring_soon">Udløber snart</SelectItem>
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
        <CollapsibleContent className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
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
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Alle statusser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statusser</SelectItem>
                    <SelectItem value="valid">Gyldig</SelectItem>
                    <SelectItem value="expiring_soon">Udløber snart</SelectItem>
                    <SelectItem value="expired">Udløbet</SelectItem>
                    <SelectItem value="missing">Mangler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Insurance Holder Filter */}
              <div className="space-y-2">
                <Label htmlFor="insuranceHolder">Forsikringshaver</Label>
                <Select
                  value={filters.insuranceHolder || 'all'}
                  onValueChange={handleInsuranceHolderChange}
                >
                  <SelectTrigger id="insuranceHolder">
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="gallery">Galleri</SelectItem>
                    <SelectItem value="buyer">Køber</SelectItem>
                    <SelectItem value="external">Ekstern</SelectItem>
                    <SelectItem value="missing">Mangler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gallery Filter */}
              <div className="space-y-2">
                <Label htmlFor="gallery">Galleri</Label>
                <Select
                  value={filters.galleryId || 'all'}
                  onValueChange={handleGalleryChange}
                >
                  <SelectTrigger id="gallery">
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
                <Label htmlFor="dateFrom">Dækningsstart fra</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">Dækningsslut til</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                />
              </div>

              {/* Price Min */}
              <div className="space-y-2">
                <Label htmlFor="priceMin">Min. månedlig pris (DKK)</Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="0"
                  value={filters.priceMin || ''}
                  onChange={(e) => handlePriceMinChange(e.target.value)}
                />
              </div>

              {/* Price Max */}
              <div className="space-y-2">
                <Label htmlFor="priceMax">Maks. månedlig pris (DKK)</Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="Ingen grænse"
                  value={filters.priceMax || ''}
                  onChange={(e) => handlePriceMaxChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
