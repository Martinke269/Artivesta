-- ============================================================================
-- GALLERY ONBOARDING & MANAGEMENT SYSTEM
-- ============================================================================
-- Purpose: Enable galleries to onboard themselves, manage artworks, and
-- operate independently with AI-assisted features and behavior monitoring.
-- ============================================================================

-- ============================================================================
-- 1. UPDATE PROFILES TABLE TO SUPPORT GALLERY OWNERS
-- ============================================================================

-- Add gallery_owner role to profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('artist', 'business', 'admin', 'gallery_owner'));

-- Add Stripe Connect account ID to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;

-- ============================================================================
-- 2. GALLERIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Denmark',
  website TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  description TEXT,
  commission_percentage NUMERIC DEFAULT 20.0 CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_galleries_owner_id ON galleries(owner_id);
CREATE INDEX idx_galleries_status ON galleries(status);

-- ============================================================================
-- 3. GALLERY USERS TABLE (Team Members)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'curator', 'staff')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, user_id)
);

CREATE INDEX idx_gallery_users_gallery_id ON gallery_users(gallery_id);
CREATE INDEX idx_gallery_users_user_id ON gallery_users(user_id);

-- ============================================================================
-- 4. GALLERY ARTWORKS TABLE (Link artworks to galleries)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id),
  commission_percentage NUMERIC DEFAULT 20.0,
  leasing_enabled BOOLEAN DEFAULT false,
  leasing_monthly_price_cents INTEGER,
  leasing_minimum_months INTEGER DEFAULT 3,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, artwork_id)
);

CREATE INDEX idx_gallery_artworks_gallery_id ON gallery_artworks(gallery_id);
CREATE INDEX idx_gallery_artworks_artwork_id ON gallery_artworks(artwork_id);
CREATE INDEX idx_gallery_artworks_published ON gallery_artworks(published);

-- ============================================================================
-- 5. GALLERY ONBOARDING INSIGHTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_onboarding_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'first_artwork_analysis',
    'price_suggestion',
    'category_recommendation',
    'leasing_opportunity',
    'market_positioning',
    'metadata_quality'
  )),
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  confidence_score NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_onboarding_insights_gallery_id ON gallery_onboarding_insights(gallery_id);
CREATE INDEX idx_gallery_onboarding_insights_artwork_id ON gallery_onboarding_insights(artwork_id);
CREATE INDEX idx_gallery_onboarding_insights_is_read ON gallery_onboarding_insights(is_read);

-- ============================================================================
-- 6. GALLERY STRIPE PAYMENT LINKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  stripe_payment_link_id TEXT NOT NULL,
  stripe_payment_link_url TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'DKK',
  active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_gallery_payment_links_gallery_id ON gallery_payment_links(gallery_id);
CREATE INDEX idx_gallery_payment_links_artwork_id ON gallery_payment_links(artwork_id);
CREATE INDEX idx_gallery_payment_links_active ON gallery_payment_links(active);

-- ============================================================================
-- 7. GALLERY METADATA VALIDATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_metadata_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  validation_type TEXT NOT NULL CHECK (validation_type IN (
    'unrealistic_price',
    'missing_images',
    'inconsistent_dimensions',
    'missing_description',
    'poor_image_quality',
    'incomplete_metadata'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  message TEXT NOT NULL,
  auto_fixed BOOLEAN DEFAULT false,
  fixed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gallery_metadata_validations_gallery_id ON gallery_metadata_validations(gallery_id);
CREATE INDEX idx_gallery_metadata_validations_artwork_id ON gallery_metadata_validations(artwork_id);
CREATE INDEX idx_gallery_metadata_validations_severity ON gallery_metadata_validations(severity);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_onboarding_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_metadata_validations ENABLE ROW LEVEL SECURITY;

-- Galleries Policies
CREATE POLICY "Gallery owners can view own galleries"
  ON galleries FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = galleries.id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery owners can create galleries"
  ON galleries FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gallery_owner')
  );

CREATE POLICY "Gallery owners can update own galleries"
  ON galleries FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = galleries.id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

CREATE POLICY "Gallery owners can delete own galleries"
  ON galleries FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Gallery Users Policies
CREATE POLICY "Gallery team can view team members"
  ON gallery_users FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM galleries WHERE id = gallery_users.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users gu WHERE gu.gallery_id = gallery_users.gallery_id AND gu.user_id = auth.uid() AND gu.status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery owners can invite team members"
  ON gallery_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_users.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_users.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

CREATE POLICY "Gallery owners can update team members"
  ON gallery_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_users.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_users.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

CREATE POLICY "Gallery owners can remove team members"
  ON gallery_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_users.gallery_id AND owner_id = auth.uid())
  );

-- Gallery Artworks Policies
CREATE POLICY "Anyone can view published gallery artworks"
  ON gallery_artworks FOR SELECT
  TO authenticated
  USING (
    published = true
    OR EXISTS (SELECT 1 FROM galleries WHERE id = gallery_artworks.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_artworks.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM artworks WHERE id = gallery_artworks.artwork_id AND artist_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery team can add artworks"
  ON gallery_artworks FOR INSERT
  TO authenticated
  WITH CHECK (
    added_by = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM galleries WHERE id = gallery_artworks.gallery_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_artworks.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager', 'curator') AND status = 'active')
    )
  );

CREATE POLICY "Gallery team can update artworks"
  ON gallery_artworks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_artworks.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_artworks.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager', 'curator') AND status = 'active')
  );

