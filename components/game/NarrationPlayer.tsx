'use client';

/**
 * NarrationPlayer — floating audio playback bar for TTS narration.
 * Shows play/pause, stop, progress bar, and elapsed/total time.
 * Appears when audio is playing, paused, or loading.
 */

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
  /** Pause playback */
  onPause: () => void;
  /** Resume playback */
  onResume: () => void;
  /** Stop playback completely */
  onStop: () => void;
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
  onPause,
  onResume,
  onStop,
}: NarrationPlayerProps) {
  // Only show when actively playing, paused, or loading
  const visible = isSpeaking || isPaused || isLoading;
  if (!visible) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-0 animate-fadeIn">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-lg">
        {/* Voice icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
          <span className={`text-base ${isSpeaking ? 'animate-pulse' : ''}`}>
            {isLoading ? '⏳' : '🎙️'}
          </span>
        </div>

        {/* Label */}
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
          {isLoading ? 'Loading narration…' : isPaused ? 'Narration paused' : 'Narrating'}
        </span>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-slate-500 tabular-nums w-8 text-right flex-shrink-0">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-default">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isLoading
                  ? 'bg-amber-500/50 animate-pulse w-full'
                  : 'bg-amber-500'
              }`}
              style={isLoading ? undefined : { width: `${Math.max(progress * 100, 0.5)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 tabular-nums w-8 flex-shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Play / Pause */}
          {!isLoading && (
            <button
              onClick={isSpeaking ? onPause : onResume}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title={isSpeaking ? 'Pause' : 'Resume'}
              aria-label={isSpeaking ? 'Pause narration' : 'Resume narration'}
            >
              {isSpeaking ? (
                // Pause icon
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="1" width="4" height="12" rx="1" />
                  <rect x="8" y="1" width="4" height="12" rx="1" />
                </svg>
              ) : (
                // Play icon
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 1.5v11l9-5.5L3 1.5z" />
                </svg>
              )}
            </button>
          )}

          {/* Stop */}
          <button
            onClick={onStop}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
            title="Stop"
            aria-label="Stop narration"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
