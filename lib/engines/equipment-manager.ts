// ============================================================
// EQUIPMENT MANAGER
// Handles equipping, unequipping, and comparing items.
// Reference: BRAINSTORM.md Inventory & Items section
// ============================================================

import type { Character, EquipSlot, EquippedItems } from '@/lib/types/character';
import type { Item } from '@/lib/types/items';

export interface EquipResult {
  success: boolean;
  reason?: string;
  unequippedItem?: Item;
  character: Character;
}

export interface ComparisonResult {
  better: string[];   // Stats where candidate is better
  worse: string[];    // Stats where candidate is worse
  equal: string[];    // Stats that are the same
  summary: string;    // Human-readable summary
}

// ---- Map item type to valid equip slots ----

const TYPE_TO_SLOTS: Record<string, EquipSlot[]> = {
  weapon: ['weapon-main', 'weapon-off'],
  shield: ['weapon-off'],
  armor: ['chest'],
  head: ['head'],
  neck: ['neck'],
  back: ['back'],
  hands: ['hands'],
  belt: ['belt'],
  legs: ['legs'],
  feet: ['feet'],
  ring: ['ring-l', 'ring-r'],
  trinket: ['trinket-1', 'trinket-2'],
};

// ---- Check if character can equip an item ----

export function canEquip(
  character: Character,
  item: Item
): { canEquip: boolean; reason?: string } {
  if (!item.equippable) {
    return { canEquip: false, reason: `${item.name} cannot be equipped.` };
  }

  if (item.levelRequirement && character.level < item.levelRequirement) {
    return {
      canEquip: false,
      reason: `Requires level ${item.levelRequirement}. You are level ${character.level}.`,
    };
  }

  if (item.classRequirement && item.classRequirement.length > 0) {
    if (!item.classRequirement.includes(character.class)) {
      return {
        canEquip: false,
        reason: `Requires class: ${item.classRequirement.join(', ')}`,
      };
    }
  }

  if (item.raceRequirement && item.raceRequirement.length > 0) {
    if (!item.raceRequirement.includes(character.race)) {
      return {
        canEquip: false,
        reason: `Requires race: ${item.raceRequirement.join(', ')}`,
      };
    }
  }

  if (item.abilityRequirement) {
    for (const [ability, minScore] of Object.entries(item.abilityRequirement)) {
      const score = character.abilityScores[ability as keyof typeof character.abilityScores]?.score;
      if (score !== undefined && minScore !== undefined && score < minScore) {
        return {
          canEquip: false,
          reason: `Requires ${ability.toUpperCase()} ${minScore}. You have ${score}.`,
        };
      }
    }
  }

  return { canEquip: true };
}

// ---- Get the best slot for an item ----

export function getBestSlot(
  character: Character,
  item: Item
): EquipSlot | null {
  // If item specifies its slot, use that
  if (item.equipSlot) {
    return item.equipSlot as EquipSlot;
  }

  // Determine from item type and subtype
  const type = item.subtype || item.type;
  const possibleSlots = TYPE_TO_SLOTS[type];

  if (!possibleSlots) return null;

  // Prefer empty slots
  for (const slot of possibleSlots) {
    if (!character.equipment[slot]) {
      return slot;
    }
  }

  // All slots occupied, default to first
  return possibleSlots[0];
}

// ---- Equip an item ----

export function equipItem(
  character: Character,
  item: Item,
  slot?: EquipSlot,
  items: Item[] = []
): EquipResult {
  const check = canEquip(character, item);
  if (!check.canEquip) {
    return { success: false, reason: check.reason, character };
  }

  const targetSlot = slot || getBestSlot(character, item);
  if (!targetSlot) {
    return { success: false, reason: 'No valid equipment slot for this item.', character };
  }

  const updated = { ...character };
  const updatedEquipment: EquippedItems = { ...character.equipment };
  let unequippedItem: Item | undefined;

  // If slot is occupied, unequip the existing item
  const existingItemId = updatedEquipment[targetSlot];
  if (existingItemId) {
    unequippedItem = items.find((i) => i.id === existingItemId);
    // Add old item back to inventory
    updated.inventory = [...character.inventory, existingItemId];
  }

  // Equip the new item
  updatedEquipment[targetSlot] = item.id;

  // Remove new item from inventory
  updated.inventory = updated.inventory.filter((id) => id !== item.id);
  updated.equipment = updatedEquipment;

  // Recalculate stats from equipment
  updated.armorClass = calculateEquippedAC(updated, items);

  return {
    success: true,
    unequippedItem,
    character: updated,
  };
}

// ---- Unequip an item ----

