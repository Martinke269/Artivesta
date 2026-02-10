'use client'

import Image from 'next/image'
import Link from 'next/link'
import { NinetyDayDiagnostic } from '@/lib/supabase/gallery-ai-insights-queries'
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
import { Clock, Eye, MessageSquare, CheckCircle2 } from 'lucide-react'

interface NinetyDayDiagnosticsSectionProps {
  diagnostics: NinetyDayDiagnostic[]
}

export function NinetyDayDiagnosticsSection({ diagnostics }: NinetyDayDiagnosticsSectionProps) {
  if (diagnostics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>90-Dages Diagnostik</CardTitle>
          <CardDescription>
            Værker der har været listet i 90+ dage med AI-analyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">Ingen langvarige listings!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Alle dine værker er blevet solgt eller listet for mindre end 90 dage.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>90-Dages Diagnostik ({diagnostics.length})</CardTitle>
        <CardDescription>
          Værker der har været listet i 90+ dage med AI-genererede anbefalinger
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
                <TableHead className="text-center">Dage</TableHead>
                <TableHead className="text-center">Visninger</TableHead>
                <TableHead className="text-center">Forespørgsler</TableHead>
                <TableHead className="text-right">Pris</TableHead>
                <TableHead className="text-right">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnostics.map((diagnostic) => (
                <TableRow key={diagnostic.id}>
                  <TableCell>
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                      {diagnostic.artwork_image_url ? (
                        <Image
                          src={diagnostic.artwork_image_url}
                          alt={diagnostic.artwork_title}
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
                  <TableCell>
                    <div>
                      <p className="font-medium">{diagnostic.artwork_title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {diagnostic.diagnosis.slice(0, 2).map((d, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {diagnostic.artist_name}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">{diagnostic.days_active}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{diagnostic.view_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{diagnostic.inquiry_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(diagnostic.price_cents / 100).toLocaleString('da-DK')} kr
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/artwork/${diagnostic.artwork_id}`}>Se detaljer</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Recommendations Summary */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold">AI Anbefalinger</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {diagnostics.slice(0, 4).map((diagnostic) => (
              <div
                key={diagnostic.id}
                className="p-4 border rounded-lg bg-muted/50 space-y-2"
              >
                <p className="font-medium text-sm">{diagnostic.artwork_title}</p>
                <ul className="space-y-1">
                  {diagnostic.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
