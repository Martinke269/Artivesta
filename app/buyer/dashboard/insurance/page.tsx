import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBuyerInsuranceStats,
  getBuyerInsuranceRecords,
  getBuyerInsuranceGalleries,
} from '@/lib/supabase/buyer-insurance-queries'
import { InsurancePageClient } from './insurance-page-client'

export const metadata = {
  title: 'Forsikring | Køber Dashboard',
  description: 'Administrer forsikringer for dine leasede kunstværker',
}

export default async function BuyerInsurancePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all data in parallel
  const [stats, records, galleries] = await Promise.all([
    getBuyerInsuranceStats(user.id),
    getBuyerInsuranceRecords(user.id),
    getBuyerInsuranceGalleries(user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Forsikring</h1>
        <p className="text-muted-foreground">
          Administrer forsikringer for dine leasede kunstværker
        </p>
      </div>

      <InsurancePageClient
        initialStats={stats}
        initialRecords={records}
        galleries={galleries}
      />
    </div>
  )
}
