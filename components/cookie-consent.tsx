'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Settings } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  })
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPreferences = async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id || null)

    if (user) {
      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from('user_preferences')
        .select('cookie_consent')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        const saved = data.cookie_consent as CookiePreferences
        setPreferences(saved)
        if (saved.analytics) {
          enableAnalytics()
        }
      } else {
        // No preferences saved yet, show banner
        setTimeout(() => setShowBanner(true), 1000)
      }
    } else {
      // For anonymous users, always show banner (no localStorage fallback)
      setTimeout(() => setShowBanner(true), 1000)
    }
  }

  const enableAnalytics = () => {
    // Set analytics cookie
    document.cookie = `artissafe_analytics=true; path=/; max-age=${60 * 60 * 24 * 365 * 2}; SameSite=Lax`
    
    // Here you would initialize your analytics service
    // For example: Google Analytics, Plausible, etc.
    console.log('Analytics enabled')
  }

  const disableAnalytics = () => {
    // Remove analytics cookie
    document.cookie = 'artissafe_analytics=; path=/; max-age=0'
    console.log('Analytics disabled')
  }

  const savePreferences = async (prefs: CookiePreferences) => {
    if (userId) {
      // Save to Supabase for authenticated users only
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          cookie_consent: prefs,
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Failed to save preferences to Supabase:', error)
      }
    }
    // Note: Anonymous users' preferences are not persisted - they'll see the banner on each visit

    // Set consent cookie for current session
    document.cookie = `artissafe_consent=true; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    
    // Apply or remove analytics based on preference
    if (prefs.analytics) {
      enableAnalytics()
    } else {
      disableAnalytics()
    }
    
    setPreferences(prefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allAccepted)
  }

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    savePreferences(necessaryOnly)
  }

  const saveCustomPreferences = () => {
    savePreferences(preferences)
  }

  if (!showBanner) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <Card className="max-w-4xl mx-auto bg-white shadow-2xl border-2 border-purple-200">
          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Vi bruger cookies 🍪
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Vi bruger cookies for at forbedre din oplevelse på vores platform. 
                  Nødvendige cookies er altid aktiveret, men du kan vælge at acceptere 
                  eller afvise andre typer cookies.
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Luk"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={acceptAll}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Accepter alle
              </Button>
              <Button
                onClick={acceptNecessary}
                variant="outline"
                className="flex-1"
              >
                Kun nødvendige
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Indstillinger
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              Læs mere i vores{' '}
              <Link href="/cookies" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                cookie-politik
              </Link>
            </p>
          </div>
        </Card>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie-indstillinger</DialogTitle>
            <DialogDescription>
              Vælg hvilke typer cookies du vil acceptere. Nødvendige cookies kan ikke slås fra.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <Label htmlFor="necessary" className="text-base font-semibold">
                  Nødvendige cookies
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Disse cookies er essentielle for at hjemmesiden kan fungere. 
                  De kan ikke slås fra.
                </p>
              </div>
              <Switch
                id="necessary"
                checked={true}
                disabled
                className="mt-1"
              />
            </div>

            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <Label htmlFor="functional" className="text-base font-semibold">
                  Funktionelle cookies
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Disse cookies gør det muligt for hjemmesiden at huske dine valg 
                  og give forbedrede funktioner.
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, functional: checked })
                }
                className="mt-1"
              />
            </div>

            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-semibold">
                  Analytiske cookies
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Disse cookies hjælper os med at forstå, hvordan besøgende bruger 
                  vores hjemmeside. Alle data er anonymiserede.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
                className="mt-1"
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-base font-semibold">
                  Marketing cookies
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Disse cookies bruges til at vise relevante annoncer og måle 
                  effektiviteten af vores marketingkampagner.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={saveCustomPreferences}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Gem indstillinger
            </Button>
            <Button
              onClick={acceptAll}
              variant="outline"
              className="flex-1"
            >
              Accepter alle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
