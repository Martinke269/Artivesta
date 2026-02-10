import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  getBuyerInvoicesStats,
  getBuyerInvoices,
  getBuyerInvoiceGalleries,
} from '@/lib/supabase/buyer-invoices-queries'
import { InvoicesPageClient } from './invoices-page-client'

export const metadata = {
  title: 'Fakturaer | Buyer Dashboard',
  description: 'Se og administrer dine fakturaer',
}

export default async function BuyerInvoicesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all data in parallel
  const [stats, invoices, galleries] = await Promise.all([
    getBuyerInvoicesStats(user.id),
    getBuyerInvoices(user.id),
    getBuyerInvoiceGalleries(user.id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fakturaer</h1>
        <p className="text-muted-foreground">
          Se og administrer dine fakturaer fra ordrer og leasing
        </p>
      </div>

      <InvoicesPageClient
        initialStats={stats}
        initialInvoices={invoices}
        initialGalleries={galleries}
      />
    </div>
  )
}
