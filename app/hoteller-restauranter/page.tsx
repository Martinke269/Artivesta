import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Palette, Sparkles, Shield, Wrench, CheckCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kunst til Hoteller og Restauranter - Kurateret Stemning | ArtIsSafe',
  description: 'Original fysisk kunst der skaber stemning i hoteller og restauranter. Professionel kuratering efter stil, custom kunst, sikker escrow-betaling og installation.',
  keywords: 'hotel kunst, restaurant kunst, kuratering hoteller, hospitality kunst, original kunst hoteller, stemning restaurant, kunst installation',
  openGraph: {
    title: 'Kunst til Hoteller og Restauranter - Kurateret Stemning',
    description: 'Original fysisk kunst der skaber stemning. Kuratering efter stil, custom kunst og professionel installation.',
    type: 'website',
  }
}

export default function HotellerRestauranter() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Tilbage til forsiden
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Kunst der skaber stemning – kurateret til hoteller og restauranter
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Original fysisk kunst der forvandler jeres rum til mindeværdige oplevelser. Professionel kuratering, sikker betaling og installation.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/kuratering">
              Få kuratering <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* USP Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Derfor Vælger Hoteller og Restauranter ArtIsSafe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Palette className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Original fysisk kunst</h3>
                <p className="text-gray-600">
                  Kun ægte originale værker – ingen prints eller masseproduktion. Autentisk kunst der skaber værdi og atmosfære.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Kuratering efter stil</h3>
                <p className="text-gray-600">
                  Vi kuraterer kunst der matcher jeres koncept, brand og atmosfære. Professionel rådgivning om stil, placering og sammenhæng.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Custom kunst muligt</h3>
                <p className="text-gray-600">
                  Få skabt unikke værker specielt til jeres rum. Arbejd direkte med kunstnere om farver, størrelse og tema.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Wrench className="h-12 w-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Professionel installation</h3>
                <p className="text-gray-600">
                  Vi koordinerer levering og kan hjælpe med installation. Sikker ophængning og optimal placering i jeres rum.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors">
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sikker escrow-betaling</h3>
                <p className="text-gray-600">
                  Alle transaktioner sikres gennem vores escrow-system. Fuld beskyttelse, dokumentation og tryghed for begge parter.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Sådan fungerer det</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Fortæl om jeres vision</h3>
                <p className="text-gray-600">
                  Beskriv jeres koncept, stil og hvilken stemning I vil skabe. Vi lytter til jeres behov og forstår jeres brand.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Vi kuraterer kunstsamlingen</h3>
                <p className="text-gray-600">
                  Vores eksperter sammensætter en kurateret samling af værker der passer perfekt til jeres rum, stil og budget.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Installation og nyd resultatet</h3>
                <p className="text-gray-600">
                  Vi leverer og installerer kunsten professionelt. Jeres gæster oplever original kunst der skaber den perfekte stemning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ArtIsSafe Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Hvorfor vælge ArtIsSafe</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
            <p className="text-lg text-gray-700">
              I hospitality-branchen handler alt om at skabe oplevelser der sætter sig i gæsternes hukommelse. 
              Kunst er en af de mest kraftfulde måder at skabe atmosfære, fortælle historier og differentiere sig på et konkurrencepræget marked.
            </p>
            <p className="text-lg text-gray-700">
              Original kunst signalerer kvalitet, autenticitet og omsorg for detaljer – værdier der resonerer dybt med moderne gæster. 
              Det er forskellen mellem et generisk rum og en destination, der bliver husket og anbefalet.
            </p>
            <p className="text-lg text-gray-700">
              ArtIsSafe forstår hospitality-branchen. Vi ved at kunst i hoteller og restauranter skal være både æstetisk stærk og funktionel. 
              Den skal tåle offentlige rum, skabe samtaler blandt gæster og styrke jeres brand konsekvent.
            </p>
            <p className="text-lg text-gray-700">
              Vores kuratorer har erfaring med at finde værker der gør præcis det – kunst der ikke bare pynter, 
              men aktivt bidrager til den oplevelse I vil skabe. Fra rolige abstrakte værker til statement pieces, 
              fra lokale kunstnere til internationale navne – vi finder den rette kunst til jeres koncept.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ofte stillede spørgsmål</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Hvilken type kunst passer bedst til hoteller og restauranter?
              </AccordionTrigger>
              <AccordionContent>
                Det afhænger helt af jeres koncept og brand. Vi arbejder med alt fra rolige abstrakte værker der skaber ro, 
                til statement pieces der starter samtaler. Nøglen er at finde kunst der styrker jeres identitet og skaber den ønskede atmosfære. 
                Vores kuratorer hjælper med at identificere den rette stil, farvepalette og tematik til netop jeres rum.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Kan kunsten tåle offentlige rum med mange gæster?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi rådgiver specifikt om placering og beskyttelse til offentlige rum. Mange værker er robuste nok til høj trafik, 
                og vi kan anbefale beskyttende indramning eller glasmontering for mere sårbare værker. Vi tager højde for faktorer som 
                sollys, fugtighed og berøring, så kunsten både er smuk og praktisk i daglig drift.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Tilbyder I hjælp med installation og ophængning?
              </AccordionTrigger>
              <AccordionContent>
                Ja, vi koordinerer levering og kan hjælpe med professionel installation. Vi sikrer korrekt ophængning, 
                optimal placering i forhold til lys og trafik, og at værkerne præsenteres på bedste vis. 
                For større projekter kan vi også rådgive om belysning og scenografi omkring kunsten.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Kan vi få lavet custom kunst specielt til vores rum?
              </AccordionTrigger>
              <AccordionContent>
                Absolut. Vi faciliterer kontakt mellem jer og kunstnere der kan skabe unikke værker specielt til jeres rum. 
                I kan arbejde sammen om farver, størrelse, tema og stil, så kunsten bliver perfekt integreret i jeres koncept. 
                Custom kunst er ideelt når I har specifikke visioner eller vil have noget helt unikt.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Hvordan fungerer escrow-betalingen?
              </AccordionTrigger>
              <AccordionContent>
                Vores escrow-system beskytter både jer og kunstneren. Betalingen holdes sikkert af os indtil kunsten er leveret, 
                installeret og godkendt af jer. Først derefter frigives betalingen til kunstneren. Dette sikrer at I får præcis 
                det I har betalt for, og at kunstneren får betaling for deres arbejde. Fuld dokumentation og tryghed for begge parter.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Kan vi skifte kunst ud over tid?
              </AccordionTrigger>
              <AccordionContent>
                Ja, mange hoteller og restauranter roterer deres kunstsamling for at holde oplevelsen frisk og sæsonbetonet. 
                Vi kan hjælpe med at opbygge en samling hvor I kan skifte værker ud mellem forskellige områder, 
                eller supplere med nye værker over tid. Dette holder jeres interiør dynamisk og giver gæster nye oplevelser ved gentagne besøg.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Hvad koster det at få kurateret en kunstsamling?
              </AccordionTrigger>
              <AccordionContent>
                Kurateringen er gratis – vi tjener kun når I køber kunst. Prisen på kunsten varierer naturligvis efter kunstner, 
                størrelse og kompleksitet. Vi arbejder inden for jeres budget og finder løsninger der giver maksimal værdi. 
                Fra enkelte statement pieces til komplette samlinger – vi tilpasser os jeres behov og økonomi.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Kan gæster købe kunsten de ser hos jer?
              </AccordionTrigger>
              <AccordionContent>
                Ja, hvis I ønsker det. Nogle hoteller og restauranter vælger at gøre deres kunst til salg, 
                hvilket kan være en ekstra indtægtskilde og skaber en unik shoppingoplevelse for gæster. 
                Vi kan facilitere dette med diskrete skilte og nem købsproces. Andre foretrækker at beholde kunsten som en del af deres faste identitet.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at skabe den perfekte stemning?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Lad os hjælpe jer med at finde kunst der forvandler jeres rum til mindeværdige oplevelser for gæster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/kuratering">
                Få kuratering <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link href="/for-virksomheder">
                Se kunstsamlingen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Back to Homepage Link */}
      <section className="container mx-auto px-4 py-8 text-center">
        <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2">
          ← Tilbage til forsiden
        </Link>
      </section>
    </div>
  )
}
