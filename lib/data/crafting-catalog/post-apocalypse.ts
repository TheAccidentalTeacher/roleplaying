// ============================================================
// CRAFTING CATALOG — POST-APOCALYPSE
// Recipes for weapons that can only be crafted from scrap.
// All recipes produce weapons tagged craftingOnly: true.
// The wasteland survivor archetype halves crafting time.
// ============================================================

import type { CraftingSkill } from '@/lib/types/items';

// ── Crafting Stations ─────────────────────────────────────

export type PostApocStation =
  | 'scrap-forge'         // Basic metalwork — pipe weapons, blades
  | 'chem-kitchen'        // Chemical treatments — poisons, explosives
  | 'tinkerers-bench'     // Precision work — firearms, electronics
  | 'sewing-kit'          // Armor improvisation
  | 'field-craft'         // No station — done anywhere with bare hands
  | 'vehicle-salvage';    // Requires proximity to a vehicle wreck

// ── Crafting Materials ────────────────────────────────────

export type PostApocMaterial =
  | 'Scrap Metal'
  | 'Lead Pipe'
  | 'Duct Tape'
  | 'Wire'
  | 'Rubber Tubing'
  | 'Pre-War Components'
  | 'Car Spring Steel'
  | 'Baling Wire'
  | 'Wood Planks'
  | 'Leather Scraps'
  | 'Bottle Caps' // currency-as-material in some settings
  | 'Circuit Board'
  | 'Power Cell (dead)'
  | 'Gunpowder'
  | 'Lead Shot'
  | 'Nails'
  | 'Bone'
  | 'Rope Scraps'
  | 'Broken Glass'
  | 'Engine Springs';

// ── Entry Interface ───────────────────────────────────────

export interface PostApocCraftingRecipe {
  recipeId: string;
  outputWeaponId: string;           // matches WeaponCatalogEntry.id
  outputName: string;               // human-readable
  station: PostApocStation;
  materials: Array<{ item: PostApocMaterial; quantity: number }>;
  skillRequired: CraftingSkill;
  skillLevel: number;               // 1-10 scale
  timeMinutes: number;              // in-game minutes
  craftingDC: number;               // difficulty of the craft check
  failureResult?: string;           // what happens if you critically fail
  successVariants?: {
    normalResult: string;
    critSuccess: string;
  };
  notes?: string;
}

// ══════════════════════════════════════════════════════════
// POST-APOCALYPSE CRAFTING RECIPES — 20 entries
// ══════════════════════════════════════════════════════════

