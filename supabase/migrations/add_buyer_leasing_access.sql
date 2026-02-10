-- ============================================================================
-- BUYER LEASING ACCESS
-- ============================================================================
-- Purpose: Add RLS policies to allow buyers to view their own leases
-- ============================================================================

-- Buyers can view their own leases
CREATE POLICY "Buyers can view own leases"
  ON gallery_leases FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

-- Buyers can view payments for their own leases
CREATE POLICY "Buyers can view own lease payments"
  ON gallery_lease_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gallery_leases
      WHERE id = gallery_lease_payments.lease_id
      AND buyer_id = auth.uid()
    )
  );
