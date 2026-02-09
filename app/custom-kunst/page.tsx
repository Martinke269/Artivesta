import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Paintbrush, CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Custom kunst | ART IS SAFE",
  description: "Bestil skræddersyet kunst til din virksomhed. Arbejd direkte med professionelle kunstnere om unikke værker.",
}

export default function CustomKunstPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader user={null} userRole={null} />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Paintbrush className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">Custom kunst</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Skræddersyet kunst til din virksomhed
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Få skabt et unikt kunstværk der perfekt matcher din virksomheds identitet. 
            Arbejd direkte med professionelle kunstnere om dit drømmeprojekt.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 h-14 px-10">
                Kom i gang
              </Button>
            </Link>
            <Link href="/#artwork-grid">
              <Button size="lg" variant="outline" className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white h-14 px-10">
                Se kunstnere
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Sådan fungerer det
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Beskriv dit projekt</h3>
                <p className="text-sm text-gray-600">
                  Fortæl os om din vision, stil, størrelse og budget
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Match med kunstner</h3>
                <p className="text-sm text-gray-600">
                  Vi finder den perfekte kunstner til dit projekt
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Samarbejd og skitser</h3>
                <p className="text-sm text-gray-600">
                  Arbejd tæt sammen om design og godkend skitser
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Modtag dit værk</h3>
                <p className="text-sm text-gray-600">
                  Kunstneren skaber værket og leverer det til dig
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Perfekt til
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Virksomhedslogo som kunstværk",
              "Brandfarver og identitet",
              "Specifikke størrelser og formater",
              "Tematisk kunst til særlige rum",
              "Serier af sammenhængende værker",
              "Kunst der fortæller jeres historie"
            ].map((useCase) => (
              <div key={useCase} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 text-lg">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Fordele ved custom kunst
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3 text-center">
                <h3 className="text-xl font-semibold text-gray-900">100% unikt</h3>
                <p className="text-gray-600">
                  Dit kunstværk er skabt specifikt til dig og findes ikke andre steder
                </p>
              </div>

              <div className="space-y-3 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Perfekt match</h3>
                <p className="text-gray-600">
                  Præcis de farver, stil og størrelse der passer til dit rum
                </p>
              </div>

              <div className="space-y-3 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Sikker proces</h3>
                <p className="text-gray-600">
                  Escrow-betaling beskytter dig gennem hele samarbejdet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Klar til at skabe dit unikke kunstværk?
            </h2>
            <p className="text-xl text-gray-300">
              Kontakt os i dag og fortæl os om dit projekt
            </p>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 h-14 px-10">
                Kom i gang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
