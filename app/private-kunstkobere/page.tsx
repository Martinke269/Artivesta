import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Heart, ArrowRight, Shield, Star, Sparkles, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find Original Kunst til Dit Hjem – Håndplukket og Trygt | ArtIsSafe',
  description: 'Køb original fysisk kunst fra håndplukkede kunstnere. Sikker escrow-betaling, professionel kuratering og no cure, no pay. Perfekt til dit hjem.',
  keywords: 'køb kunst, original kunst, danske kunstnere, kunst til hjemmet, håndplukket kunst, escrow betaling, sikker kunsthandel',
  openGraph: {
    title: 'Find Original Kunst til Dit Hjem – Håndplukket og Trygt',
    description: 'Køb original fysisk kunst fra håndplukkede kunstnere. Sikker escrow-betaling og professionel kuratering.',
    type: 'website',
  }
}

export default function PrivateKunstkobere() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Find original kunst til dit hjem – håndplukket og trygt
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Køb original fysisk kunst fra håndplukkede danske kunstnere. Sikker escrow-betaling, professionel kuratering og ingen risiko.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/">
              Udforsk kunst <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Dine Fordele</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Vi gør kunstkøb sikkert, nemt og trygt med professionel service hele vejen
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Original fysisk kunst</h3>
                <p className="text-gray-600">
                  Kun originale fysiske værker. Ingen prints eller masseproduktion. Ægte kunst der holder sin værdi.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600">
                  Alle kunstnere er omhyggeligt udvalgt og verificeret. Du får adgang til kvalitetskunst fra talentfulde skabere.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Dine penge holdes sikkert i escrow. Kunstneren får først betaling når du har modtaget og godkendt værket.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel kuratering</h3>
                <p className="text-gray-600">
                  Eksperter vurderer og kuraterer alle værker. Du får professionel vejledning og kvalitetssikring.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cure, no pay</h3>
                <p className="text-gray-600">
                  Ingen risiko for dig. Hvis værket ikke lever op til forventningerne, får du dine penge tilbage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fuld dokumentation</h3>
                <p className="text-gray-600">
                  Alle værker er professionelt fotograferet og dokumenteret med mål, teknik, materiale og baggrund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Sådan Fungerer Det</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Udforsk og Find</h3>
                <p className="text-gray-600">
                  Gennemse vores kuraterede samling af original kunst. Filtrer efter stil, farve, størrelse og pris for at finde det perfekte værk.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Køb Sikkert</h3>
                <p className="text-gray-600">
                  Betal sikkert gennem vores escrow-system. Pengene holdes sikkert indtil værket er leveret og du har godkendt det.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Modtag og Nyd</h3>
                <p className="text-gray-600">
                  Værket leveres sikkert til din dør. Hæng det op og nyd din nye kunst hver dag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Hvorfor Vælge ArtIsSafe</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-lg text-gray-700 mb-6">
              At købe kunst skal være en glæde, ikke en bekymring. På ArtIsSafe kuraterer vi omhyggeligt, så du kun ser kvalitetskunst fra seriøse kunstnere. 
              Vores sikre betalingssystem beskytter dig gennem hele processen, og du får fuld dokumentation på dit værk.
            </p>
            <p className="text-lg text-gray-700">
              Vi tror på at gøre kunstkøb tilgængeligt og trygt. Ingen skjulte gebyrer, ingen mellemmænd der tager store marginer. 
              Bare direkte adgang til talentfulde kunstnere og deres værker. Når du køber på ArtIsSafe, støtter du kunstnere direkte 
              og får original kunst, der gør dit hjem unikt.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ofte Stillede Spørgsmål</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Hvordan ved jeg at kunsten er ægte og original?
              </AccordionTrigger>
              <AccordionContent>
                Alle værker er originale og kommer direkte fra kunstneren. Du får fuld dokumentation inklusiv autenticitetscertifikat. 
                Vi kuraterer omhyggeligt og arbejder kun med verificerede kunstnere. Hvert værk er unikt og signeret af kunstneren.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvordan fungerer escrow-betalingen?
              </AccordionTrigger>
              <AccordionContent>
                Når du køber, holdes dine penge sikkert i vores escrow-system. Kunstneren får først pengene når du har modtaget værket 
                og bekræftet at alt er i orden. Dette beskytter både dig og kunstneren gennem hele transaktionen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvad betyder "no cure, no pay"?
              </AccordionTrigger>
              <AccordionContent>
                Det betyder at du ikke betaler hvis værket ikke lever op til forventningerne. Hvis værket er beskadiget, ikke matcher 
                beskrivelsen, eller du af anden grund ikke er tilfreds, får du dine penge tilbage. Din tilfredshed er garanteret.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Hvad hvis jeg fortryder købet?
              </AccordionTrigger>
              <AccordionContent>
                Du har 14 dages fortrydelsesret fra modtagelse af værket. Værket skal returneres i samme stand som modtaget. 
                Kontakt os inden for fristen, så guider vi dig gennem returprocessen og refunderer dit køb.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvordan fungerer leveringen?
              </AccordionTrigger>
              <AccordionContent>
                Værker pakkes sikkert af kunstneren og sendes forsikret. Du får tracking information og kan følge forsendelsen. 
                Leveringstiden er typisk 5-10 hverdage afhængigt af værkets størrelse og kunstnerens placering. Alle forsendelser er fuldt forsikret.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Kan jeg få hjælp til at vælge det rigtige værk?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vores kuratorer kan hjælpe dig med at finde det perfekte værk til dit hjem. Kontakt os med information om dit rum, 
                stil-præferencer og budget, så guider vi dig til de bedste muligheder i vores samling.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Hvad hvis værket bliver beskadiget under transport?
              </AccordionTrigger>
              <AccordionContent>
                Alle forsendelser er fuldt forsikret. Hvis et værk beskadiges under transport, dækker forsikringen den fulde værdi. 
                Kontakt os straks ved modtagelse hvis der er skader, så håndterer vi forsikringskravet og finder en løsning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Er der skjulte gebyrer eller ekstra omkostninger?
              </AccordionTrigger>
              <AccordionContent>
                Nej, prisen du ser er prisen du betaler. Der er ingen skjulte gebyrer, provisioner eller ekstra omkostninger. 
                Eventuelle leveringsomkostninger vises tydeligt før du gennemfører købet.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at finde kunst til dit hjem?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Udforsk vores håndplukkede samling af original kunst fra danske kunstnere.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/">
              Udforsk kunst <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 text-center">
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
          ← Tilbage til forsiden
        </Link>
      </section>
    </div>
  )
}
