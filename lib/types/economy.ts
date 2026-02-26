// ============================================================
// ECONOMY TYPES — Merchants, haggling, currency, property
// Reference: ECONOMY-SYSTEM.md
// ============================================================

import type { NPC } from './npc';
import type { Item, ItemRarity } from './items';

// ---- Enums & Union Types ----

export type ShopType =
  | 'general-store' | 'blacksmith' | 'alchemist' | 'magic-shop'
  | 'tailor' | 'jeweler' | 'herbalist' | 'black-market'
  | 'curiosities' | 'bookshop' | 'fletcher' | 'stable'
  | 'tavern' | 'temple'
  | string;

export type RestockInterval = 'daily' | 'weekly' | 'monthly' | 'event-based';

// ---- Interfaces ----

export interface MerchantItem {
  item: Item;
  quantity: number;
  price: number;
  priceNegotiable: boolean;
  requiresReputation?: number;
  isNew: boolean;
}

export interface MerchantInventory {
  currentStock: MerchantItem[];
  stockTiers: Record<ItemRarity, number>; // % chance of stocking each rarity
  lastRestock: string;
  restockInterval: RestockInterval;
  maxItems: number;
  playerSoldItems: MerchantItem[];
  playerItemRetentionDays: number;
}

export interface Merchant extends NPC {
  shopName: string;
  shopType: ShopType;
  inventory: MerchantInventory;
  basePriceModifier: number; // Multiplier on base prices
  haggleWillingness: number; // 0-100
  reputationDiscount: number; // % discount per relationship tier
  buyFromPlayer: boolean;
  buyPriceMultiplier: number; // Fraction of sell value given to player
  specialInterests: string[]; // Item types they pay more for
  refuseToBuy: string[]; // Item types they won't buy
  commissionQuests: string[];
  rumorsKnown: string[];
  secretInventory?: MerchantItem[];
}

export interface HaggleAttempt {
  merchantId: string;
  itemId: string;
  originalPrice: number;
  offeredPrice: number;
  playerArgument: string;
  charismaCheck: {
    roll: number;
    modifier: number;
    total: number;
    dc: number;
  };
  success: boolean;
  finalPrice: number;
  merchantReaction: string;
  relationshipChange: number;
}

export interface PriceModifier {
  source: string;
  type: 'multiply' | 'add' | 'subtract' | 'set';
  value: number;
  description: string;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  merchantId: string;
  characterId: string;
  items: { itemId: string; quantity: number; price: number }[];
  totalGold: number;
  timestamp: string;
}

export interface Property {
  id: string;
  name: string;
  type: 'room' | 'house' | 'shop' | 'keep' | 'estate' | 'guild-hall';
  location: string;
  purchasePrice: number;
  maintenanceCost: number; // Per day/week
  upgrades: PropertyUpgrade[];
  storage: string[]; // Item IDs stored here
  description: string;
  isOwned: boolean;
}

export interface PropertyUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  installed: boolean;
  benefit: string;
}

export interface GamblingGame {
  id: string;
  name: string;
  type: 'cards' | 'dice' | 'arena-bet' | 'race' | 'puzzle';
  minBet: number;
  maxBet: number;
  houseEdge: number;
  skillBased: boolean;
  relevantSkill?: string;
  description: string;
}
