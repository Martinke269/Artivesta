import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBuyerOverviewStats,
  getBuyerRecentActivities,
  getBuyerRecentOrders,
  getBuyerActiveLeases,
  getBuyerInsuranceStatus,
} from '@/lib/supabase/buyer-overview-queries'
import { SummaryCards } from '@/components/buyer/dashboard/summary-cards'
import { RecentActivities } from '@/components/buyer/dashboard/recent-activities'
import { OrdersMiniTable } from '@/components/buyer/dashboard/orders-mini-table'
import { LeasingMiniTable } from '@/components/buyer/dashboard/leasing-mini-table'
import { InsuranceStatus } from '@/components/buyer/dashboard/insurance-status'

export const metadata = {
  title: 'Køber Dashboard | Art Marketplace',
  description: 'Administrer dine ordrer, leasingaftaler og forsikringer',
}

export default async function BuyerDashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify user is a buyer (business role)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'business') {
    redirect('/')
  }

  // Fetch all dashboard data
  const [stats, activities, orders, leases, insurance] = await Promise.all([
    getBuyerOverviewStats(user.id),
    getBuyerRecentActivities(user.id),
    getBuyerRecentOrders(user.id),
    getBuyerActiveLeases(user.id),
    getBuyerInsuranceStatus(user.id),
  ])

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Køber Dashboard</h1>
        <p className="text-muted-foreground">
          Velkommen tilbage! Her er en oversigt over dine ordrer og leasingaftaler.
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          <RecentActivities activities={activities} />
          <OrdersMiniTable orders={orders} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <LeasingMiniTable leases={leases} />
          <InsuranceStatus
            missing={insurance.missing}
            expiring={insurance.expiring}
            valid={insurance.valid}
          />
        </div>
      </div>
    </div>
  )
}
