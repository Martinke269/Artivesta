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
import { Card, CardContent } from '@/components/ui/card'
import { Search, X, Filter } from 'lucide-react'
import { PayoutFilters } from '@/lib/supabase/gallery-payouts-queries'

interface PayoutsFiltersProps {
  filters: PayoutFilters
  onFiltersChange: (filters: PayoutFilters) => void
  artists: Array<{ id: string; name: string }>
}

export function PayoutsFilters({ filters, onFiltersChange, artists }: PayoutsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<PayoutFilters>(filters)

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsExpanded(false)
  }

  const handleClearFilters = () => {
    const emptyFilters: PayoutFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof PayoutFilters]
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søg efter kunstværk..."
            value={localFilters.searchQuery || ''}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, searchQuery: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters()
              }
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant={isExpanded ? 'secondary' : 'outline'}
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtre
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {Object.keys(filters).filter((key) => {
                const value = filters[key as keyof PayoutFilters]
                return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
              }).length}
            </span>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={localFilters.status?.[0] || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      status: value === 'all' ? undefined : [value],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle statuser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statuser</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Artist Filter */}
              <div className="space-y-2">
                <Label>Kunstner</Label>
                <Select
                  value={localFilters.artistId || 'all'}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      artistId: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
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
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label>Fra dato</Label>
                <Input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, dateFrom: e.target.value })
                  }
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>Til dato</Label>
                <Input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, dateTo: e.target.value })
                  }
                />
              </div>

              {/* Min Amount */}
              <div className="space-y-2">
                <Label>Min. beløb (DKK)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.minAmount || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              {/* Max Amount */}
              <div className="space-y-2">
                <Label>Max. beløb (DKK)</Label>
                <Input
                  type="number"
                  placeholder="Ubegrænset"
                  value={localFilters.maxAmount || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxAmount: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Ryd filtre
              </Button>
              <Button onClick={handleApplyFilters}>Anvend filtre</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
