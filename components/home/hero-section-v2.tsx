"use client"

import { Button } from "@/components/ui/button"
import { Building2, Palette } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface HeroSectionV2Props {
  user: any
}

export function HeroSectionV2({ user }: HeroSectionV2Props) {
  return (
    <section className="relative container mx-auto px-4 py-20 md:py-28 lg:py-36 text-center overflow-hidden" aria-label="Hero sektion">
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
            Professionel kunst til erhvervslivet
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            Original fysisk kunst fra håndplukkede kunstnere
          </p>
          
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
            Sikker escrow-betaling · No cure, no pay
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
        >
          <Link href="#artwork-grid" className="w-full sm:w-auto">
            <Button 
              size="lg"
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 px-10 text-base h-14 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Udforsk kunst
            </Button>
          </Link>
          {!user && (
            <Link href="/signup" className="w-full sm:w-auto">
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-gray-900 hover:bg-gray-900 hover:text-white px-10 text-base h-14 transition-all duration-300"
              >
                Kom i gang
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Subtle artist link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6"
        >
          <Link 
            href="/for-kunstnere"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-1"
          >
            Er du kunstner? Sælg din kunst til erhvervslivet
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
