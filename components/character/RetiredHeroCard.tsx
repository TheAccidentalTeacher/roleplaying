'use client';

import type { CharacterLegacy } from '@/lib/types/session';

interface RetiredHeroCardProps {
  legacy: CharacterLegacy;
  isFavorite?: boolean;
  onView?: () => void;
  onToggleFavorite?: () => void;
}

function getRetirementBadge(cause: CharacterLegacy['causeOfRetirement']): { icon: string; color: string } {
  switch (cause) {
    case 'completed': return { icon: '👑', color: 'text-amber-400' };
    case 'retired': return { icon: '🏰', color: 'text-blue-400' };
    case 'died': return { icon: '💀', color: 'text-red-400' };
    case 'ascended': return { icon: '✨', color: 'text-purple-400' };
  }
}

export default function RetiredHeroCard({ legacy, isFavorite, onView, onToggleFavorite }: RetiredHeroCardProps) {
  const badge = getRetirementBadge(legacy.causeOfRetirement);

  return (
    <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden hover:border-dark-500 transition-all group">
      {/* Portrait row */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-lg bg-dark-700 flex items-center justify-center text-2xl shrink-0 border border-dark-600">
          {legacy.portraitUrl ? (
            <img src={legacy.portraitUrl} alt={legacy.characterName} className="w-full h-full rounded-lg object-cover" />
          ) : (
            badge.icon
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-cinzel font-bold text-sm truncate">{legacy.characterName}</h3>
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                className="text-sm shrink-0"
              >
                {isFavorite ? '⭐' : '☆'}
              </button>
            )}
          </div>
          <p className="text-xs text-dark-400">
            Level {legacy.characterLevel} {legacy.characterClass}
          </p>
          <p className={`text-[10px] ${badge.color}`}>
            {badge.icon} {legacy.causeOfRetirement}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="px-3 pb-2">
        <p className="font-cinzel text-xs text-primary-400 italic truncate">
          &ldquo;{legacy.finalTitle}&rdquo;
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-px bg-dark-700">
        <div className="bg-dark-800 px-2 py-1 text-center">
          <p className="text-xs font-bold">{legacy.questsCompleted}</p>
          <p className="text-[9px] text-dark-500">Quests</p>
        </div>
        <div className="bg-dark-800 px-2 py-1 text-center">
          <p className="text-xs font-bold">{legacy.enemiesDefeated}</p>
          <p className="text-[9px] text-dark-500">Foes</p>
        </div>
        <div className="bg-dark-800 px-2 py-1 text-center">
          <p className="text-xs font-bold">{legacy.achievements.length}</p>
          <p className="text-[9px] text-dark-500">Achieve</p>
        </div>
      </div>

      {/* View button */}
      {onView && (
        <button
          onClick={onView}
          className="w-full py-2 text-xs text-dark-400 hover:text-dark-200 bg-dark-700/50 hover:bg-dark-700 transition-colors"
        >
          View Legacy →
        </button>
      )}
    </div>
  );
}
