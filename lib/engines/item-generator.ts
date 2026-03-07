// ============================================================
// ITEM GENERATOR ENGINE
// Generates items, loot drops, and shop inventories using AI.
// Reference: BRAINSTORM.md Inventory & Items section
// ============================================================

import type { Item, ItemRarity, LootDrop, Material } from '@/lib/types/items';
import type { Genre } from '@/lib/types/world';
import { d4, d6, d8, d10 } from '@/lib/utils/dice';
import { getGenreCommonItems, resolveGenreFamily, type GenreFamily } from '@/lib/data/genre-equipment';
import {
  ALL_WEAPONS,
  getWeaponsForGenre,
  getWeaponsForArchetype,
  getWeaponsByRarity,
  type WeaponCatalogEntry,
} from '@/lib/data/weapons/index';
import type { ArchetypeTag, WeaponCategory } from '@/lib/data/weapons/types';
import { rollAffix, type ItemAffix } from '@/lib/data/item-affixes';

// ---- Rarity weights by encounter difficulty ----

const RARITY_WEIGHTS: Record<string, Record<ItemRarity, number>> = {
  easy:   { junk: 25, common: 50, uncommon: 20, rare: 4, 'very-rare': 1, epic: 0, legendary: 0, mythic: 0, artifact: 0 },
  medium: { junk: 10, common: 40, uncommon: 30, rare: 12, 'very-rare': 5, epic: 2, legendary: 1, mythic: 0, artifact: 0 },
  hard:   { junk: 5, common: 20, uncommon: 25, rare: 25, 'very-rare': 12, epic: 8, legendary: 4, mythic: 1, artifact: 0 },
  deadly: { junk: 0, common: 10, uncommon: 20, rare: 25, 'very-rare': 20, epic: 15, legendary: 8, mythic: 2, artifact: 0 },
  boss:   { junk: 0, common: 5, uncommon: 15, rare: 25, 'very-rare': 25, epic: 18, legendary: 10, mythic: 2, artifact: 0 },
};

// ---- Gold ranges by encounter difficulty ----

const GOLD_RANGES: Record<string, { min: number; max: number }> = {
  easy: { min: 1, max: 15 },
  medium: { min: 5, max: 40 },
  hard: { min: 15, max: 80 },
  deadly: { min: 30, max: 150 },
  boss: { min: 50, max: 300 },
};

// ---- Base value ranges by rarity ----

const RARITY_VALUE: Record<ItemRarity, { min: number; max: number }> = {
  junk:       { min: 0,     max: 2 },
  common:     { min: 1,     max: 15 },
  uncommon:   { min: 10,    max: 75 },
  rare:       { min: 50,    max: 500 },
  'very-rare': { min: 300,  max: 2500 },
  epic:       { min: 200,   max: 2000 },
  legendary:  { min: 1000,  max: 10000 },
  mythic:     { min: 5000,  max: 50000 },
  artifact:   { min: 25000, max: 100000 },
};

// ---- Utility: pick rarity from weighted table ----

export function pickRarity(difficulty: string): ItemRarity {
  const weights = RARITY_WEIGHTS[difficulty] || RARITY_WEIGHTS.medium;
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights) as [ItemRarity, number][]) {
    r -= weight;
    if (r <= 0) return rarity;
  }
  return 'common';
}

// ---- Generate gold for an encounter ----

export function generateGold(difficulty: string): number {
  const range = GOLD_RANGES[difficulty] || GOLD_RANGES.medium;
  return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
}

// ---- Generate item base value ----

export function generateBaseValue(rarity: ItemRarity): number {
  const range = RARITY_VALUE[rarity];
  return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
}

// ---- Build prompt for AI item generation ----

