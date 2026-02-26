// ============================================================
// CHRONICLE ENGINE
// Generates session summaries, creates chronicle entries,
// and manages the narrative history of a character.
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type {
  ChronicleEntry,
  Chronicle,
  RecapStyle,
  SessionOpening,
  SessionClosing,
  PacingState,
} from '@/lib/types/session';
import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';

// ---- Build recap prompt for session opening ----

export function buildRecapPrompt(
  chronicle: Chronicle,
  character: Character,
  world: WorldRecord,
  style: RecapStyle = 'narrator'
): string {
  const lastEntry = chronicle.entries[chronicle.entries.length - 1];

  return `Generate a session opening recap in the "${style}" style. Return ONLY valid JSON.

STYLE GUIDE:
- narrator: Third-person omniscient, dramatic, sets atmosphere
- campfire: Warm, retrospective, as if told around a fire
- journal: First-person, character's own writing
- bard-song: Poetic, rhythmic, epic in tone
- dream: Surreal, fragmented, foreshadowing

PREVIOUS SESSION SUMMARY:
${lastEntry ? lastEntry.content : 'This is the first session.'}

KEY UNRESOLVED THREADS:
${lastEntry ? lastEntry.keyEvents.join(', ') : 'None yet, fresh adventure.'}

CHARACTER: ${character.name}, Level ${character.level} ${character.class}
WORLD: ${world.worldName} (${world.primaryGenre})
LAST LOCATION: ${character.currentLocation}

JSON schema:
{
  "recap": {
    "style": "${style}",
    "content": "2-3 paragraph recap",
    "keyEvents": ["event1", "event2"],
    "unresolvedThreads": ["thread1"],
    "lastLocation": "${character.currentLocation}",
    "lastAction": "what the character was doing"
  },
  "hook": {
    "type": "immediate-danger|new-discovery|npc-approach|quiet-moment|time-skip",
    "description": "1-2 sentences setting up the new session",
    "choices": ["option 1", "option 2", "option 3"]
  }
}`;
}

// ---- Build chronicle entry prompt ----

export function buildChronicleEntryPrompt(
  events: string[],
  decisions: string[],
  npcs: string[],
  locations: string[],
  combats: string[],
  items: string[],
  character: Character,
  style: RecapStyle = 'narrator'
): string {
  return `Summarize this RPG session as a chronicle entry in the "${style}" style. Return ONLY valid JSON.

KEY EVENTS: ${events.join('; ')}
DECISIONS MADE: ${decisions.join('; ')}
NPCS INTERACTED WITH: ${npcs.join(', ')}
LOCATIONS VISITED: ${locations.join(', ')}
COMBATS: ${combats.join('; ')}
ITEMS GAINED/LOST: ${items.join(', ')}
CHARACTER: ${character.name}, Level ${character.level} ${character.class}

Write a compelling 2-4 paragraph summary. The title should be evocative.

JSON schema:
{
  "title": "evocative session title",
  "content": "2-4 paragraph summary in ${style} style"
}`;
}

// ---- Parse AI recap response ----

export function parseRecapResponse(json: Record<string, unknown>): SessionOpening {
  const recap = json.recap as Record<string, unknown> | undefined;
  const hook = json.hook as Record<string, unknown> | undefined;

  return {
    recap: {
      style: (recap?.style as RecapStyle) || 'narrator',
      content: (recap?.content as string) || 'The adventure continues...',
      keyEvents: (recap?.keyEvents as string[]) || [],
      unresolvedThreads: (recap?.unresolvedThreads as string[]) || [],
      lastLocation: (recap?.lastLocation as string) || 'Unknown',
      lastAction: (recap?.lastAction as string) || 'resting',
    },
    hook: {
      type: (hook?.type as SessionOpening['hook']['type']) || 'quiet-moment',
      description: (hook?.description as string) || 'A new day begins.',
      choices: (hook?.choices as string[]) || [],
    },
  };
}

// ---- Create a chronicle entry ----

