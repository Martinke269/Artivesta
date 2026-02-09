"use client"

import { Shield, Palette, Award } from "lucide-react"
import { motion } from "framer-motion"

const usps = [
  {
    icon: Shield,
    title: "Sikker escrow-betaling"
  },
  {
    icon: Palette,
    title: "Håndplukkede kunstnere"
  },
  {
    icon: Award,
    title: "Original fysisk kunst"
  }
]

export function USPSection() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {usps.map((usp, index) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center space-y-3"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-900">
                <usp.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-gray-900">
                {usp.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
