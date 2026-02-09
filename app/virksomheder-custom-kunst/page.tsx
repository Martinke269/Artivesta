import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Palette, ArrowRight, Shield, Star, CheckCircle2, Sparkles, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Få Et Speciallavet Kunstværk Til Jeres Virksomhed | ArtIsSafe',
  description: 'Custom kunst skabt specifikt til jeres brand og lokaler. Kun 10% ekstra gebyr. Professionel proces med sikker escrow-betaling og håndplukkede kunstnere.',
  keywords: 'custom kunst virksomhed, bestil kunst, skræddersyet kunst, kommissionsarbejde, speciallavet kunst, virksomhedskunst',
  openGraph: {
    title: 'Få Et Speciallavet Kunstværk Til Jeres Virksomhed',
    description: 'Custom kunst skabt specifikt til jeres brand. Kun 10% ekstra gebyr og sikker escrow-betaling.',
    type: 'website',
  }
}

export default function VirksomhederCustomKunst() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Få et speciallavet kunstværk til jeres virksomhed
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Få skabt unik kunst, der perfekt matcher jeres brand, værdier og lokaler. Vi forbinder jer med den rette kunstner og sikrer en professionel proces.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800" asChild>
            <Link href="/custom-kunst">
              Start custom projekt <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Fordele ved custom kunst</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Palette className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Custom kunst (10%)</h3>
                <p className="text-gray-600">
                  Kun 10% ekstra gebyr for custom projekter. Vi koordinerer hele processen mellem jer og kunstneren.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Briefcase className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Skabt specifikt til jeres brand</h3>
                <p className="text-gray-600">
                  Værket designes og skabes med jeres virksomheds identitet, farver og værdier i fokus.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel proces</h3>
                <p className="text-gray-600">
                  Vi håndterer kommunikation, kontrakter, milepæle og tidsplaner, så projektet forløber smidigt.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Pengene holdes sikkert indtil værket er leveret og godkendt. Beskyttelse for begge parter gennem hele processen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600">
                  Vi matcher jer med kunstnere, hvis stil, erfaring og arbejdsmetode passer perfekt til jeres vision.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Unik original kunst</h3>
                <p className="text-gray-600">
                  Et enestående originalt værk skabt kun til jer. Ingen kopier eller masseproduktion.
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
                <h3 className="text-xl font-semibold mb-2">Beskriv jeres vision</h3>
                <p className="text-gray-600">
                  Fortæl os om projektet: størrelse, stil, farver, budget og tidsramme. Vi hjælper med at konkretisere idéen og sikre realistiske forventninger.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi finder den rette kunstner</h3>
                <p className="text-gray-600">
                  Vi præsenterer 2-3 kunstnere, hvis stil matcher jeres vision. I vælger hvem I vil arbejde med, og vi faciliterer kontrakt og aftale.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Skabelse og levering</h3>
                <p className="text-gray-600">
                  Kunstneren skaber værket med løbende opdateringer og godkendelser. Ved endelig godkendelse leveres værket, og betaling frigives via escrow.
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
          <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
            <p className="text-lg text-gray-700">
              Custom kunst er den ultimative måde at skabe noget unikt til jeres virksomhed. Et værk skabt specifikt til jeres rum, 
              der afspejler jeres værdier og fortæller jeres historie. Men processen kan være kompliceret og risikabel – det er her vi kommer ind.
            </p>
            <p className="text-lg text-gray-700">
              Vi håndterer alt det praktiske: finder den rette kunstner baseret på jeres behov, faciliterer klar kommunikation, 
              sikrer professionelle kontrakter med milepæle og godkendelser, og beskytter begge parter gennem vores escrow-system. 
              Med kun 10% ekstra gebyr får I professionel projektledelse og tryghed gennem hele forløbet.
            </p>
            <p className="text-lg text-gray-700">
              Vores håndplukkede kunstnere har erfaring med kommissionsarbejde og forstår vigtigheden af at levere til tiden og efter aftale. 
              Vi sikrer at forventninger er klare fra start, så I får præcis det værk I drømmer om.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ofte stillede spørgsmål</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Hvor lang tid tager et custom projekt?
              </AccordionTrigger>
              <AccordionContent>
                Det afhænger af projektets størrelse og kompleksitet. Typisk 4-12 uger fra kontrakt til levering. 
                Vi aftaler en realistisk tidsplan med kunstneren baseret på jeres behov og værkets omfang. 
                Større eller mere komplekse projekter kan tage længere tid.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvad koster et custom projekt?
              </AccordionTrigger>
              <AccordionContent>
                Prisen afhænger af størrelse, kompleksitet, materialer og kunstnerens erfaring. Typisk fra 15.000 kr. og opefter. 
                Vi giver et estimat baseret på jeres beskrivelse, og kunstneren laver et konkret tilbud før I forpligter jer. 
                Hertil kommer vores 10% koordineringsgebyr.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Kan vi få ændringer undervejs i processen?
              </AccordionTrigger>
              <AccordionContent>
                Ja, inden for rimelighedens grænser. Vi aftaler milepæle hvor I kan give feedback og godkende retningen. 
                Mindre justeringer er normalt inkluderet. Større ændringer kan påvirke pris og tidsplan, 
                hvilket vi diskuterer åbent før de implementeres.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Hvad hvis vi ikke er tilfredse med resultatet?
              </AccordionTrigger>
              <AccordionContent>
                Vi sikrer klare forventninger fra start gennem skitser, mockups og godkendelser undervejs. 
                Hvis det endelige værk ikke matcher det godkendte design, arbejder vi med kunstneren på en løsning. 
                Vores escrow-system beskytter jer indtil I er tilfredse og godkender det endelige værk.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Kan vi møde kunstneren før vi beslutter os?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi arrangerer gerne et møde (fysisk eller virtuelt) mellem jer og kunstneren, 
                før I beslutter jer. Dette hjælper med at sikre god kemi, fælles forståelse af projektet 
                og at I føler jer trygge ved samarbejdet.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Hvad er inkluderet i 10% gebyret?
              </AccordionTrigger>
              <AccordionContent>
                Vores 10% gebyr dækker: matching med den rette kunstner, udarbejdelse af kontrakt, 
                projektkoordinering, håndtering af milepæle og godkendelser, escrow-betalingssystem, 
                og support gennem hele processen. Det er en alt-inklusiv service der sikrer et professionelt forløb.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Kan kunstneren arbejde med specifikke farver eller materialer?
              </AccordionTrigger>
              <AccordionContent>
                Ja, det er netop styrken ved custom kunst. I kan specificere farver der matcher jeres brand, 
                foretrukne materialer, teknikker og stil. Vi sikrer at kunstneren kan levere det I ønsker, 
                før projektet påbegyndes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Hvad sker der hvis kunstneren ikke kan levere til tiden?
              </AccordionTrigger>
              <AccordionContent>
                Kontrakten specificerer leveringsdato og konsekvenser ved forsinkelse. Vi følger op løbende 
                og sikrer at projektet holder tidsplanen. Hvis uforudsete problemer opstår, kommunikerer vi 
                det straks og finder en løsning sammen med jer og kunstneren.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at skabe noget unikt til jeres virksomhed?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Kontakt os i dag og fortæl om jeres vision. Vi finder den perfekte kunstner til projektet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/custom-kunst">
                Start custom projekt <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/virksomheder-kob-kunst">
                Se eksisterende kunst
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Link */}
      <section className="container mx-auto px-4 py-8 text-center">
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2">
          ← Tilbage til forsiden
        </Link>
      </section>
    </div>
  )
}
