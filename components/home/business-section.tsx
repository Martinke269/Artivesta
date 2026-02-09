"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const benefits = [
  "Professionel kuratering",
  "Sikker escrow-betaling",
  "Kvalitetssikrede værker"
]

export function BusinessSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                For virksomheder
              </h2>

              <div className="flex flex-wrap justify-center gap-6 text-gray-600">
                {benefits.map((benefit, index) => (
                  <span key={benefit} className="text-sm">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Link href="/for-virksomheder">
                <Button 
                  variant="outline"
                  className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white h-12 px-8"
                >
                  Læs mere
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
