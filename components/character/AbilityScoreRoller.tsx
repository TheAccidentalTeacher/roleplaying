'use client';

import { useState, useCallback } from 'react';
import type { AbilityScoreMethod } from '@/lib/types/character';
import { rollAbilityScore } from '@/lib/utils/dice';
import { formatModifier } from '@/lib/utils/formatters';

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_MAX = 27;
const ABILITY_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

interface AbilityScoreRollerProps {
  scores: AbilityScores;
  onScoresChange: (scores: AbilityScores) => void;
  method: AbilityScoreMethod;
  onMethodChange: (method: AbilityScoreMethod) => void;
}

export default function AbilityScoreRoller({
  scores,
  onScoresChange,
  method,
  onMethodChange,
}: AbilityScoreRollerProps) {
  const [rolledSets, setRolledSets] = useState<number[][]>([]);
  const [standardArrayAssigned, setStandardArrayAssigned] = useState<(number | null)[]>(
    Array(6).fill(null)
  );
  const [availableStandard, setAvailableStandard] = useState<number[]>([...STANDARD_ARRAY]);

  // Calculate modifier for display
  const getMod = (score: number) => Math.floor((score - 10) / 2);

  // Point buy: total points spent
  const pointsSpent = ABILITY_KEYS.reduce(
    (total, key) => total + (POINT_BUY_COSTS[scores[key]] ?? 0),
    0
  );

  // Roll 4d6 drop lowest for all 6 stats
  const handleRollAll = useCallback(() => {
    const newScores = ABILITY_KEYS.reduce((acc, key) => {
      acc[key] = rollAbilityScore();
      return acc;
    }, {} as AbilityScores);
    onScoresChange(newScores);
    setRolledSets((prev) => [...prev.slice(-4), Object.values(newScores)]);
  }, [onScoresChange]);

  // Point buy: increment/decrement
  const handlePointBuy = (key: keyof AbilityScores, delta: number) => {
    const newVal = scores[key] + delta;
    if (newVal < 8 || newVal > 15) return;
    const newScores = { ...scores, [key]: newVal };
    const newCost = ABILITY_KEYS.reduce(
      (total, k) => total + (POINT_BUY_COSTS[newScores[k]] ?? 0),
      0
    );
    if (newCost > POINT_BUY_MAX) return;
    onScoresChange(newScores);
  };

  // Standard array: assign a value to a slot
  const handleStandardAssign = (abilityIndex: number, value: number) => {
    const newAssigned = [...standardArrayAssigned];
    // Unassign the previous value at this slot
    if (newAssigned[abilityIndex] !== null) {
      setAvailableStandard((prev) => [...prev, newAssigned[abilityIndex]!].sort((a, b) => b - a));
    }
    newAssigned[abilityIndex] = value;
    setStandardArrayAssigned(newAssigned);
    setAvailableStandard((prev) => prev.filter((v) => v !== value));

    // Update scores
    const newScores = { ...scores };
    ABILITY_KEYS.forEach((key, i) => {
      newScores[key] = newAssigned[i] ?? 8;
    });
    onScoresChange(newScores);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Ability Scores</h2>
        <p className="text-slate-400 text-sm">These six stats define your character{"'"}s core capabilities.</p>
      </div>

      {/* Method Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {[
          { value: 'roll' as const, label: '🎲 Roll 4d6', desc: 'Roll dice, random stats' },
          { value: 'point-buy' as const, label: '💰 Point Buy', desc: '27 points to distribute' },
          { value: 'standard-array' as const, label: '📊 Standard Array', desc: 'Fixed set: 15,14,13,12,10,8' },
        ].map((m) => (
          <button
            key={m.value}
            onClick={() => {
              onMethodChange(m.value);
              if (m.value === 'point-buy') {
                onScoresChange({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
              } else if (m.value === 'standard-array') {
                setStandardArrayAssigned(Array(6).fill(null));
                setAvailableStandard([...STANDARD_ARRAY]);
                onScoresChange({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
              }
            }}
            className={`px-4 py-2 rounded-lg border text-sm transition-all ${
              method === m.value
                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-sky-500/50'
            }`}
          >
            <div className="font-semibold">{m.label}</div>
            <div className="text-xs text-slate-500">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Roll Method */}
      {method === 'roll' && (
        <div className="text-center mb-4">
          <button
            onClick={handleRollAll}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors"
          >
            🎲 Roll All Stats (4d6 drop lowest)
          </button>
          {rolledSets.length > 0 && (
            <p className="text-slate-500 text-xs mt-2">
              Rolled {rolledSets.length} time{rolledSets.length > 1 ? 's' : ''} — click again to reroll
            </p>
          )}
        </div>
      )}

      {/* Point Buy Budget */}
      {method === 'point-buy' && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
            <span className="text-slate-400 text-sm">Points remaining:</span>
            <span
              className={`font-mono font-bold text-lg ${
                POINT_BUY_MAX - pointsSpent > 0 ? 'text-sky-400' : 'text-amber-400'
              }`}
            >
              {POINT_BUY_MAX - pointsSpent}
            </span>
            <span className="text-slate-600 text-sm">/ {POINT_BUY_MAX}</span>
          </div>
        </div>
      )}

      {/* Standard Array Available Values */}
      {method === 'standard-array' && availableStandard.length > 0 && (
        <div className="text-center mb-4">
          <span className="text-slate-400 text-sm mr-2">Available:</span>
          {availableStandard.map((val, i) => (
            <span key={i} className="inline-block bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded mx-1 text-sm font-mono">
              {val}
            </span>
          ))}
        </div>
      )}

      {/* Ability Score Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {ABILITY_KEYS.map((key, index) => (
          <div
            key={key}
            className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-center"
          >
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
              {ABILITY_NAMES[index]}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{scores[key]}</div>
            <div
              className={`text-sm font-mono mb-3 ${
                getMod(scores[key]) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {formatModifier(getMod(scores[key]))}
            </div>

            {method === 'point-buy' && (
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => handlePointBuy(key, -1)}
                  disabled={scores[key] <= 8}
                  className="w-8 h-8 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <button
                  onClick={() => handlePointBuy(key, 1)}
                  disabled={scores[key] >= 15}
                  className="w-8 h-8 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            )}

            {method === 'standard-array' && (
              <div className="flex flex-wrap justify-center gap-1">
                {availableStandard.map((val) => (
                  <button
                    key={val}
                    onClick={() => handleStandardAssign(index, val)}
                    className="w-8 h-6 rounded bg-sky-500/20 text-sky-400 text-xs hover:bg-sky-500/40 transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