CREATE POLICY "Gallery team can remove artworks"
  ON gallery_artworks FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_artworks.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_artworks.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
  );

-- Gallery Onboarding Insights Policies
CREATE POLICY "Gallery team can view insights"
  ON gallery_onboarding_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_onboarding_insights.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_onboarding_insights.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery team can update insights"
  ON gallery_onboarding_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_onboarding_insights.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_onboarding_insights.gallery_id AND user_id = auth.uid() AND status = 'active')
  );

-- Gallery Payment Links Policies
CREATE POLICY "Gallery team can view payment links"
  ON gallery_payment_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_payment_links.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_payment_links.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Gallery team can create payment links"
  ON gallery_payment_links FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM galleries WHERE id = gallery_payment_links.gallery_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_payment_links.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active')
    )
  );

-- Gallery Metadata Validations Policies
CREATE POLICY "Gallery team can view validations"
  ON gallery_metadata_validations FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM galleries WHERE id = gallery_metadata_validations.gallery_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM gallery_users WHERE gallery_id = gallery_metadata_validations.gallery_id AND user_id = auth.uid() AND status = 'active')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for galleries updated_at
CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gallery_artworks updated_at
CREATE TRIGGER update_gallery_artworks_updated_at BEFORE UPDATE ON gallery_artworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to validate artwork metadata for galleries
CREATE OR REPLACE FUNCTION validate_gallery_artwork_metadata(
  p_gallery_id UUID,
  p_artwork_id UUID
)
RETURNS void AS $$
DECLARE
  artwork_record RECORD;
  validation_issues INTEGER := 0;
