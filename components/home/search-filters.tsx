"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedStyle: string
  setSelectedStyle: (value: string) => void
  selectedColor: string
  setSelectedColor: (value: string) => void
  priceRange: string
  setPriceRange: (value: string) => void
  clearFilters: () => void
  filteredCount: number
  totalCount: number
  availableCategories: string[]
  availableStyles: string[]
  availableColors: string[]
}

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStyle,
  setSelectedStyle,
  selectedColor,
  setSelectedColor,
  priceRange,
  setPriceRange,
  clearFilters,
  filteredCount,
  totalCount,
  availableCategories,
  availableStyles,
  availableColors
}: SearchFiltersProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Søg efter kunstværk, kunstner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base border-gray-200 focus:border-gray-900 rounded-full"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle kategorier</SelectItem>
                {availableCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Stilart" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle stilarter</SelectItem>
                {availableStyles.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Farve" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle farver</SelectItem>
                {availableColors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Prisklasse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle priser</SelectItem>
                <SelectItem value="0-5000">0 - 5.000 kr</SelectItem>
                <SelectItem value="5000-10000">5.000 - 10.000 kr</SelectItem>
                <SelectItem value="10000-20000">10.000 - 20.000 kr</SelectItem>
                <SelectItem value="20000+">20.000+ kr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count and clear */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>{filteredCount} kunstværker</span>
            {(searchQuery || selectedCategory !== "all" || selectedStyle !== "all" || selectedColor !== "all" || priceRange !== "all") && (
              <>
                <span>·</span>
                <button 
                  onClick={clearFilters}
                  className="text-gray-900 hover:underline"
                >
                  Ryd filtre
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
