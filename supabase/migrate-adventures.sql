-- ============================================================
-- MIGRATION: Add adventures table for cross-device game management
-- Run in Supabase SQL Editor
-- ============================================================

-- Table: adventures — Full game state snapshots for save/load/switch
CREATE TABLE IF NOT EXISTS adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  save_name TEXT NOT NULL,

  -- Preview fields (denormalized for fast listing without loading full state)
  world_name TEXT NOT NULL DEFAULT 'Unknown',
  world_type TEXT NOT NULL DEFAULT 'unknown',
  primary_genre TEXT NOT NULL DEFAULT 'fantasy',
  character_name TEXT NOT NULL DEFAULT 'Unknown',
  character_class TEXT NOT NULL DEFAULT 'Unknown',
  character_race TEXT NOT NULL DEFAULT 'Unknown',
  character_level INTEGER NOT NULL DEFAULT 1,
  current_location TEXT NOT NULL DEFAULT 'Unknown',
  message_count INTEGER NOT NULL DEFAULT 0,
  quest_count INTEGER NOT NULL DEFAULT 0,

  -- Full game state blob (the entire Zustand persisted state)
  game_state JSONB NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adventures_user ON adventures(user_id, last_played_at DESC);

-- Enable RLS
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;

-- Allow all via service role (API routes use service key)
CREATE POLICY "Allow all for service role" ON adventures FOR ALL USING (true) WITH CHECK (true);

SELECT 'Migration complete — adventures table created.' AS result;
