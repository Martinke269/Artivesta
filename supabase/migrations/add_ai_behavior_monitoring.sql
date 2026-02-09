-- ============================================================================
-- AI-ASSISTED BEHAVIOR MONITORING & ANOMALY DETECTION SYSTEM
-- ============================================================================
-- Purpose: Help AI understand pricing behavior, detect accidental mispricing,
-- and maintain high-quality data across the platform.
-- This is NOT a fraud detection system - it's an AI learning layer.
-- ============================================================================

-- ============================================================================
-- 1. PRICE HISTORY TABLE
-- ============================================================================
-- Track all price changes for AI learning and approval flows
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  old_price_cents INTEGER NOT NULL,
  new_price_cents INTEGER NOT NULL,
  change_percentage NUMERIC NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_reason TEXT,
  requires_approval BOOLEAN DEFAULT false,
  seller_approved BOOLEAN DEFAULT false,
  seller_approved_at TIMESTAMPTZ,
  buyer_approved BOOLEAN DEFAULT false,
  buyer_approved_at TIMESTAMPTZ,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'not_required')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_artwork_id ON price_history(artwork_id);
CREATE INDEX idx_price_history_approval_status ON price_history(approval_status);
CREATE INDEX idx_price_history_created_at ON price_history(created_at);

-- ============================================================================
-- 2. BUYER INTEREST TABLE
-- ============================================================================
-- Track buyer interest for price change notifications
CREATE TABLE IF NOT EXISTS buyer_interest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('view', 'favorite', 'inquiry', 'offer')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artwork_id, buyer_id)
);

CREATE INDEX idx_buyer_interest_artwork_id ON buyer_interest(artwork_id);
CREATE INDEX idx_buyer_interest_buyer_id ON buyer_interest(buyer_id);

-- ============================================================================
-- 3. PAYMENT DEVIATIONS TABLE
-- ============================================================================
-- Track Stripe Connect payment deviations from listed prices
CREATE TABLE IF NOT EXISTS payment_deviations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  listed_price_cents INTEGER NOT NULL,
  payment_price_cents INTEGER NOT NULL,
  deviation_percentage NUMERIC NOT NULL,
  seller_approved BOOLEAN DEFAULT false,
  seller_approved_at TIMESTAMPTZ,
  buyer_approved BOOLEAN DEFAULT false,
  buyer_approved_at TIMESTAMPTZ,
  admin_notified BOOLEAN DEFAULT false,
  admin_notified_at TIMESTAMPTZ,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_deviations_order_id ON payment_deviations(order_id);
CREATE INDEX idx_payment_deviations_approval_status ON payment_deviations(approval_status);

-- ============================================================================
-- 4. ARTWORK REMOVAL EVENTS TABLE
-- ============================================================================
-- Track artwork removals for AI pattern learning
CREATE TABLE IF NOT EXISTS artwork_removal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL,
  artist_id UUID NOT NULL REFERENCES profiles(id),
  removal_type TEXT NOT NULL CHECK (removal_type IN ('deleted', 'deactivated', 'status_changed')),
  had_orders BOOLEAN DEFAULT false,
  had_leases BOOLEAN DEFAULT false,
  had_escrow BOOLEAN DEFAULT false,
  days_active INTEGER,
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  final_price_cents INTEGER,
  unusual_removal BOOLEAN DEFAULT false,
  admin_notified BOOLEAN DEFAULT false,
  admin_notified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artwork_removal_events_artist_id ON artwork_removal_events(artist_id);
CREATE INDEX idx_artwork_removal_events_unusual_removal ON artwork_removal_events(unusual_removal);
CREATE INDEX idx_artwork_removal_events_created_at ON artwork_removal_events(created_at);

-- ============================================================================
-- 5. AI DIAGNOSTICS TABLE
-- ============================================================================
-- Store AI-generated diagnostic reports for long-term listings
CREATE TABLE IF NOT EXISTS ai_diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  days_active INTEGER NOT NULL,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  price_level TEXT CHECK (price_level IN ('very_low', 'low', 'average', 'high', 'very_high')),
  category_performance TEXT,
  color_palette_analysis JSONB,
  size_analysis JSONB,
  similar_artworks_comparison JSONB,
  recommendations JSONB,
  ai_confidence_score NUMERIC,
  admin_notified BOOLEAN DEFAULT false,
  admin_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_diagnostics_artwork_id ON ai_diagnostics(artwork_id);
