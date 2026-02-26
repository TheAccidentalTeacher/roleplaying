'use client';

import { useState } from 'react';

interface DiceResultProps {
  roll: number;
  dieType: number;
  modifier?: number;
  label?: string;
  dc?: number;
  isNatural20?: boolean;
  isNatural1?: boolean;
  breakdown?: string; // e.g. "d20(14) + 5"
  onClose?: () => void;
}

export default function DiceResult({
  roll,
  dieType,
  modifier = 0,
  label,
  dc,
  isNatural20,
  isNatural1,
  breakdown,
  onClose,
}: DiceResultProps) {
  const [animate, setAnimate] = useState(true);
  const total = roll + modifier;
  const success = dc !== undefined ? total >= dc : undefined;

  return (
    <div
      className={`
        inline-flex flex-col items-center p-3 rounded-lg border
        ${isNatural20
          ? 'bg-amber-900/30 border-amber-500/50'
          : isNatural1
            ? 'bg-red-900/30 border-red-500/50'
            : success === true
              ? 'bg-green-900/20 border-green-500/30'
              : success === false
                ? 'bg-red-900/20 border-red-500/30'
                : 'bg-dark-800 border-dark-600'
        }
        ${animate ? 'animate-slideUp' : ''}
      `}
      onAnimationEnd={() => setAnimate(false)}
    >
      {/* Label */}
      {label && (
        <p className="text-xs text-dark-400 mb-1 font-medium">{label}</p>
      )}

      {/* Die visual */}
      <div className="relative mb-1">
        <div
          className={`
            w-12 h-12 flex items-center justify-center rounded-lg font-cinzel font-bold text-xl
            ${isNatural20
              ? 'text-amber-300 bg-amber-800/40'
              : isNatural1
                ? 'text-red-400 bg-red-800/40'
                : 'text-white bg-dark-700'
            }
          `}
        >
          {total}
        </div>
        <span className="absolute -top-1 -right-1 text-[10px] text-dark-400 bg-dark-800 px-1 rounded">
          d{dieType}
        </span>
      </div>

      {/* Breakdown */}
      {breakdown ? (
        <p className="text-xs text-dark-400">{breakdown}</p>
      ) : modifier !== 0 ? (
        <p className="text-xs text-dark-400">
          {roll} {modifier >= 0 ? '+' : ''}{modifier}
        </p>
      ) : null}

      {/* Success/Fail indicator */}
      {dc !== undefined && (
        <p
          className={`text-xs font-bold mt-1 ${
            success ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {success ? '✓ SUCCESS' : '✗ FAILURE'}{' '}
          <span className="font-normal text-dark-500">(DC {dc})</span>
        </p>
      )}

      {/* Natural 20/1 */}
      {isNatural20 && (
        <p className="text-xs text-amber-300 font-bold mt-1">⭐ NATURAL 20!</p>
      )}
      {isNatural1 && (
        <p className="text-xs text-red-400 font-bold mt-1">💀 CRITICAL FAIL!</p>
      )}

      {/* Close */}
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs text-dark-500 hover:text-dark-300 mt-2 transition-colors"
        >
          dismiss
        </button>
      )}
    </div>
  );
}
