// ============================================================
// REST ENGINE
// Handles short rests, long rests (5-phase camp system),
// exhaustion, and downtime activities.
// Reference: SESSION-CHRONICLES.md, BRAINSTORM.md
// ============================================================

import type {
  CampSetup,
  CampActivity,
  CampfireActivity,
  WatchShift,
  WatchEvent,
  WatchEventType,
  ShortRestResult,
  LongRestResult,
  ExhaustionState,
} from '@/lib/types/rest';
import type { Character } from '@/lib/types/character';
import { roll } from '@/lib/utils/dice';

// ---- Exhaustion effects ----

const EXHAUSTION_EFFECTS: Record<number, string[]> = {
  0: [],
  1: ['Disadvantage on ability checks'],
  2: ['Disadvantage on ability checks', 'Speed halved'],
  3: ['Disadvantage on ability checks', 'Speed halved', 'Disadvantage on attack rolls and saving throws'],
  4: ['Disadvantage on ability checks', 'Speed halved', 'Disadvantage on attack rolls and saving throws', 'HP maximum halved'],
  5: ['Disadvantage on ability checks', 'Speed halved', 'Disadvantage on attack rolls and saving throws', 'HP maximum halved', 'Speed reduced to 0'],
  6: ['Death'],
};

export function getExhaustionState(level: number, source: string = ''): ExhaustionState {
  const clamped = Math.max(0, Math.min(6, level));
  return {
    level: clamped,
    effects: EXHAUSTION_EFFECTS[clamped],
    source,
  };
}

// ---- Short Rest ----

export function processShortRest(
  character: Character,
  hitDiceToSpend: number
): ShortRestResult {
  const available = character.hitPoints.hitDice.remaining;
  const actual = Math.min(hitDiceToSpend, available);
  const dieType = character.hitPoints.hitDice.dieType;
  const conMod = character.abilityScores.con.modifier;

  let hpRecovered = 0;
  for (let i = 0; i < actual; i++) {
    const rolled = roll(dieType);
    hpRecovered += Math.max(1, rolled + conMod);
  }

  // Cap recovery at missing HP
  const missingHP = character.hitPoints.max - character.hitPoints.current;
  hpRecovered = Math.min(hpRecovered, missingHP);

  // Determine abilities that recharge on short rest
  const recharged = character.features
    .filter(
      (f) => f.uses && f.uses.remaining < f.uses.max && f.uses.rechargeOn === 'short-rest'
    )
    .map((f) => f.name);

  return {
    characterId: character.id,
    hitDiceSpent: actual,
    hitDiceAvailable: available - actual,
    hpRecovered,
    abilitiesRecharged: recharged,
    interrupted: false,
    narration: `You rest for about an hour${
      hpRecovered > 0 ? `, recovering ${hpRecovered} HP` : ''
    }${
      recharged.length > 0 ? ` and recharging ${recharged.join(', ')}` : ''
    }.`,
  };
}

// ---- Camp Setup ----

export function createCampSetup(
  location: string,
  shelterType: CampSetup['shelterType'],
  campfire: boolean
): CampSetup {
  const safetyRating = calculateSafety(shelterType, !campfire);

  const activities: CampActivity[] = ['talk', 'journal', 'keep_watch'];
  if (campfire) activities.push('cook', 'study', 'sharpen', 'repair');
  activities.push('meditate', 'pray', 'plan', 'forage');

  return {
    location,
    shelterType,
    campfireLit: campfire,
    wardingSpells: [],
    concealment: shelterType === 'building' ? 'full' : shelterType === 'natural_cover' ? 'partial' : campfire ? 'none' : 'partial',
    safetyRating,
    availableActivities: activities,
  };
}

function calculateSafety(shelter: CampSetup['shelterType'], concealed: boolean): number {
  let safety = 30;
  if (shelter === 'building') safety += 40;
  else if (shelter === 'magical') safety += 50;
  else if (shelter === 'tent') safety += 15;
  else if (shelter === 'natural_cover') safety += 20;
  if (concealed) safety += 15;
  return Math.min(100, safety);
}

// ---- Watch System ----

