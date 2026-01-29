"use client"

import { Button } from "@/components/ui/button"
import { Palette, Building2, Sparkles, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface SiteHeaderProps {
  user: any
  userRole: string | null
}

export function SiteHeader({ user, userRole }: SiteHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Palette className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ART IS SAFE
            </h1>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                {userRole === "artist" && (
                  <>
                    <Link href="/artist/profile">
                      <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                        <User className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Min Profil</span>
                        <span className="md:hidden">Profil</span>
                      </Button>
                    </Link>
                    <Link href="/upload" className="hidden sm:block">
                      <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Upload Kunst</span>
                        <span className="md:hidden">Upload</span>
                      </Button>
                    </Link>
                    <Link href="/my-artworks">
                      <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                        <span className="hidden md:inline">Mine Kunstværker</span>
                        <span className="md:hidden">Mine Værker</span>
                      </Button>
                    </Link>
                  </>
                )}
                {userRole === "business" && (
                  <Link href="/orders">
                    <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Mine Ordrer</span>
                      <span className="md:hidden">Ordrer</span>
                    </Button>
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log ud
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                    Log ind
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Kom i gang
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
