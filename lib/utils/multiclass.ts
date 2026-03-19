// ============================================================
// MULTICLASS UTILITIES
// Helpers for characters with a primary + optional secondary class.
// ============================================================

import type { Character, CharacterClass } from '@/lib/types/character';

// ---- Core accessors ----

/** Primary class level. Falls back to `character.level` for pre-multiclass saves. */
export function getPrimaryClassLevel(character: Character): number {
  return character.primaryClassLevel ?? character.level;
}

/** Secondary class level. Returns 0 if not set. */
export function getSecondaryClassLevel(character: Character): number {
  return character.secondaryClassLevel ?? 0;
}

// ---- Display label ----

/** Capitalise a class name (handles custom world classes too). */
export function capsClass(s: string): string {
  if (!s) return s;
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Full multiclass display label.
 * - Single class: "Ranger"
 * - Dual class:   "Ranger 7 / Rogue 3"
 * - Dual class, secondary not yet levelled (level 0): "Ranger 1 / Rogue —"
 */
export function getMulticlassLabel(character: Character): string {
  if (!character.secondaryClass) {
    return capsClass(character.class);
  }
  const p = getPrimaryClassLevel(character);
  const s = getSecondaryClassLevel(character);
  const secLabel = s === 0 ? '—' : String(s);
  return `${capsClass(character.class)} ${p} / ${capsClass(character.secondaryClass)} ${secLabel}`;
}

/**
 * Short class label for tight spaces (no level numbers).
 * "Ranger / Rogue"
 */
export function getShortClassLabel(character: Character): string {
  if (!character.secondaryClass) return capsClass(character.class);
  return `${capsClass(character.class)} / ${capsClass(character.secondaryClass)}`;
}

// ---- Levelling rules ----

/**
 * Can the character put their next level into their secondary class?
 * Rule: primary class level must always be >= secondary class level.
 * Therefore secondary can only be levelled when primary > secondary.
 */
export function canLevelSecondaryClass(character: Character): boolean {
  if (!character.secondaryClass) return false;
  const primary = getPrimaryClassLevel(character);
  const secondary = getSecondaryClassLevel(character);
  return primary > secondary;
}

// ---- Combat helpers ----

/**
 * Return the best (highest) weapon damage die across both classes.
 */
export function getBestWeaponDie(
  character: Character,
  weaponDieByClass: Record<string, number>
): number {
  const die1 = weaponDieByClass[character.class?.toLowerCase() ?? ''] ?? 8;
  if (!character.secondaryClass) return die1;
  const die2 = weaponDieByClass[character.secondaryClass.toLowerCase()] ?? 8;
  return Math.max(die1, die2);
}

// ---- Equipment helpers ----

/**
 * Returns true if the character meets a class requirement — checks both classes.
 */
export function isClassMatch(character: Character, requirements: string[]): boolean {
  if (requirements.includes(character.class)) return true;
  if (character.secondaryClass && requirements.includes(character.secondaryClass)) return true;
  return false;
}

// ---- Prompt/AI helpers ----

/**
 * Build an AI-readable class description for prompts.
 * e.g. "Ranger (level 7) / Rogue (level 3)" or "Ranger"
 */
export function getAIClassDescription(character: Character): string {
  if (!character.secondaryClass) return capsClass(character.class);
  const p = getPrimaryClassLevel(character);
  const s = getSecondaryClassLevel(character);
  return `${capsClass(character.class)} (level ${p}) / ${capsClass(character.secondaryClass)} (level ${s})`;
}
