import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Sparkles, Palette } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-8 md:py-12" aria-labelledby="features-heading">
      <h2 id="features-heading" className="sr-only">Fordele ved ART IS SAFE</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
        <Card className="border-purple-100 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg md:text-xl">Erhvervskunst til Virksomheder</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-gray-600">
              Skab inspirerende arbejdsmiljøer med original kunst til kontoret. Professionel service og sikker betaling gennem escrow-system.
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-100 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-pink-600" />
            </div>
            <CardTitle className="text-lg md:text-xl">Sikker Escrow-Betaling</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-gray-600">
              100% sikker betaling med escrow-system. Pengene frigives først når kunstværket er modtaget og godkendt.
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 md:mb-4">
              <Palette className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg md:text-xl">Danske Kunstnere</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-gray-600">
              Køb original kunst direkte fra talentfulde danske kunstnere. Unikke kunstværker der skaber værdi i dit kontor.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
