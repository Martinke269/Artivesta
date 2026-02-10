'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Filter, Search, X } from 'lucide-react'
import { ArtworkFilters } from '@/lib/supabase/gallery-queries'

interface ArtworksFiltersProps {
  filters: ArtworkFilters
  onFiltersChange: (filters: ArtworkFilters) => void
  artworkCount: number
}

const statusOptions = [
  { value: 'available', label: 'Aktiv' },
  { value: 'draft', label: 'Kladde' },
  { value: 'pending_approval', label: 'Afventer godkendelse' },
  { value: 'price_change_pending_approval', label: 'Prisændring afventer' },
  { value: 'sold', label: 'Solgt' },
  { value: 'reserved', label: 'Reserveret' },
]

export function ArtworksFilters({ filters, onFiltersChange, artworkCount }: ArtworksFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')
  const [isOpen, setIsOpen] = useState(false)

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]
    
    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined })
  }

  const handleAIFlagToggle = (flag: keyof ArtworkFilters) => {
    onFiltersChange({ ...filters, [flag]: !filters[flag] })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFiltersChange({ ...filters, searchQuery: value || undefined })
  }

  const clearFilters = () => {
    setSearchQuery('')
    onFiltersChange({})
  }

  const activeFilterCount = 
    (filters.status?.length || 0) +
    (filters.hasPriceChangePending ? 1 : 0) +
    (filters.hasUnusualRemovalFlag ? 1 : 0) +
    (filters.has90DayFlag ? 1 : 0) +
    (filters.searchQuery ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søg efter værker..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtre
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtre</SheetTitle>
              <SheetDescription>
                Filtrer dine værker efter status og AI-flags
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Status Filters */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Status</Label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status?.includes(option.value)}
                        onCheckedChange={() => handleStatusToggle(option.value)}
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Flags */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">AI-flags</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="price-change-pending"
                      checked={filters.hasPriceChangePending}
                      onCheckedChange={() => handleAIFlagToggle('hasPriceChangePending')}
                    />
                    <label
                      htmlFor="price-change-pending"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Prisændring afventer
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="90-day-flag"
                      checked={filters.has90DayFlag}
                      onCheckedChange={() => handleAIFlagToggle('has90DayFlag')}
                    />
                    <label
                      htmlFor="90-day-flag"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      90+ dage på listen
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="unusual-removal"
                      checked={filters.hasUnusualRemovalFlag}
                      onCheckedChange={() => handleAIFlagToggle('hasUnusualRemovalFlag')}
                    />
                    <label
                      htmlFor="unusual-removal"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Usædvanlig fjernelse
                    </label>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Ryd alle filtre
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Aktive filtre:</span>
          
          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              {statusOptions.find((o) => o.value === status)?.label}
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.hasPriceChangePending && (
            <Badge variant="secondary" className="gap-1">
              Prisændring afventer
              <button
                onClick={() => handleAIFlagToggle('hasPriceChangePending')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.has90DayFlag && (
            <Badge variant="secondary" className="gap-1">
              90+ dage
              <button
                onClick={() => handleAIFlagToggle('has90DayFlag')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.hasUnusualRemovalFlag && (
            <Badge variant="secondary" className="gap-1">
              Usædvanlig fjernelse
              <button
                onClick={() => handleAIFlagToggle('hasUnusualRemovalFlag')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Søgning: {filters.searchQuery}
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs"
          >
            Ryd alle
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Viser {artworkCount} værk{artworkCount !== 1 ? 'er' : ''}
      </div>
    </div>
  )
}
