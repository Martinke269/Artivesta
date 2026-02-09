import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Shield, ArrowRight, Lock, CheckCircle2, AlertCircle, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sikker Betaling med Escrow – Tryghed for Alle Parter | ArtIsSafe',
  description: 'Forstå hvordan escrow-betaling beskytter både kunstnere og købere. Pengene holdes sikkert og frigives først ved godkendelse. Ingen risiko, transparent proces.',
  keywords: 'escrow betaling, sikker kunsthandel, beskyttet betaling, tryg kunstkøb, escrow system, sikker betaling',
  openGraph: {
    title: 'Sikker Betaling med Escrow – Tryghed for Alle Parter',
    description: 'Forstå hvordan escrow-betaling beskytter både kunstnere og købere. Transparent proces og ingen risiko.',
    type: 'website',
  }
}

export default function EscrowForklaring() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Sikker betaling med escrow
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Forstå hvordan vores escrow-system beskytter både kunstnere og købere. Pengene holdes sikkert og frigives først ved godkendelse.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/">
              Kom i gang <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Dine Fordele med Escrow</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Escrow-betaling sikrer tryghed og beskyttelse for både kunstnere og købere
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Lock className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pengene holdes sikkert</h3>
                <p className="text-gray-600">
                  Dine penge opbevares sikkert af en neutral tredjepart indtil værket er leveret og godkendt. Fuld beskyttelse.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Frigives først ved godkendelse</h3>
                <p className="text-gray-600">
                  Kunstneren får først pengene når du har modtaget værket og bekræftet at alt er i orden. Ingen risiko.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ingen risiko</h3>
                <p className="text-gray-600">
                  Både køber og kunstner er beskyttet. Hvis noget går galt, medierer vi og finder en fair løsning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transparent proces</h3>
                <p className="text-gray-600">
                  Begge parter kan følge transaktionens status i realtid. Fuld gennemsigtighed gennem hele forløbet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <AlertCircle className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Tryghed for både kunstnere og virksomheder</h3>
                <p className="text-gray-600">
                  Kunstnere får garanteret betaling. Købere får garanteret levering. Alle parter er beskyttet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel håndtering</h3>
                <p className="text-gray-600">
                  Vi håndterer alle betalinger professionelt med fuld dokumentation og kvitteringer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Sådan fungerer escrow</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Betaling holdes sikkert</h3>
                <p className="text-gray-600">
                  Når du køber et værk, betaler du gennem vores sikre system. Pengene går ikke direkte til kunstneren, 
                  men holdes i escrow af os som neutral tredjepart. Både du og kunstneren kan se at betalingen er sikret.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Værket sendes forsikret</h3>
                <p className="text-gray-600">
                  Kunstneren pakker og sender værket forsikret til dig. Du får tracking information og kan følge forsendelsen hele vejen. 
                  Alle forsendelser er fuldt forsikret mod skader.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Du godkender værket</h3>
                <p className="text-gray-600">
                  Når du modtager værket, har du tid til at inspicere det grundigt. Bekræft at alt er som forventet, 
                  eller kontakt os hvis der er problemer. Først når du godkender, frigives pengene til kunstneren.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Hvorfor escrow er vigtigt</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-lg text-gray-700 mb-6">
              Kunsthandel involverer ofte store beløb og værdifulde værker. Både kunstnere og købere har brug for tryghed og beskyttelse. 
              Uden escrow risikerer købere at betale for noget de aldrig modtager, mens kunstnere risikerer at sende værker uden at få betaling.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Vores escrow-system eliminerer disse risici. Købere ved at deres penge er sikre indtil de har modtaget og godkendt værket. 
              Kunstnere ved at pengene er garanteret når de sender værket. Ingen part tager unødig risiko.
            </p>
            <p className="text-lg text-gray-700">
              Vi fungerer som neutral tredjepart og sikrer at transaktionen forløber fair og transparent. Hvis der opstår problemer, 
              træder vi ind som mediator og finder en løsning der beskytter begge parter. Dette system har skabt tillid og gjort os 
              til en betroet platform for kunsthandel i Danmark.
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
                Hvad er escrow-betaling præcist?
              </AccordionTrigger>
              <AccordionContent>
                Escrow er et sikkerhedssystem hvor en neutral tredjepart (os) holder pengene sikkert indtil begge parter har opfyldt deres del af aftalen. 
                Køberen betaler, vi holder pengene, kunstneren sender værket, køberen godkender, og først da frigives pengene til kunstneren. 
                Dette beskytter både køber og sælger.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvordan beskytter escrow mig som køber?
              </AccordionTrigger>
              <AccordionContent>
                Som køber betaler du først når du har modtaget og godkendt værket. Hvis værket ikke matcher beskrivelsen, er beskadiget, 
                eller aldrig ankommer, får du dine penge tilbage. Du risikerer ikke at betale for noget du ikke får.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvordan beskytter escrow kunstneren?
              </AccordionTrigger>
              <AccordionContent>
                Som kunstner ved du at pengene er sikret fra det øjeblik køberen betaler. Du risikerer ikke at sende et værk uden at få betaling. 
                Når værket er leveret og godkendt, får du garanteret dine penge. Ingen risiko for svindel eller manglende betaling.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Hvor lang tid holder I pengene i escrow?
              </AccordionTrigger>
              <AccordionContent>
                Typisk 3-5 dage efter at køberen har modtaget værket. Dette giver tid til at inspicere værket grundigt og bekræfte at alt er i orden. 
                Hvis køberen godkender tidligere, frigiver vi pengene hurtigere. Ved større værker kan perioden være lidt længere.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvad sker der hvis værket beskadiges under transport?
              </AccordionTrigger>
              <AccordionContent>
                Alle forsendelser er fuldt forsikret. Hvis et værk beskadiges under transport, dækker forsikringen den fulde værdi. 
                Pengene i escrow bruges til at refundere køberen. Kunstneren får stadig betaling fra forsikringen, da skaden ikke er deres ansvar.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Hvad hvis køberen ikke er tilfreds med værket?
              </AccordionTrigger>
              <AccordionContent>
                Køberen har en godkendelsesperiode efter modtagelse. Hvis værket ikke matcher beskrivelsen eller har skjulte fejl, 
                kan køberen afvise det. Værket returneres til kunstneren, og pengene refunderes til køberen. Vi medierer for at sikre en fair løsning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Koster escrow-systemet ekstra?
              </AccordionTrigger>
              <AccordionContent>
                Nej, escrow-beskyttelsen er inkluderet i vores standard service. Der er ingen ekstra gebyrer for at bruge systemet. 
                Det er en del af vores forpligtelse til at sikre tryg og sikker kunsthandel for alle parter.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Hvad hvis der opstår en konflikt mellem køber og kunstner?
              </AccordionTrigger>
              <AccordionContent>
                Vi træder ind som neutral mediator. Vi gennemgår dokumentation, billeder og kommunikation fra begge parter objektivt. 
                Vores mål er altid at finde en fair løsning der beskytter begge parters interesser. I de fleste tilfælde kan konflikter løses gennem dialog.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til tryg kunsthandel?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Oplev hvordan escrow-betaling gør kunstkøb sikkert og nemt for alle parter.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href="/">
              Kom i gang <ArrowRight className="ml-2 h-5 w-5" />
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
