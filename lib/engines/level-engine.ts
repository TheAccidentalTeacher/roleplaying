// ============================================================
// LEVEL-UP ENGINE
// Handles level advancement, stat increases, and feature gains
// Reference: D&D 5e leveling rules
// ============================================================

import type { Character, CharacterClass } from '@/lib/types/character';
import { canLevelUp, getXPForNextLevel, getProficiencyBonus } from '@/lib/utils/calculations';
import { getPrimaryClassLevel, getSecondaryClassLevel, canLevelSecondaryClass } from '@/lib/utils/multiclass';

// ---- Types ----

export interface LevelUpGains {
  newLevel: number;              // New TOTAL character level (primary + secondary)
  hpGain: number;
  proficiencyBonus: number;
  proficiencyBonusChanged: boolean;
  newFeatures: { name: string; description: string }[];
  abilityScoreImprovement: boolean;  // Levels 4, 8, 12, 16, 19 within that class
  newSpellSlots?: { level: number; slots: number }[];
  extraAttack?: boolean;             // Level 5 for martial classes
  subclassChoice?: boolean;          // Level 3 typically
  xpToNextLevel: number;
  /** Which class was levelled */
  targetClass: 'primary' | 'secondary';
  /** New primary class level after this level-up */
  newPrimaryClassLevel: number;
  /** New secondary class level after this level-up (0 if single-class) */
  newSecondaryClassLevel: number;
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

// ---- Cantrip damage scaling by character level ----
// Returns the damage bonus dice to add at each tier.
export function getCantripScaling(characterLevel: number): number {
  if (characterLevel >= 17) return 3; // 4 dice total
  if (characterLevel >= 11) return 2; // 3 dice total
  if (characterLevel >= 5)  return 1; // 2 dice total
  return 0;                           // 1 die total (base)
}

/**
 * Scale a cantrip's damage string for the given character level.
 * e.g. "1d10 fire" at level 5 becomes "2d10 fire"
 */
export function scaleCantrip(damage: string, characterLevel: number): string {
  const bonus = getCantripScaling(characterLevel);
  if (bonus === 0) return damage;
  // Match patterns like "1d10 fire" or "1d8 cold" — bump the die count
  return damage.replace(/^(\d+)(d\d+)/, (_, count, die) => {
    return `${parseInt(count) + bonus}${die}`;
  });
}

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

// ---- Compute spell slot gains for a class at a given class-level ----

function getSpellSlotsForClassLevel(
  characterClass: CharacterClass,
  classLevel: number
): { level: number; slots: number }[] | undefined {
  if (characterClass === 'warlock') {
    return WARLOCK_PACT_SLOTS[classLevel];
  } else if (FULL_CASTERS.includes(characterClass)) {
    return FULL_CASTER_SLOTS[classLevel];
  } else if (HALF_CASTERS.includes(characterClass) && classLevel >= 2) {
    const effectiveCasterLevel = Math.floor(classLevel / 2);
    return FULL_CASTER_SLOTS[effectiveCasterLevel] ?? [];
  }
  return undefined;
}

// ---- Preview Level Up (calculate what the character gains) ----

/**
 * Preview level-up gains for the specified class ('primary' or 'secondary').
 * Defaults to 'primary' for single-class characters.
 * Returns null if the character cannot level up or the choice is invalid.
 */
export function previewLevelUp(
  character: Character,
  targetClass: 'primary' | 'secondary' = 'primary'
): LevelUpGains | null {
  if (!canLevelUp(character)) return null;
  if (targetClass === 'secondary' && !canLevelSecondaryClass(character)) return null;

  const currentPrimaryLevel = getPrimaryClassLevel(character);
  const currentSecondaryLevel = getSecondaryClassLevel(character);

  // Resolve which class and its current class-specific level
  const activeClass: CharacterClass = targetClass === 'secondary'
    ? (character.secondaryClass ?? character.class)
    : character.class;
  const activeClassLevel = targetClass === 'secondary' ? currentSecondaryLevel : currentPrimaryLevel;
  const newClassLevel = activeClassLevel + 1;  // Class-specific level after this gain
  const newTotalLevel = character.level + 1;   // Total character level

  const hitDie = getHitDie(activeClass);
  const conMod = character.abilityScores?.con?.modifier ?? 0;
  const hpGain = Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);

  const oldProf = getProficiencyBonus(character.level);
  const newProf = getProficiencyBonus(newTotalLevel);

  // ASI based on class-specific level milestones
  const asiAvailable = ASI_LEVELS.includes(newClassLevel);

  const newFeatures = getGenericFeatures(activeClass, newClassLevel);

