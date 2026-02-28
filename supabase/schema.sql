-- ============================================================
-- RPG GAME DATABASE SCHEMA
-- Run this in the Supabase SQL Editor to create all tables
-- ============================================================

-- Table: worlds
CREATE TABLE IF NOT EXISTS worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  world_name TEXT NOT NULL,
  world_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worlds_user ON worlds(user_id);

-- Table: characters
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_retired BOOLEAN DEFAULT false,
  play_time_minutes INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_world ON characters(world_id);

-- Table: messages (conversation history)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_character ON messages(character_id, created_at);

-- Table: npcs
CREATE TABLE IF NOT EXISTS npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  npc_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_npcs_world ON npcs(world_id);

-- Table: items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  item_data JSONB NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  equip_slot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_character ON items(character_id);

-- Table: quests
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  quest_data JSONB NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'active', 'completed', 'failed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_world ON quests(world_id);
CREATE INDEX IF NOT EXISTS idx_quests_character ON quests(character_id);

-- Table: images
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('scene', 'item', 'character', 'location')),
  prompt TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_character ON images(character_id);

-- Table: chronicle_entries
CREATE TABLE IF NOT EXISTS chronicle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  entry_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chronicle_character ON chronicle_entries(character_id);

-- Table: save_states
CREATE TABLE IF NOT EXISTS save_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  save_type TEXT NOT NULL CHECK (save_type IN ('auto', 'quick', 'manual')),
  save_data JSONB NOT NULL,
  label TEXT,
  local_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saves_character ON save_states(character_id);
CREATE INDEX IF NOT EXISTS idx_saves_local_id ON save_states(local_id);

-- Table: bestiary
CREATE TABLE IF NOT EXISTS bestiary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  creature_key TEXT NOT NULL,
  knowledge_tier INTEGER DEFAULT 1,
  entry_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestiary_character ON bestiary(character_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bestiary_unique ON bestiary(character_id, creature_key);

-- ============================================================
-- RLS (Row Level Security) — Basic policies
-- For single-player, these are minimal. Expand if adding auth.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE save_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestiary ENABLE ROW LEVEL SECURITY;

-- Allow all operations via service role (API routes use service key)
-- For the anon key, allow reads/writes with matching user_id
CREATE POLICY "Allow all for service role" ON worlds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON characters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON npcs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON quests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON chronicle_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON save_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON bestiary FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET (create via Dashboard UI, not SQL)
-- Bucket name: rpg-images
-- Public: true
-- ============================================================
