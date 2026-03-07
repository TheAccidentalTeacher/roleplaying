// ============================================================
// ITEM AFFIXES — Prefix and Suffix system for proc-gen gear
// Affixes modify weapon catalog entries at generation time.
// A weapon's final name = [Prefix?] BaseName [Suffix?]
// Example: "Shadowstrike Nightwatcher Bow of the Hawk"
// ============================================================

import type { ItemRarity, WeaponProperty } from '@/lib/types/items';
import type { WeaponCategory } from '@/lib/data/weapons/types';

// ── Stat Bonus Schema ─────────────────────────────────────

export interface AffixStatBonus {
  attackBonus?: number;         // + to attack rolls
  damageBonus?: number;         // + flat damage
  damageDice?: string;          // extra dice, e.g. "1d4"
  damageDiceType?: string;      // damage type of the extra dice
  range?: number;               // +ft to normal range
  critRange?: number;           // crit threshold reduction (e.g. -1 = 19-20)
  speed?: number;               // +ft movement (for light weapons)
  armorPenetration?: number;    // reduce target AC by this much
  stealth?: number;             // +/- stealth checks
  perception?: number;          // + perception checks
  initiative?: number;          // + initiative
  stealthDifference?: number;   // opponent -X perception when tracking
}

// ── Affix Definition ─────────────────────────────────────

export interface ItemAffix {
  id: string;
  name: string;
  type: 'prefix' | 'suffix';
  applicableTo: WeaponCategory[] | 'all-weapons' | 'all-bows' | 'all-melee' | 'all-ranged';
  statBonus: AffixStatBonus;
  specialEffect?: string;
  specialEffectDescription?: string;
  rarityTier: ItemRarity;
  flavorHint: string;           // guides AI description generation
  addedProperties?: WeaponProperty[];
  incompatibleWith?: string[];  // affix IDs that cannot stack with this
}

// ══════════════════════════════════════════════════════════
// BOW PREFIXES — 15 entries
// ══════════════════════════════════════════════════════════

