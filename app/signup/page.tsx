"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Percent, Shield, CheckCircle2, CreditCard, Package, Palette } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"artist" | "business">("artist")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        // Insert user profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email,
            name,
            role,
          })

        if (profileError) throw profileError

        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4 py-8">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
        {/* USP Section */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          {role === "artist" ? (
            <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-fit mb-2">
                  <Palette className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">For Kunstnere</span>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Kun 20% kommission
                </CardTitle>
                <CardDescription className="text-base">
                  Du betaler kun for den kunst, du faktisk får solgt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Percent className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">20% kommission</h4>
                    <p className="text-sm text-gray-600">
                      Blandt de laveste i branchen. Du beholder 80% af salgsprisen.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Ingen skjulte gebyrer</h4>
                    <p className="text-sm text-gray-600">
                      Betal kun når du sælger. Ingen månedlige abonnementer.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">20%</div>
                    <div className="text-xs text-gray-600">Kommission</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">80%</div>
                    <div className="text-xs text-gray-600">Til dig</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-blue-200 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-fit mb-2">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">For Virksomheder</span>
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Sikker betaling med Escrow
                </CardTitle>
                <CardDescription className="text-base">
                  Dine penge er beskyttet indtil kunsten er leveret
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">1. Du betaler</h4>
                    <p className="text-sm text-gray-600">
                      Dine penge placeres sikkert i escrow
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">2. Kunst leveres</h4>
                    <p className="text-sm text-gray-600">
                      Du modtager og inspicerer kunsten
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">3. Frigiv betaling</h4>
                    <p className="text-sm text-gray-600">
                      Når du er tilfreds frigives pengene
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Signup Form */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Opret konto</CardTitle>
          <CardDescription>Opret din kunstnerplatform konto</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dit navn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.dk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Adgangskode</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Jeg er</Label>
              <Select value={role} onValueChange={(value: "artist" | "business") => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Kunstner</SelectItem>
                  <SelectItem value="business">Virksomhed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Opretter konto..." : "Opret konto"}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Har du allerede en konto?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Log ind
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}
