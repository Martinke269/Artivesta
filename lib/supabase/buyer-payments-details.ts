import type { BuyerPaymentDetail } from './buyer-payments-types'
import { getBuyerPayments } from './buyer-payments-list'

// ============================================================================
// BUYER PAYMENTS DETAILS QUERIES
// ============================================================================

/**
 * Get single payment details for buyer
 */
export async function getBuyerPaymentById(
  userId: string,
  paymentId: string
): Promise<BuyerPaymentDetail | null> {
  const payments = await getBuyerPayments(userId, {})
  return payments.find((p) => p.id === paymentId) || null
}
