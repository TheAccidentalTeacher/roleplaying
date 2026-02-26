'use client';

import type { Character } from '@/lib/types/character';
import { useGameStore } from '@/lib/store';
import { BookOpen, Scroll, MapPin } from 'lucide-react';

interface JournalTabProps {
  character: Character;
}

export default function JournalTab({ character }: JournalTabProps) {
  const { activeQuests, currentLocation } = useGameStore();

  return (
    <div className="space-y-5">
      {/* Active Quests */}
      <div>
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> Active Quests
        </h4>
        {activeQuests.length > 0 ? (
          <div className="space-y-2">
            {activeQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-sm text-amber-400 font-semibold">
                    {quest.title}
                  </h5>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${
                      quest.status === 'active'
                        ? 'bg-sky-500/10 text-sky-300'
                        : quest.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-slate-600/10 text-slate-400'
                    }`}
                  >
                    {quest.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {quest.logline || quest.fullDescription}
                </p>
                {/* Quest acts/objectives */}
                {quest.acts && quest.acts.length > 0 && (
                  <div className="pt-1">
                    {quest.acts.map((act, ai) => (
                      <div key={ai} className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className={`w-3 h-3 rounded-full flex-shrink-0 border ${
                            ai < quest.currentAct
                              ? 'bg-emerald-500 border-emerald-500'
                              : ai === quest.currentAct
                              ? 'border-sky-400 bg-sky-500/30'
                              : 'border-slate-600'
                          }`}
                        />
                        <span
                          className={
                            ai <= quest.currentAct
                              ? 'text-slate-300'
                              : 'text-slate-600'
                          }
                        >
                          {act.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-slate-600 italic">
            No active quests. Explore the world to discover adventures!
          </div>
        )}
      </div>

      {/* Current Location */}
      <div className="pt-2 border-t border-slate-700/30">
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Location
        </h4>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2">
          <span className="text-sm text-slate-300">{currentLocation || 'Unknown'}</span>
        </div>
      </div>

      {/* Character Notes */}
      <div className="pt-2 border-t border-slate-700/30">
        <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <Scroll className="w-3 h-3" /> Character
        </h4>
        <div className="space-y-2">
          {/* Personality */}
          {character.personality && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 space-y-1.5">
              {character.personality.traits.map((trait, i) => (
                <p key={i} className="text-xs text-slate-400 italic">
                  &ldquo;{trait}&rdquo;
                </p>
              ))}
              <p className="text-[10px] text-sky-400">
                Ideal: {character.personality.ideal}
              </p>
              <p className="text-[10px] text-amber-400">
                Bond: {character.personality.bond}
              </p>
              <p className="text-[10px] text-red-400">
                Flaw: {character.personality.flaw}
              </p>
            </div>
          )}

          {/* Backstory */}
          {character.backstory && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-slate-400">{character.backstory}</p>
            </div>
          )}

          {/* Play stats */}
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>Sessions: {character.sessionCount}</span>
            <span>
              Play time: {Math.floor(character.playTimeMinutes / 60)}h{' '}
              {character.playTimeMinutes % 60}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
