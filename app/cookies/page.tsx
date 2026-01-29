import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie-politik | ART IS SAFE',
  description: 'Læs om hvordan ART IS SAFE bruger cookies på vores platform',
}

export default function CookiePolitikPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Cookie-politik</h1>
      
      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <p className="text-gray-600 mb-6">
            Sidst opdateret: 28. januar 2026
          </p>
          <p className="mb-6">
            Denne cookie-politik forklarer, hvordan ART IS SAFE bruger cookies og lignende teknologier
            på vores platform. Ved at bruge vores hjemmeside accepterer du brugen af cookies i
            overensstemmelse med denne politik.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Hvad er cookies?</h2>
          <p>
            Cookies er små tekstfiler, som gemmes på din computer eller mobile enhed, når du besøger 
            en hjemmeside. De bruges til at gøre hjemmesider mere funktionelle og til at give 
            hjemmesideejere information om, hvordan deres hjemmeside bruges.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Hvordan bruger vi cookies?</h2>
          <p className="mb-4">
            ART IS SAFE bruger cookies til følgende formål:
          </p>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">Nødvendige cookies</h3>
          <p className="mb-3">
            Disse cookies er essentielle for, at hjemmesiden kan fungere korrekt. De kan ikke slås fra.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Autentifikation:</strong> Holder dig logget ind på platformen</li>
            <li><strong>Sikkerhed:</strong> Beskytter mod svindel og sikrer sikker kommunikation</li>
            <li><strong>Cookie-samtykke:</strong> Husker dine cookie-præferencer</li>
            <li><strong>Session:</strong> Opretholder din session mens du navigerer på siden</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Funktionelle cookies</h3>
          <p className="mb-3">
            Disse cookies gør det muligt for hjemmesiden at huske dine valg og give forbedrede funktioner.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Sprogindstillinger:</strong> Husker dit foretrukne sprog</li>
            <li><strong>Brugerindstillinger:</strong> Gemmer dine præferencer for visning</li>
            <li><strong>Formulardata:</strong> Husker information du har indtastet i formularer</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Analytiske cookies</h3>
          <p className="mb-3">
            Disse cookies hjælper os med at forstå, hvordan besøgende bruger vores hjemmeside, 
            så vi kan forbedre brugeroplevelsen.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Besøgsstatistik:</strong> Antal besøgende, sidevisninger og besøgstid</li>
            <li><strong>Brugeradfærd:</strong> Hvilke sider der besøges og i hvilken rækkefølge</li>
            <li><strong>Teknisk information:</strong> Browser, enhed og skærmopløsning</li>
            <li><strong>Trafik-kilder:</strong> Hvordan brugere finder vores hjemmeside</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            Vi bruger disse data til at forbedre platformen og forstå vores brugeres behov. 
            Alle analytiske data er anonymiserede og kan ikke bruges til at identificere dig personligt.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Marketing cookies</h3>
          <p className="mb-3">
            Disse cookies bruges til at vise relevante annoncer og måle effektiviteten af vores 
            marketingkampagner.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Målrettet annoncering:</strong> Viser relevante annoncer baseret på dine interesser</li>
            <li><strong>Kampagnemåling:</strong> Måler effektiviteten af vores markedsføring</li>
            <li><strong>Retargeting:</strong> Viser annoncer til brugere, der har besøgt vores hjemmeside</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Specifikke cookies vi bruger</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Cookie navn</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Formål</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Varighed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">artissafe_session</td>
                  <td className="border border-gray-300 px-4 py-2">Nødvendig</td>
                  <td className="border border-gray-300 px-4 py-2">Opretholder din session</td>
                  <td className="border border-gray-300 px-4 py-2">Session</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">artissafe_auth</td>
                  <td className="border border-gray-300 px-4 py-2">Nødvendig</td>
                  <td className="border border-gray-300 px-4 py-2">Autentifikation</td>
                  <td className="border border-gray-300 px-4 py-2">7 dage</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">artissafe_consent</td>
                  <td className="border border-gray-300 px-4 py-2">Nødvendig</td>
                  <td className="border border-gray-300 px-4 py-2">Gemmer cookie-samtykke</td>
                  <td className="border border-gray-300 px-4 py-2">1 år</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">artissafe_analytics</td>
                  <td className="border border-gray-300 px-4 py-2">Analytisk</td>
                  <td className="border border-gray-300 px-4 py-2">Anonymiseret brugsstatistik</td>
                  <td className="border border-gray-300 px-4 py-2">2 år</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">artissafe_preferences</td>
                  <td className="border border-gray-300 px-4 py-2">Funktionel</td>
                  <td className="border border-gray-300 px-4 py-2">Brugerindstillinger</td>
                  <td className="border border-gray-300 px-4 py-2">1 år</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Tredjepartscookies</h2>
          <p className="mb-4">
            Vi bruger også cookies fra tredjeparter til at levere visse tjenester:
          </p>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">Supabase (Autentifikation og Database)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bruges til sikker login og datahåndtering</li>
            <li>Nødvendig for platformens funktion</li>
            <li>Læs mere: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Supabase Privacy Policy</a></li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Vercel (Hosting)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bruges til at hoste og levere hjemmesiden</li>
            <li>Indsamler anonymiseret performance-data</li>
            <li>Læs mere: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Vercel Privacy Policy</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Sådan administrerer du cookies</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-4">Cookie-indstillinger på ART IS SAFE</h3>
          <p className="mb-3">
            Du kan til enhver tid ændre dine cookie-præferencer ved at klikke på "Cookie-indstillinger" 
            i bunden af siden. Her kan du vælge, hvilke typer cookies du vil acceptere.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Browser-indstillinger</h3>
          <p className="mb-3">
            De fleste browsere accepterer automatisk cookies, men du kan ændre dine browser-indstillinger 
            til at afvise cookies, hvis du foretrækker det. Bemærk, at hvis du afviser cookies, 
            kan nogle funktioner på hjemmesiden muligvis ikke fungere korrekt.
          </p>
          <p className="mb-3">
            Sådan administrerer du cookies i forskellige browsere:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/da/kb/beskyttelse-mod-sporingsindhold-i-firefox" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/da-dk/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/da-dk/microsoft-edge/slet-cookies-i-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Microsoft Edge</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Dine rettigheder</h2>
          <p className="mb-3">
            I henhold til GDPR har du følgende rettigheder vedrørende cookies og persondata:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Ret til information:</strong> Du har ret til at vide, hvilke cookies vi bruger</li>
            <li><strong>Ret til at trække samtykke tilbage:</strong> Du kan til enhver tid ændre dine cookie-præferencer</li>
            <li><strong>Ret til sletning:</strong> Du kan anmode om at få slettet data indsamlet via cookies</li>
            <li><strong>Ret til indsigt:</strong> Du kan anmode om at se, hvilke data vi har indsamlet om dig</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Opdateringer af cookie-politikken</h2>
          <p>
            Vi kan opdatere denne cookie-politik fra tid til anden for at afspejle ændringer i vores 
            brug af cookies eller af juridiske årsager. Vi anbefaler, at du regelmæssigt gennemgår 
            denne side for at holde dig opdateret om vores cookie-praksis.
          </p>
          <p className="mt-3">
            Væsentlige ændringer vil blive kommunikeret via en notifikation på hjemmesiden eller via e-mail.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Kontakt os</h2>
          <p className="mb-3">
            Hvis du har spørgsmål om vores brug af cookies, er du velkommen til at kontakte os:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="font-semibold mb-2">ART IS SAFE</p>
            <p>E-mail: support@artissafe.com</p>
            <p>Telefon: +45 XX XX XX XX</p>
          </div>
        </section>

        <section className="border-t pt-8 mt-12">
          <p className="text-sm text-gray-600">
            Ved at fortsætte med at bruge ART IS SAFE accepterer du vores brug af cookies i
            overensstemmelse med denne politik.
          </p>
        </section>
      </div>
    </div>
  )
}
