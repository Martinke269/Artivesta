import { createClient } from '@/utils/supabase/server'
import type { BuyerInvoicesStats } from './buyer-invoices-types'

// ============================================================================
// BUYER INVOICES STATS QUERIES
// ============================================================================

/**
 * Get invoice statistics for buyer
 */
export async function getBuyerInvoicesStats(
  userId: string
): Promise<BuyerInvoicesStats> {
  const supabase = await createClient()

  // Total invoices
  const { count: totalInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('invoice_type', 'buyer')

  // Paid invoices
  const { count: paidInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('invoice_type', 'buyer')
    .eq('status', 'paid')

  // Unpaid invoices (generated or sent, not paid)
  const { count: unpaidInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('invoice_type', 'buyer')
    .in('status', ['generated', 'sent'])

  return {
    totalInvoices: totalInvoices || 0,
    paidInvoices: paidInvoices || 0,
    unpaidInvoices: unpaidInvoices || 0,
  }
}
