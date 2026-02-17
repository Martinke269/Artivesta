import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <CardContent className="py-12 md:py-16 text-center relative z-10 px-4">
          <h3 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Klar til at transformere dit kontor?</h3>
          <p className="text-base md:text-xl mb-6 md:mb-8 text-purple-100 max-w-2xl mx-auto">
            Bliv en del af ART IS SAFE og få adgang til unikke kunstværker fra talentfulde kunstnere
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-purple-50">
                <Building2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Opret virksomhedskonto
              </Button>
            </Link>
          </div>
          <p className="text-sm text-purple-100 mt-4">
            Ved at oprette en konto accepterer du vores{' '}
            <Link href="/betingelser" className="underline hover:text-white" target="_blank" rel="noopener noreferrer">
              handelsbetingelser
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
