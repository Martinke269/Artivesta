import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Building2, ArrowRight, Shield, Sparkles, CheckCircle2, Star, Palette, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Find Original Kunst Til Jeres Kontor – Kurateret Til Jer | ArtIsSafe',
  description: 'Gratis kuratering af original kunst til virksomheder. Håndplukkede kunstnere, sikker escrow-betaling og no cure, no pay. Find den perfekte kunst til jeres kontor.',
  keywords: 'virksomhedskunst, køb kunst til kontor, erhvervskunst, kontorindretning kunst, gratis kuratering, original kunst virksomhed',
  openGraph: {
    title: 'Find Original Kunst Til Jeres Kontor – Kurateret Til Jer',
    description: 'Gratis kuratering af original kunst til virksomheder. Håndplukkede kunstnere og sikker escrow-betaling.',
    type: 'website',
  }
}

export default function VirksomhederKobKunst() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Find original kunst til jeres kontor – kurateret til jer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Vi hjælper virksomheder med at finde den perfekte kunst til deres lokaler. Gratis kuratering, håndplukkede kunstnere og sikker betaling.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800" asChild>
            <Link href="/for-virksomheder">
              Få gratis kuratering <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Derfor Vælger Virksomheder ArtIsSafe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gratis kuratering</h3>
                <p className="text-gray-600">
                  Vi hjælper jer med at finde kunst, der passer til jeres brand, værdier og lokaler. Helt gratis og uforpligtende.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600">
                  Alle kunstnere er omhyggeligt udvalgt. I får kun adgang til kvalitetskunst fra etablerede og nye talenter.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Palette className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Original fysisk kunst</h3>
                <p className="text-gray-600">
                  Kun originale fysiske værker. Ingen prints eller masseproduktion. Ægte kunst til jeres lokaler.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Lock className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Alle transaktioner sikres gennem vores escrow-system. Pengene frigives først når værket er leveret og godkendt.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cure, no pay</h3>
                <p className="text-gray-600">
                  Vores kurateringsservice er gratis. I betaler kun hvis I finder og køber kunst, der passer perfekt.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Building2 className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel service</h3>
                <p className="text-gray-600">
                  Fra kuratering til levering og ophængning. Vi hjælper jer hele vejen og sikrer en problemfri oplevelse.
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
                <h3 className="text-xl font-semibold mb-2">Fortæl os om jeres behov</h3>
                <p className="text-gray-600">
                  Kontakt os med information om jeres lokaler, budget og stil-præferencer. Vi arrangerer et uforpligtende møde hvor vi forstår jeres vision.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi kuraterer kunstforslag</h3>
                <p className="text-gray-600">
                  Baseret på jeres ønsker sammensætter vi et udvalg af værker fra vores håndplukkede kunstnere. I får præsenteret værker der matcher perfekt.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sikker køb og levering</h3>
                <p className="text-gray-600">
                  Når I har fundet det perfekte værk, håndterer vi alt fra sikker betaling via escrow til levering og professionel ophængning.
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
              Kunst i arbejdsmiljøet er mere end dekoration – det er en investering i medarbejdertrivsel, kreativitet og jeres brand. 
              Original kunst skaber samtaler, inspirerer og viser at I værdsætter kvalitet og kultur.
            </p>
            <p className="text-lg text-gray-700">
              Med ArtIsSafe får I direkte adgang til danske kunstnere uden mellemmænd. Vi kuraterer omhyggeligt, så I kun ser værker af høj kvalitet. 
              Vores gratis kurateringsservice betyder at I får professionel rådgivning uden at betale for det – I betaler kun hvis I finder kunst I elsker.
            </p>
            <p className="text-lg text-gray-700">
              Vores sikre escrow-betalingssystem beskytter både jer og kunstneren. Pengene frigives først når værket er leveret og I er tilfredse. 
              Det giver jer tryghed og sikkerhed i hele processen.
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
                Hvad koster den gratis kuratering?
              </AccordionTrigger>
              <AccordionContent>
                Kurateringen er 100% gratis og uforpligtende. Vi tjener kun penge hvis I finder og køber kunst gennem os. 
                Det er vores "no cure, no pay" model – I risikerer intet ved at få professionel rådgivning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvordan fungerer escrow-betalingen?
              </AccordionTrigger>
              <AccordionContent>
                Når I køber kunst, indsættes pengene i vores sikre escrow-system. Kunstneren sender værket, og når I har modtaget 
                og godkendt det, frigives pengene til kunstneren. Dette beskytter både jer og kunstneren mod svindel.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Kan vi købe flere værker på én gang?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi hjælper gerne med større indkøb til hele kontorer eller bygninger. Vi kan koordinere levering og ophængning 
                af alle værker samtidig, så I får en sammenhængende kunstoplevelse i jeres lokaler.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Tilbyder I faktura og betalingsbetingelser?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi kan tilbyde faktura til erhvervskunder med 14-30 dages betalingsfrist. 
                Kontakt os for at aftale betalingsbetingelser, der passer til jeres virksomhed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvad hvis et værk ikke passer ind i vores lokaler?
              </AccordionTrigger>
              <AccordionContent>
                Vi anbefaler altid at se værket fysisk før endelig beslutning, og vi kan arrangere fremvisning. 
                Hvis et værk alligevel ikke passer efter levering, kan vi hjælpe med at finde et alternativ. 
                Kontakt os inden for 14 dage efter levering.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Kan kunstnerne lave custom værker til os?
              </AccordionTrigger>
              <AccordionContent>
                Ja, mange af vores kunstnere laver kommissionsarbejde. Vi kan formidle kontakt og hjælpe med at koordinere 
                et custom projekt, der matcher jeres specifikke behov, farver og vision. 
                <Link href="/virksomheder-custom-kunst" className="text-blue-600 hover:underline ml-1">
                  Læs mere om custom kunst til virksomheder
                </Link>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Hvordan sikrer I kvaliteten af kunstnerne?
              </AccordionTrigger>
              <AccordionContent>
                Alle kunstnere gennemgår en omhyggelig udvælgelsesproces. Vi vurderer deres portfolio, teknik, professionalisme 
                og evne til at levere kvalitet. Kun kunstnere der lever op til vores høje standarder får adgang til platformen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Kan I hjælpe med ophængning af kunstværkerne?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi kan koordinere professionel ophængning af værker. Dette er især relevant ved større indkøb eller 
                tunge værker der kræver særlig montering. Kontakt os for at høre mere om denne service.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at finde den perfekte kunst til jeres kontor?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Kontakt os i dag for gratis kuratering. Ingen forpligtelser – kun inspiration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/for-virksomheder">
                Få gratis kuratering <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/">
                Se kunstsamlingen
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
