// ============================================================
// CRAFTING CATALOG — FANTASY (Medieval / Dark / Mythological)
// Recipes for weapons requiring smithing, enchanting,
// leatherworking, and related classical crafting skills.
// ============================================================

import type { CraftingSkill } from '@/lib/types/items';

// ── Crafting Stations ─────────────────────────────────────

export type FantasyStation =
  | 'blacksmiths-forge'    // Metal weapons and armor
  | 'enchanting-table'     // Magical enhancement
  | 'woodworkers-bench'    // Bows, staves, wooden weapons
  | 'armorers-frame'       // Armor and shields
  | 'alchemists-still'     // Potions, poisons, reagents
  | 'fletchers-bench'      // Arrows, bolts
  | 'jewelers-bench';      // Gems, socketing, fine metalwork

// ── Crafting Materials ────────────────────────────────────

export type FantasyMaterial =
  | 'Iron Ingot'
  | 'Steel Ingot'
  | 'Mithral Ingot'
  | 'Adamantine Ingot'
  | 'Hardwood'
  | 'Yew Wood'
  | 'Ebonwood'
  | 'Dragonbone'
  | 'Leather'
  | 'Dragonhide'
  | 'Spider Silk'
  | 'Wyvern Sinew'            // Superior bowstring
  | 'Dire Wolf Pelt'
  | 'Arcane Focus Crystal'
  | 'Enchanting Rune'
  | 'Moonstone Dust'
  | 'Void Essence'
  | 'Phoenix Feather'
  | 'Shadow Silk'
  | 'Fire Opal'
  | 'Sapphire'
  | 'Obsidian'
  | 'Fletchings (Eagle)'
  | 'Fletchings (Raven)'
  | 'Arrowheads (Iron)'
  | 'Arrowheads (Steel)'
  | 'Arrowheads (Obsidian)'
  | 'Arrow Shaft (Hardwood)'
  | 'Arrow Shaft (Yew)'
  | 'String (Hemp)'
  | 'String (Woven Silk)';

// ── Entry Interface ───────────────────────────────────────

export interface FantasyCraftingRecipe {
  recipeId: string;
  outputWeaponId: string;
  outputName: string;
  station: FantasyStation;
  materials: Array<{ item: FantasyMaterial; quantity: number }>;
  skillRequired: CraftingSkill;
  skillLevel: number;         // 1-10 scale
  timeMinutes: number;
  craftingDC: number;
  failureResult?: string;
  successVariants?: {
    normalResult: string;
    critSuccess: string;
  };
  notes?: string;
}

// ══════════════════════════════════════════════════════════
// FANTASY CRAFTING RECIPES — 18 entries
// ══════════════════════════════════════════════════════════

