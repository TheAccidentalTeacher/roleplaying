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
  /**
   * Pre-fetch the first chunk of audio in the background (call during DM streaming).
   * When speak() is called later with matching text it will skip the first API round-trip.
   */
  prefetch: (text: string, voice: TTSVoice | 'elevenlabs' | 'azure', options?: SpeakOptions) => void;
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
  // Prefetch cache: first-chunk text → Blob (or in-flight Promise)
  const prefetchCache = useRef<Map<string, Blob | Promise<Blob>>>(new Map());

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

  /**
   * Pre-fetch the first chunk of audio while the DM is still streaming.
   * speak() will use the cached blob and skip the first API round-trip.
   */
  const prefetch = useCallback((text: string, voice: TTSVoice | 'elevenlabs' | 'azure', options?: SpeakOptions) => {
    const chunks = splitTextIntoChunks(text, CHUNK_CHAR_LIMIT);
    if (chunks.length === 0) return;
    const firstChunk = chunks[0];
    if (prefetchCache.current.has(firstChunk)) return; // already fetching/done

    const endpoint = options?.endpoint ?? '/api/tts';
    const bodyBuilder: (t: string) => Record<string, unknown> = options?.extraBody !== undefined
      ? (t) => ({ text: t, ...options.extraBody })
      : (t) => ({ text: t, voice });

    const ctrl = new AbortController();
    const promise = fetchChunkAudio(firstChunk, ctrl.signal, 0, 1, endpoint, bodyBuilder)
      .then(blob => {
        prefetchCache.current.set(firstChunk, blob);
        return blob;
      })
      .catch(() => {
        prefetchCache.current.delete(firstChunk);
        return null as unknown as Blob;
      });
    prefetchCache.current.set(firstChunk, promise);
    console.log(`[TTS] Prefetching first chunk (${firstChunk.length} chars)`);
  }, [fetchChunkAudio]);

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

    // Safety timeout — abort if first chunk takes > 90s
    const timeout = setTimeout(() => {
      console.error('[TTS] Global timeout reached (90s), aborting');
      controller.abort();
    }, 90_000);

    try {
      // ── Split text into chunks ──
      const chunks = splitTextIntoChunks(text, CHUNK_CHAR_LIMIT);
      console.log(`[TTS] Text split into ${chunks.length} chunk(s):`, chunks.map((c, i) => `[${i + 1}] ${c.length} chars`));

      // ── Fire ALL chunk fetches in parallel — reuse prefetch cache for chunk 0 ──
      const firstChunk = chunks[0];
      const cached = prefetchCache.current.get(firstChunk);
      const chunk0Promise: Promise<Blob> = cached instanceof Blob
        ? Promise.resolve(cached)
        : cached instanceof Promise
          ? cached
          : fetchChunkAudio(firstChunk, controller.signal, 0, chunks.length, endpoint, bodyBuilder);

      const blobPromises = [
        chunk0Promise,
        ...chunks.slice(1).map((chunk, i) =>
          fetchChunkAudio(chunk, controller.signal, i + 1, chunks.length, endpoint, bodyBuilder)
        ),
      ];

      // ── Wait only for the first chunk, then start playing ──
      const firstBlob = await blobPromises[0];
      // Clean up cache entry
      prefetchCache.current.delete(firstChunk);
      clearTimeout(timeout);

      // Resolve remaining blobs in background into a pre-fetched queue
      const blobQueue: Blob[] = [firstBlob];
      for (let i = 1; i < blobPromises.length; i++) {
        blobPromises[i]
          .then(b => { blobQueue[i] = b; })
          .catch(err => {
            if (!(err instanceof Error && err.name === 'AbortError')) {
              console.error(`[TTS] Background chunk ${i + 1} failed:`, err);
            }
          });
      }

      // ── Chain playback: play each chunk as soon as it's available ──
      const playChunkAt = (idx: number) => {
        const blob = blobQueue[idx];
        if (!blob) return;

        const url = URL.createObjectURL(new Blob([blob], { type: 'audio/mpeg' }));
        const audio = new Audio(url);
        audio.playbackRate = playbackRate;
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          console.log(`[TTS] Chunk ${idx + 1}/${chunks.length} metadata: ${audio.duration.toFixed(1)}s`);
        };

        audio.onplay = () => {
          if (idx === 0) {
            console.log('[TTS] ▶ Playback started (chunk 1)');
          } else {
            console.log(`[TTS] ▶ Continuing chunk ${idx + 1}/${chunks.length}`);
          }
          setIsSpeaking(true);
          setIsPaused(false);
          setIsLoading(false);
          startProgressLoop();
        };

        audio.onended = () => {
          URL.revokeObjectURL(url);
          const next = idx + 1;
          if (next < chunks.length) {
            // Poll until next blob arrives (usually already done since fetched in parallel)
            const tryNext = () => {
              if (controller.signal.aborted) return;
              if (blobQueue[next]) {
                playChunkAt(next);
              } else {
                setTimeout(tryNext, 30);
              }
            };
            tryNext();
          } else {
            console.log('[TTS] ■ Playback ended naturally (all chunks done)');
            stopProgressLoop();
            setIsSpeaking(false);
            setIsPaused(false);
            setProgress(1);
            setTimeout(() => {
              setProgress(0);
              setCurrentTime(0);
              setDuration(0);
            }, 1500);
            audioRef.current = null;
          }
        };

        audio.onerror = (e) => {
          const mediaErr = audio.error;
          console.error('[TTS] ✖ Audio playback error:', {
            event: e,
            code: mediaErr?.code,
            message: mediaErr?.message,
            networkState: audio.networkState,
            readyState: audio.readyState,
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
          console.warn('[TTS] ⚠ Audio stalled (buffering chunk ' + (idx + 1) + ')');
        };

        // play() can reject due to browser autoplay policies
        audio.play().catch((playErr) => {
          setIsLoading(false);
          console.warn('[TTS] Autoplay blocked, user interaction may be needed:', playErr);
          setError('Tap play to start narration');
          setIsPaused(true);
        });
      };

      playChunkAt(0);

    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
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

  return { isSpeaking, isPaused, isLoading, prefetch, speak, pause, resume, stop, seek, skipForward, skipBack, setPlaybackRate, playbackRate, error, progress, currentTime, duration };
}
