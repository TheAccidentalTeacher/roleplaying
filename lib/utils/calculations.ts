// ============================================================
// CALCULATIONS — D&D 5e stat calculations
// ============================================================

import type { Character, AbilityName, SkillName } from '@/lib/types/character';

/**
 * Calculate ability modifier from score: floor((score - 10) / 2)
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Get proficiency bonus for a given level.
 * Levels 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculate Armor Class.
 * Base 10 + DEX mod (or armor value + shields + magic).
 */
export function getArmorClass(character: Character): number {
  // If Character has a precomputed armorClass, use it
  if (character.armorClass) return character.armorClass;

  const dexMod = getAbilityModifier(character.abilityScores.dex.score);
  // Base: 10 + DEX (unarmored)
  return 10 + dexMod;
}

/**
 * Calculate initiative bonus (typically DEX modifier).
 */
export function getInitiativeBonus(character: Character): number {
  return getAbilityModifier(character.abilityScores.dex.score);
}

/**
 * Calculate passive Perception: 10 + WIS mod + proficiency (if proficient in Perception).
 */
export function getPassivePerception(character: Character): number {
  const wisMod = getAbilityModifier(character.abilityScores.wis.score);
  const perceptionSkill = character.skills?.find((s) => s.name === 'perception');
  const profBonus = perceptionSkill?.proficient ? getProficiencyBonus(character.level) : 0;
  const expertise = perceptionSkill?.expertise ? getProficiencyBonus(character.level) : 0; // double prof
  return 10 + wisMod + profBonus + expertise;
}

/**
 * Calculate carry capacity: Strength score × 15.
 */
export function getCarryCapacity(strength: number): number {
  return strength * 15;
}

/**
 * Get the encumbrance thresholds.
 */
export function getEncumbranceThresholds(strength: number): {
  normal: number;
  encumbered: number;
  heavilyEncumbered: number;
  maximum: number;
} {
  return {
    normal: strength * 5,
    encumbered: strength * 10,
    heavilyEncumbered: strength * 15,
    maximum: strength * 15, // Can't exceed carry capacity
  };
}

/**
 * Get XP threshold for next level (simplified D&D 5e XP table).
 */
export function calculateXPThreshold(level: number): number {
  const thresholds: Record<number, number> = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000,
    11: 85000,
    12: 100000,
    13: 120000,
    14: 140000,
    15: 165000,
    16: 195000,
    17: 225000,
    18: 265000,
    19: 305000,
    20: 355000,
  };
  return thresholds[level] ?? 0;
}

/**
 * Get XP needed for the NEXT level.
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 20) return Infinity;
  return calculateXPThreshold(currentLevel + 1);
}

/**
 * Check if character has enough XP to level up.
 */
export function canLevelUp(character: Character): boolean {
  if (character.level >= 20) return false;
  return character.xp >= getXPForNextLevel(character.level);
}

/**
 * Get Spell Save DC: 8 + proficiency bonus + spellcasting ability modifier.
 */
export function getSpellSaveDC(character: Character): number {
  if (!character.spellcasting) return 0;
  const abilityMod = getAbilityModifier(
    character.abilityScores[character.spellcasting.ability].score
  );
  return 8 + getProficiencyBonus(character.level) + abilityMod;
}

/**
 * Get Spell Attack Bonus: proficiency bonus + spellcasting ability modifier.
 */
export function getSpellAttackBonus(character: Character): number {
  if (!character.spellcasting) return 0;
  const abilityMod = getAbilityModifier(
    character.abilityScores[character.spellcasting.ability].score
  );
  return getProficiencyBonus(character.level) + abilityMod;
}

/**
 * Calculate skill bonus: ability modifier + proficiency (if proficient) + expertise (if expert).
 */
export function getSkillBonus(character: Character, skillName: SkillName): number {
  const skill = character.skills?.find((s) => s.name === skillName);
  if (!skill) return 0;

  const abilityMod = getAbilityModifier(character.abilityScores[skill.ability].score);
  const profBonus = skill.proficient ? getProficiencyBonus(character.level) : 0;
  const expertiseBonus = skill.expertise ? getProficiencyBonus(character.level) : 0;

  return abilityMod + profBonus + expertiseBonus;
}

