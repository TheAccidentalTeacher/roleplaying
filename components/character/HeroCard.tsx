// ============================================================
// HERO CARD — Character card for Hall of Heroes landing page
// ============================================================
'use client';

import React from 'react';
import type { Character } from '@/lib/types/character';

interface HeroCardProps {
  character: Character;
  worldName: string;
  onContinue: () => void;
  onViewChronicle: () => void;
  onRetire: () => void;
  portraitUrl?: string;
}

export default function HeroCard({
  character,
  worldName,
  onContinue,
  onViewChronicle,
  onRetire,
  portraitUrl,
}: HeroCardProps) {
  const hpPct = Math.round((character.hitPoints.current / character.hitPoints.max) * 100);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-primary-600 transition-colors group">
      {/* Portrait area */}
      <div className="relative h-40 bg-slate-800 overflow-hidden">
        {portraitUrl ? (
          <img
            src={portraitUrl}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">
            ⚔️
          </div>
        )}
        {/* Level badge */}
        <div className="absolute top-2 right-2 bg-slate-950/80 border border-primary-600 rounded-full w-10 h-10 flex items-center justify-center">
          <span className="text-primary-400 font-bold text-sm">{character.level}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-cinzel text-lg text-primary-400 mb-0.5 truncate">
          {character.name}
        </h3>
        <p className="text-xs text-slate-500 mb-2">
          {character.race} {character.class} &middot; {worldName}
        </p>

        {/* HP bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-red-400">HP</span>
            <span className="text-slate-500">
              {character.hitPoints.current}/{character.hitPoints.max}
            </span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                hpPct > 50
                  ? 'bg-green-500'
                  : hpPct > 25
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-between text-xs text-slate-500 mb-3">
          <span>XP: {character.xp}</span>
          <span>💰 {character.gold}g</span>
          <span>📍 {character.currentLocation || 'Unknown'}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onContinue}
            className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
          >
            Continue
          </button>
          <button
            onClick={onViewChronicle}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            title="View Chronicle"
          >
            📜
          </button>
          <button
            onClick={onRetire}
            className="px-3 py-2 bg-slate-700 hover:bg-red-900/40 rounded text-sm transition-colors"
            title="Retire Character"
          >
            🏛️
          </button>
        </div>
      </div>
    </div>
  );
}
