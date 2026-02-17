-- Art Briefs System Migration
-- This migration adds the complete art brief / shopping list / wishlist system

-- Art Briefs table
CREATE TABLE IF NOT EXISTS art_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'interior_designer')),
  art_type TEXT,
  style TEXT,
  size_min_cm INTEGER,
  size_max_cm INTEGER,
  colors TEXT[],
  description TEXT,
  budget_min_dkk INTEGER,
  budget_max_dkk INTEGER,
  wall_image_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Brief Matches table
CREATE TABLE IF NOT EXISTS art_brief_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id UUID NOT NULL REFERENCES art_briefs(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gallery_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_score NUMERIC(3,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  contacted BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  response_message TEXT,
  response_attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT artist_or_gallery_required CHECK (
    (artist_id IS NOT NULL AND gallery_id IS NULL) OR
    (artist_id IS NULL AND gallery_id IS NOT NULL)
  )
);

-- Art Brief Responses table (for tracking communication)
CREATE TABLE IF NOT EXISTS art_brief_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES art_brief_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Art Brief Notifications table
CREATE TABLE IF NOT EXISTS art_brief_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id UUID NOT NULL REFERENCES art_briefs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'brief_created',
    'matches_found',
    'new_response',
    'brief_updated',
    'brief_closed',
    'new_match_opportunity'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE art_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_brief_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_brief_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_brief_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for art_briefs
CREATE POLICY "Users can view own briefs"
  ON art_briefs FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Artists/galleries can view matched briefs"
  ON art_briefs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM art_brief_matches
      WHERE art_brief_matches.brief_id = art_briefs.id
      AND (art_brief_matches.artist_id = auth.uid() OR art_brief_matches.gallery_id = auth.uid())
    )
  );

CREATE POLICY "Users can create own briefs"
  ON art_briefs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own briefs"
  ON art_briefs FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can update any brief"
  ON art_briefs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for art_brief_matches
CREATE POLICY "Brief owners can view their matches"
  ON art_brief_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM art_briefs WHERE art_briefs.id = art_brief_matches.brief_id AND art_briefs.created_by = auth.uid()) OR
    artist_id = auth.uid() OR
    gallery_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can create matches"
  ON art_brief_matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Matched artists/galleries can update their matches"
  ON art_brief_matches FOR UPDATE
  TO authenticated
  USING (
    artist_id = auth.uid() OR
    gallery_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for art_brief_responses
CREATE POLICY "Participants can view responses"
  ON art_brief_responses FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM art_brief_matches abm
      JOIN art_briefs ab ON ab.id = abm.brief_id
      WHERE abm.id = art_brief_responses.match_id
      AND (ab.created_by = auth.uid() OR abm.artist_id = auth.uid() OR abm.gallery_id = auth.uid())
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Participants can create responses"
  ON art_brief_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM art_brief_matches abm
      JOIN art_briefs ab ON ab.id = abm.brief_id
      WHERE abm.id = art_brief_responses.match_id
      AND (ab.created_by = auth.uid() OR abm.artist_id = auth.uid() OR abm.gallery_id = auth.uid())
    )
  );

-- RLS Policies for art_brief_notifications
CREATE POLICY "Users can view own notifications"
  ON art_brief_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON art_brief_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON art_brief_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_art_briefs_created_by ON art_briefs(created_by);
