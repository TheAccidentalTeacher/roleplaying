// ============================================================
// SAVED GAMES SERVICE â€” Cloud-backed adventure management
// ALL saves go through /api/adventures â†’ Supabase
// Works cross-device â€” no localStorage dependency
// ============================================================

import type { GameState } from '@/lib/store';

// ---- Types ----

export interface SavedGamePreview {
  id: string;
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
  createdAt: string;
  lastPlayedAt: string;
}

// The subset of GameState we persist (matches the partialize config in store.ts)
interface PersistedState {
  characters: GameState['characters'];
  activeCharacterId: GameState['activeCharacterId'];
  activeWorld: GameState['activeWorld'];
  activeWorldId: GameState['activeWorldId'];
  gameClock: GameState['gameClock'];
  weather: GameState['weather'];
  currentLocation: GameState['currentLocation'];
  messages: GameState['messages'];
  activeQuests: GameState['activeQuests'];
  knownNPCs: GameState['knownNPCs'];
  combatState: GameState['combatState'];
  sessionState: GameState['sessionState'];
  pacingState: GameState['pacingState'];
  uiState: { settings: GameState['uiState']['settings'] };
}

// ---- Constants ----
const ACTIVE_STORE_KEY = 'ai-rpg-storage';

// ---- Helpers ----

/** Read active state from the Zustand localStorage cache */
function readActiveState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed?.state ?? parsed) as PersistedState;
  } catch {
    return null;
  }
}

/** Write state into the Zustand localStorage cache (for loading) */
function writeActiveState(state: PersistedState): void {
  let wrapper: Record<string, unknown> = { state, version: 0 };
  try {
    const existing = localStorage.getItem(ACTIVE_STORE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed?.version !== undefined) {
        wrapper = { ...parsed, state };
      }
    }
  } catch { /* use default wrapper */ }
  localStorage.setItem(ACTIVE_STORE_KEY, JSON.stringify(wrapper));
}

/** Build preview metadata from state */
function buildPreviewFields(state: PersistedState, customName?: string) {
  const activeChar = state.characters.find(c => c.id === state.activeCharacterId) ?? state.characters[0];
  const world = state.activeWorld;
  const worldAny = world as unknown as Record<string, unknown> | null;

  return {
    saveName: customName ?? (world?.worldName ? `${activeChar?.name ?? 'Hero'} in ${world.worldName}` : activeChar?.name ?? 'Unnamed Save'),
    worldName: world?.worldName ?? 'Unknown World',
    worldType: world?.worldType ?? 'unknown',
    primaryGenre: (worldAny?.primaryGenre as string) ?? 'fantasy',
    characterName: activeChar?.name ?? 'Unknown',
    characterClass: activeChar?.class ?? 'Unknown',
    characterRace: activeChar?.race ?? 'Unknown',
    characterLevel: activeChar?.level ?? 1,
    currentLocation: state.currentLocation ?? 'Unknown',
    messageCount: state.messages?.length ?? 0,
    questCount: state.activeQuests?.length ?? 0,
  };
}

// ============================================================
// PUBLIC API â€” All async, all Supabase-backed
// ============================================================

/**
 * List all saved adventures from the cloud.
 */
export async function listSavedGames(userId: string = 'default'): Promise<SavedGamePreview[]> {
  const res = await fetch(`/api/adventures?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    console.error('[SavedGames] Failed to list:', res.status);
    return [];
  }
  const rows = await res.json();
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    saveName: r.save_name,
    worldName: r.world_name,
    worldType: r.world_type,
    primaryGenre: r.primary_genre,
    characterName: r.character_name,
    characterClass: r.character_class,
    characterRace: r.character_race,
    characterLevel: r.character_level,
    currentLocation: r.current_location,
    messageCount: r.message_count,
    questCount: r.quest_count,
    createdAt: r.created_at,
    lastPlayedAt: r.last_played_at,
  }));
}

/**
 * Check if there's an active game in progress locally.
 */
export function hasActiveGame(): boolean {
  const state = readActiveState();
  if (!state) return false;
  return (state.characters?.length > 0 && state.messages?.length > 0);
}

/**
 * Get a preview of the current active game (local state).
 */
export function getActiveGamePreview(): SavedGamePreview | null {
  const state = readActiveState();
  if (!state || !state.characters?.length) return null;
  const fields = buildPreviewFields(state);
  return {
    id: '__active__',
    ...fields,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
  };
}

/**
 * Save the current active game to a new cloud slot.
 */
export async function saveCurrentGame(customName?: string): Promise<string> {
  const state = readActiveState();
  if (!state) throw new Error('No active game state to save');
  if (!state.characters?.length) throw new Error('No character in active game');

  const fields = buildPreviewFields(state, customName);

  const res = await fetch('/api/adventures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, gameState: state }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).error ?? `Save failed (${res.status})`);
  }

  const data = await res.json();
  console.log(`[SavedGames] Saved adventure "${fields.saveName}" â†’ ${data.id}`);
  return data.id as string;
}

/**
 * Overwrite an existing save with current game state.
 */
export async function overwriteSave(saveId: string): Promise<void> {
  const state = readActiveState();
  if (!state) throw new Error('No active game state to save');

  const fields = buildPreviewFields(state);

  const res = await fetch(`/api/adventures/${encodeURIComponent(saveId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, gameState: state, lastPlayedAt: new Date().toISOString() }),
  });

  if (!res.ok) throw new Error(`Overwrite failed (${res.status})`);
  console.log(`[SavedGames] Overwrote adventure ${saveId}`);
}

/**
 * Load a saved game from the cloud into the active local slot.
 */
export async function loadGame(saveId: string): Promise<PersistedState> {
  const res = await fetch(`/api/adventures/${encodeURIComponent(saveId)}`);
  if (!res.ok) throw new Error(`Load failed (${res.status})`);

  const row = await res.json();
  const state = row.game_state as PersistedState;

  // Write to local Zustand store
  writeActiveState(state);

  // Update last_played_at in the cloud (fire-and-forget)
  fetch(`/api/adventures/${encodeURIComponent(saveId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lastPlayedAt: new Date().toISOString() }),
  }).catch(() => {});

  console.log(`[SavedGames] Loaded adventure ${saveId}`);
  return state;
}

/**
 * Delete a saved adventure from the cloud.
 */
export async function deleteGame(saveId: string): Promise<void> {
  const res = await fetch(`/api/adventures/${encodeURIComponent(saveId)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  console.log(`[SavedGames] Deleted adventure ${saveId}`);
}

/**
 * Rename a saved adventure in the cloud.
 */
export async function renameSave(saveId: string, newName: string): Promise<void> {
  const res = await fetch(`/api/adventures/${encodeURIComponent(saveId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saveName: newName }),
  });
  if (!res.ok) throw new Error(`Rename failed (${res.status})`);
}

/**
 * Archive current game to cloud and return save ID. Null if nothing to save.
 */
export async function archiveAndStartFresh(): Promise<string | null> {
  if (!hasActiveGame()) return null;
  try {
    return await saveCurrentGame();
  } catch (err) {
    console.warn('[SavedGames] Archive failed:', err);
    return null;
  }
}
