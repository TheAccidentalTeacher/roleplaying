// ============================================================
// COMBAT TYPES — Full tactical combat system
// Reference: BRAINSTORM.md (Combat System section)
// ============================================================

import type { AbilityName, Character, ActiveCondition, PartyMember } from './character';
import type { EnemyStatBlock } from './encounter';

// ---- Enums & Union Types ----

export type CombatMode = 'detailed' | 'quick';

export type CombatPhase =
  | 'idle'
  | 'initiative'
  | 'combat-active'
  | 'turn-start'
  | 'player-action'
  | 'action-resolution'
  | 'enemy-turn'
  | 'turn-end'
  | 'combat-end';

export type CombatActionType =
  | 'attack' | 'cast-spell' | 'use-item' | 'dodge' | 'dash'
  | 'disengage' | 'hide' | 'help' | 'ready' | 'grapple'
  | 'shove' | 'interact' | 'flee' | 'special';

export type DamageType =
  | 'slashing' | 'piercing' | 'bludgeoning'
  | 'fire' | 'cold' | 'lightning' | 'thunder'
  | 'acid' | 'poison' | 'necrotic' | 'radiant'
  | 'force' | 'psychic'
  | string;

export type CombatResult = 'victory' | 'defeat' | 'fled' | 'negotiated' | 'interrupted';

export type DeathMode = 'story' | 'normal' | 'hardcore' | 'ironman' | 'custom';

export type CombatDisplayMode = 'full-detailed' | 'quick-tactical';

// ---- Interfaces ----

export interface Initiative {
  entityId: string;
  entityName: string;
  entityType: 'player' | 'companion' | 'enemy';
  roll: number;
  modifier: number;
  total: number;
}

export interface CombatAction {
  type: CombatActionType;
  label: string;
  description: string;
  targetRequired: boolean;
  available: boolean;
  unavailableReason?: string;
  bonusAction?: boolean;
  resourceCost?: string;
}

export interface AttackRoll {
  d20: number;
  modifier: number;
  total: number;
  advantage: boolean;
  disadvantage: boolean;
  isCritical: boolean;
  isCriticalFail: boolean;
  targetAC: number;
  hits: boolean;
}

export interface DamageRoll {
  formula: string; // e.g. "2d6+3"
  rolls: number[];
  modifier: number;
  total: number;
  type: DamageType;
  isCritical: boolean;
}

export interface SavingThrowRoll {
  ability: AbilityName;
  d20: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  advantage: boolean;
  disadvantage: boolean;
}

export interface ActionResult {
  actorId: string;
  actorName: string;
  action: CombatActionType;
  targetId?: string;
  targetName?: string;
  attackRoll?: AttackRoll;
  damageRoll?: DamageRoll;
  savingThrow?: SavingThrowRoll;
  conditionApplied?: ActiveCondition;
  conditionRemoved?: string;
  narration: string; // AI-generated description of what happened
  hpChange?: { entityId: string; amount: number }[];
}

export interface CombatTurn {
  turnNumber: number;
  roundNumber: number;
  activeEntityId: string;
  activeEntityName: string;
  activeEntityType: 'player' | 'companion' | 'enemy';
  actions: ActionResult[];
  bonusActionUsed: boolean;
  reactionUsed: boolean;
  movementUsed: number;
}

export interface CombatRewards {
  xpEarned: number;
  goldFound: number;
  itemIds: string[]; // Items generated after combat
  questProgress?: string;
  narrativeOutcome: string;
}

export interface CombatState {
  id: string;
  mode: CombatMode;
  phase: CombatPhase;
  roundNumber: number;
  turnIndex: number; // Index into initiativeOrder

  // Participants
  playerCharacterId: string;
  companions: PartyMember[];
  enemies: EnemyStatBlock[];
  initiativeOrder: Initiative[];

  // Turn history
  turns: CombatTurn[];
  currentTurn?: CombatTurn;

  // Available actions for current turn
  availableActions: CombatAction[];

  // Environment
  terrainEffects: string[];
  environmentalHazards: string[];
  lightingCondition: 'bright' | 'dim' | 'darkness' | 'magical-darkness';

  // State tracking
  concentrationSpells: { casterId: string; spellName: string }[];
  deathMode: DeathMode;

  // Result (populated when combat ends)
  result?: CombatResult;
  rewards?: CombatRewards;
  narrationSummary?: string;

  // Metadata
  encounterName: string;
  startedAt: string;
  endedAt?: string;
}
