'use client';

import type { CharacterLegacy } from '@/lib/types/session';

interface EpilogueViewProps {
  legacy: CharacterLegacy;
  onNewGamePlus?: () => void;
  onReturnToHall?: () => void;
}

function getRetirementLabel(cause: CharacterLegacy['causeOfRetirement']): { text: string; color: string; icon: string } {
  switch (cause) {
    case 'completed': return { text: 'Quest Complete', color: 'text-amber-400', icon: '👑' };
    case 'retired': return { text: 'Retired', color: 'text-blue-400', icon: '🏰' };
    case 'died': return { text: 'Fallen Hero', color: 'text-red-400', icon: '⚔️' };
    case 'ascended': return { text: 'Ascended', color: 'text-purple-400', icon: '✨' };
  }
}

export default function EpilogueView({ legacy, onNewGamePlus, onReturnToHall }: EpilogueViewProps) {
  const retirement = getRetirementLabel(legacy.causeOfRetirement);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-4xl">{retirement.icon}</p>
        <h1 className="font-cinzel text-3xl font-bold text-dark-100">
          {legacy.finalTitle}
        </h1>
        <p className="font-cinzel text-lg text-dark-300">
          {legacy.characterName} — {legacy.characterClass} Level {legacy.characterLevel}
        </p>
        <p className={`text-sm ${retirement.color}`}>{retirement.text}</p>
      </div>

      {/* Portrait */}
      {legacy.portraitUrl && (
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-lg border-2 border-dark-600 overflow-hidden">
            <img src={legacy.portraitUrl} alt={legacy.characterName} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Epilogue text */}
      <div className="bg-dark-800 rounded-lg border border-dark-600 p-6">
        <h2 className="font-cinzel text-sm text-dark-400 uppercase tracking-wider mb-3">
          The Final Chapter
        </h2>
        <div className="text-dark-200 leading-relaxed whitespace-pre-wrap font-merriweather text-sm">
          {legacy.epilogue}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="font-cinzel text-sm text-dark-400 uppercase tracking-wider mb-3">
          Legend Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Sessions', value: legacy.totalSessions, icon: '📖' },
            { label: 'Play Time', value: `${Math.floor(legacy.totalPlayTimeMinutes / 60)}h`, icon: '⏱️' },
            { label: 'Enemies', value: legacy.enemiesDefeated, icon: '⚔️' },
            { label: 'Quests', value: legacy.questsCompleted, icon: '📜' },
            { label: 'NPCs Recruited', value: legacy.npcsRecruited, icon: '🤝' },
            { label: 'Deaths', value: legacy.deathsSuffered, icon: '💀' },
            { label: 'Gold Earned', value: legacy.goldEarned, icon: '🪙' },
            { label: 'Items Found', value: legacy.itemsCollected, icon: '🎒' },
            { label: 'Secrets', value: legacy.secretsDiscovered, icon: '🔮' },
            { label: 'Gold Spent', value: legacy.goldSpent, icon: '💸' },
          ].map((stat) => (
            <div key={stat.label} className="bg-dark-800 rounded-lg border border-dark-700 p-3 text-center">
              <p className="text-lg mb-1">{stat.icon}</p>
              <p className="font-bold text-dark-100">{stat.value}</p>
              <p className="text-[10px] text-dark-500 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {legacy.achievements.length > 0 && (
        <div>
          <h2 className="font-cinzel text-sm text-dark-400 uppercase tracking-wider mb-3">
            Achievements Earned ({legacy.achievements.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {legacy.achievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 px-2 py-1 bg-dark-800 rounded-lg border border-dark-700"
                title={a.description}
              >
                <span>{a.icon}</span>
                <span className="text-xs text-dark-300">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Changes */}
      {legacy.worldChanges.length > 0 && (
        <div>
          <h2 className="font-cinzel text-sm text-dark-400 uppercase tracking-wider mb-3">
            World Impact
          </h2>
          <ul className="space-y-1">
            {legacy.worldChanges.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                <span className="text-primary-400 mt-0.5">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-4 border-t border-dark-700">
        {onNewGamePlus && (
          <button
            onClick={onNewGamePlus}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg font-cinzel font-bold transition-colors"
          >
            ⚡ New Game+
          </button>
        )}
        {onReturnToHall && (
          <button
            onClick={onReturnToHall}
            className="px-6 py-3 bg-dark-600 hover:bg-dark-500 rounded-lg font-medium transition-colors"
          >
            🏛️ Hall of Heroes
          </button>
        )}
      </div>
    </div>
  );
}
