// ============================================================
// DICE UTILITIES — D&D-style dice rolling
// ============================================================

/**
 * Roll a single die with N sides (1 to N inclusive).
 */
export function roll(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll N dice with S sides. Returns array of individual rolls.
 */
export function rollMultiple(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => roll(sides));
}

/**
 * Roll a die and add a modifier. Returns breakdown.
 */
export function rollWithModifier(
  sides: number,
  modifier: number
): { roll: number; modifier: number; total: number } {
  const r = roll(sides);
  return { roll: r, modifier, total: r + modifier };
}

/**
 * Roll 4d6, drop the lowest — standard ability score generation.
 */
export function rollAbilityScore(): number {
  const rolls = rollMultiple(4, 6).sort((a, b) => a - b);
  // Drop lowest (index 0), sum the rest
  return rolls[1] + rolls[2] + rolls[3];
}

/**
 * Generate a full set of 6 ability scores using 4d6 drop lowest.
 */
export function rollAbilityScoreSet(): number[] {
  return Array.from({ length: 6 }, () => rollAbilityScore());
}

/**
 * Roll initiative (d20 + dexterity modifier).
 */
export function rollInitiative(dexMod: number): number {
  return roll(20) + dexMod;
}

/** Convenience: roll a d20 */
export function d20(): number {
  return roll(20);
}

/** Convenience: roll a d4 */
export function d4(): number {
  return roll(4);
}

/** Convenience: roll a d6 */
export function d6(): number {
  return roll(6);
}

/** Convenience: roll a d8 */
export function d8(): number {
  return roll(8);
}

/** Convenience: roll a d10 */
export function d10(): number {
  return roll(10);
}

/** Convenience: roll a d12 */
export function d12(): number {
  return roll(12);
}

/** Convenience: roll a d100 */
export function d100(): number {
  return roll(100);
}

/**
 * Roll with advantage (2d20, take higher).
 */
export function advantage(): number {
  return Math.max(roll(20), roll(20));
}

/**
 * Roll with disadvantage (2d20, take lower).
 */
export function disadvantage(): number {
  return Math.min(roll(20), roll(20));
}

/**
 * Parse and roll a damage formula like "2d6+3", "1d8", "3d10-2".
 * Returns total and breakdown.
 */
export function rollDamage(formula: string): {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
} {
  // Normalize: remove spaces
  const clean = formula.replace(/\s/g, '');

  // Match: NdS or NdS+M or NdS-M or just a number
  const match = clean.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    // Try plain number
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      return { formula, rolls: [], modifier: num, total: num };
    }
    throw new Error(`Invalid dice formula: "${formula}"`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const mod = match[3] ? parseInt(match[3], 10) : 0;

  const rolls = rollMultiple(count, sides);
  const sum = rolls.reduce((a, b) => a + b, 0);

  return {
    formula,
    rolls,
    modifier: mod,
    total: sum + mod,
  };
}

/**
 * Roll a skill / ability check: d20 + modifier, with optional advantage/disadvantage.
 */
export function rollCheck(
  modifier: number,
  hasAdvantage: boolean = false,
  hasDisadvantage: boolean = false
): { roll: number; modifier: number; total: number; hadAdvantage: boolean; hadDisadvantage: boolean } {
  let r: number;
  // Advantage and disadvantage cancel each other out
  if (hasAdvantage && !hasDisadvantage) {
    r = advantage();
  } else if (hasDisadvantage && !hasAdvantage) {
    r = disadvantage();
  } else {
    r = d20();
  }

  return {
    roll: r,
    modifier,
    total: r + modifier,
    hadAdvantage: hasAdvantage && !hasDisadvantage,
    hadDisadvantage: hasDisadvantage && !hasAdvantage,
  };
}

/**
 * Roll a saving throw against a DC.
 */
export function rollSavingThrow(
  modifier: number,
  dc: number,
  hasAdvantage: boolean = false,
  hasDisadvantage: boolean = false
): { roll: number; modifier: number; total: number; dc: number; success: boolean } {
  const check = rollCheck(modifier, hasAdvantage, hasDisadvantage);
  return {
    roll: check.roll,
    modifier: check.modifier,
    total: check.total,
    dc,
    success: check.total >= dc,
  };
}