export function unequipItem(
  character: Character,
  slot: EquipSlot
): { character: Character; removedItemId?: string } {
  const itemId = character.equipment[slot];
  if (!itemId) {
    return { character };
  }

  const updated = { ...character };
  const updatedEquipment: EquippedItems = { ...character.equipment };
  updatedEquipment[slot] = undefined;

  updated.equipment = updatedEquipment;
  updated.inventory = [...character.inventory, itemId];

  return { character: updated, removedItemId: itemId };
}

// ---- Compare two items ----

export function compareItems(
  equipped: Item | null,
  candidate: Item
): ComparisonResult {
  const better: string[] = [];
  const worse: string[] = [];
  const equal: string[] = [];

  if (!equipped) {
    return {
      better: ['New equipment (empty slot)'],
      worse: [],
      equal: [],
      summary: `Equipping ${candidate.name} in an empty slot.`,
    };
  }

  // Compare damage
  if (candidate.damage && equipped.damage) {
    if (candidate.damage > equipped.damage) better.push('Damage');
    else if (candidate.damage < equipped.damage) worse.push('Damage');
    else equal.push('Damage');
  } else if (candidate.damage && !equipped.damage) {
    better.push('Damage');
  }

  // Compare armor class
  if (candidate.armorClass !== undefined && equipped.armorClass !== undefined) {
    if (candidate.armorClass > equipped.armorClass) better.push('Armor Class');
    else if (candidate.armorClass < equipped.armorClass) worse.push('Armor Class');
    else equal.push('Armor Class');
  } else if (candidate.armorClass !== undefined && equipped.armorClass === undefined) {
    better.push('Armor Class');
  }

  // Compare stat bonuses
  if (candidate.statBonuses || equipped.statBonuses) {
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
    for (const ability of abilities) {
      const candidateVal = candidate.statBonuses?.[ability] || 0;
      const equippedVal = equipped.statBonuses?.[ability] || 0;
      if (candidateVal > equippedVal) better.push(`+${ability.toUpperCase()}`);
      else if (candidateVal < equippedVal) worse.push(`-${ability.toUpperCase()}`);
    }
  }

  // Compare special effects count
  if (candidate.specialEffects.length > equipped.specialEffects.length) {
    better.push('Special Effects');
  } else if (candidate.specialEffects.length < equipped.specialEffects.length) {
    worse.push('Special Effects');
  }

  // Compare rarity
  const rarityOrder = ['junk', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'artifact'];
  const candidateRank = rarityOrder.indexOf(candidate.rarity);
  const equippedRank = rarityOrder.indexOf(equipped.rarity);
  if (candidateRank > equippedRank) better.push('Rarity');
  else if (candidateRank < equippedRank) worse.push('Rarity');

  const summary =
    better.length > worse.length
      ? `${candidate.name} is likely an upgrade over ${equipped.name}.`
      : worse.length > better.length
      ? `${candidate.name} may be a downgrade from ${equipped.name}.`
      : `${candidate.name} is roughly equivalent to ${equipped.name}.`;

  return { better, worse, equal, summary };
}

// ---- Get total equipment bonuses ----

export function getEquipmentBonuses(
  character: Character,
  items: Item[]
): Partial<Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>> {
  const bonuses: Record<string, number> = {};
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  for (const slot of Object.values(character.equipment)) {
    if (!slot) continue;
    const item = items.find((i) => i.id === slot);
    if (!item?.statBonuses) continue;
    for (const ability of abilities) {
      const bonus = item.statBonuses[ability as keyof typeof item.statBonuses];
      if (bonus) {
        bonuses[ability] = (bonuses[ability] || 0) + bonus;
      }
    }
  }

  return bonuses;
}

// ---- Calculate AC from equipped items ----

function calculateEquippedAC(character: Character, items: Item[]): number {
  let baseAC = 10;
  const dexMod = character.abilityScores.dex.modifier;

  // Check equipped armor
  const chestItemId = character.equipment.chest;
  const shieldItemId = character.equipment['weapon-off'];

  if (chestItemId) {
    const armor = items.find((i) => i.id === chestItemId);
    if (armor?.armorClass) {
      baseAC = armor.armorClass;
      // Light armor: full dex; Medium: max +2 dex; Heavy: no dex
      if (armor.type === 'armor') {
        const weight = armor.weight;
        if (weight >= 40) {
          // Heavy: no dex mod
        } else if (weight >= 20) {
          // Medium: max +2 dex
          baseAC += Math.min(dexMod, 2);
        } else {
          // Light: full dex
          baseAC += dexMod;
        }
      }
    }
  } else {
    // Unarmored: 10 + DEX
    baseAC += dexMod;
  }

  // Shield bonus
  if (shieldItemId) {
    const shield = items.find((i) => i.id === shieldItemId);
    if (shield?.type === 'shield') {
      baseAC += shield.armorClass || 2;
    }
  }

  return baseAC;
}
