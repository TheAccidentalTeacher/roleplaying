'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import CombatHeader from './CombatHeader';
import InitiativeTracker from './InitiativeTracker';
import CombatActions from './CombatActions';
import CombatLog from './CombatLog';
import TargetSelector from './TargetSelector';
import ConditionTracker from './ConditionTracker';
import type { CombatActionType, CombatState, ActionResult } from '@/lib/types/combat';
import type { Character } from '@/lib/types/character';

interface CombatViewProps {
  character: Character;
  onCombatEnd?: (combatState: CombatState) => void;
}

export default function CombatView({ character, onCombatEnd }: CombatViewProps) {
  const { combatState, setCombatState, updateActiveCharacter } = useGameStore();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [combatLog, setCombatLog] = useState<ActionResult[]>([]);
  const [narration, setNarration] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isPlayerTurn =
    combatState &&
    combatState.initiativeOrder[combatState.turnIndex]?.entityType === 'player';

  const handleAction = useCallback(
    async (actionType: CombatActionType) => {
      if (!combatState || isProcessing) return;

      // Require target for attacks
      if (actionType === 'attack' && !selectedTargetId) {
        setError('Select a target first!');
        setTimeout(() => setError(''), 2000);
        return;
      }

      setIsProcessing(true);
      setError('');

      try {
        const res = await fetch('/api/combat/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            combatState,
            action: actionType,
            targetId: selectedTargetId,
            character,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Combat action failed');
        }

        const data = await res.json();

        // Update combat state
        setCombatState(data.combatState);

        // Apply player damage — update character HP in the store
        if (data.updatedPlayerHP) {
          updateActiveCharacter({
            hitPoints: {
              ...character.hitPoints,
              current: data.updatedPlayerHP.current,
            },
          });
        }

        // Append action results to log
        if (data.results && Array.isArray(data.results)) {
          setCombatLog((prev) => [...prev, ...data.results]);
        }

        // Update narration
        if (data.narration) {
          setNarration(data.narration);
        }

        // Clear target selection after action
        setSelectedTargetId(null);
        // Note: onCombatEnd is called from the "Continue Adventure" button — not here
        // to avoid double-firing the combat summary message
      } catch (err) {
        console.error('Combat action error:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsProcessing(false);
      }
    },
    [combatState, selectedTargetId, character, isProcessing, setCombatState, onCombatEnd]
  );

  if (!combatState) return null;

  const isCombatOver = combatState.phase === 'combat-end';

  return (
    <div className="flex flex-col h-full bg-slate-950/40">
      {/* Combat header bar */}
      <CombatHeader combatState={combatState} />

      {/* Main combat area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Combat log */}
        <div className="flex-1 flex flex-col p-3 gap-2 min-w-0">
          <div className="flex-1 overflow-hidden">
            <CombatLog entries={combatLog} narration={narration} />
          </div>

          {/* Player conditions */}
          <ConditionTracker conditions={character.conditions} label="Your status" />

          {/* Mobile-only: initiative + target selector (hidden on sm+ where sidebar shows) */}
          <div className="sm:hidden space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {combatState.initiativeOrder.map((entry, i) => {
                const isActive = i === combatState.turnIndex;
                const enemy = combatState.enemies.find((e) => e.id === entry.entityId);
                const isDead = enemy && !enemy.isAlive;
                return (
                  <div
                    key={entry.entityId}
                    className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-medium border ${
                      isActive
                        ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                        : isDead
                          ? 'border-slate-700/50 bg-slate-800/50 text-slate-600 line-through'
                          : 'border-slate-700/50 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    {entry.entityType === 'player' ? '⚔️' : isDead ? '💀' : '👹'}{' '}
                    {entry.entityName.split(' ')[0]}
                    {enemy && enemy.isAlive && (
                      <span className="ml-1 text-red-400">
                        {Math.round((enemy.hp.current / enemy.hp.max) * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {isPlayerTurn && !isCombatOver && (
              <div className="flex flex-wrap gap-1.5">
                {combatState.enemies
                  .filter((e) => e.isAlive)
                  .map((enemy) => (
                    <button
                      key={enemy.id}
                      onClick={() => setSelectedTargetId(enemy.id)}
                      className={`px-2.5 py-1.5 rounded text-xs border transition ${
                        selectedTargetId === enemy.id
                          ? 'border-red-500/50 bg-red-500/20 text-red-300'
                          : 'border-slate-700/50 bg-slate-800/50 text-slate-400 hover:border-red-500/30'
                      }`}
                    >
                      🎯 {enemy.name} ({enemy.hp.current}/{enemy.hp.max})
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
              {error}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="text-xs text-sky-400 flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
              Resolving actions...
            </div>
          )}

          {/* Combat ended summary */}
          {isCombatOver && combatState.rewards && (
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4">
              <h3 className="text-sm font-bold text-amber-300 mb-2">
                {combatState.result === 'victory' && '🏆 Victory!'}
                {combatState.result === 'defeat' && '💀 Defeat'}
                {combatState.result === 'fled' && '🏃 Escaped!'}
                {combatState.result === 'negotiated' && '🤝 Resolved'}
              </h3>
              <div className="flex flex-wrap gap-3 text-xs">
                {combatState.rewards.xpEarned > 0 && (
                  <span className="text-purple-300">
                    ✨ {combatState.rewards.xpEarned} XP
                  </span>
                )}
                {combatState.rewards.goldFound > 0 && (
                  <span className="text-amber-300">
                    💰 {combatState.rewards.goldFound} gold
                  </span>
                )}
                {combatState.rewards.itemIds.length > 0 && (
                  <span className="text-sky-300">
                    📦 {combatState.rewards.itemIds.length} items
                  </span>
                )}
              </div>
              {combatState.rewards.narrativeOutcome && (
                <p className="text-slate-400 text-xs mt-2 italic">
                  {combatState.rewards.narrativeOutcome}
                </p>
              )}
              <button
                onClick={() => {
                  setCombatState(null);
                  onCombatEnd?.(combatState);
                }}
                className="mt-3 px-4 py-1.5 bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded text-xs hover:bg-sky-500/30 transition"
              >
                Continue Adventure →
              </button>
            </div>
          )}

          {/* Action buttons (only when it's player's turn and combat not over) */}
          {isPlayerTurn && !isCombatOver && (
            <CombatActions
              actions={combatState.availableActions}
              onAction={handleAction}
              disabled={isProcessing}
            />
          )}

          {/* Waiting for enemy turn */}
          {!isPlayerTurn && !isCombatOver && !isProcessing && (
            <div className="text-xs text-slate-500 italic text-center py-2">
              Enemy turn in progress...
            </div>
          )}
        </div>

        {/* Right sidebar: Initiative + Targets */}
        <div className="w-52 lg:w-60 border-l border-slate-800/50 p-3 space-y-3 overflow-y-auto hidden sm:block">
          <InitiativeTracker
            order={combatState.initiativeOrder}
            currentIndex={combatState.turnIndex}
            enemies={combatState.enemies}
          />

          {isPlayerTurn && !isCombatOver && (
            <TargetSelector
              enemies={combatState.enemies}
              selectedTargetId={selectedTargetId}
              onSelectTarget={setSelectedTargetId}
            />
          )}

          {/* Environment info */}
          {(combatState.terrainEffects.length > 0 ||
            combatState.environmentalHazards.length > 0) && (
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3">
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                Environment
              </h4>
              {combatState.terrainEffects.map((t, i) => (
                <div key={i} className="text-[11px] text-slate-400">
                  🌍 {t}
                </div>
              ))}
              {combatState.environmentalHazards.map((h, i) => (
                <div key={i} className="text-[11px] text-amber-400/70">
                  ⚠️ {h}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
