// ============================================================
// STEALTH & TRAP TYPES — Stealth checks, alert system, traps, locks
// Reference: STEALTH-AND-TRAPS.md
// ============================================================

import type { AbilityName } from './character';
import type { DamageType } from './combat';

// ---- Enums & Union Types ----

export type AlertLevel = 'unaware' | 'suspicious' | 'alert' | 'alarmed' | 'lockdown';
export type TrapCategory = 'mechanical' | 'magical' | 'natural' | 'creature' | 'environmental' | 'alarm';
export type TrapTier = 'minor' | 'moderate' | 'dangerous' | 'deadly' | 'legendary';

// ---- Stealth ----

export interface StealthModifier {
  source: string;
  modifier: number;
  description: string;
}

export interface Observer {
  name: string;
  passivePerception: number;
  activelyLooking: boolean;
  alertLevel: AlertLevel;
}

export interface StealthCheck {
  characterId: string;
  stealthRoll: number;
  stealthBonus: number;
  stealthTotal: number;
  conditions: StealthModifier[];
  observers: Observer[];
  result: 'undetected' | 'suspicious' | 'detected';
  narration: string;
}

export interface AmbushSetup {
  ambushers: string[];
  position: string;
  triggerCondition: string;
  stealthChecks: { name: string; roll: number; total: number }[];
  surpriseRound: boolean;
  surprisedEnemies: string[];
  narration: string;
}

// ---- Traps ----

export interface TrapEffect {
  damageType?: DamageType;
  damageFormula?: string;
  savingThrowType?: AbilityName;
  savingThrowDC?: number;
  conditionApplied?: string;
  duration?: number; // Rounds
  description: string;
}

export interface Trap {
  id: string;
  name: string;
  type: TrapCategory;
  tier: TrapTier;

  // Detection & Disarm
  detectionDC: number;
  investigationDC: number;
  disarmDC: number;
  disarmMethod: string;
  alternativeBypass: string[];

  // Trigger & Effect
  triggerCondition: string;
  effect: TrapEffect;
  areaOfEffect?: string;

  // Properties
  resetable: boolean;
  magical: boolean;
  visible: boolean;
  salvageable: boolean;
  salvageResult?: string;

  // State
  isDetected: boolean;
  isDisarmed: boolean;
  isTriggered: boolean;

  description: string;
}

export interface PlayerTrap {
  id: string;
  name: string;
  type: TrapCategory;
  materialsRequired: string[];
  setupDC: number;
  effect: TrapEffect;
  duration: string;
  description: string;
}

// ---- Locks ----

export interface Lock {
  id: string;
  name: string;
  pickDC: number;
  forceDC: number; // STR check to break
  magicallySealed: boolean;
  bypassMethods: string[];
  trapAttached?: string; // Trap ID
  isLocked: boolean;
  isPicked: boolean;
  isBroken: boolean;
  description: string;
}

// ---- Infiltration ----

export interface InfiltrationState {
  alertLevel: AlertLevel;
  detectionEvents: { event: string; timestamp: string }[];
  stealthChecksMade: number;
  stealthChecksFailed: number;
  guardsAlerted: string[];
  routesRevealed: string[];
  objectivesCompleted: string[];
  escapeRoutes: string[];
}
