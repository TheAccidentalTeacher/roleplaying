// ============================================================
// DATABASE SERVICE — Typed CRUD for all Supabase tables
// ============================================================

import { getSupabaseAdmin } from './supabase';
import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';
import type { NPC } from '@/lib/types/npc';
import type { Item } from '@/lib/types/items';
import type { Quest } from '@/lib/types/quest';
import type { ChronicleEntry } from '@/lib/types/session';
import type { BestiaryEntry } from '@/lib/types/encounter';

// ---- Row Types (what Supabase stores) ----

interface WorldRow {
  id: string;
  user_id: string;
  world_name: string;
  world_data: WorldRecord;
  created_at: string;
  updated_at: string;
}

interface CharacterRow {
  id: string;
  world_id: string;
  user_id: string;
  character_data: Character;
  is_active: boolean;
  is_retired: boolean;
  play_time_minutes: number;
  session_count: number;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  character_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface NPCRow {
  id: string;
  world_id: string;
  npc_data: NPC;
  created_at: string;
  updated_at: string;
}

interface ItemRow {
  id: string;
  character_id: string;
  item_data: Item;
  is_equipped: boolean;
  equip_slot: string | null;
  created_at: string;
}

interface QuestRow {
  id: string;
  world_id: string;
  character_id: string;
  quest_data: Quest;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ImageRow {
  id: string;
  character_id: string;
  image_type: 'portrait' | 'npc' | 'item' | 'location' | 'scene';
  prompt: string;
  storage_path: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ChronicleRow {
  id: string;
  character_id: string;
  session_number: number;
  entry_data: ChronicleEntry;
  created_at: string;
}

interface SaveStateRow {
  id: string;
  character_id: string;
  save_type: 'auto' | 'quick' | 'manual';
  save_data: Record<string, unknown>;
  label: string | null;
  created_at: string;
}

interface BestiaryRow {
  id: string;
  character_id: string;
  creature_key: string;
  knowledge_tier: number;
  entry_data: BestiaryEntry;
  created_at: string;
  updated_at: string;
}

// ---- Helper ----

function db() {
  return getSupabaseAdmin();
}

function handleError(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
}

// ============================================================
// WORLDS
// ============================================================

export async function createWorld(userId: string, world: WorldRecord): Promise<WorldRow> {
  const result = await db()
    .from('worlds')
    .insert({
      user_id: userId,
      world_name: world.worldName,
      world_data: world as unknown as Record<string, unknown>,
    })
    .select()
    .single();
  handleError(result);
  return result.data as WorldRow;
}

export async function getWorld(worldId: string): Promise<WorldRow | null> {
  const result = await db().from('worlds').select('*').eq('id', worldId).single();
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as WorldRow;
}

export async function updateWorld(worldId: string, updates: Partial<WorldRecord>): Promise<void> {
  // Read current data, merge, then write — avoids partial overwrite of JSONB
  const existing = await getWorld(worldId);
  const merged = existing
    ? { ...(existing.world_data as unknown as Record<string, unknown>), ...(updates as unknown as Record<string, unknown>) }
    : updates;
  const result = await db()
    .from('worlds')
    .update({ world_data: merged as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq('id', worldId);
  handleError(result);
}

export async function listWorlds(userId: string): Promise<WorldRow[]> {
  const result = await db()
    .from('worlds')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  handleError(result);
  return (result.data as WorldRow[]) ?? [];
}

// ============================================================
// CHARACTERS
// ============================================================

export async function createCharacter(userId: string, worldId: string, character: Character): Promise<CharacterRow> {
  const result = await db()
    .from('characters')
    .insert({
      world_id: worldId,
      user_id: userId,
      character_data: character as unknown as Record<string, unknown>,
    })
    .select()
    .single();
  handleError(result);
  return result.data as CharacterRow;
}

export async function getCharacter(characterId: string): Promise<CharacterRow | null> {
  const result = await db().from('characters').select('*').eq('id', characterId).single();
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as CharacterRow;
}

export async function updateCharacter(characterId: string, updates: Partial<Character>): Promise<void> {
  // Read current data, merge, then write — avoids partial overwrite of JSONB
  const existing = await getCharacter(characterId);
  const merged = existing
    ? { ...(existing.character_data as unknown as Record<string, unknown>), ...(updates as unknown as Record<string, unknown>) }
    : updates;
  const result = await db()
    .from('characters')
    .update({
      character_data: merged as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('id', characterId);
  handleError(result);
}

export async function listCharacters(userId: string, worldId?: string): Promise<CharacterRow[]> {
  let query = db()
    .from('characters')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (worldId) {
    query = query.eq('world_id', worldId);
  }

  const result = await query;
  handleError(result);
  return (result.data as CharacterRow[]) ?? [];
}

export async function retireCharacter(characterId: string): Promise<void> {
  const result = await db()
    .from('characters')
    .update({ is_retired: true, is_active: false, updated_at: new Date().toISOString() })
    .eq('id', characterId);
  handleError(result);
}

export async function deleteCharacter(characterId: string): Promise<void> {
  const result = await db().from('characters').delete().eq('id', characterId);
  handleError(result);
}

export async function incrementPlayTime(characterId: string, minutes: number): Promise<void> {
  const row = await getCharacter(characterId);
  if (!row) return;
  const result = await db()
    .from('characters')
    .update({
      play_time_minutes: (row.play_time_minutes ?? 0) + minutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', characterId);
  handleError(result);
}

export async function incrementSessionCount(characterId: string): Promise<void> {
  const row = await getCharacter(characterId);
  if (!row) return;
  const result = await db()
    .from('characters')
    .update({
      session_count: (row.session_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', characterId);
  handleError(result);
}

// ============================================================
// MESSAGES
// ============================================================

export async function saveMessage(
  characterId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, unknown>
): Promise<MessageRow> {
  const result = await db()
    .from('messages')
    .insert({ character_id: characterId, role, content, metadata: metadata ?? null })
    .select()
    .single();
  handleError(result);
  return result.data as MessageRow;
}

export async function getMessages(characterId: string): Promise<MessageRow[]> {
  const result = await db()
    .from('messages')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true });
  handleError(result);
  return (result.data as MessageRow[]) ?? [];
}

export async function getRecentMessages(characterId: string, limit: number = 50): Promise<MessageRow[]> {
  const result = await db()
    .from('messages')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false })
    .limit(limit);
  handleError(result);
  // Reverse to get chronological order
  return ((result.data as MessageRow[]) ?? []).reverse();
}

// ============================================================
// NPCs
// ============================================================

export async function createNPC(worldId: string, npc: NPC): Promise<NPCRow> {
  const result = await db()
    .from('npcs')
    .insert({ world_id: worldId, npc_data: npc as unknown as Record<string, unknown> })
    .select()
    .single();
  handleError(result);
  return result.data as NPCRow;
}

export async function getNPC(npcId: string): Promise<NPCRow | null> {
  const result = await db().from('npcs').select('*').eq('id', npcId).single();
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as NPCRow;
}

export async function updateNPC(npcId: string, npc: Partial<NPC>): Promise<void> {
  // Read current data, merge, then write — avoids partial overwrite of JSONB
  const existing = await getNPC(npcId);
  const merged = existing
    ? { ...(existing.npc_data as unknown as Record<string, unknown>), ...(npc as unknown as Record<string, unknown>) }
    : npc;
  const result = await db()
    .from('npcs')
    .update({ npc_data: merged as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq('id', npcId);
  handleError(result);
}

export async function getWorldNPCs(worldId: string): Promise<NPCRow[]> {
  const result = await db()
    .from('npcs')
    .select('*')
    .eq('world_id', worldId)
    .order('created_at', { ascending: true });
  handleError(result);
  return (result.data as NPCRow[]) ?? [];
}

// ============================================================
// ITEMS
// ============================================================

export async function saveItem(characterId: string, item: Item, isEquipped: boolean = false, equipSlot?: string): Promise<ItemRow> {
  const result = await db()
    .from('items')
    .insert({
      character_id: characterId,
      item_data: item as unknown as Record<string, unknown>,
      is_equipped: isEquipped,
      equip_slot: equipSlot ?? null,
    })
    .select()
    .single();
  handleError(result);
  return result.data as ItemRow;
}

export async function getInventory(characterId: string): Promise<ItemRow[]> {
  const result = await db()
    .from('items')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true });
  handleError(result);
  return (result.data as ItemRow[]) ?? [];
}

export async function updateItem(itemId: string, updates: { item_data?: Item; is_equipped?: boolean; equip_slot?: string | null }): Promise<void> {
  const result = await db().from('items').update(updates as Record<string, unknown>).eq('id', itemId);
  handleError(result);
}

export async function deleteItem(itemId: string): Promise<void> {
  const result = await db().from('items').delete().eq('id', itemId);
  handleError(result);
}

// ============================================================
// QUESTS
// ============================================================

export async function createQuest(worldId: string, characterId: string, quest: Quest): Promise<QuestRow> {
  const result = await db()
    .from('quests')
    .insert({
      world_id: worldId,
      character_id: characterId,
      quest_data: quest as unknown as Record<string, unknown>,
      status: quest.status ?? 'available',
    })
    .select()
    .single();
  handleError(result);
  return result.data as QuestRow;
}

export async function getQuest(questId: string): Promise<QuestRow | null> {
  const result = await db().from('quests').select('*').eq('id', questId).single();
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as QuestRow;
}

export async function updateQuest(questId: string, quest: Partial<Quest>, status?: string): Promise<void> {
  // Read current data, merge, then write — avoids partial overwrite of JSONB
  const existing = await getQuest(questId);
  const mergedData = existing
    ? { ...(existing.quest_data as unknown as Record<string, unknown>), ...(quest as unknown as Record<string, unknown>) }
    : quest;
  const update: Record<string, unknown> = {
    quest_data: mergedData as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };
  if (status) update.status = status;
  const result = await db().from('quests').update(update).eq('id', questId);
  handleError(result);
}

export async function getActiveQuests(characterId: string): Promise<QuestRow[]> {
  const result = await db()
    .from('quests')
    .select('*')
    .eq('character_id', characterId)
    .in('status', ['available', 'active', 'in_progress'])
    .order('updated_at', { ascending: false });
  handleError(result);
  return (result.data as QuestRow[]) ?? [];
}

export async function getWorldQuests(worldId: string): Promise<QuestRow[]> {
  const result = await db()
    .from('quests')
    .select('*')
    .eq('world_id', worldId)
    .order('created_at', { ascending: true });
  handleError(result);
  return (result.data as QuestRow[]) ?? [];
}

// ============================================================
// IMAGES
// ============================================================

export async function saveImageRecord(
  characterId: string,
  imageType: ImageRow['image_type'],
  prompt: string,
  storagePath: string,
  metadata?: Record<string, unknown>
): Promise<ImageRow> {
  const result = await db()
    .from('images')
    .insert({
      character_id: characterId,
      image_type: imageType,
      prompt,
      storage_path: storagePath,
      metadata: metadata ?? null,
    })
    .select()
    .single();
  handleError(result);
  return result.data as ImageRow;
}

export async function getImages(characterId: string, imageType?: ImageRow['image_type']): Promise<ImageRow[]> {
  let query = db()
    .from('images')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false });

  if (imageType) {
    query = query.eq('image_type', imageType);
  }

  const result = await query;
  handleError(result);
  return (result.data as ImageRow[]) ?? [];
}

// ============================================================
// CHRONICLE
// ============================================================

export async function saveChronicleEntry(characterId: string, sessionNumber: number, entry: ChronicleEntry): Promise<ChronicleRow> {
  const result = await db()
    .from('chronicle_entries')
    .insert({
      character_id: characterId,
      session_number: sessionNumber,
      entry_data: entry as unknown as Record<string, unknown>,
    })
    .select()
    .single();
  handleError(result);
  return result.data as ChronicleRow;
}

export async function getChronicle(characterId: string): Promise<ChronicleRow[]> {
  const result = await db()
    .from('chronicle_entries')
    .select('*')
    .eq('character_id', characterId)
    .order('session_number', { ascending: true });
  handleError(result);
  return (result.data as ChronicleRow[]) ?? [];
}

// ============================================================
// SAVE STATES
// ============================================================

export async function createSave(characterId: string, saveType: 'auto' | 'quick' | 'manual', saveData: Record<string, unknown>, label?: string, localId?: string): Promise<SaveStateRow> {
  const result = await db()
    .from('save_states')
    .insert({
      character_id: characterId,
      save_type: saveType,
      save_data: saveData,
      label: label ?? null,
      local_id: localId ?? null,
    })
    .select()
    .single();
  handleError(result);
  return result.data as SaveStateRow;
}

export async function loadSave(saveId: string): Promise<SaveStateRow | null> {
  // Try by UUID first, then by local_id
  let result = await db().from('save_states').select('*').eq('id', saveId).single();
  if (result.error && result.error.message.includes('No rows')) {
    result = await db().from('save_states').select('*').eq('local_id', saveId).single();
  }
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as SaveStateRow;
}

export async function listSaves(characterId: string): Promise<SaveStateRow[]> {
  const result = await db()
    .from('save_states')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false });
  handleError(result);
  return (result.data as SaveStateRow[]) ?? [];
}

export async function deleteOldAutoSaves(characterId: string, keepCount: number = 5): Promise<void> {
  const allAutoSaves = await db()
    .from('save_states')
    .select('id')
    .eq('character_id', characterId)
    .eq('save_type', 'auto')
    .order('created_at', { ascending: false });

  if (!allAutoSaves.data || allAutoSaves.data.length <= keepCount) return;

  const idsToDelete = allAutoSaves.data.slice(keepCount).map((r: { id: string }) => r.id);
  await db().from('save_states').delete().in('id', idsToDelete);
}

export async function deleteSave(saveId: string): Promise<void> {
  const result = await db().from('save_states').delete().eq('id', saveId);
  handleError(result);
}

// ============================================================
// BESTIARY
// ============================================================

export async function saveBestiaryEntry(characterId: string, creatureKey: string, entry: BestiaryEntry, knowledgeTier: number = 1): Promise<BestiaryRow> {
  const result = await db()
    .from('bestiary')
    .insert({
      character_id: characterId,
      creature_key: creatureKey,
      knowledge_tier: knowledgeTier,
      entry_data: entry as unknown as Record<string, unknown>,
    })
    .select()
    .single();
  handleError(result);
  return result.data as BestiaryRow;
}

export async function getBestiaryEntry(characterId: string, creatureKey: string): Promise<BestiaryRow | null> {
  const result = await db()
    .from('bestiary')
    .select('*')
    .eq('character_id', characterId)
    .eq('creature_key', creatureKey)
    .single();
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as BestiaryRow;
}

export async function updateBestiaryEntry(id: string, entry: Partial<BestiaryEntry>, knowledgeTier?: number): Promise<void> {
  // Read current data, merge, then write — avoids partial overwrite of JSONB
  // Look up existing entry by id
  const existingResult = await db().from('bestiary').select('*').eq('id', id).single();
  const existing = existingResult.data as BestiaryRow | null;
  const mergedData = existing
    ? { ...(existing.entry_data as unknown as Record<string, unknown>), ...(entry as unknown as Record<string, unknown>) }
    : entry;
  const update: Record<string, unknown> = {
    entry_data: mergedData as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  };
  if (knowledgeTier !== undefined) update.knowledge_tier = knowledgeTier;
  const result = await db().from('bestiary').update(update).eq('id', id);
  handleError(result);
}

export async function getBestiary(characterId: string): Promise<BestiaryRow[]> {
  const result = await db()
    .from('bestiary')
    .select('*')
    .eq('character_id', characterId)
    .order('creature_key', { ascending: true });
  handleError(result);
  return (result.data as BestiaryRow[]) ?? [];
}

// ============================================================
// ADVENTURES — Full game state snapshots for cross-device save/load
// ============================================================

export interface AdventureRow {
  id: string;
  user_id: string;
  save_name: string;
  world_name: string;
  world_type: string;
  primary_genre: string;
  character_name: string;
  character_class: string;
  character_race: string;
  character_level: number;
  current_location: string;
  message_count: number;
  quest_count: number;
  game_state: Record<string, unknown>;
  created_at: string;
  last_played_at: string;
}

/** Preview type (no game_state blob) for listing */
export type AdventurePreview = Omit<AdventureRow, 'game_state'>;

export async function createAdventure(data: {
  userId?: string;
  saveName: string;
  worldName: string;
  worldType: string;
  primaryGenre: string;
  characterName: string;
  characterClass: string;
  characterRace: string;
  characterLevel: number;
  currentLocation: string;
  messageCount: number;
  questCount: number;
  gameState: Record<string, unknown>;
}): Promise<AdventureRow> {
  const result = await db()
    .from('adventures')
    .insert({
      user_id: data.userId ?? 'default',
      save_name: data.saveName,
      world_name: data.worldName,
      world_type: data.worldType,
      primary_genre: data.primaryGenre,
      character_name: data.characterName,
      character_class: data.characterClass,
      character_race: data.characterRace,
      character_level: data.characterLevel,
      current_location: data.currentLocation,
      message_count: data.messageCount,
      quest_count: data.questCount,
      game_state: data.gameState,
    })
    .select()
    .single();
  handleError(result);
  return result.data as AdventureRow;
}

export async function listAdventures(userId: string = 'default'): Promise<AdventurePreview[]> {
  const result = await db()
    .from('adventures')
    .select('id, user_id, save_name, world_name, world_type, primary_genre, character_name, character_class, character_race, character_level, current_location, message_count, quest_count, created_at, last_played_at')
    .eq('user_id', userId)
    .order('last_played_at', { ascending: false });
  handleError(result);
  return (result.data as AdventurePreview[]) ?? [];
}

export async function loadAdventure(adventureId: string): Promise<AdventureRow | null> {
  const result = await db()
    .from('adventures')
    .select('*')
    .eq('id', adventureId)
    .single();
  if (result.error && result.error.message.includes('No rows')) return null;
  handleError(result);
  return result.data as AdventureRow;
}

export async function updateAdventure(adventureId: string, updates: {
  saveName?: string;
  worldName?: string;
  characterLevel?: number;
  currentLocation?: string;
  messageCount?: number;
  questCount?: number;
  gameState?: Record<string, unknown>;
  lastPlayedAt?: string;
}): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (updates.saveName !== undefined) updateData.save_name = updates.saveName;
  if (updates.worldName !== undefined) updateData.world_name = updates.worldName;
  if (updates.characterLevel !== undefined) updateData.character_level = updates.characterLevel;
  if (updates.currentLocation !== undefined) updateData.current_location = updates.currentLocation;
  if (updates.messageCount !== undefined) updateData.message_count = updates.messageCount;
  if (updates.questCount !== undefined) updateData.quest_count = updates.questCount;
  if (updates.gameState !== undefined) updateData.game_state = updates.gameState;
  if (updates.lastPlayedAt !== undefined) updateData.last_played_at = updates.lastPlayedAt;
  else updateData.last_played_at = new Date().toISOString();

  const result = await db().from('adventures').update(updateData).eq('id', adventureId);
  handleError(result);
}

export async function deleteAdventure(adventureId: string): Promise<void> {
  const result = await db().from('adventures').delete().eq('id', adventureId);
  handleError(result);
}

export async function countAdventures(userId: string = 'default'): Promise<number> {
  const result = await db()
    .from('adventures')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  handleError(result);
  return result.count ?? 0;
}

