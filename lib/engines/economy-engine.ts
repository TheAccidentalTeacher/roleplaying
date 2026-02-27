// ============================================================
// ECONOMY ENGINE
// Merchant generation, price calculation, haggling, buy/sell
// Reference: ECONOMY-SYSTEM.md
// ============================================================

import type {
  Merchant,
  MerchantItem,
  HaggleAttempt,
  Transaction,
  PriceModifier,
} from '@/lib/types/economy';
import type { Character } from '@/lib/types/character';
import type { Item, ItemRarity } from '@/lib/types/items';
import type { WorldRecord } from '@/lib/types/world';

// ---- Price Calculation ----

const RARITY_MULTIPLIER: Record<ItemRarity, number> = {
  junk: 0.1,
  common: 1,
  uncommon: 5,
  rare: 25,
  epic: 125,
  legendary: 625,
  mythic: 2000,
  artifact: 3000,
};

export function calculateBasePrice(item: Item): number {
  const rarityMult = RARITY_MULTIPLIER[item.rarity] || 1;
  return Math.max(1, Math.round((item.baseValue || 10) * rarityMult));
}

export function calculateBuyPrice(
  item: Item,
  merchant: Pick<Merchant, 'basePriceModifier' | 'specialInterests'>,
  modifiers: PriceModifier[] = []
): number {
  let price = calculateBasePrice(item);
  price *= merchant.basePriceModifier;

  // Special interest discount (merchant wants these more, prices higher for player to buy)
  if (merchant.specialInterests.some((si) => item.type.includes(si) || item.name.toLowerCase().includes(si.toLowerCase()))) {
    price *= 1.15;
  }

  for (const mod of modifiers) {
    switch (mod.type) {
      case 'multiply': price *= mod.value; break;
      case 'add': price += mod.value; break;
      case 'subtract': price -= mod.value; break;
      case 'set': price = mod.value; break;
    }
  }

  return Math.max(1, Math.round(price));
}

export function calculateSellPrice(
  item: Item,
  merchant: Pick<Merchant, 'buyPriceMultiplier' | 'specialInterests' | 'refuseToBuy'>,
  modifiers: PriceModifier[] = []
): number | null {
  // Check if merchant refuses
  if (merchant.refuseToBuy.some((r) => item.type.includes(r) || item.name.toLowerCase().includes(r.toLowerCase()))) {
    return null;
  }

  let price = calculateBasePrice(item) * merchant.buyPriceMultiplier;

  // Merchant pays more for special interests
  if (merchant.specialInterests.some((si) => item.type.includes(si) || item.name.toLowerCase().includes(si.toLowerCase()))) {
    price *= 1.25;
  }

  for (const mod of modifiers) {
    switch (mod.type) {
      case 'multiply': price *= mod.value; break;
      case 'add': price += mod.value; break;
      case 'subtract': price -= mod.value; break;
      case 'set': price = mod.value; break;
    }
  }

  return Math.max(1, Math.round(price));
}

// ---- Haggling ----

export function resolveHaggle(attempt: HaggleAttempt): HaggleAttempt {
  const success = attempt.charismaCheck.total >= attempt.charismaCheck.dc;
  const margin = attempt.charismaCheck.total - attempt.charismaCheck.dc;

  let finalPrice = attempt.originalPrice;
  let reaction = '';
  let relationshipChange = 0;

  if (success) {
    // Better margin = bigger discount
    const discountPct = Math.min(30, 5 + margin * 2); // 5-30% discount
    finalPrice = Math.round(attempt.originalPrice * (1 - discountPct / 100));
    finalPrice = Math.max(Math.round(attempt.originalPrice * 0.7), finalPrice);
    reaction = margin >= 10
      ? 'The merchant laughs heartily. "You drive a hard bargain! Very well."'
      : margin >= 5
      ? '"Hmm, you make a fair point. I can do that."'
      : '"Fine, fine — but don\'t tell anyone I gave you this price."';
    relationshipChange = Math.min(5, Math.floor(margin / 2));
  } else {
    // Failed haggle — prices may go UP
    if (margin <= -5) {
      finalPrice = Math.round(attempt.originalPrice * 1.1);
      reaction = '"You insult me with that offer! The price just went up."';
      relationshipChange = -3;
    } else {
      finalPrice = attempt.originalPrice;
      reaction = '"I\'m afraid I can\'t go lower than that."';
      relationshipChange = -1;
    }
  }

  return {
    ...attempt,
    success,
    finalPrice,
    merchantReaction: reaction,
    relationshipChange,
  };
}

// ---- Buy / Sell ----

export function buyItem(
  character: Character,
  merchantId: string,
  item: Item,
  price: number
): { transaction: Transaction; success: boolean; message: string } {
  if (character.gold < price) {
    return {
      transaction: createEmptyTransaction(character.id, merchantId, 'buy'),
      success: false,
      message: `Not enough gold. Need ${price}g, have ${character.gold}g.`,
    };
  }

  const txn: Transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'buy',
    merchantId,
    characterId: character.id,
    items: [{ itemId: item.id, quantity: 1, price }],
    totalGold: price,
    timestamp: new Date().toISOString(),
  };

  return {
    transaction: txn,
    success: true,
    message: `Purchased ${item.name} for ${price}g.`,
  };
}