export const BOW_PREFIXES: ItemAffix[] = [

  // === COMMON TIER ===

  {
    id: 'prefix-swift',
    name: 'Swift',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1 },
    rarityTier: 'common',
    flavorHint: 'lightweight, quick-draw, well-balanced',
  },

  {
    id: 'prefix-iron',
    name: 'Iron',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { damageBonus: 1 },
    rarityTier: 'common',
    flavorHint: 'iron-tipped arrows, heavier draw, reliable',
  },

  // === UNCOMMON TIER ===

  {
    id: 'prefix-swiftwood',
    name: 'Swiftwood',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, range: 20 },
    rarityTier: 'uncommon',
    flavorHint: 'light springwood limbs, arrows travel faster, longer reach',
  },

  {
    id: 'prefix-shadow',
    name: 'Shadowstrike',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, stealth: 2 },
    rarityTier: 'uncommon',
    flavorHint: 'near-silent release, dark-treated wood, shadow-infused arrows',
    addedProperties: [],
    specialEffect: 'Silent Shot',
    specialEffectDescription: 'Ranged attacks with this bow do not break stealth if made from concealment.',
  },

  {
    id: 'prefix-verdant',
    name: 'Verdant',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { damageDice: '1d4', damageDiceType: 'poison' },
    rarityTier: 'uncommon',
    flavorHint: 'living wood still sprouting, sap-tipped arrows, nature energy',
    specialEffect: 'Poison Sap',
    specialEffectDescription: 'Arrows deal additional 1d4 poison damage.',
  },

  {
    id: 'prefix-stalkers',
    name: "Stalker's",
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, perception: 2 },
    rarityTier: 'uncommon',
    flavorHint: 'hunting bow, ranger-favored, notched for practiced hand',
  },

  // === RARE TIER ===

  {
    id: 'prefix-phantom',
    name: 'Phantom',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 2, stealth: 3 },
    rarityTier: 'rare',
    flavorHint: 'near-invisible limbs, arrows leave no visual trail, ghost-touched',
    addedProperties: ['magical'],
    specialEffect: 'Traceless',
    specialEffectDescription: 'Arrows fired leave no physical evidence of direction. Impossible to determine their source from the wound.',
  },

  {
    id: 'prefix-void-kissed',
    name: 'Void-Kissed',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, damageDice: '1d6', damageDiceType: 'necrotic' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'darkness-touched limbs, arrows trailing shadow, necrotic energy infused',
    specialEffect: 'Void Touch',
    specialEffectDescription: 'Arrows deal additional 1d6 necrotic damage. Healing received by the target is halved until the start of your next turn.',
  },

  {
    id: 'prefix-runemarked',
    name: 'Runemarked',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 2, damageBonus: 2 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'runes carved into limbs, magical reinforcement, glowing faintly at draw',
  },

  // === LEGENDARY TIER ===

  {
    id: 'prefix-gloom',
    name: 'Gloom',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 2, stealth: 5, damageDice: '1d8', damageDiceType: 'necrotic' },
    rarityTier: 'legendary',
    addedProperties: ['magical'],
    flavorHint: 'absolute darkness in the grain, shadow-realm origin, feared by light',
    specialEffect: 'Living Shadow',
    specialEffectDescription: 'While weilding this bow you have advantage on Stealth checks. When attacking from darkness, you are considered hidden even after the attack.',
    incompatibleWith: ['prefix-sunlit'],
  },

  {
    id: 'prefix-sunlit',
    name: 'Sunlit',
    type: 'prefix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 2, damageDice: '1d6', damageDiceType: 'radiant' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'warm glow in the grain, spirit of the archer sun-blessed',
    specialEffect: 'Radiant Arrow',
    specialEffectDescription: 'Arrows glow against undead and fiends, dealing double the extra dice damage against these creature types.',
    incompatibleWith: ['prefix-gloom'],
  },
];

// ══════════════════════════════════════════════════════════
// BOW SUFFIXES — 10 entries
// ══════════════════════════════════════════════════════════

