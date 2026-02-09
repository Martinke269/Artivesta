import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { TrendingUp, ArrowRight, Shield, Star, Sparkles, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kunst Som Investering – Kurateret Til Erhverv | ArtIsSafe',
  description: 'Invester i original kunst med langsigtet værdi. Håndplukkede kunstnere, fokus på originaler, professionel rådgivning og sikker escrow-betaling.',
  keywords: 'kunst investering, kunst værdistigning, investér i kunst, virksomhedsinvestering kunst, original kunst, kunstinvestering erhverv',
  openGraph: {
    title: 'Kunst Som Investering – Kurateret Til Erhverv',
    description: 'Invester i original kunst med langsigtet værdi. Håndplukkede kunstnere og professionel rådgivning.',
    type: 'website',
  }
}

export default function VirksomhederInvestering() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Kunst som investering – kurateret til erhverv
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Kombiner æstetik med økonomisk fornuft. Invester i original kunst fra håndplukkede kunstnere med potentiale for langsigtet værdistigning.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800" asChild>
            <Link href="/for-virksomheder">
              Få investeringskuratering <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Investering i kunst inkluderer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Håndplukkede kunstnere</h3>
                <p className="text-gray-600">
                  Vi kuraterer omhyggeligt og fokuserer på kunstnere med dokumenteret kvalitet, solid uddannelse og vækstpotentiale.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fokus på originaler</h3>
                <p className="text-gray-600">
                  Kun originale fysiske værker. Ægte kunst med dokumenteret proveniens, autenticitet og potentiale for værdistigning.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Langsigtet værdi</h3>
                <p className="text-gray-600">
                  Investér i kunst der skaber værdi både æstetisk og økonomisk. Kunstnere med stigende anerkendelse og markedsværdi.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel rådgivning</h3>
                <p className="text-gray-600">
                  Ekspertrådgivning fra kuratorer med erfaring fra gallerier og museer. Vi hjælper jer med at identificere lovende investeringer.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Alle transaktioner sikres gennem vores escrow-system. Fuld beskyttelse, dokumentation og tryghed i hver handel.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Diversificering</h3>
                <p className="text-gray-600">
                  Kunst er en alternativ aktivklasse, der kan diversificere jeres investeringsportefølje og skabe kulturel kapital.
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
                <h3 className="text-xl font-semibold mb-2">Identificer potentiale</h3>
                <p className="text-gray-600">
                  Gennemse vores kuraterede samling af kunstnere med dokumenteret kvalitet og vækstpotentiale. Vi hjælper med at identificere lovende investeringer baseret på uddannelse, udstillingshistorik og markedsudvikling.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Køb med tryghed</h3>
                <p className="text-gray-600">
                  Alle værker kommer med fuld dokumentation, proveniens og autenticitetscertifikat. Sikker betaling gennem escrow sikrer at pengene først frigives når værket er leveret og godkendt.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Nyd og følg udviklingen</h3>
                <p className="text-gray-600">
                  Hæng kunsten op og nyd den dagligt, mens I følger kunstnerens karriereudvikling og værkets potentielle værdistigning. Vi holder jer opdateret om kunstnerens fremskridt.
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
              Kunstinvestering handler ikke om spekulation – det handler om at identificere kvalitet og potentiale. Vi fokuserer på kunstnere med solid uddannelse, 
              dokumenteret praksis og stigende anerkendelse. Kunstnere der udstiller, vinder priser og får opmærksomhed fra gallerier og samlere.
            </p>
            <p className="text-lg text-gray-700">
              Med ArtIsSafe får I direkte adgang til disse kunstnere uden galleriers høje marginer. Samtidig får I kunst, der skaber værdi i hverdagen: 
              inspirerende arbejdsmiljøer, styrket brand og kulturel kapital. Det er investering, der giver mening både økonomisk og æstetisk.
            </p>
            <p className="text-lg text-gray-700">
              Vores kuratorer har erfaring fra kunstmarkedet og forstår både kunstens æstetiske værdi og dens økonomiske potentiale. 
              Vi guider jer gennem hele processen og sikrer at I investerer i kunst med reel kvalitet og vækstmuligheder.
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
                Kan kunst virkelig stige i værdi?
              </AccordionTrigger>
              <AccordionContent>
                Ja, original kunst fra talentfulde kunstnere kan stige betydeligt i værdi over tid. Nøglen er at investere i kvalitet og kunstnere med potentiale. 
                Vi fokuserer på kunstnere med solid uddannelse, dokumenteret praksis og stigende anerkendelse i kunstmiljøet. Historisk set har kunst fra anerkendte kunstnere 
                vist stabil værdistigning, især når kunstneren opnår galleritilknytning, museumskøb eller internationale udstillinger.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Hvordan vurderer I kunstnernes potentiale?
              </AccordionTrigger>
              <AccordionContent>
                Vi ser på flere faktorer: uddannelse fra anerkendte kunstakademier, udstillingshistorik på gallerier og museer, priser og anerkendelser, 
                galleritilknytning, medieomtale, kunstnerisk udvikling og konsistens i produktionen. Kunstnere der konsekvent leverer kvalitet og får stigende 
                opmærksomhed har bedst potentiale for værdistigning. Vi følger også markedstendenser og kunstnerens prisprogression over tid.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Hvad er forskellen på at købe gennem jer vs. et galleri?
              </AccordionTrigger>
              <AccordionContent>
                Gallerier tager typisk 40-50% kommission, hvilket betyder at kunstneren kun får halvdelen af salgsprisen. Hos os går langt flere penge direkte til kunstneren, 
                hvilket giver jer bedre værdi. Samtidig får I samme sikkerhed gennem vores escrow-system, fuld dokumentation og autenticitetscertifikater. 
                Vi tilbyder også professionel kuratorservice til at guide jeres investeringsbeslutninger.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Kan vi sælge kunsten igen senere?
              </AccordionTrigger>
              <AccordionContent>
                Ja, I ejer værket fuldt ud og kan sælge det når I vil. Vi kan hjælpe med at formidle videresalg til interesserede købere i vores netværk. 
                Værker med fuld dokumentation, proveniens og autenticitetscertifikat er lettere at videresælge og opnår typisk bedre priser. 
                Vi anbefaler at beholde al dokumentation og følge kunstnerens karriereudvikling for at time et eventuelt salg optimalt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvad med forsikring og værdiansættelse?
              </AccordionTrigger>
              <AccordionContent>
                Vi anbefaler at forsikre værdifulde værker som en del af virksomhedens inventar. Vi kan hjælpe med værdiansættelse og dokumentation til forsikringsformål. 
                Alle værker kommer med købskvittering og autenticitetscertifikat, som er nødvendige for forsikring. Vi kan også anbefale specialiserede kunstforsikringsselskaber 
                hvis I har en større samling.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Er der skattemæssige fordele ved at købe kunst til virksomheden?
              </AccordionTrigger>
              <AccordionContent>
                Kunst kan være en del af virksomhedens aktiver og kan i nogle tilfælde afskrives. Reglerne varierer afhængigt af virksomhedstype, værkets pris og anvendelse. 
                Vi anbefaler at konsultere jeres revisor om specifikke skattemæssige forhold. Generelt kan kunst der bruges til at pynte virksomhedens lokaler behandles som inventar, 
                mens kunst købt som ren investering har andre regler.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Hvor lang tid tager det før kunst stiger i værdi?
              </AccordionTrigger>
              <AccordionContent>
                Kunstinvestering er langsigtet – typisk 5-10 år eller mere. Værdistigning sker gradvist efterhånden som kunstneren opnår anerkendelse, 
                galleritilknytning og museumskøb. Nogle kunstnere oplever hurtigere vækst, mens andre tager længere tid. Det vigtigste er at investere i kvalitet 
                og kunstnere med solid fundament. Vi anbefaler at se kunst som en langsigtet investering der også giver daglig glæde og kulturel værdi.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Hvordan dokumenteres værkets autenticitet?
              </AccordionTrigger>
              <AccordionContent>
                Alle værker kommer med autenticitetscertifikat underskrevet af kunstneren, købskvittering med værkets detaljer, og dokumentation af proveniens 
                (værkets ejerskabshistorie). Vi fotograferer også værket professionelt og gemmer disse billeder i vores database. 
                Denne dokumentation er essentiel for værkets fremtidige værdi og mulighed for videresalg.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left">
                Kan vi starte med et mindre beløb og udvide senere?
              </AccordionTrigger>
              <AccordionContent>
                Ja, mange virksomheder starter med at købe et enkelt værk for at teste konceptet. I kan gradvist opbygge en samling over tid, 
                hvilket også spreder investeringsrisikoen. Vi hjælper gerne med at planlægge en langsigtet strategi for at opbygge en sammenhængende samling 
                der både har æstetisk og økonomisk værdi. Start småt og udvid efterhånden som I ser værdien.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left">
                Hvad hvis kunstneren ikke bliver succesfuld?
              </AccordionTrigger>
              <AccordionContent>
                Ikke alle kunstnere opnår stor kommerciel succes, hvilket er en del af risikoen ved kunstinvestering. Derfor fokuserer vi på kunstnere med 
                solid uddannelse og dokumenteret kvalitet, hvilket minimerer risikoen. Men selv hvis værket ikke stiger dramatisk i værdi, har I stadig et 
                originalt kunstværk der skaber værdi i hverdagen gennem æstetik, inspiration og kulturel kapital. Det er derfor vigtigt at vælge kunst I også elsker at se på.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at investere i kunst?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Udforsk vores samling af lovende kunstnere og find jeres næste investering med langsigtet potentiale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/for-virksomheder">
                Få investeringskuratering <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/virksomheder-kob-kunst">
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
