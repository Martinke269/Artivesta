import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Palette, Search } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  user: any
  searchQuery: string
  setSearchQuery: (value: string) => void
  onSearchSubmit?: () => void
}

export function HeroSection({ user, searchQuery, setSearchQuery, onSearchSubmit }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20 text-center" aria-label="Hero sektion">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Professionel kunst til erhvervslivet
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Transformer dit kontor med original kunst
          </span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          Køb direkte fra talentfulde kunstnere. Sikker betaling gennem escrow. Perfekt til virksomheder der ønsker at skabe inspirerende arbejdspladser.
        </p>

        {/* CTA Buttons */}
        {!user && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6 h-auto">
                <Building2 className="h-5 w-5 mr-2" />
                Kom i gang
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
