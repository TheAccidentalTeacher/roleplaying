'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { roll } from '@/lib/utils/dice';
import { getAbilityModifier } from '@/lib/utils/calculations';
import AnimatedDie from '@/components/shared/AnimatedDie';

export interface DiceCheck {
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
  const [result, setResult] = useState<DiceRollResult | null>(null);
  const [naturalRoll, setNaturalRoll] = useState(20);
  const [showParticles, setShowParticles] = useState(false);
  const rollComputedRef = useRef(false);

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
    if (check.type === 'ability' && check.ability) return `${check.ability} Check`;
    if (check.type === 'saving_throw' && check.ability) return `${check.ability} Save`;
    if (check.type === 'attack') return 'Attack Roll';
    return 'Roll';
  };

  const mod = calculateModifier();
  const label = getLabel();
  const formatMod = mod >= 0 ? `+${mod}` : `${mod}`;

  const doRoll = useCallback(() => {
    setRolling(true);
    setResult(null);
    rollComputedRef.current = false;
    setShowParticles(false);

    // Pre-compute the roll result immediately (animation will reveal it)
    let nr: number;
    if (check.advantage) {
      nr = Math.max(roll(20), roll(20));
    } else if (check.disadvantage) {
      nr = Math.min(roll(20), roll(20));
    } else {
      nr = roll(20);
    }
    setNaturalRoll(nr);
  }, [check]);

  const handleAnimationEnd = useCallback(() => {
    if (rollComputedRef.current) return;
    rollComputedRef.current = true;

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

    setResult(rollResult);
    setRolling(false);
    setShowParticles(naturalRoll === 20 || naturalRoll === 1);
  }, [naturalRoll, mod, formatMod, label, check.dc]);

  const handleCommit = () => {
    if (result) onResult(result);
  };

  const nat20 = result?.naturalRoll === 20;
  const nat1 = result?.naturalRoll === 1;

  // Determine d20 color based on result
  const dieColor = result
    ? nat20 ? 'amber' : nat1 ? 'red' : 'sky'
    : 'amber';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-8 w-[340px] space-y-5 animate-slideUp">
        {/* Header */}
        <div className="text-center">
          <h3 className="font-cinzel text-amber-400 text-xl tracking-wide">{label}</h3>
          <div className="flex items-center justify-center gap-3 mt-2">
            {check.dc !== undefined && (
              <span className="text-sm text-slate-400">
                DC <span className="text-amber-400 font-bold">{check.dc}</span>
              </span>
            )}
            <span className="text-sm text-slate-400">
              Modifier: <span className="text-sky-300 font-mono font-bold">{formatMod}</span>
            </span>
          </div>
          {(check.advantage || check.disadvantage) && (
            <p className="text-xs text-sky-400 mt-1.5 font-semibold">
              {check.advantage ? '🎯 Rolling with Advantage' : '⚠️ Rolling with Disadvantage'}
            </p>
          )}
        </div>

        {/* ── 3D Die Area ── */}
        <div className="flex justify-center py-4">
          <div className={`relative ${result ? 'animate-diceLand' : ''}`}>
            <AnimatedDie
              type="d20"
              value={naturalRoll}
              size={120}
              rolling={rolling}
              onAnimationEnd={handleAnimationEnd}
              color={dieColor}
            />

            {/* Particle burst on nat 20 / nat 1 */}
            {showParticles && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * 360;
                  const distance = 40 + Math.random() * 30;
                  const emoji = nat20 ? '✨' : '💀';
                  return (
                    <span
                      key={i}
                      className="absolute text-sm"
                      style={{
                        left: '50%',
                        top: '50%',
                        animation: `particleFloat 0.8s ease-out ${i * 0.05}s forwards`,
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                      }}
                    >
                      {emoji}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="text-center space-y-2 animate-fadeIn">
            <div className="text-3xl font-bold font-cinzel">
              <span className="text-slate-500 text-lg mr-2">Total:</span>
              <span
                className={
                  nat20
                    ? 'text-amber-300 drop-shadow-lg'
                    : nat1
                    ? 'text-red-400 drop-shadow-lg'
                    : result.success === true
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
              <p className="text-amber-400 font-bold text-sm animate-diceShake">
                ✨ NATURAL 20! Critical Success! ✨
              </p>
            )}
            {nat1 && (
              <p className="text-red-400 font-bold text-sm animate-diceShake">
                💀 Natural 1... Critical Failure!
              </p>
            )}
            {result.success !== undefined && !nat20 && !nat1 && (
              <p className={`font-semibold text-sm ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.success ? '✅ Success!' : '❌ Failure'}
              </p>
            )}
            <p className="text-xs text-slate-500 font-mono">{result.breakdown}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!result ? (
            <>
              <button
                onClick={doRoll}
                disabled={rolling}
                className={`flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                  rolling
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-b from-sky-500 to-sky-700 hover:from-sky-400 hover:to-sky-600 shadow-lg shadow-sky-900/40 active:scale-95'
                }`}
              >
                {rolling ? 'Rolling...' : '🎲 Roll d20'}
              </button>
              <button
                onClick={onDismiss}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors"
              >
                Skip
              </button>
            </>
          ) : (
            <button
              onClick={handleCommit}
              className="flex-1 px-5 py-3 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-900/40 transition-all active:scale-95"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
