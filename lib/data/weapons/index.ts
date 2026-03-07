// ============================================================
// WEAPONS — INDEX BARREL
// Single import point for all weapon catalog data.
// ============================================================

export { BOWS } from './bows';
export { SWORDS } from './swords';
export { AXES } from './axes';
export { KNIVES } from './knives';
export { POLEARMS } from './polearms';
export { BLUNT_WEAPONS } from './blunt';
export { EXOTIC_WEAPONS } from './exotic';
export { FIREARMS } from './firearms';
export { ENERGY_WEAPONS } from './energy';

export type {
  WeaponCatalogEntry,
  WeaponCategory,
  WeaponSubtype,
  WeaponDamageType,
  ArchetypeTag,
  BowSubtype,
  SwordSubtype,
  AxeSubtype,
  KnifeSubtype,
  PolearmSubtype,
  BluntSubtype,
  ExoticSubtype,
  FirearmSubtype,
  EnergyWeaponSubtype,
} from './types';

import type { WeaponCatalogEntry } from './types';
import { BOWS } from './bows';
import { SWORDS } from './swords';
import { AXES } from './axes';
import { KNIVES } from './knives';
import { POLEARMS } from './polearms';
import { BLUNT_WEAPONS } from './blunt';
import { EXOTIC_WEAPONS } from './exotic';
import { FIREARMS } from './firearms';
import { ENERGY_WEAPONS } from './energy';

/**
 * All weapons from all categories combined.
 * Use this for search, generation, and catalog UI.
 */
export const ALL_WEAPONS: WeaponCatalogEntry[] = [
  ...BOWS,
  ...SWORDS,
  ...AXES,
  ...KNIVES,
  ...POLEARMS,
  ...BLUNT_WEAPONS,
  ...EXOTIC_WEAPONS,
  ...FIREARMS,
  ...ENERGY_WEAPONS,
];

/**
 * Look up a weapon by its catalog ID
 */
export function getWeaponById(id: string): WeaponCatalogEntry | undefined {
  return ALL_WEAPONS.find(w => w.id === id);
}

/**
 * Get all weapons for a given genre family
 */
export function getWeaponsForGenre(genreFamily: string): WeaponCatalogEntry[] {
  return ALL_WEAPONS.filter(w => w.genreFamilies.includes(genreFamily as never));
}

/**
 * Get all weapons tagged for a specific archetype
 */
export function getWeaponsForArchetype(archetype: string): WeaponCatalogEntry[] {
  return ALL_WEAPONS.filter(w => w.archetypeTags.includes(archetype as never));
}

/**
 * Get all craftable (non-craftingOnly) weapons
 */
export function getCraftableWeapons(): WeaponCatalogEntry[] {
  return ALL_WEAPONS.filter(w => w.craftable);
}

/**
 * Get all post-apoc crafting-only weapons
 */
export function getCraftingOnlyWeapons(): WeaponCatalogEntry[] {
  return ALL_WEAPONS.filter(w => w.craftingOnly);
}

/**
 * Get weapons by rarity
 */
export function getWeaponsByRarity(rarity: string): WeaponCatalogEntry[] {
  return ALL_WEAPONS.filter(w => w.rarity === rarity);
}

/**
 * Search weapons by name (case-insensitive partial match)
 */
export function searchWeapons(query: string): WeaponCatalogEntry[] {
  const q = query.toLowerCase();
  return ALL_WEAPONS.filter(
    w => w.name.toLowerCase().includes(q) ||
         w.description.toLowerCase().includes(q) ||
         w.tags.some(t => t.includes(q))
  );
}
