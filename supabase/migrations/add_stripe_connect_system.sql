-- ============================================================================
-- STRIPE CONNECT INTEGRATION SYSTEM
-- ============================================================================
-- Purpose: Enable Stripe Connect (Standard Accounts) for galleries with
-- onboarding, payouts, transfers, application fees, escrow, and webhooks
-- ============================================================================

-- ============================================================================
-- 1. STRIPE ACCOUNTS TABLE
-- ============================================================================
-- Stores connected account information for galleries

CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  onboarding_status TEXT NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'incomplete', 'complete')),
  payouts_enabled BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  requirements JSONB DEFAULT '{}'::jsonb,
  country TEXT DEFAULT 'DK',
  default_currency TEXT DEFAULT 'dkk',
  email TEXT,
  business_type TEXT,
  capabilities JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_accounts_gallery_id ON stripe_accounts(gallery_id);
CREATE INDEX idx_stripe_accounts_stripe_account_id ON stripe_accounts(stripe_account_id);
CREATE INDEX idx_stripe_accounts_onboarding_status ON stripe_accounts(onboarding_status);

-- ============================================================================
-- 2. STRIPE PAYOUTS TABLE
-- ============================================================================
-- Stores payout history from Stripe to connected accounts

CREATE TABLE IF NOT EXISTS stripe_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  stripe_payout_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'dkk',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'canceled', 'in_transit')),
  arrival_date TIMESTAMPTZ,
  description TEXT,
  failure_code TEXT,
  failure_message TEXT,
  method TEXT,
  type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_payouts_gallery_id ON stripe_payouts(gallery_id);
CREATE INDEX idx_stripe_payouts_stripe_payout_id ON stripe_payouts(stripe_payout_id);
CREATE INDEX idx_stripe_payouts_stripe_account_id ON stripe_payouts(stripe_account_id);
CREATE INDEX idx_stripe_payouts_status ON stripe_payouts(status);
CREATE INDEX idx_stripe_payouts_arrival_date ON stripe_payouts(arrival_date);

-- ============================================================================
-- 3. STRIPE TRANSFERS TABLE
-- ============================================================================
-- Stores transfers from platform to connected accounts

CREATE TABLE IF NOT EXISTS stripe_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  stripe_transfer_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'dkk',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'canceled', 'reversed')),
  failure_code TEXT,
  failure_message TEXT,
  reversed BOOLEAN DEFAULT false,
  reversal_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_transfers_gallery_id ON stripe_transfers(gallery_id);
CREATE INDEX idx_stripe_transfers_stripe_transfer_id ON stripe_transfers(stripe_transfer_id);
CREATE INDEX idx_stripe_transfers_stripe_account_id ON stripe_transfers(stripe_account_id);
CREATE INDEX idx_stripe_transfers_order_id ON stripe_transfers(order_id);
CREATE INDEX idx_stripe_transfers_lease_id ON stripe_transfers(lease_id);
CREATE INDEX idx_stripe_transfers_status ON stripe_transfers(status);

-- ============================================================================
-- 4. STRIPE EVENTS TABLE
-- ============================================================================
-- Stores webhook events for audit and debugging

CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  api_version TEXT,
  account TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_events_event_id ON stripe_events(event_id);
CREATE INDEX idx_stripe_events_type ON stripe_events(type);
CREATE INDEX idx_stripe_events_account ON stripe_events(account);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX idx_stripe_events_created_at ON stripe_events(created_at);

-- ============================================================================
-- 5. STRIPE APPLICATION FEES TABLE
-- ============================================================================
-- Tracks application fees collected from transactions

CREATE TABLE IF NOT EXISTS stripe_application_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_fee_id TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT NOT NULL,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'dkk',
  charge_id TEXT,
  refunded BOOLEAN DEFAULT false,
  refund_amount INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_application_fees_gallery_id ON stripe_application_fees(gallery_id);
