'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Shield, Key, Trash2, UserCog, AlertTriangle } from 'lucide-react'

interface SecuritySettingsProps {
  userRole: 'owner' | 'manager' | 'curator' | 'staff'
  isOwner: boolean
  onDeleteGallery?: () => Promise<void>
  onTransferOwnership?: () => void
}

export function SecuritySettings({
  userRole,
  isOwner,
  onDeleteGallery,
  onTransferOwnership,
}: SecuritySettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const roleLabels = {
    owner: 'Ejer',
    manager: 'Manager',
    curator: 'Kurator',
    staff: 'Assistent',
  }

  const roleDescriptions = {
    owner: 'Fuld adgang til alle funktioner inkl. sletning og ejerskabsoverførsel',
    manager: 'Kan administrere kunstværker, kunstnere, ordrer og indstillinger',
    curator: 'Kan administrere kunstværker og kunstnere',
    staff: 'Kan se data men ikke foretage ændringer',
  }

  const handleDelete = async () => {
    if (!onDeleteGallery) return
    setIsDeleting(true)
    try {
      await onDeleteGallery()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sikkerhed & Roller</CardTitle>
        <CardDescription>
          Administrer sikkerhedsindstillinger og adgangsniveauer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Role */}
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">Din rolle</h3>
                <p className="text-sm text-muted-foreground">{roleDescriptions[userRole]}</p>
              </div>
            </div>
            <Badge variant={isOwner ? 'default' : 'secondary'}>
              {roleLabels[userRole]}
            </Badge>
          </div>
        </div>

        {/* Password & 2FA */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Kontosikkerhed</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Key className="h-4 w-4" />
              Skift adgangskode
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" disabled>
              <Shield className="h-4 w-4" />
              Aktivér to-faktor autentificering (kommer snart)
            </Button>
          </div>
        </div>

        {/* Owner-only actions */}
        {isOwner && (
          <>
            <div className="border-t pt-6">
              <h3 className="mb-3 text-sm font-medium text-destructive">Farezone</h3>
              <div className="space-y-2">
                {/* Transfer Ownership */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-orange-600 hover:text-orange-700"
                    >
                      <UserCog className="h-4 w-4" />
                      Overfør ejerskab
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Overfør ejerskab</AlertDialogTitle>
                      <AlertDialogDescription>
                        Denne funktion er under udvikling. Du vil snart kunne overføre ejerskabet
                        af galleriet til et andet teammedlem.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Luk</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete Gallery */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Slet galleri
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Er du helt sikker?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          Denne handling kan <strong>ikke</strong> fortrydes. Dette vil permanent
                          slette dit galleri og fjerne alle data inkl.:
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-sm">
                          <li>Alle kunstværker og deres metadata</li>
                          <li>Alle teammedlemmer og kunstnere</li>
                          <li>Alle ordrer og leasingaftaler</li>
                          <li>Alle analyser og AI-indsigter</li>
                        </ul>
                        <p className="pt-2 font-semibold">
                          Denne handling vil påvirke alle kunstnere og teammedlemmer tilknyttet
                          galleriet.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuller</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Sletter...' : 'Ja, slet galleri permanent'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        )}

        {!isOwner && (
          <p className="text-sm text-muted-foreground">
            Kun galleriets ejer kan udføre kritiske sikkerhedshandlinger som sletning og
            ejerskabsoverførsel.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