CREATE INDEX IF NOT EXISTS idx_art_briefs_status ON art_briefs(status);
CREATE INDEX IF NOT EXISTS idx_art_briefs_role ON art_briefs(role);
CREATE INDEX IF NOT EXISTS idx_art_briefs_art_type ON art_briefs(art_type);
CREATE INDEX IF NOT EXISTS idx_art_briefs_style ON art_briefs(style);
CREATE INDEX IF NOT EXISTS idx_art_briefs_colors ON art_briefs USING GIN(colors);
CREATE INDEX IF NOT EXISTS idx_art_briefs_created_at ON art_briefs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_art_brief_matches_brief_id ON art_brief_matches(brief_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_matches_artist_id ON art_brief_matches(artist_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_matches_gallery_id ON art_brief_matches(gallery_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_matches_score ON art_brief_matches(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_art_brief_matches_contacted ON art_brief_matches(contacted);
CREATE INDEX IF NOT EXISTS idx_art_brief_matches_responded ON art_brief_matches(responded);

CREATE INDEX IF NOT EXISTS idx_art_brief_responses_match_id ON art_brief_responses(match_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_responses_sender_id ON art_brief_responses(sender_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_responses_created_at ON art_brief_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_art_brief_notifications_user_id ON art_brief_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_notifications_brief_id ON art_brief_notifications(brief_id);
CREATE INDEX IF NOT EXISTS idx_art_brief_notifications_read ON art_brief_notifications(read);
CREATE INDEX IF NOT EXISTS idx_art_brief_notifications_email_sent ON art_brief_notifications(email_sent);
CREATE INDEX IF NOT EXISTS idx_art_brief_notifications_created_at ON art_brief_notifications(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_art_briefs_updated_at BEFORE UPDATE ON art_briefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_art_brief_matches_updated_at BEFORE UPDATE ON art_brief_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate match score
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_brief_id UUID,
  p_artwork_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_score NUMERIC := 0;
  v_brief RECORD;
  v_artwork RECORD;
  v_color_overlap INTEGER;
BEGIN
  -- Get brief details
  SELECT * INTO v_brief FROM art_briefs WHERE id = p_brief_id;
  
  -- Get artwork details
  SELECT * INTO v_artwork FROM artworks WHERE id = p_artwork_id;
  
  -- Check art type match (0.4 points)
  IF v_brief.art_type IS NOT NULL AND v_artwork.category IS NOT NULL THEN
    IF LOWER(v_brief.art_type) = LOWER(v_artwork.category) THEN
      v_score := v_score + 0.4;
    END IF;
  END IF;
  
  -- Check style match (0.3 points)
  IF v_brief.style IS NOT NULL AND v_artwork.style IS NOT NULL THEN
    IF LOWER(v_brief.style) = LOWER(v_artwork.style) THEN
      v_score := v_score + 0.3;
    END IF;
  END IF;
  
  -- Check color overlap (0.2 points)
  IF v_brief.colors IS NOT NULL AND v_artwork.dominant_colors IS NOT NULL THEN
    SELECT COUNT(*) INTO v_color_overlap
    FROM unnest(v_brief.colors) AS brief_color
    WHERE brief_color = ANY(v_artwork.dominant_colors);
    
    IF v_color_overlap > 0 THEN
      v_score := v_score + 0.2;
    END IF;
  END IF;
  
  -- Check size range (0.1 points)
  IF v_brief.size_min_cm IS NOT NULL AND v_brief.size_max_cm IS NOT NULL 
     AND v_artwork.width_cm IS NOT NULL THEN
    IF v_artwork.width_cm >= v_brief.size_min_cm 
       AND v_artwork.width_cm <= v_brief.size_max_cm THEN
      v_score := v_score + 0.1;
    END IF;
  END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find matches for a brief
CREATE OR REPLACE FUNCTION find_matches_for_brief(p_brief_id UUID)
RETURNS TABLE (
  artist_id UUID,
  gallery_id UUID,
  match_score NUMERIC,
  artwork_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH brief_data AS (
    SELECT * FROM art_briefs WHERE id = p_brief_id
  ),
  artwork_matches AS (
    SELECT 
      a.artist_id,
      NULL::UUID as gallery_id,
      calculate_match_score(p_brief_id, a.id) as score,
      a.id as artwork_id
    FROM artworks a
    CROSS JOIN brief_data b
    WHERE a.status = 'available'
    AND (b.budget_min_dkk IS NULL OR a.price_cents >= b.budget_min_dkk * 100)
    AND (b.budget_max_dkk IS NULL OR a.price_cents <= b.budget_max_dkk * 100)
  )
  SELECT 
    am.artist_id,
    am.gallery_id,
    MAX(am.score) as match_score,
    COUNT(DISTINCT am.artwork_id)::INTEGER as artwork_count
  FROM artwork_matches am
  WHERE am.score >= 0.5
  GROUP BY am.artist_id, am.gallery_id
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_art_brief_notification(
  p_brief_id UUID,
  p_user_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO art_brief_notifications (
    brief_id,
    user_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_brief_id,
    p_user_id,
    p_notification_type,
    p_title,
    p_message
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_match_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_matches_for_brief(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_art_brief_notification(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;
