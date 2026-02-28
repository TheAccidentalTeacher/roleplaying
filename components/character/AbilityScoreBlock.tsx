'use client';

import type { AbilityScore, AbilityName } from '@/lib/types/character';

interface AbilityScoreBlockProps {
  ability: AbilityName;
  score: AbilityScore;
  compact?: boolean;
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

const ABILITY_FULL: Record<AbilityName, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export default function AbilityScoreBlock({ ability, score, compact = false }: AbilityScoreBlockProps) {
  const modStr = score.modifier >= 0 ? `+${score.modifier}` : `${score.modifier}`;
  const hasBonus = score.racialBonus > 0 || score.itemBonus > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <span className="text-xs text-slate-500 w-8 font-bold">{ABILITY_LABELS[ability]}</span>
        <span className="text-sm font-bold w-6 text-center">{score.score}</span>
        <span className={`text-xs w-6 text-center ${score.modifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {modStr}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center p-2 bg-slate-900 rounded-lg border border-slate-700 w-16 hover:border-slate-600 transition-colors group"
      title={`${ABILITY_FULL[ability]}: Base ${score.base}${score.racialBonus ? ` + ${score.racialBonus} racial` : ''}${score.itemBonus ? ` + ${score.itemBonus} item` : ''}`}
    >
      {/* Label */}
      <span className="text-[10px] text-slate-500 font-bold tracking-wider">
        {ABILITY_LABELS[ability]}
      </span>

      {/* Modifier (large) */}
      <span className={`text-lg font-bold ${score.modifier >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
        {modStr}
      </span>

      {/* Score (small, below) */}
      <span className="text-xs text-slate-500 border-t border-slate-700 w-full text-center pt-0.5 mt-0.5">
        {score.score}
        {hasBonus && <span className="text-primary-400/60 text-[9px]">*</span>}
      </span>
    </div>
  );
}