export const BOW_SUFFIXES: ItemAffix[] = [

  {
    id: 'suffix-hawk',
    name: 'of the Hawk',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { range: 30, perception: 3 },
    rarityTier: 'uncommon',
    flavorHint: 'hawk-spirit blessed, finds distant targets, keen-eyed precision',
  },

  {
    id: 'suffix-hunter',
    name: 'of the Hunter',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, damageDice: '1d4', damageDiceType: 'piercing' },
    rarityTier: 'uncommon',
    flavorHint: 'hunter\'s instinct, aim for vitals, seasoned ranger heritage',
    specialEffect: 'Vital Strike',
    specialEffectDescription: 'On a crit, deal an extra 1d4 damage per arrow fired.',
  },

  {
    id: 'suffix-silence',
    name: 'of Silence',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { stealth: 4 },
    rarityTier: 'uncommon',
    addedProperties: ['magical'],
    flavorHint: 'utterly silent release, muffled limbs, no telltale twang',
    specialEffect: 'Silent String',
    specialEffectDescription: 'The bow makes no sound when drawn or released.',
  },

  {
    id: 'suffix-unerring-aim',
    name: 'of Unerring Aim',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 2 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'arrows correct their own trajectory, flight-path enchantment',
    specialEffect: 'Guided Arrow',
    specialEffectDescription: 'Once per turn, if you miss with this bow, you may reroll the attack roll.',
  },

  {
    id: 'suffix-wild',
    name: 'of the Wild',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, damageDice: '1d4', damageDiceType: 'piercing' },
    rarityTier: 'uncommon',
    flavorHint: 'wildwood spirit, primal forest energy, beast-companion resonance',
    specialEffect: 'Pack Resonance',
    specialEffectDescription: 'If a creature hit by this bow is bloodied (below half HP), any animal companion you control has advantage on their next attack against that target.',
  },

  {
    id: 'suffix-twilight',
    name: 'of Twilight',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { attackBonus: 1, stealth: 2 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'born from dusk light, between-state weapon, dawn and dark',
    specialEffect: 'Liminal',
    specialEffectDescription: 'In conditions of dim light, you gain advantage on attack rolls.',
  },

  {
    id: 'suffix-first-shot',
    name: 'of the First Shot',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { initiative: 3, damageDice: '2d6', damageDiceType: 'piercing' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'tuned for the opening volley, first-strike philosophy, ambush-ready',
    specialEffect: 'Opening Shot',
    specialEffectDescription: 'Your first attack in combat with this bow deals +2d6 damage.',
    incompatibleWith: [],
  },

  {
    id: 'suffix-the-forest',
    name: 'of the Forest',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { stealth: 3, range: 15 },
    rarityTier: 'uncommon',
    flavorHint: 'woodland attuned, natural camouflage resonance, tree-spirit blessed',
  },

  {
    id: 'suffix-last-arrow',
    name: 'of the Last Arrow',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { critRange: -2, attackBonus: 3 },
    rarityTier: 'legendary',
    addedProperties: ['magical'],
    flavorHint: 'never wasted, final desperation legendary precision, the one that always finds its mark',
    specialEffect: 'No Wasted Shot',
    specialEffectDescription: 'When you have only one arrow left, you have advantage on the attack roll and it automatically critically hits.',
  },

  {
    id: 'suffix-storms',
    name: 'of Storms',
    type: 'suffix',
    applicableTo: 'all-bows',
    statBonus: { damageDice: '1d6', damageDiceType: 'lightning' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'lightning-charged arrows, spark on impact, storm-touched bowstring',
    specialEffect: 'Lightning Bolt',
    specialEffectDescription: 'On a critical hit, a lightning bolt leaps to a second creature within 15ft for 2d6 lightning damage.',
  },
];

// ══════════════════════════════════════════════════════════
// MELEE PREFIXES — 10 entries
// ══════════════════════════════════════════════════════════

export const MELEE_PREFIXES: ItemAffix[] = [

  {
    id: 'prefix-keen',
    name: 'Keen',
    type: 'prefix',
    applicableTo: 'all-melee',
    statBonus: { critRange: -1, attackBonus: 1 },
    rarityTier: 'uncommon',
    flavorHint: 'honed edge, hair-splitting sharpness, precision ground',
  },

  {
    id: 'prefix-brutal',
    name: 'Brutal',
    type: 'prefix',
    applicableTo: ['axe', 'blunt', 'sword'],
    statBonus: { damageBonus: 2, attackBonus: -1 },
    rarityTier: 'uncommon',
    flavorHint: 'weighted heavy, impact-focused, massive-force design',
  },

  {
    id: 'prefix-balanced',
    name: 'Balanced',
    type: 'prefix',
    applicableTo: 'all-melee',
    statBonus: { attackBonus: 2, initiative: 1 },
    rarityTier: 'uncommon',
    flavorHint: 'perfectly balanced, quick in hand, responsive blade',
  },

  {
    id: 'prefix-bloodthirsty',
    name: 'Bloodthirsty',
    type: 'prefix',
    applicableTo: ['axe', 'sword', 'knife'],
    statBonus: { damageDice: '1d4', damageDiceType: 'slashing' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'hunger in the steel, seeks blood, battle-joy enchantment',
    specialEffect: 'Bloodlust',
    specialEffectDescription: 'After killing a creature, your next attack roll is made with advantage.',
  },

  {
    id: 'prefix-sacred',
    name: 'Sacred',
    type: 'prefix',
    applicableTo: 'all-melee',
    statBonus: { damageDice: '1d4', damageDiceType: 'radiant' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'blessed by divine, holy radiance in the edge, undead bane',
    specialEffect: 'Holy Edge',
    specialEffectDescription: 'Deals double the extra radiant damage to undead and fiends.',
  },

  {
    id: 'prefix-shadow-blade',
    name: 'Shadowsteel',
    type: 'prefix',
    applicableTo: ['sword', 'knife', 'polearm'],
    statBonus: { attackBonus: 2, stealth: 2 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'darkness-forged steel, minimal light reflection, shadow-realm metal',
    specialEffect: 'Dark Metal',
    specialEffectDescription: 'This weapon produces no reflective glint. Impossible to spot by light-reflection.',
  },

  {
    id: 'prefix-quickdraw',
    name: 'Quickdraw',
    type: 'prefix',
    applicableTo: ['knife', 'sword'],
    statBonus: { initiative: 3, attackBonus: 1 },
    rarityTier: 'uncommon',
    flavorHint: 'optimized scabbard draw, hair-trigger balance, first-strike design',
    specialEffect: 'Fast Draw',
    specialEffectDescription: 'Drawing this weapon does not cost an action or use the object-interaction allowance.',
  },

  {
    id: 'prefix-runic',
    name: 'Runic',
    type: 'prefix',
    applicableTo: 'all-melee',
    statBonus: { attackBonus: 2, damageBonus: 2 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'ancient runes etched deep, magical bond to wielder, northerner craft',
  },

  {
    id: 'prefix-eldritch',
    name: 'Eldritch',
    type: 'prefix',
    applicableTo: 'all-melee',
    statBonus: { damageDice: '1d8', damageDiceType: 'necrotic', attackBonus: 2 },
    rarityTier: 'legendary',
    addedProperties: ['magical'],
    flavorHint: 'cosmic horror origin, dimensional instability, sanity-adjacent',
    specialEffect: 'Touch of the Void',
    specialEffectDescription: 'Creatures hit must make a Wisdom save (DC 14) or be Frightened until the end of their next turn.',
  },

  {
    id: 'prefix-ancient',
    name: 'Ancient',
    type: 'prefix',
    applicableTo: 'all-melee',
    statBonus: { attackBonus: 1, damageBonus: 1 },
    rarityTier: 'uncommon',
    flavorHint: 'old-world craft, aged metal still sharp, history visible in the edge',
    specialEffect: 'Ancestral Memory',
    specialEffectDescription: 'Against creature types that this weapon has historically been used against (determined per weapon), +2 to damage.',
  },
];

// ══════════════════════════════════════════════════════════
// MELEE SUFFIXES — 8 entries
// ══════════════════════════════════════════════════════════

export const MELEE_SUFFIXES: ItemAffix[] = [

  {
    id: 'suffix-slaying',
    name: 'of Slaying',
    type: 'suffix',
    applicableTo: 'all-melee',
    statBonus: { damageDice: '2d6', damageDiceType: 'piercing' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'purpose-built kill tool, creature-type hunter, fulfillment in use',
    specialEffect: 'Slayer',
    specialEffectDescription: 'Choose a creature type when attuned. Against that type, deal maximum damage on the extra dice.',
  },

  {
    id: 'suffix-the-fallen',
    name: 'of the Fallen',
    type: 'suffix',
    applicableTo: 'all-melee',
    statBonus: { attackBonus: 1, damageBonus: 1 },
    rarityTier: 'uncommon',
    flavorHint: 'carries the weight of its dead, battle-legacy weapon, warrior ancestors',
  },

  {
    id: 'suffix-thunder',
    name: 'of Thunder',
    type: 'suffix',
    applicableTo: ['blunt', 'axe'],
    statBonus: { damageDice: '1d6', damageDiceType: 'thunder' },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'impact rings with thunder, sonic force, deafening on critical',
    specialEffect: 'Thunderclap',
    specialEffectDescription: 'On a critical hit, the impact produces a thunderclap in a 10ft radius. Creatures in range make DC 13 Constitution save or are Deafened for 1 minute.',
  },

  {
    id: 'suffix-speed',
    name: 'of Speed',
    type: 'suffix',
    applicableTo: ['sword', 'knife', 'polearm'],
    statBonus: { attackBonus: 1, initiative: 2 },
    rarityTier: 'uncommon',
    flavorHint: 'lighter than expected, movement-tuned balance, fast recovery',
    specialEffect: 'Flurry',
    specialEffectDescription: 'Once per short rest, you can make one additional attack as a bonus action.',
  },

  {
    id: 'suffix-the-bear',
    name: 'of the Bear',
    type: 'suffix',
    applicableTo: ['axe', 'blunt', 'sword'],
    statBonus: { damageBonus: 3 },
    rarityTier: 'rare',
    flavorHint: 'primal strength, bear-spirit infused, maximum impact philosophy',
  },

  {
    id: 'suffix-dragon',
    name: 'of the Dragon',
    type: 'suffix',
    applicableTo: 'all-melee',
    statBonus: { damageDice: '1d6', damageDiceType: 'fire', attackBonus: 1 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'dragon-touched metal, fire in the grain, draconic resonance',
    specialEffect: 'Dragon\'s Breath',
    specialEffectDescription: 'Once per long rest, as an action, breathe fire in a 15ft cone: 3d6 fire damage, Dexterity DC 13 for half.',
  },

  {
    id: 'suffix-ages',
    name: 'of Ages',
    type: 'suffix',
    applicableTo: 'all-melee',
    statBonus: { attackBonus: 2, damageBonus: 2 },
    rarityTier: 'legendary',
    addedProperties: ['magical'],
    flavorHint: 'time-layered enchantment, used by many generations, wisdom of past wielders',
    specialEffect: 'Inherited Mastery',
    specialEffectDescription: 'You are considered proficient with this weapon regardless of class. Roll twice on attacks outside your class weapon proficiency list.',
  },

  {
    id: 'suffix-ruin',
    name: 'of Ruin',
    type: 'suffix',
    applicableTo: 'all-melee',
    statBonus: { armorPenetration: 3, damageDice: '1d8', damageDiceType: 'force' },
    rarityTier: 'legendary',
    addedProperties: ['magical'],
    flavorHint: 'entropy made physical, decay-touch, armor-eating edge',
    specialEffect: 'Entropic Edge',
    specialEffectDescription: 'Each hit permanently reduces the target\'s armor by 1 (max -3) until repaired. Armor reduced to 0 bonus is destroyed.',
  },
];

// ══════════════════════════════════════════════════════════
// FIREARM / ENERGY AFFIXES — 6 entries
// ══════════════════════════════════════════════════════════

export const TECH_AFFIXES: ItemAffix[] = [

  {
    id: 'prefix-modded',
    name: 'Modded',
    type: 'prefix',
    applicableTo: ['firearm', 'energy'],
    statBonus: { attackBonus: 1, damageBonus: 1 },
    rarityTier: 'uncommon',
    flavorHint: 'field-modified, aftermarket parts, tinkered beyond specs',
    specialEffect: 'Custom Internals',
    specialEffectDescription: 'Reload time halved.',
  },

  {
    id: 'prefix-mil-spec',
    name: 'Mil-Spec',
    type: 'prefix',
    applicableTo: ['firearm', 'energy'],
    statBonus: { attackBonus: 2, range: 40 },
    rarityTier: 'rare',
    flavorHint: 'military specification manufacturing, hardened tolerances, combat-proven',
  },

  {
    id: 'prefix-jury-rigged',
    name: 'Jury-Rigged',
    type: 'prefix',
    applicableTo: ['firearm'],
    statBonus: { damageBonus: 2 },
    rarityTier: 'common',
    flavorHint: 'barely held together, terrifyingly unpredictable, might explode',
    specialEffect: 'Volatile',
    specialEffectDescription: 'On a natural 1, the weapon explodes for 1d6 fire damage to the user and is destroyed.',
    incompatibleWith: ['prefix-mil-spec'],
  },

  {
    id: 'suffix-overcharged',
    name: 'Overcharged',
    type: 'suffix',
    applicableTo: ['energy'],
    statBonus: { damageDice: '1d6', damageDiceType: 'energy', attackBonus: 1 },
    rarityTier: 'rare',
    addedProperties: ['magical'],
    flavorHint: 'pushed beyond rated output, dangerous but spectacular',
    specialEffect: 'Overload',
    specialEffectDescription: 'Once per short rest, fire an overloaded shot for double dice damage. After firing, the weapon must cool down (1 minute).',
  },

  {
    id: 'suffix-silenced',
    name: 'Silenced',
    type: 'suffix',
    applicableTo: ['firearm'],
    statBonus: { stealth: 5 },
    rarityTier: 'rare',
    flavorHint: 'suppressor-fitted, subsonic loads, virtually silent operation',
    specialEffect: 'Silent Operation',
    specialEffectDescription: 'Ranged attacks with this weapon do not make sound audible beyond 30ft.',
  },

  {
    id: 'suffix-precision-scope',
    name: 'with Scope',
    type: 'suffix',
    applicableTo: ['firearm', 'energy'],
    statBonus: { range: 100, attackBonus: 2 },
    rarityTier: 'uncommon',
    flavorHint: 'magnified optics, precision-fitted, range-extending scope mount',
    specialEffect: 'Overwatch',
    specialEffectDescription: 'When you spend your action aiming (no movement), attacks before end of your next turn have advantage.',
  },
];

// ══════════════════════════════════════════════════════════
// MASTER AFFIX CATALOG
// ══════════════════════════════════════════════════════════

export const ALL_AFFIXES: ItemAffix[] = [
  ...BOW_PREFIXES,
  ...BOW_SUFFIXES,
  ...MELEE_PREFIXES,
  ...MELEE_SUFFIXES,
  ...TECH_AFFIXES,
];

/**
 * Get affixes applicable to a weapon category, optionally filtered by type and rarity
 */
export function getAffixesFor(
  category: WeaponCategory,
  options?: {
    type?: 'prefix' | 'suffix';
    maxRarity?: ItemRarity;
  }
): ItemAffix[] {
  const rarityOrder: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const maxIdx = options?.maxRarity ? rarityOrder.indexOf(options.maxRarity as ItemRarity) : rarityOrder.length - 1;

  const bowCategories: WeaponCategory[] = ['bow'];
  const meleeCategories: WeaponCategory[] = ['sword', 'axe', 'knife', 'polearm', 'blunt', 'exotic'];

  return ALL_AFFIXES.filter(affix => {
    // Filter by type if specified
    if (options?.type && affix.type !== options.type) return false;

    // Filter by max rarity
    const rarityIdx = rarityOrder.indexOf(affix.rarityTier as ItemRarity);
    if (rarityIdx > maxIdx) return false;

    // Check applicability
    if (affix.applicableTo === 'all-weapons') return true;
    if (affix.applicableTo === 'all-bows') return bowCategories.includes(category);
    if (affix.applicableTo === 'all-melee') return meleeCategories.includes(category);
    if (affix.applicableTo === 'all-ranged') return category === 'bow' || category === 'firearm' || category === 'energy';
    if (Array.isArray(affix.applicableTo)) return affix.applicableTo.includes(category);

    return false;
  });
}

/**
 * Roll a random affix for a weapon, weighted toward common
 */
export function rollAffix(
  category: WeaponCategory,
  type: 'prefix' | 'suffix',
  rarityTier: ItemRarity
): ItemAffix | null {
  const available = getAffixesFor(category, { type, maxRarity: rarityTier });
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}
