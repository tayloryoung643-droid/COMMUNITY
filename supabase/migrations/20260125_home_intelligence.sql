-- Home Intelligence Tables and Functions
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. HOME_BRIEFS TABLE
-- Stores cached daily home briefs for each resident
-- ============================================
CREATE TABLE IF NOT EXISTS home_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brief_date date NOT NULL,
  brief_json jsonb NOT NULL,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, building_id, brief_date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_home_briefs_user_date ON home_briefs(user_id, brief_date DESC);
CREATE INDEX IF NOT EXISTS idx_home_briefs_building_date ON home_briefs(building_id, brief_date DESC);

-- RLS for home_briefs: users can only SELECT their own rows
ALTER TABLE home_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own home briefs"
  ON home_briefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all home briefs"
  ON home_briefs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 2. ENGAGEMENT_EVENTS TABLE
-- Tracks user interactions for preference learning
-- ============================================
CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  building_id uuid NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  topic text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Valid event_type values:
-- home_view, post_open, post_reply, event_rsvp, package_open,
-- booking_open, notice_open, bulletin_open, bulletin_reply, dismiss_nudge

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_engagement_user_created ON engagement_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_building ON engagement_events(building_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_type ON engagement_events(event_type);

-- RLS for engagement_events: users can INSERT and SELECT their own rows only
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own engagement events"
  ON engagement_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own engagement events"
  ON engagement_events FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 3. NEW JOINERS COUNT FUNCTION
-- Returns aggregated counts only (no user identifiers)
-- ============================================
CREATE OR REPLACE FUNCTION get_new_joiners_count(p_building_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'joiners_last_24h_count', COALESCE(
      (SELECT COUNT(*) FROM users
       WHERE building_id = p_building_id
       AND created_at >= NOW() - INTERVAL '24 hours'),
      0
    ),
    'joiners_last_7d_count', COALESCE(
      (SELECT COUNT(*) FROM users
       WHERE building_id = p_building_id
       AND created_at >= NOW() - INTERVAL '7 days'),
      0
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_new_joiners_count(uuid) TO authenticated;

-- ============================================
-- 4. BUILDING ACTIVITY SUMMARY FUNCTION
-- Returns aggregated activity counts for a building
-- ============================================
CREATE OR REPLACE FUNCTION get_building_activity_summary(p_building_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    -- Events
    'events_today', COALESCE(
      (SELECT COUNT(*) FROM events
       WHERE building_id = p_building_id
       AND DATE(start_time) = CURRENT_DATE),
      0
    ),
    'events_this_week', COALESCE(
      (SELECT COUNT(*) FROM events
       WHERE building_id = p_building_id
       AND start_time >= NOW()
       AND start_time < NOW() + INTERVAL '7 days'),
      0
    ),
    -- Packages (pending pickup)
    'packages_pending', COALESCE(
      (SELECT COUNT(*) FROM packages
       WHERE building_id = p_building_id
       AND status = 'pending'),
      0
    ),
    -- Community posts last 24h
    'posts_last_24h', COALESCE(
      (SELECT COUNT(*) FROM community_posts
       WHERE building_id = p_building_id
       AND created_at >= NOW() - INTERVAL '24 hours'),
      0
    ),
    -- Bulletin board items last 7 days
    'bulletin_items_7d', COALESCE(
      (SELECT COUNT(*) FROM listings
       WHERE building_id = p_building_id
       AND created_at >= NOW() - INTERVAL '7 days'),
      0
    ),
    -- Active bulletin items
    'bulletin_active', COALESCE(
      (SELECT COUNT(*) FROM listings
       WHERE building_id = p_building_id
       AND (expires_at IS NULL OR expires_at > NOW())),
      0
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_building_activity_summary(uuid) TO authenticated;

-- ============================================
-- 5. GET OR CREATE TODAY'S HOME BRIEF
-- Returns existing brief or null if none exists
-- ============================================
CREATE OR REPLACE FUNCTION get_todays_home_brief(p_user_id uuid, p_building_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brief_record home_briefs%ROWTYPE;
BEGIN
  SELECT * INTO brief_record
  FROM home_briefs
  WHERE user_id = p_user_id
    AND building_id = p_building_id
    AND brief_date = CURRENT_DATE
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN brief_record.brief_json;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_todays_home_brief(uuid, uuid) TO authenticated;

-- ============================================
-- 6. SAVE HOME BRIEF
-- Upserts a home brief for a user/building/date
-- ============================================
CREATE OR REPLACE FUNCTION save_home_brief(
  p_user_id uuid,
  p_building_id uuid,
  p_brief_json jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  brief_id uuid;
BEGIN
  INSERT INTO home_briefs (user_id, building_id, brief_date, brief_json, version)
  VALUES (p_user_id, p_building_id, CURRENT_DATE, p_brief_json, 1)
  ON CONFLICT (user_id, building_id, brief_date)
  DO UPDATE SET
    brief_json = EXCLUDED.brief_json,
    version = home_briefs.version + 1,
    created_at = NOW()
  RETURNING id INTO brief_id;

  RETURN brief_id;
END;
$$;

-- Grant execute permission (restricted - typically called by Edge Function)
GRANT EXECUTE ON FUNCTION save_home_brief(uuid, uuid, jsonb) TO authenticated;
