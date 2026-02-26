'use client';

import type { Character, EquipSlot } from '@/lib/types/character';
import { formatWeight, formatCurrency } from '@/lib/utils/formatters';

interface InventoryTabProps {
  character: Character;
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
            {equippedSlots.map((slot) => (
              <div
                key={slot}
                className="flex items-center justify-between bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2"
              >
                <span className="text-[10px] text-slate-500 w-24 flex-shrink-0">
                  {EQUIP_SLOT_LABELS[slot]}
                </span>
                <span className="text-xs text-slate-200 truncate flex-1 text-right">
                  {character.equipment[slot]}
                </span>
              </div>
            ))}
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
          <div className="space-y-0.5 max-h-60 overflow-y-auto">
            {character.inventory.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 rounded text-xs text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-slate-600">•</span>
                {item}
              </div>
            ))}
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
