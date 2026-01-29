import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Shield, CheckCircle2, Package, CreditCard } from "lucide-react"
import Link from "next/link"

export function BuyerUSPSection() {
  return (
    <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg h-full">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-20 -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-200 rounded-full blur-3xl opacity-20 -ml-24 -mb-24" />
      
      <div className="relative p-6">
        <div className="text-center space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
            <Building2 className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">For Virksomheder</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sikker betaling med Escrow
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-sm md:text-base text-gray-700 font-medium">
            Dine penge er beskyttet indtil kunsten er leveret
          </p>

          {/* 3-Step Process */}
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Du betaler</h3>
                <p className="text-xs text-gray-600">
                  Pengene placeres sikkert i escrow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Kunst leveres</h3>
                <p className="text-xs text-gray-600">
                  Du modtager og inspicerer værket
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Frigiv betaling</h3>
                <p className="text-xs text-gray-600">
                  Når du er tilfreds frigives pengene
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Udforsk kunst
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
