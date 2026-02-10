import { createClient } from '@/utils/supabase/server'
import type { BuyerPaymentsStats } from './buyer-payments-types'

// ============================================================================
// BUYER PAYMENTS STATS QUERIES
// ============================================================================

/**
 * Get payment statistics for buyer
 */
export async function getBuyerPaymentsStats(
  userId: string
): Promise<BuyerPaymentsStats> {
  const supabase = await createClient()

  // Get all orders for buyer
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, payment_intent_id')
    .eq('buyer_id', userId)

  // Get all lease payments for buyer
  const { data: leasePayments } = await supabase
    .from('lease_payments')
    .select('id, status, leases!inner(buyer_id)')
    .eq('leases.buyer_id', userId)

  const totalOrders = orders?.length || 0
  const totalLeasePayments = leasePayments?.length || 0
  const totalPayments = totalOrders + totalLeasePayments

  // Count successful payments
  const successfulOrders =
    orders?.filter(
      (o) =>
        o.status === 'completed' ||
        o.status === 'shipped' ||
        o.status === 'delivered'
    ).length || 0
  const successfulLeasePayments =
    leasePayments?.filter((lp) => lp.status === 'paid').length || 0
  const successfulPayments = successfulOrders + successfulLeasePayments

  // Count failed payments
  const failedOrders =
    orders?.filter(
      (o) =>
        o.status === 'failed' ||
        o.status === 'cancelled' ||
        o.status === 'refunded'
    ).length || 0
  const failedLeasePayments =
    leasePayments?.filter((lp) => lp.status === 'failed').length || 0
  const failedPayments = failedOrders + failedLeasePayments

  return {
    totalPayments,
    successfulPayments,
    failedPayments,
  }
}
