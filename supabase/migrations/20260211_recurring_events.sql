-- Add recurring event support columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_rule jsonb DEFAULT NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurrence_end date DEFAULT NULL;
