// ============================================================
// TRAVEL VIEW — Travel sequence UI with progress and events
// ============================================================
'use client';

import React from 'react';
import type { TravelPlan, TravelSegment, TravelDiscovery } from '@/lib/types/exploration';

interface TravelViewProps {
  plan: TravelPlan;
  currentSegmentIndex: number;
  onContinue: () => void;
  onMakeCamp: () => void;
  onCancel: () => void;
  discoveries: TravelDiscovery[];
  encounterPending?: boolean;
  onResolveEncounter?: () => void;
}

export default function TravelView({
  plan,
  currentSegmentIndex,
  onContinue,
  onMakeCamp,
  onCancel,
  discoveries,
  encounterPending,
  onResolveEncounter,
}: TravelViewProps) {
  const progress = plan.segments.length > 0
    ? Math.min(100, (currentSegmentIndex / plan.segments.length) * 100)
    : 0;
  const currentSeg = plan.segments[currentSegmentIndex] as TravelSegment | undefined;
  const arrived = currentSegmentIndex >= plan.segments.length;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-cinzel text-lg text-primary-400">
            🧭 Traveling to {plan.to}
          </h2>
          <span className="text-xs text-slate-500">
            {plan.totalDistanceHours}h total
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${arrived ? 100 : progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{plan.from}</span>
          <span>{plan.to}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Arrived */}
        {arrived && (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">🏁</p>
            <p className="text-lg text-primary-400 font-cinzel mb-2">
              You have arrived at {plan.to}
            </p>
            <p className="text-sm text-slate-400 mb-4">
              The journey took approximately {plan.totalDistanceHours} hours.
            </p>
            <button
              onClick={onContinue}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
            >
              Explore
            </button>
          </div>
        )}

        {/* Current segment */}
        {!arrived && currentSeg && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-400">
                  Segment {currentSegmentIndex + 1} of {plan.segments.length}
                </span>
                <span className="text-xs text-slate-500">
                  {currentSeg.terrain} &middot; {currentSeg.distanceHours}h
                </span>
              </div>
              <p className="text-sm text-slate-400">{currentSeg.description}</p>
            </div>

            {/* Encounter warning */}
            {encounterPending && (
              <div className="bg-red-900/30 border border-red-700 rounded p-3">
                <p className="text-sm text-red-400 font-medium mb-2">⚠ Encounter!</p>
                <p className="text-xs text-red-300 mb-2">
                  Something blocks your path ahead...
                </p>
                {onResolveEncounter && (
                  <button
                    onClick={onResolveEncounter}
                    className="px-4 py-1 bg-red-800 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                  >
                    Investigate
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            {!encounterPending && (
              <div className="flex gap-2">
                <button
                  onClick={onContinue}
                  className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={onMakeCamp}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded text-sm font-medium transition-colors"
                >
                  🏕️ Camp
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        )}

        {/* Discoveries */}
        {discoveries.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-medium mb-2">Discoveries</p>
            <div className="space-y-2">
              {discoveries.map((d, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded p-2 text-xs">
                  <span className="text-amber-400 mr-1">
                    {d.type === 'landmark' && '🗿'}
                    {d.type === 'resource' && '💎'}
                    {d.type === 'secret' && '🛤️'}
                    {d.type === 'npc' && '👤'}
                    {d.type === 'anomaly' && '✨'}
                  </span>
                  <span className="text-slate-400">{d.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource consumption */}
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span>Food: {plan.resourcesNeeded.foodRationsNeeded}</span>
          <span>Water: {plan.resourcesNeeded.waterNeeded}</span>
          {plan.resourcesNeeded.torchesNeeded > 0 && (
            <span>Torches: {plan.resourcesNeeded.torchesNeeded}</span>
          )}
        </div>
      </div>
    </div>
  );
}
