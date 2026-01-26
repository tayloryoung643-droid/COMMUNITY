-- Community Posts RLS Policies
-- Run this in Supabase SQL Editor to enable post creation

-- Enable RLS on community_posts table (if not already enabled)
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view posts in their building" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts in their building" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

-- SELECT: Users can view posts in their building
CREATE POLICY "Users can view posts in their building"
  ON community_posts FOR SELECT
  USING (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  );

-- INSERT: Users can create posts in their building
CREATE POLICY "Users can create posts in their building"
  ON community_posts FOR INSERT
  WITH CHECK (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
    AND author_id = auth.uid()
  );

-- UPDATE: Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON community_posts FOR UPDATE
  USING (author_id = auth.uid());

-- DELETE: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON community_posts FOR DELETE
  USING (author_id = auth.uid());
