// ============================================================
// TRAP ENGINE
// Trap generation, detection, disarming, triggering
// Reference: STEALTH-AND-TRAPS.md
// ============================================================

import type {
  Trap,
  TrapCategory,
  TrapTier,
  TrapEffect,
  PlayerTrap,
  Lock,
} from '@/lib/types/stealth';
import type { Character } from '@/lib/types/character';
import { d20, rollDamage } from '@/lib/utils/dice';

// ---- Trap Detection ----

export function detectTrap(
  character: Character,
  trap: Trap
): { detected: boolean; narration: string } {
  if (trap.isDetected || trap.isDisarmed || trap.isTriggered) {
    return { detected: trap.isDetected, narration: '' };
  }

  // Passive perception check
  const wisMod = character.abilityScores.wis.modifier;
  const profBonus = Math.ceil(character.level / 4) + 1;
  const hasPerception = character.skills.some(
    (s) => s.name.toLowerCase() === 'perception' && s.proficient
  );
  const passivePerception = 10 + wisMod + (hasPerception ? profBonus : 0);

  const detected = passivePerception >= trap.detectionDC;

  return {
    detected,
    narration: detected
      ? `You notice ${trap.visible ? 'a' : 'a hidden'} ${trap.name}! ${trap.description}`
      : '', // No narration if not detected — player doesn't know
  };
}

export function investigateTrap(
  character: Character,
  trap: Trap
): { success: boolean; details: string } {
  if (!trap.isDetected) {
    return { success: false, details: 'You don\'t notice anything unusual.' };
  }

  const intMod = character.abilityScores.int.modifier;
  const profBonus = Math.ceil(character.level / 4) + 1;
  const hasInvestigation = character.skills.some(
    (s) => s.name.toLowerCase() === 'investigation' && s.proficient
  );
  const rollVal = d20();
  const total = rollVal + intMod + (hasInvestigation ? profBonus : 0);

  if (total >= trap.investigationDC) {
    return {
      success: true,
      details: `${trap.description}. Disarm method: ${trap.disarmMethod}. DC ${trap.disarmDC}.${
        trap.alternativeBypass.length > 0
          ? ` Alternative: ${trap.alternativeBypass.join(', ')}.`
          : ''
      }`,
    };
  }

  return {
    success: false,
    details: 'You can tell it\'s dangerous, but you can\'t figure out exactly how it works.',
  };
}

// ---- Trap Disarming ----

export function disarmTrap(
  character: Character,
  trap: Trap
): { success: boolean; narration: string; triggered: boolean } {
  if (trap.isDisarmed) {
    return { success: true, narration: 'The trap is already disarmed.', triggered: false };
  }

  const dexMod = character.abilityScores.dex.modifier;
  const profBonus = Math.ceil(character.level / 4) + 1;
  const hasThievesTools = character.proficiencies.tools.some(
    (t) => t.toLowerCase().includes('thieves')
  );

  const rollVal = d20();
  const total = rollVal + dexMod + (hasThievesTools ? profBonus : 0);

  if (total >= trap.disarmDC) {
    return {
      success: true,
      narration: `You carefully disarm the ${trap.name}. ${
        trap.salvageable ? `You salvage: ${trap.salvageResult || 'some components'}.` : ''
      }`,
      triggered: false,
    };
  }

  // Failed by 5+ triggers the trap
  const triggered = total <= trap.disarmDC - 5;
  return {
    success: false,
    narration: triggered
      ? `Your clumsy attempt triggers the ${trap.name}!`
      : `You fail to disarm the ${trap.name}, but avoid triggering it.`,
    triggered,
  };
}

// ---- Trap Triggering ----

export function triggerTrap(
  trap: Trap,
  targetNames: string[]
): {
  damage: number;
  damageType: string;
  savingThrow?: { type: string; dc: number };
  conditionApplied?: string;
  narration: string;
} {
  const effect = trap.effect;
  let damage = 0;

  if (effect.damageFormula) {
    const result = rollDamage(effect.damageFormula);
    damage = result.total;
  }

  return {
    damage,
    damageType: effect.damageType || 'untyped',
    savingThrow: effect.savingThrowType
      ? { type: effect.savingThrowType, dc: effect.savingThrowDC || 13 }
      : undefined,
    conditionApplied: effect.conditionApplied,
    narration: `The ${trap.name} triggers! ${effect.description}${
      damage > 0 ? ` ${targetNames.join(' and ')} ${targetNames.length > 1 ? 'take' : 'takes'} ${damage} ${effect.damageType || ''} damage!` : ''
    }`,
  };
}

