'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Shield, UserPlus, Users } from 'lucide-react'

interface TeamInviteFormProps {
  currentUserRole: 'owner' | 'manager' | 'curator' | 'staff'
  onInviteTeamMember: (email: string, role: 'manager' | 'curator' | 'staff') => Promise<void>
}

export function TeamInviteForm({
  currentUserRole,
  onInviteTeamMember,
}: TeamInviteFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'manager' | 'curator' | 'staff'>('staff')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'manager'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) return

    setIsSubmitting(true)
    try {
      await onInviteTeamMember(email, role)
      setEmail('')
      setRole('staff')
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleDescription = (roleValue: string) => {
    const descriptions = {
      manager: 'Kan invitere kunstnere og teammedlemmer, administrere kunstværker og se alle data',
      curator: 'Kan administrere kunstværker og se alle data, men kan ikke ændre roller',
      staff: 'Kan se data, men har kun læseadgang til de fleste funktioner',
    }
    return descriptions[roleValue as keyof typeof descriptions] || ''
  }

  if (!canInvite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Invitationer
          </CardTitle>
          <CardDescription>
            Du har ikke tilladelse til at invitere teammedlemmer.
            Kontakt en ejer eller manager.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Inviter Teammedlem
        </CardTitle>
        <CardDescription>
          Inviter nye teammedlemmer til at hjælpe med at administrere galleriet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Inviter Teammedlem</DialogTitle>
                <DialogDescription>
                  Send en invitation til en ny teammedlem. De skal have en
                  eksisterende konto for at acceptere invitationen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="navn@eksempel.dk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Personen skal allerede have en konto i systemet
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle</Label>
                  <Select
                    value={role}
                    onValueChange={(value) =>
                      setRole(value as 'manager' | 'curator' | 'staff')
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
                    {getRoleDescription(role)}
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
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuller
                </Button>
                <Button type="submit" disabled={isSubmitting || !email}>
                  {isSubmitting ? 'Sender...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Info about pending invitations */}
        <div className="mt-4 rounded-lg border border-muted bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-semibold">Om Invitationer</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Inviterede medlemmer vises i tabellen med status "Inviteret"</li>
            <li>• De skal acceptere invitationen for at få adgang</li>
            <li>• Du kan annullere invitationer før de accepteres</li>
            <li>• Kun ejere kan invitere managers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
