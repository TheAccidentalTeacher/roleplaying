'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

/**
 * Reads user settings from the Zustand store and applies them
 * as CSS custom properties / classes on the document so all
 * components consume them automatically.
 */
export default function SettingsProvider() {
  const settings = useGameStore((s) => s.uiState.settings);

  useEffect(() => {
    const root = document.documentElement;

    // ── Font Size ──
    const fontSizeMap: Record<string, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--game-font-size', fontSizeMap[settings.fontSize] || '16px');

    // ── Narrative / typing speed (ms per character for streaming) ──
    const speedMap: Record<string, string> = {
      instant: '0',
      fast: '10',
      normal: '25',
      dramatic: '50',
    };
    root.style.setProperty('--narrative-speed', speedMap[settings.narrativeSpeed] || '25');

    // ── Animations ──
    if (settings.animations === 'none') {
      root.classList.add('reduce-motion');
      root.style.setProperty('--animation-duration', '0ms');
    } else if (settings.animations === 'reduced') {
      root.classList.add('reduce-motion');
      root.style.setProperty('--animation-duration', '150ms');
    } else {
      root.classList.remove('reduce-motion');
      root.style.setProperty('--animation-duration', '300ms');
    }

    // ── Compact mode ──
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // ── Dice rolls & damage numbers visibility ──
    root.style.setProperty('--show-dice-rolls', settings.showDiceRolls ? '1' : '0');
    root.style.setProperty('--show-damage-numbers', settings.showDamageNumbers ? '1' : '0');

  }, [settings]);

  return null; // Pure side-effect component
}
