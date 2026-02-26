'use client';

import type { Item } from '@/lib/types/items';

interface ItemCompareProps {
  equipped: Item | null;
  candidate: Item;
  onEquip: () => void;
  onCancel: () => void;
}

export default function ItemCompare({
  equipped,
  candidate,
  onEquip,
  onCancel,
}: ItemCompareProps) {
  const compareStat = (label: string, equippedVal?: number | string, candidateVal?: number | string) => {
    if (equippedVal === undefined && candidateVal === undefined) return null;
    const eNum = typeof equippedVal === 'number' ? equippedVal : 0;
    const cNum = typeof candidateVal === 'number' ? candidateVal : 0;
    const diff = cNum - eNum;

    return (
      <div className="flex items-center justify-between text-xs py-0.5">
        <span className="text-slate-400">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 w-16 text-right">
            {equippedVal ?? '—'}
          </span>
          <span className="text-slate-600">→</span>
          <span
            className={`w-16 ${
              diff > 0
                ? 'text-green-400'
                : diff < 0
                ? 'text-red-400'
                : 'text-slate-300'
            }`}
          >
            {candidateVal ?? '—'}
            {diff !== 0 && typeof equippedVal === 'number' && typeof candidateVal === 'number' && (
              <span className="text-[10px] ml-1">
                ({diff > 0 ? '+' : ''}
                {diff})
              </span>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl">
        <h3 className="text-sm font-bold text-slate-200 mb-3">Compare Items</h3>

        {/* Column headers */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">
          <span>Stat</span>
          <div className="flex items-center gap-3">
            <span className="w-16 text-right">Current</span>
            <span className="w-4" />
            <span className="w-16">New</span>
          </div>
        </div>

        <div className="border-t border-slate-800 mb-2" />

        {/* Item names */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 text-right pr-3">
            <span className="text-xs text-slate-400">
              {equipped?.name || 'Empty slot'}
            </span>
          </div>
          <span className="text-slate-600 text-xs">vs</span>
          <div className="flex-1 pl-3">
            <span className="text-xs text-sky-300 font-medium">
              {candidate.name}
            </span>
          </div>
        </div>

        {/* Stats comparison */}
        <div className="space-y-0.5">
          {compareStat('Damage', equipped?.damage as string | undefined, candidate.damage)}
          {compareStat('Armor Class', equipped?.armorClass, candidate.armorClass)}
          {compareStat('Weight', equipped?.weight, candidate.weight)}
          {compareStat('Value', equipped?.baseValue, candidate.baseValue)}

          {/* Stat bonuses */}
          {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((ability) => {
            const eBonus = equipped?.statBonuses?.[ability as keyof typeof equipped.statBonuses];
            const cBonus = candidate.statBonuses?.[ability as keyof typeof candidate.statBonuses];
            if (!eBonus && !cBonus) return null;
            return compareStat(
              ability.toUpperCase(),
              eBonus || 0,
              cBonus || 0
            );
          })}
        </div>

        {/* Special effects comparison */}
        {(equipped?.specialEffects.length || candidate.specialEffects.length) ? (
          <div className="mt-3 pt-2 border-t border-slate-800">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Special Effects
            </h4>
            <div className="flex gap-2 text-[11px]">
              <div className="flex-1 text-slate-400 space-y-0.5">
                {equipped?.specialEffects.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
                {(!equipped || equipped.specialEffects.length === 0) && (
                  <div className="text-slate-600 italic">None</div>
                )}
              </div>
              <div className="flex-1 text-sky-300 space-y-0.5">
                {candidate.specialEffects.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
                {candidate.specialEffects.length === 0 && (
                  <div className="text-slate-600 italic">None</div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition"
          >
            Keep Current
          </button>
          <button
            onClick={onEquip}
            className="flex-1 px-3 py-2 text-xs bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/30 transition"
          >
            Equip {candidate.name}
          </button>
        </div>
      </div>
    </div>
  );
}
