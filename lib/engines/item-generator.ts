// ============================================================
// ITEM GENERATOR ENGINE
// Generates items, loot drops, and shop inventories using AI.
// Reference: BRAINSTORM.md Inventory & Items section
// ============================================================

import type { Item, ItemRarity, LootDrop, Material } from '@/lib/types/items';
import type { Genre } from '@/lib/types/world';
import { roll, d4, d6, d8, d10, d12, d20 } from '@/lib/utils/dice';

// ---- Rarity weights by encounter difficulty ----

const RARITY_WEIGHTS: Record<string, Record<ItemRarity, number>> = {
  easy: { junk: 25, common: 50, uncommon: 20, rare: 4, epic: 1, legendary: 0, mythic: 0, artifact: 0 },
  medium: { junk: 10, common: 40, uncommon: 30, rare: 15, epic: 4, legendary: 1, mythic: 0, artifact: 0 },
  hard: { junk: 5, common: 20, uncommon: 30, rare: 25, epic: 15, legendary: 4, mythic: 1, artifact: 0 },
  deadly: { junk: 0, common: 10, uncommon: 20, rare: 30, epic: 25, legendary: 10, mythic: 4, artifact: 1 },
  boss: { junk: 0, common: 5, uncommon: 15, rare: 30, epic: 30, legendary: 15, mythic: 4, artifact: 1 },
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
  junk: { min: 0, max: 2 },
  common: { min: 1, max: 15 },
  uncommon: { min: 10, max: 75 },
  rare: { min: 50, max: 500 },
  epic: { min: 200, max: 2000 },
  legendary: { min: 1000, max: 10000 },
  mythic: { min: 5000, max: 50000 },
  artifact: { min: 25000, max: 100000 },
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
  characterLevel?: number;
  context?: string;
}): string {
  const { itemType, rarity, genre, characterLevel, context } = params;

  return `Generate a single RPG item as JSON.

Requirements:
- Rarity: ${rarity}
- ${itemType ? `Type: ${itemType}` : 'Any type appropriate to the context'}
- ${genre ? `Genre/setting: ${genre}` : 'Standard fantasy'}
- ${characterLevel ? `Appropriate for level ${characterLevel}` : ''}
- ${context ? `Context: ${context}` : ''}

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

export function generateSimpleItem(rarity: ItemRarity): Item {
  const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const baseValue = generateBaseValue(rarity);

  if (rarity === 'junk') {
    const name = JUNK_ITEMS[Math.floor(Math.random() * JUNK_ITEMS.length)];
    return createItem(id, name, 'material', rarity, name, baseValue, false, 1);
  }

  // For common items, randomly pick weapon/armor/consumable
  const category = d6();
  if (category <= 2) {
    const name = COMMON_WEAPONS[Math.floor(Math.random() * COMMON_WEAPONS.length)];
    return createItem(id, name, 'weapon', rarity, `A standard ${name.toLowerCase()}.`, baseValue, true, d8());
  } else if (category <= 4) {
    const name = COMMON_ARMOR[Math.floor(Math.random() * COMMON_ARMOR.length)];
    return createItem(id, name, 'armor', rarity, `A common ${name.toLowerCase()}.`, baseValue, true, d10());
  } else {
    const name = COMMON_CONSUMABLES[Math.floor(Math.random() * COMMON_CONSUMABLES.length)];
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

// ---- Generate loot for post-combat ----

export function generateLootDrop(params: {
  difficulty: string;
  enemyCount: number;
  characterLevel: number;
  genre?: Genre;
}): LootDrop {
  const { difficulty, enemyCount, characterLevel } = params;

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
      items.push(generateSimpleItem(rarity));
    } else {
      // Generate a placeholder with appropriate rarity that AI should enhance
      const item = generateSimpleItem(rarity);
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
    equipSlot: json.equipSlot as string | undefined,
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
