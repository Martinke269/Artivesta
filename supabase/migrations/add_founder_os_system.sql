-- =====================================================
-- FOUNDER-OS SYSTEM
-- Economic integration for Art Is Safe project
-- =====================================================

-- =====================================================
-- 1. FOUNDER SETTINGS TABLE
-- Global AI budget and economic settings
-- =====================================================
CREATE TABLE IF NOT EXISTS founder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- AI Budget Settings
  ai_monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  ai_daily_spend_cap DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  ai_weekly_spend_cap DECIMAL(10, 2) NOT NULL DEFAULT 250.00,
  ai_budget_buffer_percent INTEGER NOT NULL DEFAULT 20,
  
  -- AI Spend Guard Settings
  ai_spend_alert_threshold_percentage INTEGER NOT NULL DEFAULT 80,
  ai_spend_hard_limit_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Smoothing Engine Settings
  ai_spend_smoothing_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_spend_smoothing_window_days INTEGER NOT NULL DEFAULT 7,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO founder_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. FOUNDER PROJECTS TABLE
-- Projects tracked in Founder-OS
-- =====================================================
CREATE TABLE IF NOT EXISTS founder_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Project-specific AI budget allocation
  ai_monthly_budget_allocation DECIMAL(10, 2),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Art Is Safe project
INSERT INTO founder_projects (id, name, description, slug, ai_monthly_budget_allocation)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Art Is Safe',
  'Art marketplace with AI-powered pricing and curation',
  'art-is-safe',
  500.00
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. PROJECT EXPENSES TABLE
-- Track all project expenses
-- =====================================================
CREATE TABLE IF NOT EXISTS project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES founder_projects(id) ON DELETE CASCADE,
  
  -- Expense details
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL, -- 'hosting', 'tools', 'marketing', 'other'
  description TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_expenses_project_id ON project_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_project_expenses_created_at ON project_expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_project_expenses_category ON project_expenses(category);

-- =====================================================
-- 4. AI SPEND LOGS TABLE
-- Track all AI-related spending
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_spend_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES founder_projects(id) ON DELETE CASCADE,
  
  -- Spend details
  amount DECIMAL(10, 4) NOT NULL,
  reason TEXT NOT NULL, -- 'price_suggestion', 'description_generation', 'metadata_validation', etc.
  
  -- AI provider details (optional)
  provider TEXT, -- 'openai', 'anthropic', etc.
  model TEXT, -- 'gpt-4', 'claude-3', etc.
  tokens_used INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_spend_logs_project_id ON ai_spend_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_spend_logs_created_at ON ai_spend_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_spend_logs_reason ON ai_spend_logs(reason);

-- =====================================================
-- 5. ALERTS TABLE
-- System alerts and notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES founder_projects(id) ON DELETE CASCADE,
  
  -- Alert details
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'ai_budget', 'revenue', 'expense', 'system'
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- =====================================================
-- 6. PROJECT REVENUE VIEW
-- Aggregate revenue data from orders
-- =====================================================
CREATE OR REPLACE VIEW project_revenue AS
SELECT
  '00000000-0000-0000-0000-000000000002'::UUID as project_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as order_count,
  SUM(amount_cents / 100.0) as total_revenue,
  SUM(amount_cents / 100.0 * 0.15) as commission_revenue,
  SUM(amount_cents / 100.0 * 0.85) as artist_payout
FROM orders
WHERE status IN ('completed', 'paid')
GROUP BY DATE_TRUNC('day', created_at);

-- =====================================================
-- 7. RLS POLICIES
-- Security policies for all tables
-- =====================================================

-- Founder Settings: Admin only
ALTER TABLE founder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view founder settings"
  ON founder_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update founder settings"
  ON founder_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Founder Projects: Admin only
ALTER TABLE founder_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view founder projects"
  ON founder_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage founder projects"
  ON founder_projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Project Expenses: Admin only
ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project expenses"
  ON project_expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage project expenses"
  ON project_expenses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AI Spend Logs: Admin only
ALTER TABLE ai_spend_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view ai spend logs"
  ON ai_spend_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert ai spend logs"
  ON ai_spend_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Alerts: Admin only
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 8. FUNCTIONS
-- Helper functions for economic calculations
-- =====================================================

-- Function to get project monthly AI spend
CREATE OR REPLACE FUNCTION get_project_monthly_ai_spend(p_project_id UUID, p_month DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT SUM(amount)
      FROM ai_spend_logs
      WHERE project_id = p_project_id
      AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', p_month)
    ),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project daily AI spend
CREATE OR REPLACE FUNCTION get_project_daily_ai_spend(p_project_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT SUM(amount)
      FROM ai_spend_logs
      WHERE project_id = p_project_id
      AND DATE_TRUNC('day', created_at) = DATE_TRUNC('day', p_date)
    ),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get smoothed AI spend (7-day average)
CREATE OR REPLACE FUNCTION get_smoothed_ai_spend(p_project_id UUID, p_window_days INTEGER DEFAULT 7)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT AVG(daily_spend)
      FROM (
        SELECT DATE_TRUNC('day', created_at) as day, SUM(amount) as daily_spend
        FROM ai_spend_logs
        WHERE project_id = p_project_id
        AND created_at >= CURRENT_DATE - (p_window_days || ' days')::INTERVAL
        GROUP BY DATE_TRUNC('day', created_at)
      ) daily_totals
    ),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. TRIGGERS
-- Auto-update timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_founder_settings_updated_at
  BEFORE UPDATE ON founder_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_projects_updated_at
  BEFORE UPDATE ON founder_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
