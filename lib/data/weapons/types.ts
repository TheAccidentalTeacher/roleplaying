// ============================================================
// WEAPON CATALOG — SHARED TYPES
// Defines the structure for every curated weapon entry.
// These are CANONICAL weapon definitions; the AI writes
// narrative around them, not stats.
// ============================================================

import type { ItemRarity, WeaponProperty } from '@/lib/types/items';
import type { GenreFamily } from '@/lib/data/genre-equipment';

// ── Archetype Tags ─────────────────────────────────────────
// Playstyle archetypes that prefer certain weapon families.
// One weapon can belong to multiple archetypes.

export type ArchetypeTag =
  | 'stealth-archer'   // Skyrim-style: sneak + ranged, never seen
  | 'beastmaster'      // Dar-style: animal companion, mid-range
  | 'ranger'           // Classic wilderness fighter, bow + blade
  | 'assassin'         // Knife work, close quarters, disappear
  | 'sniper'           // Maximum range, patience, one shot
  | 'duelist'          // One-on-one melee, finesse preferred
  | 'berserker'        // Heavy weapons, reckless, two-handed
  | 'paladin'          // Holy warrior, heavy armor compatible
  | 'mage'             // Spellcaster primary, weapons secondary
  | 'battle-mage'      // Magic + blade hybrid
  | 'rogue'            // Dual light weapons, opportunistic
  | 'pirate'           // Firearms + cutlass, nautical
  | 'samurai'          // Katana + honor, Japanese martial
  | 'shinobi'          // Ninja: throwing, concealed, swift
  | 'wasteland-survivor' // Post-apoc improvisation + crafting
  | 'tech-soldier'     // Military-grade gear, disciplined
  | 'techno-assassin'  // Cyber-tech stealth: energy pistol + vibro-knife
  | 'bounty-hunter'    // Ranged primary, restraint tools
  | 'gladiator'        // Arena combat, showmanship
  | 'hunter'           // Wilderness, survival, versatile
  | 'barbarian';       // Primal strength, natural weapons

// ── Weapon Sub-types ───────────────────────────────────────

export type BowSubtype =
  | 'shortbow'
  | 'recurve-bow'
  | 'longbow'
  | 'greatbow'
  | 'composite-bow'
  | 'compound-bow'
  | 'crossbow'
  | 'hand-crossbow'
  | 'heavy-crossbow'
  | 'repeating-crossbow'
  | 'wrist-crossbow'
  | 'yumi'
  | 'horsebow'
  | 'sling'
  | 'bound-bow'
  | 'energy-bow';

export type SwordSubtype =
  | 'shortsword'
  | 'longsword'
  | 'greatsword'
  | 'rapier'
  | 'scimitar'
  | 'cutlass'
  | 'katana'
  | 'wakizashi'
  | 'nodachi'
  | 'falchion'
  | 'claymore'
  | 'broadsword'
  | 'gladius'
  | 'saber'
  | 'estoc'
  | 'flamberge'
  | 'brand'         // magical/legendary generic
  | 'bastard-sword'  // hand-and-a-half
  | 'vibroblade'
  | 'energy-sword';

export type AxeSubtype =
  | 'handaxe'
  | 'battleaxe'
  | 'greataxe'
  | 'hatchet'
  | 'tomahawk'
  | 'executioner-axe'
  | 'bearded-axe'
  | 'dwarven-axe'
  | 'orcish-axe'
  | 'war-fan'        // tessen — iron war fan
  | 'plasma-axe';

export type KnifeSubtype =
  | 'dagger'
  | 'stiletto'
  | 'seax'
  | 'bowie-knife'
  | 'kukri'
  | 'hunting-knife'
  | 'throwing-knife'
  | 'combat-knife'
  | 'push-dagger'
  | 'katar'          // punch dagger
  | 'tanto'
  | 'kunai'
  | 'switchblade'
  | 'ceramic-blade'
  | 'vibro-knife'
  | 'molecular-knife';

export type PolearmSubtype =
  | 'spear'
  | 'pike'
  | 'halberd'
  | 'glaive'
  | 'naginata'
  | 'yari'
  | 'trident'
  | 'partisan'
  | 'lance'
  | 'javelin'
  | 'force-staff'
  | 'plasma-lance';

export type BluntSubtype =
  | 'club'
  | 'mace'
  | 'flail'
  | 'morningstar'
  | 'warhammer'
  | 'maul'
  | 'quarterstaff'
  | 'bo-staff'
  | 'tonfa'
  | 'nunchaku'
  | 'pipe'
  | 'shock-baton'
  | 'gravity-hammer';

