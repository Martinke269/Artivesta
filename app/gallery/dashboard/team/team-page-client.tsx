'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import { TeamSummaryCards } from '@/components/gallery/dashboard/team-summary-cards'
import { TeamMembersTable } from '@/components/gallery/dashboard/team-members-table'
import { ArtistsTable } from '@/components/gallery/dashboard/artists-table'
import { TeamInviteForm } from '@/components/gallery/dashboard/team-invite-form'
import { EditRoleDialog } from '@/components/gallery/dashboard/edit-role-dialog'
import {
  getTeamSummary,
  getGalleryTeamMembers,
  getGalleryArtistsWithDetails,
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  cancelInvitation,
  removeArtistFromGallery,
  getUserGalleryRole,
  type TeamSummary,
  type TeamMember,
  type GalleryArtist,
} from '@/lib/supabase/gallery-team-queries'

interface TeamPageClientProps {
  galleryId: string
  userId: string
}

export function TeamPageClient({ galleryId, userId }: TeamPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<
    'owner' | 'manager' | 'curator' | 'staff' | null
  >(null)
  const [summary, setSummary] = useState<TeamSummary | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [artists, setArtists] = useState<GalleryArtist[]>([])
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [galleryId, userId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user's role
      const { data: roleData, error: roleError } = await getUserGalleryRole(
        supabase,
        galleryId,
        userId
      )

      if (roleError) {
        throw new Error('Kunne ikke hente din rolle')
      }

      if (!roleData) {
        throw new Error('Du har ikke adgang til dette galleri')
      }

      setCurrentUserRole(roleData.role)

      // Load all data in parallel
      const [summaryResult, membersResult, artistsResult] = await Promise.all([
        getTeamSummary(supabase, galleryId),
        getGalleryTeamMembers(supabase, galleryId),
        getGalleryArtistsWithDetails(supabase, galleryId),
      ])

      if (summaryResult.error) throw summaryResult.error
      if (membersResult.error) throw membersResult.error
      if (artistsResult.error) throw artistsResult.error

      setSummary(summaryResult.data)
      setMembers(membersResult.data || [])
      setArtists(artistsResult.data || [])
    } catch (err) {
      console.error('Error loading team data:', err)
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteTeamMember = async (
    email: string,
    role: 'manager' | 'curator' | 'staff'
  ) => {
    try {
      const { error } = await inviteTeamMember(
        supabase,
        galleryId,
        email,
        role,
        userId
      )

      if (error) throw error

      toast({
        title: 'Invitation sendt',
        description: `En invitation er blevet sendt til ${email}`,
      })

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error inviting team member:', err)
      toast({
        title: 'Fejl',
        description:
          err instanceof Error ? err.message : 'Kunne ikke sende invitation',
        variant: 'destructive',
      })
      throw err
    }
  }

  const handleEditRole = (member: TeamMember) => {
    setMemberToEdit(member)
    setIsEditDialogOpen(true)
  }

  const handleSaveRole = async (
    memberId: string,
    newRole: 'manager' | 'curator' | 'staff'
  ) => {
    try {
      const { error } = await updateTeamMemberRole(supabase, memberId, newRole)

      if (error) throw error

      toast({
        title: 'Rolle opdateret',
        description: 'Teammedlemmets rolle er blevet opdateret',
      })

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error updating role:', err)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke opdatere rolle',
        variant: 'destructive',
      })
      throw err
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await removeTeamMember(supabase, memberId)

      if (error) throw error

      toast({
        title: 'Medlem fjernet',
        description: 'Teammedlemmet er blevet fjernet fra galleriet',
      })

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error removing member:', err)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke fjerne teammedlem',
        variant: 'destructive',
      })
    }
  }

  const handleCancelInvitation = async (memberId: string) => {
    try {
      const { error } = await cancelInvitation(supabase, memberId)

      if (error) throw error

      toast({
        title: 'Invitation annulleret',
        description: 'Invitationen er blevet annulleret',
      })

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error canceling invitation:', err)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke annullere invitation',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveArtist = async (artistId: string) => {
    try {
      const { error } = await removeArtistFromGallery(
        supabase,
        galleryId,
        artistId
      )

      if (error) throw error

      toast({
        title: 'Kunstner fjernet',
        description: 'Kunstneren er blevet fjernet fra galleriet',
      })

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error removing artist:', err)
      toast({
        title: 'Fejl',
        description: 'Kunne ikke fjerne kunstner',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !currentUserRole || !summary) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Kunne ikke indlæse teamdata'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <TeamSummaryCards summary={summary} />

      <Separator />

      {/* Team Members Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teammedlemmer</h2>
          <p className="text-muted-foreground">
            Administrer teammedlemmer og deres roller
          </p>
        </div>
        <TeamMembersTable
          members={members}
          currentUserRole={currentUserRole}
          onEditRole={handleEditRole}
          onRemoveMember={handleRemoveMember}
          onCancelInvitation={handleCancelInvitation}
        />
      </div>

      <Separator />

      {/* Artists Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kunstnere</h2>
          <p className="text-muted-foreground">
            Kunstnere tilknyttet galleriet gennem deres værker
          </p>
        </div>
        <ArtistsTable
          artists={artists}
          currentUserRole={currentUserRole}
          onRemoveArtist={handleRemoveArtist}
        />
      </div>

      <Separator />

      {/* Invite Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invitationer</h2>
          <p className="text-muted-foreground">
            Inviter nye teammedlemmer til galleriet
          </p>
        </div>
        <TeamInviteForm
          currentUserRole={currentUserRole}
          onInviteTeamMember={handleInviteTeamMember}
        />
      </div>

      {/* Edit Role Dialog */}
      <EditRoleDialog
        member={memberToEdit}
        currentUserRole={currentUserRole}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveRole}
      />
    </div>
  )
}
