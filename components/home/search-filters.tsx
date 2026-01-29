"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

const CATEGORIES = [
  "Maleri",
  "Fotografi",
  "Skulptur",
  "Digital kunst",
  "Tegning",
  "Grafik",
  "Collage",
  "Abstrakt",
  "Andet"
]

const STYLES = [
  "Impressionisme",
  "Realisme",
  "Ekspressionisme",
  "Abstrakt",
  "Surrealisme",
  "Kubisme",
  "Minimalisme",
  "Pop art",
  "Moderne",
  "Klassisk"
]

const COLORS = [
  { name: "Rød", value: "red" },
  { name: "Blå", value: "blue" },
  { name: "Grøn", value: "green" },
  { name: "Gul", value: "yellow" },
  { name: "Orange", value: "orange" },
  { name: "Lilla", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Sort", value: "black" },
  { name: "Hvid", value: "white" },
  { name: "Brun", value: "brown" },
]

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
  totalCount
}: SearchFiltersProps) {
  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      <Card className="border-purple-100 bg-white/80 backdrop-blur">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            <CardTitle className="text-lg md:text-xl">Søg og filtrer kunst</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Søg efter kunstværk, kunstner eller tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle kategorier</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Stilart</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle stilarter</SelectItem>
                  {STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Farve</label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle farver</SelectItem>
                  {COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value}>{color.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Prisklasse</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
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

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full border-purple-200 hover:bg-purple-50 text-sm"
              >
                Ryd filtre
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-xs md:text-sm text-gray-600">
            Viser {filteredCount} af {totalCount} kunstværker
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