// ---- Player Trap Placement ----

export function placePlayerTrap(
  character: Character,
  trap: PlayerTrap
): { success: boolean; narration: string } {
  const dexMod = character.abilityScores.dex.modifier;
  const profBonus = Math.ceil(character.level / 4) + 1;
  const hasKit = character.proficiencies.tools.some(
    (t) => t.toLowerCase().includes('tinker') || t.toLowerCase().includes('trap')
  );

  const rollVal = d20();
  const total = rollVal + dexMod + (hasKit ? profBonus : 0);

  if (total >= trap.setupDC) {
    return {
      success: true,
      narration: `You set up your ${trap.name} successfully. It's well-hidden and ready to spring.`,
    };
  }

  return {
    success: false,
    narration: `You struggle to set the ${trap.name}. It might not work as intended.`,
  };
}

// ---- Lock Picking ----

export function pickLock(
  character: Character,
  lock: Lock
): { success: boolean; broken: boolean; narration: string } {
  if (!lock.isLocked) {
    return { success: true, broken: false, narration: 'The lock is already open.' };
  }

  if (lock.magicallySealed) {
    return {
      success: false,
      broken: false,
      narration: 'The lock glows with magical energy. Mundane tools won\'t work here.',
    };
  }

  const dexMod = character.abilityScores.dex.modifier;
  const profBonus = Math.ceil(character.level / 4) + 1;
  const hasThievesTools = character.proficiencies.tools.some(
    (t) => t.toLowerCase().includes('thieves')
  );

  const rollVal = d20();
  const total = rollVal + dexMod + (hasThievesTools ? profBonus : 0);

  if (total >= lock.pickDC) {
    return {
      success: true,
      broken: false,
      narration: 'With a satisfying click, the lock opens.',
    };
  }

  return {
    success: false,
    broken: rollVal === 1, // Natural 1 breaks lockpick
    narration:
      rollVal === 1
        ? 'Your lockpick snaps! You\'ll need another set of tools.'
        : 'The lock resists your attempts.',
  };
}

export function forceLock(
  character: Character,
  lock: Lock
): { success: boolean; narration: string } {
  if (!lock.isLocked) {
    return { success: true, narration: 'The lock is already open.' };
  }

  const strMod = character.abilityScores.str.modifier;
  const rollVal = d20();
  const total = rollVal + strMod;

  if (total >= lock.forceDC) {
    return {
      success: true,
      narration: 'With a mighty heave, you break the lock open! The noise echoes...',
    };
  }

  return {
    success: false,
    narration: 'The lock holds firm despite your efforts.',
  };
}

// ---- AI Prompt for Trap Generation ----

export function buildTrapGenerationPrompt(
  tier: TrapTier,
  category: TrapCategory,
  location: string
): string {
  return `Generate a ${tier} ${category} trap for location: "${location}".
Respond as JSON:
{
  "name": "string",
  "type": "${category}",
  "tier": "${tier}",
  "detectionDC": number,
  "investigationDC": number,
  "disarmDC": number,
  "disarmMethod": "how to safely disarm",
  "alternativeBypass": ["other ways to avoid"],
  "triggerCondition": "what triggers it",
  "effect": {
    "damageType": "fire|poison|piercing|etc",
    "damageFormula": "2d6|3d8|etc",
    "savingThrowType": "dex|con|etc",
    "savingThrowDC": number,
    "conditionApplied": "poisoned|restrained|etc or null",
    "description": "what happens when triggered"
  },
  "areaOfEffect": "5ft radius|10ft line|etc",
  "resetable": boolean,
  "magical": boolean,
  "visible": boolean,
  "salvageable": boolean,
  "salvageResult": "what you get if salvaged",
  "description": "1-2 sentence description when detected"
}`;
}