export function createChronicleEntry(params: {
  characterId: string;
  sessionNumber: number;
  title: string;
  content: string;
  style?: RecapStyle;
  events?: string[];
  decisions?: string[];
  npcs?: string[];
  locations?: string[];
  combats?: string[];
  items?: string[];
}): ChronicleEntry {
  return {
    id: `chronicle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    characterId: params.characterId,
    sessionNumber: params.sessionNumber,
    title: params.title,
    content: params.content,
    style: params.style || 'narrator',
    keyEvents: params.events || [],
    decisionsRecorded: params.decisions || [],
    npcsInvolved: params.npcs || [],
    locationsVisited: params.locations || [],
    combatsSummary: params.combats || [],
    itemsGainedOrLost: params.items || [],
    createdAt: new Date().toISOString(),
  };
}

// ---- Initialize a new chronicle ----

export function initChronicle(characterId: string): Chronicle {
  return {
    characterId,
    entries: [],
    totalSessions: 0,
    totalPlayTimeMinutes: 0,
    startDate: new Date().toISOString(),
  };
}

// ---- Add entry to chronicle ----

export function addChronicleEntry(
  chronicle: Chronicle,
  entry: ChronicleEntry
): Chronicle {
  return {
    ...chronicle,
    entries: [...chronicle.entries, entry],
    totalSessions: chronicle.totalSessions + 1,
  };
}

// ---- Build session closing summary prompt ----

export function buildSessionClosingPrompt(
  events: string[],
  character: Character,
  world: WorldRecord
): string {
  return `Generate a session closing summary. Return ONLY valid JSON.

CHARACTER: ${character.name}, Level ${character.level} ${character.class}
WORLD: ${world.worldName}
SESSION EVENTS: ${events.join('; ')}

JSON schema:
{
  "summary": "2-3 sentence summary of the session",
  "keyDecisions": ["decision 1", "decision 2"],
  "cliffhanger": "optional dramatic tease for next session or null",
  "nextSessionHook": "optional setup for next session or null"
}`;
}

// ---- Parse session closing response ----

export function parseSessionClosing(
  json: Record<string, unknown>,
  xpGained: number,
  itemsGained: string[],
  npcsEncountered: string[],
  questsProgressed: string[]
): SessionClosing {
  return {
    summary: (json.summary as string) || 'Another session comes to a close.',
    keyDecisions: (json.keyDecisions as string[]) || [],
    xpGained,
    itemsGained,
    npcsEncountered,
    questsProgressed,
    cliffhanger: json.cliffhanger as string | undefined,
    nextSessionHook: json.nextSessionHook as string | undefined,
    autoSaveCreated: true,
  };
}

// ---- Pacing state helpers ----

export function initPacingState(): PacingState {
  return {
    currentTension: 20,
    targetTensionCurve: [20, 30, 50, 70, 90, 60, 30],
    consecutiveCombats: 0,
    consecutiveSocial: 0,
    consecutiveExploration: 0,
    timeSinceLastCombat: 0,
    timeSinceLastRest: 0,
    playerHPPercentage: 100,
    spellSlotsRemaining: 0,
    healingPotionsRemaining: 0,
    suggestedNextEncounterType: 'exploration',
  };
}

export function updatePacing(
  state: PacingState,
  encounterType: 'combat' | 'social' | 'exploration' | 'rest',
  playerHPPercent: number,
  spellSlots: number,
  potions: number
): PacingState {
  const updated = { ...state };

  updated.playerHPPercentage = playerHPPercent;
  updated.spellSlotsRemaining = spellSlots;
  updated.healingPotionsRemaining = potions;

  if (encounterType === 'combat') {
    updated.consecutiveCombats += 1;
    updated.consecutiveSocial = 0;
    updated.consecutiveExploration = 0;
    updated.timeSinceLastCombat = 0;
    updated.currentTension = Math.min(100, updated.currentTension + 20);
  } else if (encounterType === 'social') {
    updated.consecutiveSocial += 1;
    updated.consecutiveCombats = 0;
    updated.consecutiveExploration = 0;
    updated.currentTension = Math.max(10, updated.currentTension - 10);
  } else if (encounterType === 'exploration') {
    updated.consecutiveExploration += 1;
    updated.consecutiveCombats = 0;
    updated.consecutiveSocial = 0;
    updated.currentTension = Math.max(15, updated.currentTension - 5);
  } else if (encounterType === 'rest') {
    updated.consecutiveCombats = 0;
    updated.timeSinceLastRest = 0;
    updated.currentTension = Math.max(5, updated.currentTension - 25);
  }

  // Suggest next encounter type
  if (updated.playerHPPercentage < 25 || updated.consecutiveCombats >= 3) {
    updated.suggestedNextEncounterType = 'rest';
  } else if (updated.consecutiveSocial >= 3) {
    updated.suggestedNextEncounterType = 'combat';
  } else if (updated.consecutiveExploration >= 3) {
    updated.suggestedNextEncounterType = 'social';
  } else if (updated.timeSinceLastCombat > 30) {
    updated.suggestedNextEncounterType = 'combat';
  } else {
    updated.suggestedNextEncounterType = 'exploration';
  }

  return updated;
}
