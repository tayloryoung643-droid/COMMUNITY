-- Add guidelines_accepted_at column to users table
-- Used to track whether a resident has accepted the community guidelines.
-- NULL = hasn't accepted yet (show guidelines), non-NULL = accepted (skip).
ALTER TABLE users ADD COLUMN IF NOT EXISTS guidelines_accepted_at TIMESTAMPTZ DEFAULT NULL;
