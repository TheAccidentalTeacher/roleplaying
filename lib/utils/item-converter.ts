// ============================================================
// ITEM CONVERTER — Converts plain string item names into
// proper Item objects for display in ItemCard / LootPopup.
// Falls back to heuristic inference for rarity, type, etc.
// ============================================================

import type { Item, ItemRarity, ItemType, ItemCondition } from '@/lib/types/items';

// ---- Rarity inference from name keywords ----
const RARITY_PATTERNS: [RegExp, ItemRarity][] = [
  [/\b(artifact|divine|godly)\b/i, 'artifact'],
  [/\b(mythic|primordial|ancient|elder)\b/i, 'mythic'],
  [/\b(legendary|heroic|exalted)\b/i, 'legendary'],
  [/\b(epic|greater|supreme|superior)\b/i, 'epic'],
  [/\b(rare|fine|exceptional|ornate)\b/i, 'rare'],
  [/\b(uncommon|enchanted|magic|blessed|silver|mithril|\+1|\+2|\+3)\b/i, 'uncommon'],
  [/\b(rusty|broken|crude|worn|tattered|dull)\b/i, 'junk'],
];

// ---- Type inference from name keywords ----
const TYPE_PATTERNS: [RegExp, ItemType][] = [
  [/\b(sword|axe|mace|hammer|dagger|bow|crossbow|staff|spear|flail|halberd|rapier|scimitar|warhammer|glaive|pike|javelin|club|whip|trident|maul|lance|blade)\b/i, 'weapon'],
  [/\b(armor|mail|plate|breastplate|chainmail|leather armor|hide|brigandine|cuirass|gambeson)\b/i, 'armor'],
  [/\b(shield|buckler|pavise)\b/i, 'shield'],
  [/\b(potion|elixir|vial|draught|tonic|salve|balm)\b/i, 'potion'],
  [/\b(scroll|tome|grimoire|spellbook|manuscript|parchment)\b/i, 'scroll'],
  [/\b(ration|food|bread|meat|cheese|apple|fruit|berry|herb|mushroom|fish|ale|wine|mead)\b/i, 'food'],
  [/\b(arrow|bolt|bullet|ammunition|quiver|sling stone)\b/i, 'ammunition'],
  [/\b(ring|amulet|necklace|circlet|crown|cloak|robe|boots|gloves|gauntlet|belt|bracelet|gem|jewel|pendant|earring|brooch)\b/i, 'magic'],
  [/\b(key|lockpick|skeleton key)\b/i, 'key'],
  [/\b(gold|coin|treasure|jewels|gems|ruby|emerald|sapphire|diamond|pearl|ivory)\b/i, 'treasure'],
  [/\b(thieves|tools|rope|torch|lantern|compass|map|toolkit|kit)\b/i, 'tool'],
  [/\b(bandage|antidote|remedy|medicine)\b/i, 'consumable'],
];

// ---- Damage strings by weapon type ----
const WEAPON_DAMAGE: Record<string, string> = {
  dagger: '1d4',
  club: '1d4',
  javelin: '1d6',
  mace: '1d6',
  scimitar: '1d6',
  rapier: '1d8',
  sword: '1d8',
  bow: '1d8',
  crossbow: '1d10',
  halberd: '1d10',
  pike: '1d10',
  glaive: '1d10',
  lance: '1d12',
  axe: '1d8',
  hammer: '1d8',
  warhammer: '1d10',
  maul: '2d6',
  staff: '1d6',
  flail: '1d8',
  spear: '1d6',
  trident: '1d6',
  whip: '1d4',
};

function inferRarity(name: string): ItemRarity {
  for (const [pattern, rarity] of RARITY_PATTERNS) {
    if (pattern.test(name)) return rarity;
  }
  return 'common';
}

function inferType(name: string): ItemType {
  for (const [pattern, type] of TYPE_PATTERNS) {
    if (pattern.test(name)) return type;
  }
  return 'consumable';
}

function inferDamage(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [weapon, damage] of Object.entries(WEAPON_DAMAGE)) {
    if (lower.includes(weapon)) return damage;
  }
  return undefined;
}

function inferCondition(name: string): ItemCondition {
  if (/\b(rusty|broken|cracked|shattered)\b/i.test(name)) return 'damaged';
  if (/\b(worn|tattered|old|dull)\b/i.test(name)) return 'worn';
  if (/\b(pristine|perfect|flawless)\b/i.test(name)) return 'pristine';
  return 'good';
}

/**
 * Convert a plain item name string into a full Item object.
 * Uses heuristic inference for rarity, type, damage, etc.
 */
export function stringToItem(name: string, index?: number): Item {
  const rarity = inferRarity(name);
  const type = inferType(name);
  const damage = type === 'weapon' ? inferDamage(name) : undefined;
  const condition = inferCondition(name);

  const RARITY_VALUE: Record<ItemRarity, number> = {
    junk: 1, common: 5, uncommon: 25, rare: 100,
    epic: 500, legendary: 2000, mythic: 10000, artifact: 50000,
  };

  const baseValue = RARITY_VALUE[rarity];
  const equippable = ['weapon', 'armor', 'shield', 'magic'].includes(type);
  const isConsumable = ['potion', 'consumable', 'food', 'scroll'].includes(type);

  return {
    id: `item-${Date.now()}-${index ?? Math.floor(Math.random() * 10000)}`,
    name,
    type,
    rarity,
    description: name,
    specialEffects: [],
    equippable,
    stackable: isConsumable,
    quantity: 1,
    maxStackSize: isConsumable ? 99 : 1,
    weight: type === 'treasure' ? 0.1 : type === 'armor' ? 15 : type === 'weapon' ? 3 : 1,
    condition,
    enchantments: [],
    canBeEnchanted: rarity !== 'junk',
    maxEnchantments: rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1,
    baseValue,
    sellValue: Math.floor(baseValue * 0.5),
    buyValue: Math.floor(baseValue * 1.5),
    canBeSold: type !== 'quest',
    canBeDropped: type !== 'quest',
    isCrafted: false,
    isUnique: ['legendary', 'mythic', 'artifact'].includes(rarity),
    boundToCharacter: rarity === 'artifact',
    tags: [type, rarity],
    damage,
    damageType: damage ? 'slashing' : undefined,
    equipSlot: type === 'weapon' ? 'weapon-main' : type === 'armor' ? 'chest' : type === 'shield' ? 'weapon-off' : undefined,
  };
}

/**
 * Convert an array of plain string item names to Item objects.
 */

export function stringsToItems(names: string[]): Item[] {
  return names.map((name, i) => stringToItem(name, i));
}
