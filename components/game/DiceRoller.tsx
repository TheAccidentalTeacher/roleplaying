'use client';

import { useState, useEffect, useCallback } from 'react';
import { roll, rollWithModifier } from '@/lib/utils/dice';
import { getAbilityModifier, getSkillBonus } from '@/lib/utils/calculations';

interface DiceCheck {
  type: 'ability' | 'skill' | 'attack' | 'saving_throw' | 'custom';
  ability?: string;
  skill?: string;
  dc?: number;
  modifier?: number;
  label?: string;
  advantage?: boolean;
  disadvantage?: boolean;
}

interface DiceRollerProps {
  check: DiceCheck;
  abilityScores?: Record<string, { score: number; modifier: number }>;
  proficiencyBonus?: number;
  proficientSkills?: string[];
  onResult: (result: DiceRollResult) => void;
  onDismiss: () => void;
}

export interface DiceRollResult {
  naturalRoll: number;
  modifier: number;
  total: number;
  dc?: number;
  success?: boolean;
  label: string;
  breakdown: string;
}

export default function DiceRoller({
  check,
  abilityScores,
  proficiencyBonus = 2,
  proficientSkills = [],
  onResult,
  onDismiss,
}: DiceRollerProps) {
  const [rolling, setRolling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [result, setResult] = useState<DiceRollResult | null>(null);

  // Calculate the modifier for this check
  const calculateModifier = (): number => {
    if (check.modifier !== undefined) return check.modifier;

    const abilityKey = check.ability?.toLowerCase().slice(0, 3);
    if (!abilityKey || !abilityScores) return 0;

    const abilityScore = abilityScores[abilityKey]?.score || 10;
    const abilityMod = getAbilityModifier(abilityScore);

    if (check.type === 'skill' && check.skill) {
      const isProficient = proficientSkills.some(
        (s) => s.toLowerCase() === check.skill?.toLowerCase()
      );
      return abilityMod + (isProficient ? proficiencyBonus : 0);
    }

    return abilityMod;
  };

  const getLabel = (): string => {
    if (check.label) return check.label;
    if (check.type === 'skill' && check.skill) {
      const abilityAbbr = check.ability?.toUpperCase().slice(0, 3) || '';
      return `${check.skill} (${abilityAbbr})`;
    }
    if (check.type === 'ability' && check.ability) {
      return `${check.ability} Check`;
    }
    if (check.type === 'saving_throw' && check.ability) {
      return `${check.ability} Save`;
    }
    if (check.type === 'attack') return 'Attack Roll';
    return 'Roll';
  };

  const mod = calculateModifier();
  const label = getLabel();
  const formatMod = mod >= 0 ? `+${mod}` : `${mod}`;

  const doRoll = useCallback(() => {
    setRolling(true);
    setResult(null);

    // Animate: flash random numbers for ~1 second
    let count = 0;
    const interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count >= 15) {
        clearInterval(interval);

        // Actual roll
        let naturalRoll: number;
        if (check.advantage) {
          const r1 = roll(20);
          const r2 = roll(20);
          naturalRoll = Math.max(r1, r2);
        } else if (check.disadvantage) {
          const r1 = roll(20);
          const r2 = roll(20);
          naturalRoll = Math.min(r1, r2);
        } else {
          naturalRoll = roll(20);
        }

        const total = naturalRoll + mod;
        const success = check.dc !== undefined ? total >= check.dc : undefined;

        const breakdown = `d20: ${naturalRoll} ${formatMod} = ${total}${
          check.dc !== undefined ? ` vs DC ${check.dc}` : ''
        }`;

        const rollResult: DiceRollResult = {
          naturalRoll,
          modifier: mod,
          total,
          dc: check.dc,
          success,
          label,
          breakdown,
        };

        setDisplayNumber(naturalRoll);
        setResult(rollResult);
        setRolling(false);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [check, mod, formatMod, label]);

  const handleCommit = () => {
    if (result) onResult(result);
  };

  const nat20 = result?.naturalRoll === 20;
  const nat1 = result?.naturalRoll === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-80 space-y-4 animate-slideUp">
        {/* Header */}
        <div className="text-center">
          <h3 className="font-cinzel text-amber-400 text-lg">{label}</h3>
          {check.dc !== undefined && (
            <p className="text-xs text-slate-500">DC {check.dc}</p>
          )}
          {(check.advantage || check.disadvantage) && (
            <p className="text-xs text-sky-400 mt-1">
              {check.advantage ? '🎯 Advantage' : '⚠️ Disadvantage'}
            </p>
          )}
        </div>

        {/* Dice display */}
        <div className="flex justify-center">
          <div
            className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-4xl font-bold transition-all duration-200 ${
              rolling
                ? 'border-sky-500 bg-sky-500/10 text-sky-300 animate-pulse'
                : result
                ? nat20
                  ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                  : nat1
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-slate-600 bg-slate-800 text-slate-200'
                : 'border-slate-600 bg-slate-800 text-slate-400'
            }`}
          >
            {displayNumber ?? '?'}
          </div>
        </div>

        {/* Modifier */}
        <div className="text-center text-sm text-slate-400">
          Modifier: <span className="text-sky-300 font-mono">{formatMod}</span>
        </div>

        {/* Result */}
        {result && (
          <div className="text-center space-y-2 animate-fadeIn">
            <div className="text-2xl font-bold">
              Total:{' '}
              <span
                className={
                  result.success === true
                    ? 'text-emerald-400'
                    : result.success === false
                    ? 'text-red-400'
                    : 'text-slate-200'
                }
              >
                {result.total}
              </span>
            </div>
            {nat20 && (
              <p className="text-amber-400 font-bold text-sm">
                ✨ NATURAL 20! Critical Success! ✨
              </p>
            )}
            {nat1 && (
              <p className="text-red-400 font-bold text-sm">
                💀 Natural 1... Critical Failure!
              </p>
            )}
            {result.success !== undefined && !nat20 && !nat1 && (
              <p
                className={`font-semibold text-sm ${
                  result.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.success ? '✅ Success!' : '❌ Failure'}
              </p>
            )}
            <p className="text-xs text-slate-500 font-mono">{result.breakdown}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!result ? (
            <>
              <button
                onClick={doRoll}
                disabled={rolling}
                className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
              >
                {rolling ? 'Rolling...' : '🎲 Roll d20'}
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors"
              >
                Skip
              </button>
            </>
          ) : (
            <button
              onClick={handleCommit}
              className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
