"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { 
  Palette, 
  TrendingUp, 
  Percent, 
  CheckCircle2, 
  Video,
  Search,
  Users,
  Zap,
  Shield,
  Clock,
  Award,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Script from "next/script"

const benefits = [
  {
    icon: Percent,
    title: "Kun 20% kommission",
    description: "Blandt de laveste i branchen. Du beholder 80% af salgsprisen."
  },
  {
    icon: CheckCircle2,
    title: "Ingen skjulte gebyrer",
    description: "No cure, no pay. Du betaler kun når du faktisk sælger."
  },
  {
    icon: Users,
    title: "B2B-kunder med højere budgetter",
    description: "Få adgang til virksomheder der køber fysisk kunst i højere prisklasser."
  },
  {
    icon: Video,
    title: "Gratis præsentationsvideo",
    description: "Vi producerer professionel video af dig og dit arbejde."
  },
  {
    icon: Search,
    title: "Gratis SEO-optimeret profil",
    description: "Din kunstnerprofil bliver fundet af de rette kunder."
  },
  {
    icon: Award,
    title: "Professionel kuratering",
    description: "Vi hjælper med at præsentere din kunst på den bedste måde."
  },
  {
    icon: Clock,
    title: "Hurtig udbetaling",
    description: "Få dine penge hurtigt efter salget er gennemført."
  },
  {
    icon: Shield,
    title: "Sikker escrow-betaling",
    description: "Dine penge er beskyttet gennem hele processen."
  },
  {
    icon: Zap,
    title: "Fokus på salg",
    description: "Vi tager os af markedsføring, så du kan fokusere på at skabe kunst."
  }
]

const steps = [
  {
    number: "1",
    title: "Tilmeld dig",
    description: "Opret din profil og upload dine kunstværker"
  },
  {
    number: "2",
    title: "Vi kurerer",
    description: "Vi gennemgår og optimerer din profil og værker"
  },
  {
    number: "3",
    title: "Sælg kunst",
    description: "Virksomheder finder og køber din kunst"
  },
  {
    number: "4",
    title: "Få betaling",
    description: "Hurtig udbetaling efter levering"
  }
]

const faqs = [
  {
    question: "Hvad koster det at være med?",
    answer: "Det er helt gratis at tilmelde sig. Du betaler kun 20% kommission når du faktisk sælger et kunstværk. Ingen skjulte gebyrer eller månedlige abonnementer."
  },
  {
    question: "Hvem er jeres kunder?",
    answer: "Vores primære kunder er virksomheder der ønsker at investere i original kunst til deres kontorer, lobbyer og mødelokaler. De køber typisk i højere prisklasser end private kunder."
  },
  {
    question: "Hvordan fungerer betalingen?",
    answer: "Vi bruger escrow-betaling, hvilket betyder at kundens penge er sikret indtil kunstværket er leveret og godkendt. Derefter udbetaler vi til dig med fradrag af 20% kommission."
  },
  {
    question: "Hvad er præsentationsvideoer?",
    answer: "Vi producerer professionelle videoer hvor du præsenterer dig selv og dit arbejde. Dette hjælper virksomheder med at lære dig at kende og skaber tillid."
  },
  {
    question: "Hvordan hjælper I med at sælge min kunst?",
    answer: "Vi kurerer din profil, optimerer den til søgemaskiner, markedsfører platformen til virksomheder, og hjælper med at matche dine værker med de rette kunder."
  }
]

export default function ForKunstnere() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      
      if (profile) {
        setUserRole(profile.role)
      }
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "For Kunstnere - Sælg din kunst til erhvervslivet",
    "description": "Kun 20% kommission. Ingen gebyrer. No cure, no pay. Få adgang til B2B-kunder der køber kunst i højere prisklasser.",
    "url": "https://www.artissafe.dk/for-kunstnere",
    "mainEntity": {
      "@type": "Service",
      "name": "ART IS SAFE Kunstner Platform",
      "provider": {
        "@type": "Organization",
        "name": "ART IS SAFE"
      },
      "serviceType": "Kunstsalg platform",
      "areaServed": "DK",
      "offers": {
        "@type": "Offer",
        "price": "20",
        "priceCurrency": "DKK",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "20",
          "priceCurrency": "DKK",
          "unitText": "procent kommission"
        }
      }
    }
  }

  return (
    <>
      <Script
        id="structured-data-for-kunstnere"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-white">
        <SiteHeader user={user} userRole={userRole} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.15, 1],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md"
            >
              <Palette className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">For kunstnere</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Sælg din kunst til
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                erhvervslivet
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed"
            >
              Kun 20% kommission. Ingen gebyrer. No cure, no pay.
              <br />
              Få adgang til B2B-kunder der køber i højere prisklasser.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link href="/signup">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 text-lg h-14 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Palette className="h-6 w-6 mr-2" />
                  Tilmeld dig nu
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500 pt-4"
            >
              ✓ Gratis at tilmelde sig · ✓ Ingen binding · ✓ Betal kun ved salg
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Hvorfor vælge ART IS SAFE?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Vi giver dig de bedste betingelser og hjælper dig med at nå virksomheder der investerer i kunst
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-600 mb-4">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-gray-50 to-purple-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sådan kommer du i gang
              </h2>
              <p className="text-xl text-gray-600">
                Fire simple skridt til at sælge din kunst
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ofte stillede spørgsmål
              </h2>
            </motion.div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            >
              Klar til at sælge din kunst?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-purple-100"
            >
              Tilmeld dig i dag og få adgang til virksomheder der investerer i kunst
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/signup">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-10 text-lg h-14 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Tilmeld dig som kunstner
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-purple-100 pt-4"
            >
              Gratis at tilmelde sig · Ingen binding · Betal kun ved salg
            </motion.div>
          </div>
        </div>
      </section>

        <SiteFooter />
      </div>
    </>
  )
}
