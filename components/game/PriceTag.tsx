'use client';

import type { ItemRarity } from '@/lib/types/items';

interface PriceTagProps {
  basePrice: number;
  finalPrice: number;
  rarity?: ItemRarity;
  showDiscount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getRarityColor(rarity: ItemRarity): string {
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

export default function PriceTag({
  basePrice,
  finalPrice,
  rarity = 'common',
  showDiscount = true,
  size = 'md',
}: PriceTagProps) {
  const discount = basePrice > 0 ? Math.round((1 - finalPrice / basePrice) * 100) : 0;
  const isDiscounted = Math.abs(discount) > 0 && showDiscount;

  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';
  const iconSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1 ${textSize}`}>
      <span className={`${iconSize}`}>🪙</span>
      {isDiscounted && basePrice !== finalPrice && (
        <span className="line-through text-dark-500">{basePrice}</span>
      )}
      <span className={`font-bold ${getRarityColor(rarity)}`}>
        {finalPrice}
      </span>
      {isDiscounted && discount > 0 && (
        <span className="text-green-400 text-xs">(-{discount}%)</span>
      )}
      {isDiscounted && discount < 0 && (
        <span className="text-red-400 text-xs">(+{Math.abs(discount)}%)</span>
      )}
    </span>
  );
}
