'use client';

import { useState, useCallback } from 'react';
import type { AbilityScoreMethod } from '@/lib/types/character';
import { rollMultiple } from '@/lib/utils/dice';
import { formatModifier } from '@/lib/utils/formatters';
import AnimatedDie from '@/components/shared/AnimatedDie';

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_MAX = 27;
const ABILITY_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

/** One set of 4d6-drop-lowest */
interface RollSet {
  dice: number[];    // all 4 dice
  dropped: number;   // the lowest die value
  total: number;     // sum of top 3
}

function rollOneSet(): RollSet {
  const dice = rollMultiple(4, 6).sort((a, b) => a - b);
  return {
    dice: [...dice],
    dropped: dice[0],
    total: dice[1] + dice[2] + dice[3],
  };
}

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
  /** Name of the selected class/archetype (e.g. "Warrior", "Netrunner") */
  className?: string;
  /** Raw primaryStat string from ClassDef (e.g. "STR / CON", "DEX") */
  classPrimaryStat?: string;
  /** Role string from ClassDef (e.g. "Tank / Damage", "Healer / Support") */
  classRole?: string;
  /** What the world calls its classes (e.g. "Class", "Role", "MOS") */
  classLabel?: string;
}

/**
 * Parse a primaryStat string like "STR / CON" into arrays of ability keys.
 * The first stat listed is "primary", any after "/" are "secondary".
 */
function parseStatPriority(primaryStat: string): {
  primary: string[];
  secondary: string[];
} {
  const parts = primaryStat.split(/\s*\/\s*/);
  return {
    primary: parts.slice(0, 1).map((s) => s.trim().toLowerCase()),
    secondary: parts.slice(1).map((s) => s.trim().toLowerCase()),
  };
}

