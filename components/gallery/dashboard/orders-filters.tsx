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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { OrderFilters } from '@/lib/supabase/gallery-orders-queries'

interface OrdersFiltersProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  sortBy: 'newest' | 'highest_price' | 'status'
  onSortChange: (sort: 'newest' | 'highest_price' | 'status') => void
  artists: Array<{ id: string; name: string }>
}

export function OrdersFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  artists,
}: OrdersFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  )

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onFiltersChange({ ...filters, searchQuery: value || undefined })
  }

  const handleStatusChange = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]
    
    onFiltersChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    })
  }

  const handleArtistChange = (artistId: string) => {
    onFiltersChange({
      ...filters,
      artistId: artistId === 'all' ? undefined : artistId,
    })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    onFiltersChange({
      ...filters,
      dateFrom: date ? date.toISOString() : undefined,
    })
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    onFiltersChange({
      ...filters,
      dateTo: date ? date.toISOString() : undefined,
    })
  }

  const handlePriceRangeChange = (min?: number, max?: number) => {
    onFiltersChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDateFrom(undefined)
    setDateTo(undefined)
    onFiltersChange({})
  }

  const activeFilterCount = [
    filters.status?.length,
    filters.artistId,
    filters.dateFrom,
    filters.dateTo,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søg efter kunstværk..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sorter efter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Nyeste først</SelectItem>
            <SelectItem value="highest_price">Højeste pris</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Status
              {filters.status && filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-3" align="start">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ordrestatus</Label>
              {['pending', 'paid', 'completed', 'cancelled'].map((status) => (
                <label
                  key={status}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status)}
                    onChange={() => handleStatusChange(status)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {status === 'pending' && 'Afventer'}
                    {status === 'paid' && 'Betalt'}
                    {status === 'completed' && 'Gennemført'}
                    {status === 'cancelled' && 'Annulleret'}
                  </span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Artist Filter */}
        {artists.length > 0 && (
          <Select
            value={filters.artistId || 'all'}
            onValueChange={handleArtistChange}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Alle kunstnere" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle kunstnere</SelectItem>
              {artists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Dato
              {(dateFrom || dateTo) && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fra dato</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? (
                        format(dateFrom, 'PPP', { locale: da })
                      ) : (
                        <span>Vælg dato</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={handleDateFromChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Til dato</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? (
                        format(dateTo, 'PPP', { locale: da })
                      ) : (
                        <span>Vælg dato</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={handleDateToChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Pris
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-3" align="start">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Prisinterval (kr)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      handlePriceRangeChange(
                        e.target.value ? Number(e.target.value) : undefined,
                        filters.maxPrice
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      handlePriceRangeChange(
                        filters.minPrice,
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9"
          >
            <X className="mr-2 h-4 w-4" />
            Ryd filtre ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  )
}
