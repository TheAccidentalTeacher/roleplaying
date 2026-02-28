'use client';

import type { NPC } from '@/lib/types/npc';
import HPBar from './HPBar';

interface CompanionCardProps {
  companion: NPC;
  isActive: boolean;
  onActivate?: () => void;
  onDismiss?: () => void;
  onTalk?: () => void;
}

export default function CompanionCard({
  companion,
  isActive,
  onActivate,
  onDismiss,
  onTalk,
}: CompanionCardProps) {
  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        isActive
          ? 'bg-slate-800 border-primary-600/50 ring-1 ring-primary-500/20'
          : 'bg-slate-900 border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Portrait */}
        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl shrink-0">
          {companion.portraitUrl ? (
            <img
              src={companion.portraitUrl}
              alt={companion.name}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            '🧙'
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & role */}
          <div className="flex items-center gap-2">
            <h4 className="font-cinzel font-bold text-sm truncate">{companion.name}</h4>
            {isActive && (
              <span className="text-[10px] px-1 py-0.5 bg-primary-900/50 text-primary-300 rounded">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 capitalize">
            {companion.race} • {companion.role.replace('-', ' ')}
          </p>

          {/* HP bar */}
          {companion.combatStats && (
            <div className="mt-1">
              <HPBar
                current={companion.combatStats.hp.current}
                max={companion.combatStats.hp.max}
                size="sm"
                showNumbers={false}
              />
            </div>
          )}

          {/* Attitude */}
          <p className="text-[10px] text-slate-600 mt-1">
            {companion.currentEmotionalState}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 mt-2">
        {!isActive && onActivate && (
          <button
            onClick={onActivate}
            className="flex-1 px-2 py-1 text-xs bg-primary-700 hover:bg-primary-600 rounded transition-colors"
          >
            Set Active
          </button>
        )}
        {onTalk && (
          <button
            onClick={onTalk}
            className="flex-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
          >
            Talk
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-2 py-1 text-xs bg-slate-800 hover:bg-red-900/50 text-slate-500 hover:text-red-300 rounded transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
