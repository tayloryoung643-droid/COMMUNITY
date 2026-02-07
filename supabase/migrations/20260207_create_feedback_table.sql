-- Create feedback table for in-app feedback and landing page contact form
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid REFERENCES buildings(id),
  user_id uuid,
  user_name text,
  user_email text,
  user_role text,
  category text NOT NULL,
  subject text,
  message text NOT NULL,
  page_context text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert feedback
CREATE POLICY "Users can insert feedback"
  ON feedback FOR INSERT TO authenticated
  WITH CHECK (true);

-- Authenticated users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Anonymous users can insert contact form submissions
CREATE POLICY "Anon can insert contact form"
  ON feedback FOR INSERT TO anon
  WITH CHECK (category = 'contact_form');
