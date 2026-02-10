'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CheckCircle,
  MoreHorizontal,
  Palette,
  Trash2,
} from 'lucide-react'
import type { GalleryArtist } from '@/lib/supabase/gallery-team-queries'

interface ArtistsTableProps {
  artists: GalleryArtist[]
  currentUserRole: 'owner' | 'manager' | 'curator' | 'staff'
  onRemoveArtist: (artistId: string) => void
}

export function ArtistsTable({
  artists,
  currentUserRole,
  onRemoveArtist,
}: ArtistsTableProps) {
  const [artistToRemove, setArtistToRemove] = useState<string | null>(null)

  const canRemoveArtist = () => {
    // Owner and Manager can remove artists
    return currentUserRole === 'owner' || currentUserRole === 'manager'
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge variant="outline" className="gap-1 border-green-500 bg-green-50 text-green-700">
          <CheckCircle className="h-3 w-3" />
          Aktiv
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1 border-orange-500 bg-orange-50 text-orange-700">
        <CheckCircle className="h-3 w-3" />
        Inviteret
      </Badge>
    )
  }

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Palette className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Ingen kunstnere</h3>
        <p className="text-sm text-muted-foreground">
          Upload kunstværker for at tilknytte kunstnere til galleriet.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kunstner</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Antal værker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists.map((artist) => (
              <TableRow key={artist.artist_id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={artist.artist.avatar_url || undefined}
                        alt={artist.artist.full_name || artist.artist.email}
                      />
                      <AvatarFallback>
                        {getInitials(artist.artist.full_name, artist.artist.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {artist.artist.full_name || 'Ukendt'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {artist.artist.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{artist.artwork_count}</span>
                    <span className="text-sm text-muted-foreground">
                      {artist.artwork_count === 1 ? 'værk' : 'værker'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(artist.status)}</TableCell>
                <TableCell className="text-right">
                  {canRemoveArtist() && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Åbn menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setArtistToRemove(artist.artist_id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Fjern fra galleri
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={artistToRemove !== null}
        onOpenChange={(open) => !open && setArtistToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern kunstner fra galleri</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil fjerne denne kunstner fra galleriet?
              Alle deres kunstværker vil blive fjernet fra galleriet, men vil
              stadig eksistere i systemet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (artistToRemove) {
                  onRemoveArtist(artistToRemove)
                  setArtistToRemove(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fjern kunstner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
