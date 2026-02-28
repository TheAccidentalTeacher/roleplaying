'use client';

import { useRef, useEffect } from 'react';
import type { ActionResult } from '@/lib/types/combat';

interface CombatLogProps {
  entries: ActionResult[];
  narration?: string;
}

export default function CombatLog({ entries, narration }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, narration]);

  const renderAttackResult = (entry: ActionResult) => {
    if (!entry.attackRoll) return null;
    const { attackRoll } = entry;
    return (
      <span className="text-slate-500 text-[10px] font-mono">
        {' '}[d20: {attackRoll.d20}
        {attackRoll.modifier >= 0 ? '+' : ''}
        {attackRoll.modifier} = {attackRoll.total}
        {' vs AC '}{attackRoll.targetAC}
        {attackRoll.isCritical && ' 💥CRIT'}
        {attackRoll.isCriticalFail && ' ❌FUMBLE'}
        ]
      </span>
    );
  };

  const renderDamageResult = (entry: ActionResult) => {
    if (!entry.damageRoll) return null;
    const { damageRoll } = entry;
    return (
      <span className="text-red-400/70 text-[10px] font-mono">
        {' '}→ {damageRoll.total} {damageRoll.type}
        {damageRoll.isCritical && ' (crit!)'}
      </span>
    );
  };

  return (
    <div
      ref={scrollRef}
      className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-3 h-full overflow-y-auto custom-scrollbar"
    >
      {/* Opening narration */}
      {narration && (
        <div className="mb-3 p-2 bg-slate-900/50 rounded-lg border-l-2 border-sky-500/40">
          <p className="text-sm text-slate-300 italic leading-relaxed">{narration}</p>
        </div>
      )}

      {/* Combat entries */}
      <div className="space-y-1.5">
        {entries.map((entry, i) => {
          const isPlayer = entry.actorName && !entry.actorId.startsWith('enemy-');
          return (
            <div
              key={`${entry.actorId}-${entry.action}-${i}`}
              className={`text-xs py-1 px-1.5 rounded ${
                isPlayer
                  ? 'text-sky-300/90'
                  : 'text-red-300/80'
              }`}
            >
              {/* Actor action line */}
              <div className="flex flex-wrap items-baseline gap-0.5">
                <span className="font-semibold">{entry.actorName}</span>
                <span className="text-slate-500">
                  {entry.action === 'attack' && entry.targetName
                    ? ` attacks ${entry.targetName}`
                    : ` uses ${entry.action}`}
                </span>
                {renderAttackResult(entry)}
                {entry.attackRoll?.hits && renderDamageResult(entry)}
                {entry.attackRoll && !entry.attackRoll.hits && (
                  <span className="text-slate-600 text-[10px]"> — miss</span>
                )}
              </div>

              {/* Narration */}
              {entry.narration && (
                <p className="text-slate-400/70 text-[11px] italic mt-0.5 leading-snug">
                  {entry.narration}
                </p>
              )}

              {/* Conditions applied */}
              {entry.conditionApplied && (
                <span className="text-amber-400/70 text-[10px]">
                  ⚠️ {entry.targetName || entry.actorName} is now{' '}
                  {entry.conditionApplied.type}!
                </span>
              )}

              {/* HP changes */}
              {entry.hpChange && entry.hpChange.length > 0 && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {entry.hpChange.map((hpc, j) => (
                    <span key={j} className={hpc.amount < 0 ? 'text-red-400/60' : 'text-green-400/60'}>
                      {hpc.amount < 0 ? `${Math.abs(hpc.amount)} damage` : `+${hpc.amount} healed`}
                      {j < entry.hpChange!.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {entries.length === 0 && !narration && (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-600 text-xs italic">Combat begins...</p>
        </div>
      )}
    </div>
  );
}
