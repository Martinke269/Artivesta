"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  amount_cents: number
  currency: string
  status: string
  escrow_status: string
  created_at: string
  artworks: {
    title: string
  }
  buyer: {
    name: string
    email: string
  }
  seller: {
    name: string
    email: string
  }
}

interface Payout {
  id: string
  order_id: string
  amount_cents: number
  commission_cents: number
  net_amount_cents: number
  status: string
  created_at: string
  orders: {
    id: string
    artworks: {
      title: string
    }
  }
  profiles: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "admin") {
        router.push("/")
        return
      }

      setIsAdmin(true)
      loadData()
    } catch (error) {
      console.error("Error checking admin:", error)
      router.push("/")
    }
  }

  const loadData = async () => {
    try {
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          artworks:artwork_id (title),
          buyer:buyer_id (name, email),
          seller:seller_id (name, email)
        `)
        .order("created_at", { ascending: false })

      if (ordersError) throw ordersError
      setOrders(ordersData || [])

      // Load payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from("payouts")
        .select(`
          *,
          orders:order_id (
            artworks:artwork_id (title)
          ),
          profiles:seller_id (name, email)
        `)
        .order("created_at", { ascending: false })

      if (payoutsError) throw payoutsError
      setPayouts(payoutsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("payouts")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", payoutId)

      if (error) throw error

      // Reload data
      loadData()
    } catch (error) {
      console.error("Error approving payout:", error)
    }
  }

  const handleCompletePayout = async (payoutId: string, orderId: string) => {
    try {
      // Update payout status
      const { error: payoutError } = await supabase
        .from("payouts")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", payoutId)

      if (payoutError) throw payoutError

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          escrow_status: "released",
        })
        .eq("id", orderId)

      if (orderError) throw orderError

      // Generate invoices (simplified - in real app would generate PDFs)
      const order = orders.find(o => o.id === orderId)
      const payout = payouts.find(p => p.id === payoutId)
      
      if (order && payout) {
        // Buyer invoice
        await supabase.from("invoices").insert({
          order_id: orderId,
          recipient_id: order.buyer.email,
          invoice_type: "buyer",
          amount_cents: order.amount_cents,
          invoice_number: `INV-B-${Date.now()}`,
          status: "generated",
        })

        // Seller invoice
        await supabase.from("invoices").insert({
          order_id: orderId,
          recipient_id: order.seller.email,
          invoice_type: "seller",
          amount_cents: payout.net_amount_cents,
          commission_cents: payout.commission_cents,
          invoice_number: `INV-S-${Date.now()}`,
          status: "generated",
        })
      }

      loadData()
    } catch (error) {
      console.error("Error completing payout:", error)
    }
  }

  const formatPrice = (cents: number, currency: string = "DKK") => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "destructive",
      paid: "secondary",
      completed: "default",
      approved: "secondary",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Kunstnerplatform - Admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Ordrer</TabsTrigger>
            <TabsTrigger value="payouts">Udbetalinger</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Alle Ordrer</CardTitle>
                <CardDescription>
                  Administrer ordrer og escrow-betalinger
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Indlæser...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-600">Ingen ordrer endnu</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kunstværk</TableHead>
                        <TableHead>Køber</TableHead>
                        <TableHead>Sælger</TableHead>
                        <TableHead>Beløb</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Escrow</TableHead>
                        <TableHead>Dato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.artworks?.title}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{order.buyer?.name}</div>
                              <div className="text-gray-500">{order.buyer?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{order.seller?.name}</div>
                              <div className="text-gray-500">{order.seller?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatPrice(order.amount_cents, order.currency)}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{getStatusBadge(order.escrow_status)}</TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString("da-DK")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Udbetalinger</CardTitle>
                <CardDescription>
                  Godkend og gennemfør udbetalinger til kunstnere (20% kommission)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Indlæser...</p>
                ) : payouts.length === 0 ? (
                  <p className="text-gray-600">Ingen udbetalinger endnu</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kunstværk</TableHead>
                        <TableHead>Kunstner</TableHead>
                        <TableHead>Bruttobeløb</TableHead>
                        <TableHead>Kommission (20%)</TableHead>
                        <TableHead>Nettobeløb</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell>
                            {payout.orders?.artworks?.title || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{payout.profiles?.name}</div>
                              <div className="text-gray-500">{payout.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatPrice(payout.amount_cents)}
                          </TableCell>
                          <TableCell>
                            {formatPrice(payout.commission_cents)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(payout.net_amount_cents)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell>
                            {payout.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleApprovePayout(payout.id)}
                              >
                                Godkend
                              </Button>
                            )}
                            {payout.status === "approved" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleCompletePayout(payout.id, payout.orders.id)}
                              >
                                Gennemfør
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
