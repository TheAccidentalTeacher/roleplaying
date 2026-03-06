'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TTSVoice } from '@/lib/utils/tts-voices';

interface UseTTSReturn {
  /** Currently speaking (playing audio) */
  isSpeaking: boolean;
  /** Paused mid-playback */
  isPaused: boolean;
  /** Loading audio from API */
  isLoading: boolean;
  /** Speak the given text. Stops any current playback first. */
  speak: (text: string, voice: TTSVoice) => Promise<void>;
  /** Pause playback (can resume) */
  pause: () => void;
  /** Resume paused playback */
  resume: () => void;
  /** Stop playback immediately (cannot resume) */
  stop: () => void;
  /** Seek to a specific time in seconds */
  seek: (time: number) => void;
  /** Skip forward by N seconds (default 10) */
  skipForward: (seconds?: number) => void;
  /** Skip back by N seconds (default 10) */
  skipBack: (seconds?: number) => void;
  /** Set playback speed (0.5–3.0) */
  setPlaybackRate: (rate: number) => void;
  /** Current playback speed */
  playbackRate: number;
  /** Error from last attempt */
  error: string | null;
  /** Playback progress 0–1 */
  progress: number;
  /** Current time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);

  // Animation frame loop for smooth progress updates
  const startProgressLoop = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused && audio.duration) {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
        setProgress(audio.currentTime / audio.duration);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopProgressLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopProgressLoop();
  }, [stopProgressLoop]);

  const stop = useCallback(() => {
    stopProgressLoop();
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
    setIsPaused(false);
    setIsLoading(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [stopProgressLoop]);

  const pause = useCallback(() => {
    if (audioRef.current && isSpeaking && !isPaused) {
      audioRef.current.pause();
      stopProgressLoop();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  }, [isSpeaking, isPaused, stopProgressLoop]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      startProgressLoop();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  }, [isPaused, startProgressLoop]);

  /** Seek to a specific time in seconds */
  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const clamped = Math.max(0, Math.min(time, audio.duration));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
    setProgress(clamped / audio.duration);
  }, []);

  /** Skip forward by N seconds */
  const skipForward = useCallback((seconds = 10) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = Math.min(audio.currentTime + seconds, audio.duration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newTime / audio.duration);
  }, []);

  /** Skip back by N seconds */
  const skipBack = useCallback((seconds = 10) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = Math.max(audio.currentTime - seconds, 0);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newTime / audio.duration);
  }, []);

  /** Set playback rate (applies immediately if audio exists) */
  const setPlaybackRate = useCallback((rate: number) => {
    const clamped = Math.max(0.5, Math.min(rate, 3.0));
    setPlaybackRateState(clamped);
    if (audioRef.current) {
      audioRef.current.playbackRate = clamped;
    }
  }, []);

  const speak = useCallback(async (text: string, voice: TTSVoice) => {
    // Stop previous playback
    stop();

    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    // Safety timeout — abort if fetch takes > 50s
    const timeout = setTimeout(() => {
      controller.abort();
    }, 50_000);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errBody = await response.text().catch(() => 'Unknown error');
        throw new Error(`TTS failed (${response.status})`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('TTS returned empty audio');
      }
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setIsLoading(false);
        startProgressLoop();
      };

      audio.onended = () => {
        stopProgressLoop();
        setIsSpeaking(false);
        setIsPaused(false);
        setProgress(1);
        setTimeout(() => {
          setProgress(0);
          setCurrentTime(0);
          setDuration(0);
        }, 1500);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        stopProgressLoop();
        setIsSpeaking(false);
        setIsPaused(false);
        setIsLoading(false);
        setError('Audio playback failed');
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      // play() can reject due to browser autoplay policies
      try {
        await audio.play();
      } catch (playErr) {
        // If onplay didn't fire, ensure loading flag is cleared
        setIsLoading(false);
        // Browser blocked autoplay — not a real error, audio may still be ready
        console.warn('[TTS] Autoplay blocked, user interaction may be needed:', playErr);
        setError('Tap play to start narration');
        // Keep audio loaded so user can manually trigger via resume
        setIsPaused(true);
      }
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        // Aborted — could be user cancel or timeout
        setIsLoading(false);
        setError('Narration timed out — try a shorter passage');
        return;
      }
      console.error('[TTS] Error:', err);
      setError(err instanceof Error ? err.message : 'TTS failed');
      setIsLoading(false);
    }
  }, [stop, startProgressLoop, stopProgressLoop, playbackRate]);

  return { isSpeaking, isPaused, isLoading, speak, pause, resume, stop, seek, skipForward, skipBack, setPlaybackRate, playbackRate, error, progress, currentTime, duration };
}
