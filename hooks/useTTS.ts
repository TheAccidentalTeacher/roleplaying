'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { TTSVoice } from '@/lib/utils/tts-voices';

// ── Chunk size for splitting long texts ──
const CHUNK_CHAR_LIMIT = 2400;       // Stay under API's 2500-char limit with margin
const FIRST_CHUNK_CHAR_LIMIT = 500;  // Small first chunk → audio starts in ~2s instead of 8-15s

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
  // Prefetch slot — stores audio for the first N chars of the in-flight DM response.
  // Keyed by voice+endpoint so speak() can consume it without an exact text match.
  const prefetchSlot = useRef<{
    prefetchedText: string;
    blob: Promise<Blob>;
    voice: string;
    endpoint: string;
  } | null>(null);

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
   * Pre-fetch audio for the first N chars while the DM is still streaming.
   * speak() will consume it as chunk 0 — eliminating the first API round-trip wait.
   */
  const prefetch = useCallback((text: string, voice: TTSVoice | 'elevenlabs' | 'azure', options?: SpeakOptions) => {
    const endpoint = options?.endpoint ?? '/api/tts';
    const bodyBuilder: (t: string) => Record<string, unknown> = options?.extraBody !== undefined
      ? (t) => ({ text: t, ...options.extraBody })
      : (t) => ({ text: t, voice });

    // If we already have a slot for the same voice/endpoint, skip (already fetching)
    const existing = prefetchSlot.current;
    if (existing && existing.voice === voice && existing.endpoint === endpoint) return;

    // Only prefetch the short first chunk — generates in ~2s and starts playback fast
    const firstChunk = splitTextIntoChunks(text, FIRST_CHUNK_CHAR_LIMIT)[0];
    if (!firstChunk) return;

    const ctrl = new AbortController();
    const promise = fetchChunkAudio(firstChunk, ctrl.signal, 0, 1, endpoint, bodyBuilder)
      .catch(() => null as unknown as Blob);

    prefetchSlot.current = { prefetchedText: firstChunk, blob: promise, voice, endpoint };
    console.log(`[TTS] Prefetching first chunk: ${firstChunk.length} chars, voice=${voice}`);
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
      // ── Check prefetch slot — text must start with prefetchedText, same voice+endpoint ──
      const slot = prefetchSlot.current;
      const useSlot = !!(
        slot &&
        slot.voice === String(voice) &&
        slot.endpoint === endpoint &&
        text.startsWith(slot.prefetchedText)
      );
      prefetchSlot.current = null; // always consume

      let blobPromises: Promise<Blob>[];
      let totalChunks: number;

      if (useSlot) {
        // chunk 0 audio is already in-flight (or done). Split only the remaining text.
        const remainingText = text.slice(slot!.prefetchedText.length).trim();
        const remainingChunks = remainingText ? splitTextIntoChunks(remainingText, CHUNK_CHAR_LIMIT) : [];
        totalChunks = 1 + remainingChunks.length;
        console.log(`[TTS] ✓ Prefetch slot hit — pre-fetched ${slot!.prefetchedText.length} chars, ${remainingChunks.length} remaining chunk(s)`);
        blobPromises = [
          slot!.blob,
          ...remainingChunks.map((chunk, i) =>
            fetchChunkAudio(chunk, controller.signal, i + 1, totalChunks, endpoint, bodyBuilder)
          ),
        ];
      } else {
        // Normal path: small first chunk for fast start, full-size remaining chunks
        const firstChunkArr = splitTextIntoChunks(text, FIRST_CHUNK_CHAR_LIMIT);
        const firstChunk = firstChunkArr[0];
        const afterFirst = text.slice(firstChunk.length).trim();
        const remainingChunks = afterFirst ? splitTextIntoChunks(afterFirst, CHUNK_CHAR_LIMIT) : [];
        const allChunks = [firstChunk, ...remainingChunks];
        totalChunks = allChunks.length;
        console.log(`[TTS] No prefetch slot — ${totalChunks} chunk(s): [${firstChunk.length}c first] + [${remainingChunks.map(c => c.length + 'c').join(', ')}]`);
        blobPromises = allChunks.map((chunk, i) =>
          fetchChunkAudio(chunk, controller.signal, i, totalChunks, endpoint, bodyBuilder)
        );
      }

      // ── Wait only for the first chunk, then start playing ──
      const firstBlob = await blobPromises[0];
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
          console.log(`[TTS] Chunk ${idx + 1}/${totalChunks} metadata: ${audio.duration.toFixed(1)}s`);
        };

        audio.onplay = () => {
          if (idx === 0) {
            console.log('[TTS] ▶ Playback started (chunk 1)');
          } else {
            console.log(`[TTS] ▶ Continuing chunk ${idx + 1}/${totalChunks}`);
          }
          setIsSpeaking(true);
          setIsPaused(false);
          setIsLoading(false);
          startProgressLoop();
        };

        audio.onended = () => {
          URL.revokeObjectURL(url);
          const next = idx + 1;
          if (next < totalChunks) {
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