export function buildItemGenerationPrompt(params: {
  itemType?: string;
  rarity: ItemRarity;
  genre?: Genre;
  genreFamily?: GenreFamily;
  archetypeTag?: ArchetypeTag;
  characterLevel?: number;
  context?: string;
}): string {
  const { itemType, rarity, genre, genreFamily, archetypeTag, characterLevel, context } = params;

  // Pull catalog context if generating a weapon with known genre/archetype
  let catalogContext = '';
  if (itemType === 'weapon' && genreFamily) {
    const exampleWeapons = getWeaponsForGenre(genreFamily)
      .filter(w => w.rarity === rarity || w.rarity === 'common')
      .slice(0, 3)
      .map(w => `"${w.name}" (${w.subtype}, ${w.damage} ${w.damageType})`)
      .join(', ');
    if (exampleWeapons) {
      catalogContext = `\nCatalog examples for reference tone/scale: ${exampleWeapons}`;
    }
  }

  return `Generate a single RPG item as JSON.

Requirements:
- Rarity: ${rarity}
- ${itemType ? `Type: ${itemType}` : 'Any type appropriate to the context'}
- ${genre ? `Genre/setting: ${genre}` : genreFamily ? `Genre family: ${genreFamily}` : 'Standard fantasy'}
- ${archetypeTag ? `Archetype: ${archetypeTag}` : ''}
- ${characterLevel ? `Appropriate for level ${characterLevel}` : ''}
- ${context ? `Context: ${context}` : ''}${catalogContext}

Return ONLY valid JSON matching this structure (no markdown, no explanation):
{
  "name": "string",
  "type": "weapon|armor|shield|potion|scroll|consumable|magic|tool|ammunition|food|treasure|key|material",
  "subtype": "optional string",
  "rarity": "${rarity}",
  "description": "1-2 sentence mechanical description",
  "flavorText": "optional atmospheric text",
  "damage": "e.g. 1d8+2 (weapons only)",
  "damageType": "e.g. slashing (weapons only)",
  "armorClass": "number (armor only)",
  "properties": ["finesse", "light", etc. (weapons only)],
  "statBonuses": { "str": 0, "dex": 0, etc. },
  "specialEffects": ["effect descriptions"],
  "equippable": true/false,
  "equipSlot": "head|neck|chest|back|hands|belt|legs|feet|ring-l|ring-r|weapon-main|weapon-off|trinket-1|trinket-2",
  "stackable": true/false,
  "weight": number,
  "levelRequirement": number or null,
  "tags": ["descriptive", "tags"]
}`;
}

// ---- Create a placeholder item (non-AI, for junk/common) ----
// Default fantasy items kept as fallback; use getGenreCommonItems() for genre-aware items

const JUNK_ITEMS = [
  'Rusty Nail', 'Broken Tooth', 'Moth-eaten Cloth', 'Cracked Vial',
  'Bent Spoon', 'Faded Map Fragment', 'Rat Skull', 'Tarnished Button',
  'Crumbling Brick', 'Dried Herbs', 'Empty Flask', 'Worn Leather Strap',
];

const COMMON_WEAPONS = [
  'Iron Shortsword', 'Wooden Staff', 'Hunting Bow', 'Simple Dagger',
  'Light Crossbow', 'Quarterstaff', 'Handaxe', 'Javelin',
];

const COMMON_ARMOR = [
  'Leather Tunic', 'Padded Vest', 'Chainmail Shirt', 'Wooden Shield',
  'Leather Cap', 'Studded Bracers', 'Travel Boots', 'Iron Buckler',
];

const COMMON_CONSUMABLES = [
  'Healing Potion', 'Ration Pack', 'Torch', 'Rope (50ft)', 'Bandages',
  'Antidote', 'Lantern Oil', 'Waterskin', 'Chalk', 'Flint & Steel',
];

/**
 * Generate a simple non-AI item. Optionally genre-aware.
 * @param rarity - Item rarity
 * @param genreFamily - If provided, uses genre-appropriate item names
 */
export function generateSimpleItem(rarity: ItemRarity, genreFamily?: GenreFamily): Item {
  const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const baseValue = generateBaseValue(rarity);

  // Use genre-specific items if a genre family is provided
  const genreItems = genreFamily ? getGenreCommonItems(genreFamily) : null;
  const junkItems = genreItems?.junk ?? JUNK_ITEMS;
  const weapons = genreItems?.weapons ?? COMMON_WEAPONS;
  const armor = genreItems?.armor ?? COMMON_ARMOR;
  const consumables = genreItems?.consumables ?? COMMON_CONSUMABLES;

  if (rarity === 'junk') {
    const name = junkItems[Math.floor(Math.random() * junkItems.length)];
    return createItem(id, name, 'material', rarity, name, baseValue, false, 1);
  }

  // For common items, randomly pick weapon/armor/consumable
  const category = d6();
  if (category <= 2) {
    const name = weapons[Math.floor(Math.random() * weapons.length)];
    return createItem(id, name, 'weapon', rarity, `A standard ${name.toLowerCase()}.`, baseValue, true, d8());
  } else if (category <= 4) {
    const name = armor[Math.floor(Math.random() * armor.length)];
    return createItem(id, name, 'armor', rarity, `A common ${name.toLowerCase()}.`, baseValue, true, d10());
  } else {
    const name = consumables[Math.floor(Math.random() * consumables.length)];
    return createItem(id, name, 'consumable', rarity, `A useful ${name.toLowerCase()}.`, baseValue, false, 0.5);
  }
}

