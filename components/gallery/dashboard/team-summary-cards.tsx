'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Mail, Palette } from 'lucide-react'
import type { TeamSummary } from '@/lib/supabase/gallery-team-queries'

interface TeamSummaryCardsProps {
  summary: TeamSummary
}

export function TeamSummaryCards({ summary }: TeamSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Teammedlemmer
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_members}</div>
          <p className="text-xs text-muted-foreground">
            {summary.active_members} aktive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tilknyttede Kunstnere
          </CardTitle>
          <Palette className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_artists}</div>
          <p className="text-xs text-muted-foreground">
            {summary.active_artists} aktive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Afventende Invitationer
          </CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.pending_invitations}</div>
          <p className="text-xs text-muted-foreground">
            Venter på accept
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Team Status
          </CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.active_members > 0 ? 'Aktiv' : 'Inaktiv'}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.active_members > 0
              ? 'Teamet er operationelt'
              : 'Inviter teammedlemmer'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
