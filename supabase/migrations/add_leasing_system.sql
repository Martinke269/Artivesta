-- ============================================================================
-- LEASING SYSTEM FOR GALLERIES
-- ============================================================================
-- Purpose: Enable galleries to lease artworks to businesses with insurance
-- tracking, payment history, and contract management.
-- ============================================================================

-- ============================================================================
-- 1. LEASES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  monthly_price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'DKK',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'overdue', 'completed', 'cancelled')),
  contract_id TEXT,
  contract_url TEXT,
  insurance_holder TEXT CHECK (insurance_holder IN ('gallery', 'buyer', 'external', 'missing')),
  insurance_company TEXT,
  insurance_policy_number TEXT,
  insurance_coverage_start DATE,
  insurance_coverage_end DATE,
  insurance_status TEXT DEFAULT 'missing' CHECK (insurance_status IN ('valid', 'expiring_soon', 'expired', 'missing')),
  insurance_documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leases_gallery_id ON leases(gallery_id);
CREATE INDEX idx_leases_artwork_id ON leases(artwork_id);
CREATE INDEX idx_leases_buyer_id ON leases(buyer_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_insurance_status ON leases(insurance_status);
CREATE INDEX idx_leases_end_date ON leases(end_date);

-- ============================================================================
-- 2. LEASE PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS lease_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'DKK',
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lease_payments_lease_id ON lease_payments(lease_id);
CREATE INDEX idx_lease_payments_status ON lease_payments(status);
CREATE INDEX idx_lease_payments_due_date ON lease_payments(due_date);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_payments ENABLE ROW LEVEL SECURITY;

-- Leases Policies
CREATE POLICY "Gallery team can view own leases"
  ON leases FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = leases.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = leases.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery team can create leases"
  ON leases FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM galleries WHERE id = leases.gallery_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = leases.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
    )
  );

CREATE POLICY "Gallery team can update leases"
  ON leases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = leases.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = leases.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

CREATE POLICY "Gallery team can delete leases"
  ON leases FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = leases.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = leases.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

-- Lease Payments Policies
CREATE POLICY "Gallery team can view lease payments"
  ON lease_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leases l
      JOIN galleries g ON l.gallery_id = g.id
      WHERE l.id = lease_payments.lease_id
      AND (
        g.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = g.id AND user_id = auth.uid() AND status = 'active')
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery team can create lease payments"
  ON lease_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leases l
      JOIN galleries g ON l.gallery_id = g.id
      WHERE l.id = lease_payments.lease_id
      AND (
        g.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = g.id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
      )
    )
  );

CREATE POLICY "Gallery team can update lease payments"
  ON lease_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leases l
      JOIN galleries g ON l.gallery_id = g.id
      WHERE l.id = lease_payments.lease_id
      AND (
        g.owner_id = auth.uid()
        OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = g.id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
      )
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lease_payments_updated_at BEFORE UPDATE ON lease_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update lease status based on dates and insurance
CREATE OR REPLACE FUNCTION update_lease_statuses()
RETURNS void AS $$
BEGIN
  -- Update to expiring_soon (within 60 days)
  UPDATE leases
  SET status = 'expiring_soon'
  WHERE status = 'active'
  AND end_date <= CURRENT_DATE + INTERVAL '60 days'
  AND end_date > CURRENT_DATE;
  
  -- Update to completed (past end date)
  UPDATE leases
  SET status = 'completed'
  WHERE status IN ('active', 'expiring_soon')
  AND end_date < CURRENT_DATE;
  
  -- Update insurance status to expiring_soon (within 30 days)
  UPDATE leases
  SET insurance_status = 'expiring_soon'
  WHERE insurance_status = 'valid'
  AND insurance_coverage_end IS NOT NULL
  AND insurance_coverage_end <= CURRENT_DATE + INTERVAL '30 days'
  AND insurance_coverage_end > CURRENT_DATE;
  
  -- Update insurance status to expired
  UPDATE leases
  SET insurance_status = 'expired'
  WHERE insurance_status IN ('valid', 'expiring_soon')
  AND insurance_coverage_end IS NOT NULL
  AND insurance_coverage_end < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update payment status based on due dates
CREATE OR REPLACE FUNCTION update_lease_payment_statuses()
RETURNS void AS $$
BEGIN
  -- Update to overdue
  UPDATE lease_payments
  SET status = 'overdue'
  WHERE status = 'pending'
  AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate monthly payments for a lease
CREATE OR REPLACE FUNCTION generate_lease_payments(
  p_lease_id UUID
)
RETURNS void AS $$
DECLARE
  lease_record RECORD;
  payment_date DATE;
  months_count INTEGER;
  i INTEGER;
BEGIN
  -- Get lease details
  SELECT * INTO lease_record FROM leases WHERE id = p_lease_id;
  
  IF lease_record IS NULL THEN
    RAISE EXCEPTION 'Lease not found';
  END IF;
  
  -- Calculate number of months
  months_count := EXTRACT(YEAR FROM AGE(lease_record.end_date, lease_record.start_date)) * 12 +
                  EXTRACT(MONTH FROM AGE(lease_record.end_date, lease_record.start_date));
  
  -- Generate payments for each month
  FOR i IN 0..months_count LOOP
    payment_date := lease_record.start_date + (i || ' months')::INTERVAL;
    
    -- Only create if payment doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM lease_payments 
      WHERE lease_id = p_lease_id 
      AND due_date = payment_date
    ) THEN
      INSERT INTO lease_payments (
        lease_id,
        amount_cents,
        currency,
        due_date,
        status
      ) VALUES (
        p_lease_id,
        lease_record.monthly_price_cents,
        lease_record.currency,
        payment_date,
        CASE 
          WHEN payment_date < CURRENT_DATE THEN 'overdue'
          ELSE 'pending'
        END
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate days remaining in lease
CREATE OR REPLACE FUNCTION get_lease_days_remaining(
  p_end_date DATE
)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(0, (p_end_date - CURRENT_DATE));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
