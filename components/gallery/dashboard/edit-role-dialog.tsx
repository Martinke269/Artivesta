'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Users } from 'lucide-react'
import type { TeamMember } from '@/lib/supabase/gallery-team-queries'

interface EditRoleDialogProps {
  member: TeamMember | null
  currentUserRole: 'owner' | 'manager' | 'curator' | 'staff'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (memberId: string, newRole: 'manager' | 'curator' | 'staff') => Promise<void>
}

export function EditRoleDialog({
  member,
  currentUserRole,
  open,
  onOpenChange,
  onSave,
}: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'manager' | 'curator' | 'staff'>(
    member?.role === 'owner' ? 'manager' : (member?.role as 'manager' | 'curator' | 'staff') || 'staff'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    if (!member) return

    setIsSubmitting(true)
    try {
      await onSave(member.id, selectedRole)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleDescription = (role: string) => {
    const descriptions = {
      manager: 'Kan invitere kunstnere og teammedlemmer, administrere kunstværker og se alle data',
      curator: 'Kan administrere kunstværker og se alle data, men kan ikke ændre roller',
      staff: 'Kan se data, men har kun læseadgang til de fleste funktioner',
    }
    return descriptions[role as keyof typeof descriptions] || ''
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rediger Rolle</DialogTitle>
          <DialogDescription>
            Skift rollen for {member.user.full_name || member.user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Ny Rolle</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as 'manager' | 'curator' | 'staff')
              }
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentUserRole === 'owner' && (
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Manager</span>
                    </div>
                  </SelectItem>
                )}
                <SelectItem value="curator">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Kurator</span>
                  </div>
                </SelectItem>
                <SelectItem value="staff">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Assistent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getRoleDescription(selectedRole)}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">
              Rollebeskrivelser
            </h4>
            <ul className="space-y-1 text-xs text-blue-800">
              {currentUserRole === 'owner' && (
                <li>
                  <strong>Manager:</strong> Fuld adgang undtagen at ændre
                  ejerens rolle
                </li>
              )}
              <li>
                <strong>Kurator:</strong> Kan administrere kunstværker og
                se data
              </li>
              <li>
                <strong>Assistent:</strong> Primært læseadgang til data
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuller
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Gemmer...' : 'Gem Ændringer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
