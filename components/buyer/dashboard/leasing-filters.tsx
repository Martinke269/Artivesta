'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import type { BuyerLeasingFilters } from '@/lib/supabase/buyer-leasing-queries'

interface LeasingFiltersProps {
  filters: BuyerLeasingFilters
  onFiltersChange: (filters: BuyerLeasingFilters) => void
  galleries: Array<{ id: string; name: string }>
}

export function LeasingFilters({
  filters,
  onFiltersChange,
  galleries,
}: LeasingFiltersProps) {
  const handleReset = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      insuranceStatus: 'all',
      sortBy: 'newest',
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.insuranceStatus && filters.insuranceStatus !== 'all') ||
    (filters.galleryId && filters.galleryId !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtre</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Nulstil
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Søg</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Kunstværk, kunstner, galleri..."
              value={filters.search || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-8"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value })
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Alle statusser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statusser</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="expiring_soon">Udløber snart</SelectItem>
              <SelectItem value="overdue">Forsinket</SelectItem>
              <SelectItem value="completed">Afsluttet</SelectItem>
              <SelectItem value="cancelled">Annulleret</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Insurance Status */}
        <div className="space-y-2">
          <Label htmlFor="insurance-status">Forsikringsstatus</Label>
          <Select
            value={filters.insuranceStatus || 'all'}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, insuranceStatus: value })
            }
          >
            <SelectTrigger id="insurance-status">
              <SelectValue placeholder="Alle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="valid">Gyldig</SelectItem>
              <SelectItem value="expiring_soon">Udløber snart</SelectItem>
              <SelectItem value="expired">Udløbet</SelectItem>
              <SelectItem value="missing">Mangler</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label htmlFor="sort">Sorter efter</Label>
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sortBy: value as 'newest' | 'highest_price' | 'status',
              })
            }
          >
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sorter efter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nyeste først</SelectItem>
              <SelectItem value="highest_price">Højeste pris</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
          Avancerede filtre
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Gallery */}
          {galleries.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="gallery">Galleri</Label>
              <Select
                value={filters.galleryId || 'all'}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, galleryId: value })
                }
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
          )}

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="date-from">Startdato fra</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="date-to">Slutdato til</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateTo: e.target.value })
              }
            />
          </div>

          {/* Price Min */}
          <div className="space-y-2">
            <Label htmlFor="price-min">Min. månedlig pris (DKK)</Label>
            <Input
              id="price-min"
              type="number"
              placeholder="0"
              value={filters.priceMin || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>

          {/* Price Max */}
          <div className="space-y-2">
            <Label htmlFor="price-max">Maks. månedlig pris (DKK)</Label>
            <Input
              id="price-max"
              type="number"
              placeholder="100000"
              value={filters.priceMax || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      </details>
    </div>
  )
}
