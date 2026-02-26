// ============================================================
// CONTEXT BUILDER SERVICE
// Fetches all data from Supabase and assembles DMContext
// Falls back to localStorage data when Supabase is unavailable
// ============================================================

import type { DMContext } from '@/lib/prompts/dm-system';
import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';
import type { Quest } from '@/lib/types/quest';
import type { NPC } from '@/lib/types/npc';
import type { CombatState } from '@/lib/types/combat';
import type { GameClock, Weather } from '@/lib/types/exploration';
import {
  getWorld,
  getCharacter,
  getRecentMessages,
  getWorldNPCs,
  getActiveQuests,
  getChronicle,
} from './database';

/**
 * Build DMContext from Supabase data.
 * Attempts to load from DB first, falls back to provided fallbacks.
 */
export async function buildContextFromDB(params: {
  worldId: string;
  characterId: string;
  // Fallback data (from client state / localStorage)
  fallbackWorld?: WorldRecord;
  fallbackCharacter?: Character;
  activeQuests?: Quest[];
  knownNPCs?: NPC[];
  combatState?: CombatState | null;
  gameClock?: GameClock;
  weather?: Weather;
}): Promise<DMContext> {
  // Attempt to load from Supabase — gracefully degrade if not configured
  let world: WorldRecord | null = null;
  let character: Character | null = null;
  let recentChronicle: string[] = [];
  let npcsFromDB: NPC[] = [];

  try {
    const [worldRow, charRow, npcRows, chronicleEntries] = await Promise.all([
      getWorld(params.worldId).catch(() => null),
      getCharacter(params.characterId).catch(() => null),
      getWorldNPCs(params.worldId).catch(() => []),
      getChronicle(params.characterId).catch(() => []),
    ]);

    if (worldRow) world = worldRow.world_data as WorldRecord;
    if (charRow) character = charRow.character_data as Character;
    npcsFromDB = npcRows.map((r) => r.npc_data as NPC);
    recentChronicle = chronicleEntries
      .slice(0, 10)
      .map(
        (e) => `Session ${e.session_number}: ${e.entry_data.title}`
      );
  } catch (err) {
    console.warn('Context builder: Supabase unavailable, using fallback data', err);
  }

  // Use DB data or fall back to provided data
  const finalWorld = world || params.fallbackWorld;
  const finalCharacter = character || params.fallbackCharacter;

  if (!finalWorld || !finalCharacter) {
    throw new Error('Cannot build DM context: missing world or character data');
  }

  // Merge NPCs: DB + client-provided (deduplicated by id)
  const allNPCs = [...npcsFromDB, ...(params.knownNPCs || [])];
  const uniqueNPCs = Array.from(
    new Map(allNPCs.map((n) => [n.id, n])).values()
  );

  // Default clock/weather if not provided
  const defaultClock: GameClock = {
    year: 1,
    month: 1,
    day: 1,
    hour: 9,
    timeOfDay: 'morning',
    calendarName: 'Standard Calendar',
    monthNames: ['Month 1'],
    weekLength: 7,
    dayNames: ['Day 1'],
    daysSinceStart: 1,
    currentSeason: 'spring',
  };

  const defaultWeather: Weather = {
    current: 'clear',
    temperature: 'mild',
    wind: 'calm',
    visibility: 'clear',
    duration: 8,
    travelModifier: 1.0,
    combatModifiers: [],
    perceptionModifier: 0,
    survivalDC: 5,
    narrativeDescription: 'A calm, clear day.',
  };

  return {
    world: finalWorld,
    character: finalCharacter,
    activeQuests: params.activeQuests || [],
    knownNPCs: uniqueNPCs,
    combatState: params.combatState ?? null,
    gameClock: params.gameClock || defaultClock,
    weather: params.weather || defaultWeather,
    recentChronicle,
    currentLocation: finalCharacter.currentLocation || 'Unknown',
  };
}

/**
 * Fetch recent message history for context window.
 * Returns messages in the format expected by the AI orchestrator.
 */
export async function getMessageHistory(
  characterId: string,
  limit: number = 50
): Promise<{ role: 'user' | 'assistant' | 'system'; content: string }[]> {
  try {
    const messages = await getRecentMessages(characterId, limit);
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  } catch {
    console.warn('Could not fetch message history from Supabase');
    return [];
  }
}
