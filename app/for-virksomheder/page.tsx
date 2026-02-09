import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Building2, Shield, Palette, CheckCircle2, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "For virksomheder | ART IS SAFE",
  description: "Professionel kunst til erhvervslivet. Kuratering, sikker escrow-betaling og kvalitetssikrede værker.",
}

export default function ForVirksomhederPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader user={null} userRole={null} />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <Building2 className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-semibold text-gray-900">For virksomheder</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Skab inspirerende arbejdspladser med original kunst
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vi hjælper virksomheder med at finde det perfekte kunstværk til deres rum. 
            Professionel kuratering, sikker betaling og kvalitetssikrede værker.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="#artwork-grid">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 h-14 px-10">
                Udforsk kunst
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white h-14 px-10">
                Kom i gang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
              Hvorfor vælge ART IS SAFE?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Professionel kuratering</h3>
                <p className="text-gray-600">
                  Vi hjælper dig med at finde det perfekte kunstværk til dit rum. 
                  Vores eksperter guider dig gennem hele processen.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Dine penge er beskyttet indtil kunsten er leveret og godkendt. 
                  Fuld tryghed gennem hele købet.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Kvalitetssikrede værker</h3>
                <p className="text-gray-600">
                  Kun håndplukkede kunstnere med dokumenteret kvalitet. 
                  Original fysisk kunst i højere prisklasser.
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

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Kontorer og arbejdspladser",
              "Receptioner og lobbyer",
              "Mødelokaler",
              "Konferencefaciliteter",
              "Hoteller og restauranter",
              "Sundhedsinstitutioner"
            ].map((useCase) => (
              <div key={useCase} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-gray-900 flex-shrink-0" />
                <span className="text-gray-900">{useCase}</span>
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
              Udforsk vores kuraterede samling af original kunst fra professionelle kunstnere
            </p>
            <Link href="/#artwork-grid">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 h-14 px-10">
                Udforsk kunst
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
