"use client"

import { Button } from "@/components/ui/button"
import { Palette, Building2, Sparkles, User, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Palette className="h-6 w-6 md:h-8 md:w-8 text-purple-600 group-hover:rotate-12 transition-transform duration-300" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ART IS SAFE
            </h1>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* B2B Partners Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex hover:bg-purple-50 transition-all duration-300">
                  <Building2 className="h-4 w-4 mr-2" />
                  B2B Partnere
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Vores økosystem</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.regnskabsanalysen.dk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>Regnskabsanalysen.dk</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.oppmysales.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>OppMySales.com</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Support værktøjer
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.klartilbanken.dk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>Klartilbanken.dk</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.budgetberegneren.dk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>Budgetberegneren.dk</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                {userRole === "artist" && (
                  <>
                    <Link href="/artist/profile">
                      <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
                        <User className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Min Profil</span>
                        <span className="md:hidden">Profil</span>
                      </Button>
                    </Link>
                    <Link href="/upload" className="hidden sm:block">
                      <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
                        <Sparkles className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Upload Kunst</span>
                        <span className="md:hidden">Upload</span>
                      </Button>
                    </Link>
                    <Link href="/my-artworks">
                      <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
                        <span className="hidden md:inline">Mine Kunstværker</span>
                        <span className="md:hidden">Mine Værker</span>
                      </Button>
                    </Link>
                  </>
                )}
                {userRole === "business" && (
                  <Link href="/orders">
                    <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Mine Ordrer</span>
                      <span className="md:hidden">Ordrer</span>
                    </Button>
                  </Link>
                )}
                {userRole === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-purple-50 transition-all duration-300">
                  Log ud
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
                    Log ind
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