/** Full names for each ability abbreviation */
const ABILITY_FULL_NAMES: Record<string, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export default function AbilityScoreRoller({
  scores,
  onScoresChange,
  method,
  onMethodChange,
  className: selectedClassName,
  classPrimaryStat,
  classRole,
  classLabel = 'Class',
}: AbilityScoreRollerProps) {
  // ── Stat priority from class ──
  const statPriority = classPrimaryStat ? parseStatPriority(classPrimaryStat) : null;

  /** Returns 'primary' | 'secondary' | null for a given ability key */
  const getStatTier = (key: string): 'primary' | 'secondary' | null => {
    if (!statPriority) return null;
    if (statPriority.primary.includes(key)) return 'primary';
    if (statPriority.secondary.includes(key)) return 'secondary';
    return null;
  };

  // ── Roll method state ──
  const [rollSets, setRollSets] = useState<RollSet[]>([]);
  const [assignments, setAssignments] = useState<(number | null)[]>(Array(6).fill(null));
  const [selectedRollIndex, setSelectedRollIndex] = useState<number | null>(null);
  const [rollCount, setRollCount] = useState(0);
  const [isRollingAnimation, setIsRollingAnimation] = useState(false);
  const [pendingRollSets, setPendingRollSets] = useState<RollSet[]>([]);
  const [diceAnimationKey, setDiceAnimationKey] = useState(0);

  // ── Standard array state ──
  const [standardArrayAssigned, setStandardArrayAssigned] = useState<(number | null)[]>(
    Array(6).fill(null)
  );
  const [availableStandard, setAvailableStandard] = useState<number[]>([...STANDARD_ARRAY]);

  const getMod = (score: number) => Math.floor((score - 10) / 2);

  // Point buy: total points spent
  const pointsSpent = ABILITY_KEYS.reduce(
    (total, key) => total + (POINT_BUY_COSTS[scores[key]] ?? 0),
    0
  );

  // Which roll pool indices are already assigned to a slot?
  const assignedIndices = new Set(assignments.filter((a) => a !== null) as number[]);

  // Sync assignments → scores
  const syncScores = useCallback(
    (newAssignments: (number | null)[], sets: RollSet[]) => {
      const newScores = { ...scores };
      ABILITY_KEYS.forEach((key, i) => {
        const idx = newAssignments[i];
        newScores[key] = idx !== null ? sets[idx].total : 10;
      });
      onScoresChange(newScores);
    },
    [scores, onScoresChange]
  );

  // ── Roll 7 sets ──
  const handleRoll7 = useCallback(() => {
    const sets = Array.from({ length: 7 }, () => rollOneSet());
    setPendingRollSets(sets);
    setIsRollingAnimation(true);
    setDiceAnimationKey((k) => k + 1);
    setRollSets([]);
    setAssignments(Array(6).fill(null));
    setSelectedRollIndex(null);
    setRollCount((c) => c + 1);
    onScoresChange({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });

    // Animation runs for ~1.8s, then reveal the numbers
    setTimeout(() => {
      setIsRollingAnimation(false);
      setRollSets(sets);
    }, 1800);
  }, [onScoresChange]);

  // ── Click a pool roll ──
  const handlePoolClick = (poolIdx: number) => {
    if (assignedIndices.has(poolIdx)) return; // already placed
    setSelectedRollIndex(selectedRollIndex === poolIdx ? null : poolIdx);
  };

  // ── Click an ability slot ──
  const handleSlotClick = (slotIdx: number) => {
    if (selectedRollIndex === null) {
      // No roll selected — if slot has a value, unassign it back to pool
      if (assignments[slotIdx] !== null) {
        const newAssignments = [...assignments];
        newAssignments[slotIdx] = null;
        setAssignments(newAssignments);
        syncScores(newAssignments, rollSets);
      }
      return;
    }
    // Place selected roll into this slot
    const newAssignments = [...assignments];
    // If slot already has a value, unassign the old one (swap back to pool)
    newAssignments[slotIdx] = selectedRollIndex;
    setAssignments(newAssignments);
    setSelectedRollIndex(null);
    syncScores(newAssignments, rollSets);
  };

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
    if (newAssigned[abilityIndex] !== null) {
      setAvailableStandard((prev) => [...prev, newAssigned[abilityIndex]!].sort((a, b) => b - a));
    }
    newAssigned[abilityIndex] = value;
    setStandardArrayAssigned(newAssigned);
    setAvailableStandard((prev) => prev.filter((v) => v !== value));
    const newScores = { ...scores };
    ABILITY_KEYS.forEach((key, i) => {
      newScores[key] = newAssigned[i] ?? 8;
    });
    onScoresChange(newScores);
  };

  // How many rolls are assigned?
  const assignedCount = assignments.filter((a) => a !== null).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Ability Scores</h2>
        <p className="text-slate-400 text-sm">These six stats define your character{"'"}s core capabilities.</p>
      </div>

      {/* ── Class Stat Guide ── */}
      {selectedClassName && statPriority && (
        <div className="mb-6 mx-auto max-w-2xl bg-slate-900/80 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400 font-cinzel font-semibold text-sm">{classLabel} Stat Guide</span>
            <span className="text-slate-500 text-xs">— {selectedClassName}{classRole ? ` (${classRole})` : ''}</span>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {statPriority.primary.map((key) => (
              <div key={key} className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 rounded-lg px-3 py-1.5">
                <span className="text-amber-400 text-sm">⭐</span>
                <span className="text-amber-300 font-semibold text-sm uppercase">{key}</span>
                <span className="text-amber-400/70 text-xs">{ABILITY_FULL_NAMES[key]}</span>
                <span className="text-[10px] text-amber-500/60 ml-1">PRIMARY</span>
              </div>
            ))}
            {statPriority.secondary.map((key) => (
              <div key={key} className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/30 rounded-lg px-3 py-1.5">
                <span className="text-sky-400 text-sm">◆</span>
                <span className="text-sky-300 font-semibold text-sm uppercase">{key}</span>
                <span className="text-sky-400/70 text-xs">{ABILITY_FULL_NAMES[key]}</span>
                <span className="text-[10px] text-sky-500/60 ml-1">SECONDARY</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-3 italic">
            Put your highest rolls in starred stats for best results — but it{"'"}s your character, your choice!
          </p>
        </div>
      )}

      {/* Method Selector */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {[
          { value: 'roll' as const, label: '🎲 Roll 4d6', desc: 'Roll 7 sets, assign your best 6' },
          { value: 'point-buy' as const, label: '💰 Point Buy', desc: '27 points to distribute' },
          { value: 'standard-array' as const, label: '📊 Standard Array', desc: 'Fixed set: 15,14,13,12,10,8' },
        ].map((m) => (
          <button
            key={m.value}
            onClick={() => {
              onMethodChange(m.value);
              if (m.value === 'roll') {
                setRollSets([]);
                setAssignments(Array(6).fill(null));
                setSelectedRollIndex(null);
                onScoresChange({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
              } else if (m.value === 'point-buy') {
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

      {/* ═══════════════════════════════════════════
          ROLL METHOD — 7 Sets, Assign 6
          ═══════════════════════════════════════════ */}
      {method === 'roll' && (
        <div className="space-y-6">
          {/* Roll Button */}
          <div className="text-center">
            <button
              onClick={handleRoll7}
              disabled={isRollingAnimation}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isRollingAnimation
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-sky-500 to-sky-700 hover:from-sky-400 hover:to-sky-600 text-white shadow-lg shadow-sky-900/40 active:scale-95'
              }`}
            >
              {isRollingAnimation ? '🎲 Rolling...' : '🎲 Roll 7 Sets (4d6 drop lowest)'}
            </button>
            {rollCount > 0 && !isRollingAnimation && (
              <p className="text-slate-500 text-xs mt-2">
                Rolled {rollCount} time{rollCount > 1 ? 's' : ''} — click again to reroll all
              </p>
            )}
          </div>

          {/* ── Animated dice display during rolling ── */}
          {isRollingAnimation && pendingRollSets.length > 0 && (
            <div className="py-6 animate-fadeIn">
              <div className="flex flex-wrap justify-center gap-6">
                {pendingRollSets.map((set, setIdx) => (
                  <div key={`${diceAnimationKey}-${setIdx}`} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-slate-600 uppercase tracking-wider">Set {setIdx + 1}</span>
                    <div className="flex gap-1.5">
                      {set.dice.map((dieVal, dieIdx) => (
                        <AnimatedDie
                          key={`${diceAnimationKey}-${setIdx}-${dieIdx}`}
                          type="d6"
                          value={dieVal}
                          size={44}
                          rolling={true}
                          delay={setIdx * 120 + dieIdx * 60}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-slate-500 text-xs mt-4 animate-pulse">
                Rolling the bones...
              </p>
            </div>
          )}

          {/* Roll Pool */}
          {rollSets.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-3">
                  {selectedRollIndex !== null
                    ? `Selected ${rollSets[selectedRollIndex].total} — now click an ability slot below to assign it`
                    : assignedCount < 6
                    ? 'Click a roll to select it, then click an ability slot to assign it'
                    : '✓ All slots assigned! Click a slot to unassign, or reroll.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {rollSets.map((set, i) => {
                    const isAssigned = assignedIndices.has(i);
                    const isSelected = selectedRollIndex === i;
                    const isDropped = assignedCount === 6 && !isAssigned;

                    return (
                      <button
                        key={i}
                        onClick={() => handlePoolClick(i)}
                        disabled={isAssigned}
                        className={`
                          relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 min-w-[80px]
                          ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/30 scale-105'
                              : isAssigned
                              ? 'border-green-500/30 bg-green-500/5 opacity-40 cursor-default'
                              : isDropped
                              ? 'border-red-500/30 bg-red-500/5 opacity-50'
                              : 'border-slate-600 bg-slate-800/80 hover:border-sky-500/60 hover:scale-105 cursor-pointer'
                          }
                        `}
                      >
                        {/* Individual dice — rendered as small d6 faces */}
                        <div className="flex gap-1 mb-1">
                          {set.dice.map((d, di) => {
                            const isDroppedDie = di === 0; // dice sorted asc, index 0 is lowest
                            return (
                              <div
                                key={di}
                                className={`relative ${isDroppedDie ? 'opacity-40' : ''}`}
                              >
                                <AnimatedDie
                                  type="d6"
                                  value={d}
                                  size={26}
                                  rolling={false}
                                />
                                {isDroppedDie && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-[2px] bg-red-500 rotate-[-30deg]" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Total */}
                        <span className={`text-xl font-bold ${
                          isSelected ? 'text-amber-300' : isAssigned ? 'text-green-400' : isDropped ? 'text-red-400' : 'text-white'
                        }`}>
                          {set.total}
                        </span>

                        {/* Labels */}
                        {isAssigned && (
                          <span className="text-[10px] text-green-500 mt-0.5">
                            {ABILITY_NAMES[assignments.indexOf(i)]}
                          </span>
                        )}
                        {isDropped && (
                          <span className="text-[10px] text-red-400 mt-0.5">Dropped</span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] text-amber-400 mt-0.5">Selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ability Slots for Assignment */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {ABILITY_KEYS.map((key, index) => {
                  const assignedIdx = assignments[index];
                  const hasValue = assignedIdx !== null;
                  const value = hasValue ? rollSets[assignedIdx].total : null;
                  const isTarget = selectedRollIndex !== null;
                  const tier = getStatTier(key);

                  return (
                    <button
                      key={key}
                      onClick={() => handleSlotClick(index)}
                      className={`
                        relative bg-slate-900/80 border-2 rounded-xl p-4 text-center transition-all duration-200
                        ${
                          isTarget && !hasValue
                            ? 'border-amber-500/60 bg-amber-500/5 animate-pulse cursor-pointer'
                            : isTarget && hasValue
                            ? 'border-sky-500/40 bg-sky-500/5 cursor-pointer hover:border-sky-400'
                            : hasValue
                            ? 'border-slate-600 cursor-pointer hover:border-red-500/50'
                            : 'border-slate-700/50'
                        }
                      `}
                    >
                      {/* Stat tier badge */}
                      {tier === 'primary' && (
                        <span className="absolute -top-2 -right-2 bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-amber-500/30">
                          ⭐ PRI
                        </span>
                      )}
                      {tier === 'secondary' && (
                        <span className="absolute -top-2 -right-2 bg-sky-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-sky-500/20">
                          ◆ SEC
                        </span>
                      )}
                      <div className={`text-xs uppercase tracking-wider mb-1 ${
                        tier === 'primary' ? 'text-amber-400' : tier === 'secondary' ? 'text-sky-400' : 'text-slate-500'
                      }`}>
                        {ABILITY_NAMES[index]}
                      </div>
                      {hasValue ? (
                        <>
                          <div className="text-3xl font-bold text-white mb-1">{value}</div>
                          <div
                            className={`text-sm font-mono ${
                              getMod(value!) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {formatModifier(getMod(value!))}
                          </div>
                          {!isTarget && (
                            <span className="text-[10px] text-slate-600 mt-1 block">click to remove</span>
                          )}
                          {isTarget && (
                            <span className="text-[10px] text-sky-400 mt-1 block">click to replace</span>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-3xl font-bold text-slate-700 mb-1">—</div>
                          <div className="text-sm text-slate-700">+0</div>
                          {isTarget && (
                            <span className="text-[10px] text-amber-400 mt-1 block">click to place</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          POINT BUY
          ═══════════════════════════════════════════ */}
      {method === 'point-buy' && (
        <>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ABILITY_KEYS.map((key, index) => {
              const tier = getStatTier(key);
              return (
              <div key={key} className="relative bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-center">
                {tier === 'primary' && (
                  <span className="absolute -top-2 -right-2 bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-amber-500/30">
                    ⭐ PRI
                  </span>
                )}
                {tier === 'secondary' && (
                  <span className="absolute -top-2 -right-2 bg-sky-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-sky-500/20">
                    ◆ SEC
                  </span>
                )}
                <div className={`text-xs uppercase tracking-wider mb-1 ${
                  tier === 'primary' ? 'text-amber-400' : tier === 'secondary' ? 'text-sky-400' : 'text-slate-500'
                }`}>
                  {ABILITY_NAMES[index]}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{scores[key]}</div>
                <div className={`text-sm font-mono mb-3 ${getMod(scores[key]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatModifier(getMod(scores[key]))}
                </div>
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
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════
          STANDARD ARRAY
          ═══════════════════════════════════════════ */}
      {method === 'standard-array' && (
        <>
          {availableStandard.length > 0 && (
            <div className="text-center mb-4">
              <span className="text-slate-400 text-sm mr-2">Available:</span>
              {availableStandard.map((val, i) => (
                <span key={i} className="inline-block bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded mx-1 text-sm font-mono">
                  {val}
                </span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ABILITY_KEYS.map((key, index) => {
              const tier = getStatTier(key);
              return (
              <div key={key} className="relative bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-center">
                {tier === 'primary' && (
                  <span className="absolute -top-2 -right-2 bg-amber-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-amber-500/30">
                    ⭐ PRI
                  </span>
                )}
                {tier === 'secondary' && (
                  <span className="absolute -top-2 -right-2 bg-sky-500/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-sky-500/20">
                    ◆ SEC
                  </span>
                )}
                <div className={`text-xs uppercase tracking-wider mb-1 ${
                  tier === 'primary' ? 'text-amber-400' : tier === 'secondary' ? 'text-sky-400' : 'text-slate-500'
                }`}>
                  {ABILITY_NAMES[index]}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{scores[key]}</div>
                <div className={`text-sm font-mono mb-3 ${getMod(scores[key]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatModifier(getMod(scores[key]))}
                </div>
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
              </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
