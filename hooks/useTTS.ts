'use client';

import { useState, useRef, useCallback } from 'react';
import type { TTSVoice } from '@/lib/utils/tts-voices';

interface UseTTSReturn {
  /** Currently speaking */
  isSpeaking: boolean;
  /** Loading audio from API */
  isLoading: boolean;
  /** Speak the given text. Stops any current playback first. */
  speak: (text: string, voice: TTSVoice) => Promise<void>;
  /** Stop playback immediately */
  stop: () => void;
  /** Error from last attempt */
  error: string | null;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    // Abort any in-flight fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Revoke blob URL to free memory
      if (audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string, voice: TTSVoice) => {
    // Stop previous playback
    stop();

    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`TTS failed: ${response.status} — ${errBody.slice(0, 100)}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        setError('Audio playback failed');
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled — not an error
        return;
      }
      console.error('[TTS] Error:', err);
      setError(err instanceof Error ? err.message : 'TTS failed');
      setIsLoading(false);
    }
  }, [stop]);

  return { isSpeaking, isLoading, speak, stop, error };
}