export const FANTASY_RECIPES: FantasyCraftingRecipe[] = [

  // ── BOWS ────────────────────────────────────────────────

  {
    recipeId: 'craft-fantasy-shortbow',
    outputWeaponId: 'bow-shortbow-basic',
    outputName: 'Shortbow',
    station: 'woodworkers-bench',
    materials: [
      { item: 'Hardwood', quantity: 2 },
      { item: 'String (Hemp)', quantity: 1 },
      { item: 'Leather', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 2,
    timeMinutes: 120,
    craftingDC: 10,
    successVariants: {
      normalResult: 'Functional shortbow, 1d6 piercing, range 80/320.',
      critSuccess: 'Well-seasoned limbs — range 120/480.',
    },
  },

  {
    recipeId: 'craft-fantasy-longbow',
    outputWeaponId: 'bow-longbow-war',
    outputName: 'War Longbow',
    station: 'woodworkers-bench',
    materials: [
      { item: 'Yew Wood', quantity: 3 },
      { item: 'String (Hemp)', quantity: 1 },
      { item: 'Leather', quantity: 2 },
    ],
    skillRequired: 'smithing',
    skillLevel: 4,
    timeMinutes: 300,
    craftingDC: 14,
    failureResult: 'Bow warps under tension — breaks on the second draw.',
    successVariants: {
      normalResult: 'War longbow, 1d8 piercing, range 150/600.',
      critSuccess: 'Exceptional tension — 1d8+1, range 200/600.',
    },
    notes: 'Yew must be cut from the heartwood/sapwood boundary for proper flexibility. Season the stave for a minimum of 6 months (or 2 hours game-time with appropriate druid drying magic).',
  },

  {
    recipeId: 'craft-fantasy-recurve-bow',
    outputWeaponId: 'bow-recurve-hunters',
    outputName: "Recurve Hunter's Bow",
    station: 'woodworkers-bench',
    materials: [
      { item: 'Hardwood', quantity: 3 },
      { item: 'Leather', quantity: 2 },
      { item: 'String (Hemp)', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 3,
    timeMinutes: 180,
    craftingDC: 12,
    successVariants: {
      normalResult: 'Recurve bow, 1d6 piercing, range 100/400.',
      critSuccess: 'Superior draw weight — 1d8 piercing, same range.',
    },
  },

  {
    recipeId: 'craft-fantasy-wyvern-bow',
    outputWeaponId: 'bow-wyvern-sinew',
    outputName: 'Wyvern Sinew Greatbow',
    station: 'woodworkers-bench',
    materials: [
      { item: 'Ebonwood', quantity: 4 },
      { item: 'Wyvern Sinew', quantity: 2 },
      { item: 'Dragonhide', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 7,
    timeMinutes: 480,
    craftingDC: 18,
    failureResult: 'Sinew snaps during installation — sinew is lost, bow must be re-strung.',
    successVariants: {
      normalResult: 'Greatbow, 1d12 piercing, range 200/800.',
      critSuccess: 'Perfect tension — 2d8 piercing, ignores half cover.',
    },
    notes: 'Wyvern sinew must be harvested fresh from a recently killed wyvern (within 24 hours) or preserved in brine. Dried sinew cannot be stretched correctly.',
  },

  {
    recipeId: 'craft-fantasy-chakram-returning',
    outputWeaponId: 'exotic-golden-chakram',
    outputName: 'Chakram of Returning',
    station: 'enchanting-table',
    materials: [
      { item: 'Steel Ingot', quantity: 2 },
      { item: 'Enchanting Rune', quantity: 2 },
      { item: 'Arcane Focus Crystal', quantity: 1 },
    ],
    skillRequired: 'enchanting',
    skillLevel: 5,
    timeMinutes: 240,
    craftingDC: 16,
    failureResult: 'Rune mismatch — chakram returns but to nearest creature, not wielder.',
    successVariants: {
      normalResult: 'Returns to wielder\'s hand automatically.',
      critSuccess: 'Returns as a free action, not costing movement.',
    },
  },

  // ── SWORDS ──────────────────────────────────────────────

  {
    recipeId: 'craft-fantasy-iron-shortsword',
    outputWeaponId: 'sword-shortsword-iron',
    outputName: 'Iron Shortsword',
    station: 'blacksmiths-forge',
    materials: [
      { item: 'Iron Ingot', quantity: 2 },
      { item: 'Leather', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 2,
    timeMinutes: 120,
    craftingDC: 10,
  },

  {
    recipeId: 'craft-fantasy-steel-longsword',
    outputWeaponId: 'sword-longsword-steel',
    outputName: 'Steel Longsword',
    station: 'blacksmiths-forge',
    materials: [
      { item: 'Steel Ingot', quantity: 3 },
      { item: 'Leather', quantity: 2 },
    ],
    skillRequired: 'smithing',
    skillLevel: 4,
    timeMinutes: 240,
    craftingDC: 14,
    successVariants: {
      normalResult: 'Standard longsword, 1d8 slashing.',
      critSuccess: 'Keen edge — crit on 19-20.',
    },
  },

  {
    recipeId: 'craft-fantasy-mithral-blade',
    outputWeaponId: 'sword-mithral-longsword',
    outputName: 'Mithral Longsword',
    station: 'blacksmiths-forge',
    materials: [
      { item: 'Mithral Ingot', quantity: 4 },
      { item: 'Arcane Focus Crystal', quantity: 1 },
      { item: 'Leather', quantity: 2 },
    ],
    skillRequired: 'smithing',
    skillLevel: 7,
    timeMinutes: 480,
    craftingDC: 18,
    failureResult: 'Mithral fractures during quench — ingots are lost.',
    successVariants: {
      normalResult: 'Mithral longsword, light property, magical.',
      critSuccess: 'Whisper-thin edge — finesse added, +1 attack.',
    },
    notes: 'Mithral has a different quench temperature than steel. Using standard timing results in a brittle blade. See dwarven smithing texts for precise temperature charts.',
  },

  // ── ARROWS ──────────────────────────────────────────────

  {
    recipeId: 'craft-fantasy-standard-arrows',
    outputWeaponId: 'ammo-standard-arrows',
    outputName: 'Standard Arrows (20)',
    station: 'fletchers-bench',
    materials: [
      { item: 'Arrow Shaft (Hardwood)', quantity: 20 },
      { item: 'Arrowheads (Iron)', quantity: 20 },
      { item: 'Fletchings (Eagle)', quantity: 20 },
    ],
    skillRequired: 'smithing',
    skillLevel: 1,
    timeMinutes: 60,
    craftingDC: 8,
  },

  {
    recipeId: 'craft-fantasy-broadhead-arrows',
    outputWeaponId: 'ammo-broadhead-arrows',
    outputName: 'Broadhead Arrows (10)',
    station: 'fletchers-bench',
    materials: [
      { item: 'Arrow Shaft (Yew)', quantity: 10 },
      { item: 'Arrowheads (Steel)', quantity: 10 },
      { item: 'Fletchings (Eagle)', quantity: 10 },
    ],
    skillRequired: 'smithing',
    skillLevel: 3,
    timeMinutes: 60,
    craftingDC: 12,
    successVariants: {
      normalResult: '10 broadhead arrows, +1 damage each.',
      critSuccess: '10 perfect broadheads, +2 damage, critical on 19-20 hit.',
    },
  },

  {
    recipeId: 'craft-fantasy-shadow-arrows',
    outputWeaponId: 'ammo-shadow-arrows',
    outputName: 'Shadow Arrows (10)',
    station: 'enchanting-table',
    materials: [
      { item: 'Arrow Shaft (Yew)', quantity: 10 },
      { item: 'Arrowheads (Obsidian)', quantity: 10 },
      { item: 'Fletchings (Raven)', quantity: 10 },
      { item: 'Shadow Silk', quantity: 1 },
    ],
    skillRequired: 'enchanting',
    skillLevel: 5,
    timeMinutes: 180,
    craftingDC: 15,
    successVariants: {
      normalResult: 'Shadow arrows — pass through dim light silently, +2 stealth on shot.',
      critSuccess: 'The arrows are nearly invisible in flight. -5 to any Perception check to spot them mid-air.',
    },
  },

  {
    recipeId: 'craft-fantasy-fire-arrows',
    outputWeaponId: 'ammo-fire-arrows',
    outputName: 'Fire Arrows (10)',
    station: 'alchemists-still',
    materials: [
      { item: 'Arrow Shaft (Hardwood)', quantity: 10 },
      { item: 'Arrowheads (Iron)', quantity: 10 },
      { item: 'Fletchings (Eagle)', quantity: 10 },
      { item: 'Fire Opal', quantity: 1 },
    ],
    skillRequired: 'alchemy',
    skillLevel: 4,
    timeMinutes: 120,
    craftingDC: 14,
    successVariants: {
      normalResult: 'Fire arrows — +1d4 fire damage on hit.',
      critSuccess: 'Sustained ignition — target continues burning for 1 round after hit.',
    },
    notes: 'The opal is not consumed — it provides the ignition template for the alchemical coating. A single opal can coat 100 arrows before its resonance fades.',
  },

  // ── AXES & BLUNT ─────────────────────────────────────────

  {
    recipeId: 'craft-fantasy-iron-axe',
    outputWeaponId: 'axe-handaxe-iron',
    outputName: 'Iron Handaxe',
    station: 'blacksmiths-forge',
    materials: [
      { item: 'Iron Ingot', quantity: 2 },
      { item: 'Hardwood', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 2,
    timeMinutes: 90,
    craftingDC: 10,
  },

  {
    recipeId: 'craft-fantasy-warhammer',
    outputWeaponId: 'blunt-warhammer-steel',
    outputName: 'Steel Warhammer',
    station: 'blacksmiths-forge',
    materials: [
      { item: 'Steel Ingot', quantity: 4 },
      { item: 'Hardwood', quantity: 1 },
      { item: 'Iron Ingot', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 4,
    timeMinutes: 180,
    craftingDC: 13,
  },

  // ── KNIVES ──────────────────────────────────────────────

  {
    recipeId: 'craft-fantasy-iron-dagger',
    outputWeaponId: 'knife-iron-dagger',
    outputName: 'Iron Dagger',
    station: 'blacksmiths-forge',
    materials: [
      { item: 'Iron Ingot', quantity: 1 },
      { item: 'Leather', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 1,
    timeMinutes: 60,
    craftingDC: 8,
  },

  {
    recipeId: 'craft-fantasy-obsidian-blade',
    outputWeaponId: 'knife-obsidian-dagger',
    outputName: 'Obsidian Dagger',
    station: 'jewelers-bench',
    materials: [
      { item: 'Obsidian', quantity: 3 },
      { item: 'Leather', quantity: 1 },
    ],
    skillRequired: 'jewelcrafting',
    skillLevel: 3,
    timeMinutes: 120,
    craftingDC: 13,
    failureResult: 'Obsidian shatters during knapping — materials wasted.',
    successVariants: {
      normalResult: 'Razor edge, +1d4 slashing, but fragile.',
      critSuccess: 'Perfect knap — edge is supernaturally sharp. +1 attack and +1d4 slashing.',
    },
    notes: 'Obsidian knapping is an entirely different skill than metalsmithing. The jeweler\'s bench is used for the precision vise and magnification, not for any metalwork step.',
  },

  // ── STAVES ──────────────────────────────────────────────

  {
    recipeId: 'craft-fantasy-quarterstaff',
    outputWeaponId: 'blunt-quarterstaff',
    outputName: 'Quarterstaff',
    station: 'woodworkers-bench',
    materials: [
      { item: 'Hardwood', quantity: 2 },
      { item: 'Leather', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 1,
    timeMinutes: 60,
    craftingDC: 8,
    successVariants: {
      normalResult: 'Functional quarterstaff, 1d6/1d8 bludgeoning (versatile).',
      critSuccess: 'Exceptional balance — +1 to attack rolls when using the two-handed grip.',
    },
  },
];

// ── Lookup helpers ────────────────────────────────────────

export function getFantasyRecipeByWeaponId(weaponId: string): FantasyCraftingRecipe | undefined {
  return FANTASY_RECIPES.find(r => r.outputWeaponId === weaponId);
}

export function getFantasyRecipesByStation(station: FantasyStation): FantasyCraftingRecipe[] {
  return FANTASY_RECIPES.filter(r => r.station === station);
}

export function getFantasyRecipesBySkillLevel(maxLevel: number): FantasyCraftingRecipe[] {
  return FANTASY_RECIPES.filter(r => r.skillLevel <= maxLevel);
}
