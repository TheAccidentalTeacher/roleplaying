'use client';

import { useState, useCallback, useRef } from 'react';
import DiceBoxCanvas, { DiceBoxHandle, DiceResult } from '@/components/shared/DiceBoxCanvas';
import { X } from 'lucide-react';

/* ============================================================
   DiceTray — Free-roll dice playground
   Roll any combination of d4, d6, d8, d10, d12, d20, d100
   ============================================================ */

type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface DieConfig {
  type: DieType;
  sides: number;
  label: string;
  color: string;
  bgColor: string;
}

const DICE_TYPES: DieConfig[] = [
  { type: 'd4',   sides: 4,   label: 'd4',   color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20' },
  { type: 'd6',   sides: 6,   label: 'd6',   color: 'text-sky-400',     bgColor: 'bg-sky-500/10 border-sky-500/40 hover:bg-sky-500/20' },
  { type: 'd8',   sides: 8,   label: 'd8',   color: 'text-violet-400',  bgColor: 'bg-violet-500/10 border-violet-500/40 hover:bg-violet-500/20' },
  { type: 'd10',  sides: 10,  label: 'd10',  color: 'text-orange-400',  bgColor: 'bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/20' },
  { type: 'd12',  sides: 12,  label: 'd12',  color: 'text-pink-400',    bgColor: 'bg-pink-500/10 border-pink-500/40 hover:bg-pink-500/20' },
  { type: 'd20',  sides: 20,  label: 'd20',  color: 'text-amber-400',   bgColor: 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20' },
  { type: 'd100', sides: 100, label: 'd100', color: 'text-red-400',     bgColor: 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20' },
];

interface RollEntry {
  id: number;
  dice: { type: DieType; sides: number; value: number }[];
  total: number;
  label: string;
  timestamp: number;
}

interface DiceTrayProps {
  onClose: () => void;
}

const SIDES_TO_TYPE: Record<number, DieType> = { 4:'d4', 6:'d6', 8:'d8', 10:'d10', 12:'d12', 20:'d20', 100:'d100' };

export default function DiceTray({ onClose }: DiceTrayProps) {
  const [selectedDice, setSelectedDice] = useState<{ type: DieType; sides: number }[]>([]);
  const [rolling, setRolling] = useState(false);
  const [boxReady, setBoxReady] = useState(false);
  const [currentRoll, setCurrentRoll] = useState<{ type: DieType; sides: number; value: number }[] | null>(null);
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([]);
  const nextIdRef = useRef(1);
  const pendingRollsRef = useRef<{ type: DieType; sides: number; value: number }[] | null>(null);
  const diceBoxRef = useRef<DiceBoxHandle>(null);

  // Add a die to the tray
  const addDie = (config: DieConfig) => {
    if (rolling) return;
    if (selectedDice.length >= 10) return; // Max 10 dice
    setSelectedDice((prev) => [...prev, { type: config.type, sides: config.sides }]);
  };

  // Remove last die of a given type
  const removeDie = (index: number) => {
    if (rolling) return;
    setSelectedDice((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all selected dice
  const clearDice = () => {
    if (rolling) return;
    setSelectedDice([]);
    setCurrentRoll(null);
  };

  // Quick-roll: single die of this type
  const quickRoll = useCallback((config: DieConfig) => {
    if (rolling || !boxReady || !diceBoxRef.current) return;
    setSelectedDice([{ type: config.type, sides: config.sides }]);
    setCurrentRoll(null);
    pendingRollsRef.current = null;
    setRolling(true);
    diceBoxRef.current.clear();
    diceBoxRef.current.roll(`1${config.type}`);
  }, [rolling, boxReady]);

  // Called when dice-box finishes settling — use the ACTUAL values from the physics engine
  const handleDiceResult = useCallback((libraryResults: DiceResult[]) => {
    if (!libraryResults || libraryResults.length === 0) return;
    pendingRollsRef.current = null;

    const results = libraryResults.map((r) => ({
      type: (SIDES_TO_TYPE[r.sides] ?? `d${r.sides}`) as DieType,
      sides: r.sides,
      value: r.value,
    }));

    const total = results.reduce((sum, d) => sum + d.value, 0);
    setCurrentRoll(results);

    const grouped: Record<string, number[]> = {};
    results.forEach((d) => {
      if (!grouped[d.type]) grouped[d.type] = [];
      grouped[d.type].push(d.value);
    });
    const parts = Object.entries(grouped).map(([type, vals]) => `${vals.length}${type}`);
    const valStr = results.map((d) => d.value).join(' + ');

    const entry: RollEntry = {
      id: nextIdRef.current++,
      dice: results,
      total,
      label: `${parts.join(' + ')}: ${valStr} = ${total}`,
      timestamp: Date.now(),
    };
    setRollHistory((prev) => [entry, ...prev].slice(0, 20));
    setRolling(false);
  }, []);

  // Roll all selected dice
  const rollAll = useCallback(() => {
    if (rolling || selectedDice.length === 0 || !boxReady || !diceBoxRef.current) return;

    setCurrentRoll(null);
    pendingRollsRef.current = null;
    setRolling(true);

    // Build dice-box notation as array so mixed types work e.g. ['2d6', '1d8']
    const grouped: Record<string, number> = {};
    selectedDice.forEach((d) => { grouped[d.type] = (grouped[d.type] || 0) + 1; });
    const notationArray = Object.entries(grouped).map(([type, count]) => `${count}${type}`);

    diceBoxRef.current.clear();
    diceBoxRef.current.roll(notationArray);
  }, [rolling, selectedDice, boxReady]);

  // Build summary label for selected dice
  const selectionLabel = (() => {
    if (selectedDice.length === 0) return 'Tap a die to add it';
    const grouped: Record<string, number> = {};
    selectedDice.forEach((d) => {
      grouped[d.type] = (grouped[d.type] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([type, count]) => `${count}${type}`)
      .join(' + ');
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl w-[480px] max-w-[95vw] max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="font-cinzel text-amber-400 text-xl tracking-wide">🎲 Dice Tray</h2>
          <button
            onClick={() => { diceBoxRef.current?.clear(); onClose(); }}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Die type picker */}
        <div className="px-6 pb-3">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">
            Tap to add · Double-tap to quick roll
          </p>
          <div className="flex flex-wrap gap-2">
            {DICE_TYPES.map((config) => (
              <button
                key={config.type}
                onClick={() => addDie(config)}
                onDoubleClick={() => quickRoll(config)}
                disabled={rolling}
                className={`px-3 py-2 rounded-lg border text-sm font-bold transition-all ${config.bgColor} ${config.color} disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected dice chips */}
        <div className="px-6 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 font-mono">{selectionLabel}</span>
            {selectedDice.length > 0 && (
              <button
                onClick={clearDice}
                disabled={rolling}
                className="text-[10px] text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
              >
                Clear
              </button>
            )}
          </div>
          {selectedDice.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedDice.map((d, i) => {
                const config = DICE_TYPES.find((c) => c.type === d.type)!;
                return (
                  <button
                    key={i}
                    onClick={() => removeDie(i)}
                    className={`px-2 py-1 rounded-md border text-xs font-bold ${config.bgColor} ${config.color} transition-all hover:opacity-70`}
                    title="Click to remove"
                  >
                    {d.type} ✕
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3D Dice Canvas (mounts on document.body full-screen) ── */}
        <div className="px-6 py-2 flex-1">
          <DiceBoxCanvas
            ref={diceBoxRef}
            onResult={handleDiceResult}
            onReady={() => setBoxReady(true)}
            scale={25}
          />

          {/* Placeholder area */}
          <div className="flex items-center justify-center h-24 rounded-xl bg-slate-900/40 border border-slate-800">
            {!boxReady && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-xs text-slate-600">Loading dice…</span>
              </div>
            )}
            {boxReady && rolling && (
              <p className="text-slate-500 text-sm animate-pulse">🎲 Rolling…</p>
            )}
            {boxReady && !rolling && !currentRoll && (
              <p className="text-slate-700 text-sm italic">
                {selectedDice.length === 0 ? 'Add some dice and roll!' : 'Ready — hit the button!'}
              </p>
            )}
            {currentRoll && !rolling && (
              <div className="text-center animate-fadeIn">
                <div className="text-3xl font-bold font-cinzel">
                  {currentRoll.length > 1 && <span className="text-slate-500 text-lg mr-2">Total:</span>}
                  <span className="text-amber-300">{currentRoll.reduce((s, d) => s + d.value, 0)}</span>
                </div>
                {currentRoll.length > 1 && (
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    {currentRoll.map((d) => `${d.type}:${d.value}`).join(' + ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Roll button */}
        <div className="px-6 pb-3">
          <button
            onClick={rollAll}
            disabled={rolling || selectedDice.length === 0 || !boxReady}
            className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition-all duration-200 ${
              rolling || selectedDice.length === 0 || !boxReady
                ? 'bg-slate-700 cursor-not-allowed text-slate-500'
                : 'bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 shadow-lg shadow-amber-900/40 active:scale-[0.98]'
            }`}
          >
            {rolling ? '🎲 Rolling…' : !boxReady ? 'Loading…' : `🎲 Roll ${selectionLabel}`}
          </button>
        </div>

        {/* Roll history */}
        {rollHistory.length > 0 && (
          <div className="border-t border-slate-800 px-6 py-3 max-h-[140px] overflow-y-auto">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 font-semibold">History</p>
            <div className="space-y-1">
              {rollHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-400 font-mono truncate flex-1 mr-2">{entry.label}</span>
                  <span className="text-amber-400 font-bold text-sm tabular-nums">{entry.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
