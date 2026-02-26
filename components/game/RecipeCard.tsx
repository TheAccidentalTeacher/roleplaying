'use client';

import type { ItemRarity } from '@/lib/types/items';

interface RecipeCardProps {
  name: string;
  description: string;
  rarity: ItemRarity;
  materials: { name: string; count: number; have: number }[];
  craftingDC: number;
  unlocked: boolean;
  onClick?: () => void;
}

function getRarityBorder(rarity: ItemRarity): string {
  switch (rarity) {
    case 'junk': return 'border-gray-700';
    case 'common': return 'border-gray-600';
    case 'uncommon': return 'border-green-700';
    case 'rare': return 'border-blue-700';
    case 'epic': return 'border-purple-700';
    case 'legendary': return 'border-amber-600';
    case 'mythic': return 'border-red-600';
    case 'artifact': return 'border-pink-600';
    default: return 'border-gray-600';
  }
}

function getRarityText(rarity: ItemRarity): string {
  switch (rarity) {
    case 'junk': return 'text-gray-500';
    case 'common': return 'text-gray-300';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-amber-400';
    case 'mythic': return 'text-red-400';
    case 'artifact': return 'text-pink-400';
    default: return 'text-gray-300';
  }
}

export default function RecipeCard({
  name,
  description,
  rarity,
  materials,
  craftingDC,
  unlocked,
  onClick,
}: RecipeCardProps) {
  const canCraft = materials.every((m) => m.have >= m.count);

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`
        w-full text-left p-3 rounded-lg border-2 transition-all
        ${getRarityBorder(rarity)}
        ${unlocked ? 'bg-dark-800 hover:bg-dark-700 cursor-pointer' : 'bg-dark-900 opacity-50 cursor-not-allowed'}
        ${canCraft && unlocked ? 'ring-1 ring-green-500/30' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className={`font-cinzel font-bold text-sm ${getRarityText(rarity)}`}>
          {unlocked ? name : '??? Unknown Recipe'}
        </h4>
        <span className="text-xs text-dark-500">DC {craftingDC}</span>
      </div>

      {unlocked && (
        <>
          <p className="text-xs text-dark-400 mb-2">{description}</p>
          <div className="flex flex-wrap gap-1">
            {materials.map((m, i) => (
              <span
                key={i}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  m.have >= m.count
                    ? 'bg-green-900/30 text-green-300'
                    : 'bg-red-900/30 text-red-300'
                }`}
              >
                {m.name} {m.have}/{m.count}
              </span>
            ))}
          </div>
        </>
      )}
    </button>
  );
}
