import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Shield, CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Sikker escrow-betaling | ART IS SAFE",
  description: "Forstå hvordan vores escrow-betaling beskytter både kunstnere og købere. Fuld tryghed gennem hele transaktionen.",
}

export default function EscrowPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader user={null} userRole={null} />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Shield className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">Escrow-betaling</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Sikker betaling for alle parter
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vores escrow-system beskytter både kunstnere og købere. 
            Pengene frigives først når kunsten er leveret og godkendt.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Sådan fungerer escrow-betaling
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Køber betaler</h3>
                <p className="text-sm text-gray-600">
                  Betalingen går til vores sikre escrow-konto, ikke direkte til kunstneren
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Kunstner leverer</h3>
                <p className="text-sm text-gray-600">
                  Kunstneren pakker og sender kunstværket til køberen
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Køber godkender</h3>
                <p className="text-sm text-gray-600">
                  Køberen modtager og inspicerer kunstværket
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold mx-auto">
                  4
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Penge frigives</h3>
                <p className="text-sm text-gray-600">
                  Ved godkendelse frigives pengene til kunstneren
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for buyers */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Fordele for købere
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Dine penge er beskyttet indtil du modtager kunsten",
              "Mulighed for at inspicere værket før betaling frigives",
              "Fuld refundering hvis værket ikke lever op til beskrivelsen",
              "Ingen risiko for svindel eller manglende levering",
              "Professionel håndtering af tvister",
              "Transparent proces hele vejen"
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                <span className="text-gray-900">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for artists */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Fordele for kunstnere
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Garanteret betaling når værket er leveret",
                "Beskyttelse mod uberettigede krav",
                "Professionel platform der skaber tillid",
                "Automatisk udbetaling ved godkendelse",
                "Ingen risiko for manglende betaling",
                "Fokus på dit kunstneriske arbejde"
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 p-4">
                  <CheckCircle2 className="w-6 h-6 text-gray-900 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Sikkerhed i verdensklasse
          </h2>
          <p className="text-xl text-gray-600">
            Vores escrow-system er bygget med de højeste sikkerhedsstandarder. 
            Alle transaktioner er krypterede og overvåges 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Sikker betaling</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Overvågning</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Svindelsager</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Klar til at handle med tryghed?
            </h2>
            <p className="text-xl text-gray-300">
              Oplev forskellen med sikker escrow-betaling
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#artwork-grid">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 h-14 px-10">
                  Udforsk kunst
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/for-kunstnere">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 h-14 px-10">
                  Bliv kunstner
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
