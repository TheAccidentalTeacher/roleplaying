'use client';

import type { EnemyStatBlock } from '@/lib/types/encounter';

interface TargetSelectorProps {
  enemies: EnemyStatBlock[];
  selectedTargetId: string | null;
  onSelectTarget: (targetId: string) => void;
}

export default function TargetSelector({
  enemies,
  selectedTargetId,
  onSelectTarget,
}: TargetSelectorProps) {
  const aliveEnemies = enemies.filter((e) => e.isAlive);
  const deadEnemies = enemies.filter((e) => !e.isAlive);

  if (enemies.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3">
      <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
        Select Target
      </h4>
      <div className="space-y-1">
        {aliveEnemies.map((enemy) => {
          const hpPercent = (enemy.hp.current / enemy.hp.max) * 100;
          const isSelected = selectedTargetId === enemy.id;

          return (
            <button
              key={enemy.id}
              onClick={() => onSelectTarget(enemy.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
                isSelected
                  ? 'bg-red-500/15 border border-red-500/30'
                  : 'bg-slate-800/40 border border-transparent hover:bg-slate-800/60 hover:border-slate-700/40'
              }`}
            >
              {/* Enemy icon */}
              <span className="text-sm flex-shrink-0">👹</span>

              {/* Name and info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium truncate ${
                    isSelected ? 'text-red-200' : 'text-slate-300'
                  }`}>
                    {enemy.name}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">
                    AC {enemy.ac}
                  </span>
                </div>

                {/* HP bar */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hpPercent > 60
                          ? 'bg-green-500'
                          : hpPercent > 30
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono w-12 text-right">
                    {enemy.hp.current}/{enemy.hp.max}
                  </span>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <span className="text-red-400 text-xs flex-shrink-0">🎯</span>
              )}
            </button>
          );
        })}

        {/* Dead enemies */}
        {deadEnemies.length > 0 && (
          <div className="pt-1 border-t border-slate-800/50 mt-1">
            {deadEnemies.map((enemy) => (
              <div
                key={enemy.id}
                className="flex items-center gap-2 px-2 py-1 text-slate-600 text-xs opacity-40"
              >
                <span>💀</span>
                <span className="line-through">{enemy.name}</span>
                <span className="ml-auto text-[9px]">defeated</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
