-- Events Table RLS Policies
-- Run this in Supabase SQL Editor to enable event creation

-- Enable RLS on events table (if not already enabled)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view events in their building" ON events;
DROP POLICY IF EXISTS "Users can create events in their building" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Managers can manage all events in their building" ON events;

-- SELECT: Users can view events in their building
CREATE POLICY "Users can view events in their building"
  ON events FOR SELECT
  USING (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  );

-- INSERT: Users can create events in their building
CREATE POLICY "Users can create events in their building"
  ON events FOR INSERT
  WITH CHECK (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  );

-- UPDATE: Users can update events they created, OR managers can update any event in their building
CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND building_id = events.building_id
      AND role = 'manager'
    )
  );

-- DELETE: Users can delete events they created, OR managers can delete any event in their building
CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND building_id = events.building_id
      AND role = 'manager'
    )
  );

-- Ensure the created_by column exists (add if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add event_time column if missing (for storing formatted time string)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_time'
  ) THEN
    ALTER TABLE events ADD COLUMN event_time text;
  END IF;
END $$;

-- Add category column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'category'
  ) THEN
    ALTER TABLE events ADD COLUMN category text DEFAULT 'social';
  END IF;
END $$;
