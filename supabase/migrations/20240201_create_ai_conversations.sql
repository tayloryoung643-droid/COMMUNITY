-- Create ai_conversations table for storing chat history
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_conversations_building_id ON ai_conversations(building_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see conversations from their own building
CREATE POLICY "Users can view their building's conversations"
  ON ai_conversations
  FOR SELECT
  USING (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can only create conversations in their own building
CREATE POLICY "Users can create conversations in their building"
  ON ai_conversations
  FOR INSERT
  WITH CHECK (
    building_id IN (
      SELECT building_id FROM users WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- RLS Policy: Users can only update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON ai_conversations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can only delete their own conversations
CREATE POLICY "Users can delete their own conversations"
  ON ai_conversations
  FOR DELETE
  USING (user_id = auth.uid());

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS ai_conversations_updated_at_trigger ON ai_conversations;
CREATE TRIGGER ai_conversations_updated_at_trigger
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversations_updated_at();