export const POST_APOC_RECIPES: PostApocCraftingRecipe[] = [

  // ── MELEE ───────────────────────────────────────────────

  {
    recipeId: 'craft-postapoc-pipe-club',
    outputWeaponId: 'blunt-pipe',
    outputName: 'Lead Pipe',
    station: 'field-craft',
    materials: [
      { item: 'Lead Pipe', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 1,
    timeMinutes: 5,
    craftingDC: 5,
    notes: 'Requires only finding the pipe. The craft is selecting the right one.',
  },

  {
    recipeId: 'craft-postapoc-scrap-shiv',
    outputWeaponId: 'knife-scrap-shiv',
    outputName: 'Scrap Shiv',
    station: 'field-craft',
    materials: [
      { item: 'Scrap Metal', quantity: 1 },
      { item: 'Leather Scraps', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 1,
    timeMinutes: 15,
    craftingDC: 8,
    failureResult: 'Blade is misshapen — deals 1 less damage and has a 1-in-6 chance of breaking per use.',
    successVariants: {
      normalResult: 'Functional shiv, 1d4 damage.',
      critSuccess: 'Surprisingly sharp edge — deals 1d4+1 and counts as finesse.',
    },
  },

  {
    recipeId: 'craft-postapoc-bone-dagger',
    outputWeaponId: 'knife-bone-dagger',
    outputName: 'Bone Dagger',
    station: 'field-craft',
    materials: [
      { item: 'Bone', quantity: 2 },
      { item: 'Leather Scraps', quantity: 1 },
      { item: 'Baling Wire', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 1,
    timeMinutes: 30,
    craftingDC: 10,
    failureResult: 'Bone cracks — weapon has 1 use before shattering.',
    notes: 'Best bones: large mammal femur. Avoid bird bones — too hollow. Avoid scavenger kills — disease risk.',
  },

  {
    recipeId: 'craft-postapoc-scrap-machete',
    outputWeaponId: 'sword-scrap-machete',
    outputName: 'Scrap Machete',
    station: 'scrap-forge',
    materials: [
      { item: 'Car Spring Steel', quantity: 2 },
      { item: 'Leather Scraps', quantity: 2 },
      { item: 'Duct Tape', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 3,
    timeMinutes: 60,
    craftingDC: 13,
    failureResult: 'Blade edge is uneven — disadvantage on attack rolls until sharpened (1 hour work).',
    successVariants: {
      normalResult: 'Functional machete, 1d10 slashing.',
      critSuccess: 'Edge holds well — treat as masterwork quality, +1 attack.',
    },
  },

  {
    recipeId: 'craft-postapoc-scrap-spear',
    outputWeaponId: 'pole-scrap-spear',
    outputName: 'Pipe-and-Rebar Spear',
    station: 'scrap-forge',
    materials: [
      { item: 'Lead Pipe', quantity: 1 },
      { item: 'Scrap Metal', quantity: 1 },
      { item: 'Baling Wire', quantity: 2 },
    ],
    skillRequired: 'smithing',
    skillLevel: 2,
    timeMinutes: 45,
    craftingDC: 11,
    failureResult: 'Tip is loose — detaches on a critical hit, weapon becomes a club.',
    notes: 'Rebar tip should be ground to a point if possible. Wire wrap prevents tip separation.',
  },

  {
    recipeId: 'craft-postapoc-scrap-waraxe',
    outputWeaponId: 'axe-scrap-waraxe',
    outputName: 'Lawnmower Blade Axe',
    station: 'scrap-forge',
    materials: [
      { item: 'Car Spring Steel', quantity: 3 },
      { item: 'Lead Pipe', quantity: 1 },
      { item: 'Baling Wire', quantity: 3 },
      { item: 'Leather Scraps', quantity: 1 },
    ],
    skillRequired: 'smithing',
    skillLevel: 4,
    timeMinutes: 90,
    craftingDC: 14,
    failureResult: 'Balance is off — weapon has -1 to attack rolls. Can be re-balanced with another hour of work.',
    successVariants: {
      normalResult: 'Heavy and brutal, 1d12 slashing.',
      critSuccess: 'Exceptional balance — treat as balanced axe, no two-handed penalty to mobility.',
    },
    notes: 'The lawnmower blade is the best source of spring steel in the average ruin. Round blades from rotary mowers produce superior axes.',
  },

  // ── BOWS ────────────────────────────────────────────────

  {
    recipeId: 'craft-postapoc-scrap-bow',
    outputWeaponId: 'bow-scrap-lash-recurve',
    outputName: 'Scrap-Lash Recurve',
    station: 'field-craft',
    materials: [
      { item: 'Wood Planks', quantity: 2 },
      { item: 'Rubber Tubing', quantity: 2 },
      { item: 'Baling Wire', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 2,
    timeMinutes: 90,
    craftingDC: 12,
    failureResult: 'Limbs snap on first draw — no weapon produced, materials wasted.',
    successVariants: {
      normalResult: 'Functional recurve, range 40/120, 1d6 piercing.',
      critSuccess: 'Springs well — treat as a quality recurve, 1d6+1 and range 60/180.',
    },
    notes: 'Rubber tubing from vehicles is superior to natural rubber for the limb reinforcement role. Bicycle inner tube also works.',
  },

  {
    recipeId: 'craft-postapoc-salvaged-recurve',
    outputWeaponId: 'bow-salvaged-recurve',
    outputName: 'Salvaged Recurve Bow',
    station: 'tinkerers-bench',
    materials: [
      { item: 'Wood Planks', quantity: 3 },
      { item: 'Car Spring Steel', quantity: 1 },
      { item: 'Rubber Tubing', quantity: 1 },
      { item: 'Leather Scraps', quantity: 1 },
      { item: 'Baling Wire', quantity: 2 },
    ],
    skillRequired: 'engineering',
    skillLevel: 4,
    timeMinutes: 180,
    craftingDC: 15,
    failureResult: 'Bow is functional but weak — range halved until rebuilt.',
    successVariants: {
      normalResult: 'Full recurve bow, 1d8 piercing, range 60/240.',
      critSuccess: 'Exceptional craftsmanship — a bow any pre-war archer would respect. 1d8+1, range 80/320.',
    },
    notes: 'The spring steel reinforcement is what separates this from a basic scrap bow. Car leaf springs are ideal — consistent temper, known dimensions.',
  },

  // ── FIREARMS ────────────────────────────────────────────

  {
    recipeId: 'craft-postapoc-pipe-pistol',
    outputWeaponId: 'firearm-pipe-pistol',
    outputName: 'Pipe Pistol',
    station: 'tinkerers-bench',
    materials: [
      { item: 'Lead Pipe', quantity: 1 },
      { item: 'Engine Springs', quantity: 2 },
      { item: 'Scrap Metal', quantity: 2 },
      { item: 'Wire', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 3,
    timeMinutes: 120,
    craftingDC: 14,
    failureResult: 'Weapon fires once then jamming mechanism fails — permanently jammed pipe.',
    successVariants: {
      normalResult: 'Functional pipe pistol, 1d6 piercing, range 25/60. Jams on 1.',
      critSuccess: 'Reliable mechanism — jam threshold reduced to only natural 1, range improved to 30/90.',
    },
    notes: 'The spring is the hardest part of the mechanism. Sewing machine springs are too weak. Car starter springs are too unpredictable. Clock springs, if you can find them, are ideal. If you cannot source appropriate springs, the firing mechanism is unreliable.',
  },

  {
    recipeId: 'craft-postapoc-scrap-rifle',
    outputWeaponId: 'firearm-scrap-rifle',
    outputName: 'Scrap Rifle',
    station: 'tinkerers-bench',
    materials: [
      { item: 'Lead Pipe', quantity: 2 },
      { item: 'Engine Springs', quantity: 3 },
      { item: 'Scrap Metal', quantity: 3 },
      { item: 'Wood Planks', quantity: 1 },
      { item: 'Wire', quantity: 2 },
      { item: 'Pre-War Components', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 5,
    timeMinutes: 240,
    craftingDC: 16,
    failureResult: 'Weapon is dangerously unbalanced — first shot has 50% chance of exploding, dealing 1d8 damage to the user.',
    successVariants: {
      normalResult: 'Long rifle, 2d8 piercing, range 80/200. Jams on 1-2.',
      critSuccess: 'Surprisingly precise. Range 100/300, jam only on natural 1.',
    },
    notes: 'The barrel must be thick enough to contain the pressure. Irrigation pipe can work if the wall thickness exceeds 3/16 inch. Thinner and the barrel expands unpredictably. Pre-war components refers to the trigger mechanism — the mechanical complexity here exceeds raw improvisation without something to work from.',
  },

  // ── AMMUNITION ──────────────────────────────────────────

  {
    recipeId: 'craft-postapoc-crude-ammo',
    outputWeaponId: 'ammo-crude-bullets',
    outputName: 'Crude Bullets (10)',
    station: 'tinkerers-bench',
    materials: [
      { item: 'Lead Shot', quantity: 2 },
      { item: 'Gunpowder', quantity: 1 },
      { item: 'Scrap Metal', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 2,
    timeMinutes: 45,
    craftingDC: 10,
    failureResult: 'Rounds are inconsistent — 25% chance any given round is a dud.',
    successVariants: {
      normalResult: '10 serviceable crude bullets. 5% dud rate.',
      critSuccess: '12 clean rounds. No dud rate.',
    },
    notes: 'Caliber matching the pipe pistol or scrap rifle requires awareness of the chamber diameter. A crude caliper gauge can be made from scrap. Without caliber matching, there is a chance of stuck rounds.',
  },

  {
    recipeId: 'craft-postapoc-arrows',
    outputWeaponId: 'ammo-scrap-arrows',
    outputName: 'Scrap-Tipped Arrows (20)',
    station: 'field-craft',
    materials: [
      { item: 'Wood Planks', quantity: 2 },
      { item: 'Scrap Metal', quantity: 1 },
      { item: 'Baling Wire', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 1,
    timeMinutes: 60,
    craftingDC: 8,
    failureResult: 'Arrows are poorly fletched — range halved until re-fletched.',
    successVariants: {
      normalResult: '20 functional arrows.',
      critSuccess: '25 arrows including 5 unusually well-balanced ones with +1 to attack.',
    },
    notes: 'Straight grain wood is essential. Pre-war wood is often warped from time and moisture. Freshly split green wood should be dried for at least 2 hours by fire before use. Plastic cargo zip-ties can substitute for fletching feathers in a pinch.',
  },

  // ── TRAPS & TOOLS ────────────────────────────────────────

  {
    recipeId: 'craft-postapoc-caltrops',
    outputWeaponId: 'trap-caltrops',
    outputName: 'Caltrops (10)',
    station: 'field-craft',
    materials: [
      { item: 'Nails', quantity: 8 },
      { item: 'Baling Wire', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 1,
    timeMinutes: 20,
    craftingDC: 7,
    notes: 'Four nails wired together at right angles. One point always faces up when the rest are on the ground. This is geometry, not craft.',
  },

  {
    recipeId: 'craft-postapoc-spike-trap',
    outputWeaponId: 'trap-spike-floor',
    outputName: 'Floor Spike Trap',
    station: 'field-craft',
    materials: [
      { item: 'Scrap Metal', quantity: 2 },
      { item: 'Wood Planks', quantity: 1 },
      { item: 'Nails', quantity: 4 },
    ],
    skillRequired: 'engineering',
    skillLevel: 2,
    timeMinutes: 30,
    craftingDC: 10,
    notes: 'Concealed under thin debris. Activates when weight exceeds 30lbs. Deals 1d10 piercing to unaware creatures. DC 12 Perception to spot.',
  },

  {
    recipeId: 'craft-postapoc-molotov',
    outputWeaponId: 'throwable-molotov',
    outputName: 'Molotov Cocktail',
    station: 'field-craft',
    materials: [
      { item: 'Rubber Tubing', quantity: 0 },
      { item: 'Broken Glass', quantity: 1 }, // the bottle
      { item: 'Rope Scraps', quantity: 1 },  // the wick
    ],
    skillRequired: 'alchemy',
    skillLevel: 1,
    timeMinutes: 10,
    craftingDC: 8,
    failureResult: 'Fuel mixture is off — burns for half duration or doesn\'t ignite.',
    successVariants: {
      normalResult: 'Deals 2d6 fire damage in 5ft radius on impact. Continues burning 1d4 rounds.',
      critSuccess: '3d6 fire damage, 10ft radius.',
    },
    notes: 'Fuel is the limiting factor. Motor oil works but burns poorly. Gasoline is ideal but evaporates from cracked containers. Alcohol works if concentrated enough. The bottle must be glass — plastic melts before impact.',
  },

  {
    recipeId: 'craft-postapoc-blowgun',
    outputWeaponId: 'exotic-blowgun',
    outputName: 'Blowgun',
    station: 'field-craft',
    materials: [
      { item: 'Lead Pipe', quantity: 1 },
      { item: 'Leather Scraps', quantity: 1 },
    ],
    skillRequired: 'engineering',
    skillLevel: 1,
    timeMinutes: 20,
    craftingDC: 7,
    notes: 'Select pipe with interior bore appropriate for darts (approximately 1cm). Smooth the ends. A mouth guard of wrapped leather prevents lip cuts during use.',
  },
];

// ── Lookup helpers ────────────────────────────────────────

export function getRecipeByWeaponId(weaponId: string): PostApocCraftingRecipe | undefined {
  return POST_APOC_RECIPES.find(r => r.outputWeaponId === weaponId);
}

export function getRecipesByStation(station: PostApocStation): PostApocCraftingRecipe[] {
  return POST_APOC_RECIPES.filter(r => r.station === station);
}

export function getRecipesBySkillLevel(maxSkillLevel: number): PostApocCraftingRecipe[] {
  return POST_APOC_RECIPES.filter(r => r.skillLevel <= maxSkillLevel);
}
