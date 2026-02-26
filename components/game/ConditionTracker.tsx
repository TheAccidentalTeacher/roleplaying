'use client';

import type { ActiveCondition } from '@/lib/types/character';

interface ConditionTrackerProps {
  conditions: ActiveCondition[];
  label?: string;
}

const conditionIcons: Record<string, string> = {
  blinded: '🙈',
  charmed: '💕',
  deafened: '🔇',
  frightened: '😨',
  grappled: '🤼',
  incapacitated: '💫',
  invisible: '👻',
  paralyzed: '⚡',
  petrified: '🪨',
  poisoned: '🤢',
  prone: '⬇️',
  restrained: '⛓️',
  stunned: '💫',
  unconscious: '😵',
  exhaustion: '😩',
  concentration: '🧘',
  raging: '🔥',
  blessed: '✨',
  cursed: '☠️',
  hasted: '⚡',
  slowed: '🐌',
  burning: '🔥',
  frozen: '❄️',
  bleeding: '🩸',
};

const conditionColors: Record<string, string> = {
  blinded: 'border-gray-500/40 text-gray-300',
  charmed: 'border-pink-500/40 text-pink-300',
  frightened: 'border-yellow-500/40 text-yellow-300',
  poisoned: 'border-green-500/40 text-green-300',
  paralyzed: 'border-purple-500/40 text-purple-300',
  stunned: 'border-amber-500/40 text-amber-300',
  unconscious: 'border-red-500/40 text-red-300',
  exhaustion: 'border-orange-500/40 text-orange-300',
  hasted: 'border-sky-500/40 text-sky-300',
  blessed: 'border-amber-400/40 text-amber-200',
  raging: 'border-red-400/40 text-red-200',
  burning: 'border-orange-400/40 text-orange-200',
  frozen: 'border-cyan-400/40 text-cyan-200',
};

export default function ConditionTracker({ conditions, label }: ConditionTrackerProps) {
  if (conditions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {label && (
        <span className="text-[10px] text-slate-500 mr-1">{label}:</span>
      )}
      {conditions.map((cond, i) => {
        const icon = conditionIcons[cond.type] || '⚠️';
        const color = conditionColors[cond.type] || 'border-slate-500/40 text-slate-300';

        return (
          <div
            key={`${cond.type}-${i}`}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] ${color}`}
            title={`${cond.type}${cond.duration ? ` (${cond.duration} rounds)` : ''}${cond.source ? ` — from ${cond.source}` : ''}`}
          >
            <span>{icon}</span>
            <span className="capitalize">{cond.type}</span>
            {cond.duration && cond.duration > 0 && (
              <span className="text-slate-500 ml-0.5">{cond.duration}r</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
