import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBuyerLeasingStats,
  getBuyerLeases,
  getBuyerLeaseGalleries,
} from '@/lib/supabase/buyer-leasing-queries'
import { LeasingPageClient } from './leasing-page-client'

export const metadata = {
  title: 'Mine leasingaftaler | Buyer Dashboard',
  description: 'Administrer dine kunstværk leasingaftaler',
}

export default async function BuyerLeasingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all data in parallel
  const [stats, leases, galleries] = await Promise.all([
    getBuyerLeasingStats(user.id),
    getBuyerLeases(user.id),
    getBuyerLeaseGalleries(user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mine leasingaftaler</h1>
        <p className="text-muted-foreground">
          Administrer og følg dine kunstværk leasingaftaler
        </p>
      </div>

      <LeasingPageClient
        initialStats={stats}
        initialLeases={leases}
        galleries={galleries}
      />
    </div>
  )
}
