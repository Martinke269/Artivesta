import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">ART IS SAFE</h3>
            <p className="text-sm text-gray-600">
              Professionel kunst til erhvervslivet
            </p>
          </div>

          {/* For virksomheder */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">For virksomheder</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-600">
              <Link href="/for-virksomheder" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Oversigt
              </Link>
              <Link href="/kuratering" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Kuratering
              </Link>
              <Link href="/custom-kunst" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Custom kunst
              </Link>
            </nav>
          </div>

          {/* For kunstnere */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">For kunstnere</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-600">
              <Link href="/for-kunstnere" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Bliv kunstner
              </Link>
              <Link href="/escrow" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Escrow-betaling
              </Link>
            </nav>
          </div>

          {/* Juridisk */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Juridisk</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-600">
              <Link href="/betingelser" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Handelsbetingelser
              </Link>
              <Link href="/cookies" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Cookie-politik
              </Link>
              <Link href="/privatlivspolitik" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">
                Privatlivspolitik
              </Link>
            </nav>
          </div>
        </div>

        {/* Partnere sektion */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <span className="text-sm text-gray-600 font-medium">Partnere:</span>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <a 
                href="https://www.regnskabsanalysen.dk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
              >
                Regnskabsanalysen.dk
              </a>
              <a 
                href="https://www.klartilbanken.dk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
              >
                Klartilbanken.dk
              </a>
              <a 
                href="https://www.oppmysales.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
              >
                OppMySales.com
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            © 2026 ART IS SAFE. Alle rettigheder forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  )
}
