import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Professionel kuratering | ART IS SAFE",
  description: "Få hjælp til at finde det perfekte kunstværk til din virksomhed. Professionel kunstkuratering tilpasset dit rum og budget.",
}

export default function KurateringPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader user={null} userRole={null} />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Sparkles className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">Kuratering</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Professionel kunstkuratering til din virksomhed
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vi hjælper dig med at finde det perfekte kunstværk der matcher dit rum, 
            din stil og dit budget. Personlig vejledning gennem hele processen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 h-14 px-10">
                Kom i gang
              </Button>
            </Link>
            <Link href="/#artwork-grid">
              <Button size="lg" variant="outline" className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white h-14 px-10">
                Se kunstværker
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

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Fortæl os om dit rum</h3>
                <p className="text-gray-600">
                  Del billeder og beskrivelser af det rum hvor kunsten skal hænge. 
                  Vi tager højde for stil, farver og atmosfære.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Få personlige forslag</h3>
                <p className="text-gray-600">
                  Vores eksperter udvælger kunstværker der passer perfekt til dit rum. 
                  Du får 3-5 kuraterede forslag at vælge imellem.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Køb med tryghed</h3>
                <p className="text-gray-600">
                  Vælg dit favorit kunstværk og køb med sikker escrow-betaling. 
                  Vi håndterer levering og ophængning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Fordele ved professionel kuratering
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Spar tid - vi finder de bedste værker til dig",
              "Ekspert vejledning gennem hele processen",
              "Tilpasset dit rum, stil og budget",
              "Adgang til eksklusiv kunst",
              "Professionel levering og ophængning",
              "Fuld tryghed med escrow-betaling"
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Klar til at finde det perfekte kunstværk?
            </h2>
            <p className="text-xl text-gray-300">
              Kontakt os i dag og få personlig vejledning fra vores kunsteksperter
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
