// ============================================================
// REST MENU — Rest type selection with resource preview
// ============================================================
'use client';

import React, { useState } from 'react';
import type { Character } from '@/lib/types/character';
import Button from '@/components/ui/Button';

interface RestMenuProps {
  character: Character;
  onShortRest: (hitDice: number) => void;
  onLongRest: () => void;
  onCancel: () => void;
  safeLocation: boolean;
}

export default function RestMenu({
  character,
  onShortRest,
  onLongRest,
  onCancel,
  safeLocation,
}: RestMenuProps) {
  const [hitDiceToSpend, setHitDiceToSpend] = useState(1);
  const hp = character.hitPoints;
  const hd = hp.hitDice;
  const missingHP = hp.max - hp.current;
  const avgPerDie = Math.floor(hp.hitDice.dieType / 2) + 1 + character.abilityScores.con.modifier;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="font-cinzel text-xl text-primary-400 mb-4">Rest &amp; Recovery</h2>

      <div className="mb-4 flex gap-3 text-sm">
        <span className="text-red-400">HP: {hp.current}/{hp.max}</span>
        <span className="text-amber-400">Hit Dice: {hd.remaining}/{hd.total} d{hd.dieType}</span>
      </div>

      {/* Short Rest */}
      <div className="border border-slate-700 rounded-lg p-4 mb-4">
        <h3 className="font-cinzel text-lg mb-2">Short Rest</h3>
        <p className="text-sm text-slate-400 mb-3">
          Rest for 1 hour. Spend hit dice to recover HP. Some abilities recharge.
        </p>

        {missingHP === 0 ? (
          <p className="text-sm text-green-400 mb-2">You are at full HP.</p>
        ) : hd.remaining === 0 ? (
          <p className="text-sm text-red-400 mb-2">No hit dice remaining.</p>
        ) : (
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm text-slate-400">Hit dice to spend:</label>
            <input
              type="range"
              min={1}
              max={hd.remaining}
              value={hitDiceToSpend}
              onChange={(e) => setHitDiceToSpend(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-primary-400 font-bold w-6 text-center">{hitDiceToSpend}</span>
          </div>
        )}

        {hitDiceToSpend > 0 && missingHP > 0 && (
          <p className="text-xs text-slate-500 mb-3">
            Est. recovery: ~{Math.min(missingHP, hitDiceToSpend * Math.max(1, avgPerDie))} HP
          </p>
        )}

        <Button
          onClick={() => onShortRest(hitDiceToSpend)}
          disabled={missingHP === 0 && hitDiceToSpend === 0}
          variant="primary"
          size="md"
          className="w-full"
        >
          Take Short Rest
        </Button>
      </div>

      {/* Long Rest */}
      <div className="border border-slate-700 rounded-lg p-4 mb-4">
        <h3 className="font-cinzel text-lg mb-2">Long Rest</h3>
        <p className="text-sm text-slate-400 mb-3">
          Rest for 8 hours. Recover all HP, half your hit dice, and all spell slots.
        </p>

        {!safeLocation && (
          <p className="text-xs text-amber-400 mb-2">
            ⚠ This location may not be safe. Watch encounters are more likely.
          </p>
        )}

        <div className="text-xs text-slate-500 space-y-1 mb-3">
          <p>• Full HP recovery</p>
          <p>• Recover {Math.max(1, Math.floor(hd.total / 2))} hit dice</p>
          <p>• All spell slots restored</p>
          <p>• Exhaustion reduced by 1</p>
          <p>• Expired conditions removed</p>
        </div>

        <Button
          onClick={onLongRest}
          variant="gold"
          size="md"
          className="w-full"
        >
          Set Up Camp
        </Button>
      </div>

      <Button
        onClick={onCancel}
        variant="ghost"
        size="md"
        className="w-full"
      >
        Cancel
      </Button>
    </div>
  );
}