export type ExoticSubtype =
  | 'whip'
  | 'net'
  | 'chakram'
  | 'shuriken'
  | 'blowgun'
  | 'bola'
  | 'chain-sickle'
  | 'war-scythe'
  | 'mancatcher'
  | 'kama'
  | 'sai'
  | 'rope-dart'
  | 'hook-sword'
  | 'neural-whip';

export type FirearmSubtype =
  | 'flintlock-pistol'
  | 'flintlock-musket'
  | 'revolver'
  | 'pistol'
  | 'rifle'
  | 'shotgun'
  | 'carbine'
  | 'submachine-gun'
  | 'sniper-rifle'
  | 'derringer'
  | 'hand-cannon'
  | 'blunderbuss'
  | 'pepperbox';

export type EnergyWeaponSubtype =
  | 'laser-rifle'
  | 'laser-pistol'
  | 'plasma-rifle'
  | 'plasma-pistol'
  | 'rail-gun'
  | 'gauss-rifle'
  | 'pulse-pistol'
  | 'blaster'
  | 'stasis-projector'
  | 'arc-caster'
  | 'photon-lance';

export type WeaponSubtype =
  | BowSubtype
  | SwordSubtype
  | AxeSubtype
  | KnifeSubtype
  | PolearmSubtype
  | BluntSubtype
  | ExoticSubtype
  | FirearmSubtype
  | EnergyWeaponSubtype;

export type WeaponCategory =
  | 'bow'
  | 'sword'
  | 'axe'
  | 'knife'
  | 'polearm'
  | 'blunt'
  | 'exotic'
  | 'firearm'
  | 'energy';

export type WeaponDamageType =
  | 'piercing'
  | 'slashing'
  | 'bludgeoning'
  | 'fire'
  | 'lightning'
  | 'cold'
  | 'radiant'
  | 'necrotic'
  | 'psychic'
  | 'force'
  | 'acid'
  | 'poison'
  | 'energy'       // generic sci-fi energy
  | 'radiation';

// ── Weapon Catalog Entry ───────────────────────────────────

export interface WeaponCatalogEntry {
  id: string;
  name: string;
  category: WeaponCategory;
  subtype: WeaponSubtype;

  /** Which genre families this weapon appears in as a natural item */
  genreFamilies: GenreFamily[];

  /** Archetypes that naturally gravitate toward this weapon */
  archetypeTags: ArchetypeTag[];

  // ── Mechanics ──────────────────────────────────────────
  damage: string;                 // e.g. "1d8", "2d6"
  damageType: WeaponDamageType;
  properties: WeaponProperty[];   // finesse, heavy, light, two-handed, etc.
  range?: {
    normal: number;               // in feet
    max: number;
  };
  versatileDamage?: string;       // if versatile property, two-handed damage
  areaOfEffect?: string;          // e.g. "5ft radius" for splash weapons

  // ── Identity ───────────────────────────────────────────
  rarity: ItemRarity;

  /**
   * In-world description — what the item IS.
   * Written from the perspective of someone who has held it.
   */
  description: string;

  /**
   * Short flavor text — appears in item tooltip / examine screen.
   * Should evoke emotion, not just describe.
   */
  flavorText: string;

  /**
   * Optional deeper lore — whispered history, legend, origin.
   * Only shown on inspection or with lore skill.
   */
  loreText?: string;

  // ── Crafting ───────────────────────────────────────────
  craftable: boolean;

  /**
   * If true, this item CANNOT be found as loot or purchased —
   * it must be crafted. Used for post-apocalypse tier-1 weapons
   * where finding a pristine blade strains immersion.
   */
  craftingOnly: boolean;

  /** Recipe ID in the crafting catalog */
  craftingRecipeId?: string;

  // ── Special Abilities ──────────────────────────────────
  specialAbility?: string;
  specialAbilityDescription?: string;

  /**
   * Whether the character must attune to this weapon
   * (use one attunement slot) to access special abilities.
   */
  requiresAttunement: boolean;

  // ── Meta ───────────────────────────────────────────────
  /** Hint passed to image generation AI for visual accuracy */
  imagePromptHint?: string;

  /** Freeform tags for searching, filtering, set bonuses */
  tags: string[];

  /** Weight in pounds / encumbrance units */
  weight: number;

  /** Base gold value */
  baseValue: number;
}