export function sellItem(
  character: Character,
  merchantId: string,
  item: Item,
  price: number
): { transaction: Transaction; success: boolean; message: string } {
  const txn: Transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'sell',
    merchantId,
    characterId: character.id,
    items: [{ itemId: item.id, quantity: 1, price }],
    totalGold: price,
    timestamp: new Date().toISOString(),
  };

  return {
    transaction: txn,
    success: true,
    message: `Sold ${item.name} for ${price}g.`,
  };
}

function createEmptyTransaction(characterId: string, merchantId: string, type: 'buy' | 'sell'): Transaction {
  return {
    id: '',
    type,
    merchantId,
    characterId,
    items: [],
    totalGold: 0,
    timestamp: new Date().toISOString(),
  };
}

// ---- Merchant Stock Management ----

export function shouldRestock(merchant: Merchant): boolean {
  if (!merchant.inventory.lastRestock) return true;
  const last = new Date(merchant.inventory.lastRestock).getTime();
  const now = Date.now();
  const hours = (now - last) / (1000 * 60 * 60);

  switch (merchant.inventory.restockInterval) {
    case 'daily': return hours >= 24;
    case 'weekly': return hours >= 168;
    case 'monthly': return hours >= 720;
    case 'event-based': return false;
    default: return false;
  }
}

// ---- Regional Price Modifier from World Economy ----

/**
 * Look up the regional price modifier for a location from world economy data.
 * Returns a PriceModifier array that can be passed to calculateBuyPrice/calculateSellPrice.
 */
export function getRegionalPriceModifiers(
  world: WorldRecord,
  location: string
): PriceModifier[] {
  if (!world.economy?.priceRegions?.length) return [];

  const region = world.economy.priceRegions.find(p =>
    location.toLowerCase().includes(p.region.toLowerCase()) ||
    p.region.toLowerCase().includes(location.toLowerCase())
  );

  if (!region || region.priceModifier === 1.0) return [];

  return [{
    source: `Regional pricing (${region.region})`,
    type: 'multiply' as const,
    value: region.priceModifier,
    description: `Prices ${region.priceModifier > 1 ? 'higher' : 'lower'} in ${region.region}. Specialties: ${region.specialties.join(', ')}. Scarce: ${region.scarcities.join(', ')}.`,
  }];
}

/**
 * Get the base regional price multiplier as a simple number.
 */
export function getRegionalPriceMultiplier(
  world: WorldRecord,
  location: string
): number {
  if (!world.economy?.priceRegions?.length) return 1.0;
  const region = world.economy.priceRegions.find(p =>
    location.toLowerCase().includes(p.region.toLowerCase()) ||
    p.region.toLowerCase().includes(location.toLowerCase())
  );
  return region?.priceModifier ?? 1.0;
}

// ---- Prompt Builders for AI Merchant Generation ----

export function buildMerchantPrompt(
  shopType: string,
  world: WorldRecord,
  location: string
): string {
  // Build economy context from world data
  const economyLines: string[] = [];
  if (world.economy) {
    const e = world.economy;
    const region = e.priceRegions.find(p =>
      location.toLowerCase().includes(p.region.toLowerCase()) ||
      p.region.toLowerCase().includes(location.toLowerCase())
    );
    if (region) {
      economyLines.push(`Regional Price Modifier: ×${region.priceModifier}`);
      economyLines.push(`Local Specialties (cheap): ${region.specialties.join(', ')}`);
      economyLines.push(`Scarce here (expensive): ${region.scarcities.join(', ')}`);
    }
    if (e.rareMaterials.length) {
      economyLines.push(`Rare Materials in World: ${e.rareMaterials.slice(0, 5).map(m => m.name).join(', ')}`);
    }
    if (e.economicTensions.length) {
      economyLines.push(`Trade Tensions: ${e.economicTensions[0]}`);
    }
    if (e.blackMarket) {
      economyLines.push(`Black Market: ${e.blackMarket}`);
    }
  }

  // Check for settlement context
  const settlement = world.settlements?.find(s =>
    s.name.toLowerCase() === location.toLowerCase() ||
    location.toLowerCase().includes(s.name.toLowerCase())
  );
  if (settlement?.economicProfile) {
    economyLines.push(`Settlement Economy: ${settlement.economicProfile}`);
  }

  const economyContext = economyLines.length
    ? `\nECONOMY CONTEXT:\n${economyLines.map(l => `- ${l}`).join('\n')}\nReflect these economic conditions in pricing and inventory.`
    : '';

  return `You are creating a merchant NPC for an RPG.

World: ${world.worldName}
Genre: ${world.primaryGenre}
Location: ${location}
Shop Type: ${shopType}${economyContext}

Generate a merchant as JSON:
{
  "shopName": "string",
  "shopType": "${shopType}",
  "name": "string",
  "personality": "1-2 sentences",
  "appearance": "1 sentence",
  "basePriceModifier": 0.9-1.3,
  "haggleWillingness": 0-100,
  "buyPriceMultiplier": 0.3-0.6,
  "specialInterests": ["item types they pay more for"],
  "refuseToBuy": ["item types they refuse"],
  "rumorsKnown": ["1-2 local rumors"],
  "inventory": [
    {
      "name": "string",
      "type": "weapon|armor|potion|scroll|tool|misc",
      "rarity": "common|uncommon|rare",
      "value": number,
      "description": "1 sentence",
      "price": number,
      "quantity": number
    }
  ]
}

Include 5-10 items appropriate for a ${shopType} in a ${world.primaryGenre} setting.`;
}
