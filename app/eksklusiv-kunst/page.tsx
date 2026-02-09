import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Crown, ArrowRight, Shield, Star, Users, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Eksklusiv Kunstplatform - For Kunstnere Der Værdsætter Kvalitet | ArtIsSafe',
  description: 'Bliv en del af en kurateret platform med håndplukkede kunstnere. Eksklusiv adgang til seriøse købere og erhvervskunder.',
  keywords: 'eksklusiv kunst, kurateret kunstplatform, håndplukkede kunstnere, premium kunst',
}

export default function EksklusivKunst() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Bliv en del af en kurateret kunstplatform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Vi kuraterer omhyggeligt. Kun håndplukkede kunstnere får adgang til vores platform og de købere, der værdsætter kvalitet og originalitet.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              Ansøg som kunstner <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Hvorfor Vælge Vores Platform</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Crown className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede Kunstnere</h3>
                <p className="text-gray-600">
                  Vi kuraterer vores platform omhyggeligt. Kun kunstnere med dokumenteret kvalitet optages.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ingen prints, ingen masseplatform</h3>
                <p className="text-gray-600">
                  Vi er ikke en åben markedsplads. Kun kuraterede kunstnere med originale værker.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Original fysisk kunst</h3>
                <p className="text-gray-600">
                  Vi fokuserer udelukkende på originale fysiske værker. Ingen prints eller masseproduktion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker Escrow-Betaling</h3>
                <p className="text-gray-600">
                  Alle transaktioner sikres gennem vores escrow-system. Pengene frigives først ved levering.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel præsentation</h3>
                <p className="text-gray-600">
                  Din kunst præsenteres i premium kvalitet til et publikum, der forstår værdien.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Sådan Fungerer Det</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Ansøg Med Din Portefølje</h3>
                <p className="text-gray-600">
                  Indsend din portefølje, CV og kunstnerstatement. Vi gennemgår hver ansøgning individuelt og lægger vægt på kvalitet og originalitet.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bliv En Del Af Fællesskabet</h3>
                <p className="text-gray-600">
                  Når du er optaget, får du din egen professionelle profil blandt andre kuraterede kunstnere. Vi hjælper med optimal præsentation.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Nå De Rette Købere</h3>
                <p className="text-gray-600">
                  Vi markedsfører eksklusivt til seriøse samlere, virksomheder og institutioner, der søger kvalitetskunst.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ArtIsSafe */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Hvorfor Vælge ArtIsSafe</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-lg text-gray-700 mb-6">
              Eksklusivitet handler ikke om at være utilgængelig – det handler om at værne om kvalitet. På ArtIsSafe kuraterer vi omhyggeligt, 
              fordi vi ved at både kunstnere og købere værdsætter en platform, hvor hvert værk er udvalgt med omhu.
            </p>
            <p className="text-lg text-gray-700">
              Når du er en del af vores platform, står du side om side med andre seriøse kunstnere. Dine værker præsenteres for købere, 
              der forstår forskellen på kunst og dekoration. Vi forbinder dig med virksomheder, samlere og institutioner, 
              der investerer i original kunst af høj kvalitet.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ofte Stillede Spørgsmål</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Hvad kræves for at blive optaget?
              </AccordionTrigger>
              <AccordionContent>
                Vi leder efter kunstnere med en dokumenteret praksis, konsistent kvalitet og et unikt kunstnerisk udtryk. 
                Indsend din portefølje (minimum 10 værker), CV med relevante udstillinger eller anerkendelser, og et kunstnerstatement. 
                Vi vurderer både teknisk kunnen og konceptuel dybde.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvor mange kunstnere optager I?
              </AccordionTrigger>
              <AccordionContent>
                Vi har ikke et fast antal, men vi er selektive. Vi optager kun kunstnere, der matcher vores kvalitetsstandarder 
                og som tilføjer noget unikt til platformen. Dette sikrer at hver kunstner får den opmærksomhed, de fortjener.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvad adskiller jer fra andre platforme?
              </AccordionTrigger>
              <AccordionContent>
                Vi er ikke en åben markedsplads. Hver kunstner gennemgår en kurateringsproces. Dette betyder at købere ved, 
                at alt på platformen er udvalgt med omhu. Vi fokuserer også specifikt på erhvervskunder med større budgetter, 
                ikke kun private købere.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Kan jeg blive ekskluderet senere?
              </AccordionTrigger>
              <AccordionContent>
                Vi forventer at kunstnere opretholder kvaliteten af deres arbejde og professionel adfærd. 
                Hvis et samarbejde ikke fungerer for begge parter, kan det afsluttes. Men vores mål er langsigtede partnerskaber 
                med kunstnere, der deler vores værdier.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvor lang tid tager ansøgningsprocessen?
              </AccordionTrigger>
              <AccordionContent>
                Vi gennemgår alle ansøgninger grundigt, hvilket typisk tager 5-7 hverdage. 
                Hvis vi har brug for yderligere information eller materiale, kontakter vi dig. 
                Vi giver altid et detaljeret svar, uanset om ansøgningen godkendes eller ej.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar Til At Blive En Del Af Noget Eksklusivt?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Ansøg i dag og bliv en del af en kurateret platform for seriøse kunstnere.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              Ansøg som kunstner <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer Link */}
      <section className="container mx-auto px-4 py-8 text-center">
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
          ← Tilbage til forsiden
        </Link>
      </section>
    </div>
  )
}
