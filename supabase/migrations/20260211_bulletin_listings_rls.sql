-- Bulletin Listings RLS Policies
-- Run this in Supabase SQL Editor to enable listing creation

-- Enable RLS on bulletin_listings table (if not already enabled)
ALTER TABLE bulletin_listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view listings in their building" ON bulletin_listings;
DROP POLICY IF EXISTS "Users can create listings in their building" ON bulletin_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON bulletin_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON bulletin_listings;

-- SELECT: Users can view listings in their building
CREATE POLICY "Users can view listings in their building"
  ON bulletin_listings FOR SELECT
  USING (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  );

-- INSERT: Users can create listings in their building
CREATE POLICY "Users can create listings in their building"
  ON bulletin_listings FOR INSERT
  WITH CHECK (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
    AND author_id = auth.uid()
  );

-- UPDATE: Users can update their own listings
CREATE POLICY "Users can update their own listings"
  ON bulletin_listings FOR UPDATE
  USING (author_id = auth.uid());

-- DELETE: Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
  ON bulletin_listings FOR DELETE
  USING (author_id = auth.uid());