  // Subclass offer — check against class-specific level
  const activeSubclass = targetClass === 'secondary' ? character.secondarySubclass : character.subclass;
  const subclassLevel = SUBCLASS_LEVELS[activeClass] ?? 3;
  const offerSubclass = newClassLevel === subclassLevel && !activeSubclass;
  if (offerSubclass) {
    const cn = activeClass.charAt(0).toUpperCase() + activeClass.slice(1);
    newFeatures.push({
      name: targetClass === 'secondary' ? `${cn} Subclass Selection` : 'Subclass Selection',
      description: `Choose a specialization for your ${activeClass} class.`,
    });
  }

  // Spell slots — each class keeps its own pool
  const newSpellSlots = getSpellSlotsForClassLevel(activeClass, newClassLevel);

  const extraAttack = newClassLevel === 5 && MARTIAL_CLASSES.includes(activeClass);

  if (asiAvailable) {
    newFeatures.push({
      name: 'Ability Score Improvement',
      description: 'Increase one ability score by 2, or two ability scores by 1 each.',
    });
  }

  return {
    newLevel: newTotalLevel,
    hpGain,
    proficiencyBonus: newProf,
    proficiencyBonusChanged: newProf !== oldProf,
    newFeatures,
    abilityScoreImprovement: asiAvailable,
    newSpellSlots,
    extraAttack,
    subclassChoice: offerSubclass,
    xpToNextLevel: newTotalLevel >= 20 ? Infinity : getXPForNextLevel(newTotalLevel),
    targetClass,
    newPrimaryClassLevel: targetClass === 'primary' ? newClassLevel : currentPrimaryLevel,
    newSecondaryClassLevel: targetClass === 'secondary' ? newClassLevel : currentSecondaryLevel,
  };
}

// ---- Apply Level Up (returns partial Character update) ----

export function applyLevelUp(character: Character, gains: LevelUpGains): Partial<Character> {
  const update: Partial<Character> = {
    level: gains.newLevel,
    xpToNextLevel: gains.xpToNextLevel === Infinity ? 999999 : gains.xpToNextLevel,
    proficiencyBonus: gains.proficiencyBonus,
    // Track class-specific levels (also handles legacy single-class characters)
    primaryClassLevel: gains.newPrimaryClassLevel,
    secondaryClassLevel: gains.newSecondaryClassLevel,
    hitPoints: {
      ...character.hitPoints,
      max: character.hitPoints.max + gains.hpGain,
      current: character.hitPoints.current + gains.hpGain,
      hitDice: {
        total: gains.newLevel,
        remaining: (character.hitPoints.hitDice?.remaining ?? 0) + 1,
        dieType: character.hitPoints.hitDice?.dieType ?? 8,
      },
    },
  };

  // Add new features — tag source so AbilitiesTab can group them correctly
  if (gains.newFeatures.length > 0) {
    const existing = character.features || [];
    const featureSource = gains.targetClass === 'secondary' ? ('class2' as const) : ('class' as const);
    const newFeatures = gains.newFeatures.map((f, i) => ({
      id: `feature-${gains.newLevel}-${i}-${Date.now()}`,
      name: f.name,
      source: featureSource,
      level: gains.newLevel,
      description: f.description,
      isPassive: true,
    }));
    update.features = [...existing, ...newFeatures];
  }

  // Update the correct spell-slot pool
  if (gains.newSpellSlots && gains.newSpellSlots.length > 0) {
    if (gains.targetClass === 'secondary') {
      // Secondary class keeps its own separate pool
      const existing = character.secondarySpellcasting;
      if (existing) {
        const updatedSlots = [...existing.spellSlots];
        for (const gain of gains.newSpellSlots) {
          const idx = updatedSlots.findIndex((s) => s.level === gain.level);
          if (idx >= 0) {
            updatedSlots[idx] = {
              ...updatedSlots[idx],
              total: updatedSlots[idx].total + gain.slots,
              remaining: updatedSlots[idx].remaining + gain.slots,
            };
          } else {
            updatedSlots.push({ level: gain.level, total: gain.slots, remaining: gain.slots });
          }
        }
        update.secondarySpellcasting = { ...existing, spellSlots: updatedSlots };
      } else {
        // Create fresh secondary pool
        update.secondarySpellcasting = {
          ability: 'int',
          spellSaveDC: 10 + (character.proficiencyBonus ?? 2),
          spellAttackBonus: character.proficiencyBonus ?? 2,
          spellSlots: gains.newSpellSlots.map((s) => ({
            level: s.level,
            total: s.slots,
            remaining: s.slots,
          })),
          knownSpells: [],
          preparedSpells: [],
          cantrips: [],
        };
      }
    }
    // Primary pool is managed by the AI character builder; not patched here.
  }

  return update;
}