BEGIN
  -- Get artwork details
  SELECT * INTO artwork_record FROM artworks WHERE id = p_artwork_id;
  
  IF artwork_record IS NULL THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;
  
  -- Check for unrealistic price (< 100 DKK or > 10,000,000 DKK)
  IF artwork_record.price_cents < 10000 OR artwork_record.price_cents > 1000000000 THEN
    INSERT INTO gallery_metadata_validations (
      gallery_id, artwork_id, validation_type, severity, message
    ) VALUES (
      p_gallery_id, p_artwork_id, 'unrealistic_price', 'warning',
      format('Price %s DKK may be unrealistic', artwork_record.price_cents / 100)
    );
    validation_issues := validation_issues + 1;
  END IF;
  
  -- Check for missing images
  IF artwork_record.image_url IS NULL OR artwork_record.image_url = '' THEN
    INSERT INTO gallery_metadata_validations (
      gallery_id, artwork_id, validation_type, severity, message
    ) VALUES (
      p_gallery_id, p_artwork_id, 'missing_images', 'critical',
      'Artwork has no images'
    );
    validation_issues := validation_issues + 1;
  END IF;
  
  -- Check for missing description
  IF artwork_record.description IS NULL OR LENGTH(artwork_record.description) < 20 THEN
    INSERT INTO gallery_metadata_validations (
      gallery_id, artwork_id, validation_type, severity, message
    ) VALUES (
      p_gallery_id, p_artwork_id, 'missing_description', 'warning',
      'Artwork description is missing or too short'
    );
    validation_issues := validation_issues + 1;
  END IF;
  
  -- Check for inconsistent dimensions
  IF artwork_record.category IN ('painting', 'sculpture', 'photography') THEN
    IF artwork_record.width_cm IS NULL OR artwork_record.height_cm IS NULL THEN
      INSERT INTO gallery_metadata_validations (
        gallery_id, artwork_id, validation_type, severity, message
      ) VALUES (
        p_gallery_id, p_artwork_id, 'inconsistent_dimensions', 'warning',
        'Physical dimensions are missing'
      );
      validation_issues := validation_issues + 1;
    END IF;
  END IF;
  
  -- If no issues, create a positive validation
  IF validation_issues = 0 THEN
    INSERT INTO gallery_onboarding_insights (
      gallery_id, artwork_id, insight_type, insight_title, insight_description, confidence_score
    ) VALUES (
      p_gallery_id, p_artwork_id, 'metadata_quality', 'Excellent Metadata Quality',
      'This artwork has complete and high-quality metadata.', 0.95
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate AI insights for first artwork
CREATE OR REPLACE FUNCTION generate_first_artwork_insights(
  p_gallery_id UUID,
  p_artwork_id UUID
)
RETURNS void AS $$
DECLARE
  artwork_record RECORD;
  price_level TEXT;
  leasing_potential BOOLEAN;
BEGIN
  -- Get artwork details
  SELECT * INTO artwork_record FROM artworks WHERE id = p_artwork_id;
  
  IF artwork_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Determine price level
  IF artwork_record.price_cents < 500000 THEN
    price_level := 'entry_level';
  ELSIF artwork_record.price_cents < 2000000 THEN
    price_level := 'mid_range';
  ELSE
    price_level := 'premium';
  END IF;
  
  -- Determine leasing potential (artworks > 5000 DKK)
  leasing_potential := artwork_record.price_cents >= 500000;
  
  -- Create general insight
  INSERT INTO gallery_onboarding_insights (
    gallery_id, artwork_id, insight_type, insight_title, insight_description, confidence_score, metadata
  ) VALUES (
    p_gallery_id, p_artwork_id, 'first_artwork_analysis', 'Welcome to ArtIsSafe!',
    format('Your first artwork "%s" has been analyzed. This %s piece shows strong potential for %s.',
      artwork_record.title,
      price_level,
      CASE 
        WHEN artwork_record.category = 'painting' THEN 'residential and office environments'
        WHEN artwork_record.category = 'sculpture' THEN 'corporate lobbies and public spaces'
        WHEN artwork_record.category = 'photography' THEN 'modern office spaces'
        ELSE 'various commercial settings'
      END
    ),
    0.85,
    jsonb_build_object(
      'price_level', price_level,
      'category', artwork_record.category,
      'leasing_potential', leasing_potential
    )
  );
  
  -- Create leasing opportunity insight if applicable
  IF leasing_potential THEN
    INSERT INTO gallery_onboarding_insights (
      gallery_id, artwork_id, insight_type, insight_title, insight_description, confidence_score
    ) VALUES (
      p_gallery_id, p_artwork_id, 'leasing_opportunity', 'Consider Enabling Leasing',
      format('This artwork is priced at %s DKK, making it an excellent candidate for leasing. Businesses often prefer leasing for artworks in this price range.',
        artwork_record.price_cents / 100
      ),
      0.90
    );
  END IF;
  
  -- Create market positioning insight
  INSERT INTO gallery_onboarding_insights (
    gallery_id, artwork_id, insight_type, insight_title, insight_description, confidence_score
  ) VALUES (
    p_gallery_id, p_artwork_id, 'market_positioning', 'Market Positioning',
    format('Based on similar artworks, your %s is positioned in the %s segment. Consider highlighting unique features in the description.',
      artwork_record.category,
      price_level
    ),
    0.80
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if gallery can publish artworks (Stripe connected)
CREATE OR REPLACE FUNCTION can_gallery_publish_artworks(
  p_gallery_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  owner_record RECORD;
BEGIN
  -- Get gallery owner
  SELECT p.* INTO owner_record
  FROM galleries g
  JOIN profiles p ON g.owner_id = p.id
  WHERE g.id = p_gallery_id;
  
  IF owner_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if Stripe is connected
  RETURN owner_record.stripe_account_id IS NOT NULL 
    AND owner_record.stripe_onboarding_complete = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete gallery onboarding
CREATE OR REPLACE FUNCTION complete_gallery_onboarding(
  p_gallery_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE galleries
  SET onboarding_completed = TRUE,
      onboarding_step = 5
  WHERE id = p_gallery_id;
  
  -- Create completion insight
  INSERT INTO gallery_onboarding_insights (
    gallery_id, insight_type, insight_title, insight_description, confidence_score
  ) VALUES (
    p_gallery_id, 'market_positioning', 'Onboarding Complete!',
    'Your gallery is now live on ArtIsSafe. You can start publishing artworks and accepting orders.',
    1.0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update artworks table to support gallery ownership
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS gallery_id UUID REFERENCES galleries(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_artworks_gallery_id ON artworks(gallery_id);

-- Update artworks RLS to allow gallery team members
DROP POLICY IF EXISTS "Artists can insert own artworks" ON artworks;
CREATE POLICY "Artists and gallery team can insert artworks"
  ON artworks FOR INSERT
  TO authenticated
  WITH CHECK (
    (artist_id = auth.uid() AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'artist'))
    OR (gallery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM galleries WHERE id = artworks.gallery_id AND owner_id = auth.uid()
    ))
    OR (gallery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM gallery_users WHERE gallery_id = artworks.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager', 'curator') AND status = 'active'
    ))
  );

DROP POLICY IF EXISTS "Artists can update own artworks" ON artworks;
CREATE POLICY "Artists and gallery team can update artworks"
  ON artworks FOR UPDATE
  TO authenticated
  USING (
    artist_id = auth.uid()
    OR (gallery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM galleries WHERE id = artworks.gallery_id AND owner_id = auth.uid()
    ))
    OR (gallery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM gallery_users WHERE gallery_id = artworks.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager', 'curator') AND status = 'active'
    ))
  );

DROP POLICY IF EXISTS "Artists can delete own artworks" ON artworks;
CREATE POLICY "Artists and gallery team can delete artworks"
  ON artworks FOR DELETE
  TO authenticated
  USING (
    artist_id = auth.uid()
    OR (gallery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM galleries WHERE id = artworks.gallery_id AND owner_id = auth.uid()
    ))
    OR (gallery_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM gallery_users WHERE gallery_id = artworks.gallery_id AND user_id = auth.uid() AND role IN ('owner', 'manager') AND status = 'active'
    ))
  );
