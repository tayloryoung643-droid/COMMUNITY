-- Fix RLS policies for building manager onboarding flow
-- Problem: New managers can't create buildings or update their own user profile
-- during sign-up because existing RLS policies require a building_id that doesn't
-- exist yet for brand-new users.

-- ============================================
-- BUILDINGS TABLE
-- ============================================
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their building" ON buildings;
DROP POLICY IF EXISTS "Authenticated users can create buildings" ON buildings;
DROP POLICY IF EXISTS "Managers can update their building" ON buildings;
DROP POLICY IF EXISTS "Anyone can view buildings" ON buildings;
DROP POLICY IF EXISTS "Managers can view their building" ON buildings;

-- SELECT: Any authenticated user can view buildings (needed for access code lookup during resident sign-up)
CREATE POLICY "Anyone can view buildings"
  ON buildings FOR SELECT
  USING (true);

-- INSERT: Any authenticated user can create a building (needed during manager onboarding)
CREATE POLICY "Authenticated users can create buildings"
  ON buildings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only managers can update their own building
CREATE POLICY "Managers can update their building"
  ON buildings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND building_id = buildings.id
      AND role = 'manager'
    )
  );

-- ============================================
-- USERS TABLE
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view users in their building" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Managers can view users in their building" ON users;

-- SELECT: Users can always read their own row + users in their building
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (
    id = auth.uid()
    OR building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  );

-- INSERT: Users can create their own profile row (triggered by auth signup)
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- UPDATE: Users can always update their own row (needed during onboarding to set building_id & role)
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());
