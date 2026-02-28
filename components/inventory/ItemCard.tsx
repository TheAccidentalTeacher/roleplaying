'use client';

import type { Item, ItemRarity } from '@/lib/types/items';

interface ItemCardProps {
  item: Item;
  onClick?: (item: Item) => void;
  compact?: boolean;
  showActions?: boolean;
  onEquip?: (item: Item) => void;
  onDrop?: (item: Item) => void;
  onUse?: (item: Item) => void;
}

const rarityColors: Record<ItemRarity, { border: string; bg: string; text: string; glow: string }> = {
  junk: { border: 'border-slate-600/40', bg: 'bg-slate-800/20', text: 'text-slate-400', glow: '' },
  common: { border: 'border-slate-500/40', bg: 'bg-slate-800/30', text: 'text-slate-300', glow: '' },
  uncommon: { border: 'border-green-500/40', bg: 'bg-green-900/10', text: 'text-green-400', glow: '' },
  rare: { border: 'border-blue-500/40', bg: 'bg-blue-900/10', text: 'text-blue-400', glow: 'shadow-blue-500/10 shadow-md' },
  epic: { border: 'border-purple-500/40', bg: 'bg-purple-900/10', text: 'text-purple-400', glow: 'shadow-purple-500/15 shadow-md' },
  legendary: { border: 'border-amber-500/40', bg: 'bg-amber-900/10', text: 'text-amber-400', glow: 'shadow-amber-500/20 shadow-lg' },
  mythic: { border: 'border-red-500/40', bg: 'bg-red-900/10', text: 'text-red-400', glow: 'shadow-red-500/20 shadow-lg' },
  artifact: { border: 'border-amber-300/60', bg: 'bg-amber-900/15', text: 'text-amber-300', glow: 'shadow-amber-400/30 shadow-xl' },
};

const typeIcons: Record<string, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  shield: '🛡️',
  potion: '🧪',
  scroll: '📜',
  consumable: '🍖',
  magic: '✨',
  tool: '🔧',
  ammunition: '🏹',
  food: '🍞',
  treasure: '💎',
  key: '🗝️',
  material: '🧱',
  quest: '📋',
};

export default function ItemCard({
  item,
  onClick,
  compact = false,
  showActions = false,
  onEquip,
  onDrop,
  onUse,
}: ItemCardProps) {
  const colors = rarityColors[item.rarity] || rarityColors.common;

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(item)}
        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg border text-left transition-all hover:brightness-110 ${colors.border} ${colors.bg}`}
      >
        <span className="text-sm flex-shrink-0">{typeIcons[item.type] || '📦'}</span>
        <span className={`text-xs font-medium truncate flex-1 ${colors.text}`}>
          {item.name}
        </span>
        {item.quantity > 1 && (
          <span className="text-[10px] text-slate-500">x{item.quantity}</span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`rounded-xl border p-3 transition-all cursor-pointer hover:brightness-110 ${colors.border} ${colors.bg} ${colors.glow}`}
      onClick={() => onClick?.(item)}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-lg flex-shrink-0">{typeIcons[item.type] || '📦'}</span>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold leading-tight ${colors.text}`}>
            {item.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.text}`}>
              {item.rarity}
            </span>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="text-slate-500 text-[10px] capitalize">{item.type}</span>
          </div>
        </div>
        {item.quantity > 1 && (
          <span className="text-xs text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
            x{item.quantity}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mb-2">{item.description}</p>

      {/* Flavor text */}
      {item.flavorText && (
        <p className="text-[11px] text-slate-500 italic mb-2">{item.flavorText}</p>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {item.damage && (
          <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
            ⚔ {item.damage} {item.damageType || ''}
          </span>
        )}
        {item.armorClass !== undefined && (
          <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded">
            🛡 AC {item.armorClass}
          </span>
        )}
        {item.properties && item.properties.map((prop) => (
          <span
            key={prop}
            className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded capitalize"
          >
            {prop}
          </span>
        ))}
        {item.specialEffects.map((effect, i) => (
          <span
            key={`effect-${effect}`}
            className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded"
          >
            ✨ {effect}
          </span>
        ))}
      </div>

      {/* Stat bonuses */}
      {item.statBonuses && Object.entries(item.statBonuses).some(([, v]) => v !== 0) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {Object.entries(item.statBonuses).map(([ability, bonus]) =>
            bonus && bonus !== 0 ? (
              <span
                key={ability}
                className={`text-[10px] px-1 py-0.5 rounded ${
                  bonus > 0
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {bonus > 0 ? '+' : ''}
                {bonus} {ability.toUpperCase()}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* Footer: value, weight, level req */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
        <div className="flex gap-2">
          <span>💰 {item.sellValue}g</span>
          <span>⚖ {item.weight}lb</span>
        </div>
        {item.levelRequirement && (
          <span className="text-amber-500/70">Lv.{item.levelRequirement}+</span>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-1.5 mt-2 pt-2 border-t border-slate-800/50">
          {item.equippable && onEquip && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEquip(item);
              }}
              className="flex-1 text-[11px] bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded py-1 hover:bg-sky-500/20 transition"
            >
              Equip
            </button>
          )}
          {(item.type === 'potion' || item.type === 'consumable' || item.type === 'food') && onUse && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUse(item);
              }}
              className="flex-1 text-[11px] bg-green-500/10 border border-green-500/20 text-green-300 rounded py-1 hover:bg-green-500/20 transition"
            >
              Use
            </button>
          )}
          {item.canBeDropped && onDrop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDrop(item);
              }}
              className="text-[11px] bg-red-500/10 border border-red-500/20 text-red-300/60 rounded py-1 px-2 hover:bg-red-500/20 transition"
            >
              Drop
            </button>
          )}
        </div>
      )}
    </div>
  );
}
