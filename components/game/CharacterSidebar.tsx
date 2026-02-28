// ============================================================
// CHARACTER SIDEBAR — Compact character info panel for game view
// ============================================================
'use client';

import type { Character } from '@/lib/types/character';
import { Shield, Swords, BookOpen } from 'lucide-react';

interface CharacterSidebarProps {
  name: string;
  className: string;
  level: number;
  hp: { current: number; max: number };
  character: Character | null;
}

export default function CharacterSidebar({
  name,
  className,
  level,
  hp,
  character,
}: CharacterSidebarProps) {
  const hpPercent = hp.max > 0 ? (hp.current / hp.max) * 100 : 100;
  const hpColor =
    hpPercent > 60 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500';

  // Ability scores (prefer full character)
  const abilities = character
    ? [
        { key: 'STR', val: character.abilityScores.str.score },
        { key: 'DEX', val: character.abilityScores.dex.score },
        { key: 'CON', val: character.abilityScores.con.score },
        { key: 'INT', val: character.abilityScores.int.score },
        { key: 'WIS', val: character.abilityScores.wis.score },
        { key: 'CHA', val: character.abilityScores.cha.score },
      ]
    : [];

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Identity */}
      <div className="text-center space-y-1">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl">
          ⚔️
        </div>
        <h3 className="font-cinzel text-amber-400 text-lg font-bold">{name}</h3>
        <p className="text-xs text-slate-400">
          Level {level} {className}
        </p>
      </div>

      {/* HP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> HP
          </span>
          <span className="text-slate-300">
            {hp.current} / {hp.max}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${hpColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      </div>

      {/* Mana Bar (if applicable) */}
      {character?.mana && character.mana.max > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">✨ Mana</span>
            <span className="text-slate-300">
              {character.mana.current} / {character.mana.max}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${(character.mana.current / character.mana.max) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Ability Scores */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <Swords className="w-3 h-3" /> Abilities
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {abilities.map((a) => (
            <div
              key={a.key}
              className="bg-slate-800/60 rounded-lg p-2 text-center border border-slate-700/30"
            >
              <div className="text-[10px] text-slate-500 font-bold">{a.key}</div>
              <div className="text-lg font-bold text-slate-200">{a.val}</div>
              <div className="text-xs text-sky-400">{getModifier(a.val)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* XP */}
      {character && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">⭐ XP</span>
            <span className="text-slate-300">{character.xp}</span>
          </div>
        </div>
      )}

      {/* Gold */}
      <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/30">
        <span className="text-xs text-slate-400">💰 Gold</span>
        <span className="text-amber-400 font-bold">
          {character?.gold ?? 0}
        </span>
      </div>

      {/* Quick Inventory */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Inventory
        </h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {(character?.inventory || []).map(
            (item, i) => (
              <div
                key={`${item}-${i}`}
                className="text-xs text-slate-400 bg-slate-800/30 rounded px-2 py-1"
              >
                • {item}
              </div>
            )
          )}
          {(character?.inventory || []).length === 0 && (
            <p className="text-xs text-slate-600 italic">Empty</p>
          )}
        </div>
      </div>
    </div>
  );
}
