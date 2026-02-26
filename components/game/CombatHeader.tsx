'use client';

import type { CombatState } from '@/lib/types/combat';

interface CombatHeaderProps {
  combatState: CombatState;
}

export default function CombatHeader({ combatState }: CombatHeaderProps) {
  const aliveEnemies = combatState.enemies.filter((e) => e.isAlive);
  const totalEnemies = combatState.enemies.length;
  const currentEntity = combatState.initiativeOrder[combatState.turnIndex];
  const isPlayerTurn = currentEntity?.entityType === 'player';

  return (
    <div className="bg-slate-900/90 border-b border-slate-700/50 px-4 py-2 flex items-center justify-between">
      {/* Left: encounter name */}
      <div className="flex items-center gap-2">
        <span className="text-red-400 animate-pulse">⚔️</span>
        <h2 className="text-sm font-bold text-slate-200">
          {combatState.encounterName || 'Combat'}
        </h2>
      </div>

      {/* Center: round and turn info */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Round</span>
          <span className="font-bold text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded">
            {combatState.roundNumber}
          </span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isPlayerTurn ? 'bg-sky-400' : 'bg-red-400'}`} />
          <span className={isPlayerTurn ? 'text-sky-300 font-semibold' : 'text-red-300'}>
            {currentEntity?.entityName || '...'}
          </span>
        </div>
      </div>

      {/* Right: enemy count and terrain info */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <span>👹</span>
          <span>{aliveEnemies.length}/{totalEnemies}</span>
        </div>

        {combatState.terrainEffects.length > 0 && (
          <div className="flex items-center gap-1 text-amber-400/70" title={combatState.terrainEffects.join(', ')}>
            <span>🌍</span>
            <span className="text-[10px]">{combatState.terrainEffects[0]}</span>
          </div>
        )}

        {combatState.lightingCondition !== 'bright' && (
          <span className="text-amber-400/50 text-[10px]">
            {combatState.lightingCondition === 'dim' && '🌙 Dim'}
            {combatState.lightingCondition === 'darkness' && '🌑 Dark'}
            {combatState.lightingCondition === 'magical-darkness' && '🌑 Magical Dark'}
          </span>
        )}
      </div>
    </div>
  );
}
