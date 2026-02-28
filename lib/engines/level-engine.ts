// ============================================================
// LEVEL-UP ENGINE
// Handles level advancement, stat increases, and feature gains
// Reference: D&D 5e leveling rules
// ============================================================

import type { Character, CharacterClass } from '@/lib/types/character';
import { canLevelUp, getXPForNextLevel, getProficiencyBonus } from '@/lib/utils/calculations';

// ---- Types ----

export interface LevelUpGains {
  newLevel: number;
  hpGain: number;
  proficiencyBonus: number;
  proficiencyBonusChanged: boolean;
  newFeatures: { name: string; description: string }[];
  abilityScoreImprovement: boolean;       // Levels 4, 8, 12, 16, 19
  newSpellSlots?: { level: number; slots: number }[];
  extraAttack?: boolean;                  // Level 5 for martial classes
  subclassChoice?: boolean;               // Level 3 typically
  xpToNextLevel: number;
}

// ---- Hit Die by Class ----

const CLASS_HIT_DIE: Record<string, number> = {
  warrior: 10,
  paladin: 10,
  ranger: 10,
  mage: 6,
  warlock: 8,
  'blood-mage': 8,
  rogue: 8,
  bard: 8,
  cleric: 8,
  monk: 8,
  druid: 8,
  artificer: 8,
};

function getHitDie(characterClass: CharacterClass): number {
  return CLASS_HIT_DIE[characterClass] || 8;
}

// ---- ASI Levels ----

const ASI_LEVELS = [4, 8, 12, 16, 19];

// ---- Subclass Levels ----

const SUBCLASS_LEVELS: Record<string, number> = {
  warrior: 3, mage: 2, rogue: 3, cleric: 1, ranger: 3, bard: 3,
  paladin: 3, druid: 2, warlock: 1, monk: 3, artificer: 3, 'blood-mage': 2,
};

// ---- Martial Classes (extra attack at 5) ----

const MARTIAL_CLASSES = ['warrior', 'paladin', 'ranger', 'monk'];

// ---- Caster Spell Slot Progression (simplified) ----

const FULL_CASTER_SLOTS: Record<number, { level: number; slots: number }[]> = {
  1:  [{ level: 1, slots: 2 }],
  2:  [{ level: 1, slots: 3 }],
  3:  [{ level: 1, slots: 4 }, { level: 2, slots: 2 }],
  4:  [{ level: 2, slots: 3 }],
  5:  [{ level: 3, slots: 2 }],
  6:  [{ level: 3, slots: 3 }],
  7:  [{ level: 4, slots: 1 }],
  8:  [{ level: 4, slots: 2 }],
  9:  [{ level: 5, slots: 1 }],
  10: [{ level: 5, slots: 2 }],
  11: [{ level: 6, slots: 1 }],
  12: [{ level: 6, slots: 1 }], // No new slot level, but maintains progression
  13: [{ level: 7, slots: 1 }],
  14: [{ level: 7, slots: 1 }],
  15: [{ level: 8, slots: 1 }],
  16: [{ level: 8, slots: 1 }],
  17: [{ level: 9, slots: 1 }],
  18: [{ level: 5, slots: 1 }], // 5th-level slot increase
  19: [{ level: 6, slots: 1 }], // 6th-level slot increase (2nd)
  20: [{ level: 7, slots: 1 }], // 7th-level slot increase (2nd)
};

// Warlock Pact Magic — few slots, always highest level, recharge on short rest
const WARLOCK_PACT_SLOTS: Record<number, { level: number; slots: number }[]> = {
  1:  [{ level: 1, slots: 1 }],
  2:  [{ level: 1, slots: 2 }],
  3:  [{ level: 2, slots: 2 }],
  5:  [{ level: 3, slots: 2 }],
  7:  [{ level: 4, slots: 2 }],
  9:  [{ level: 5, slots: 2 }],
  11: [{ level: 5, slots: 3 }],
  17: [{ level: 5, slots: 4 }],
};

const FULL_CASTERS = ['mage', 'cleric', 'druid', 'bard', 'blood-mage'];
const HALF_CASTERS = ['paladin', 'ranger', 'artificer'];

// ---- Generic Features by Level ----

