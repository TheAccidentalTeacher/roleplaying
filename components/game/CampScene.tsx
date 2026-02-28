// ============================================================
// CAMP SCENE — Interactive camping sequence UI
// Shows camp setup, campfire activities, watch shifts, dawn
// ============================================================
'use client';

import React, { useState } from 'react';
import type { CampSetup, CampActivity, CampfireActivity, WatchEvent } from '@/lib/types/rest';

type CampPhase = 'setup' | 'activities' | 'watch' | 'dawn';

interface CampSceneProps {
  camp: CampSetup;
  onActivitySelect: (activity: CampActivity) => void;
  completedActivities: CampfireActivity[];
  watchEvents: WatchEvent[];
  currentPhase: CampPhase;
  onAdvancePhase: () => void;
  onCombatTriggered?: () => void;
  dreamNarration?: string;
  dawnNarration?: string;
}

const ACTIVITY_LABELS: Record<CampActivity, { label: string; icon: string; desc: string }> = {
  talk: { label: 'Talk', icon: '💬', desc: 'Converse with companions or reflect quietly.' },
  study: { label: 'Study', icon: '📖', desc: 'Study your spellbook or research lore.' },
  sharpen: { label: 'Sharpen', icon: '⚔️', desc: 'Sharpen weapons, gaining a small bonus.' },
  cook: { label: 'Cook', icon: '🍖', desc: 'Cook a meal for temporary HP.' },
  play_music: { label: 'Play Music', icon: '🎵', desc: 'Play an instrument to boost morale.' },
  journal: { label: 'Journal', icon: '📝', desc: 'Write in your journal, gaining XP.' },
  meditate: { label: 'Meditate', icon: '🧘', desc: 'Meditate to recover a spell slot.' },
  craft: { label: 'Craft', icon: '🔨', desc: 'Work on crafting projects.' },
  plan: { label: 'Plan', icon: '🗺️', desc: 'Plan your next move for tactical insight.' },
  forage: { label: 'Forage', icon: '🌿', desc: 'Search nearby for herbs or materials.' },
  train: { label: 'Train', icon: '🏋️', desc: 'Practice combat techniques.' },
  repair: { label: 'Repair', icon: '🔧', desc: 'Repair damaged equipment.' },
  pray: { label: 'Pray', icon: '🙏', desc: 'Offer prayers for divine guidance.' },
  keep_watch: { label: 'Keep Watch', icon: '👁️', desc: 'Stand early watch to let others rest.' },
};

export default function CampScene({
  camp,
  onActivitySelect,
  completedActivities,
  watchEvents,
  currentPhase,
  onAdvancePhase,
  onCombatTriggered,
  dreamNarration,
  dawnNarration,
}: CampSceneProps) {
  const [selectedActivity, setSelectedActivity] = useState<CampActivity | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Phase header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="font-cinzel text-lg text-amber-400">
          {currentPhase === 'setup' && '🏕️ Setting Up Camp'}
          {currentPhase === 'activities' && '🔥 Campfire'}
          {currentPhase === 'watch' && '🌙 Night Watch'}
          {currentPhase === 'dawn' && '🌅 Dawn'}
        </h2>
        <span className="text-xs text-slate-500">
          Safety: {camp.safetyRating}%
        </span>
      </div>

      <div className="p-4">
        {/* Setup phase */}
        {currentPhase === 'setup' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              You find a spot to camp: <span className="text-primary-400">{camp.location}</span>
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-slate-800 rounded">
                Shelter: {camp.shelterType.replace('_', ' ')}
              </span>
              {camp.campfireLit && (
                <span className="px-2 py-1 bg-orange-900/40 text-orange-400 rounded">🔥 Campfire lit</span>
              )}
              {camp.wardingSpells.length > 0 && (
                <span className="px-2 py-1 bg-purple-900/40 text-purple-400 rounded">
                  ✨ Warded ({camp.wardingSpells.length})
                </span>
              )}
            </div>
            <button
              onClick={onAdvancePhase}
              className="w-full py-2 mt-2 bg-amber-700 hover:bg-amber-600 rounded text-sm font-medium transition-colors"
            >
              Settle In
            </button>
          </div>
        )}

        {/* Activities phase */}
        {currentPhase === 'activities' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-2">
              Choose an evening activity before turning in.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {camp.availableActivities.map((act) => {
                const info = ACTIVITY_LABELS[act];
                    const done = completedActivities.some((ca) => ca.activity === act);
                return (
                  <button
                    key={act}
                    onClick={() => {
                      setSelectedActivity(act);
                      onActivitySelect(act);
                    }}
                    disabled={done}
                    className={`p-2 rounded border text-left text-xs transition-colors ${
                      done
                        ? 'border-slate-800 bg-slate-900 opacity-40 cursor-not-allowed'
                        : selectedActivity === act
                        ? 'border-primary-500 bg-primary-900/30'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base mr-1">{info.icon}</span>
                    <span className="font-medium">{info.label}</span>
                    {done && <span className="ml-1 text-green-400">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Completed activities */}
            {completedActivities.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-slate-500 font-medium">Completed:</p>
                {completedActivities.map((ca, i) => (
                  <div key={i} className="text-xs text-slate-400 bg-slate-800 rounded p-2">
                    <span className="text-primary-400">{ACTIVITY_LABELS[ca.activity]?.icon} {ACTIVITY_LABELS[ca.activity]?.label}:</span>{' '}
                    {ca.result}
                    {ca.mechanicalEffect && (
                      <span className="text-green-400 ml-2">({ca.mechanicalEffect})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onAdvancePhase}
              className="w-full py-2 mt-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            >
              Turn In for the Night
            </button>
          </div>
        )}

        {/* Watch phase */}
        {currentPhase === 'watch' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">The night passes...</p>

            {watchEvents.length > 0 ? (
              <div className="space-y-2">
                {watchEvents.map((evt, i) => (
                  <div
                    key={i}
                    className={`rounded p-3 text-sm ${
                      evt.combatTriggered
                        ? 'bg-red-900/30 border border-red-700'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <p className={evt.combatTriggered ? 'text-red-400' : 'text-slate-400'}>
                      {evt.description}
                    </p>
                    {evt.combatTriggered && onCombatTriggered && (
                      <button
                        onClick={onCombatTriggered}
                        className="mt-2 px-4 py-1 bg-red-800 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                      >
                        To Arms!
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-400">The night passes uneventfully.</p>
            )}

            {dreamNarration && (
              <div className="bg-purple-900/20 border border-purple-800 rounded p-3 text-sm text-purple-300 italic">
                💭 {dreamNarration}
              </div>
            )}

            {!watchEvents.some((e) => e.combatTriggered) && (
              <button
                onClick={onAdvancePhase}
                className="w-full py-2 mt-2 bg-amber-700 hover:bg-amber-600 rounded text-sm font-medium transition-colors"
              >
                Awaken at Dawn
              </button>
            )}
          </div>
        )}

        {/* Dawn phase */}
        {currentPhase === 'dawn' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              {dawnNarration || 'The first light of dawn creeps across the horizon. You feel refreshed.'}
            </p>
            <div className="bg-green-900/20 border border-green-800 rounded p-3 text-sm">
              <p className="text-green-400 font-medium mb-1">Rest Complete</p>
              <ul className="text-green-300 text-xs space-y-1">
                <li>• HP fully restored</li>
                <li>• Spell slots recovered</li>
                <li>• Abilities recharged</li>
              </ul>
            </div>
            <button
              onClick={onAdvancePhase}
              className="w-full py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
            >
              Continue Adventure
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
