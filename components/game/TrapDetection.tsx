'use client';

import { useState } from 'react';

interface TrapDetectionProps {
  trapName: string;
  trapDescription: string;
  trapDC: number;
  disarmDC: number;
  damage?: string;
  trapType: string;
  isDetected: boolean;
  isDisarmed: boolean;
  onInvestigate: () => void;
  onDisarm: () => void;
  onTrigger: () => void;
  onAvoid: () => void;
}

export default function TrapDetection({
  trapName,
  trapDescription,
  trapDC,
  disarmDC,
  damage,
  trapType,
  isDetected,
  isDisarmed,
  onInvestigate,
  onDisarm,
  onTrigger,
  onAvoid,
}: TrapDetectionProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (isDisarmed) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-400 text-lg">✓</span>
          <h3 className="font-cinzel font-bold text-green-300">{trapName}</h3>
        </div>
        <p className="text-sm text-green-400/70">Successfully disarmed!</p>
      </div>
    );
  }

  if (!isDetected) {
    return (
      <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg animate-slideUp">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-400 text-lg animate-pulse">⚠️</span>
          <h3 className="font-cinzel font-bold text-amber-300">Something Feels Wrong...</h3>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Your instincts tell you something is amiss. The area ahead seems suspicious.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onInvestigate}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded text-sm font-medium transition-colors"
          >
            🔍 Investigate (Perception DC {trapDC})
          </button>
          <button
            onClick={onAvoid}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
          >
            Proceed Carefully
          </button>
          <button
            onClick={onTrigger}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-500 transition-colors"
          >
            Ignore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg animate-slideUp">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-lg">💣</span>
          <h3 className="font-cinzel font-bold text-red-300">{trapName}</h3>
        </div>
        <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-500 capitalize">
          {trapType}
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-3">{trapDescription}</p>

      {/* Details toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-primary-400 hover:text-primary-300 mb-3 transition-colors"
      >
        {showDetails ? '▼ Hide details' : '▶ Show details'}
      </button>

      {showDetails && (
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs animate-slideUp">
          <div className="bg-slate-900 rounded p-2">
            <span className="text-slate-600">Detection DC</span>
            <p className="font-bold text-slate-400">{trapDC}</p>
          </div>
          <div className="bg-slate-900 rounded p-2">
            <span className="text-slate-600">Disarm DC</span>
            <p className="font-bold text-slate-400">{disarmDC}</p>
          </div>
          {damage && (
            <div className="bg-slate-900 rounded p-2 col-span-2">
              <span className="text-slate-600">Damage</span>
              <p className="font-bold text-red-400">{damage}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onDisarm}
          className="flex-1 px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded text-sm font-medium transition-colors"
        >
          🔧 Disarm (DC {disarmDC})
        </button>
        <button
          onClick={onAvoid}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
        >
          🚶 Go Around
        </button>
        <button
          onClick={onTrigger}
          className="px-3 py-2 bg-red-800/50 hover:bg-red-700/50 rounded text-sm text-red-300 transition-colors"
          title="Deliberately trigger the trap"
        >
          💥
        </button>
      </div>
    </div>
  );
}
