import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Handelsbetingelser | ART IS SAFE',
  description: 'Læs vores handelsbetingelser for køb og salg af kunst på ART IS SAFE platformen',
}

export default function BetingelserPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Handelsbetingelser</h1>
      
      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <p className="text-gray-600 mb-6">
            Sidst opdateret: 28. januar 2026
          </p>
          <p className="mb-6">
            Velkommen til ART IS SAFE. Ved at bruge vores platform accepterer du følgende handelsbetingelser. 
            Læs dem venligst omhyggeligt igennem.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Definitioner</h2>
          <div className="space-y-3">
            <p><strong>Platform:</strong> ART IS SAFE's online markedsplads for køb og salg af kunst.</p>
            <p><strong>Kunstner:</strong> En person eller virksomhed, der tilbyder kunstværker til salg på platformen.</p>
            <p><strong>Køber:</strong> En virksomhed eller organisation, der køber kunstværker gennem platformen.</p>
            <p><strong>Mellemmand:</strong> ART IS SAFE, der faciliterer transaktioner mellem kunstnere og købere.</p>
            <p><strong>Escrow:</strong> Sikkerhedssystem hvor betalinger holdes indtil transaktionen er gennemført.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Platformens Formål</h2>
          <p>
            ART IS SAFE er en B2B-platform, der forbinder professionelle kunstnere med virksomheder og organisationer. 
            Platformen fungerer som mellemmand og sikrer tryg handel gennem escrow-betaling og kvalitetskontrol.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Brugerregistrering</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Kunstnere</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kunstnere kan registrere sig som privatpersoner eller virksomheder</li>
            <li>CVR-nummer er ikke påkrævet for kunstnere</li>
            <li>Kunstnere skal angive korrekte kontaktoplysninger og bankoplysninger for udbetaling</li>
            <li>Kunstnere er ansvarlige for at overholde gældende skatteregler i deres land</li>
            <li>Kunstnere skal være mindst 18 år</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Købere (Virksomheder)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kun virksomheder og organisationer kan registrere sig som købere</li>
            <li>Købere skal angive korrekte virksomhedsoplysninger</li>
            <li>Købere er ansvarlige for korrekt fakturering og momsbehandling</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Upload og Salg af Kunstværker</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Kunstnerens Ansvar</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kunstneren garanterer at have fulde rettigheder til de uploadede værker</li>
            <li>Kunstværker skal præsenteres med korrekte oplysninger (titel, beskrivelse, pris, dimensioner)</li>
            <li>Billeder skal være af høj kvalitet og repræsentere værket præcist</li>
            <li>Kunstneren er ansvarlig for at værket er i den beskrevne stand</li>
            <li>Priser angives i danske kroner (DKK) inklusiv moms hvis relevant</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Platformens Rettigheder</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>ART IS SAFE forbeholder sig retten til at afvise eller fjerne kunstværker, der ikke overholder retningslinjerne</li>
            <li>Platformen må bruge billeder af kunstværker til markedsføring af platformen</li>
            <li>ART IS SAFE kan moderere og redigere beskrivelser for at sikre kvalitet</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Køb og Betaling</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Købsproces</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Køber vælger et kunstværk og gennemfører købet</li>
            <li>Betaling deponeres i escrow-system</li>
            <li>Kunstneren modtager notifikation om salget</li>
            <li>Kunstværket leveres til køber</li>
            <li>Køber logger ind og godkender modtagelsen af værket</li>
            <li>Kunstner logger ind og bekræfter at transaktionen er gennemført</li>
            <li>Efter begge parters godkendelse frigives betaling til kunstner</li>
          </ol>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Escrow-System</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Alle betalinger holdes i escrow indtil transaktionen er gennemført</li>
            <li>Dette sikrer både køber og sælger mod svindel</li>
            <li>Betalinger frigives kun efter at både køber og sælger har godkendt transaktionen via deres brugerlogin</li>
            <li>Begge parter skal aktivt bekræfte at handlen er gennemført tilfredsstillende</li>
            <li>Ved tvister holdes betalingen indtil løsning er fundet</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">5.3 Betalingsmetoder</h3>
          <p>
            Platformen accepterer følgende betalingsmetoder:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Betalingskort (Visa, Mastercard, Dankort)</li>
            <li>Bankoverførsel for større beløb</li>
            <li>Faktura for godkendte erhvervskunder</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Kommission og Gebyrer</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Platformskommission</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>ART IS SAFE opkræver en kommission på <strong>20% af salgsprisen</strong></li>
            <li>Kommissionen fratrækkes automatisk ved udbetaling til kunstner</li>
            <li>Kunstneren modtager 80% af den angivne salgspris</li>
            <li>Kommissionen dækker platformens drift, betalingsprocessering og support</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Eksempel på Udbetaling</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>Salgspris: 10.000 DKK</p>
            <p>Platformskommission (20%): 2.000 DKK</p>
            <p>Udbetaling til kunstner (80%): 8.000 DKK</p>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-4">6.3 Ingen Skjulte Gebyrer</h3>
          <p>
            Der er ingen yderligere gebyrer for kunstnere eller købere ud over den angivne kommission. 
            Eventuelle transaktionsgebyrer fra betalingsudbydere er inkluderet i kommissionen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Levering og Forsendelse</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Kunstnerens Ansvar</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kunstneren er ansvarlig for forsvarlig emballering af kunstværket</li>
            <li>Kunstværket skal sendes inden for 5 hverdage efter salg</li>
            <li>Kunstneren skal oplyse sporings-ID til køber og platform</li>
            <li>Forsendelsesomkostninger aftales mellem kunstner og køber</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Forsikring</h3>
          <p>
            Det anbefales kraftigt at forsikre kunstværker under transport. Kunstneren er ansvarlig for 
            værket indtil det er modtaget og godkendt af køber.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Fortrydelsesret og Returnering</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">8.1 B2B-Transaktioner</h3>
          <p>
            Da platformen faciliterer B2B-handel (virksomhed til virksomhed), gælder forbrugerlovgivningens 
            14-dages fortrydelsesret <strong>ikke</strong> for køb på platformen.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Reklamationsret</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Køber har ret til at reklamere hvis værket ikke svarer til beskrivelsen</li>
            <li>Reklamation skal ske inden for 7 dage efter modtagelse</li>
            <li>Køber skal dokumentere mangler med fotos</li>
            <li>Ved berettiget reklamation kan køber få pengene tilbage eller et erstatningsværk</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Returproces</h3>
          <p>
            Ved godkendt returnering:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Værket returneres til kunstner på købers regning</li>
            <li>Escrow-betalingen refunderes til køber</li>
            <li>Ingen kommission opkræves ved annullerede handler</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Fakturering</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">9.1 Automatisk Fakturagenerering</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Platformen genererer automatisk fakturaer ved gennemførte handler</li>
            <li>Køber modtager faktura for den fulde købspris</li>
            <li>Kunstner modtager faktura/afregningsbilag for udbetalingen (80% af salgspris)</li>
            <li>Fakturaer sendes elektronisk til registrerede e-mailadresser</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">9.2 Moms</h3>
          <p>
            Kunstnere er selv ansvarlige for korrekt momsbehandling i henhold til gældende lovgivning. 
            ART IS SAFE er ikke ansvarlig for kunstneres skattemæssige forhold.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Intellektuelle Rettigheder</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">10.1 Ophavsret</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kunstneren bevarer alle ophavsrettigheder til værket</li>
            <li>Køber erhverver kun det fysiske kunstværk, ikke ophavsretten</li>
            <li>Køber må ikke reproducere, kopiere eller kommercielt udnytte værket uden kunstnerens tilladelse</li>
            <li>Køber må udstille værket privat eller i virksomhedens lokaler</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">10.2 Platformens Brug</h3>
          <p>
            Ved upload giver kunstneren ART IS SAFE ret til at:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Vise værket på platformen</li>
            <li>Bruge billeder i markedsføringsmateriale</li>
            <li>Dele værket på sociale medier med kreditering</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Ansvar og Ansvarsfraskrivelse</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">11.1 Platformens Rolle</h3>
          <p>
            ART IS SAFE fungerer som mellemmand og markedsplads. Vi er ikke part i handlen mellem kunstner og køber, 
            men faciliterer transaktionen gennem escrow-system og administrative services.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">11.2 Ansvarsbegrænsning</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>ART IS SAFE er ikke ansvarlig for kunstværkers kvalitet eller ægthed</li>
            <li>Platformen er ikke ansvarlig for forsinkelser i levering</li>
            <li>Vi er ikke ansvarlige for skader under transport</li>
            <li>Platformen er ikke ansvarlig for tab som følge af tekniske fejl</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">11.3 Brugeransvar</h3>
          <p>
            Brugere er ansvarlige for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Korrekte og sandfærdige oplysninger</li>
            <li>Sikkerhed af login-oplysninger</li>
            <li>Overholdelse af gældende lovgivning</li>
            <li>Respektfuld kommunikation med andre brugere</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Tvistløsning</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">12.1 Kontakt ved Tvister</h3>
          <p>
            Ved uenigheder mellem køber og kunstner, skal du kontakte os direkte. 
            Vi tilbyder mægling for at finde en løsning, der er fair for begge parter.
          </p>
          <p className="mt-3">
            Find vores kontaktoplysninger under <strong>Kontakt</strong>-sektionen på hjemmesiden, 
            eller se kontaktinformation nederst på denne side.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4">12.2 Tvistløsningsproces</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kontakt os så hurtigt som muligt efter problemet opstår</li>
            <li>Beskriv situationen detaljeret og vedlæg relevant dokumentation</li>
            <li>Vi undersøger sagen og kommunikerer med begge parter</li>
            <li>Escrow-betalingen holdes indtil tvisten er løst</li>
            <li>Vi arbejder på at finde en løsning inden for 14 dage</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">12.3 Juridisk Tvistløsning</h3>
          <p>
            Hvis en tvist ikke kan løses gennem vores mægling, kan sagen indbringes for dansk domstol. 
            Dansk ret finder anvendelse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Databeskyttelse og Privatliv</h2>
          <p>
            ART IS SAFE behandler persondata i overensstemmelse med GDPR og dansk databeskyttelseslovgivning. 
            Læs vores privatlivspolitik for detaljerede oplysninger om databehandling.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Vi opbevarer kun nødvendige data for at drive platformen</li>
            <li>Data deles ikke med tredjeparter uden samtykke</li>
            <li>Brugere har ret til indsigt, rettelse og sletning af deres data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">14. Ændringer af Betingelser</h2>
          <p>
            ART IS SAFE forbeholder sig retten til at ændre disse handelsbetingelser. Væsentlige ændringer 
            vil blive kommunikeret til brugerne via e-mail mindst 30 dage før de træder i kraft.
          </p>
          <p className="mt-3">
            Fortsat brug af platformen efter ændringer træder i kraft, betragtes som accept af de nye betingelser.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">15. Opsigelse og Lukning af Konto</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">15.1 Brugerens Opsigelse</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Brugere kan til enhver tid lukke deres konto</li>
            <li>Igangværende transaktioner skal gennemføres før lukning</li>
            <li>Data slettes i henhold til GDPR-regler</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4">15.2 Platformens Opsigelse</h3>
          <p>
            ART IS SAFE kan lukke en konto ved:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gentagne overtrædelser af handelsbetingelser</li>
            <li>Svigagtig adfærd</li>
            <li>Misbrug af platformen</li>
            <li>Manglende betaling af skyldige beløb</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">16. Kontaktoplysninger</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold mb-2">ART IS SAFE</p>
            <p>E-mail: support@artissafe.dk</p>
            <p>Telefon: +45 XX XX XX XX</p>
            <p className="mt-4">
              For spørgsmål til disse handelsbetingelser eller generel support, er du velkommen til at kontakte os.
            </p>
          </div>
        </section>

        <section className="border-t pt-8 mt-12">
          <p className="text-sm text-gray-600">
            Ved at bruge ART IS SAFE accepterer du disse handelsbetingelser i deres helhed. 
            Hvis du ikke accepterer betingelserne, bedes du ikke bruge platformen.
          </p>
        </section>
      </div>
    </div>
  )
}
