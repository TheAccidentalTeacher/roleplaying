'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

export type AmbientScene =
  | 'tavern'
  | 'dungeon'
  | 'wilderness'
  | 'combat'
  | 'town'
  | 'cave'
  | 'ocean'
  | 'storm'
  | 'default';

interface AmbientState {
  isPlaying: boolean;
  isLoading: boolean;
  currentScene: AmbientScene | null;
  currentTitle: string | null;
  volume: number;
  error: string | null;
}

interface UseAmbientReturn extends AmbientState {
  play: (sceneType: AmbientScene) => Promise<void>;
  stop: () => void;
  setVolume: (v: number) => void;
}

const DEFAULT_VOLUME = 0.15;

export function useAmbient(): UseAmbientReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AmbientState>({
    isPlaying: false,
    isLoading: false,
    currentScene: null,
    currentTitle: null,
    volume: DEFAULT_VOLUME,
    error: null,
  });

  // Keep audio volume in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.volume;
    }
  }, [state.volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setState((prev) => ({ ...prev, isPlaying: false, currentScene: null, currentTitle: null, error: null }));
  }, []);

  const play = useCallback(async (sceneType: AmbientScene) => {
    // Stop existing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch('/api/ambient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const { previewUrl, title } = await res.json() as { previewUrl: string; title: string; id: number; sceneType: string };

      const audio = new Audio(previewUrl);
      audio.loop = true;
      audio.volume = DEFAULT_VOLUME;
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        // loop attribute handles this, but just in case:
        audio.currentTime = 0;
        audio.play().catch(() => {});
      });

      audio.addEventListener('error', () => {
        setState((prev) => ({ ...prev, isPlaying: false, isLoading: false, error: 'Audio playback failed' }));
      });

      await audio.play();

      setState((prev) => ({
        ...prev,
        isPlaying: true,
        isLoading: false,
        currentScene: sceneType,
        currentTitle: title,
        error: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState((prev) => ({ ...prev, isLoading: false, isPlaying: false, error: message }));
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setState((prev) => ({ ...prev, volume: clamped }));
  }, []);

  return { ...state, play, stop, setVolume };
}
