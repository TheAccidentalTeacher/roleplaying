'use client';

import type { EquippedItems, EquipSlot } from '@/lib/types/character';
import type { Item } from '@/lib/types/items';

interface PaperDollProps {
  equipment: EquippedItems;
  items: Item[];
  onSlotClick?: (slot: EquipSlot, item: Item | null) => void;
}

interface SlotPosition {
  slot: EquipSlot;
  label: string;
  icon: string;
  x: string;
  y: string;
}

const slotPositions: SlotPosition[] = [
  { slot: 'head', label: 'Head', icon: '👑', x: '50%', y: '5%' },
  { slot: 'neck', label: 'Neck', icon: '📿', x: '50%', y: '15%' },
  { slot: 'chest', label: 'Chest', icon: '🎽', x: '50%', y: '30%' },
  { slot: 'back', label: 'Back', icon: '🧥', x: '82%', y: '25%' },
  { slot: 'hands', label: 'Hands', icon: '🧤', x: '18%', y: '40%' },
  { slot: 'belt', label: 'Belt', icon: '🎗️', x: '50%', y: '45%' },
  { slot: 'legs', label: 'Legs', icon: '👖', x: '50%', y: '60%' },
  { slot: 'feet', label: 'Feet', icon: '👢', x: '50%', y: '78%' },
  { slot: 'weapon-main', label: 'Main Hand', icon: '⚔️', x: '15%', y: '55%' },
  { slot: 'weapon-off', label: 'Off Hand', icon: '🛡️', x: '85%', y: '55%' },
  { slot: 'ring-l', label: 'Ring L', icon: '💍', x: '8%', y: '48%' },
  { slot: 'ring-r', label: 'Ring R', icon: '💍', x: '92%', y: '48%' },
  { slot: 'trinket-1', label: 'Trinket 1', icon: '🔮', x: '20%', y: '70%' },
  { slot: 'trinket-2', label: 'Trinket 2', icon: '🔮', x: '80%', y: '70%' },
];

export default function PaperDoll({
  equipment,
  items,
  onSlotClick,
}: PaperDollProps) {
  const getItemForSlot = (slot: EquipSlot): Item | null => {
    const itemId = equipment[slot];
    if (!itemId) return null;
    return items.find((i) => i.id === itemId) || null;
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: '120%' }}>
      {/* Body silhouette background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-48 border-2 border-slate-700/20 rounded-full opacity-30" />
      </div>

      {/* Equipment slots */}
      {slotPositions.map((pos) => {
        const item = getItemForSlot(pos.slot);
        const isEmpty = !item;

        return (
          <button
            key={pos.slot}
            onClick={() => onSlotClick?.(pos.slot, item)}
            className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-lg border flex flex-col items-center justify-center transition-all ${
              isEmpty
                ? 'border-slate-700/30 bg-slate-800/20 hover:bg-slate-800/40 hover:border-slate-600/40'
                : 'border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/50'
            }`}
            style={{ left: pos.x, top: pos.y }}
            title={item ? `${pos.label}: ${item.name}` : `${pos.label}: Empty`}
          >
            <span className="text-sm leading-none">
              {isEmpty ? pos.icon : '✅'}
            </span>
            <span className="text-[7px] text-slate-500 leading-none mt-0.5 truncate w-full text-center px-0.5">
              {isEmpty ? pos.label : item.name.slice(0, 6)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
