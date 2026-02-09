import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Heart, ArrowRight, Shield, Sparkles, CheckCircle2, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Kunstnere Der Hader Salg - Fokuser På Din Kunst | ArtIsSafe',
  description: 'Lad os tage os af salget, så du kan fokusere på din kunst. Vi håndterer alt fra markedsføring til kundeservice. No cure, no pay.',
  keywords: 'kunstnere, sælg kunst, undgå salg, fokuser på kunst, kunstmarkedsplads',
}

export default function KunstnereHaderSalg() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Sælg kunst uden at være sælger
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Du skal ikke være sælger for at leve af din kunst. Vi håndterer markedsføring, kundeservice og alle praktiske detaljer, så du kan koncentrere dig om det kreative.
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
          <h2 className="text-3xl font-bold text-center mb-12">Vi Håndterer Alt Det Praktiske</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Vi tager dialogen for dig</h3>
                <p className="text-gray-600">
                  Vi håndterer al kommunikation med købere. Ingen cold calls, ingen forhandlinger, ingen kundeservice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel kuratering</h3>
                <p className="text-gray-600">
                  Din kunst præsenteres professionelt blandt håndplukkede værker i høj kvalitet.
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
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ingen gebyrer</h3>
                <p className="text-gray-600">
                  Ingen månedlige abonnementer eller skjulte omkostninger. Kun kommission ved salg.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cure, no pay</h3>
                <p className="text-gray-600">
                  Ingen forudgående omkostninger. Du betaler kun 20% kommission når dit værk sælges.
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
                <h3 className="text-xl font-semibold mb-2">Upload Din Kunst</h3>
                <p className="text-gray-600">
                  Opret din profil og upload dine værker. Det tager kun få minutter, og så er du klar.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi Sælger For Dig</h3>
                <p className="text-gray-600">
                  Vi håndterer al markedsføring, kundehenvendelser, forhandlinger og praktiske detaljer. Du skal ikke gøre noget.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Modtag Betaling</h3>
                <p className="text-gray-600">
                  Når dit værk sælges, sender du det til køberen og modtager 80% af salgsprisen direkte på din konto.
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
              Mange kunstnere elsker at skabe, men hader at sælge. Det er helt naturligt – du er kunstner, ikke sælger. 
              ArtIsSafe er bygget til netop dig. Vi tager os af alt det, du ikke bryder dig om: at pitche dit arbejde, 
              forhandle priser, håndtere kundehenvendelser og koordinere leveringer.
            </p>
            <p className="text-lg text-gray-700">
              Du uploader simpelthen dine værker, og så gør vi resten. Vi finder køberne, præsenterer din kunst professionelt, 
              og sørger for at transaktionen forløber sikkert. Du kan fokusere 100% på det, du er bedst til: at skabe kunst.
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
                Skal jeg selv kontakte købere?
              </AccordionTrigger>
              <AccordionContent>
                Nej, overhovedet ikke. Vi håndterer al kommunikation med potentielle købere. Du får først besked når et værk er solgt, 
                og du skal sende det afsted. Ingen cold calls, ingen forhandlinger, ingen kundeservice.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvad hvis jeg ikke er god til at beskrive min kunst?
              </AccordionTrigger>
              <AccordionContent>
                Det er helt okay. Skriv bare hvad du kan, så hjælper vi med at formulere det professionelt. 
                Vi har erfaring med at præsentere kunst på en måde, der appellerer til købere, uden at det bliver for salgsorienteret.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Skal jeg selv tage professionelle billeder?
              </AccordionTrigger>
              <AccordionContent>
                Gode billeder hjælper, men de behøver ikke være professionelle. Tag klare billeder i godt lys med din smartphone. 
                Hvis du har brug for hjælp til fotografering, kan vi guide dig eller hjælpe med at arrangere professionel fotografering.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Hvad hvis jeg ikke vil forhandle om priser?
              </AccordionTrigger>
              <AccordionContent>
                Du sætter prisen, og den står fast. Vi forhandler ikke på dine vegne uden din godkendelse. 
                Hvis en køber ønsker at forhandle, kontakter vi dig først, og du beslutter om du vil acceptere.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvor meget tid skal jeg bruge på platformen?
              </AccordionTrigger>
              <AccordionContent>
                Minimalt. Upload dine værker én gang, og så er du færdig. Du får besked når noget sælges. 
                Ingen daglig vedligeholdelse, ingen sociale medier, ingen markedsføring. Bare kunst.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar Til At Slippe For Salgsarbejdet?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Opret din profil i dag og lad os tage os af alt det praktiske.
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
