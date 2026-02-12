-- Fix get_building_activity_summary: wrong table names
-- "listings" → "bulletin_listings", "expires_at" → "status = 'active'"
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
    'packages_pending', COALESCE(
      (SELECT COUNT(*) FROM packages
       WHERE building_id = p_building_id
       AND status = 'pending'),
      0
    ),
    'posts_last_24h', COALESCE(
      (SELECT COUNT(*) FROM community_posts
       WHERE building_id = p_building_id
       AND created_at >= NOW() - INTERVAL '24 hours'),
      0
    ),
    'bulletin_items_7d', COALESCE(
      (SELECT COUNT(*) FROM bulletin_listings
       WHERE building_id = p_building_id
       AND created_at >= NOW() - INTERVAL '7 days'),
      0
    ),
    'bulletin_active', COALESCE(
      (SELECT COUNT(*) FROM bulletin_listings
       WHERE building_id = p_building_id
       AND status = 'active'),
      0
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_building_activity_summary(uuid) TO authenticated;
