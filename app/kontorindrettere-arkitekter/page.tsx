import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Zap, ArrowRight, Shield, Star, Palette, Users, Sparkles, Clock, CheckCircle2, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kunst Til Indretningsprojekter – Nemt Og Professionelt | ArtIsSafe',
  description: 'Perfekt kunstløsning til kontorindrettere og arkitekter. Gratis kuratering, hurtige shortlists, håndplukkede kunstnere, custom kunst muligt og sikker escrow-betaling.',
  keywords: 'kontorindretning kunst, arkitekt kunst, erhvervsindretning, projektkunst, indretningsprojekt kunst, professionel kunstløsning',
  openGraph: {
    title: 'Kunst Til Indretningsprojekter – Nemt Og Professionelt',
    description: 'Perfekt kunstløsning til kontorindrettere og arkitekter. Gratis kuratering og hurtige shortlists.',
    type: 'website',
  }
}

export default function KontorindrettereArkitekter() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Kunst til indretningsprojekter – nemt og professionelt
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professionel kunstpartner til kontorindrettere og arkitekter. Gratis kuratering, hurtige shortlists og dedikeret support til jeres projekter.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800" asChild>
            <Link href="/for-virksomheder">
              Samarbejd med os <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Fordele for professionelle</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Premium kunstløsning designet til kontorindrettere og arkitekter
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Zap className="h-10 w-10 text-orange-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Hurtige, kuraterede kunstforslag</h3>
                <p className="text-gray-600 text-sm">
                  Baseret på farver, stil, rumtype og brandidentitet. Præcise shortlists der matcher projektet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-10 w-10 text-yellow-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600 text-sm">
                  Professionelle kunstnere. Ingen prints, ingen masseplatform. Kun original kunst af høj kvalitet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Palette className="h-10 w-10 text-pink-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Custom kunst til signaturvægge</h3>
                <p className="text-gray-600 text-sm">
                  Mulighed for custom kunst til receptioner, mødelokaler og statement-vægge. Fuld koordinering.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle2 className="h-10 w-10 text-green-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Gratis kuratering</h3>
                <p className="text-gray-600 text-sm">
                  Professionel kuratorservice til alle projekter. Ingen ekstra omkostninger, kun ekspertise.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-purple-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Delbare kunstforslag</h3>
                <p className="text-gray-600 text-sm">
                  Til moodboards, kundemøder og pitch decks. Præsenter kunst professionelt og nemt.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-indigo-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600 text-sm">
                  Tryghed i projektet. Beskyttelse for jer og jeres kunder gennem hele processen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Hurtig levering</h3>
                <p className="text-gray-600 text-sm">
                  Klar kommunikation og koordineret levering efter jeres projektplan. Ingen forsinkelser.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Palette className="h-10 w-10 text-teal-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Matcher indretningskonceptet</h3>
                <p className="text-gray-600 text-sm">
                  Kunst der harmonerer med farver, materialer, lys og stemning i rummet. Helhedstænkning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Briefcase className="h-10 w-10 text-gray-700 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Faste samarbejdsaftaler</h3>
                <p className="text-gray-600 text-sm">
                  Mulighed for løbende partnerskab med prioriteret kuratering til alle jeres projekter.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-10 w-10 text-amber-600 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Rolig, kurateret platform</h3>
                <p className="text-gray-600 text-sm">
                  Ingen visuel støj. Kun kvalitet, præcision og professionel præsentation af kunst.
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
                <h3 className="text-xl font-semibold mb-2">Beskriv projektet</h3>
                <p className="text-gray-600">
                  Fortæl os om projektet: stil, farver, størrelse, budget og tidsramme. Vi hjælper med at finde de rette værker der matcher jeres vision og kundens præferencer.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Præsenter for kunden</h3>
                <p className="text-gray-600">
                  Del kunstnerprofiler og værker direkte med jeres kunde via delbare links. De kan se alt online, læse om kunstnerne og godkende valg nemt og hurtigt.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi håndterer resten</h3>
                <p className="text-gray-600">
                  Vi koordinerer betaling gennem sikker escrow, levering og eventuel installation efter jeres tidsplan. I fokuserer på projektet, vi håndterer kunsten.
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
              Som kontorindretter eller arkitekt ved I, at kunst er mere end dekoration – det er en integreret del af rumoplevelsen. 
              ArtIsSafe gør det nemt at finde og præsentere kvalitetskunst til jeres projekter. Vi forstår jeres workflow og tilbyder løsninger, 
              der passer ind i jeres proces uden at skabe ekstra arbejde.
            </p>
            <p className="text-lg text-gray-700">
              Med vores delbare profiler kan I hurtigt præsentere kunstforslag for kunder. Vores gratis kurateringsservice hjælper med at finde værker, 
              der matcher projektets vision og æstetik. Vi leverer hurtige shortlists, så I kan holde projektet på skinner uden forsinkelser.
            </p>
            <p className="text-lg text-gray-700">
              Med sikker escrow-betaling og koordineret levering kan I stole på, at kunstdelen af projektet forløber professionelt. 
              Vi håndterer alle detaljer, så I kan fokusere på det I er bedst til – at skabe fantastiske rum for jeres kunder.
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
                Kan vi få provision på salg?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi arbejder gerne med professionelle partnere og kan aftale provisionsordninger, der giver mening for begge parter. 
                Kontakt os for at diskutere samarbejdsmuligheder og vilkår. Vi værdsætter langsigtede partnerskaber med kontorindrettere og arkitekter.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvordan præsenterer vi kunst for kunder?
              </AccordionTrigger>
              <AccordionContent>
                Hver kunstner og hvert værk har sin egen side med professionelle billeder, mål, teknik og baggrundsinformation. 
                Del simpelthen linket med jeres kunde, så kan de se alt online på deres egen tid. Vi kan også lave visualiseringer 
                af hvordan værker vil se ud i rummet, hvis det er relevant for projektet.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvor hurtigt kan I levere shortlists?
              </AccordionTrigger>
              <AccordionContent>
                Vi forstår at indretningsprojekter ofte har stramme tidsplaner. Typisk kan vi levere en kurateret shortlist inden for 2-3 hverdage 
                efter I har beskrevet projektet. Ved akutte projekter kan vi ofte levere hurtigere. Kontakt os med jeres tidsramme, 
                så finder vi en løsning der passer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Kan I levere til specifikke datoer?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi koordinerer levering efter jeres projektplan. Fortæl os hvornår værker skal være på plads, 
                og vi sørger for at det sker til tiden. Vi kan også arrangere professionel installation og ophængning hvis ønsket. 
                Vi arbejder tæt sammen med jer for at sikre at kunstdelen passer perfekt ind i projektets tidsplan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvad hvis kunden vil have custom kunst?
              </AccordionTrigger>
              <AccordionContent>
                Vi faciliterer custom projekter og matcher jer med kunstnere, hvis stil passer til projektet. 
                Vi håndterer kommunikation, kontrakter, tidsplaner og koordinering, så I kan fokusere på jeres del af projektet. 
                Custom kunst er en fantastisk måde at skabe unikke rum på, og vi har erfaring med at guide processen fra start til slut.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Arbejder I med alle stilarter?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vores kunstnere arbejder i alle stilarter fra klassisk til moderne, abstrakt til figurativt, minimalistisk til ekspressivt. 
                Vi hjælper med at finde kunst, der matcher projektets æstetik og kundens præferencer. Uanset om projektet kræver diskret baggrundkunst 
                eller statement pieces, har vi kunstnere der kan levere.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Kan vi få hjælp til at visualisere kunst i rummet?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi kan hjælpe med at visualisere hvordan værker vil se ud i de specifikke rum. Send os billeder af rummet og mål, 
                så kan vi lave mockups der viser hvordan forskellige værker vil fungere. Dette gør det lettere for kunden at træffe beslutninger 
                og sikrer at I vælger værker i de rigtige størrelser og farver.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Hvad med dokumentation og certifikater?
              </AccordionTrigger>
              <AccordionContent>
                Alle værker kommer med fuld dokumentation: autenticitetscertifikat underskrevet af kunstneren, købskvittering, 
                professionelle billeder og information om kunstneren. Dette er vigtigt for kundens forsikring og værkets fremtidige værdi. 
                Vi sørger for at al dokumentation er på plads og kan leveres til kunden.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left">
                Kan vi få adgang til hele kunstnernetværket?
              </AccordionTrigger>
              <AccordionContent>
                Ja, som professionel partner får I adgang til vores fulde netværk af kuraterede kunstnere. I kan browse samlingen selv 
                eller få hjælp fra vores kuratorer til at finde de rette kunstnere til specifikke projekter. Vi tilføjer løbende nye kunstnere, 
                så der er altid friske muligheder at præsentere for kunder.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left">
                Hvordan håndteres betaling og fakturering?
              </AccordionTrigger>
              <AccordionContent>
                Betaling håndteres gennem vores sikre escrow-system, som beskytter både jer, kunden og kunstneren. 
                Vi kan tilpasse faktureringen efter jeres behov – enten direkte til kunden eller gennem jer som mellemmand. 
                Kontakt os for at diskutere den bedste løsning for jeres forretningsmodel og workflow.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at samarbejde?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Kontakt os i dag og hør mere om hvordan vi kan hjælpe med jeres indretningsprojekter. Gratis kuratering og hurtige shortlists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/for-virksomheder">
                Samarbejd med os <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/kuratering">
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
