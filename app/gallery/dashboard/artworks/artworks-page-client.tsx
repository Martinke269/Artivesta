'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArtworksTable } from '@/components/gallery/dashboard/artworks-table'
import { ArtworksFilters } from '@/components/gallery/dashboard/artworks-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import {
  getGalleryArtworks,
  updateArtworkStatus,
  bulkUpdateArtworkStatus,
  type GalleryArtwork,
  type ArtworkFilters,
} from '@/lib/supabase/gallery-queries'

interface ArtworksPageClientProps {
  galleryId: string
  galleryName: string
}

export function ArtworksPageClient({ galleryId, galleryName }: ArtworksPageClientProps) {
  const [artworks, setArtworks] = useState<GalleryArtwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<GalleryArtwork[]>([])
  const [filters, setFilters] = useState<ArtworkFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadArtworks()
  }, [galleryId])

  useEffect(() => {
    applyFilters()
  }, [artworks, filters])

  const loadArtworks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getGalleryArtworks(supabase, galleryId)
      setArtworks(data)
    } catch (err) {
      console.error('Error loading artworks:', err)
      setError('Kunne ikke indlæse værker. Prøv igen senere.')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = async () => {
    try {
      const data = await getGalleryArtworks(supabase, galleryId, filters)
      setFilteredArtworks(data)
    } catch (err) {
      console.error('Error applying filters:', err)
    }
  }

  const handleStatusChange = async (artworkId: string, status: string) => {
    try {
      await updateArtworkStatus(supabase, artworkId, status)
      await loadArtworks()
    } catch (err) {
      console.error('Error updating artwork status:', err)
      setError('Kunne ikke opdatere værkets status. Prøv igen.')
    }
  }

  const handleBulkAction = async (artworkIds: string[], action: string) => {
    try {
      let status = 'draft'
      if (action === 'unlist') {
        status = 'draft'
      } else if (action === 'draft') {
        status = 'draft'
      }
      
      await bulkUpdateArtworkStatus(supabase, artworkIds, status)
      await loadArtworks()
    } catch (err) {
      console.error('Error performing bulk action:', err)
      setError('Kunne ikke udføre handlingen. Prøv igen.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Værker</h1>
          <p className="text-muted-foreground">
            Administrer kunstværker for {galleryName}
          </p>
        </div>
        <Button asChild>
          <Link href="/gallery/dashboard/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload værk
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Alle værker</CardTitle>
          <CardDescription>
            Se og administrer alle kunstværker i dit galleri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <ArtworksFilters
            filters={filters}
            onFiltersChange={setFilters}
            artworkCount={filteredArtworks.length}
          />

          {/* Table */}
          <ArtworksTable
            artworks={filteredArtworks}
            onStatusChange={handleStatusChange}
            onBulkAction={handleBulkAction}
          />
        </CardContent>
      </Card>

      {/* Empty State for No Artworks */}
      {artworks.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Ingen værker endnu</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              Kom i gang ved at uploade dit første kunstværk eller inviter kunstnere til at
              uploade deres værker.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/gallery/dashboard/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload værk
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/gallery/dashboard">Tilbage til dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
