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

interface LeasingFiltersProps {
  onFilterChange: (filters: any) => void
  artists?: Array<{ id: string; name: string }>
}

export function LeasingFilters({ onFilterChange, artists = [] }: LeasingFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    insurance_status: '',
    insurance_holder: '',
    artist_id: '',
    start_date: '',
    end_date: '',
    min_price: '',
    max_price: '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      insurance_status: '',
      insurance_holder: '',
      artist_id: '',
      start_date: '',
      end_date: '',
      min_price: '',
      max_price: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="space-y-4">
      {/* Search bar - always visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Søg efter titel..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Collapsible advanced filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <span>Avancerede filtre</span>
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
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Ryd filtre
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
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
              <Label>Forsikringsstatus</Label>
              <Select
                value={filters.insurance_status}
                onValueChange={(value) =>
                  handleFilterChange('insurance_status', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  <SelectItem value="valid">Gyldig</SelectItem>
                  <SelectItem value="expiring_soon">Udløber snart</SelectItem>
                  <SelectItem value="expired">Udløbet</SelectItem>
                  <SelectItem value="missing">Mangler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Insurance Holder */}
            <div className="space-y-2">
              <Label>Forsikringshaver</Label>
              <Select
                value={filters.insurance_holder}
                onValueChange={(value) =>
                  handleFilterChange('insurance_holder', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle</SelectItem>
                  <SelectItem value="gallery">Galleri</SelectItem>
                  <SelectItem value="buyer">Køber</SelectItem>
                  <SelectItem value="external">Ekstern</SelectItem>
                  <SelectItem value="missing">Mangler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Artist */}
            {artists.length > 0 && (
              <div className="space-y-2">
                <Label>Kunstner</Label>
                <Select
                  value={filters.artist_id}
                  onValueChange={(value) =>
                    handleFilterChange('artist_id', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle</SelectItem>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Startdato fra</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange('start_date', e.target.value)
                }
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>Slutdato til</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>

            {/* Min Price */}
            <div className="space-y-2">
              <Label>Min. pris (DKK)</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <Label>Maks. pris (DKK)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
