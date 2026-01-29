import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, TrendingUp, Percent, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function ArtistUSPSection() {
  return (
    <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 shadow-lg h-full">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-20 -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-200 rounded-full blur-3xl opacity-20 -ml-24 -mb-24" />
      
      <div className="relative p-6">
        <div className="text-center space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
            <Palette className="h-3 w-3 text-white" />
            <span className="text-xs font-semibold text-white">For Kunstnere</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Kun 20% kommission
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-sm md:text-base text-gray-700 font-medium">
            Du betaler kun for den kunst, du faktisk får solgt
          </p>

          {/* Key Benefits */}
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">20% kommission</h3>
                <p className="text-xs text-gray-600">
                  Blandt de laveste i branchen
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Ingen skjulte gebyrer</h3>
                <p className="text-xs text-gray-600">
                  Betal kun når du sælger
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Hurtig udbetaling</h3>
                <p className="text-xs text-gray-600">
                  Få dine penge hurtigt
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full">
                <Palette className="h-4 w-4 mr-2" />
                Tilmeld dig som kunstner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
