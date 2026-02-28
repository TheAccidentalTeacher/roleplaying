'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import SaveMenu from '@/components/game/SaveMenu';
import SettingsModal from '@/components/game/SettingsModal';
import type { SavePayload } from '@/lib/services/save-service';
import type { Character } from '@/lib/types/character';

export default function TopBar() {
  const router = useRouter();
  const {
    characters,
    activeCharacterId,
    currentLocation,
    gameClock,
    weather,
    messages,
    activeWorld,
    activeQuests,
    knownNPCs,
    combatState,
    setActiveCharacter,
    setActiveWorld,
    setMessages,
    setActiveQuests,
    setKnownNPCs,
    setCombatState,
    setGameClock,
    setWeather,
    updateLocation,
  } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Build save payload from current state
  const buildSavePayload = useCallback((): SavePayload | null => {
    const activeChar = characters.find((c) => c.id === activeCharacterId);
    if (!activeChar || !activeWorld) return null;
    return {
      character: activeChar,
      world: activeWorld,
      combatState,
      gameClock,
      weather,
      quests: activeQuests,
      npcs: knownNPCs,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    };
  }, [characters, activeCharacterId, activeWorld, combatState, gameClock, weather, activeQuests, knownNPCs, messages]);

  // Handle loading a saved game
  const handleLoad = useCallback(
    (payload: SavePayload) => {
      setActiveCharacter(payload.character);
      setActiveWorld(payload.world, payload.character.worldId);
      setCombatState(payload.combatState);
      if (payload.gameClock) setGameClock(payload.gameClock);
      if (payload.weather) setWeather(payload.weather);
      setActiveQuests(payload.quests);
      setKnownNPCs(payload.npcs);
      updateLocation(payload.character.currentLocation);
      // Restore messages
      const restoredMessages = payload.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: Date.now(),
      }));
      setMessages(restoredMessages);
      setShowSaveMenu(false);
      // Force reload to re-initialize from store
      window.location.reload();
    },
    [setActiveCharacter, setActiveWorld, setCombatState, setGameClock, setWeather, setActiveQuests, setKnownNPCs, setMessages, updateLocation]
  );

  const savePayload = buildSavePayload();

  // Get active character for HP/gold display
  const activeChar = characters.find((c) => c.id === activeCharacterId) as Character | undefined;
  const hp = activeChar?.hitPoints;
  const gold = activeChar?.gold ?? 0;
  const hpPercent = hp ? Math.round((hp.current / hp.max) * 100) : 100;
  const hpColor =
    hpPercent > 60 ? 'bg-emerald-500' : hpPercent > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex items-center justify-between relative z-30">
      {/* Left: Location */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-amber-500">📍</span>
        <span className="text-sm text-slate-300 truncate">
          {currentLocation || 'Unknown Location'}
        </span>
      </div>

      {/* Center: Time & Weather (desktop) + HP/Gold (always visible) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* HP bar — always visible */}
        {hp && (
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 text-xs">❤️</span>
            <div className="w-16 sm:w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${hpColor} rounded-full transition-all duration-300`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">
              {hp.current}/{hp.max}
            </span>
          </div>
        )}

        {/* Gold — always visible */}
        <span className="text-amber-400 text-xs tabular-nums">💰 {gold}</span>

        {/* Time & Weather — always visible, condensed on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-slate-400">
          <span className="hidden sm:inline">🕐 {formatTime()}</span>
          <span className="sm:hidden">🕐 D{gameClock?.daysSinceStart || 1}</span>
          {formatWeather() && (
            <span className="hidden sm:inline">🌤️ {capitalize(formatWeather())}</span>
          )}
        </div>
      </div>

      {/* Right: Menu */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors text-sm"
          aria-label="Game menu"
          aria-expanded={menuOpen}
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
              onClick={() => {
                setMenuOpen(false);
                if (savePayload) setShowSaveMenu(true);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${
                savePayload
                  ? 'text-slate-300 hover:bg-slate-700'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              disabled={!savePayload}
            >
              💾 Save / Load
            </button>
            <button
              onClick={() => { setMenuOpen(false); setShowSettings(true); }}
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

      {/* Save/Load Modal */}
      {showSaveMenu && savePayload && (
        <SaveMenu
          currentPayload={savePayload}
          onLoad={handleLoad}
          onClose={() => setShowSaveMenu(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