CREATE INDEX idx_stripe_application_fees_stripe_account_id ON stripe_application_fees(stripe_account_id);
CREATE INDEX idx_stripe_application_fees_order_id ON stripe_application_fees(order_id);
CREATE INDEX idx_stripe_application_fees_lease_id ON stripe_application_fees(lease_id);

-- ============================================================================
-- 6. STRIPE ESCROW TABLE
-- ============================================================================
-- Manages escrow for leases and high-value purchases

CREATE TABLE IF NOT EXISTS stripe_escrow (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'dkk',
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  held_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  release_scheduled_for TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  dispute_reason TEXT,
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_escrow_gallery_id ON stripe_escrow(gallery_id);
CREATE INDEX idx_stripe_escrow_order_id ON stripe_escrow(order_id);
CREATE INDEX idx_stripe_escrow_lease_id ON stripe_escrow(lease_id);
CREATE INDEX idx_stripe_escrow_status ON stripe_escrow(status);
CREATE INDEX idx_stripe_escrow_release_scheduled_for ON stripe_escrow(release_scheduled_for);

-- ============================================================================
-- 7. STRIPE ALERTS TABLE
-- ============================================================================
-- Stores alerts for Stripe-related issues

CREATE TABLE IF NOT EXISTS stripe_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'payout_failed',
    'transfer_failed',
    'onboarding_incomplete',
    'missing_requirements',
    'dispute_opened',
    'account_disabled',
    'verification_needed',
    'compliance_issue'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  stripe_account_id TEXT,
  stripe_event_id TEXT,
  action_required BOOLEAN DEFAULT false,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_alerts_gallery_id ON stripe_alerts(gallery_id);
CREATE INDEX idx_stripe_alerts_alert_type ON stripe_alerts(alert_type);
CREATE INDEX idx_stripe_alerts_severity ON stripe_alerts(severity);
CREATE INDEX idx_stripe_alerts_is_read ON stripe_alerts(is_read);
CREATE INDEX idx_stripe_alerts_resolved ON stripe_alerts(resolved);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_application_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_alerts ENABLE ROW LEVEL SECURITY;

-- Stripe Accounts Policies
CREATE POLICY "Gallery owners can view own stripe accounts"
  ON stripe_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_accounts.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_accounts.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery owners can update own stripe accounts"
  ON stripe_accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_accounts.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_accounts.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

-- Stripe Payouts Policies
CREATE POLICY "Gallery team can view own payouts"
  ON stripe_payouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_payouts.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_payouts.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stripe Transfers Policies
CREATE POLICY "Gallery team can view own transfers"
  ON stripe_transfers FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_transfers.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_transfers.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stripe Events Policies (Admin only for SELECT)
CREATE POLICY "Admins can view stripe events"
  ON stripe_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stripe Application Fees Policies
CREATE POLICY "Gallery team can view own application fees"
  ON stripe_application_fees FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_application_fees.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_application_fees.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stripe Escrow Policies
CREATE POLICY "Gallery team can view own escrow"
  ON stripe_escrow FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_escrow.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_escrow.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stripe Alerts Policies
CREATE POLICY "Gallery team can view own alerts"
  ON stripe_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_alerts.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_alerts.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery team can update own alerts"
  ON stripe_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = stripe_alerts.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = stripe_alerts.gallery_id AND user_id = auth.uid() AND status = 'active')
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_stripe_accounts_updated_at BEFORE UPDATE ON stripe_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_escrow_updated_at BEFORE UPDATE ON stripe_escrow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate commission and transfer amounts
CREATE OR REPLACE FUNCTION calculate_stripe_amounts(
  p_sale_price INTEGER,
  p_commission_rate NUMERIC
)
RETURNS TABLE(
  application_fee_amount INTEGER,
  transfer_amount INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CAST(p_sale_price * (p_commission_rate / 100) AS INTEGER) AS application_fee_amount,
    CAST(p_sale_price * (1 - p_commission_rate / 100) AS INTEGER) AS transfer_amount;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if gallery can receive payouts
CREATE OR REPLACE FUNCTION can_gallery_receive_payouts(
  p_gallery_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  account_record RECORD;
BEGIN
  SELECT * INTO account_record
  FROM stripe_accounts
  WHERE gallery_id = p_gallery_id
  AND onboarding_status = 'complete'
  AND payouts_enabled = true
  AND charges_enabled = true
  LIMIT 1;
  
  RETURN account_record IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create stripe alert
CREATE OR REPLACE FUNCTION create_stripe_alert(
  p_gallery_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT,
  p_stripe_account_id TEXT DEFAULT NULL,
  p_action_required BOOLEAN DEFAULT false,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO stripe_alerts (
    gallery_id,
    alert_type,
    severity,
    title,
    message,
    stripe_account_id,
    action_required,
    action_url
  ) VALUES (
    p_gallery_id,
    p_alert_type,
    p_severity,
    p_title,
    p_message,
    p_stripe_account_id,
    p_action_required,
    p_action_url
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get gallery stripe metrics
CREATE OR REPLACE FUNCTION get_gallery_stripe_metrics(
  p_gallery_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
  total_payouts_amount INTEGER,
  total_payouts_count INTEGER,
  total_transfers_amount INTEGER,
  total_transfers_count INTEGER,
  total_application_fees INTEGER,
  failed_payouts_count INTEGER,
  failed_transfers_count INTEGER,
  escrow_held_amount INTEGER,
  pending_alerts_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(sp.amount), 0)::INTEGER AS total_payouts_amount,
    COUNT(DISTINCT sp.id)::INTEGER AS total_payouts_count,
    COALESCE(SUM(st.amount), 0)::INTEGER AS total_transfers_amount,
    COUNT(DISTINCT st.id)::INTEGER AS total_transfers_count,
    COALESCE(SUM(saf.amount), 0)::INTEGER AS total_application_fees,
    COUNT(DISTINCT CASE WHEN sp.status = 'failed' THEN sp.id END)::INTEGER AS failed_payouts_count,
    COUNT(DISTINCT CASE WHEN st.status = 'failed' THEN st.id END)::INTEGER AS failed_transfers_count,
    COALESCE(SUM(CASE WHEN se.status = 'held' THEN se.amount ELSE 0 END), 0)::INTEGER AS escrow_held_amount,
    COUNT(DISTINCT CASE WHEN sa.resolved = false THEN sa.id END)::INTEGER AS pending_alerts_count
  FROM galleries g
  LEFT JOIN stripe_payouts sp ON sp.gallery_id = g.id 
    AND sp.created_at BETWEEN p_start_date AND p_end_date
  LEFT JOIN stripe_transfers st ON st.gallery_id = g.id 
    AND st.created_at BETWEEN p_start_date AND p_end_date
  LEFT JOIN stripe_application_fees saf ON saf.gallery_id = g.id 
    AND saf.created_at BETWEEN p_start_date AND p_end_date
  LEFT JOIN stripe_escrow se ON se.gallery_id = g.id
  LEFT JOIN stripe_alerts sa ON sa.gallery_id = g.id
  WHERE g.id = p_gallery_id
  GROUP BY g.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process scheduled escrow releases
CREATE OR REPLACE FUNCTION process_scheduled_escrow_releases()
RETURNS INTEGER AS $$
DECLARE
  escrow_record RECORD;
  released_count INTEGER := 0;
BEGIN
  FOR escrow_record IN
    SELECT * FROM stripe_escrow
    WHERE status = 'held'
    AND release_scheduled_for <= NOW()
  LOOP
    -- Update escrow status
    UPDATE stripe_escrow
    SET status = 'released',
        released_at = NOW()
    WHERE id = escrow_record.id;
    
    released_count := released_count + 1;
  END LOOP;
  
  RETURN released_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View for gallery Stripe dashboard summary
CREATE OR REPLACE VIEW gallery_stripe_dashboard AS
SELECT
  g.id AS gallery_id,
  g.gallery_name,
  sa.stripe_account_id,
  sa.onboarding_status,
  sa.payouts_enabled,
  sa.charges_enabled,
  sa.details_submitted,
  COUNT(DISTINCT sp.id) AS total_payouts,
  COALESCE(SUM(sp.amount), 0) AS total_payout_amount,
  COUNT(DISTINCT st.id) AS total_transfers,
  COALESCE(SUM(st.amount), 0) AS total_transfer_amount,
  COUNT(DISTINCT CASE WHEN sal.resolved = false THEN sal.id END) AS unresolved_alerts,
  COUNT(DISTINCT CASE WHEN se.status = 'held' THEN se.id END) AS active_escrows,
  COALESCE(SUM(CASE WHEN se.status = 'held' THEN se.amount ELSE 0 END), 0) AS total_escrow_held
FROM galleries g
LEFT JOIN stripe_accounts sa ON sa.gallery_id = g.id
LEFT JOIN stripe_payouts sp ON sp.gallery_id = g.id
LEFT JOIN stripe_transfers st ON st.gallery_id = g.id
LEFT JOIN stripe_alerts sal ON sal.gallery_id = g.id
LEFT JOIN stripe_escrow se ON se.gallery_id = g.id
GROUP BY g.id, g.gallery_name, sa.stripe_account_id, sa.onboarding_status, 
         sa.payouts_enabled, sa.charges_enabled, sa.details_submitted;

-- Grant SELECT on view to authenticated users (RLS will apply)
GRANT SELECT ON gallery_stripe_dashboard TO authenticated;

-- ============================================================================
-- FOUNDER-OS INTEGRATION METRICS
-- ============================================================================

-- Add Stripe metrics to founder_os_metrics if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'founder_os_metrics') THEN
    -- Add Stripe-specific columns to founder_os_metrics
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_total_payouts INTEGER DEFAULT 0;
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_total_commission INTEGER DEFAULT 0;
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_escrow_volume INTEGER DEFAULT 0;
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_payout_failures INTEGER DEFAULT 0;
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_transfer_failures INTEGER DEFAULT 0;
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_onboarding_incomplete INTEGER DEFAULT 0;
    ALTER TABLE founder_os_metrics ADD COLUMN IF NOT EXISTS stripe_risk_score NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Function to update Founder-OS metrics with Stripe data
CREATE OR REPLACE FUNCTION update_founder_os_stripe_metrics()
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'founder_os_metrics') THEN
    UPDATE founder_os_metrics
    SET
      stripe_total_payouts = (
        SELECT COALESCE(SUM(amount), 0) FROM stripe_payouts WHERE status = 'paid'
      ),
      stripe_total_commission = (
        SELECT COALESCE(SUM(amount), 0) FROM stripe_application_fees
      ),
      stripe_escrow_volume = (
        SELECT COALESCE(SUM(amount), 0) FROM stripe_escrow WHERE status = 'held'
      ),
      stripe_payout_failures = (
        SELECT COUNT(*) FROM stripe_payouts WHERE status = 'failed'
      ),
      stripe_transfer_failures = (
        SELECT COUNT(*) FROM stripe_transfers WHERE status = 'failed'
      ),
      stripe_onboarding_incomplete = (
        SELECT COUNT(*) FROM stripe_accounts WHERE onboarding_status != 'complete'
      ),
      stripe_risk_score = (
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (
              COUNT(CASE WHEN status = 'failed' THEN 1 END)::NUMERIC / 
              COUNT(*)::NUMERIC * 100
            )
          END
        FROM stripe_payouts
        WHERE created_at > NOW() - INTERVAL '30 days'
      ),
      updated_at = NOW()
    WHERE id = (SELECT id FROM founder_os_metrics ORDER BY created_at DESC LIMIT 1);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
