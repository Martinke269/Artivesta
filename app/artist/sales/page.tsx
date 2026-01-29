"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { DollarSign, Clock, CheckCircle } from "lucide-react"

interface Sale {
  id: string
  amount_cents: number
  currency: string
  status: string
  escrow_status: string
  buyer_approved: boolean
  created_at: string
  artworks: {
    title: string
    image_url: string
  }
  buyer: {
    name: string
  }
}

interface Payout {
  id: string
  amount_cents: number
  commission_cents: number
  net_amount_cents: number
  status: string
  requested_at: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  orders: {
    artworks: {
      title: string
    }
  }
}

export default function ArtistSalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    loadSalesAndPayouts()
  }, [])

  const loadSalesAndPayouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Check if user is an artist
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "artist") {
        router.push("/")
        return
      }

      // Load sales
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select(`
          *,
          artworks:artwork_id (title, image_url),
          buyer:buyer_id (name)
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })

      if (salesError) throw salesError
      setSales(salesData || [])

      // Load payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from("payouts")
        .select(`
          *,
          orders:order_id (
            artworks:artwork_id (title)
          )
        `)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })

      if (payoutsError) throw payoutsError
      setPayouts(payoutsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Kunne ikke indlæse data")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async (payoutId: string) => {
    setRequesting(payoutId)
    setError("")

    try {
      const { error } = await supabase
        .from("payouts")
        .update({
          requested_at: new Date().toISOString()
        })
        .eq("id", payoutId)

      if (error) throw error

      await loadSalesAndPayouts()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setRequesting(null)
    }
  }

  const formatPrice = (cents: number, currency: string = "DKK") => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("da-DK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const getPayoutStatusBadge = (payout: Payout) => {
    if (payout.status === "approved" || payout.status === "completed") {
      return <Badge variant="default">Godkendt</Badge>
    }
    if (payout.status === "rejected") {
      return <Badge variant="destructive">Afvist</Badge>
    }
    if (payout.requested_at) {
      return <Badge variant="secondary">Anmodet</Badge>
    }
    return <Badge>Afventer</Badge>
  }

  const totalEarnings = payouts
    .filter(p => p.status === "approved" || p.status === "completed")
    .reduce((sum, p) => sum + p.net_amount_cents, 0)

  const pendingEarnings = payouts
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.net_amount_cents, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold">
              Kunstnerplatform
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <div className="h-96 bg-gray-200" />
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Kunstnerplatform
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Mine Salg & Udbetalinger</h2>
          <p className="text-gray-600">
            Oversigt over dine salg og udbetalinger
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Indtjening</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">Godkendte udbetalinger</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afventende</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(pendingEarnings)}</div>
              <p className="text-xs text-muted-foreground">Venter på godkendelse</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Antal Salg</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sales.length}</div>
              <p className="text-xs text-muted-foreground">Totalt antal ordrer</p>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Udbetalinger</CardTitle>
            <CardDescription>
              Anmod om udbetaling når køber har godkendt modtagelsen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Ingen udbetalinger endnu
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunstværk</TableHead>
                    <TableHead>Beløb</TableHead>
                    <TableHead>Kommission (20%)</TableHead>
                    <TableHead>Netto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dato</TableHead>
                    <TableHead>Handling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        {payout.orders?.artworks?.title || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatPrice(payout.amount_cents)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        -{formatPrice(payout.commission_cents)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(payout.net_amount_cents)}
                      </TableCell>
                      <TableCell>
                        {getPayoutStatusBadge(payout)}
                      </TableCell>
                      <TableCell>
                        {formatDate(payout.created_at)}
                      </TableCell>
                      <TableCell>
                        {payout.status === "pending" && !payout.requested_at ? (
                          <Button
                            size="sm"
                            onClick={() => handleRequestPayout(payout.id)}
                            disabled={requesting === payout.id}
                          >
                            {requesting === payout.id ? "Anmoder..." : "Anmod om udbetaling"}
                          </Button>
                        ) : payout.status === "rejected" ? (
                          <div className="text-xs text-red-600">
                            {payout.rejection_reason || "Afvist"}
                          </div>
                        ) : payout.requested_at && payout.status === "pending" ? (
                          <div className="text-xs text-gray-600">
                            Anmodet {formatDate(payout.requested_at)}
                          </div>
                        ) : payout.approved_at ? (
                          <div className="text-xs text-green-600">
                            Godkendt {formatDate(payout.approved_at)}
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Salgshistorik</CardTitle>
            <CardDescription>
              Alle dine salg og deres status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Ingen salg endnu
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunstværk</TableHead>
                    <TableHead>Køber</TableHead>
                    <TableHead>Beløb</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Escrow</TableHead>
                    <TableHead>Godkendt</TableHead>
                    <TableHead>Dato</TableHead>
                    <TableHead>Handling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {sale.artworks?.image_url && (
                            <img
                              src={sale.artworks.image_url}
                              alt={sale.artworks.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span>{sale.artworks?.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sale.buyer?.name}</TableCell>
                      <TableCell>
                        {formatPrice(sale.amount_cents, sale.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "completed" ? "default" : "secondary"}>
                          {sale.status === "pending" ? "Afventer" :
                           sale.status === "paid" ? "Betalt" :
                           sale.status === "completed" ? "Gennemført" : "Annulleret"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.escrow_status === "released" ? "default" : "secondary"}>
                          {sale.escrow_status === "held" ? "Deponeret" :
                           sale.escrow_status === "released" ? "Frigivet" : "Refunderet"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.buyer_approved ? (
                          <span className="text-green-600 text-sm">✓ Ja</span>
                        ) : (
                          <span className="text-gray-400 text-sm">Nej</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(sale.created_at)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/orders/${sale.id}`}>
                          <button className="text-blue-600 hover:underline text-sm">
                            Se detaljer
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
