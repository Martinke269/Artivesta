import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Shield, CheckCircle2, Package, CreditCard } from "lucide-react"
import Link from "next/link"

export function BuyerUSPSection() {
  return (
    <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-20 -ml-16 -mb-16" />
      
      <div className="relative p-4 md:p-5">
        <div className="text-center space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
            <Building2 className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">For Virksomheder</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-xl md:text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sikker betaling med Escrow
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xs md:text-sm text-gray-700 font-medium">
            Dine penge er beskyttet indtil kunsten er leveret
          </p>

          {/* 3-Step Process */}
          <div className="space-y-2 pt-2">
            <div className="flex items-start gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Du betaler</h3>
                <p className="text-xs text-gray-600">
                  Pengene placeres sikkert i escrow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Kunst leveres</h3>
                <p className="text-xs text-gray-600">
                  Du modtager og inspicerer værket
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg text-left">
              <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Frigiv betaling</h3>
                <p className="text-xs text-gray-600">
                  Når du er tilfreds frigives pengene
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-3">
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full text-xs h-8">
                <Building2 className="h-3 w-3 mr-1.5" />
                Udforsk kunst
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
