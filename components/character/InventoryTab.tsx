'use client';

import type { Character, EquipSlot } from '@/lib/types/character';
import { formatWeight, formatCurrency } from '@/lib/utils/formatters';

interface InventoryTabProps {
  character: Character;
}

// ---- Rarity inference from item name keywords ----

type InferredRarity = 'junk' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'artifact';

const rarityKeywords: [RegExp, InferredRarity][] = [
  [/\b(artifact|divine|godly)\b/i, 'artifact'],
  [/\b(mythic|primordial)\b/i, 'mythic'],
  [/\b(legendary|ancient|elder)\b/i, 'legendary'],
  [/\b(epic|greater|superior)\b/i, 'epic'],
  [/\b(rare|fine|enchanted|magic|magical|\+[2-3])\b/i, 'rare'],
  [/\b(uncommon|quality|blessed|\+1)\b/i, 'uncommon'],
  [/\b(rusty|broken|crude|worn|tattered|junk)\b/i, 'junk'],
];

const typeKeywords: [RegExp, string][] = [
  [/\b(sword|axe|mace|dagger|bow|crossbow|staff|spear|halberd|hammer|rapier|scimitar|flail|lance|weapon|blade|glaive|club)\b/i, 'weapon'],
  [/\b(armor|plate|chainmail|mail|breastplate|shield|helm|helmet|gauntlet)\b/i, 'armor'],
  [/\b(potion|elixir|tonic|brew|draught|vial)\b/i, 'potion'],
  [/\b(scroll|tome|spellbook|grimoire)\b/i, 'scroll'],
  [/\b(ring|amulet|necklace|bracelet|pendant|circlet|crown|tiara)\b/i, 'magic'],
  [/\b(ration|food|bread|meat|cheese|fruit|berry)\b/i, 'food'],
  [/\b(rope|torch|lantern|tinderbox|tool|kit|pick|shovel)\b/i, 'tool'],
  [/\b(arrow|bolt|bullet|ammunition)\b/i, 'ammunition'],
  [/\b(gem|jewel|gold|coin|treasure|ruby|emerald|sapphire|diamond)\b/i, 'treasure'],
  [/\b(key|lockpick)\b/i, 'key'],
];

const typeIcons: Record<string, string> = {
  weapon: '⚔️', armor: '🛡️', potion: '🧪', scroll: '📜', magic: '✨',
  food: '🍖', tool: '🔧', ammunition: '🏹', treasure: '💎', key: '🗝️',
  unknown: '📦',
};

const rarityStyles: Record<InferredRarity, { border: string; text: string; dot: string }> = {
  junk: { border: 'border-slate-700/40', text: 'text-slate-400', dot: 'bg-slate-500' },
  common: { border: 'border-slate-600/40', text: 'text-slate-300', dot: 'bg-slate-400' },
  uncommon: { border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500' },
  rare: { border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  epic: { border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500' },
  legendary: { border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  mythic: { border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
  artifact: { border: 'border-amber-300/50', text: 'text-amber-300', dot: 'bg-amber-300' },
};

function inferRarity(name: string): InferredRarity {
  for (const [pattern, rarity] of rarityKeywords) {
    if (pattern.test(name)) return rarity;
  }
  return 'common';
}

function inferType(name: string): string {
  for (const [pattern, type] of typeKeywords) {
    if (pattern.test(name)) return type;
  }
  return 'unknown';
}

const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  head: '🎩 Head',
  neck: '📿 Neck',
  chest: '🛡️ Chest',
  back: '🧥 Back',
  hands: '🧤 Hands',
  belt: '⬜ Belt',
  legs: '👖 Legs',
  feet: '👢 Feet',
  'ring-l': '💍 Ring (L)',
  'ring-r': '💍 Ring (R)',
  'weapon-main': '⚔️ Main Hand',
  'weapon-off': '🗡️ Off Hand',
  'trinket-1': '✨ Trinket 1',
  'trinket-2': '✨ Trinket 2',
  pack: '🎒 Pack',
  secret: '🔮 Secret',
};

const EQUIP_DISPLAY_ORDER: EquipSlot[] = [
  'weapon-main',
  'weapon-off',
  'head',
  'neck',
  'chest',
  'back',
  'hands',
  'belt',
  'legs',
  'feet',
  'ring-l',
  'ring-r',
  'trinket-1',
  'trinket-2',
];

export default function InventoryTab({ character }: InventoryTabProps) {
  // Get equipped item entries (non-empty slots)
  const equippedSlots = EQUIP_DISPLAY_ORDER.filter(
    (slot) => character.equipment[slot]
  );

  const encumbranceColor =
    character.encumbrance === 'light'
      ? 'text-emerald-400'
      : character.encumbrance === 'medium'
      ? 'text-amber-400'
      : character.encumbrance === 'heavy'
      ? 'text-orange-400'
      : 'text-red-400';

  return (
    <div className="space-y-5">
      {/* Gold */}
      <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm text-amber-300 font-cinzel">Gold</span>
        <span className="text-xl font-bold text-amber-400">{character.gold}</span>
      </div>

      {/* Equipment (Paper Doll simplified) */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Equipped
        </h4>
        {equippedSlots.length > 0 ? (
          <div className="space-y-1">
            {equippedSlots.map((slot) => {
              const itemName = character.equipment[slot] || '';
              const rarity = inferRarity(itemName);
              const styles = rarityStyles[rarity];
              return (
                <div
                  key={slot}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 border ${styles.border} bg-slate-800/40`}
                >
                  <span className="text-[10px] text-slate-500 w-24 flex-shrink-0">
                    {EQUIP_SLOT_LABELS[slot]}
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                    <span className={`text-xs font-medium truncate ${styles.text}`}>
                      {itemName}
                    </span>
                    {rarity !== 'common' && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} title={rarity} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic text-center py-2">
            No items equipped
          </p>
        )}
      </div>

      {/* Backpack */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            🎒 Backpack ({character.inventory.length} items)
          </h4>
        </div>
        {character.inventory.length > 0 ? (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {character.inventory.map((item, i) => {
              const rarity = inferRarity(item);
              const itemType = inferType(item);
              const styles = rarityStyles[rarity];
              const icon = typeIcons[itemType] || typeIcons.unknown;

              return (
                <div
                  key={`${item}-${i}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:brightness-110 cursor-default ${styles.border} bg-slate-800/30`}
                >
                  <span className="text-sm flex-shrink-0">{icon}</span>
                  <span className={`text-xs font-medium flex-1 truncate ${styles.text}`}>
                    {item}
                  </span>
                  {rarity !== 'common' && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} title={rarity} />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic text-center py-2">
            Backpack is empty
          </p>
        )}
      </div>

      {/* Carry Weight */}
      <div className="pt-2 border-t border-slate-700/30">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Carry Weight</span>
          <span className={encumbranceColor}>
            {character.carryWeight} / {character.carryCapacity} lbs
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              character.encumbrance === 'light'
                ? 'bg-emerald-500'
                : character.encumbrance === 'medium'
                ? 'bg-amber-500'
                : character.encumbrance === 'heavy'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min(100, (character.carryWeight / character.carryCapacity) * 100)}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-slate-600 text-right mt-0.5 capitalize">
          {character.encumbrance}
        </p>
      </div>
    </div>
  );
}