CREATE INDEX idx_ai_diagnostics_days_active ON ai_diagnostics(days_active);
CREATE INDEX idx_ai_diagnostics_created_at ON ai_diagnostics(created_at);

-- ============================================================================
-- 6. ADMIN ALERTS TABLE
-- ============================================================================
-- Centralized alert system for admin dashboard
CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'price_change_approval',
    'payment_deviation',
    'unusual_removal',
    'long_term_listing',
    'price_after_interest',
    'invalid_price',
    'off_platform_sale',
    'off_platform_payment',
    'suspicious_metadata',
    'missed_lease_payment',
    'commission_change',
    'escrow_anomaly',
    'high_volume_upload',
    'rls_bypass_attempt',
    'stripe_webhook_failure',
    'stripe_refund',
    'stripe_dispute'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  related_entity_type TEXT CHECK (related_entity_type IN ('artwork', 'order', 'user', 'payment', 'escrow')),
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_alerts_alert_type ON admin_alerts(alert_type);
CREATE INDEX idx_admin_alerts_severity ON admin_alerts(severity);
CREATE INDEX idx_admin_alerts_is_read ON admin_alerts(is_read);
CREATE INDEX idx_admin_alerts_is_resolved ON admin_alerts(is_resolved);
CREATE INDEX idx_admin_alerts_created_at ON admin_alerts(created_at);

-- ============================================================================
-- 7. AI BEHAVIOR INSIGHTS TABLE
-- ============================================================================
-- Store AI-learned patterns and insights
CREATE TABLE IF NOT EXISTS ai_behavior_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'pricing_pattern',
    'category_trend',
    'seller_behavior',
    'buyer_behavior',
    'seasonal_trend',
    'market_shift'
  )),
  category TEXT,
  time_period TEXT,
  insight_data JSONB NOT NULL,
  confidence_score NUMERIC,
  sample_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_behavior_insights_insight_type ON ai_behavior_insights(insight_type);
CREATE INDEX idx_ai_behavior_insights_category ON ai_behavior_insights(category);
CREATE INDEX idx_ai_behavior_insights_created_at ON ai_behavior_insights(created_at);

-- ============================================================================
-- 8. ARTWORK ANALYTICS TABLE
-- ============================================================================
-- Track artwork performance metrics
CREATE TABLE IF NOT EXISTS artwork_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artwork_id)
);

CREATE INDEX idx_artwork_analytics_artwork_id ON artwork_analytics(artwork_id);
CREATE INDEX idx_artwork_analytics_view_count ON artwork_analytics(view_count);

-- ============================================================================
-- 9. STRIPE WEBHOOK LOGS TABLE
-- ============================================================================
-- Track all Stripe webhook events
CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed')),
  error_message TEXT,
  related_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_stripe_webhook_logs_event_type ON stripe_webhook_logs(event_type);
CREATE INDEX idx_stripe_webhook_logs_processing_status ON stripe_webhook_logs(processing_status);
CREATE INDEX idx_stripe_webhook_logs_created_at ON stripe_webhook_logs(created_at);

