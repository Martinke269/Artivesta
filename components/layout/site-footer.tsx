import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-purple-100 mt-16">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600">
          <p className="text-sm md:text-base">© 2026 ART IS SAFE. Professionel kunst til erhvervslivet.</p>
          <nav className="flex gap-6 text-sm">
            <Link href="/betingelser" className="hover:text-purple-600 transition-colors">
              Handelsbetingelser
            </Link>
            <Link href="/cookies" className="hover:text-purple-600 transition-colors">
              Cookie-politik
            </Link>
            <Link href="/privatlivspolitik" className="hover:text-purple-600 transition-colors">
              Privatlivspolitik
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
