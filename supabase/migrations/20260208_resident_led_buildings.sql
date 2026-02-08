-- Migration: Resident-Led Buildings
-- Adds join_policy and invite_slug to buildings, creates resident_invites_v2 and join_requests tables

-- Add join_policy to buildings (only relevant for managed buildings)
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS join_policy text DEFAULT 'open';

-- Add invite_slug for shareable invite links
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS invite_slug text UNIQUE;

-- Add total_units for adoption tracking
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS total_units integer;

-- Ensure building_mode has a default
ALTER TABLE buildings ALTER COLUMN building_mode SET DEFAULT 'managed';

-- Invites table for resident-initiated invites
CREATE TABLE IF NOT EXISTS resident_invites_v2 (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id uuid REFERENCES buildings(id) ON DELETE CASCADE,
  invited_by uuid REFERENCES auth.users(id),
  invitee_name text,
  invitee_email text,
  unit_number text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- RLS for resident_invites_v2
ALTER TABLE resident_invites_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites for their building" ON resident_invites_v2
  FOR SELECT USING (building_id IN (SELECT building_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert invites for their building" ON resident_invites_v2
  FOR INSERT WITH CHECK (building_id IN (SELECT building_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own invites" ON resident_invites_v2
  FOR UPDATE USING (invited_by = auth.uid());

-- Join requests table (for manager_approval policy)
CREATE TABLE IF NOT EXISTS join_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id uuid REFERENCES buildings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  user_name text,
  user_email text,
  unit_number text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view join requests" ON join_requests
  FOR SELECT USING (building_id IN (SELECT building_id FROM users WHERE id = auth.uid() AND role = 'manager'));

CREATE POLICY "Users can insert join requests" ON join_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can update join requests" ON join_requests
  FOR UPDATE USING (building_id IN (SELECT building_id FROM users WHERE id = auth.uid() AND role = 'manager'));
