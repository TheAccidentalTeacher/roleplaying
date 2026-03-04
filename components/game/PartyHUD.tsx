'use client';

import type { NPC } from '@/lib/types/npc';

interface PartyHUDProps {
  companions: NPC[]; // knownNPCs where isCompanion === true
  onSelectCompanion?: (npc: NPC) => void;
}

const MOOD_DOT: Record<string, string> = {
  happy: 'bg-emerald-400',
  content: 'bg-green-400',
  neutral: 'bg-slate-400',
  worried: 'bg-yellow-400',
  fearful: 'bg-orange-400',
  angry: 'bg-red-400',
  sad: 'bg-blue-400',
  determined: 'bg-purple-400',
  suspicious: 'bg-amber-400',
  injured: 'bg-red-500',
};

const ATTITUDE_COLOR: Record<string, string> = {
  allied: 'text-emerald-400',
  friendly: 'text-green-400',
  neutral: 'text-slate-400',
  unfriendly: 'text-orange-400',
  hostile: 'text-red-400',
};

function HPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  const color =
    pct > 66 ? 'bg-emerald-500' : pct > 33 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function LoyaltyPips({ score }: { score: number }) {
  // Map -100…+100 to 0…5 filled pips
  const pips = Math.round(((score + 100) / 200) * 5);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < pips ? 'bg-amber-400' : 'bg-slate-700'}`}
        />
      ))}
    </div>
  );
}

export default function PartyHUD({ companions, onSelectCompanion }: PartyHUDProps) {
  if (companions.length === 0) return null;

  return (
    <div className="px-3 py-2 border-t border-slate-700/30">
      {/* Header */}
      <h4 className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
        ⚔️ Party
        <span className="text-slate-600 font-normal text-[10px]">
          ({companions.length})
        </span>
      </h4>

      {/* Companion cards */}
      <div className="space-y-2">
        {companions.slice(0, 4).map((companion) => {
          const hp = companion.combatStats?.hp;
          const moodKey = companion.currentEmotionalState?.toLowerCase() || 'neutral';
          const moodDot = MOOD_DOT[moodKey] || MOOD_DOT['neutral'];
          const attitudeColor = ATTITUDE_COLOR[companion.attitudeTier] || ATTITUDE_COLOR['neutral'];

          return (
            <button
              key={companion.id}
              onClick={() => onSelectCompanion?.(companion)}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-amber-700/30 transition-all text-left group"
              title={`${companion.name} — ${companion.currentEmotionalState || 'neutral'}`}
            >
              {/* Portrait or initial */}
              <div className="flex-shrink-0 relative">
                {companion.portraitUrl ? (
                  <img
                    src={companion.portraitUrl}
                    alt={companion.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-bold text-slate-300 group-hover:border-amber-700/50">
                    {companion.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Mood dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${moodDot}`}
                  title={companion.currentEmotionalState || 'neutral'}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium text-slate-200 truncate group-hover:text-amber-200 transition-colors">
                    {companion.name}
                  </span>
                  <span className={`text-[10px] flex-shrink-0 ${attitudeColor}`}>
                    {companion.attitudeTier}
                  </span>
                </div>

                {/* HP bar (if combat stats available) */}
                {hp ? (
                  <div className="mt-1">
                    <HPBar current={hp.current} max={hp.max} />
                    <div className="mt-0.5 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {hp.current}/{hp.max} HP
                      </span>
                      <LoyaltyPips score={companion.relationshipScore} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {companion.race} · {companion.role}
                    </span>
                    <LoyaltyPips score={companion.relationshipScore} />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {companions.length > 4 && (
          <p className="text-[10px] text-slate-600 text-center">
            +{companions.length - 4} more companions
          </p>
        )}
      </div>
    </div>
  );
}
