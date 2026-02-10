import type { BuyerInvoiceDetail } from './buyer-invoices-types'
import { getBuyerInvoices } from './buyer-invoices-list'

// ============================================================================
// BUYER INVOICES DETAILS QUERIES
// ============================================================================

/**
 * Get single invoice details for buyer
 */
export async function getBuyerInvoiceById(
  userId: string,
  invoiceId: string
): Promise<BuyerInvoiceDetail | null> {
  const invoices = await getBuyerInvoices(userId, {})
  return invoices.find((i) => i.id === invoiceId) || null
}
