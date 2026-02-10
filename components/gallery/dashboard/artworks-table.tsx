'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GalleryArtwork } from '@/lib/supabase/gallery-queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertTriangle,
  Clock,
  Eye,
  Mail,
  MoreVertical,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'

interface ArtworksTableProps {
  artworks: GalleryArtwork[]
  onStatusChange: (artworkId: string, status: string) => Promise<void>
  onBulkAction: (artworkIds: string[], action: string) => Promise<void>
}

const statusConfig = {
  available: { label: 'Aktiv', variant: 'default' as const },
  draft: { label: 'Kladde', variant: 'secondary' as const },
  pending_approval: { label: 'Afventer godkendelse', variant: 'outline' as const },
  price_change_pending_approval: { label: 'Prisændring afventer', variant: 'outline' as const },
  sold: { label: 'Solgt', variant: 'default' as const },
  reserved: { label: 'Reserveret', variant: 'outline' as const },
}

export function ArtworksTable({ artworks, onStatusChange, onBulkAction }: ArtworksTableProps) {
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleArtwork = (artworkId: string) => {
    setSelectedArtworks((prev) =>
      prev.includes(artworkId) ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]
    )
  }

  const toggleAll = () => {
    if (selectedArtworks.length === artworks.length) {
      setSelectedArtworks([])
    } else {
      setSelectedArtworks(artworks.map((a) => a.id))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedArtworks.length === 0) return
    setIsProcessing(true)
    try {
      await onBulkAction(selectedArtworks, action)
      setSelectedArtworks([])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStatusChange = async (artworkId: string, status: string) => {
    setIsProcessing(true)
    try {
      await onStatusChange(artworkId, status)
    } finally {
      setIsProcessing(false)
    }
  }

  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Ingen værker fundet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Prøv at justere dine filtre eller tilføj nye værker
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedArtworks.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedArtworks.length} værk{selectedArtworks.length > 1 ? 'er' : ''} valgt
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('unlist')}
              disabled={isProcessing}
            >
              Fjern fra liste
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('draft')}
              disabled={isProcessing}
            >
              Gem som kladde
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedArtworks.length === artworks.length && artworks.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-20">Billede</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead>Kunstner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Pris</TableHead>
              <TableHead className="text-center">Visninger</TableHead>
              <TableHead className="text-center">Forespørgsler</TableHead>
              <TableHead className="text-center">AI-flags</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks.map((artwork) => (
              <TableRow key={artwork.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedArtworks.includes(artwork.id)}
                    onCheckedChange={() => toggleArtwork(artwork.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                    {artwork.image_url ? (
                      <Image
                        src={artwork.image_url}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/artwork/${artwork.id}`}
                    className="font-medium hover:underline"
                  >
                    {artwork.title}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-1">
                    {artwork.category}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{artwork.artist_name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[artwork.status]?.variant || 'default'}>
                    {statusConfig[artwork.status]?.label || artwork.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {(artwork.price_cents / 100).toLocaleString('da-DK')} kr
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{artwork.views}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{artwork.inquiries}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {artwork.has_price_change_pending && (
                      <div className="group relative">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Prisændring afventer
                        </div>
                      </div>
                    )}
                    {artwork.has_90_day_flag && (
                      <div className="group relative">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          90+ dage på listen
                        </div>
                      </div>
                    )}
                    {artwork.has_unusual_removal_flag && (
                      <div className="group relative">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Usædvanlig fjernelse
                        </div>
                      </div>
                    )}
                    {artwork.has_metadata_issues && (
                      <div className="group relative">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Metadata-problemer
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isProcessing}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/artwork/${artwork.id}`}>Se værk</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/gallery/dashboard/artworks/${artwork.id}/edit`}>
                          Rediger
                        </Link>
                      </DropdownMenuItem>
                      {artwork.status === 'available' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(artwork.id, 'draft')}
                        >
                          Fjern fra liste
                        </DropdownMenuItem>
                      )}
                      {artwork.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(artwork.id, 'available')}
                        >
                          Aktiver
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/gallery/dashboard/artworks/${artwork.id}/analytics`}>
                          Se analytics
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
