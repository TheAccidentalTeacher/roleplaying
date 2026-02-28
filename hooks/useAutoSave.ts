// ============================================================
// useAutoSave — Auto-save game state every 5 minutes + beforeunload
// ============================================================
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { autoSave, type SavePayload } from '@/lib/services/save-service';
import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type { CombatState } from '@/lib/types/combat';
import type { GameClock, Weather } from '@/lib/types/exploration';
import type { Quest } from '@/lib/types/quest';
import type { NPC } from '@/lib/types/npc';

interface AutoSaveInput {
  initialized: boolean;
  fullCharacter: Character | null;
  world: WorldRecord | null;
  combatState: CombatState | null;
  gameClock: GameClock;
  weather: Weather;
  activeQuests: Quest[];
  knownNPCs: NPC[];
  messages: { role: string; content: string }[];
}

export function useAutoSave({
  initialized,
  fullCharacter,
  world,
  combatState,
  gameClock,
  weather,
  activeQuests,
  knownNPCs,
  messages,
}: AutoSaveInput) {
  const lastSaveRef = useRef<number>(0);

  const buildAutoSavePayload = useCallback((): SavePayload | null => {
    if (!fullCharacter || !world) return null;
    return {
      character: fullCharacter,
      world,
      combatState,
      gameClock,
      weather,
      quests: activeQuests,
      npcs: knownNPCs,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    };
  }, [fullCharacter, world, combatState, gameClock, weather, activeQuests, knownNPCs, messages]);

  useEffect(() => {
    if (!initialized) return;

    // Auto-save timer (every 5 minutes)
    const interval = setInterval(() => {
      const payload = buildAutoSavePayload();
      if (payload && messages.length > lastSaveRef.current) {
        try {
          autoSave(payload);
          lastSaveRef.current = messages.length;
          console.log('[auto-save] Saved at', new Date().toLocaleTimeString());
        } catch (err) {
          console.warn('[auto-save] Failed:', err);
        }
      }
    }, 5 * 60 * 1000);

    // Also save on page unload
    const handleBeforeUnload = () => {
      const payload = buildAutoSavePayload();
      if (payload && messages.length > 0) {
        try {
          autoSave(payload);
        } catch {
          /* best-effort */
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initialized, buildAutoSavePayload, messages.length]);
}
