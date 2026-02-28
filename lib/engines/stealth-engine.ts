// ============================================================
// STEALTH ENGINE
// Stealth checks, detection, alert levels, ambush setup
// Reference: STEALTH-AND-TRAPS.md
// ============================================================

import type {
  StealthCheck,
  StealthModifier,
  Observer,
  AlertLevel,
  AmbushSetup,
  InfiltrationState,
} from '@/lib/types/stealth';
import type { Character } from '@/lib/types/character';
import { d20 } from '@/lib/utils/dice';
import { getProficiencyBonus } from '@/lib/utils/calculations';

// ---- Stealth Roll ----

export function calculateStealth(
  character: Character,
  extraModifiers: StealthModifier[] = []
): { roll: number; bonus: number; total: number; modifiers: StealthModifier[] } {
  const dexMod = character.abilityScores.dex.modifier;
  const profBonus = getProficiencyBonus(character.level);
  const hasStealth = character.skills.some(
    (s) => s.name.toLowerCase() === 'stealth' && s.proficient
  );

  const baseBonus = dexMod + (hasStealth ? profBonus : 0);

  // Armor penalty — only medium and heavy armor impose stealth penalties
  const armorModifiers: StealthModifier[] = [];
  if (character.equipment.chest) {
    const chestItem = character.inventory.find(
      (name) => name.toLowerCase() === (character.equipment.chest || '').toLowerCase()
    );
    const armorName = (chestItem || character.equipment.chest || '').toLowerCase();
    const isHeavy = /\b(plate|splint|chain\s?mail|ring\s?mail)\b/.test(armorName);
    const isMedium = /\b(half[- ]plate|breastplate|scale|hide|chain\s?shirt)\b/.test(armorName);
    if (isHeavy) {
      armorModifiers.push({
        source: 'armor',
        modifier: -5,
        description: 'Heavy armor stealth disadvantage (flat penalty)',
      });
    } else if (isMedium && !/\b(breastplate|half[- ]plate)\b/.test(armorName)) {
      // Scale mail, hide, and chain shirt impose disadvantage; breastplate/half-plate do not
      armorModifiers.push({
        source: 'armor',
        modifier: -2,
        description: 'Medium armor stealth penalty',
      });
    }
    // Light armor (leather, padded, studded leather) — no penalty
  }

  // Conditions
  const conditionMods: StealthModifier[] = [];
  if (character.conditions.some((c) => c.type === 'invisible')) {
    conditionMods.push({
      source: 'invisible',
      modifier: 5,
      description: 'Advantage from invisibility (flat +5)',
    });
  }

  const allModifiers = [...armorModifiers, ...conditionMods, ...extraModifiers];
  const totalBonus = baseBonus + allModifiers.reduce((sum, m) => sum + m.modifier, 0);
  const rollVal = d20();

  return {
    roll: rollVal,
    bonus: totalBonus,
    total: rollVal + totalBonus,
    modifiers: allModifiers,
  };
}

// ---- Detection Resolution ----

export function resolveDetection(
  stealthTotal: number,
  observers: Observer[],
  modifiers: StealthModifier[]
): StealthCheck {
  let worstResult: StealthCheck['result'] = 'undetected';

  for (const obs of observers) {
    const perception = obs.activelyLooking
      ? obs.passivePerception + 5 // Active search bonus
      : obs.passivePerception;

    if (stealthTotal < perception) {
      if (stealthTotal < perception - 5) {
        worstResult = 'detected';
        break;
      } else {
        worstResult = 'suspicious';
      }
    }
  }

  const narration =
    worstResult === 'undetected'
      ? 'You move unseen, your steps making no sound.'
      : worstResult === 'suspicious'
      ? 'Something catches an observer\'s attention. They glance your way but don\'t see you... yet.'
      : 'You\'ve been spotted! Cover is blown.';

  return {
    characterId: '',
    stealthRoll: stealthTotal - modifiers.reduce((s, m) => s + m.modifier, 0),
    stealthBonus: modifiers.reduce((s, m) => s + m.modifier, 0),
    stealthTotal,
    conditions: modifiers,
    observers,
    result: worstResult,
    narration,
  };
}

