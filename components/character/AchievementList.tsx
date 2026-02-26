'use client';

import type { Achievement } from '@/lib/types/session';

interface AchievementListProps {
  achievements: Achievement[];
  totalPossible?: number;
}

function getRarityStyle(rarity: Achievement['rarity']): { bg: string; border: string; text: string } {
  switch (rarity) {
    case 'common':
      return { bg: 'bg-gray-900/30', border: 'border-gray-700', text: 'text-gray-300' };
    case 'uncommon':
      return { bg: 'bg-green-900/20', border: 'border-green-800', text: 'text-green-400' };
    case 'rare':
      return { bg: 'bg-blue-900/20', border: 'border-blue-800', text: 'text-blue-400' };
    case 'legendary':
      return { bg: 'bg-amber-900/20', border: 'border-amber-700', text: 'text-amber-400' };
  }
}

export default function AchievementList({ achievements, totalPossible }: AchievementListProps) {
  const grouped = achievements.reduce(
    (acc, a) => {
      acc[a.rarity] = acc[a.rarity] || [];
      acc[a.rarity].push(a);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );

  const rarityOrder: Achievement['rarity'][] = ['legendary', 'rare', 'uncommon', 'common'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-cinzel text-lg font-bold">🏆 Achievements</h3>
        {totalPossible && (
          <span className="text-sm text-dark-400">
            {achievements.length}/{totalPossible}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalPossible && (
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${(achievements.length / totalPossible) * 100}%` }}
          />
        </div>
      )}

      {/* Achievements by rarity */}
      {rarityOrder.map((rarity) => {
        const group = grouped[rarity];
        if (!group || group.length === 0) return null;

        return (
          <div key={rarity}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${getRarityStyle(rarity).text}`}>
              {rarity} ({group.length})
            </h4>
            <div className="space-y-1">
              {group.map((achievement) => {
                const style = getRarityStyle(achievement.rarity);
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-2 rounded-lg border ${style.bg} ${style.border}`}
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${style.text}`}>{achievement.name}</p>
                      <p className="text-xs text-dark-400">{achievement.description}</p>
                    </div>
                    <span className="text-[10px] text-dark-500 shrink-0">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {achievements.length === 0 && (
        <p className="text-dark-500 text-sm text-center py-4">
          No achievements earned yet. Keep adventuring!
        </p>
      )}
    </div>
  );
}
