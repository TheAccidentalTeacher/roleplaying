// ============================================================
// QUEST TYPES — Quest architecture, story arcs, choices
// Reference: BRAINSTORM.md (Quest Architecture section)
// ============================================================

import type { Genre, NarrativeTone, WorldType } from './world';
import type { NPC } from './npc';
import type { ItemRarity } from './items';

// ---- Enums & Union Types ----

export type QuestType = 'main' | 'side' | 'genre' | 'personal' | 'faction' | 'companion';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'abandoned';

// ---- Interfaces ----

export interface QuestAct {
  actNumber: number;
  title: string;
  description: string;
  objectives: QuestObjective[];
  keyEvents: string[];
  isCompleted: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  isOptional: boolean;
  isCompleted: boolean;
  isHidden: boolean; // Revealed during play
  progress?: { current: number; target: number };
}

export interface Choice {
  id: string;
  description: string;
  madeAt: string; // timestamp
  consequences: string;
  wasReversible: boolean;
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  requirements: string; // What must be true for this ending
  tone: 'triumphant' | 'bittersweet' | 'tragic' | 'ambiguous' | 'hopeful';
  worldChanges: string[];
}

export interface LootProfile {
  rarityWeights: Partial<Record<ItemRarity, number>>;
  thematicTags: string[];
  guaranteedTypes?: string[];
  uniqueItemChance: number;
}

export interface Quest {
  id: string;
  worldId: string;
  characterId: string;
  type: QuestType;

  // Identity
  title: string;
  logline: string;
  fullDescription: string;
  secretTruth: string; // What's REALLY happening

  // Genre
  primaryGenre: Genre;
  subGenres: Genre[];
  worldType?: WorldType; // If it takes place in another world (genre quest)
  tone: NarrativeTone[];
  magicRules?: string; // Specific rules for this quest's world

  // Structure
  acts: QuestAct[];
  keyDecisionPoints: string[];
  possibleEndings: Ending[];

  // Special mechanics
  uniqueMechanics: string[];
  survivalRules?: string;

  // Connections
  feedsIntoMainQuest: boolean;
  unlocksWorlds?: string[];
  npcCarryover?: NPC[];
  lootProfile: LootProfile;

  // State
  status: QuestStatus;
  currentAct: number;
  choices: Choice[];
  outcome?: string; // Final result written by AI

  // Metadata
  createdAt: string;
  updatedAt: string;
}
