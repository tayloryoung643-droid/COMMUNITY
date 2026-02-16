-- Add token column to invitations table for invite link verification
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS token UUID;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- Allow unauthenticated users to look up invitations by token (for join flow)
CREATE POLICY "Anyone can lookup invitation by token"
  ON invitations
  FOR SELECT
  USING (token IS NOT NULL);
