/**
 * Supabase Query Helpers for Stripe Connect
 * 
 * This file re-exports all Stripe-related queries from modular files
 * for backward compatibility and convenience.
 */

// Account queries
export {
  getGalleryStripeAccount,
  upsertStripeAccount,
} from './stripe-accounts-queries';

// Payout queries
export {
  getGalleryPayouts,
  createPayoutRecord,
  updatePayoutRecord,
} from './stripe-payouts-queries';

// Transfer queries
export {
  getGalleryTransfers,
  createTransferRecord,
  updateTransferRecord,
} from './stripe-transfers-queries';

// Event queries
export {
  createStripeEventRecord,
  markEventProcessed,
} from './stripe-events-queries';

// Application fee queries
export {
  createApplicationFeeRecord,
} from './stripe-fees-queries';

// Escrow queries
export {
  createEscrowRecord,
  updateEscrowStatus,
} from './stripe-escrow-queries';

// Alert queries
export {
  createStripeAlert,
  getGalleryStripeAlerts,
  markAlertAsRead,
  resolveAlert,
} from './stripe-alerts-queries';

// Metrics queries
export {
  getGalleryStripeMetrics,
  canGalleryReceivePayouts,
} from './stripe-metrics-queries';
