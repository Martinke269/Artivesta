"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Palette, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface HeroSectionProps {
  user: any
  searchQuery: string
  setSearchQuery: (value: string) => void
  onSearchSubmit?: () => void
}

export function HeroSection({ user, searchQuery, setSearchQuery, onSearchSubmit }: HeroSectionProps) {
  return (
    <section className="relative container mx-auto px-4 py-8 md:py-12 lg:py-16 text-center overflow-hidden" aria-label="Hero sektion">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/2 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-full text-xs md:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          Professionel kunst til erhvervslivet
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
        >
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
            Transformer dit kontor
          </span>
          <br />
          <span className="text-gray-900">med original kunst</span>
        </motion.h1>
        
        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Køb direkte fra talentfulde kunstnere. Sikker betaling gennem escrow. 
          <span className="block mt-1 text-purple-600 font-medium">
            Skab inspirerende arbejdspladser der gør en forskel
          </span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
        >
          {!user ? (
            <>
              <Link href="/signup" className="w-full sm:w-auto group">
                <Button 
                  size="default"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all duration-300 hover:scale-105"
                >
                  <Building2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Kom i gang
                </Button>
              </Link>
              <Link href="#artwork-grid" className="w-full sm:w-auto group">
                <Button 
                  size="default"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-purple-300 hover:border-purple-500 text-purple-700 hover:bg-purple-50 px-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Palette className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Udforsk kunst
                </Button>
              </Link>
            </>
          ) : (
            <Link href="#artwork-grid" className="w-full sm:w-auto group">
              <Button 
                size="default"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all duration-300 hover:scale-105"
              >
                <Palette className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Udforsk kunst
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4 text-xs md:text-sm text-gray-600"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Sikker escrow-betaling</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Verificerede kunstnere</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Original kunstværker</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