// ---- Alert Level Management ----

const ALERT_ESCALATION: Record<AlertLevel, AlertLevel> = {
  unaware: 'suspicious',
  suspicious: 'alert',
  alert: 'alarmed',
  alarmed: 'lockdown',
  lockdown: 'lockdown',
};

const ALERT_DEESCALATION: Record<AlertLevel, AlertLevel> = {
  unaware: 'unaware',
  suspicious: 'unaware',
  alert: 'suspicious',
  alarmed: 'alert',
  lockdown: 'alarmed',
};

export function escalateAlert(current: AlertLevel): AlertLevel {
  return ALERT_ESCALATION[current];
}

export function deescalateAlert(current: AlertLevel): AlertLevel {
  return ALERT_DEESCALATION[current];
}

export function getAlertEffects(level: AlertLevel): {
  guardBehavior: string;
  detectionModifier: number;
  encounterChanceModifier: number;
} {
  switch (level) {
    case 'unaware':
      return { guardBehavior: 'Patrols follow normal routes.', detectionModifier: 0, encounterChanceModifier: 0 };
    case 'suspicious':
      return { guardBehavior: 'Guards are more attentive. Occasional extra patrols.', detectionModifier: 2, encounterChanceModifier: 0.1 };
    case 'alert':
      return { guardBehavior: 'Double patrols. Guards check shadowy areas.', detectionModifier: 5, encounterChanceModifier: 0.25 };
    case 'alarmed':
      return { guardBehavior: 'Guards searching actively. Doors being locked.', detectionModifier: 8, encounterChanceModifier: 0.5 };
    case 'lockdown':
      return { guardBehavior: 'Full lockdown. Every corner searched. Reinforcements called.', detectionModifier: 12, encounterChanceModifier: 1.0 };
  }
}

// ---- Ambush Setup ----

export function setupAmbush(
  characters: { name: string; stealthBonus: number }[],
  position: string,
  triggerCondition: string
): AmbushSetup {
  const checks = characters.map((c) => {
    const rollVal = d20();
    return {
      name: c.name,
      roll: rollVal,
      total: rollVal + c.stealthBonus,
    };
  });

  // Any check above 10 grants surprise
  const lowestCheck = Math.min(...checks.map((c) => c.total));
  const surpriseRound = lowestCheck >= 10;

  return {
    ambushers: characters.map((c) => c.name),
    position,
    triggerCondition,
    stealthChecks: checks,
    surpriseRound,
    surprisedEnemies: surpriseRound ? ['all'] : [],
    narration: surpriseRound
      ? `You set up a perfect ambush at ${position}. When ${triggerCondition}, you strike with surprise!`
      : `You attempt an ambush at ${position}, but your concealment isn't perfect. The enemy may react in time.`,
  };
}

// ---- Infiltration State ----

export function initInfiltration(): InfiltrationState {
  return {
    alertLevel: 'unaware',
    detectionEvents: [],
    stealthChecksMade: 0,
    stealthChecksFailed: 0,
    guardsAlerted: [],
    routesRevealed: [],
    objectivesCompleted: [],
    escapeRoutes: [],
  };
}

export function updateInfiltration(
  state: InfiltrationState,
  event: { type: 'check_passed' | 'check_failed' | 'objective_done' | 'route_found' | 'escape_found'; detail: string }
): InfiltrationState {
  const updated = { ...state };
  const timestamp = new Date().toISOString();

  switch (event.type) {
    case 'check_passed':
      updated.stealthChecksMade++;
      break;
    case 'check_failed':
      updated.stealthChecksMade++;
      updated.stealthChecksFailed++;
      updated.alertLevel = escalateAlert(updated.alertLevel);
      updated.detectionEvents.push({ event: event.detail, timestamp });
      break;
    case 'objective_done':
      updated.objectivesCompleted.push(event.detail);
      break;
    case 'route_found':
      updated.routesRevealed.push(event.detail);
      break;
    case 'escape_found':
      updated.escapeRoutes.push(event.detail);
      break;
  }

  return updated;
}