-- ============================================================================
-- 10. ESCROW EVENTS TABLE
-- ============================================================================
-- Track all escrow-related events
CREATE TABLE IF NOT EXISTS escrow_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'held',
    'released',
    'partial_release',
    'refunded',
    'disputed',
    'dispute_resolved'
  )),
  amount_cents INTEGER NOT NULL,
  initiated_by UUID REFERENCES profiles(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  admin_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escrow_events_order_id ON escrow_events(order_id);
CREATE INDEX idx_escrow_events_event_type ON escrow_events(event_type);
CREATE INDEX idx_escrow_events_created_at ON escrow_events(created_at);

-- ============================================================================
-- 11. GALLERY COMMISSION CHANGES TABLE
-- ============================================================================
-- Track commission rate changes
CREATE TABLE IF NOT EXISTS gallery_commission_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES profiles(id),
  old_commission_percentage NUMERIC NOT NULL,
  new_commission_percentage NUMERIC NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  admin_notified BOOLEAN DEFAULT false,
  admin_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_commission_changes_gallery_id ON gallery_commission_changes(gallery_id);

-- ============================================================================
-- 12. AUDIT LOG TABLE
-- ============================================================================
-- Comprehensive audit trail for security monitoring
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  rls_bypass_attempt BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_rls_bypass_attempt ON audit_log(rls_bypass_attempt);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_removal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_behavior_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_commission_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Price History Policies
CREATE POLICY "Artists can view own artwork price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM artworks WHERE artworks.id = price_history.artwork_id AND artworks.artist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Buyer Interest Policies
CREATE POLICY "Users can view own buyer interest"
  ON buyer_interest FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can insert own buyer interest"
  ON buyer_interest FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Payment Deviations Policies
CREATE POLICY "Users can view related payment deviations"
  ON payment_deviations FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = payment_deviations.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Artwork Removal Events Policies
CREATE POLICY "Artists can view own removal events"
  ON artwork_removal_events FOR SELECT
  TO authenticated
  USING (artist_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- AI Diagnostics Policies
CREATE POLICY "Artists can view own artwork diagnostics"
  ON ai_diagnostics FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM artworks WHERE artworks.id = ai_diagnostics.artwork_id AND artworks.artist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin Alerts Policies (Admin only)
CREATE POLICY "Admins can view all alerts"
  ON admin_alerts FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update alerts"
  ON admin_alerts FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- AI Behavior Insights Policies (Admin only)
CREATE POLICY "Admins can view all insights"
  ON ai_behavior_insights FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Artwork Analytics Policies
CREATE POLICY "Artists can view own artwork analytics"
  ON artwork_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM artworks WHERE artworks.id = artwork_analytics.artwork_id AND artworks.artist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stripe Webhook Logs Policies (Admin only)
CREATE POLICY "Admins can view webhook logs"
  ON stripe_webhook_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Escrow Events Policies
CREATE POLICY "Users can view related escrow events"
  ON escrow_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = escrow_events.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Gallery Commission Changes Policies (Admin only)
CREATE POLICY "Admins can view commission changes"
  ON gallery_commission_changes FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Audit Log Policies (Admin only)
CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to check price change and create approval flow
CREATE OR REPLACE FUNCTION check_price_change()
RETURNS TRIGGER AS $$
DECLARE
  change_pct NUMERIC;
  has_interest BOOLEAN;
BEGIN
  -- Only process if price actually changed
  IF OLD.price_cents IS DISTINCT FROM NEW.price_cents THEN
    -- Calculate percentage change
    change_pct := ABS((NEW.price_cents - OLD.price_cents)::NUMERIC / OLD.price_cents * 100);
    
    -- Check if there's buyer interest
    SELECT EXISTS(SELECT 1 FROM buyer_interest WHERE artwork_id = NEW.id) INTO has_interest;
    
    -- Insert into price history
    INSERT INTO price_history (
      artwork_id,
      old_price_cents,
      new_price_cents,
      change_percentage,
      changed_by,
      requires_approval
    ) VALUES (
      NEW.id,
      OLD.price_cents,
      NEW.price_cents,
      change_pct,
      auth.uid(),
      change_pct > 20
    );
    
    -- If change > 20%, require approval
    IF change_pct > 20 THEN
      -- Lock artwork
      NEW.status := 'price_change_pending_approval';
      
      -- Create admin alert
      INSERT INTO admin_alerts (
        alert_type,
        severity,
        title,
        description,
        related_entity_type,
        related_entity_id,
        metadata
      ) VALUES (
        'price_change_approval',
        'warning',
        'Price Change Requires Approval',
        format('Artwork "%s" price changed by %s%% (from %s to %s DKK)', 
          NEW.title, 
          ROUND(change_pct, 2),
          OLD.price_cents / 100,
          NEW.price_cents / 100
        ),
        'artwork',
        NEW.id,
        jsonb_build_object(
          'old_price_cents', OLD.price_cents,
          'new_price_cents', NEW.price_cents,
          'change_percentage', change_pct,
          'has_buyer_interest', has_interest
        )
      );
      
      -- If buyer interest exists and price increased, create additional alert
      IF has_interest AND NEW.price_cents > OLD.price_cents THEN
        INSERT INTO admin_alerts (
          alert_type,
          severity,
          title,
          description,
          related_entity_type,
          related_entity_id
        ) VALUES (
          'price_after_interest',
          'warning',
          'Price Raised After Buyer Interest',
          format('Artwork "%s" price increased after buyer showed interest', NEW.title),
          'artwork',
          NEW.id
        );
      END IF;
    END IF;
    
    -- Block invalid prices
    IF NEW.price_cents <= 100 THEN -- 1 DKK or less
      INSERT INTO admin_alerts (
        alert_type,
        severity,
        title,
        description,
        related_entity_type,
        related_entity_id
      ) VALUES (
        'invalid_price',
        'critical',
        'Invalid Price Detected',
        format('Artwork "%s" set to invalid price: %s DKK', NEW.title, NEW.price_cents / 100),
        'artwork',
        NEW.id
      );
      
      -- Block the change
      RAISE EXCEPTION 'Price must be greater than 1 DKK';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track artwork removal
CREATE OR REPLACE FUNCTION track_artwork_removal()
RETURNS TRIGGER AS $$
DECLARE
  had_orders_flag BOOLEAN;
  had_leases_flag BOOLEAN;
  had_escrow_flag BOOLEAN;
  days_active_count INTEGER;
  view_count_val INTEGER;
  inquiry_count_val INTEGER;
  is_unusual BOOLEAN;
BEGIN
  -- Check if artwork had orders, leases, or escrow
  SELECT EXISTS(SELECT 1 FROM orders WHERE artwork_id = OLD.id) INTO had_orders_flag;
  had_leases_flag := FALSE; -- TODO: Implement when leasing is added
  SELECT EXISTS(SELECT 1 FROM escrow_events e JOIN orders o ON e.order_id = o.id WHERE o.artwork_id = OLD.id) INTO had_escrow_flag;
  
  -- Calculate days active
  days_active_count := EXTRACT(DAY FROM NOW() - OLD.created_at);
  
  -- Get analytics
  SELECT COALESCE(view_count, 0), COALESCE(inquiry_count, 0)
  INTO view_count_val, inquiry_count_val
  FROM artwork_analytics
  WHERE artwork_id = OLD.id;
  
  -- Determine if removal is unusual
  is_unusual := NOT (had_orders_flag OR had_leases_flag OR had_escrow_flag);
  
  -- Insert removal event
  INSERT INTO artwork_removal_events (
    artwork_id,
    artist_id,
    removal_type,
    had_orders,
    had_leases,
    had_escrow,
    days_active,
    view_count,
    inquiry_count,
    final_price_cents,
    unusual_removal,
    admin_notified,
    admin_notified_at
  ) VALUES (
    OLD.id,
    OLD.artist_id,
    'deleted',
    had_orders_flag,
    had_leases_flag,
    had_escrow_flag,
    days_active_count,
    view_count_val,
    inquiry_count_val,
    OLD.price_cents,
    is_unusual,
    is_unusual,
    CASE WHEN is_unusual THEN NOW() ELSE NULL END
  );
  
  -- Create admin alert if unusual
  IF is_unusual THEN
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'unusual_removal',
      'info',
      'Artwork Removed Without Sale',
      format('Artwork "%s" removed after %s days without sale, lease, or escrow', OLD.title, days_active_count),
      'artwork',
      OLD.id,
      jsonb_build_object(
        'days_active', days_active_count,
        'view_count', view_count_val,
        'inquiry_count', inquiry_count_val,
        'final_price_cents', OLD.price_cents
      )
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for long-term listings (90 days)
CREATE OR REPLACE FUNCTION check_long_term_listings()
RETURNS void AS $$
DECLARE
  artwork_record RECORD;
  analytics_record RECORD;
BEGIN
  FOR artwork_record IN
    SELECT a.* 
    FROM artworks a
    WHERE a.status = 'available'
    AND EXTRACT(DAY FROM NOW() - a.created_at) >= 90
    AND NOT EXISTS (
      SELECT 1 FROM ai_diagnostics ad 
      WHERE ad.artwork_id = a.id 
      AND ad.created_at > NOW() - INTERVAL '30 days'
    )
  LOOP
    -- Get analytics
    SELECT * INTO analytics_record
    FROM artwork_analytics
    WHERE artwork_id = artwork_record.id;
    
    -- Create AI diagnostic
    INSERT INTO ai_diagnostics (
      artwork_id,
      days_active,
      view_count,
      click_count,
      inquiry_count,
      admin_notified,
      admin_notified_at
    ) VALUES (
      artwork_record.id,
      EXTRACT(DAY FROM NOW() - artwork_record.created_at),
      COALESCE(analytics_record.view_count, 0),
      COALESCE(analytics_record.click_count, 0),
      COALESCE(analytics_record.inquiry_count, 0),
      TRUE,
      NOW()
    );
    
    -- Create admin alert
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'long_term_listing',
      'info',
      '90-Day Listing Diagnostic',
      format('Artwork "%s" has been listed for 90+ days', artwork_record.title),
      'artwork',
      artwork_record.id,
      jsonb_build_object(
        'days_active', EXTRACT(DAY FROM NOW() - artwork_record.created_at),
        'view_count', COALESCE(analytics_record.view_count, 0),
        'price_cents', artwork_record.price_cents
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update artwork analytics updated_at
CREATE OR REPLACE FUNCTION update_artwork_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for price change monitoring
CREATE TRIGGER artwork_price_change_trigger
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION check_price_change();

-- Trigger for artwork removal tracking
CREATE TRIGGER artwork_removal_trigger
  BEFORE DELETE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION track_artwork_removal();

-- Trigger for artwork analytics updated_at
CREATE TRIGGER update_artwork_analytics_updated_at_trigger
  BEFORE UPDATE ON artwork_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_analytics_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS FOR API
-- ============================================================================

-- Function to approve price change (seller)
CREATE OR REPLACE FUNCTION approve_price_change_seller(
  p_artwork_id UUID
)
RETURNS void AS $$
DECLARE
  latest_history_id UUID;
BEGIN
  -- Get latest price history entry
  SELECT id INTO latest_history_id
  FROM price_history
  WHERE artwork_id = p_artwork_id
  AND requires_approval = TRUE
  AND approval_status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_history_id IS NULL THEN
    RAISE EXCEPTION 'No pending price change approval found';
  END IF;
  
  -- Update approval
  UPDATE price_history
  SET seller_approved = TRUE,
      seller_approved_at = NOW()
  WHERE id = latest_history_id;
  
  -- Check if both approved
  PERFORM check_price_approval_complete(p_artwork_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve price change (buyer)
CREATE OR REPLACE FUNCTION approve_price_change_buyer(
  p_artwork_id UUID,
  p_buyer_id UUID
)
RETURNS void AS $$
DECLARE
  latest_history_id UUID;
BEGIN
  -- Verify buyer has interest
  IF NOT EXISTS(SELECT 1 FROM buyer_interest WHERE artwork_id = p_artwork_id AND buyer_id = p_buyer_id) THEN
    RAISE EXCEPTION 'Buyer has no recorded interest in this artwork';
  END IF;
  
  -- Get latest price history entry
  SELECT id INTO latest_history_id
  FROM price_history
  WHERE artwork_id = p_artwork_id
  AND requires_approval = TRUE
  AND approval_status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_history_id IS NULL THEN
    RAISE EXCEPTION 'No pending price change approval found';
  END IF;
  
  -- Update approval
  UPDATE price_history
  SET buyer_approved = TRUE,
      buyer_approved_at = NOW()
  WHERE id = latest_history_id;
  
  -- Check if both approved
  PERFORM check_price_approval_complete(p_artwork_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if price approval is complete
CREATE OR REPLACE FUNCTION check_price_approval_complete(
  p_artwork_id UUID
)
RETURNS void AS $$
DECLARE
  history_record RECORD;
  has_interest BOOLEAN;
BEGIN
  -- Get latest price history
  SELECT * INTO history_record
  FROM price_history
  WHERE artwork_id = p_artwork_id
  AND requires_approval = TRUE
  AND approval_status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF history_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if there's buyer interest
  SELECT EXISTS(SELECT 1 FROM buyer_interest WHERE artwork_id = p_artwork_id) INTO has_interest;
  
  -- If no buyer interest, only seller approval needed
  IF NOT has_interest AND history_record.seller_approved THEN
    UPDATE price_history
    SET approval_status = 'approved'
    WHERE id = history_record.id;
    
    UPDATE artworks
    SET status = 'available'
    WHERE id = p_artwork_id;
    
  -- If buyer interest exists, both approvals needed
  ELSIF has_interest AND history_record.seller_approved AND history_record.buyer_approved THEN
    UPDATE price_history
    SET approval_status = 'approved'
    WHERE id = history_record.id;
    
    UPDATE artworks
    SET status = 'available'
    WHERE id = p_artwork_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject price change
CREATE OR REPLACE FUNCTION reject_price_change(
  p_artwork_id UUID,
  p_rejected_by UUID
)
RETURNS void AS $$
DECLARE
  latest_history_id UUID;
  old_price INTEGER;
BEGIN
  -- Get latest price history entry
  SELECT id, old_price_cents INTO latest_history_id, old_price
  FROM price_history
  WHERE artwork_id = p_artwork_id
  AND requires_approval = TRUE
  AND approval_status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_history_id IS NULL THEN
    RAISE EXCEPTION 'No pending price change approval found';
  END IF;
  
  -- Update approval status
  UPDATE price_history
  SET approval_status = 'rejected'
  WHERE id = latest_history_id;
  
  -- Revert artwork price and status
  UPDATE artworks
  SET price_cents = old_price,
      status = 'available'
  WHERE id = p_artwork_id;
  
  -- Create admin alert
  INSERT INTO admin_alerts (
    alert_type,
    severity,
    title,
    description,
    related_entity_type,
    related_entity_id
  ) VALUES (
    'price_change_approval',
    'info',
    'Price Change Rejected',
    format('Price change for artwork was rejected and reverted'),
    'artwork',
    p_artwork_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment artwork view count
CREATE OR REPLACE FUNCTION increment_artwork_view(
  p_artwork_id UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO artwork_analytics (artwork_id, view_count, last_viewed_at)
  VALUES (p_artwork_id, 1, NOW())
  ON CONFLICT (artwork_id) 
  DO UPDATE SET 
    view_count = artwork_analytics.view_count + 1,
    last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record buyer interest
CREATE OR REPLACE FUNCTION record_buyer_interest(
  p_artwork_id UUID,
  p_buyer_id UUID,
  p_interest_type TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO buyer_interest (artwork_id, buyer_id, interest_type)
  VALUES (p_artwork_id, p_buyer_id, p_interest_type)
  ON CONFLICT (artwork_id, buyer_id) 
  DO UPDATE SET 
    interest_type = CASE 
      WHEN p_interest_type = 'offer' THEN 'offer'
      WHEN p_interest_type = 'inquiry' AND buyer_interest.interest_type != 'offer' THEN 'inquiry'
      WHEN p_interest_type = 'favorite' AND buyer_interest.interest_type NOT IN ('offer', 'inquiry') THEN 'favorite'
      ELSE buyer_interest.interest_type
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check payment deviation
CREATE OR REPLACE FUNCTION check_payment_deviation(
  p_order_id UUID,
  p_artwork_id UUID,
  p_listed_price_cents INTEGER,
  p_payment_price_cents INTEGER
)
RETURNS void AS $$
DECLARE
  deviation_pct NUMERIC;
BEGIN
  -- Calculate deviation percentage
  deviation_pct := ABS((p_payment_price_cents - p_listed_price_cents)::NUMERIC / p_listed_price_cents * 100);
  
  -- If deviation > 20%, create record and alert
  IF deviation_pct > 20 THEN
    INSERT INTO payment_deviations (
      order_id,
      artwork_id,
      listed_price_cents,
      payment_price_cents,
      deviation_percentage,
      admin_notified,
      admin_notified_at
    ) VALUES (
      p_order_id,
      p_artwork_id,
      p_listed_price_cents,
      p_payment_price_cents,
      deviation_pct,
      TRUE,
      NOW()
    );
    
    -- Update order status
    UPDATE orders
    SET status = 'payment_review'
    WHERE id = p_order_id;
    
    -- Create admin alert
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'payment_deviation',
      'warning',
      'Payment Price Deviation Detected',
      format('Payment amount deviates %s%% from listed price', ROUND(deviation_pct, 2)),
      'order',
      p_order_id,
      jsonb_build_object(
        'listed_price_cents', p_listed_price_cents,
        'payment_price_cents', p_payment_price_cents,
        'deviation_percentage', deviation_pct
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log escrow event
CREATE OR REPLACE FUNCTION log_escrow_event(
  p_order_id UUID,
  p_event_type TEXT,
  p_amount_cents INTEGER,
  p_initiated_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  is_anomaly BOOLEAN;
BEGIN
  -- Determine if this is an anomaly (refund, dispute, partial release)
  is_anomaly := p_event_type IN ('refunded', 'disputed', 'partial_release');
  
  -- Insert escrow event
  INSERT INTO escrow_events (
    order_id,
    event_type,
    amount_cents,
    initiated_by,
    reason,
    admin_notified
  ) VALUES (
    p_order_id,
    p_event_type,
    p_amount_cents,
    p_initiated_by,
    p_reason,
    is_anomaly
  );
  
  -- Create admin alert if anomaly
  IF is_anomaly THEN
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'escrow_anomaly',
      CASE 
        WHEN p_event_type = 'disputed' THEN 'critical'
        ELSE 'warning'
      END,
      format('Escrow %s', REPLACE(p_event_type, '_', ' ')),
      format('Escrow event: %s for order', p_event_type),
      'order',
      p_order_id,
      jsonb_build_object(
        'event_type', p_event_type,
        'amount_cents', p_amount_cents,
        'reason', p_reason
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log Stripe webhook
CREATE OR REPLACE FUNCTION log_stripe_webhook(
  p_event_id TEXT,
  p_event_type TEXT,
  p_event_data JSONB,
  p_related_order_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO stripe_webhook_logs (
    event_id,
    event_type,
    event_data,
    related_order_id
  ) VALUES (
    p_event_id,
    p_event_type,
    p_event_data,
    p_related_order_id
  )
  ON CONFLICT (event_id) DO NOTHING;
  
  -- Create alerts for failures, refunds, disputes
  IF p_event_type IN ('payment_intent.payment_failed', 'charge.refunded', 'charge.dispute.created') THEN
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      CASE 
        WHEN p_event_type = 'charge.dispute.created' THEN 'stripe_dispute'
        WHEN p_event_type = 'charge.refunded' THEN 'stripe_refund'
        ELSE 'stripe_webhook_failure'
      END,
      CASE 
        WHEN p_event_type = 'charge.dispute.created' THEN 'critical'
        ELSE 'warning'
      END,
      format('Stripe: %s', REPLACE(p_event_type, '_', ' ')),
      format('Stripe webhook event: %s', p_event_type),
      'payment',
      p_related_order_id,
      jsonb_build_object(
        'event_type', p_event_type,
        'event_id', p_event_id
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect high volume uploads
CREATE OR REPLACE FUNCTION check_high_volume_uploads()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN
    SELECT artist_id, COUNT(*) as upload_count
    FROM artworks
    WHERE created_at > NOW() - INTERVAL '1 hour'
    GROUP BY artist_id
    HAVING COUNT(*) > 10
  LOOP
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'high_volume_upload',
      'warning',
      'High Volume Upload Detected',
      format('User uploaded %s artworks in the last hour', user_record.upload_count),
      'user',
      user_record.artist_id,
      jsonb_build_object(
        'upload_count', user_record.upload_count,
        'time_period', '1 hour'
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_rls_bypass_attempt BOOLEAN DEFAULT FALSE
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    rls_bypass_attempt
  ) VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_rls_bypass_attempt
  );
  
  -- Create alert for RLS bypass attempts
  IF p_rls_bypass_attempt THEN
    INSERT INTO admin_alerts (
      alert_type,
      severity,
      title,
      description,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'rls_bypass_attempt',
      'critical',
      'RLS Bypass Attempt Detected',
      format('User attempted to bypass RLS: %s on %s', p_action, p_entity_type),
      p_entity_type,
      p_entity_id,
      jsonb_build_object(
        'user_id', p_user_id,
        'action', p_action
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
