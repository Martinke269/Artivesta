import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { TrendingUp, ArrowRight, Building2, Shield, Users, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Etablerede Kunstnere - Sælg Til Virksomheder | ArtIsSafe',
  description: 'Få adgang til erhvervskunder med større budgetter. Professionel præsentation, sikker betaling og kun 20% kommission. Perfekt for etablerede kunstnere.',
  keywords: 'etablerede kunstnere, sælg kunst til virksomheder, erhvervskunder, kunstsalg B2B',
}

export default function EtableredeKunstnere() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Sælg din kunst til virksomheder – større budgetter, færre tidsrøvere
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tag din kunstkarriere til næste niveau. Vi forbinder dig med erhvervskunder, der investerer i kvalitetskunst til kontorer, hoteller og offentlige rum.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              Bliv en håndplukket kunstner <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Fordele For Etablerede Kunstnere</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600">
                  Vi kuraterer vores platform omhyggeligt, så din kunst præsenteres blandt kvalitetsværker og seriøse kunstnere.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel præsentation</h3>
                <p className="text-gray-600">
                  Din kunst vises i høj kvalitet med professionelle billeder og detaljerede beskrivelser der sælger.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Alle transaktioner sikres gennem vores escrow-system. Pengene frigives først ved levering.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Building2 className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">B2B-kunder med større budgetter</h3>
                <p className="text-gray-600">
                  Få direkte adgang til virksomheder, hoteller og kontorer med professionelle indkøbsbudgetter.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cure, no pay</h3>
                <p className="text-gray-600">
                  Kun 20% kommission ved salg. Ingen forudgående omkostninger eller skjulte gebyrer.
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
                <h3 className="text-xl font-semibold mb-2">Ansøg Om Optagelse</h3>
                <p className="text-gray-600">
                  Send os din portefølje og kunstnerbiografi. Vi gennemgår alle ansøgninger individuelt for at sikre kvalitet.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Præsenter Dine Værker</h3>
                <p className="text-gray-600">
                  Upload dine værker til din profil. Vi hjælper med professionel fotografering og præsentation hvis nødvendigt.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi Finder Køberne</h3>
                <p className="text-gray-600">
                  Vi markedsfører aktivt til virksomheder og matcher dine værker med de rette erhvervskunder.
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
              Som etableret kunstner ved du, at det rigtige publikum gør hele forskellen. ArtIsSafe giver dig adgang til erhvervskunder, 
              der ikke bare køber kunst – de investerer i den. Kontorer, hoteller og virksomheder søger kvalitetskunst, og de har budgetterne til at matche.
            </p>
            <p className="text-lg text-gray-700">
              Vi håndterer alt det praktiske: markedsføring, kundeservice, betalinger og logistik. Du fokuserer på din kunst, 
              mens vi sikrer at den når de rette købere. Med kun 20% kommission og ingen forudgående omkostninger er det en risikofri måde at udvide dit marked på.
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
                Hvordan bliver jeg optaget på platformen?
              </AccordionTrigger>
              <AccordionContent>
                Vi gennemgår alle ansøgninger individuelt. Send os din portefølje, CV og en kort beskrivelse af din kunstneriske praksis. 
                Vi lægger vægt på kvalitet, originalitet og professionel præsentation. Du får svar inden for 5 hverdage.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvilke typer virksomheder køber gennem ArtIsSafe?
              </AccordionTrigger>
              <AccordionContent>
                Vores erhvervskunder spænder fra tech-virksomheder og advokatfirmaer til hoteller, restauranter og sundhedsklinikker. 
                Fælles for dem er, at de søger original kunst af høj kvalitet til deres lokaler og har professionelle indkøbsbudgetter.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Kan jeg sætte mine egne priser?
              </AccordionTrigger>
              <AccordionContent>
                Ja, du fastsætter selv priserne på dine værker. Vi kan dog rådgive om prisniveauer baseret på markedsdata og erfaring med erhvervskunder. 
                Vores mål er at hjælpe dig med at prissætte konkurrencedygtigt uden at undervurdere dit arbejde.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Hvad sker der hvis et værk bliver beskadiget under transport?
              </AccordionTrigger>
              <AccordionContent>
                Alle forsendelser er fuldt forsikret. Hvis et værk beskadiges under transport, dækker forsikringen den fulde værdi. 
                Du modtager din betaling som aftalt, og vi håndterer alle forsikringskrav.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Kan jeg også sælge gennem gallerier samtidig?
              </AccordionTrigger>
              <AccordionContent>
                Ja, du kan frit arbejde med gallerier og andre salgskanaler. Vi anbefaler at koordinere, så samme værk ikke tilbydes flere steder samtidig. 
                Mange af vores kunstnere bruger ArtIsSafe som supplement til deres gallerisalg, især til erhvervskunder.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar Til At Nå Nye Kunder?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Ansøg i dag og få adgang til erhvervskunder med professionelle budgetter.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              Bliv en håndplukket kunstner <ArrowRight className="ml-2 h-5 w-5" />
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