/**
 * Calculate saving throw bonus: ability modifier + proficiency (if proficient).
 */
export function getSavingThrowBonus(character: Character, ability: AbilityName): number {
  const save = character.savingThrows?.find((s) => s.ability === ability);
  const abilityMod = getAbilityModifier(character.abilityScores[ability].score);
  const profBonus = save?.proficient ? getProficiencyBonus(character.level) : 0;
  return abilityMod + profBonus;
}

/**
 * Calculate max HP for a class at a given level.
 * Level 1: max hit die + CON mod
 * Levels 2+: average hit die roll + CON mod per level
 */
export function calculateMaxHP(hitDie: number, level: number, conModifier: number): number {
  if (level <= 0) return 0;
  // Level 1: max hit die + CON mod (minimum 1)
  const level1HP = hitDie + conModifier;
  // Levels 2+: average roll (hitDie/2 + 1) + CON mod per level
  const averageRoll = Math.floor(hitDie / 2) + 1;
  const subsequentHP = (level - 1) * (averageRoll + conModifier);
  return Math.max(level1HP + subsequentHP, 1);
}

/**
 * Get the hit die size for a class.
 */
export function getHitDie(characterClass: string): number {
  const hitDice: Record<string, number> = {
    barbarian: 12,
    bard: 8,
    cleric: 8,
    druid: 8,
    fighter: 10,
    monk: 8,
    paladin: 10,
    ranger: 10,
    rogue: 8,
    sorcerer: 6,
    warlock: 8,
    wizard: 6,
    // Custom classes default to d8
    artificer: 8,
    blood_hunter: 10,
    mystic: 8,
    warden: 10,
    witch: 6,
  };
  return hitDice[characterClass.toLowerCase()] ?? 8;
}

/**
 * Get movement speed for a race (base, in feet).
 */
export function getBaseSpeed(race: string): number {
  const speeds: Record<string, number> = {
    human: 30,
    elf: 30,
    half_elf: 30,
    high_elf: 30,
    wood_elf: 35,
    dark_elf: 30,
    dwarf: 25,
    hill_dwarf: 25,
    mountain_dwarf: 25,
    halfling: 25,
    lightfoot_halfling: 25,
    stout_halfling: 25,
    gnome: 25,
    rock_gnome: 25,
    forest_gnome: 25,
    half_orc: 30,
    dragonborn: 30,
    tiefling: 30,
    aasimar: 30,
    goliath: 30,
    firbolg: 30,
    tabaxi: 30,
    kenku: 30,
    lizardfolk: 30,
    goblin: 30,
    kobold: 30,
    orc: 30,
    bugbear: 30,
    hobgoblin: 30,
    yuan_ti: 30,
    changeling: 30,
    warforged: 30,
    shifter: 30,
    kalashtar: 30,
    genasi: 30,
    tortle: 30,
    aarakocra: 25,
    centaur: 40,
    minotaur: 30,
    satyr: 35,
    fairy: 30,
    harengon: 30,
    owlin: 30,
    autognome: 30,
  };
  return speeds[race.toLowerCase().replace(/ /g, '_')] ?? 30;
}

/**
 * Calculate encounter difficulty based on party level and enemy CR.
 */
export function getEncounterDifficulty(
  partyLevel: number,
  partySize: number,
  totalEnemyCR: number
): 'trivial' | 'easy' | 'moderate' | 'hard' | 'deadly' {
  // Simplified difficulty calculation
  const effectivePartyStrength = partyLevel * partySize;
  const ratio = totalEnemyCR / effectivePartyStrength;

  if (ratio < 0.25) return 'trivial';
  if (ratio < 0.5) return 'easy';
  if (ratio < 0.75) return 'moderate';
  if (ratio < 1.0) return 'hard';
  return 'deadly';
}
