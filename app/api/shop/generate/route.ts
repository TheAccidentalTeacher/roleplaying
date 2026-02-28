// ============================================================
// SHOP GENERATE API — Creates merchant stock via AI
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';
import { buildMerchantPrompt } from '@/lib/engines/economy-engine';
import type { WorldRecord } from '@/lib/types/world';
import type { Item, ItemRarity, ItemType, ItemCondition } from '@/lib/types/items';
import type { MerchantItem } from '@/lib/types/economy';

export const maxDuration = 30;

/** Shape Claude returns for each stock item */
interface RawShopItem {
  name: string;
  type: string;
  rarity: string;
  value: number;
  description: string;
  price: number;
  quantity: number;
  damage?: string;
}

/** Shape Claude returns for merchant */
interface RawMerchant {
  shopName: string;
  shopType: string;
  name: string;
  personality: string;
  appearance: string;
  basePriceModifier: number;
  haggleWillingness: number;
  buyPriceMultiplier: number;
  specialInterests: string[];
  refuseToBuy: string[];
  rumorsKnown: string[];
  inventory: RawShopItem[];
}

/** Convert raw AI item to proper Item */
function rawToItem(raw: RawShopItem, index: number): Item {
  const validRarities: ItemRarity[] = ['junk', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'artifact'];
  const rarity: ItemRarity = validRarities.includes(raw.rarity as ItemRarity)
    ? (raw.rarity as ItemRarity)
    : 'common';

  const validTypes: ItemType[] = ['weapon', 'armor', 'shield', 'potion', 'scroll', 'material', 'quest', 'consumable', 'magic', 'tool', 'ammunition', 'food', 'treasure', 'key'];
  const type: ItemType = validTypes.includes(raw.type as ItemType)
    ? (raw.type as ItemType)
    : 'consumable';

  const isConsumable = ['potion', 'scroll', 'food', 'consumable'].includes(type);

  return {
    id: crypto.randomUUID(),
    name: raw.name,
    description: raw.description || raw.name,
    type,
    rarity,
    condition: 'good' as ItemCondition,
    quantity: raw.quantity || 1,
    stackable: isConsumable,
    maxStackSize: isConsumable ? 99 : 1,
    weight: type === 'armor' ? 15 : type === 'weapon' ? 3 : 1,
    enchantments: [],
    canBeEnchanted: rarity !== 'junk',
    maxEnchantments: rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1,
    specialEffects: [],
    equippable: ['weapon', 'armor', 'shield'].includes(type),
    baseValue: raw.value || raw.price || 10,
    sellValue: Math.floor((raw.value || raw.price || 10) * 0.5),
    buyValue: raw.price || raw.value || 10,
    canBeSold: true,
    canBeDropped: true,
    isCrafted: false,
    isUnique: ['legendary', 'mythic', 'artifact'].includes(rarity),
    boundToCharacter: false,
    tags: [type, rarity],
    damage: raw.damage,
    damageType: raw.damage ? 'slashing' : undefined,
    equipSlot: type === 'weapon' ? 'weapon-main' : type === 'armor' ? 'chest' : type === 'shield' ? 'weapon-off' : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { shopType, merchantName, shopName, world, location, playerLevel } = await req.json() as {
      shopType: string;
      merchantName?: string;
      shopName?: string;
      world: WorldRecord;
      location: string;
      playerLevel: number;
    };

    const prompt = buildMerchantPrompt(shopType, world, location);
    const extraContext = [
      merchantName ? `The merchant's name is ${merchantName}.` : '',
      shopName ? `The shop is called "${shopName}".` : '',
      `The player is level ${playerLevel}, so stock items appropriate for that tier.`,
    ].filter(Boolean).join(' ');

    const result = await callClaudeJSON<RawMerchant>(
      'npc_dialogue',
      prompt,
      extraContext || 'Generate the merchant and their inventory.',
      { maxTokens: 2000 }
    );

    // Convert raw items to proper MerchantItem[]
    const stock: MerchantItem[] = (result.inventory || []).map((raw, i) => ({
      item: rawToItem(raw, i),
      quantity: raw.quantity || 1,
      price: raw.price || raw.value || 10,
      priceNegotiable: (result.haggleWillingness || 50) > 30,
      isNew: true,
    }));

    return NextResponse.json({
      shopName: result.shopName || shopName || 'Shop',
      merchantName: result.name || merchantName || 'Merchant',
      personality: result.personality || '',
      appearance: result.appearance || '',
      basePriceModifier: result.basePriceModifier || 1.0,
      haggleWillingness: result.haggleWillingness || 50,
      buyPriceMultiplier: result.buyPriceMultiplier || 0.4,
      specialInterests: result.specialInterests || [],
      refuseToBuy: result.refuseToBuy || [],
      rumorsKnown: result.rumorsKnown || [],
      stock,
    });
  } catch (error) {
    console.error('[shop/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate shop' },
      { status: 500 }
    );
  }
}
