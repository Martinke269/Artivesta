import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PaymentsPageClient } from './payments-page-client'
import {
  getBuyerPaymentsStats,
  getBuyerPayments,
  getBuyerPaymentGalleries,
} from '@/lib/supabase/buyer-payments-queries'

export const metadata = {
  title: 'Betalinger | Buyer Dashboard',
  description: 'Se og administrer dine betalinger',
}

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch initial data
  const [stats, payments, galleries] = await Promise.all([
    getBuyerPaymentsStats(user.id),
    getBuyerPayments(user.id),
    getBuyerPaymentGalleries(user.id),
  ])

  return (
    <PaymentsPageClient
      userId={user.id}
      initialStats={stats}
      initialPayments={payments}
      initialGalleries={galleries}
    />
  )
}