export function generateWatchEvent(
  safetyRating: number,
  perceptionRoll: number
): WatchEvent | null {
  // Higher safety = lower chance of events
  const eventChance = (100 - safetyRating) / 100;
  if (Math.random() > eventChance) return null;

  const events: { type: WatchEventType; weight: number }[] = [
    { type: 'nothing', weight: 30 },
    { type: 'strange_sound', weight: 25 },
    { type: 'weather_change', weight: 15 },
    { type: 'wandering_creature', weight: 10 },
    { type: 'dream_vision', weight: 8 },
    { type: 'npc_encounter', weight: 5 },
    { type: 'discovery', weight: 4 },
    { type: 'ambush', weight: 3 },
  ];

  const total = events.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  let selectedType: WatchEventType = 'nothing';
  for (const e of events) {
    r -= e.weight;
    if (r <= 0) {
      selectedType = e.type;
      break;
    }
  }

  if (selectedType === 'nothing') return null;

  const descriptions: Record<WatchEventType, string> = {
    nothing: '',
    strange_sound: 'An unsettling sound echoes in the distance. It\'s hard to tell if it\'s a creature, the wind, or something else entirely.',
    wandering_creature: 'Something moves at the edge of your camp. A creature has wandered close.',
    weather_change: 'The weather shifts noticeably during the night.',
    dream_vision: 'Vivid dreams visit you — perhaps a message, perhaps merely stress.',
    npc_encounter: 'A traveler approaches your camp, seeking warmth or shelter.',
    ambush: 'Shadows move with purpose. This is no accident — something hunts you.',
    discovery: 'During your watch, you notice something you hadn\'t seen before.',
  };

  return {
    type: selectedType,
    description: descriptions[selectedType],
    combatTriggered: selectedType === 'ambush',
    difficultyCheck:
      selectedType === 'ambush'
        ? { ability: 'perception', dc: 15 }
        : selectedType === 'wandering_creature'
        ? { ability: 'perception', dc: 12 }
        : undefined,
  };
}

// ---- Long Rest (full result) ----

export function processLongRest(
  character: Character,
  camp: CampSetup,
  activities: CampfireActivity[],
  watches: WatchShift[],
  interrupted: boolean
): LongRestResult {
  const hpRecovered = interrupted ? 0 : character.hitPoints.max - character.hitPoints.current;
  const hitDiceRecovered = interrupted
    ? 0
    : Math.max(1, Math.floor(character.hitPoints.hitDice.total / 2));

  // Abilities that recharge on long rest
  const recharged = character.features
    .filter(
      (f) =>
        f.uses &&
        f.uses.remaining < f.uses.max &&
        (f.uses.rechargeOn === 'long-rest' || f.uses.rechargeOn === 'short-rest')
    )
    .map((f) => f.name);

  // Conditions that expire (non-permanent)
  const removable = character.conditions
    .filter((c) => c.duration !== undefined)
    .map((c) => c.type);

  // Dream generation (30% chance of a meaningful dream)
  const hasDream = Math.random() < 0.3;
  const dream = hasDream
    ? {
        description: 'You dream of distant places and forgotten things...',
        prophetic: Math.random() < 0.2,
        hint: Math.random() < 0.2 ? 'A faint guidance lingers when you wake.' : undefined,
      }
    : undefined;

  return {
    characterId: character.id,
    camp,
    activities,
    watches,
    dream,
    hpRecovered,
    hitDiceRecovered,
    spellSlotsRecovered: !interrupted,
    abilitiesRecharged: recharged,
    conditionsRemoved: removable,
    exhaustionReduced: interrupted ? 0 : 1,
    interrupted,
    narration: interrupted
      ? 'Your rest was interrupted! You do not gain the full benefits of a long rest.'
      : `After a ${camp.campfireLit ? 'warm' : 'cold'} night${
          camp.shelterType !== 'none' ? ' under shelter' : ' under the stars'
        }, you wake refreshed. ${
          hpRecovered > 0 ? `You recover ${hpRecovered} HP. ` : ''
        }${
          recharged.length > 0 ? `Your abilities are recharged. ` : ''
        }A new day begins.`,
  };
}

// ---- Apply rest results to character ----

export function applyShortRestToCharacter(
  character: Character,
  result: ShortRestResult
): Character {
  return {
    ...character,
    hitPoints: {
      ...character.hitPoints,
      current: Math.min(
        character.hitPoints.max,
        character.hitPoints.current + result.hpRecovered
      ),
      hitDice: {
        ...character.hitPoints.hitDice,
        remaining: result.hitDiceAvailable,
      },
    },
    features: character.features.map((f) =>
      result.abilitiesRecharged.includes(f.name) && f.uses
        ? { ...f, uses: { ...f.uses, remaining: f.uses.max } }
        : f
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function applyLongRestToCharacter(
  character: Character,
  result: LongRestResult
): Character {
  if (result.interrupted) return character;

  return {
    ...character,
    hitPoints: {
      ...character.hitPoints,
      current: character.hitPoints.max,
      hitDice: {
        ...character.hitPoints.hitDice,
        remaining: Math.min(
          character.hitPoints.hitDice.total,
          character.hitPoints.hitDice.remaining + result.hitDiceRecovered
        ),
      },
    },
    // Recharge spell slots
    spellcasting: character.spellcasting
      ? {
          ...character.spellcasting,
          spellSlots: character.spellcasting.spellSlots.map((s) => ({
            ...s,
            remaining: s.total,
          })),
        }
      : undefined,
    // Recharge abilities
    features: character.features.map((f) =>
      result.abilitiesRecharged.includes(f.name) && f.uses
        ? { ...f, uses: { ...f.uses, remaining: f.uses.max } }
        : f
    ),
    // Remove expired conditions
    conditions: character.conditions.filter(
      (c) => !result.conditionsRemoved.includes(c.type)
    ),
    // Reduce exhaustion
    exhaustionLevel: Math.max(0, character.exhaustionLevel - result.exhaustionReduced),
    updatedAt: new Date().toISOString(),
  };
}
