// ============================================================
// SESSION TYPES — Session structure, chronicle, legacy, saves
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type { Character } from './character';
import type { WorldRecord } from './world';

// ---- Enums & Union Types ----

export type RecapStyle = 'narrator' | 'campfire' | 'journal' | 'bard-song' | 'dream';
export type HookType = 'immediate-danger' | 'new-discovery' | 'npc-approach' | 'quiet-moment' | 'time-skip';
export type SessionPhase = 'opening' | 'exploration' | 'rising-action' | 'climax' | 'resolution' | 'closing';

// ---- Interfaces ----

export interface SessionOpening {
  recap: {
    style: RecapStyle;
    content: string;
    keyEvents: string[];
    unresolvedThreads: string[];
    lastLocation: string;
    lastAction: string;
  };
  hook: {
    type: HookType;
    description: string;
    choices: string[];
  };
}

export interface PacingState {
  currentTension: number; // 0-100
  targetTensionCurve: number[];
  consecutiveCombats: number;
  consecutiveSocial: number;
  consecutiveExploration: number;
  timeSinceLastCombat: number; // Minutes of real play time
  timeSinceLastRest: number;
  playerHPPercentage: number;
  spellSlotsRemaining: number;
  healingPotionsRemaining: number;
  suggestedNextEncounterType: 'combat' | 'social' | 'exploration' | 'rest' | 'story';
}

export interface SessionStructure {
  sessionId: string;
  sessionNumber: number;
  characterId: string;
  startTime: string;
  endTime?: string;
  currentPhase: SessionPhase;
  pacingState: PacingState;

  // Counters
  encounterCount: number;
  restCount: number;
  combatEncountersThisSession: number;
  socialEncountersThisSession: number;
  explorationThisSession: number;

  // Duration tracking
  realTimeMinutes: number;
  inGameHoursElapsed: number;
}

export interface SessionClosing {
  summary: string;
  keyDecisions: string[];
  xpGained: number;
  itemsGained: string[];
  npcsEncountered: string[];
  questsProgressed: string[];
  cliffhanger?: string;
  nextSessionHook?: string;
  autoSaveCreated: boolean;
}

// ---- Chronicle System ----

export interface ChronicleEntry {
  id: string;
  characterId: string;
  sessionNumber: number;
  title: string;
  content: string;
  style: RecapStyle;
  keyEvents: string[];
  decisionsRecorded: string[];
  npcsInvolved: string[];
  locationsVisited: string[];
  combatsSummary: string[];
  itemsGainedOrLost: string[];
  createdAt: string;
}

export interface Chronicle {
  characterId: string;
  entries: ChronicleEntry[];
  totalSessions: number;
  totalPlayTimeMinutes: number;
  startDate: string;
}

// ---- Legacy & Hall of Heroes ----

export interface CharacterLegacy {
  characterId: string;
  characterName: string;
  characterClass: string;
  characterLevel: number;
  worldName: string;
  worldType: string;

  // Story summary
  epilogue: string; // AI-generated ending narrative
  finalTitle: string; // Earned title based on choices
  alignment: string;

  // Statistics
  totalSessions: number;
  totalPlayTimeMinutes: number;
  enemiesDefeated: number;
  questsCompleted: number;
  npcsRecruited: number;
  deathsSuffered: number; // If death mode allows respawn
  goldEarned: number;
  goldSpent: number;
  itemsCollected: number;
  secretsDiscovered: number;

  // Achievements
  achievements: Achievement[];

  // NG+ data
  legacyItems: string[]; // Item IDs that carry over
  legacyGold: number;
  discoveredRecipes: string[];
  mapKnowledge: string[]; // Region IDs explored
  worldChanges: string[]; // How the world was changed by this character

  // Display
  portraitUrl?: string;
  retiredAt: string;
  causeOfRetirement: 'completed' | 'retired' | 'died' | 'ascended';
}

export interface HallOfHeroesEntry {
  legacy: CharacterLegacy;
  displayOrder: number;
  isFavorite: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earnedAt: string;
  characterId: string;
}

// ---- New Game Plus ----

export interface NewGamePlusConfig {
  sourceCharacterId: string;
  carryoverItem?: string; // 1 item
  carryoverGold: number; // 10% of total
  carryoverRecipes: string[];
  carryoverMapKnowledge: string[];
  worldModifications: string[]; // Changes based on previous playthrough
  difficultyIncrease: number; // Multiplier on encounter difficulty
  newNGPlusLevel: number; // 1, 2, 3...
}

// ---- Save System ----

export type SaveType = 'auto' | 'quick' | 'manual';

export interface SaveState {
  id: string;
  characterId: string;
  saveType: SaveType;
  label?: string;

  // Complete game state snapshot
  character: Character;
  worldRecord: WorldRecord;
  messageCount: number;
  activeQuests: string[];
  currentLocation: string;
  inGameTime: string;

  // Metadata
  screenshotUrl?: string;
  createdAt: string;
  playTimeAtSave: number; // Minutes
}
