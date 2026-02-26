'use client';

import { useState, useEffect } from 'react';
import type { Item, ItemRarity } from '@/lib/types/items';
import ItemCard from './ItemCard';

interface LootPopupProps {
  loot: {
    items: Item[];
    gold: number;
    narration?: string;
  };
  onTakeAll: () => void;
  onTakeSelected: (selectedIds: string[]) => void;
  onClose: () => void;
}

const rarityOrder: ItemRarity[] = [
  'artifact', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common', 'junk',
];

export default function LootPopup({
  loot,
  onTakeAll,
  onTakeSelected,
  onClose,
}: LootPopupProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);

  // Sort items by rarity (best last for dramatic reveal)
  const sortedItems = [...loot.items].sort(
    (a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
  );

  // Reveal items one at a time with increasing delay for rarer items
  useEffect(() => {
    if (revealedCount >= sortedItems.length) {
      setAllRevealed(true);
      return;
    }

    const nextItem = sortedItems[revealedCount];
    const isRare = ['rare', 'epic', 'legendary', 'mythic', 'artifact'].includes(nextItem.rarity);
    const delay = isRare ? 800 : 400;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [revealedCount, sortedItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleItem = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleTakeSelected = () => {
    onTakeSelected(Array.from(selectedIds));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">💰</div>
          <h2 className="font-cinzel text-lg font-bold text-amber-400">Loot Found!</h2>
          {loot.narration && (
            <p className="text-xs text-slate-400 italic mt-1">{loot.narration}</p>
          )}
        </div>

        {/* Gold */}
        {loot.gold > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <span className="text-lg">🪙</span>
            <span className="text-amber-400 font-bold text-lg">{loot.gold}</span>
            <span className="text-amber-400/70 text-sm">gold</span>
          </div>
        )}

        {/* Items — revealed one at a time */}
        <div className="space-y-2 mb-4">
          {sortedItems.map((item, i) => {
            if (i >= revealedCount) {
              return (
                <div
                  key={item.id}
                  className="h-12 bg-slate-800/40 border border-slate-700/30 rounded-xl flex items-center justify-center"
                >
                  <span className="text-slate-600 text-xs animate-pulse">• • •</span>
                </div>
              );
            }

            const isSelected = selectedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`relative animate-fadeIn ${
                  isSelected ? 'ring-1 ring-sky-500/40 rounded-xl' : ''
                }`}
              >
                {/* Selection checkbox */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="absolute top-2 right-2 z-10 w-5 h-5 rounded border flex items-center justify-center text-[10px] transition-all"
                  style={{
                    borderColor: isSelected ? 'rgb(56, 189, 248)' : 'rgb(71, 85, 105)',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    color: isSelected ? 'rgb(56, 189, 248)' : 'rgb(100, 116, 139)',
                  }}
                >
                  {isSelected ? '✓' : ''}
                </button>
                <ItemCard item={item} />
              </div>
            );
          })}
        </div>

        {/* Skip reveal button */}
        {!allRevealed && (
          <button
            onClick={() => {
              setRevealedCount(sortedItems.length);
              setAllRevealed(true);
            }}
            className="w-full text-xs text-slate-500 hover:text-slate-300 py-1 transition"
          >
            Reveal All →
          </button>
        )}

        {/* Action buttons */}
        {allRevealed && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-700 transition"
            >
              Leave
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleTakeSelected}
                className="flex-1 px-3 py-2 text-xs bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/30 transition"
              >
                Take Selected ({selectedIds.size})
              </button>
            )}
            <button
              onClick={onTakeAll}
              className="flex-1 px-3 py-2 text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/30 transition font-semibold"
            >
              Take All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
