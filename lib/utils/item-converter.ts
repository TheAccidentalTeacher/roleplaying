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
// Covers standard fantasy + post-apocalypse, cyberpunk, sci-fi, western, pirate, japanese, and other genre items
const TYPE_PATTERNS: [RegExp, ItemType][] = [
  // Weapons — melee
  [/\b(sword|axe|mace|hammer|dagger|bow|crossbow|staff|spear|flail|halberd|rapier|scimitar|warhammer|glaive|pike|javelin|club|whip|trident|maul|lance|blade|machete|hatchet|sledgehammer|bludgeon|saber|sabre|cutlass|katana|wakizashi|tanto|naginata|kunai|kopis|falcata|bowie|cleaver|kukri|scythe|nunchaku|tonfa|rebar|pipe sword|vibroblade|monomolecular|monoblade|phase blade|plasma saber|energy lance|neural whip|baton|war pick|war fan|tessen|bo staff|belaying pin|marlinspike|tomahawk|bayonet)\b/i, 'weapon'],
  // Weapons — ranged / firearms
  [/\b(rifle|pistol|revolver|musket|flintlock|carbine|shotgun|blaster|rail gun|rail pistol|laser rifle|plasma pistol|repeater|sling|handgun|submachine|longarm|hand cannon|derringer|scattergun|holdout)\b/i, 'weapon'],
  // Armor — all genres
  [/\b(armor|mail|plate|breastplate|chainmail|leather armor|hide|brigandine|cuirass|gambeson|vest|duster|jacket|coat|do-maru|kimono|haori|exosuit|flak jacket|riot gear|tactical armor|ballistic|carbon[- ]weave|composite plate|body armor|kevlar|studded leather|jerkin|hauberk|lamellar|scale mail)\b/i, 'armor'],
  // Shields / barriers
  [/\b(shield|buckler|pavise|barrier|tessen|war fan|aspis|parma|aegis|deflector|hardlight)\b/i, 'shield'],
  [/\b(potion|elixir|vial|draught|tonic|salve|balm|stim|stimpack|injector|med[- ]?spray|nano[- ]?gel)\b/i, 'potion'],
  [/\b(scroll|tome|grimoire|spellbook|manuscript|parchment|data[- ]?pad|data[- ]?slate|holo[- ]?manual)\b/i, 'scroll'],
  [/\b(ration|food|bread|meat|cheese|apple|fruit|berry|herb|mushroom|fish|ale|wine|mead|protein|nutrient|energy bar|field ration|hardtack|jerky|canned|instant meal|rice ball|onigiri|sake|whiskey|rum|grog)\b/i, 'food'],
  [/\b(arrow|bolt|bullet|ammunition|quiver|sling stone|cartridge|slug|cell|charge pack|energy cell|power cell|shot|round|pellet|clip|magazine)\b/i, 'ammunition'],
  [/\b(ring|amulet|necklace|circlet|crown|cloak|robe|boots|gloves|gauntlet|belt|bracelet|gem|jewel|pendant|earring|brooch|talisman|totem|charm|omamori|fetish|phylactery|neural implant|cyberdeck)\b/i, 'magic'],
  [/\b(key|lockpick|skeleton key|keycard|access card|passkey)\b/i, 'key'],
  [/\b(gold|coin|treasure|jewels|gems|ruby|emerald|sapphire|diamond|pearl|ivory|credits|scrip|doubloon|pieces of eight|bounty note)\b/i, 'treasure'],
  [/\b(thieves|tools|rope|torch|lantern|compass|map|toolkit|kit|wrench|pry bar|multitool|hacking tool|flashlight|flare|grapple|binoculars|spyglass|sextant|lasso|lariat)\b/i, 'tool'],
  [/\b(bandage|antidote|remedy|medicine|medkit|first aid|painkillers|antibiotics|rad[- ]?away|purification|disinfectant)\b/i, 'consumable'],
];

// ---- Damage strings by weapon type ----
// Covers fantasy + genre-specific weapons (same mechanical balance)
const WEAPON_DAMAGE: Record<string, string> = {
  // Standard fantasy
  dagger: '1d4', club: '1d4', javelin: '1d6', mace: '1d6',
  scimitar: '1d6', rapier: '1d8', sword: '1d8', bow: '1d8',
  crossbow: '1d10', halberd: '1d10', pike: '1d10', glaive: '1d10',
  lance: '1d12', axe: '1d8', hammer: '1d8', warhammer: '1d10',
  maul: '2d6', staff: '1d6', flail: '1d8', spear: '1d6',
  trident: '1d6', whip: '1d4',
  // Post-apocalypse / contemporary
  machete: '1d6', hatchet: '1d6', sledgehammer: '2d6', bludgeon: '1d6',
  baton: '1d4', cleaver: '1d6', 'box cutter': '1d4',
  // Firearms / ranged
  rifle: '1d10', pistol: '1d8', revolver: '1d8', shotgun: '2d6',
  musket: '1d12', flintlock: '1d8', carbine: '1d10', blaster: '1d8',
  derringer: '1d4', repeater: '1d10',
  // Cyberpunk / sci-fi
  vibroblade: '1d8', monoblade: '1d8', 'plasma saber': '1d10',
  'phase blade': '1d8', 'rail pistol': '1d10', 'laser rifle': '1d10',
  'neural whip': '1d4', 'energy lance': '1d10',
  // Japanese
  katana: '1d8', wakizashi: '1d6', naginata: '1d10', tanto: '1d4',
  kunai: '1d4', 'bo staff': '1d6', nunchaku: '1d6', tonfa: '1d4',
  // Pirate / western / mythological
  cutlass: '1d8', saber: '1d8', 'bowie knife': '1d4',
  kopis: '1d6', falcata: '1d6', scythe: '1d10',
  tomahawk: '1d6', kukri: '1d4', belaying: '1d4',
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
