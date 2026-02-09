import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Crown, ArrowRight, Shield, Star, List, Share2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Premium Kuratering – Vi Finder Kunsten For Jer | ArtIsSafe',
  description: 'Premium kuratering til virksomheder. Kun 5% ekstra. Shortlists skræddersyet til jer, delbare kunstnerprofiler, sikker escrow-betaling og håndplukkede kunstnere.',
  keywords: 'premium kuratering, kunstkonsulent, professionel kunstudvælgelse, virksomhedskunst, kunstkuratering',
  openGraph: {
    title: 'Premium Kuratering – Vi Finder Kunsten For Jer',
    description: 'Premium kuratering til virksomheder. Kun 5% ekstra med shortlists og delbare kunstnerprofiler.',
    type: 'website',
  }
}

export default function VirksomhederPremiumKuratering() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Premium kuratering – vi finder kunsten for jer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Få dedikeret hjælp fra professionelle kuratorer til at finde den perfekte kunst til jeres virksomhed. Personlig service med shortlists og delbare profiler.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800" asChild>
            <Link href="/kuratering">
              Få premium kuratering <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Premium kuratering inkluderer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Crown className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Premium kuratering (5%)</h3>
                <p className="text-gray-600">
                  Kun 5% ekstra for dedikeret kuratorservice. Personlig rådgivning og ekspertise gennem hele processen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <List className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Shortlists skræddersyet til jer</h3>
                <p className="text-gray-600">
                  Vi sammensætter kuraterede shortlists med værker, der matcher jeres vision, budget og lokaler perfekt.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Share2 className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Delbare kunstnerprofiler</h3>
                <p className="text-gray-600">
                  Del kunstnerprofiler og værker med kolleger og beslutningstagere via links. Nem intern godkendelse.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Alle transaktioner sikres gennem vores escrow-system. Pengene frigives først når værket er leveret og godkendt.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600">
                  Adgang til vores fulde netværk af kuraterede kunstnere. Kun kvalitetskunst fra verificerede talenter.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Crown className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ekspert rådgivning</h3>
                <p className="text-gray-600">
                  Professionelle kuratorer med erfaring fra gallerier og museer guider jer gennem hele processen.
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
                <h3 className="text-xl font-semibold mb-2">Indledende konsultation</h3>
                <p className="text-gray-600">
                  Vi mødes (fysisk eller virtuelt) for at forstå jeres vision, værdier, budget og rum. Vi stiller de rigtige spørgsmål for at forstå jeres behov.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Kurateret shortlist</h3>
                <p className="text-gray-600">
                  Vores kurator sammensætter en personlig shortlist med værker og kunstnerprofiler. I får delbare links til intern godkendelse og diskussion.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Køb og levering</h3>
                <p className="text-gray-600">
                  Når I har valgt, koordinerer vi køb via sikker escrow-betaling, levering og eventuel ophængning. Løbende support hele vejen.
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
              At vælge kunst til en virksomhed kræver mere end god smag – det kræver forståelse for rum, lys, farver, og hvordan kunst påvirker mennesker. 
              Vores kuratorer har erfaring fra gallerier, museer og kunstinstitutioner. De forstår både kunstens æstetik og dens virkning i erhvervsmiljøer.
            </p>
            <p className="text-lg text-gray-700">
              Med premium kuratering får I ikke bare kunst – I får en samling, der fortæller jeres historie, styrker jeres brand og skaber værdi for medarbejdere og kunder. 
              Vores shortlists og delbare kunstnerprofiler gør det nemt at involvere relevante beslutningstagere i processen, så I træffer det rigtige valg sammen.
            </p>
            <p className="text-lg text-gray-700">
              Med kun 5% ekstra får I professionel ekspertise, der sikrer at I investerer i kunst, der passer perfekt til jeres virksomhed – både æstetisk og strategisk.
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
                Hvad koster premium kuratering?
              </AccordionTrigger>
              <AccordionContent>
                Premium kuratering koster kun 5% ekstra oven i kunstværkernes pris. For et projekt på 100.000 kr. er det altså 5.000 kr. for fuld kuratorservice, 
                shortlists, delbare profiler og løbende rådgivning. Ingen skjulte omkostninger.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvordan fungerer de delbare kunstnerprofiler?
              </AccordionTrigger>
              <AccordionContent>
                Vi sender jer links til kuraterede shortlists med værker og kunstnerprofiler. Disse kan I dele internt med kolleger, 
                ledelse eller andre beslutningstagere. Alle kan se værkerne, læse om kunstnerne og kommentere, 
                hvilket gør beslutningsprocessen nem og transparent.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvor lang tid tager processen?
              </AccordionTrigger>
              <AccordionContent>
                Fra første møde til I modtager jeres shortlist typisk 1-2 uger. Derefter kan I tage den tid I har brug for til intern godkendelse. 
                Fra beslutning til levering typisk 2-4 uger. Vi arbejder efter jeres tidsplan og kan fremskynde processen hvis nødvendigt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Kan vi se værker fysisk før vi beslutter?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi arrangerer gerne fremvisning af udvalgte værker i jeres lokaler, så I kan se dem i kontekst. 
                Dette er inkluderet i premium kurateringsservicen og hjælper med at sikre det rigtige valg. 
                Vi kan også arrangere besøg i kunstnernes atelierer hvis relevant.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvad hvis vi ikke kan lide shortlisten?
              </AccordionTrigger>
              <AccordionContent>
                Vi laver gerne en ny shortlist baseret på jeres feedback. Målet er at finde kunst I elsker, 
                så vi justerer retningen indtil vi rammer rigtigt. Der er ingen ekstra omkostninger for at lave nye shortlists – 
                det er en del af servicen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Arbejder I med specifikke stilarter eller kunstnere?
              </AccordionTrigger>
              <AccordionContent>
                Vores kuratorer arbejder med alle stilarter og har adgang til vores fulde netværk af kunstnere. 
                Vi tilpasser os jeres præferencer – fra klassisk til moderne, fra abstrakt til figurativt. 
                Målet er at finde kunst, der passer til jer, ikke omvendt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Kan vi udvide samlingen senere?
              </AccordionTrigger>
              <AccordionContent>
                Ja, som premium kunde får I løbende adgang til kuratorråd givning. Vi kan hjælpe med at udvide samlingen over tid, 
                så den vokser organisk og bevarer sammenhæng. Mange virksomheder starter med et rum og udvider gradvist. 
                5% gebyret gælder også for fremtidige køb.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Hvad er forskellen på gratis og premium kuratering?
              </AccordionTrigger>
              <AccordionContent>
                Gratis kuratering er grundlæggende rådgivning og hjælp til at finde kunst. Premium kuratering (5%) inkluderer 
                dedikeret kurator, professionelle shortlists, delbare kunstnerprofiler, stedsbesøg, visualiseringer, 
                og løbende support. Det er den rigtige løsning hvis I vil have eksperthjælp gennem hele processen.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til professionel kunstkuratering?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Book en uforpligtende konsultation med vores kuratorer i dag. Få jeres personlige shortlist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/kuratering">
                Få premium kuratering <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/virksomheder-kob-kunst">
                Se gratis kuratering
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
