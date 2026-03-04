// ============================================================
// SAVED GAMES SERVICE — Multi-slot save/load/delete for game state
// Uses localStorage: index at 'ai-rpg-saves-index', 
//   full state at 'ai-rpg-save-{id}'
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
  createdAt: string;      // ISO date of first save
  lastPlayedAt: string;   // ISO date of most recent save/play
  playTimeEstimate: number; // rough estimate based on message count
}

// What we actually persist per slot
interface SavedGameData {
  preview: SavedGamePreview;
  state: PersistedState;
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
const INDEX_KEY = 'ai-rpg-saves-index';
const SAVE_PREFIX = 'ai-rpg-save-';
const ACTIVE_STORE_KEY = 'ai-rpg-storage';
const MAX_SAVES = 20;

// ---- Helpers ----

function getSaveKey(id: string): string {
  return `${SAVE_PREFIX}${id}`;
}

function generateId(): string {
  return `save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getIndex(): SavedGamePreview[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedGamePreview[];
  } catch {
    return [];
  }
}

function setIndex(index: SavedGamePreview[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

// ---- Read active store state from localStorage ----

function readActiveState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Zustand persist wraps state in { state: {...}, version: N }
    return (parsed?.state ?? parsed) as PersistedState;
  } catch {
    return null;
  }
}

function writeActiveState(state: PersistedState): void {
  // Read existing to preserve the version field
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

// ---- Build preview from state ----

function buildPreview(state: PersistedState, existingPreview?: Partial<SavedGamePreview>): Omit<SavedGamePreview, 'id'> {
  const activeChar = state.characters.find(c => c.id === state.activeCharacterId) ?? state.characters[0];
  const world = state.activeWorld;

  return {
    saveName: existingPreview?.saveName ?? (world?.worldName ? `${activeChar?.name ?? 'Hero'} in ${world.worldName}` : activeChar?.name ?? 'Unnamed Save'),
    worldName: world?.worldName ?? 'Unknown World',
    worldType: world?.worldType ?? 'unknown',
    primaryGenre: (world as unknown as Record<string, unknown>)?.primaryGenre as string ?? 'fantasy',
    characterName: activeChar?.name ?? 'Unknown',
    characterClass: activeChar?.class ?? 'Unknown',
    characterRace: activeChar?.race ?? 'Unknown',
    characterLevel: activeChar?.level ?? 1,
    currentLocation: state.currentLocation ?? 'Unknown',
    messageCount: state.messages?.length ?? 0,
    questCount: state.activeQuests?.length ?? 0,
    createdAt: existingPreview?.createdAt ?? new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    playTimeEstimate: Math.round((state.messages?.length ?? 0) * 0.5), // ~30s per message pair
  };
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * List all saved games, sorted by lastPlayedAt (newest first).
 */
export function listSavedGames(): SavedGamePreview[] {
  return getIndex().sort((a, b) => 
    new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
  );
}

/**
 * Get count of saved games.
 */
export function getSaveCount(): number {
  return getIndex().length;
}

/**
 * Check if there's an active game in progress (has character + messages).
 */
export function hasActiveGame(): boolean {
  const state = readActiveState();
  if (!state) return false;
  return (state.characters?.length > 0 && state.messages?.length > 0);
}

/**
 * Get a preview of the current active game (without saving it).
 */
export function getActiveGamePreview(): SavedGamePreview | null {
  const state = readActiveState();
  if (!state || !state.characters?.length) return null;
  return { id: '__active__', ...buildPreview(state) };
}

/**
 * Save the current active game to a new slot.
 * Returns the save ID.
 */
export function saveCurrentGame(customName?: string): string {
  const state = readActiveState();
  if (!state) throw new Error('No active game state to save');
  if (!state.characters?.length) throw new Error('No character in active game');

  const index = getIndex();
  if (index.length >= MAX_SAVES) {
    throw new Error(`Maximum ${MAX_SAVES} saves reached. Delete some old saves first.`);
  }

  const id = generateId();
  const preview: SavedGamePreview = {
    id,
    ...buildPreview(state, customName ? { saveName: customName } : undefined),
  };

  const saveData: SavedGameData = { preview, state };
  localStorage.setItem(getSaveKey(id), JSON.stringify(saveData));

  index.push(preview);
  setIndex(index);

  console.log(`[SavedGames] Saved game "${preview.saveName}" as ${id}`);
  return id;
}

/**
 * Overwrite an existing save slot with current game state.
 */
export function overwriteSave(saveId: string): void {
  const state = readActiveState();
  if (!state) throw new Error('No active game state to save');

  const index = getIndex();
  const existingIdx = index.findIndex(s => s.id === saveId);
  if (existingIdx === -1) throw new Error(`Save ${saveId} not found`);

  const existingPreview = index[existingIdx];
  const preview: SavedGamePreview = {
    id: saveId,
    ...buildPreview(state, existingPreview),
  };

  const saveData: SavedGameData = { preview, state };
  localStorage.setItem(getSaveKey(saveId), JSON.stringify(saveData));

  index[existingIdx] = preview;
  setIndex(index);

  console.log(`[SavedGames] Overwrote save "${preview.saveName}" (${saveId})`);
}

/**
 * Load a saved game into the active slot.
 * Returns the loaded state so the caller can apply it to the Zustand store.
 */
export function loadGame(saveId: string): PersistedState {
  const raw = localStorage.getItem(getSaveKey(saveId));
  if (!raw) throw new Error(`Save ${saveId} not found in storage`);

  const saveData = JSON.parse(raw) as SavedGameData;
  
  // Write to active store
  writeActiveState(saveData.state);

  // Update lastPlayedAt in index
  const index = getIndex();
  const idx = index.findIndex(s => s.id === saveId);
  if (idx !== -1) {
    index[idx].lastPlayedAt = new Date().toISOString();
    setIndex(index);
  }

  console.log(`[SavedGames] Loaded game "${saveData.preview.saveName}" (${saveId})`);
  return saveData.state;
}

/**
 * Delete a saved game.
 */
export function deleteGame(saveId: string): void {
  localStorage.removeItem(getSaveKey(saveId));
  
  const index = getIndex();
  const filtered = index.filter(s => s.id !== saveId);
  setIndex(filtered);

  console.log(`[SavedGames] Deleted save ${saveId}`);
}

/**
 * Rename a saved game.
 */
export function renameSave(saveId: string, newName: string): void {
  const index = getIndex();
  const idx = index.findIndex(s => s.id === saveId);
  if (idx === -1) throw new Error(`Save ${saveId} not found`);

  index[idx].saveName = newName;
  setIndex(index);

  // Also update the full save data
  const raw = localStorage.getItem(getSaveKey(saveId));
  if (raw) {
    const saveData = JSON.parse(raw) as SavedGameData;
    saveData.preview.saveName = newName;
    localStorage.setItem(getSaveKey(saveId), JSON.stringify(saveData));
  }
}

/**
 * Save current game (if exists) and clear active state for a new game.
 * This is the "archive & start fresh" flow.
 * Returns the save ID if a game was archived, null if there was nothing to save.
 */
export function archiveAndStartFresh(): string | null {
  const state = readActiveState();
  const hasGame = state && state.characters?.length > 0 && state.messages?.length > 0;

  let saveId: string | null = null;
  if (hasGame) {
    saveId = saveCurrentGame();
  }

  return saveId;
}

/**
 * Get the estimated localStorage usage for saves.
 */
export function getSaveStorageInfo(): { totalSaves: number; estimatedKB: number } {
  const index = getIndex();
  let totalBytes = 0;

  for (const save of index) {
    const raw = localStorage.getItem(getSaveKey(save.id));
    if (raw) totalBytes += raw.length * 2; // UTF-16
  }

  // Add index size
  const indexRaw = localStorage.getItem(INDEX_KEY);
  if (indexRaw) totalBytes += indexRaw.length * 2;

  return {
    totalSaves: index.length,
    estimatedKB: Math.round(totalBytes / 1024),
  };
}
