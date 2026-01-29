"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Send, CheckCircle } from "lucide-react"

interface Order {
  id: string
  amount_cents: number
  currency: string
  status: string
  escrow_status: string
  buyer_approved: boolean
  buyer_approved_at: string | null
  created_at: string
  buyer_id: string
  seller_id: string
  artworks: {
    title: string
    image_url: string
  }
  seller: {
    name: string
    email: string
  }
  buyer: {
    name: string
    email: string
  }
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender: {
    name: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadOrderAndMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`order-${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${params.id}`
        },
        (payload) => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  const loadOrderAndMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setCurrentUserId(user.id)

      // Load order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          artworks:artwork_id (title, image_url),
          seller:seller_id (name, email),
          buyer:buyer_id (name, email)
        `)
        .eq("id", params.id)
        .single()

      if (orderError) throw orderError
      
      // Check if user is buyer or seller
      if (orderData.buyer_id !== user.id && orderData.seller_id !== user.id) {
        router.push("/orders")
        return
      }

      setOrder(orderData)
      await loadMessages()
    } catch (error) {
      console.error("Error loading order:", error)
      setError("Kunne ikke indlæse ordre")
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id (name)
        `)
        .eq("order_id", params.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      const unreadMessages = data?.filter(
        m => !m.read && m.receiver_id === currentUserId
      )
      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadMessages.map(m => m.id))
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !order || !currentUserId) return

    setSending(true)
    setError("")

    try {
      const receiverId = currentUserId === order.buyer_id ? order.seller_id : order.buyer_id

      const { error } = await supabase
        .from("messages")
        .insert({
          order_id: order.id,
          sender_id: currentUserId,
          receiver_id: receiverId,
          content: newMessage.trim()
        })

      if (error) throw error

      setNewMessage("")
      await loadMessages()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSending(false)
    }
  }

  const handleApproveOrder = async () => {
    if (!order || !currentUserId) return

    setApproving(true)
    setError("")

    try {
      // Update order
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          buyer_approved: true,
          buyer_approved_at: new Date().toISOString(),
          status: "completed",
          escrow_status: "released"
        })
        .eq("id", order.id)

      if (orderError) throw orderError

      // Update payout status to approved
      const { error: payoutError } = await supabase
        .from("payouts")
        .update({
          status: "approved",
          approved_by: currentUserId,
          approved_at: new Date().toISOString()
        })
        .eq("order_id", order.id)

      if (payoutError) throw payoutError

      await loadOrderAndMessages()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setApproving(false)
    }
  }

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("da-DK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

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

  if (!order) {
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
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Ordre ikke fundet</p>
              <Link href="/orders">
                <Button>Tilbage til ordrer</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isBuyer = currentUserId === order.buyer_id
  const otherParty = isBuyer ? order.seller : order.buyer

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Kunstnerplatform
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/orders" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tilbage til ordrer
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ordre Detaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.artworks?.image_url && (
                  <img
                    src={order.artworks.image_url}
                    alt={order.artworks.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{order.artworks?.title}</h3>
                  <p className="text-sm text-gray-600">
                    {isBuyer ? `Sælger: ${order.seller.name}` : `Køber: ${order.buyer.name}`}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Beløb:</span>
                    <span className="font-semibold">
                      {formatPrice(order.amount_cents, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                      {order.status === "pending" ? "Afventer" :
                       order.status === "paid" ? "Betalt" :
                       order.status === "completed" ? "Gennemført" : "Annulleret"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Escrow:</span>
                    <Badge variant={order.escrow_status === "released" ? "default" : "secondary"}>
                      {order.escrow_status === "held" ? "Deponeret" :
                       order.escrow_status === "released" ? "Frigivet" : "Refunderet"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Oprettet:</span>
                    <span className="text-sm">{formatDate(order.created_at)}</span>
                  </div>
                </div>

                {isBuyer && !order.buyer_approved && order.status !== "cancelled" && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Har du modtaget kunstværket i god stand?
                      </p>
                      <Button
                        className="w-full"
                        onClick={handleApproveOrder}
                        disabled={approving}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approving ? "Godkender..." : "Godkend Modtagelse"}
                      </Button>
                      <p className="text-xs text-gray-500">
                        Dette frigiver pengene til sælgeren
                      </p>
                    </div>
                  </>
                )}

                {order.buyer_approved && (
                  <>
                    <Separator />
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ✓ Ordre godkendt
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formatDate(order.buyer_approved_at!)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Beskeder</CardTitle>
                <CardDescription>
                  Chat med {otherParty.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-4 py-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Ingen beskeder endnu. Start en samtale!
                      </p>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.sender_id === currentUserId
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isOwn
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm font-medium mb-1">
                                {message.sender.name}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {formatDate(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Skriv en besked..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="min-h-[60px]"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      size="icon"
                      className="h-[60px] w-[60px]"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tryk Enter for at sende, Shift+Enter for ny linje
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
