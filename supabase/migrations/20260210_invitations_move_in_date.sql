-- Add move_in_date column to invitations table
-- This column was referenced by addSingleResident but never created
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS move_in_date date;
