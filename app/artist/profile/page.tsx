"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Palette, Video, Image as ImageIcon, Globe, Instagram, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function ArtistProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    bio: "",
    presentation_video_url: "",
    profile_image_url: "",
    website_url: "",
    instagram_handle: "",
  })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadUserAndProfile()
  }, [])

  const loadUserAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) throw error

      if (profileData.role !== "artist") {
        router.push("/")
        return
      }

      setUserRole(profileData.role)
      setProfile({
        bio: profileData.bio || "",
        presentation_video_url: profileData.presentation_video_url || "",
        profile_image_url: profileData.profile_image_url || "",
        website_url: profileData.website_url || "",
        instagram_handle: profileData.instagram_handle || "",
      })
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          profile_completed: true,
        })
        .eq("id", user.id)

      if (error) throw error

      alert("Profil gemt! Du kan nu uploade kunstværker.")
      router.push("/upload")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Fejl ved gemning af profil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Palette className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Indlæser...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <SiteHeader user={user} userRole={userRole} />

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbage til forsiden
        </Link>

        <Card className="border-purple-100 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Kunstnerprofil</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Opret din profil før du uploader kunstværker
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Om dig som kunstner *
              </Label>
              <Textarea
                id="bio"
                placeholder="Fortæl om din kunstneriske baggrund, stil og inspiration..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={6}
                className="resize-none"
                required
              />
              <p className="text-xs md:text-sm text-gray-500">
                Dette vises på din kunstnerside og hjælper købere med at forstå din kunst
              </p>
            </div>

            {/* Presentation Video */}
            <div className="space-y-2">
              <Label htmlFor="video" className="text-base font-semibold flex items-center gap-2">
                <Video className="h-4 w-4" />
                Præsentationsvideo (valgfrit)
              </Label>
              <Input
                id="video"
                type="url"
                placeholder="https://youtube.com/watch?v=... eller https://vimeo.com/..."
                value={profile.presentation_video_url}
                onChange={(e) => setProfile({ ...profile, presentation_video_url: e.target.value })}
              />
              <p className="text-xs md:text-sm text-gray-500">
                Upload en video til YouTube eller Vimeo og indsæt linket her
              </p>
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Profilbillede URL (valgfrit)
              </Label>
              <Input
                id="image"
                type="url"
                placeholder="https://..."
                value={profile.profile_image_url}
                onChange={(e) => setProfile({ ...profile, profile_image_url: e.target.value })}
              />
              <p className="text-xs md:text-sm text-gray-500">
                Upload dit profilbillede via Assets-menuen og indsæt URL'en her
              </p>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Hjemmeside (valgfrit)
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://dinhjemmeside.dk"
                value={profile.website_url}
                onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-base font-semibold flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram brugernavn (valgfrit)
              </Label>
              <Input
                id="instagram"
                type="text"
                placeholder="ditbrugernavn"
                value={profile.instagram_handle}
                onChange={(e) => setProfile({ ...profile, instagram_handle: e.target.value })}
              />
              <p className="text-xs md:text-sm text-gray-500">
                Uden @ - f.eks. "ditbrugernavn"
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSave}
                disabled={saving || !profile.bio}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                {saving ? "Gemmer..." : "Gem profil og fortsæt"}
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50" size="lg">
                  Annuller
                </Button>
              </Link>
            </div>

            <p className="text-xs md:text-sm text-gray-500 text-center">
              * Påkrævet felt. Du kan altid redigere din profil senere.
            </p>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
