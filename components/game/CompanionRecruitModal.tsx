'use client';

import { useEffect } from 'react';
import type { GameDataUpdate } from '@/lib/utils/game-data-parser';
import type { CompanionProfile } from '@/lib/types/world';

interface CompanionRecruitModalProps {
  companion: NonNullable<GameDataUpdate['companion_join']>;
  worldCompanion?: CompanionProfile; // Full profile from world data if available
  onRecruit: () => void;
  onDecline: () => void;
}

const ROLE_ICONS: Record<string, string> = {
  'tank': '🛡️',
  'healer': '💚',
  'dps-melee': '⚔️',
  'dps-ranged': '🏹',
  'support': '✨',
  'utility': '🔑',
};

const ROLE_LABELS: Record<string, string> = {
  'tank': 'Tank',
  'healer': 'Healer',
  'dps-melee': 'Warrior',
  'dps-ranged': 'Ranger',
  'support': 'Support',
  'utility': 'Rogue',
};

const ROLE_COLORS: Record<string, string> = {
  'tank': 'text-blue-300 bg-blue-900/40 border-blue-700/50',
  'healer': 'text-green-300 bg-green-900/40 border-green-700/50',
  'dps-melee': 'text-red-300 bg-red-900/40 border-red-700/50',
  'dps-ranged': 'text-amber-300 bg-amber-900/40 border-amber-700/50',
  'support': 'text-purple-300 bg-purple-900/40 border-purple-700/50',
  'utility': 'text-slate-300 bg-slate-800/60 border-slate-600/50',
};

export default function CompanionRecruitModal({
  companion,
  worldCompanion,
  onRecruit,
  onDecline,
}: CompanionRecruitModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDecline();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDecline]);

  const portraitUrl = companion.portrait_url || worldCompanion?.signature ? null : null; // Will be null until portrait generation is wired
  const roleKey = companion.role.toLowerCase();
  const roleIcon = ROLE_ICONS[roleKey] || '⚔️';
  const roleLabel = ROLE_LABELS[roleKey] || companion.role;
  const roleColor = ROLE_COLORS[roleKey] || ROLE_COLORS['utility'];

  // Merge world companion data with DM-provided data
  const backstory = worldCompanion?.backstory || null;
  const signature = worldCompanion?.signature || null;
  const loyaltyTriggers = worldCompanion?.loyaltyTriggers?.slice(0, 2) || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-amber-700/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Atmospheric header gradient */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-950/60 to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onDecline}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>

        <div className="relative flex gap-4 p-5 pb-0">
          {/* Portrait */}
          <div className="flex-shrink-0">
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={companion.name}
                className="w-24 h-24 rounded-xl object-cover border border-amber-700/50 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl shadow-lg">
                {roleIcon}
              </div>
            )}
            {/* Level badge */}
            <div className="mt-1.5 text-center">
              <span className="text-[10px] text-slate-500 font-mono">LVL {companion.level}</span>
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            {/* "A new companion awaits" header */}
            <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest mb-0.5">
              A Companion Awaits
            </p>
            <h2 className="text-2xl font-cinzel font-bold text-amber-200 leading-tight truncate">
              {companion.name}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {companion.race} · {companion.class}
            </p>

            {/* Role badge */}
            <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColor}`}>
              <span>{roleIcon}</span>
              <span>{roleLabel}</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 mt-4 border-t border-slate-700/50" />

        {/* Content area */}
        <div className="p-5 space-y-4">
          {/* Personality */}
          <div>
            <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Personality
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {companion.personality}
            </p>
          </div>

          {/* Backstory snippet if available */}
          {backstory && (
            <div>
              <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                Their Story
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                {backstory}
              </p>
            </div>
          )}

          {/* Personal quest hook */}
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2.5">
            <h3 className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mb-1">
              🗺️ Their Quest
            </h3>
            <p className="text-sm text-amber-200/80 leading-relaxed">
              {companion.personal_quest}
            </p>
          </div>

          {/* Signature ability if available */}
          {signature && (
            <div className="flex items-start gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
              <span className="text-lg mt-0.5">⚡</span>
              <div>
                <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                  Signature
                </h3>
                <p className="text-sm text-slate-300">{signature}</p>
              </div>
            </div>
          )}

          {/* Loyalty hints */}
          {loyaltyTriggers.length > 0 && (
            <div>
              <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                They value…
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {loyaltyTriggers.map((trigger, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] rounded-full bg-slate-800 border border-slate-700 text-slate-400"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onRecruit}
            className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/50 rounded-xl font-cinzel font-semibold text-sm text-white transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
          >
            ⚔️ Recruit {companion.name}
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 rounded-xl font-semibold text-sm text-slate-300 transition-all active:scale-95"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
