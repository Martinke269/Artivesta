import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBuyerOrdersStats,
  getBuyerOrders,
  getBuyerOrderGalleries,
} from '@/lib/supabase/buyer-orders-queries'
import { OrdersPageClient } from './orders-page-client'

export const metadata = {
  title: 'Mine ordrer | Buyer Dashboard',
  description: 'Se og administrer dine kunstordrer',
}

export default async function BuyerOrdersPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch data in parallel
  const [stats, orders, galleries] = await Promise.all([
    getBuyerOrdersStats(user.id),
    getBuyerOrders(user.id),
    getBuyerOrderGalleries(user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mine ordrer</h1>
        <p className="text-muted-foreground">
          Se og administrer dine kunstordrer
        </p>
      </div>

      <OrdersPageClient
        initialStats={stats}
        initialOrders={orders}
        galleries={galleries}
      />
    </div>
  )
}
