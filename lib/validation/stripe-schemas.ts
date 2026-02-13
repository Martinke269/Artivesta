/**
 * Zod Validation Schemas for Stripe Connect API
 */

import { z } from 'zod';

// Onboarding Request Schema
export const onboardingRequestSchema = z.object({
  galleryId: z.string().uuid('Invalid gallery ID format'),
  email: z.string().email('Invalid email format'),
  country: z.string().length(2, 'Country code must be 2 characters').optional().default('DK'),
  businessType: z.enum(['individual', 'company']).optional().default('company'),
});

export type OnboardingRequest = z.infer<typeof onboardingRequestSchema>;

// Refresh Request Schema
export const refreshRequestSchema = z.object({
  galleryId: z.string().uuid('Invalid gallery ID format'),
});

export type RefreshRequest = z.infer<typeof refreshRequestSchema>;

// Status Request Schema
export const statusRequestSchema = z.object({
  galleryId: z.string().uuid('Invalid gallery ID format'),
});

export type StatusRequest = z.infer<typeof statusRequestSchema>;

// Escrow Release Request Schema
export const escrowReleaseSchema = z.object({
  leaseId: z.string().uuid('Invalid lease ID format').optional(),
  orderId: z.string().uuid('Invalid order ID format').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  reason: z.string().optional(),
}).refine(
  (data) => data.leaseId || data.orderId,
  { message: 'Either leaseId or orderId must be provided' }
);

export type EscrowReleaseRequest = z.infer<typeof escrowReleaseSchema>;

// Payout List Query Schema
export const payoutListQuerySchema = z.object({
  galleryId: z.string().uuid('Invalid gallery ID format'),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  status: z.enum(['pending', 'in_transit', 'paid', 'failed', 'canceled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type PayoutListQuery = z.infer<typeof payoutListQuerySchema>;

// Transfer List Query Schema
export const transferListQuerySchema = z.object({
  galleryId: z.string().uuid('Invalid gallery ID format'),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  status: z.enum(['completed', 'reversed', 'pending']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type TransferListQuery = z.infer<typeof transferListQuerySchema>;

// Alert List Query Schema
export const alertListQuerySchema = z.object({
  galleryId: z.string().uuid('Invalid gallery ID format'),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  severity: z.enum(['info', 'warning', 'high', 'critical']).optional(),
  resolved: z.coerce.boolean().optional(),
});

export type AlertListQuery = z.infer<typeof alertListQuerySchema>;

// Alert Update Schema
export const alertUpdateSchema = z.object({
  alertId: z.string().uuid('Invalid alert ID format'),
  resolved: z.boolean().optional(),
  resolvedNote: z.string().optional(),
});

export type AlertUpdate = z.infer<typeof alertUpdateSchema>;

// Webhook Event Schemas
export const stripeAccountSchema = z.object({
  id: z.string(),
  object: z.literal('account'),
  business_type: z.string().optional(),
  charges_enabled: z.boolean(),
  payouts_enabled: z.boolean(),
  details_submitted: z.boolean(),
  requirements: z.object({
    currently_due: z.array(z.string()).optional(),
    eventually_due: z.array(z.string()).optional(),
    past_due: z.array(z.string()).optional(),
    pending_verification: z.array(z.string()).optional(),
    disabled_reason: z.string().nullable().optional(),
  }).optional(),
  capabilities: z.record(z.string()).optional(),
});

export const stripePayoutSchema = z.object({
  id: z.string(),
  object: z.literal('payout'),
  amount: z.number(),
  currency: z.string(),
  arrival_date: z.number(),
  status: z.enum(['pending', 'in_transit', 'paid', 'failed', 'canceled']),
  method: z.string(),
  type: z.string(),
  destination: z.string().optional(),
  failure_code: z.string().nullable().optional(),
  failure_message: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
});

export const stripeTransferSchema = z.object({
  id: z.string(),
  object: z.literal('transfer'),
  amount: z.number(),
  currency: z.string(),
  destination: z.string(),
  source_transaction: z.string().nullable().optional(),
  reversed: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export const stripeChargeSchema = z.object({
  id: z.string(),
  object: z.literal('charge'),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  paid: z.boolean(),
  refunded: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

export const stripeDisputeSchema = z.object({
  id: z.string(),
  object: z.literal('dispute'),
  charge: z.string(),
  amount: z.number(),
  currency: z.string(),
  reason: z.string(),
  status: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const stripeApplicationFeeSchema = z.object({
  id: z.string(),
  object: z.literal('application_fee'),
  amount: z.number(),
  currency: z.string(),
  charge: z.string(),
  refunded: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

// Webhook Event Schema
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
  account: z.string().optional(),
});

export type WebhookEvent = z.infer<typeof webhookEventSchema>;
