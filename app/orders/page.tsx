"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Order {
  id: string
  amount_cents: number
  currency: string
  status: string
  escrow_status: string
  created_at: string
  artworks: {
    title: string
    image_url: string
  }
  seller: {
    name: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          artworks:artwork_id (title, image_url),
          seller:seller_id (name)
        `)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      pending: { label: "Afventer", variant: "destructive" },
      paid: { label: "Betalt", variant: "secondary" },
      completed: { label: "Gennemført", variant: "default" },
      cancelled: { label: "Annulleret", variant: "destructive" },
    }
    const config = variants[status] || { label: status, variant: "default" }
    return <Badge variant={config.variant}>{config.label}</Badge>
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
          <h2 className="text-3xl font-bold mb-2">Mine Ordrer</h2>
          <p className="text-gray-600">
            Se dine købte kunstværker
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p>Indlæser...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">
                Du har ikke købt nogen kunstværker endnu
              </p>
              <Link href="/" className="text-blue-600 hover:underline">
                Udforsk kunstværker
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Dine Ordrer</CardTitle>
              <CardDescription>
                Oversigt over dine købte kunstværker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kunstværk</TableHead>
                    <TableHead>Kunstner</TableHead>
                    <TableHead>Beløb</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Escrow</TableHead>
                    <TableHead>Dato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {order.artworks?.image_url && (
                            <img
                              src={order.artworks.image_url}
                              alt={order.artworks.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span>{order.artworks?.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.seller?.name}</TableCell>
                      <TableCell>
                        {formatPrice(order.amount_cents, order.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Badge variant={order.escrow_status === "held" ? "secondary" : "default"}>
                          {order.escrow_status === "held" ? "Deponeret" : 
                           order.escrow_status === "released" ? "Frigivet" : "Refunderet"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString("da-DK")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
