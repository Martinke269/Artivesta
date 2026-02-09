import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle2, ArrowRight, Sparkles, Shield, Video, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nye Kunstnere - Sælg Din Kunst Online | ArtIsSafe',
  description: 'Start din kunstkarriere med ArtIsSafe. Gratis kunstnerprofil, ingen forudgående omkostninger, og kun 20% kommission når du sælger. No cure, no pay.',
  keywords: 'nye kunstnere, sælg kunst online, kunstnerprofil, kunstmarkedsplads, kunstsalg',
}

export default function NyeKunstnere() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Tjen penge på din kunst – no cure, no pay
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Få din egen professionelle kunstnerprofil og sælg din kunst online. Ingen forudgående omkostninger – du betaler kun når du sælger.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              Tilmeld dig som kunstner <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Dine Fordele</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ingen gebyrer, ingen risiko</h3>
                <p className="text-gray-600">
                  Ingen forudgående omkostninger. Du betaler kun når du tjener penge.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">20% kommission</h3>
                <p className="text-gray-600">
                  Du beholder 80% af salgsprisen. Kun 20% kommission når dit værk sælges.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gratis kunstnerprofil</h3>
                <p className="text-gray-600">
                  Få din egen professionelle profil med ubegrænset antal værker. Helt gratis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Video className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gratis præsentationsvideo</h3>
                <p className="text-gray-600">
                  Vi hjælper dig med at lave en professionel video, der præsenterer dig og dit arbejde.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Alle betalinger håndteres sikkert gennem vores escrow-system. Du får dine penge garanteret.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sælg til B2B-kunder med større budgetter</h3>
                <p className="text-gray-600">
                  Din kunst bliver vist til virksomheder, hoteller og kontorer med større indkøbsbudgetter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Sådan fungerer det</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Opret Din Profil</h3>
                <p className="text-gray-600">
                  Tilmeld dig gratis og opret din kunstnerprofil. Upload dine værker og fortæl din historie.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi Markedsfører Din Kunst</h3>
                <p className="text-gray-600">
                  Din kunst bliver vist til både private købere og virksomheder. Vi håndterer markedsføringen.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sælg og Få Betalt</h3>
                <p className="text-gray-600">
                  Når dit værk sælges, håndterer vi betalingen sikkert. Du får 80% af salgsprisen direkte til din konto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ArtIsSafe */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Hvorfor vælge ArtIsSafe</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-lg text-gray-700 mb-6">
              ArtIsSafe er skabt specielt til kunstnere, der vil fokusere på deres kunst – ikke på salg og administration. 
              Vi tager os af alt det praktiske, så du kan koncentrere dig om det, du er bedst til: at skabe kunst.
            </p>
            <p className="text-lg text-gray-700">
              Med vores no cure, no pay model tager vi risikoen, ikke dig. Du betaler kun når du tjener penge. 
              Samtidig får du adgang til både private købere og virksomheder med større budgetter.
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
                Koster det noget at oprette en profil?
              </AccordionTrigger>
              <AccordionContent>
                Nej, det er helt gratis at oprette en kunstnerprofil på ArtIsSafe. Du kan uploade ubegrænset antal værker uden nogen forudgående omkostninger. Du betaler kun 20% kommission når et værk sælges.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvor meget tjener jeg på et salg?
              </AccordionTrigger>
              <AccordionContent>
                Du beholder 80% af salgsprisen. Vi tager kun 20% i kommission, og det først når dit værk er solgt. Ingen skjulte gebyrer eller månedlige abonnementer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvordan fungerer betalingen?
              </AccordionTrigger>
              <AccordionContent>
                Vi bruger et sikkert escrow-system. Når en køber betaler, holder vi pengene sikkert indtil værket er leveret og godkendt. Derefter udbetaler vi din andel direkte til din konto. Dette beskytter både dig og køberen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Hvem ser min kunst?
              </AccordionTrigger>
              <AccordionContent>
                Din kunst bliver vist til både private kunstkøbere og virksomheder. Vi markedsfører aktivt til kontorer, hoteller, restauranter og andre erhvervskunder, der ofte har større budgetter end private købere.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Kan jeg stadig sælge min kunst andre steder?
              </AccordionTrigger>
              <AccordionContent>
                Ja, du beholder alle rettigheder til din kunst. Du kan frit sælge dine værker gennem andre kanaler samtidig. Vi anbefaler dog at opdatere din profil hvis et værk bliver solgt andetsteds.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar Til At Starte Din Kunstkarriere?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Opret din gratis profil i dag og begynd at sælge din kunst online.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/signup">
              Tilmeld dig som kunstner <ArrowRight className="ml-2 h-5 w-5" />
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
