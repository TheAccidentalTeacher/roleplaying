// ============================================================
// ITEM TYPES — Items, equipment, crafting, loot
// Reference: BRAINSTORM.md (Inventory & Items section)
// ============================================================

// ---- Enums & Union Types ----

export type ItemRarity =
  | 'junk' | 'common' | 'uncommon' | 'rare'
  | 'epic' | 'legendary' | 'mythic' | 'artifact';

export type ItemType =
  | 'weapon' | 'armor' | 'shield' | 'potion' | 'scroll'
  | 'material' | 'quest' | 'consumable' | 'magic'
  | 'tool' | 'ammunition' | 'food' | 'treasure' | 'key'
  | string;

export type ItemCondition = 'pristine' | 'good' | 'worn' | 'damaged' | 'broken';
export type ItemQuality = 'shoddy' | 'standard' | 'quality' | 'masterwork' | 'legendary';

export type WeaponProperty =
  | 'finesse' | 'heavy' | 'light' | 'loading' | 'reach'
  | 'thrown' | 'two-handed' | 'versatile' | 'ammunition'
  | 'special'
  | string;

export type CraftingSkill =
  | 'smithing' | 'alchemy' | 'enchanting' | 'tailoring'
  | 'leatherworking' | 'jewelcrafting' | 'engineering'
  | 'cooking' | 'inscription'
  | string;

export type MaterialQuality = 'poor' | 'average' | 'fine' | 'exceptional' | 'masterwork';
export type MaterialSource = 'mined' | 'harvested' | 'looted' | 'hunted' | 'purchased';

// ---- Interfaces ----

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  subtype?: string;
  rarity: ItemRarity;
  description: string;
  flavorText?: string;
  loreText?: string;

  // Stats (context-dependent on type)
  damage?: string; // e.g. "1d8+2"
  damageType?: string;
  armorClass?: number;
  properties?: WeaponProperty[];
  statBonuses?: Partial<Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>>;
  specialEffects: string[];
  activeAbilities?: string[];

  // Equipment
  equippable: boolean;
  equipSlot?: string;
  isEquipped?: boolean;

  // Stacking & Weight
  stackable: boolean;
  quantity: number;
  maxStackSize: number;
  weight: number;

  // Durability
  durability?: {
    current: number;
    max: number;
  };
  condition: ItemCondition;

  // Requirements
  levelRequirement?: number;
  classRequirement?: string[];
  raceRequirement?: string[];
  abilityRequirement?: Partial<Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>>;

  // Enhancement
  enchantments: Enchantment[];
  canBeEnchanted: boolean;
  maxEnchantments: number;
  sockets?: Socket[];

  // Set bonuses
  setName?: string;
  setBonus?: string;

  // Value
  baseValue: number;
  sellValue: number;
  buyValue: number;
  canBeSold: boolean;
  canBeDropped: boolean;

  // Crafting
  isCrafted: boolean;
  craftingRecipeId?: string;
  craftedBy?: string;
  craftQuality?: ItemQuality;

  // Image
  imageUrl?: string;
  imageGenerationPrompt?: string;

  // Flags
  isUnique: boolean;
  boundToCharacter: boolean;
  questTied?: string; // Quest ID
  tags: string[];

  // Story
  discoveryStory?: string;
  attunementRequired?: boolean;
  isAttuned?: boolean;
  charges?: {
    current: number;
    max: number;
    rechargeOn?: 'dawn' | 'short-rest' | 'long-rest' | 'never';
  };
}

export interface Enchantment {
  id: string;
  name: string;
  description: string;
  effect: string;
  tier: number; // 1-5
}

export interface Socket {
  id: string;
  type: 'gem' | 'rune' | 'essence';
  filled: boolean;
  gemId?: string;
  bonus?: string;
}

// ---- Crafting ----

export interface Material {
  id: string;
  name: string;
  quality: MaterialQuality;
  properties: string[];
  sourceType: MaterialSource;
  rarity: ItemRarity;
  quantity: number;
  description: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  skill: CraftingSkill;
  skillLevelRequired: number;
  materials: { materialName: string; quantity: number }[];
  resultItemId?: string;
  resultDescription: string;
  difficultyDC: number;
  craftingTimeHours: number;
  requiresStation: boolean;
  stationType?: string;
  isDiscovered: boolean;
}

export interface CraftingResult {
  success: boolean;
  quality: 'normal' | 'fine' | 'superior' | 'masterwork' | 'legendary';
  item?: Item;
  materialsConsumed: boolean;
  xpGained: number;
  narration: string;
}

// ---- Loot ----

export interface LootTable {
  encounterDifficulty: string;
  guaranteedItems: string[];
  randomItems: { itemSeed: string; weight: number }[];
  goldRange: { min: number; max: number };
  materialChance: number;
  rarityWeights: Record<ItemRarity, number>;
}

export interface LootDrop {
  items: Item[];
  gold: number;
  materials: Material[];
  narration: string;
}
