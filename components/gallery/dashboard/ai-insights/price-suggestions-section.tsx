'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PriceSuggestion } from '@/lib/supabase/gallery-ai-insights-queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { TrendingUp, TrendingDown, Minus, Eye, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PriceSuggestionsSectionProps {
  suggestions: PriceSuggestion[]
}

export function PriceSuggestionsSection({ suggestions }: PriceSuggestionsSectionProps) {
  const router = useRouter()
  const [selectedSuggestion, setSelectedSuggestion] = useState<PriceSuggestion | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const handleApplySuggestion = async () => {
    if (!selectedSuggestion) return

    setIsApplying(true)
    try {
      const response = await fetch('/api/gallery/apply-price-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artworkId: selectedSuggestion.artwork_id,
          suggestedPriceCents: selectedSuggestion.suggested_price_cents,
        }),
      })

      if (response.ok) {
        router.refresh()
        setSelectedSuggestion(null)
      }
    } catch (error) {
      console.error('Error applying price suggestion:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const getPriceBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'underpriced':
        return 'default'
      case 'overpriced':
        return 'destructive'
      case 'fair':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getPriceBadgeLabel = (badge: string) => {
    switch (badge) {
      case 'underpriced':
        return 'Underpriset'
      case 'overpriced':
        return 'Overpriset'
      case 'fair':
        return 'Fair pris'
      default:
        return badge
    }
  }

  const getPriceChangeIcon = (current: number, suggested: number) => {
    if (suggested > current) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else if (suggested < current) {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prisforslag</CardTitle>
          <CardDescription>
            AI-anbefalede prisændringer baseret på markedsdata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">Alle priser ser gode ud!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Der er ingen prisanbefalinger på nuværende tidspunkt.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Prisforslag ({suggestions.length})</CardTitle>
          <CardDescription>
            AI-anbefalede prisændringer baseret på markedsdata og konkurrentanalyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Billede</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead>Kunstner</TableHead>
                  <TableHead className="text-right">Nuværende</TableHead>
                  <TableHead className="text-right">Anbefalet</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => {
                  const priceChange =
                    ((suggestion.suggested_price_cents - suggestion.current_price_cents) /
                      suggestion.current_price_cents) *
                    100

                  return (
                    <TableRow key={suggestion.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                          {suggestion.artwork_image_url ? (
                            <Image
                              src={suggestion.artwork_image_url}
                              alt={suggestion.artwork_title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {suggestion.artwork_title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {suggestion.artist_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {(suggestion.current_price_cents / 100).toLocaleString('da-DK')} kr
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getPriceChangeIcon(
                            suggestion.current_price_cents,
                            suggestion.suggested_price_cents
                          )}
                          <span className="font-medium">
                            {(suggestion.suggested_price_cents / 100).toLocaleString('da-DK')} kr
                          </span>
                          <span
                            className={`text-xs ${
                              priceChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({priceChange > 0 ? '+' : ''}
                            {priceChange.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-sm font-medium">
                            {(suggestion.confidence_score * 100).toFixed(0)}%
                          </div>
                          <div className="w-full max-w-[60px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${suggestion.confidence_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getPriceBadgeVariant(suggestion.price_badge)}>
                          {getPriceBadgeLabel(suggestion.price_badge)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/artwork/${suggestion.artwork_id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Se
                            </Link>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedSuggestion(suggestion)}
                          >
                            Anvend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Suggestion Dialog */}
      <AlertDialog
        open={!!selectedSuggestion}
        onOpenChange={(open) => !open && setSelectedSuggestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anvend prisforslag?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSuggestion && (
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedSuggestion.artwork_title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      af {selectedSuggestion.artist_name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Nuværende pris</p>
                      <p className="text-lg font-semibold">
                        {(selectedSuggestion.current_price_cents / 100).toLocaleString('da-DK')}{' '}
                        kr
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ny pris</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {(selectedSuggestion.suggested_price_cents / 100).toLocaleString('da-DK')}{' '}
                        kr
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">
                    AI confidence score: {(selectedSuggestion.confidence_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Denne prisændring vil træde i kraft med det samme. Kunstneren vil blive
                    notificeret om ændringen.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplying}>Annuller</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplySuggestion} disabled={isApplying}>
              {isApplying ? 'Anvender...' : 'Anvend prisforslag'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
