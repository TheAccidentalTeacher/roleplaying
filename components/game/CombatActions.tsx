'use client';

import type { CombatAction, CombatActionType } from '@/lib/types/combat';

interface CombatActionsProps {
  actions: CombatAction[];
  onAction: (actionType: CombatActionType, targetId?: string) => void;
  disabled?: boolean;
}

const actionIcons: Record<string, string> = {
  attack: '⚔️',
  'cast-spell': '✨',
  'use-item': '🧪',
  dodge: '🛡️',
  dash: '💨',
  disengage: '🔄',
  hide: '👤',
  help: '🤝',
  ready: '⏳',
  grapple: '🤼',
  shove: '💪',
  interact: '🖐️',
  flee: '🏃',
  special: '⭐',
};

export default function CombatActions({
  actions,
  onAction,
  disabled,
}: CombatActionsProps) {
  const mainActions = actions.filter((a) => !a.bonusAction);
  const bonusActions = actions.filter((a) => a.bonusAction);

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3">
      {/* Main Actions */}
      <div className="mb-2">
        <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
          Actions
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {mainActions.map((action) => (
            <button
              key={action.type}
              onClick={() => onAction(action.type)}
              disabled={disabled || !action.available}
              title={action.available ? action.description : action.unavailableReason}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs transition-all ${
                !action.available || disabled
                  ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed opacity-50'
                  : action.type === 'attack'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:border-red-500/40'
                  : action.type === 'cast-spell'
                  ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40'
                  : action.type === 'flee'
                  ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/40'
                  : 'bg-slate-800/60 border border-slate-700/40 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600/60'
              }`}
            >
              <span className="text-base">{actionIcons[action.type] || '⭐'}</span>
              <span className="font-medium leading-tight text-center">{action.label}</span>
              {action.resourceCost && (
                <span className="text-[9px] text-slate-500">{action.resourceCost}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bonus Actions */}
      {bonusActions.length > 0 && (
        <div>
          <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
            Bonus Actions
          </h4>
          <div className="flex gap-1.5 flex-wrap">
            {bonusActions.map((action) => (
              <button
                key={action.type}
                onClick={() => onAction(action.type)}
                disabled={disabled || !action.available}
                title={action.available ? action.description : action.unavailableReason}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-all ${
                  !action.available || disabled
                    ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <span className="text-xs">{actionIcons[action.type] || '⭐'}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
