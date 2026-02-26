'use client';

import type { Initiative } from '@/lib/types/combat';
import type { EnemyStatBlock } from '@/lib/types/encounter';

interface InitiativeTrackerProps {
  order: Initiative[];
  currentIndex: number;
  enemies: EnemyStatBlock[];
}

export default function InitiativeTracker({
  order,
  currentIndex,
  enemies,
}: InitiativeTrackerProps) {
  const getEnemyHP = (entityId: string) => {
    const enemy = enemies.find((e) => e.id === entityId);
    if (!enemy) return null;
    return enemy;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3">
      <h3 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
        Initiative Order
      </h3>
      <div className="space-y-1">
        {order.map((entity, i) => {
          const isCurrent = i === currentIndex;
          const enemy = entity.entityType === 'enemy' ? getEnemyHP(entity.entityId) : null;
          const isDead = enemy && !enemy.isAlive;

          return (
            <div
              key={entity.entityId}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all ${
                isDead
                  ? 'opacity-30 line-through'
                  : isCurrent
                  ? 'bg-sky-500/15 border border-sky-500/30 text-sky-200'
                  : 'text-slate-400'
              }`}
            >
              {/* Turn indicator */}
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isCurrent ? 'bg-sky-400' : 'bg-transparent'
              }`} />

              {/* Icon */}
              <span className="text-xs flex-shrink-0">
                {entity.entityType === 'player'
                  ? '⚔️'
                  : entity.entityType === 'companion'
                  ? '🛡️'
                  : isDead
                  ? '💀'
                  : '👹'}
              </span>

              {/* Name */}
              <span className="flex-1 truncate text-xs">{entity.entityName}</span>

              {/* Initiative score */}
              <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">
                {entity.total}
              </span>

              {/* Enemy HP bar */}
              {enemy && enemy.isAlive && (
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${(enemy.hp.current / enemy.hp.max) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
