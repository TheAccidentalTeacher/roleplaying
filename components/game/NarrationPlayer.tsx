'use client';

import { useRef, useCallback } from 'react';

/**
 * NarrationPlayer — floating audio playback bar for TTS narration.
 * Shows play/pause, stop, seekable progress bar, skip ±10s,
 * speed control, and elapsed/total time.
 */

const SPEED_OPTIONS = [1, 1.5, 2, 2.5, 3] as const;

interface NarrationPlayerProps {
  /** Audio is actively playing */
  isSpeaking: boolean;
  /** Audio is paused mid-playback */
  isPaused: boolean;
  /** Audio is loading from API */
  isLoading: boolean;
  /** Playback progress 0–1 */
  progress: number;
  /** Current time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Error from last TTS attempt */
  error: string | null;
  /** Current playback speed */
  playbackRate: number;
  /** Pause playback */
  onPause: () => void;
  /** Resume playback */
  onResume: () => void;
  /** Stop playback completely */
  onStop: () => void;
  /** Seek to a specific time in seconds */
  onSeek: (time: number) => void;
  /** Skip forward N seconds */
  onSkipForward: (seconds?: number) => void;
  /** Skip back N seconds */
  onSkipBack: (seconds?: number) => void;
  /** Set playback speed */
  onSetSpeed: (rate: number) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NarrationPlayer({
  isSpeaking,
  isPaused,
  isLoading,
  progress,
  currentTime,
  duration,
  error,
  playbackRate,
  onPause,
  onResume,
  onStop,
  onSeek,
  onSkipForward,
  onSkipBack,
  onSetSpeed,
}: NarrationPlayerProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Click/drag on progress bar to seek
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      if (!bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
      onSeek(fraction * duration);
    },
    [duration, onSeek],
  );

  // Cycle through speed options
  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playbackRate as typeof SPEED_OPTIONS[number]);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % SPEED_OPTIONS.length;
    onSetSpeed(SPEED_OPTIONS[nextIdx]);
  }, [playbackRate, onSetSpeed]);

  // Show when actively playing, paused, loading, or errored
  const visible = isSpeaking || isPaused || isLoading || !!error;
  if (!visible) return null;

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-0 animate-fadeIn">
        <div className="bg-red-900/80 backdrop-blur-sm border border-red-600/50 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-lg">
          <span className="text-base">⚠️</span>
          <span className="text-xs text-red-200 flex-1 truncate">
            Narration failed — try again
          </span>
          <button
            onClick={onStop}
            className="text-xs text-red-300 hover:text-white px-2 py-1 rounded hover:bg-red-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-0 animate-fadeIn">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl px-3 py-2 shadow-lg space-y-1.5">
        {/* Top row: controls + times */}
        <div className="flex items-center gap-1.5">
          {/* Voice icon */}
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
            <span className={`text-sm ${isSpeaking ? 'animate-pulse' : ''}`}>
              {isLoading ? '⏳' : '🎙️'}
            </span>
          </div>

          {/* Skip back 10s */}
          {!isLoading && (
            <button
              onClick={() => onSkipBack(10)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Back 10s"
              aria-label="Skip back 10 seconds"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5V1L7 6l5 5V7a6 6 0 0 1 0 12 6 6 0 0 1-6-6" />
                <text x="9" y="16" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">10</text>
              </svg>
            </button>
          )}

          {/* Play / Pause */}
          {!isLoading && (
            <button
              onClick={isSpeaking ? onPause : onResume}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
              title={isSpeaking ? 'Pause' : 'Resume'}
              aria-label={isSpeaking ? 'Pause narration' : 'Resume narration'}
            >
              {isSpeaking ? (
                <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="1" width="4" height="12" rx="1" />
                  <rect x="8" y="1" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 1.5v11l9-5.5L3 1.5z" />
                </svg>
              )}
            </button>
          )}

          {/* Skip forward 10s */}
          {!isLoading && (
            <button
              onClick={() => onSkipForward(10)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Forward 10s"
              aria-label="Skip forward 10 seconds"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5V1l5 5-5 5V7a6 6 0 0 0 0 12 6 6 0 0 0 6-6" />
                <text x="6" y="16" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">10</text>
              </svg>
            </button>
          )}

          {/* Stop */}
          <button
            onClick={onStop}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-colors"
            title="Stop"
            aria-label="Stop narration"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" rx="1.5" />
            </svg>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Speed button — tap to cycle */}
          {!isLoading && (
            <button
              onClick={cycleSpeed}
              className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-700 text-amber-400 hover:bg-slate-600 hover:text-amber-300 transition-colors tabular-nums min-w-[36px]"
              title={`Speed: ${playbackRate}x — click to change`}
              aria-label={`Playback speed ${playbackRate}x`}
            >
              {playbackRate}x
            </button>
          )}

          {/* Times */}
          <span className="text-[10px] text-slate-500 tabular-nums whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Seekable progress bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer group relative"
          role="slider"
          aria-label="Narration progress"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-100 ${
              isLoading
                ? 'bg-amber-500/50 animate-pulse w-full'
                : 'bg-amber-500 group-hover:bg-amber-400'
            }`}
            style={isLoading ? undefined : { width: `${Math.max(progress * 100, 0.5)}%` }}
          />
          {/* Thumb indicator on hover */}
          {!isLoading && progress > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