function createItem(
  id: string,
  name: string,
  type: string,
  rarity: ItemRarity,
  description: string,
  baseValue: number,
  equippable: boolean,
  weight: number
): Item {
  return {
    id,
    name,
    type,
    rarity,
    description,
    specialEffects: [],
    equippable,
    stackable: !equippable,
    quantity: 1,
    maxStackSize: equippable ? 1 : 20,
    weight,
    condition: 'good',
    enchantments: [],
    canBeEnchanted: rarity !== 'junk',
    maxEnchantments: rarity === 'junk' ? 0 : rarity === 'common' ? 1 : 2,
    baseValue,
    sellValue: Math.floor(baseValue * 0.5),
    buyValue: Math.floor(baseValue * 1.5),
    canBeSold: rarity !== 'junk',
    canBeDropped: true,
    isCrafted: false,
    isUnique: false,
    boundToCharacter: false,
    tags: [type, rarity],
  };
}

// ---- Weapon Catalog Integration ----

/**
 * Pick a weapon from the catalog filtered by genre and optional archetype.
 * Falls back to any weapon in the genre if no archetype match found.
 */
export function getWeaponFromCatalog(
  genreFamily: GenreFamily,
  options?: {
    archetypeTag?: ArchetypeTag;
    rarity?: ItemRarity;
    excludeCraftingOnly?: boolean;
  }
): WeaponCatalogEntry | null {
  let pool = getWeaponsForGenre(genreFamily);

  if (options?.excludeCraftingOnly) {
    pool = pool.filter(w => !w.craftingOnly);
  }

  if (options?.rarity) {
    // Map item-generator rarities to weapon catalog rarities
    const rarityMap: Partial<Record<ItemRarity, string[]>> = {
      common: ['common'],
      uncommon: ['uncommon'],
      rare: ['rare'],
      'very-rare': ['very-rare'],
      epic: ['very-rare', 'legendary'],
      legendary: ['legendary'],
    };
    const targetRarities = rarityMap[options.rarity] ?? [options.rarity];
    const rarityFiltered = pool.filter(w => targetRarities.includes(w.rarity));
    if (rarityFiltered.length > 0) pool = rarityFiltered;
  }

  if (options?.archetypeTag) {
    const archetypeFiltered = pool.filter(w => w.archetypeTags.includes(options.archetypeTag!));
    // Only apply archetype filter if it doesn't empty the pool
    if (archetypeFiltered.length > 0) pool = archetypeFiltered;
  }

  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Apply an affix to a weapon catalog entry, producing a modified name and bonus description.
 */
export function applyAffix(
  weapon: WeaponCatalogEntry,
  affix: ItemAffix
): { modifiedName: string; bonusDescription: string } {
  const modifiedName = affix.type === 'prefix'
    ? `${affix.name} ${weapon.name}`
    : `${weapon.name} ${affix.name}`;

  const bonusParts: string[] = [];
  const { statBonus } = affix;

  if (statBonus.attackBonus && statBonus.attackBonus > 0) bonusParts.push(`+${statBonus.attackBonus} to attack`);
  if (statBonus.attackBonus && statBonus.attackBonus < 0) bonusParts.push(`${statBonus.attackBonus} to attack`);
  if (statBonus.damageBonus && statBonus.damageBonus > 0) bonusParts.push(`+${statBonus.damageBonus} damage`);
  if (statBonus.damageDice) bonusParts.push(`+${statBonus.damageDice} ${statBonus.damageDiceType ?? 'bonus'} damage`);
  if (statBonus.range) bonusParts.push(`+${statBonus.range}ft range`);
  if (statBonus.stealth) bonusParts.push(`${statBonus.stealth > 0 ? '+' : ''}${statBonus.stealth} stealth`);
  if (statBonus.critRange) bonusParts.push(`crit range ${19 + statBonus.critRange}-20`);
  if (affix.specialEffect) bonusParts.push(affix.specialEffect);

  return {
    modifiedName,
    bonusDescription: bonusParts.join(', '),
  };
}

/**
 * Convert a WeaponCatalogEntry to a full Item object for inventory use.
 */
export function catalogEntryToItem(
  entry: WeaponCatalogEntry,
  options?: {
    applyPrefix?: ItemAffix;
    applySuffix?: ItemAffix;
  }
): Item {
  const id = `item-${entry.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const baseValue = entry.baseValue || generateBaseValue(entry.rarity as ItemRarity);

  let finalName = entry.name;
  const appliedAffixes: string[] = [];

  if (options?.applyPrefix) {
    const { modifiedName } = applyAffix(entry, options.applyPrefix);
    finalName = modifiedName;
    appliedAffixes.push(options.applyPrefix.id);
  }
  if (options?.applySuffix) {
    const { modifiedName } = applyAffix({ ...entry, name: finalName }, options.applySuffix);
    finalName = modifiedName;
    appliedAffixes.push(options.applySuffix.id);
  }

  // Map weapon catalog rarity to item rarity
  const rarityMap: Record<string, ItemRarity> = {
    common: 'common',
    uncommon: 'uncommon',
    rare: 'rare',
    'very-rare': 'very-rare',
    legendary: 'legendary',
  };
  const itemRarity: ItemRarity = rarityMap[entry.rarity] ?? 'common';

  return {
    id,
    name: finalName,
    type: 'weapon',
    subtype: entry.subtype,
    rarity: itemRarity,
    description: entry.description,
    flavorText: entry.flavorText,
    loreText: entry.loreText,
    damage: entry.damage,
    damageType: entry.damageType,
    properties: entry.properties,
    specialEffects: entry.specialAbility
      ? [`${entry.specialAbility}: ${entry.specialAbilityDescription ?? ''}`]
      : [],
    equippable: true,
    equipSlot: 'weapon-main',
    stackable: false,
    quantity: 1,
    maxStackSize: 1,
    weight: entry.weight,
    condition: 'good',
    enchantments: [],
    canBeEnchanted: !entry.requiresAttunement,
    maxEnchantments: itemRarity === 'legendary' ? 0 : 2,
    baseValue,
    sellValue: Math.floor(baseValue * 0.5),
    buyValue: Math.floor(baseValue * 1.5),
    canBeSold: entry.baseValue > 0,
    canBeDropped: !entry.requiresAttunement,
    isCrafted: entry.craftingOnly ?? false,
    craftingRecipeId: entry.craftingRecipeId,
    isUnique: itemRarity === 'legendary',
    boundToCharacter: entry.requiresAttunement,
    attunementRequired: entry.requiresAttunement,
    imageGenerationPrompt: entry.imagePromptHint,
    tags: [...entry.tags, entry.category, entry.subtype],
    // Weapon catalog integration fields
    weaponCatalogId: entry.id,
    weaponSubtype: entry.subtype,
    archetypeTags: entry.archetypeTags,
    craftingOnly: entry.craftingOnly,
    genreFamilies: entry.genreFamilies,
    appliedAffixes: appliedAffixes.length > 0 ? appliedAffixes : undefined,
  };
}

/**
 * Generate a weapon item from the catalog, with optional random affixes.
 */
export function generateCatalogWeapon(params: {
  genreFamily: GenreFamily;
  rarity: ItemRarity;
  archetypeTag?: ArchetypeTag;
  withAffixes?: boolean;
}): Item | null {
  const { genreFamily, rarity, archetypeTag, withAffixes = false } = params;

  const entry = getWeaponFromCatalog(genreFamily, {
    archetypeTag,
    rarity,
    excludeCraftingOnly: true,
  });

  if (!entry) return null;

  let applyPrefix: ItemAffix | undefined;
  let applySuffix: ItemAffix | undefined;

  if (withAffixes) {
    // Roll for affixes based on rarity tier
    const affixRoll = Math.random();
    if (affixRoll < 0.3 || rarity === 'uncommon' || rarity === 'rare' || rarity === 'very-rare' || rarity === 'legendary') {
      const prefix = rollAffix(entry.category as WeaponCategory, 'prefix', rarity);
      if (prefix) applyPrefix = prefix;
    }
    if (affixRoll < 0.15 || rarity === 'rare' || rarity === 'very-rare' || rarity === 'legendary') {
      const suffix = rollAffix(entry.category as WeaponCategory, 'suffix', rarity);
      if (suffix) applySuffix = suffix;
    }
  }

  return catalogEntryToItem(entry, { applyPrefix, applySuffix });
}

// ---- Generate loot for post-combat ----

export function generateLootDrop(params: {
  difficulty: string;
  enemyCount: number;
  characterLevel: number;
  genre?: Genre;
  genreFamily?: GenreFamily;
}): LootDrop {
  const { difficulty, enemyCount, characterLevel, genreFamily } = params;

  // Gold
  const gold = generateGold(difficulty) * Math.max(1, Math.ceil(enemyCount / 2));

  // Number of items (1-3 based on difficulty + enemy count)
  const itemCount = Math.max(
    1,
    Math.min(5, Math.floor(enemyCount / 2) + (difficulty === 'boss' ? 2 : difficulty === 'deadly' ? 1 : 0))
  );

  const items: Item[] = [];
  for (let i = 0; i < itemCount; i++) {
    const rarity = pickRarity(difficulty);
    // For junk/common, generate locally; for rare+, would use AI (caller handles)
    if (rarity === 'junk' || rarity === 'common') {
      items.push(generateSimpleItem(rarity, genreFamily));
    } else {
      // Generate a placeholder with appropriate rarity that AI should enhance
      const item = generateSimpleItem(rarity, genreFamily);
      item.description = `[AI Enhancement Needed] ${rarity} item for level ${characterLevel}`;
      items.push(item);
    }
  }

  // Materials (20% chance per enemy)
  const materials: Material[] = [];
  for (let i = 0; i < enemyCount; i++) {
    if (Math.random() < 0.2) {
      materials.push({
        id: `mat-${Date.now()}-${i}`,
        name: 'Salvaged Material',
        quality: difficulty === 'boss' ? 'exceptional' : difficulty === 'hard' ? 'fine' : 'average',
        properties: ['crafting'],
        sourceType: 'looted',
        rarity: pickRarity(difficulty),
        quantity: d4(),
        description: 'Material salvaged from combat.',
      });
    }
  }

  return {
    items,
    gold,
    materials,
    narration: '',
  };
}

// ---- Parse AI-generated item JSON into typed Item ----

export function parseAIItem(json: Record<string, unknown>): Item {
  const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rarity = (json.rarity as ItemRarity) || 'common';
  const baseValue = generateBaseValue(rarity);

  return {
    id,
    name: (json.name as string) || 'Unknown Item',
    type: (json.type as string) || 'treasure',
    subtype: json.subtype as string | undefined,
    rarity,
    description: (json.description as string) || '',
    flavorText: json.flavorText as string | undefined,
    damage: json.damage as string | undefined,
    damageType: json.damageType as string | undefined,
    armorClass: json.armorClass as number | undefined,
    properties: (json.properties as string[]) || undefined,
    statBonuses: json.statBonuses as Item['statBonuses'] | undefined,
    specialEffects: (json.specialEffects as string[]) || [],
    equippable: (json.equippable as boolean) ?? false,
    equipSlot: json.equipSlot as Item['equipSlot'],
    stackable: (json.stackable as boolean) ?? false,
    quantity: 1,
    maxStackSize: (json.equippable as boolean) ? 1 : 20,
    weight: (json.weight as number) || 1,
    condition: 'pristine',
    levelRequirement: json.levelRequirement as number | undefined,
    enchantments: [],
    canBeEnchanted: rarity !== 'junk',
    maxEnchantments: rarity === 'junk' ? 0 : rarity === 'common' ? 1 : 2,
    baseValue,
    sellValue: Math.floor(baseValue * 0.5),
    buyValue: Math.floor(baseValue * 1.5),
    canBeSold: true,
    canBeDropped: true,
    isCrafted: false,
    isUnique: ['legendary', 'mythic', 'artifact'].includes(rarity),
    boundToCharacter: rarity === 'artifact',
    tags: (json.tags as string[]) || [json.type as string || 'item', rarity],
  };
}
