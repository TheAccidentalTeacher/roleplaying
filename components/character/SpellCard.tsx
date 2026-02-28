'use client';

import type { Spell } from '@/lib/types/character';
import { useState } from 'react';

interface SpellCardProps {
  spell: Spell;
  onCast?: () => void;
  disabled?: boolean;
}

function getSchoolIcon(school: string): string {
  const icons: Record<string, string> = {
    evocation: '🔥',
    abjuration: '🛡️',
    conjuration: '✨',
    divination: '👁️',
    enchantment: '💫',
    illusion: '🌀',
    necromancy: '💀',
    transmutation: '🔄',
  };
  return icons[school.toLowerCase()] || '✨';
}

function getLevelLabel(level: number): string {
  if (level === 0) return 'Cantrip';
  return `Level ${level}`;
}

export default function SpellCard({ spell, onCast, disabled = false }: SpellCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border transition-all ${
        spell.isPrepared
          ? 'bg-slate-900 border-primary-700/50'
          : 'bg-slate-950 border-slate-800 opacity-70'
      }`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 flex items-center gap-2"
      >
        <span className="text-base">{getSchoolIcon(spell.school)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{spell.name}</span>
            {spell.isRitual && (
              <span className="text-[10px] px-1 py-0.5 bg-purple-900/40 text-purple-300 rounded">R</span>
            )}
            {spell.level === 0 && (
              <span className="text-[10px] px-1 py-0.5 bg-slate-700 text-slate-400 rounded">∞</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            {getLevelLabel(spell.level)} • {spell.school}
          </p>
        </div>
        <span className="text-slate-600 text-xs">{expanded ? '▼' : '▶'}</span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-800 pt-2 animate-slideUp">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>
              <span className="text-slate-600">Cast Time:</span>{' '}
              <span className="text-slate-400">{spell.castingTime}</span>
            </div>
            <div>
              <span className="text-slate-600">Range:</span>{' '}
              <span className="text-slate-400">{spell.range}</span>
            </div>
            <div>
              <span className="text-slate-600">Duration:</span>{' '}
              <span className="text-slate-400">{spell.duration}</span>
            </div>
            <div>
              <span className="text-slate-600">Components:</span>{' '}
              <span className="text-slate-400">{spell.components}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">{spell.description}</p>

          {spell.damage && (
            <p className="text-xs text-red-400">Damage: {spell.damage}</p>
          )}
          {spell.savingThrow && (
            <p className="text-xs text-amber-400">
              Save: {spell.savingThrow.toUpperCase()}
            </p>
          )}

          {onCast && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCast();
              }}
              disabled={disabled || !spell.isPrepared}
              className={`w-full mt-1 py-1.5 rounded text-xs font-medium transition-colors ${
                disabled || !spell.isPrepared
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {spell.level === 0 ? 'Cast Cantrip' : 'Cast Spell'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
