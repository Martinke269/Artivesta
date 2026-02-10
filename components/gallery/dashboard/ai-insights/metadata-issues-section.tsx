'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MetadataIssue } from '@/lib/supabase/gallery-ai-insights-queries'
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
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ExternalLink } from 'lucide-react'

interface MetadataIssuesSectionProps {
  issues: MetadataIssue[]
}

export function MetadataIssuesSection({ issues }: MetadataIssuesSectionProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Kritisk'
      case 'warning':
        return 'Advarsel'
      case 'info':
        return 'Info'
      default:
        return severity
    }
  }

  const getValidationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      unrealistic_price: 'Urealistisk pris',
      missing_images: 'Manglende billeder',
      inconsistent_dimensions: 'Manglende dimensioner',
      missing_description: 'Manglende beskrivelse',
      poor_image_quality: 'Lav billedkvalitet',
      incomplete_metadata: 'Ufuldstændig metadata',
    }
    return labels[type] || type
  }

  // Group issues by severity
  const criticalIssues = issues.filter((i) => i.severity === 'critical')
  const warningIssues = issues.filter((i) => i.severity === 'warning')
  const infoIssues = issues.filter((i) => i.severity === 'info')

  if (issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Metadata Problemer</CardTitle>
          <CardDescription>
            Værker med manglende eller problematisk metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">Perfekt metadata!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Alle dine værker har komplet og korrekt metadata.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata Problemer ({issues.length})</CardTitle>
        <CardDescription>
          Værker med manglende eller problematisk metadata der skal rettes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900 dark:text-red-100">Kritiske</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{criticalIssues.length}</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Skal rettes med det samme
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">Advarsler</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{warningIssues.length}</p>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              Bør rettes snarest
            </p>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Info</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{infoIssues.length}</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Forbedringer anbefales
            </p>
          </div>
        </div>

        {/* Issues Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Billede</TableHead>
                <TableHead>Titel</TableHead>
                <TableHead>Kunstner</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Besked</TableHead>
                <TableHead className="text-center">Alvorlighed</TableHead>
                <TableHead className="text-right">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                      {issue.artwork_image_url ? (
                        <Image
                          src={issue.artwork_image_url}
                          alt={issue.artwork_title}
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
                  <TableCell className="font-medium">{issue.artwork_title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {issue.artist_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getValidationTypeLabel(issue.validation_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground line-clamp-2">{issue.message}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                        {getSeverityLabel(issue.severity)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/gallery/dashboard/artworks?id=${issue.artwork_id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ret
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Quick Fix Suggestions */}
        {criticalIssues.length > 0 && (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Kritiske problemer kræver øjeblikkelig handling
            </h3>
            <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
              <li>• Værker med kritiske problemer vil ikke blive vist til købere</li>
              <li>• Ret disse problemer for at genaktivere værket</li>
              <li>• Kontakt kunstneren hvis du har brug for yderligere information</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
