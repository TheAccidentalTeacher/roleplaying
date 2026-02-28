// ============================================================
// SAVE SERVICE
// Auto-save, quick save, manual save, load, list, delete
// Primary: localStorage (instant, offline-capable)
// Secondary: Supabase via /api/saves (cloud backup, cross-device)
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type { CombatState } from '@/lib/types/combat';
import type { GameClock, Weather } from '@/lib/types/exploration';
import type { Quest } from '@/lib/types/quest';
import type { NPC } from '@/lib/types/npc';
import type { SaveState } from '@/lib/types/session';

// ---- Local Storage Keys ----

const SAVE_INDEX_KEY = 'rpg-save-index';
const SAVE_PREFIX = 'rpg-save-';

// ---- SavePayload combines everything needed to restore state ----

export interface SavePayload {
  character: Character;
  world: WorldRecord;
  combatState: CombatState | null;
  gameClock: GameClock | null;
  weather: Weather | null;
  quests: Quest[];
  npcs: NPC[];
  messages: Array<{ role: string; content: string }>;
}

// ---- Save Index (persisted in localStorage) ----

interface SaveIndex {
  saves: SaveState[];
}

function getSaveIndex(): SaveIndex {
  if (typeof window === 'undefined') return { saves: [] };
  try {
    const raw = localStorage.getItem(SAVE_INDEX_KEY);
    return raw ? JSON.parse(raw) : { saves: [] };
  } catch {
    return { saves: [] };
  }
}

function writeSaveIndex(index: SaveIndex): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(index));
}

// ---- Cloud Sync Helpers (fire-and-forget) ----

function syncToCloud(
  characterId: string,
  saveType: 'auto' | 'quick' | 'manual',
  payload: SavePayload,
  label: string,
  localId: string
): void {
  fetch('/api/saves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, saveType, payload, label, localId }),
  }).catch((err) => {
    console.warn('[save-service] Cloud sync failed (will retry on next save):', err.message);
  });
}

function deleteFromCloud(saveId: string): void {
  fetch(`/api/saves/${encodeURIComponent(saveId)}`, { method: 'DELETE' }).catch(() => {});
}

// ---- Save Functions ----

export function autoSave(payload: SavePayload): SaveState {
  return createSave(payload, 'auto', 'Auto Save');
}

export function quickSave(payload: SavePayload): SaveState {
  return createSave(payload, 'quick', 'Quick Save');
}

export function manualSave(payload: SavePayload, label: string): SaveState {
  return createSave(payload, 'manual', label);
}

function createSave(
  payload: SavePayload,
  type: 'auto' | 'quick' | 'manual',
  label: string
): SaveState {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const character = payload.character;

  const saveState: SaveState = {
    id,
    characterId: character.id,
    saveType: type,
    label,
    character: payload.character,
    worldRecord: payload.world,
    messageCount: payload.messages.length,
    activeQuests: payload.quests.map((q) => q.id),
    currentLocation: character.currentLocation,
    inGameTime: payload.gameClock
      ? `Day ${payload.gameClock.day}, ${payload.gameClock.hour}:00`
      : 'Unknown',
    createdAt: new Date().toISOString(),
    playTimeAtSave: 0,
  };

  // Store payload in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(SAVE_PREFIX + id, JSON.stringify(payload));
  }

  // Update index (keep max 50 saves, remove oldest autos if needed)
  const index = getSaveIndex();
  index.saves.unshift(saveState);

  // Limit auto-saves to 5
  const autoSaves = index.saves.filter((s) => s.saveType === 'auto');
  if (autoSaves.length > 5) {
    const toRemove = autoSaves.slice(5);
    for (const s of toRemove) {
      localStorage.removeItem(SAVE_PREFIX + s.id);
      index.saves = index.saves.filter((ss) => ss.id !== s.id);
    }
  }

  // Limit total saves to 50
  while (index.saves.length > 50) {
    const removed = index.saves.pop();
    if (removed) localStorage.removeItem(SAVE_PREFIX + removed.id);
  }

  writeSaveIndex(index);

  // Fire-and-forget cloud sync
  syncToCloud(character.id, type, payload, label, id);

  return saveState;
}

// ---- Load ----

export async function loadSave(saveId: string): Promise<SavePayload | null> {
  // 1) Try localStorage first (instant)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(SAVE_PREFIX + saveId);
      if (raw) return JSON.parse(raw) as SavePayload;
    } catch { /* fall through */ }
  }

  // 2) Fallback: try Supabase via API
  try {
    const res = await fetch(`/api/saves/${encodeURIComponent(saveId)}`);
    if (res.ok) {
      const row = await res.json();
      if (row?.save_data) {
        // Cache locally for next time
        if (typeof window !== 'undefined') {
          localStorage.setItem(SAVE_PREFIX + saveId, JSON.stringify(row.save_data));
        }
        return row.save_data as SavePayload;
      }
    }
  } catch (err) {
    console.warn('[save-service] Cloud load failed:', err);
  }

  return null;
}

// ---- List ----

export function listSaves(characterId?: string): SaveState[] {
  const index = getSaveIndex();
  if (characterId) {
    return index.saves.filter((s) => s.characterId === characterId);
  }
  return index.saves;
}

// ---- Delete ----

export function deleteSave(saveId: string): boolean {
  if (typeof window === 'undefined') return false;
  localStorage.removeItem(SAVE_PREFIX + saveId);
  const index = getSaveIndex();
  index.saves = index.saves.filter((s) => s.id !== saveId);
  writeSaveIndex(index);

  // Also delete from cloud
  deleteFromCloud(saveId);

  return true;
}

// ---- Delete All for Character ----

export function deleteAllSaves(characterId: string): number {
  const index = getSaveIndex();
  const toRemove = index.saves.filter((s) => s.characterId === characterId);
  for (const s of toRemove) {
    localStorage.removeItem(SAVE_PREFIX + s.id);
    deleteFromCloud(s.id);
  }
  index.saves = index.saves.filter((s) => s.characterId !== characterId);
  writeSaveIndex(index);
  return toRemove.length;
}

// ---- Has Any Save ----

export function hasSaves(): boolean {
  return getSaveIndex().saves.length > 0;
}

export function getMostRecentSave(characterId?: string): SaveState | null {
  const saves = listSaves(characterId);
  return saves.length > 0 ? saves[0] : null;
}
