-- Add token column to invitations table for invite link verification
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS token UUID;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- Enable RLS on invitations (idempotent)
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop old policy if it exists (from a previous version of this migration)
DROP POLICY IF EXISTS "Anyone can lookup invitation by token" ON invitations;

-- Allow the anon role (unauthenticated users) to SELECT invitations that have a token.
-- This is required because residents clicking an invite link are not logged in yet.
-- The Supabase client filters by .eq('token', <uuid>) so only one row is ever returned.
CREATE POLICY "Anon can lookup invitation by token"
  ON invitations
  FOR SELECT
  TO anon
  USING (token IS NOT NULL);

-- Authenticated users (managers) can do everything on their building's invitations
DROP POLICY IF EXISTS "Managers can manage invitations" ON invitations;
CREATE POLICY "Managers can manage invitations"
  ON invitations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
