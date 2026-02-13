// Types for Price Negotiation System

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export type EnhancedOfferStatus =
  | 'pending_offer'
  | 'offer_accepted'
  | 'payment_link_created'
  | 'awaiting_payment'
  | 'escrow_funded'
  | 'awaiting_approvals'
  | 'both_approved'
  | 'released'
  | 'disputed'
  | 'expired'
  | 'cancelled';

export interface Offer {
  id: string;
  artwork_id: string;
  buyer_id: string;
  seller_id: string;
  list_price_cents: number;
  offered_price_cents: number;
  status: OfferStatus;
  enhanced_status: EnhancedOfferStatus;
  message: string | null;
  payment_link_id: string | null;
  payment_link_url: string | null;
  stripe_payment_intent_id: string | null;
  price_deviation_alert_sent: boolean;
  expires_at: string | null;
  payment_deadline: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EscrowApproval {
  id: string;
  offer_id: string;
  buyer_approved: boolean;
  buyer_approved_at: string | null;
  seller_approved: boolean;
  seller_approved_at: string | null;
  both_approved: boolean;
  funds_released: boolean;
  funds_released_at: string | null;
  stripe_transfer_id: string | null;
  platform_fee_cents: number | null;
  vat_cents: number | null;
  seller_amount_cents: number | null;
  approval_deadline: string | null;
  is_stalled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAlert {
  id: string;
  alert_type: 'price_deviation' | 'escrow_issue' | 'payment_failed' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  offer_id: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface CreateOfferInput {
  artwork_id: string;
  seller_id: string;
  list_price_cents: number;
  offered_price_cents: number;
  message?: string;
}

export interface EscrowAmounts {
  platform_fee_cents: number;
  vat_cents: number;
  seller_amount_cents: number;
}

// Phase 2 Types

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface OfferDispute {
  id: string;
  offer_id: string;
  initiator_id: string;
  initiator_role: 'buyer' | 'seller';
  reason: string;
  description: string;
  attachments: any[];
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type EmailNotificationType =
  | 'offer_created'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'payment_link_ready'
  | 'payment_received'
  | 'seller_approved'
  | 'buyer_approved'
  | 'escrow_released'
  | 'price_deviation_alert'
  | 'payment_failed'
  | 'offer_expired'
  | 'approval_deadline_warning'
  | 'dispute_created'
  | 'dispute_resolved';

export interface EmailNotification {
  id: string;
  recipient_id: string;
  recipient_email: string;
  notification_type: EmailNotificationType;
  subject: string;
  template_data: Record<string, any>;
  offer_id: string | null;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

export interface OfferAuditLog {
  id: string;
  offer_id: string;
  event_type: string;
  actor_id: string | null;
  actor_role: string | null;
  old_status: string | null;
  new_status: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface CreateDisputeInput {
  offer_id: string;
  reason: string;
  description: string;
  attachments?: any[];
}

export interface ResolveDisputeInput {
  dispute_id: string;
  resolution: string;
  admin_notes?: string;
}