function getGenericFeatures(characterClass: CharacterClass, newLevel: number): { name: string; description: string }[] {
  const features: { name: string; description: string }[] = [];

  // Add common milestone features
  if (newLevel === 5 && MARTIAL_CLASSES.includes(characterClass)) {
    features.push({ name: 'Extra Attack', description: 'You can attack twice when you take the Attack action on your turn.' });
  }

  if (newLevel === 2 && characterClass === 'warrior') {
    features.push({ name: 'Action Surge', description: 'You can take one additional action on your turn. Recharges on short rest.' });
  }

  if (newLevel === 2 && characterClass === 'rogue') {
    features.push({ name: 'Cunning Action', description: 'You can Dash, Disengage, or Hide as a bonus action.' });
  }

  if (newLevel === 2 && characterClass === 'monk') {
    features.push({ name: 'Ki', description: 'You gain ki points equal to your monk level to fuel special abilities.' });
  }

  if (newLevel === 2 && characterClass === 'paladin') {
    features.push({ name: 'Divine Smite', description: 'Expend a spell slot to deal extra radiant damage on a melee hit.' });
  }

  if (newLevel === 3 && characterClass === 'rogue') {
    features.push({ name: 'Sneak Attack Increase', description: 'Your Sneak Attack damage increases to 2d6.' });
  }

  if (newLevel === 5 && (FULL_CASTERS.includes(characterClass) || characterClass === 'warlock')) {
    features.push({ name: '3rd-Level Spells', description: 'You unlock access to powerful 3rd-level spells.' });
  }

  if (newLevel === 9 && FULL_CASTERS.includes(characterClass)) {
    features.push({ name: '5th-Level Spells', description: 'You unlock access to devastating 5th-level spells.' });
  }

  if (newLevel === 11) {
    if (MARTIAL_CLASSES.includes(characterClass)) {
      features.push({ name: 'Improved Abilities', description: 'Your martial prowess reaches new heights with class-specific improvements.' });
    }
  }

  if (newLevel === 20) {
    features.push({ name: 'Capstone Ability', description: `You reach the pinnacle of your ${characterClass} training, gaining your ultimate class feature.` });
  }

  return features;
}

// ---- Preview Level Up (calculate what the character gains) ----

export function previewLevelUp(character: Character): LevelUpGains | null {
  if (!canLevelUp(character)) return null;

  const newLevel = character.level + 1;
  const hitDie = getHitDie(character.class);
  const conMod = character.abilityScores?.con?.modifier ?? 0;

  // HP gain: average hit die roll + CON modifier (minimum 1)
  const hpGain = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);

  // Proficiency bonus
  const oldProf = getProficiencyBonus(character.level);
  const newProf = getProficiencyBonus(newLevel);

  // ASI check
  const asiAvailable = ASI_LEVELS.includes(newLevel);

  // Features
  const newFeatures = getGenericFeatures(character.class, newLevel);

  // Subclass
  const subclassLevel = SUBCLASS_LEVELS[character.class] ?? 3;
  const offerSubclass = newLevel === subclassLevel && !character.subclass;

  if (offerSubclass) {
    newFeatures.push({ name: 'Subclass Selection', description: 'Choose a specialization for your class.' });
  }

  // Spell slots (full casters, warlock pact magic, half casters)
  let newSpellSlots: { level: number; slots: number }[] | undefined;
  if (character.class === 'warlock') {
    // Warlock: Pact Magic — few high-level slots, recharge on short rest
    newSpellSlots = WARLOCK_PACT_SLOTS[newLevel];
  } else if (FULL_CASTERS.includes(character.class)) {
    newSpellSlots = FULL_CASTER_SLOTS[newLevel];
  } else if (HALF_CASTERS.includes(character.class) && newLevel >= 2) {
    // Half casters get slots at half the rate
    const effectiveCasterLevel = Math.floor(newLevel / 2);
    newSpellSlots = FULL_CASTER_SLOTS[effectiveCasterLevel] ?? [];
  }

  // Extra attack marker
  const extraAttack = newLevel === 5 && MARTIAL_CLASSES.includes(character.class);

  if (asiAvailable) {
    newFeatures.push({
      name: 'Ability Score Improvement',
      description: 'Increase one ability score by 2, or two ability scores by 1 each.'
    });
  }

  return {
    newLevel,
    hpGain,
    proficiencyBonus: newProf,
    proficiencyBonusChanged: newProf !== oldProf,
    newFeatures,
    abilityScoreImprovement: asiAvailable,
    newSpellSlots,
    extraAttack,
    subclassChoice: offerSubclass,
    xpToNextLevel: newLevel >= 20 ? Infinity : getXPForNextLevel(newLevel),
  };
}

// ---- Apply Level Up (returns partial Character update) ----

export function applyLevelUp(character: Character, gains: LevelUpGains): Partial<Character> {
  const update: Partial<Character> = {
    level: gains.newLevel,
    xpToNextLevel: gains.xpToNextLevel === Infinity ? 999999 : gains.xpToNextLevel,
    proficiencyBonus: gains.proficiencyBonus,
    hitPoints: {
      ...character.hitPoints,
      max: character.hitPoints.max + gains.hpGain,
      current: character.hitPoints.current + gains.hpGain, // Heal on level up
      hitDice: {
        total: gains.newLevel,
        remaining: (character.hitPoints.hitDice?.remaining ?? 0) + 1,
        dieType: character.hitPoints.hitDice?.dieType ?? 8,
      },
    },
  };

  // Add new features
  if (gains.newFeatures.length > 0) {
    const existing = character.features || [];
    const newFeatures = gains.newFeatures.map((f, i) => ({
      id: `feature-${gains.newLevel}-${i}-${Date.now()}`,
      name: f.name,
      source: 'class' as const,
      level: gains.newLevel,
      description: f.description,
      isPassive: true,
    }));
    update.features = [...existing, ...newFeatures];
  }

  return update;
}
