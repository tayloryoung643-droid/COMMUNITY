-- Maintenance Requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_number TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_maintenance_building ON maintenance_requests(building_id);
CREATE INDEX idx_maintenance_user ON maintenance_requests(user_id);

-- Enable RLS
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Residents can insert their own requests
CREATE POLICY "Residents can create own requests"
  ON maintenance_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Residents can view their own requests
CREATE POLICY "Residents can view own requests"
  ON maintenance_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Building managers can view all requests for their building
CREATE POLICY "Managers can view building requests"
  ON maintenance_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.building_id = maintenance_requests.building_id
        AND users.role = 'manager'
    )
  );

-- Building managers can update requests for their building
CREATE POLICY "Managers can update building requests"
  ON maintenance_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.building_id = maintenance_requests.building_id
        AND users.role = 'manager'
    )
  );
