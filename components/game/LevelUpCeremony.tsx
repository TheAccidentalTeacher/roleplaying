'use client';

import React from 'react';
import type { LevelUpGains } from '@/lib/engines/level-engine';
import type { Character } from '@/lib/types/character';

interface LevelUpCeremonyProps {
  character: Character;
  gains: LevelUpGains;
  onAccept: () => void;
}

export default function LevelUpCeremony({ character, gains, onAccept }: LevelUpCeremonyProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-500" role="dialog" aria-modal="true" aria-label="Level Up">
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-yellow-900/90 to-slate-900/95 border-2 border-yellow-500/60 rounded-2xl shadow-2xl shadow-yellow-500/20 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-500/5 to-yellow-400/10 pointer-events-none" />

        {/* Header */}
        <div className="relative text-center pt-8 pb-4 px-6">
          <div className="text-yellow-400/80 text-sm font-semibold uppercase tracking-widest mb-1">
            Level Up!
          </div>
          <h2 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">
            {character.name}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-3 text-lg">
            <span className="text-slate-400">Level {character.level}</span>
            <span className="text-yellow-400 text-2xl">→</span>
            <span className="text-yellow-300 font-bold text-xl">Level {gains.newLevel}</span>
          </div>
          <div className="mt-1 text-sm text-slate-400 capitalize">
            {character.subclass ? `${character.subclass} ` : ''}{character.class}
          </div>
        </div>

        {/* Gains List */}
        <div className="relative px-6 pb-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {/* HP Gain */}
          <GainRow
            icon="❤️"
            label="Hit Points"
            value={`+${gains.hpGain} HP (${character.hitPoints.max} → ${character.hitPoints.max + gains.hpGain})`}
          />

          {/* Proficiency Bonus */}
          {gains.proficiencyBonusChanged && (
            <GainRow
              icon="🎯"
              label="Proficiency Bonus"
              value={`+${character.proficiencyBonus} → +${gains.proficiencyBonus}`}
              highlight
            />
          )}

          {/* New Features */}
          {gains.newFeatures.map((feature, i) => (
            <GainRow
              key={i}
              icon="⭐"
              label={feature.name}
              value={feature.description}
              highlight={feature.name === 'Extra Attack' || feature.name === 'Ability Score Improvement'}
            />
          ))}

          {/* New Spell Slots */}
          {gains.newSpellSlots && gains.newSpellSlots.length > 0 && (
            <GainRow
              icon="✨"
              label="Spell Slots"
              value={gains.newSpellSlots.map(s => `Level ${s.level}: ${s.slots} slot${s.slots > 1 ? 's' : ''}`).join(', ')}
            />
          )}

          {/* Hit Dice */}
          <GainRow
            icon="🎲"
            label="Hit Dice"
            value={`${gains.newLevel}d${character.hitPoints.hitDice?.dieType ?? 8}`}
          />
        </div>

        {/* Accept Button */}
        <div className="relative px-6 pb-6 pt-2">
          <button
            onClick={onAccept}
            className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black transition-all duration-200 shadow-lg hover:shadow-yellow-500/30 active:scale-[0.98]"
          >
            Accept Level {gains.newLevel}
          </button>
        </div>
      </div>
    </div>
  );
}

function GainRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-800/50'}`}>
      <span className="text-xl mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${highlight ? 'text-yellow-300' : 'text-slate-200'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">{value}</div>
      </div>
    </div>
  );
}
