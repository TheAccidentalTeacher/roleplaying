// ============================================================
// ENCOUNTER TYPES — Threat assessment, enemy stat blocks, bosses
// Reference: ENCOUNTER-SYSTEM.md
// ============================================================

import type { AbilityName } from './character';
import type { DamageType } from './combat';
import type { ItemRarity } from './items';

// ---- Enums & Union Types ----

export type EncounterDifficulty = 'trivial' | 'easy' | 'moderate' | 'hard' | 'deadly' | 'epic' | 'legendary';

export type CreatureType =
  | 'humanoid' | 'beast' | 'undead' | 'construct' | 'aberration'
  | 'celestial' | 'dragon' | 'elemental' | 'fey' | 'fiend'
  | 'giant' | 'monstrosity' | 'ooze' | 'plant' | 'swarm'
  | string;

export type IntelligenceLevel = 'mindless' | 'animal' | 'low' | 'average' | 'high' | 'genius';

// ---- Interfaces ----

export interface ResourceCost {
  estimatedHPLoss: number; // Percentage
  estimatedManaSpent: number;
  estimatedAbilitiesUsed: number;
  estimatedItemsConsumed: number;
  estimatedHitDiceNeeded: number;
}

export interface ThreatAssessment {
  threatLevel: number; // 1-20
  difficulty: EncounterDifficulty;
  expectedRounds: number;
  expectedResourceCost: ResourceCost;
  partyWipeRisk: number; // 0-1
  narrativePurpose: string;
}

export interface EnemyAttack {
  name: string;
  type: 'melee' | 'ranged' | 'spell' | 'special';
  toHit: number;
  damage: string; // Dice formula
  damageType: DamageType;
  range?: string;
  properties?: string[];
  specialEffect?: string;
}

export interface SpecialAbility {
  name: string;
  description: string;
  rechargeOn?: string; // "5-6", "short rest", etc.
  uses?: number;
}

export interface Reaction {
  name: string;
  trigger: string;
  effect: string;
}

export interface TacticTrigger {
  condition: string;
  action: string;
}

export interface EnemyTactics {
  preferredRange: 'melee' | 'ranged' | 'mixed';
  targetPriority: 'weakest' | 'spellcaster' | 'healer' | 'closest' | 'random' | string;
  fleeThreshold: number;
  specialBehavior: string;
}

export interface BestiaryEntry {
  creatureKey: string;
  name: string;
  type: CreatureType;
  description: string;
  lore: string;
  habitat: string;
  behaviorNotes: string;
  imageUrl?: string;
  knowledgeTier: number; // 1-5, how much player has learned
  timesEncountered: number;
  timesDefeated: number;
  firstEncountered?: string;
}

export interface EnemyStatBlock {
  id: string;
  name: string;
  type: CreatureType;
  alignment?: string;
  level: number;
  hp: { current: number; max: number };
  ac: number;
  speed: string;

  // Ability scores
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  // Combat
  attacks: EnemyAttack[];
  specialAbilities: SpecialAbility[];
  reactions: Reaction[];

  // Defenses
  resistances: DamageType[];
  vulnerabilities: DamageType[];
  immunities: DamageType[];
  conditionImmunities: string[];
  savingThrowBonuses: Partial<Record<AbilityName, number>>;

  // Behavior
  tactics: EnemyTactics;
  morale: number; // 0-100
  moraleBreakpoint: number;
  intelligenceLevel: IntelligenceLevel;

  // Rewards
  threatContribution: number;
  xpValue: number;
  lootTable?: string;

  // Bestiary
  bestiary?: BestiaryEntry;
  isAlive: boolean;
}

// ---- Boss System ----

export interface BossPhase {
  phaseNumber: number;
  name: string;
  hpThreshold: number; // % HP to trigger this phase
  description: string;
  newAbilities: SpecialAbility[];
  removedAbilities: string[];
  statChanges: Partial<Record<'ac' | 'speed' | 'str' | 'dex', number>>;
  narration: string;
}

export interface LegendaryAction {
  name: string;
  cost: number; // 1-3
  description: string;
  effect: string;
}

export interface LairAction {
  name: string;
  description: string;
  effect: string;
  initiativeCount: number; // When in the round this triggers (usually 20)
}

export interface BossEnemy extends EnemyStatBlock {
  isBoss: true;
  phases: BossPhase[];
  currentPhase: number;
  legendaryActions: LegendaryAction[];
  legendaryActionsPerRound: number;
  legendaryResistances: number;
  lairActions?: LairAction[];
  bossMusic?: string;
  defeatCutscene: string;
}

// ---- Encounter Seeds ----

export interface EncounterSeed {
  id: string;
  name: string;
  description: string;
  difficulty: EncounterDifficulty;
  enemies: { concept: string; count: number; level: number }[];
  environment: string;
  specialConditions: string[];
  narrative: string;
  rewards: EncounterRewardSeed;
}

export interface EncounterRewardSeed {
  xpMultiplier: number;
  goldRange: { min: number; max: number };
  guaranteedDrops: string[];
  rarityWeights: Partial<Record<ItemRarity, number>>;
}

export interface ExplorationEncounterTable {
  regionId: string;
  regionDangerLevel: number;
  encounterWeights: {
    combat: number;
    social: number;
    environmental: number;
    discovery: number;
    nothing: number;
  };
  combatEncounters: EncounterSeed[];
  socialEncounters: EncounterSeed[];
}
