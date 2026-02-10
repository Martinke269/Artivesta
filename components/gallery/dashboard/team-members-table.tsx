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
  Clock,
  Edit,
  MoreHorizontal,
  Shield,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import type { TeamMember } from '@/lib/supabase/gallery-team-queries'

interface TeamMembersTableProps {
  members: TeamMember[]
  currentUserRole: 'owner' | 'manager' | 'curator' | 'staff'
  onEditRole: (member: TeamMember) => void
  onRemoveMember: (memberId: string) => void
  onCancelInvitation: (memberId: string) => void
}

export function TeamMembersTable({
  members,
  currentUserRole,
  onEditRole,
  onRemoveMember,
  onCancelInvitation,
}: TeamMembersTableProps) {
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      owner: { label: 'Ejer', variant: 'default' as const, icon: Shield },
      manager: { label: 'Manager', variant: 'secondary' as const, icon: Users },
      curator: { label: 'Kurator', variant: 'outline' as const, icon: Users },
      staff: { label: 'Assistent', variant: 'outline' as const, icon: Users },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.staff
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
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
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="gap-1 border-orange-500 bg-orange-50 text-orange-700">
          <Clock className="h-3 w-3" />
          Inviteret
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Inaktiv
      </Badge>
    )
  }

  const canEditMember = (member: TeamMember) => {
    // Owner can edit everyone except themselves
    if (currentUserRole === 'owner') {
      return member.role !== 'owner'
    }
    // Manager can edit curator and staff
    if (currentUserRole === 'manager') {
      return member.role === 'curator' || member.role === 'staff'
    }
    // Curator and staff cannot edit anyone
    return false
  }

  const canRemoveMember = (member: TeamMember) => {
    // Owner can remove everyone except themselves
    if (currentUserRole === 'owner') {
      return member.role !== 'owner'
    }
    // Manager can remove curator and staff
    if (currentUserRole === 'manager') {
      return member.role === 'curator' || member.role === 'staff'
    }
    // Curator and staff cannot remove anyone
    return false
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('da-DK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">Ingen teammedlemmer</h3>
        <p className="text-sm text-muted-foreground">
          Inviter teammedlemmer for at komme i gang.
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
              <TableHead>Medlem</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Inviteret</TableHead>
              <TableHead className="text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.user.avatar_url || undefined}
                        alt={member.user.full_name || member.user.email}
                      />
                      <AvatarFallback>
                        {getInitials(member.user.full_name, member.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user.full_name || 'Ukendt'}
                      </p>
                      {member.invited_by_user && member.status === 'pending' && (
                        <p className="text-xs text-muted-foreground">
                          Inviteret af {member.invited_by_user.full_name || member.invited_by_user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(member.role)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.user.email}
                </TableCell>
                <TableCell>{getStatusBadge(member.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(member.invited_at)}
                </TableCell>
                <TableCell className="text-right">
                  {(canEditMember(member) || canRemoveMember(member)) && (
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
                        {canEditMember(member) && member.status === 'active' && (
                          <DropdownMenuItem onClick={() => onEditRole(member)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Rediger rolle
                          </DropdownMenuItem>
                        )}
                        {canRemoveMember(member) && (
                          <>
                            {member.status === 'pending' ? (
                              <DropdownMenuItem
                                onClick={() => onCancelInvitation(member.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Annuller invitation
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setMemberToRemove(member.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Fjern medlem
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
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
        open={memberToRemove !== null}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fjern teammedlem</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil fjerne dette teammedlem? De vil miste
              adgang til galleriet og alle dets funktioner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuller</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToRemove) {
                  onRemoveMember(memberToRemove)
                  setMemberToRemove(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Fjern medlem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
