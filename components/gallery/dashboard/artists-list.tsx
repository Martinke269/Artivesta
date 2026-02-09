import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GalleryArtist } from '@/lib/supabase/gallery-queries'
import { UserPlus, Image, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ArtistsListProps {
  artists: GalleryArtist[]
  galleryId: string
}

export function ArtistsList({ artists, galleryId }: ArtistsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Kunstnere</CardTitle>
        <Button size="sm" asChild>
          <Link href={`/gallery/${galleryId}/invite`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter kunstner
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {artists.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Ingen kunstnere endnu
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Kom i gang ved at invitere din første kunstner til galleriet.
            </p>
            <Button className="mt-6" asChild>
              <Link href={`/gallery/${galleryId}/invite`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Inviter kunstner
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{artist.name}</h4>
                    <p className="text-sm text-gray-500">{artist.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Image className="h-4 w-4" />
                      <span>{artist.artworks_count} værker</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{artist.total_sales.toLocaleString('da-DK')} kr</span>
                    </div>
                  </div>
                  
                  <Badge
                    variant={artist.status === 'active' ? 'default' : 'secondary'}
                  >
                    {artist.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gallery/${galleryId}/artists/${artist.id}`}>
                      Se detaljer
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
