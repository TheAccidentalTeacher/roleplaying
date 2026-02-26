'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export default function TopBar() {
  const router = useRouter();
  const { character, currentLocation, gameClock, weather } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const formatTime = () => {
    if (!gameClock) return 'Day 1';
    const tod = gameClock.timeOfDay?.replace(/_/g, ' ') || 'morning';
    return `Day ${gameClock.daysSinceStart || 1} • ${tod}`;
  };

  const formatWeather = () => {
    if (!weather) return '';
    return weather.current || 'Clear';
  };

  const capitalize = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : '';

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex items-center justify-between relative z-30">
      {/* Left: Location */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-amber-500">📍</span>
        <span className="text-sm text-slate-300 truncate">
          {currentLocation || 'Unknown Location'}
        </span>
      </div>

      {/* Center: Time & Weather */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
        <span>🕐 {formatTime()}</span>
        {formatWeather() && <span>🌤️ {capitalize(formatWeather())}</span>}
      </div>

      {/* Right: Menu */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors text-sm"
        >
          ☰
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-2 top-full mt-1 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden min-w-[180px] animate-slideDown">
            <button
              onClick={() => { setMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
            >
              💾 Save Game
            </button>
            <button
              onClick={() => { setMenuOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
            >
              ⚙️ Settings
            </button>
            <div className="border-t border-slate-700" />
            <button
              onClick={() => { setMenuOpen(false); router.push('/'); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
            >
              🚪 Exit to Menu
            </button>
          </div>
        </>
      )}
    </div>
  );
}
