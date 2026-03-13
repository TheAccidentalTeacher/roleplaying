'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TTSVoice } from '@/lib/utils/tts-voices';

// ── Chunk size for splitting long texts ──
const CHUNK_CHAR_LIMIT = 2400; // Stay under API's 2500-char limit with margin

export interface SpeakOptions {
  /** Override the API endpoint (default: '/api/tts'). */
  endpoint?: string;
  /** Extra body fields — merged in, overriding the default `voice` field. */
  extraBody?: Record<string, unknown>;
}

interface UseTTSReturn {
  /** Currently speaking (playing audio) */
  isSpeaking: boolean;
  /** Paused mid-playback */
  isPaused: boolean;
  /** Loading audio from API */
  isLoading: boolean;
  /** Speak the given text. Stops any current playback first. */
  speak: (text: string, voice: TTSVoice | 'elevenlabs' | 'azure', options?: SpeakOptions) => Promise<void>;
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

/**
 * Split text into chunks at sentence boundaries, each ≤ maxLen chars.
 * Falls back to splitting at word boundaries if no sentence break fits.
 */
function splitTextIntoChunks(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Try to find the last sentence boundary within maxLen
    const window = remaining.slice(0, maxLen);
    // Look for .  !  ?  followed by space or end — prefer the latest one
    let splitIdx = -1;
    for (let i = maxLen - 1; i >= Math.floor(maxLen * 0.4); i--) {
      const ch = window[i];
      if ((ch === '.' || ch === '!' || ch === '?') && (i + 1 >= window.length || window[i + 1] === ' ' || window[i + 1] === '\n' || window[i + 1] === '"' || window[i + 1] === '\u201D')) {
        splitIdx = i + 1;
        break;
      }
    }

    // Fallback: split at last space
    if (splitIdx === -1) {
      splitIdx = window.lastIndexOf(' ');
    }

    // Worst case: hard split
    if (splitIdx <= 0) {
      splitIdx = maxLen;
    }

    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  return chunks.filter(c => c.length > 0);
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
    console.log('[TTS] stop() called');
    stopProgressLoop();
    // Abort any in-flight fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      console.log('[TTS] Aborted in-flight fetch');
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
      console.log('[TTS] Audio element cleaned up');
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
      console.log('[TTS] Paused at', audioRef.current.currentTime.toFixed(1) + 's');
    }
  }, [isSpeaking, isPaused, stopProgressLoop]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      startProgressLoop();
      setIsPaused(false);
      setIsSpeaking(true);
      console.log('[TTS] Resumed at', audioRef.current.currentTime.toFixed(1) + 's');
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
    console.log('[TTS] Seeked to', clamped.toFixed(1) + 's /' , audio.duration.toFixed(1) + 's');
  }, []);

  /** Skip forward by N seconds */
  const skipForward = useCallback((seconds = 10) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = Math.min(audio.currentTime + seconds, audio.duration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newTime / audio.duration);
    console.log('[TTS] Skipped forward', seconds + 's →', newTime.toFixed(1) + 's');
  }, []);

  /** Skip back by N seconds */
  const skipBack = useCallback((seconds = 10) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = Math.max(audio.currentTime - seconds, 0);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(newTime / audio.duration);
    console.log('[TTS] Skipped back', seconds + 's →', newTime.toFixed(1) + 's');
  }, []);

  /** Set playback rate (applies immediately if audio exists) */
  const setPlaybackRate = useCallback((rate: number) => {
    const clamped = Math.max(0.5, Math.min(rate, 3.0));
    setPlaybackRateState(clamped);
    if (audioRef.current) {
      audioRef.current.playbackRate = clamped;
    }
    console.log('[TTS] Playback rate set to', clamped + 'x');
  }, []);

  /**
   * Fetch a single audio chunk from the TTS API.
   * Returns a Blob of audio/mpeg data.
   */
  const fetchChunkAudio = useCallback(async (
    chunkText: string,
    signal: AbortSignal,
    chunkIdx: number,
    totalChunks: number,
    endpoint: string,
    bodyBuilder: (text: string) => Record<string, unknown>,
  ): Promise<Blob> => {
    console.log(`[TTS] Fetching chunk ${chunkIdx + 1}/${totalChunks} (${chunkText.length} chars) → ${endpoint}`);
    const t0 = performance.now();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyBuilder(chunkText)),
      signal,
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => 'Unknown error');
      console.error(`[TTS] Chunk ${chunkIdx + 1} failed: ${response.status}`, errBody);
      throw new Error(`TTS failed (${response.status})`);
    }

    const blob = await response.blob();
    const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
    console.log(`[TTS] Chunk ${chunkIdx + 1}/${totalChunks} received: ${(blob.size / 1024).toFixed(0)}KB in ${elapsed}s`);

    if (blob.size === 0) {
      throw new Error(`TTS returned empty audio for chunk ${chunkIdx + 1}`);
    }
    return blob;
  }, []);

  const speak = useCallback(async (text: string, voice: TTSVoice | 'elevenlabs' | 'azure', options?: SpeakOptions) => {
    const endpoint = options?.endpoint ?? '/api/tts';
    const bodyBuilder: (t: string) => Record<string, unknown> = options?.extraBody !== undefined
      ? (t) => ({ text: t, ...options.extraBody })
      : (t) => ({ text: t, voice });
    // Stop previous playback
    stop();

    if (!text.trim()) {
      console.warn('[TTS] speak() called with empty text, ignoring');
      return;
    }

    console.log(`[TTS] ── speak() START ── voice=${voice}, text length=${text.length} chars`);
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    // Safety timeout — abort if all fetches take > 90s total
    const timeout = setTimeout(() => {
      console.error('[TTS] Global timeout reached (90s), aborting');
      controller.abort();
    }, 90_000);

    try {
      // ── Split text into chunks ──
      const chunks = splitTextIntoChunks(text, CHUNK_CHAR_LIMIT);
      console.log(`[TTS] Text split into ${chunks.length} chunk(s):`, chunks.map((c, i) => `[${i + 1}] ${c.length} chars`));

      // ── Fetch audio for all chunks ──
      const blobs: Blob[] = [];
      for (let i = 0; i < chunks.length; i++) {
        if (controller.signal.aborted) {
          console.warn('[TTS] Aborted before fetching chunk', i + 1);
          throw new DOMException('Aborted', 'AbortError');
        }
        const blob = await fetchChunkAudio(chunks[i], controller.signal, i, chunks.length, endpoint, bodyBuilder);
        blobs.push(blob);
      }

      // ── Combine blobs into a single audio blob ──
      const combinedBlob = new Blob(blobs, { type: 'audio/mpeg' });
      console.log(`[TTS] Combined audio: ${(combinedBlob.size / 1024).toFixed(0)}KB from ${blobs.length} chunk(s)`);
      const url = URL.createObjectURL(combinedBlob);

      clearTimeout(timeout);

      const audio = new Audio(url);
      audio.playbackRate = playbackRate;
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        console.log(`[TTS] Audio metadata loaded: duration=${audio.duration.toFixed(1)}s`);
      };

      audio.onplay = () => {
        console.log('[TTS] ▶ Playback started');
        setIsSpeaking(true);
        setIsPaused(false);
        setIsLoading(false);
        startProgressLoop();
      };

      audio.onended = () => {
        console.log('[TTS] ■ Playback ended naturally (finished)');
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

      audio.onerror = (e) => {
        const mediaErr = audio.error;
        console.error('[TTS] ✖ Audio playback error:', {
          event: e,
          code: mediaErr?.code,
          message: mediaErr?.message,
          networkState: audio.networkState,
          readyState: audio.readyState,
          currentTime: audio.currentTime,
          duration: audio.duration,
          src: audio.src?.slice(0, 60),
        });
        stopProgressLoop();
        setIsSpeaking(false);
        setIsPaused(false);
        setIsLoading(false);
        setError(`Audio playback failed${mediaErr?.message ? ': ' + mediaErr.message : ''}`);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onstalled = () => {
        console.warn('[TTS] ⚠ Audio stalled (buffering):', {
          currentTime: audio.currentTime,
          duration: audio.duration,
          readyState: audio.readyState,
          networkState: audio.networkState,
        });
      };

      audio.onwaiting = () => {
        console.warn('[TTS] ⏳ Audio waiting for data:', {
          currentTime: audio.currentTime,
          readyState: audio.readyState,
        });
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
        console.warn('[TTS] Request aborted (user cancel or timeout)');
        setIsLoading(false);
        setError('Narration timed out — try a shorter passage');
        return;
      }
      console.error('[TTS] ✖ Error in speak():', err);
      setError(err instanceof Error ? err.message : 'TTS failed');
      setIsLoading(false);
    }
  }, [stop, fetchChunkAudio, startProgressLoop, stopProgressLoop, playbackRate]);

  return { isSpeaking, isPaused, isLoading, speak, pause, resume, stop, seek, skipForward, skipBack, setPlaybackRate, playbackRate, error, progress, currentTime, duration };
}
