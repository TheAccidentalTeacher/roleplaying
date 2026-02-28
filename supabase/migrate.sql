-- ============================================================
-- MIGRATION: Apply audit 5 schema changes to existing tables
-- Run this in Supabase SQL Editor if tables already exist
-- ============================================================

-- 1. Add local_id column to save_states (if missing)
ALTER TABLE save_states ADD COLUMN IF NOT EXISTS local_id TEXT;
CREATE INDEX IF NOT EXISTS idx_saves_local_id ON save_states(local_id);

-- 2. Add CHECK constraints (drop first if they exist, then re-add)
-- messages.role
DO $$ BEGIN
  ALTER TABLE messages ADD CONSTRAINT messages_role_check CHECK (role IN ('user', 'assistant', 'system'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- save_states.save_type
DO $$ BEGIN
  ALTER TABLE save_states ADD CONSTRAINT save_states_save_type_check CHECK (save_type IN ('auto', 'quick', 'manual'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- quests.status
DO $$ BEGIN
  ALTER TABLE quests ADD CONSTRAINT quests_status_check CHECK (status IN ('available', 'active', 'completed', 'failed', 'abandoned'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- images.image_type
DO $$ BEGIN
  ALTER TABLE images ADD CONSTRAINT images_image_type_check CHECK (image_type IN ('scene', 'item', 'character', 'location'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Make timestamp columns NOT NULL (set existing NULLs to NOW() first)
UPDATE worlds SET created_at = NOW() WHERE created_at IS NULL;
UPDATE worlds SET updated_at = NOW() WHERE updated_at IS NULL;
ALTER TABLE worlds ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE worlds ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE worlds ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE worlds ALTER COLUMN updated_at SET DEFAULT NOW();

UPDATE characters SET created_at = NOW() WHERE created_at IS NULL;
UPDATE characters SET updated_at = NOW() WHERE updated_at IS NULL;
ALTER TABLE characters ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE characters ALTER COLUMN updated_at SET NOT NULL;

UPDATE messages SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE messages ALTER COLUMN created_at SET NOT NULL;

UPDATE npcs SET created_at = NOW() WHERE created_at IS NULL;
UPDATE npcs SET updated_at = NOW() WHERE updated_at IS NULL;
ALTER TABLE npcs ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE npcs ALTER COLUMN updated_at SET NOT NULL;

UPDATE items SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE items ALTER COLUMN created_at SET NOT NULL;

UPDATE quests SET created_at = NOW() WHERE created_at IS NULL;
UPDATE quests SET updated_at = NOW() WHERE updated_at IS NULL;
ALTER TABLE quests ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE quests ALTER COLUMN updated_at SET NOT NULL;

UPDATE images SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE images ALTER COLUMN created_at SET NOT NULL;

UPDATE chronicle_entries SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE chronicle_entries ALTER COLUMN created_at SET NOT NULL;

UPDATE save_states SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE save_states ALTER COLUMN created_at SET NOT NULL;

UPDATE bestiary SET created_at = NOW() WHERE created_at IS NULL;
UPDATE bestiary SET updated_at = NOW() WHERE updated_at IS NULL;
ALTER TABLE bestiary ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE bestiary ALTER COLUMN updated_at SET NOT NULL;

-- Done!
SELECT 'Migration complete — all audit 5 changes applied.' AS result;
