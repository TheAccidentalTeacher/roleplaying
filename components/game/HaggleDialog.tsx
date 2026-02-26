// ============================================================
// HAGGLE DIALOG — Haggling mini-encounter with CHA check
// ============================================================
'use client';

import React, { useState } from 'react';
import type { Item } from '@/lib/types/items';
import { d20 } from '@/lib/utils/dice';

interface HaggleDialogProps {
  item: Item;
  originalPrice: number;
  charismaModifier: number;
  proficiencyBonus: number;
  hasPersuasion: boolean;
  onResolve: (result: {
    success: boolean;
    finalPrice: number;
    reaction: string;
  }) => void;
  onCancel: () => void;
}

export default function HaggleDialog({
  item,
  originalPrice,
  charismaModifier,
  proficiencyBonus,
  hasPersuasion,
  onResolve,
  onCancel,
}: HaggleDialogProps) {
  const [phase, setPhase] = useState<'argue' | 'rolling' | 'result'>('argue');
  const [argument, setArgument] = useState('');
  const [rollResult, setRollResult] = useState<{
    roll: number;
    total: number;
    dc: number;
    success: boolean;
    finalPrice: number;
    reaction: string;
  } | null>(null);

  const handleHaggle = () => {
    setPhase('rolling');

    // Brief delay for drama
    setTimeout(() => {
      const rollVal = d20();
      const bonus = charismaModifier + (hasPersuasion ? proficiencyBonus : 0);
      const total = rollVal + bonus;

      // DC based on argument quality (simple heuristic: longer/more detailed = lower DC)
      const baseDC = 15;
      const argBonus = argument.length > 50 ? -3 : argument.length > 20 ? -1 : 0;
      const dc = baseDC + argBonus;

      const success = total >= dc;
      const margin = total - dc;

      let finalPrice = originalPrice;
      let reaction = '';

      if (success) {
        const discount = Math.min(30, 5 + margin * 2);
        finalPrice = Math.max(
          Math.round(originalPrice * 0.7),
          Math.round(originalPrice * (1 - discount / 100))
        );
        reaction =
          margin >= 10
            ? '"Ha! You\'ve bested me! Take it at that price, you silver-tongued devil."'
            : margin >= 5
            ? '"You make a convincing case. I can work with that."'
            : '"Fine, fine. But only because you seem like good folk."';
      } else {
        if (margin <= -5) {
          finalPrice = Math.round(originalPrice * 1.1);
          reaction = '"You dare insult my wares? The price just went up!"';
        } else {
          reaction = '"I appreciate the attempt, but my price is firm."';
        }
      }

      setRollResult({ roll: rollVal, total, dc, success, finalPrice, reaction });
      setPhase('result');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="font-cinzel text-lg text-primary-400 mb-1">Haggling</h3>
        <p className="text-sm text-dark-300 mb-4">
          <span className="text-amber-400">{item.name}</span> — asking price:{' '}
          <span className="text-amber-400">{originalPrice}g</span>
        </p>

        {phase === 'argue' && (
          <>
            <p className="text-xs text-dark-400 mb-2">
              Make your case. A persuasive argument lowers the DC.
            </p>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Why should the merchant lower the price?"
              className="w-full h-20 bg-dark-700 border border-dark-600 rounded p-2 text-sm text-dark-200 resize-none focus:outline-none focus:border-primary-500"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleHaggle}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
              >
                🎲 Make Your Case
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-dark-600 hover:bg-dark-500 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {phase === 'rolling' && (
          <div className="text-center py-8">
            <div className="text-4xl animate-bounce">🎲</div>
            <p className="text-sm text-dark-300 mt-2">Rolling Persuasion...</p>
          </div>
        )}

        {phase === 'result' && rollResult && (
          <div className="space-y-3">
            {/* Roll display */}
            <div className="bg-dark-700 rounded p-3 text-center">
              <p className="text-xs text-dark-400 mb-1">Persuasion Check</p>
              <div className="flex items-center justify-center gap-2 text-lg">
                <span className={`font-bold ${rollResult.roll === 20 ? 'text-green-400' : rollResult.roll === 1 ? 'text-red-400' : 'text-white'}`}>
                  🎲 {rollResult.roll}
                </span>
                <span className="text-dark-400">+</span>
                <span className="text-primary-400">
                  {charismaModifier + (hasPersuasion ? proficiencyBonus : 0)}
                </span>
                <span className="text-dark-400">=</span>
                <span className={`font-bold ${rollResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {rollResult.total}
                </span>
                <span className="text-dark-400 text-sm">(DC {rollResult.dc})</span>
              </div>
            </div>

            {/* Result */}
            <div className={`rounded p-3 text-sm ${
              rollResult.success
                ? 'bg-green-900/20 border border-green-800'
                : 'bg-red-900/20 border border-red-800'
            }`}>
              <p className={rollResult.success ? 'text-green-400' : 'text-red-400'}>
                {rollResult.success ? '✓ Success!' : '✗ Failed'}
              </p>
              <p className="text-dark-300 mt-1 italic">{rollResult.reaction}</p>
            </div>

            {/* Price comparison */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Original: {originalPrice}g</span>
              <span className={rollResult.finalPrice < originalPrice ? 'text-green-400' : rollResult.finalPrice > originalPrice ? 'text-red-400' : 'text-dark-200'}>
                Final: {rollResult.finalPrice}g
              </span>
            </div>

            <button
              onClick={() =>
                onResolve({
                  success: rollResult.success,
                  finalPrice: rollResult.finalPrice,
                  reaction: rollResult.reaction,
                })
              }
              className="w-full py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
