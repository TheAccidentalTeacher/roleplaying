// ============================================================
// REST & DOWNTIME TYPES — Short rest, long rest, camping, exhaustion
// Reference: SESSION-CHRONICLES.md, BRAINSTORM.md
// ============================================================

import type { Item } from './items';

// ---- Enums & Union Types ----

export type RestType = 'short' | 'long';
export type CampActivity =
  | 'talk'
  | 'study'
  | 'sharpen'
  | 'cook'
  | 'play_music'
  | 'journal'
  | 'meditate'
  | 'craft'
  | 'plan'
  | 'forage'
  | 'train'
  | 'repair'
  | 'pray'
  | 'keep_watch';

export type WatchEventType =
  | 'nothing'
  | 'strange_sound'
  | 'wandering_creature'
  | 'weather_change'
  | 'dream_vision'
  | 'npc_encounter'
  | 'ambush'
  | 'discovery';

export type DowntimeActivity =
  | 'training'
  | 'research'
  | 'crafting'
  | 'carousing'
  | 'recuperating'
  | 'pit_fighting'
  | 'gambling'
  | 'work'
  | 'shopping'
  | 'information_gathering';

// ---- Exhaustion ----

export interface ExhaustionState {
  level: number; // 0–6 (6 = death)
  effects: string[]; // Active effects at current level
  source: string; // What caused the exhaustion
}

// ---- Short Rest ----

export interface ShortRestResult {
  characterId: string;
  hitDiceSpent: number;
  hitDiceAvailable: number;
  hpRecovered: number;
  abilitiesRecharged: string[];
  interrupted: boolean;
  interruptionEvent?: string;
  narration: string;
}

// ---- Long Rest (5-Phase System) ----

export interface CampSetup {
  location: string;
  shelterType: 'none' | 'tent' | 'natural_cover' | 'building' | 'magical';
  campfireLit: boolean;
  wardingSpells: string[];
  concealment: 'none' | 'partial' | 'full';
  safetyRating: number; // 0-100
  availableActivities: CampActivity[];
}

export interface WatchShift {
  characterId: string;
  characterName: string;
  order: number; // 1st, 2nd, 3rd watch
  perceptionBonus: number;
  perceptionRoll?: number;
  event: WatchEvent | null;
}

export interface WatchEvent {
  type: WatchEventType;
  description: string;
  difficultyCheck?: { ability: string; dc: number };
  outcome?: string;
  combatTriggered: boolean;
  encounterId?: string;
}

export interface CampfireActivity {
  characterId: string;
  activity: CampActivity;
  description: string;
  result: string;
  mechanicalEffect?: string; // e.g., "+1 to next ability check"
  relationshipChanges?: { npcId: string; change: number }[];
  itemsProduced?: Item[];
}

export interface LongRestResult {
  characterId: string;

  // Phase 1: Camp setup
  camp: CampSetup;

  // Phase 2: Activities
  activities: CampfireActivity[];

  // Phase 3: Watch
  watches: WatchShift[];

  // Phase 4: Dreams
  dream?: {
    description: string;
    prophetic: boolean;
    hint?: string;
  };

  // Phase 5: Dawn
  hpRecovered: number;
  hitDiceRecovered: number;
  spellSlotsRecovered: boolean;
  abilitiesRecharged: string[];
  conditionsRemoved: string[];
  exhaustionReduced: number;

  interrupted: boolean;
  narration: string;
}

// ---- Training & Downtime ----

export interface TrainingSession {
  characterId: string;
  activity: DowntimeActivity;
  durationDays: number;
  goldCost: number;
  skillTrained?: string;
  progress: number; // 0-100
  result: string;
  rewards?: {
    xp?: number;
    gold?: number;
    items?: Item[];
    proficiencyGained?: string;
    abilityImprovement?: { ability: string; amount: number };
  };
}

export interface DowntimeResult {
  characterId: string;
  activity: DowntimeActivity;
  daysSpent: number;
  goldSpent: number;
  outcome: string;
  complications?: string;
  rewards?: {
    xp?: number;
    gold?: number;
    items?: Item[];
    reputation?: { faction: string; change: number };
    contacts?: string[];
    information?: string;
  };
}

// ---- Rest State (for store) ----

export interface RestState {
  isResting: boolean;
  restType: RestType | null;
  currentPhase: 'setup' | 'activities' | 'watch' | 'dreams' | 'dawn' | null;
  camp: CampSetup | null;
  activitiesCompleted: CampfireActivity[];
  watchSchedule: WatchShift[];
  result: ShortRestResult | LongRestResult | null;
}
