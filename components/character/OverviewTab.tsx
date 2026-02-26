'use client';

import type { Character } from '@/lib/types/character';
import { Shield, Heart, Zap, Footprints } from 'lucide-react';
import { getAbilityModifier } from '@/lib/utils/calculations';

interface OverviewTabProps {
  character: Character;
}

export default function OverviewTab({ character }: OverviewTabProps) {
  const hpPercent =
    character.hitPoints.max > 0
      ? (character.hitPoints.current / character.hitPoints.max) * 100
      : 100;
  const hpColor =
    hpPercent > 60 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500';

  const abilities: { key: string; label: string; score: number; mod: number }[] = [
    { key: 'str', label: 'STR', score: character.abilityScores.str.score, mod: character.abilityScores.str.modifier },
    { key: 'dex', label: 'DEX', score: character.abilityScores.dex.score, mod: character.abilityScores.dex.modifier },
    { key: 'con', label: 'CON', score: character.abilityScores.con.score, mod: character.abilityScores.con.modifier },
    { key: 'int', label: 'INT', score: character.abilityScores.int.score, mod: character.abilityScores.int.modifier },
    { key: 'wis', label: 'WIS', score: character.abilityScores.wis.score, mod: character.abilityScores.wis.modifier },
    { key: 'cha', label: 'CHA', score: character.abilityScores.cha.score, mod: character.abilityScores.cha.modifier },
  ];

  const formatMod = (m: number) => (m >= 0 ? `+${m}` : `${m}`);

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="text-center space-y-1">
        {character.portraitUrl ? (
          <img
            src={character.portraitUrl}
            alt={character.name}
            className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-amber-600"
          />
        ) : (
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-3xl">
            ⚔️
          </div>
        )}
        <h3 className="font-cinzel text-amber-400 text-lg font-bold">
          {character.name}
        </h3>
        <p className="text-xs text-slate-400">
          Level {character.level} {character.race} {character.class}
          {character.subclass ? ` (${character.subclass})` : ''}
        </p>
        <p className="text-[10px] text-slate-600 capitalize">
          {character.alignment.replace('-', ' ')} • {character.background}
        </p>
      </div>

      {/* HP Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400" /> Hit Points
          </span>
          <span className="text-slate-300">
            {character.hitPoints.current}
            {character.hitPoints.temporary > 0 && (
              <span className="text-cyan-400"> +{character.hitPoints.temporary}</span>
            )}
            {' / '}
            {character.hitPoints.max}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          {character.hitPoints.temporary > 0 && (
            <div
              className="h-full bg-cyan-500/50 rounded-full absolute"
              style={{
                width: `${Math.min(100, ((character.hitPoints.current + character.hitPoints.temporary) / character.hitPoints.max) * 100)}%`,
              }}
            />
          )}
          <div
            className={`h-full ${hpColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
        <div className="text-[10px] text-slate-600 text-right">
          Hit Dice: {character.hitPoints.hitDice.remaining}/{character.hitPoints.hitDice.total}d{character.hitPoints.hitDice.dieType}
        </div>
      </div>

      {/* Mana Bar */}
      {character.mana && character.mana.max > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" /> Mana
            </span>
            <span className="text-slate-300">
              {character.mana.current} / {character.mana.max}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(character.mana.current / character.mana.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Combat Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/60 rounded-lg p-2 text-center border border-slate-700/30">
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> AC
          </div>
          <div className="text-xl font-bold text-slate-200">{character.armorClass}</div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2 text-center border border-slate-700/30">
          <div className="text-[10px] text-slate-500">Initiative</div>
          <div className="text-xl font-bold text-slate-200">
            {formatMod(character.initiative)}
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2 text-center border border-slate-700/30">
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Footprints className="w-3 h-3" /> Speed
          </div>
          <div className="text-xl font-bold text-slate-200">{character.speed}ft</div>
        </div>
      </div>

      {/* Ability Scores */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Ability Scores
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {abilities.map((a) => (
            <div
              key={a.key}
              className="bg-slate-800/60 rounded-lg p-2 text-center border border-slate-700/30"
            >
              <div className="text-[10px] text-slate-500 font-bold">{a.label}</div>
              <div className="text-lg font-bold text-slate-200">{a.score}</div>
              <div className="text-xs text-sky-400">{formatMod(a.mod)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Saving Throws */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Saving Throws
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {character.savingThrows.map((st) => (
            <div
              key={st.ability}
              className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                st.proficient ? 'bg-sky-500/10 text-sky-300' : 'text-slate-500'
              }`}
            >
              <span className="uppercase">{st.ability}</span>
              <span className="font-mono">{formatMod(st.bonus)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Skills
        </h4>
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          {character.skills
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((skill) => (
              <div
                key={skill.name}
                className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                  skill.proficient
                    ? skill.expertise
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-sky-500/10 text-sky-300'
                    : 'text-slate-500'
                }`}
              >
                <span className="capitalize">
                  {skill.expertise && '★ '}
                  {skill.proficient && !skill.expertise && '● '}
                  {skill.name.replace('-', ' ')}
                </span>
                <span className="font-mono">{formatMod(skill.bonus)}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Conditions */}
      {character.conditions.length > 0 && (
        <div>
          <h4 className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">
            Active Conditions
          </h4>
          <div className="flex flex-wrap gap-1">
            {character.conditions.map((cond, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300 capitalize"
              >
                {cond.type}
                {cond.duration !== undefined && ` (${cond.duration}r)`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* XP and proficiency */}
      <div className="space-y-2 pt-2 border-t border-slate-700/30">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">XP</span>
          <span className="text-slate-300">
            {character.xp} / {character.xpToNextLevel}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{
              width: `${character.xpToNextLevel > 0 ? (character.xp / character.xpToNextLevel) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Proficiency: {formatMod(character.proficiencyBonus)}</span>
          <span>Passive Perception: {character.passivePerception}</span>
        </div>
      </div>
    </div>
  );
}
