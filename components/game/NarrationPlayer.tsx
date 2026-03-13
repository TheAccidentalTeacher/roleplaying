'use client';

import { useRef, useCallback, useState } from 'react';
import { AZURE_VOICES } from '@/lib/utils/azure-voices';

/**
 * NarrationPlayer — fixed floating audio playback bar for TTS narration.
 * Sits above the quick-actions bar at the bottom of the viewport.
 * Includes play/pause, stop, seek, skip ±10s, speed, and a voice picker.
 */

const SPEED_OPTIONS = [1, 1.5, 2, 2.5, 3] as const;

interface VoiceOption {
  value: string;
  label: string;
  gender: 'Male' | 'Female' | 'Auto' | 'Custom' | 'Azure';
  accent: string;
  desc: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { value: 'auto',       label: 'Auto',       gender: 'Auto',   accent: 'By genre',    desc: 'Matched to world genre' },
  // Male voices
  { value: 'onyx',       label: 'Onyx',       gender: 'Male',   accent: 'American',    desc: 'Deep & authoritative' },
  { value: 'echo',       label: 'Echo',       gender: 'Male',   accent: 'American',    desc: 'Warm & ominous' },
  { value: 'fable',      label: 'Fable',      gender: 'Male',   accent: 'British',     desc: 'Expressive storyteller' },
  { value: 'ballad',     label: 'Ballad',     gender: 'Male',   accent: 'British',     desc: 'Lyrical baritone' },
  { value: 'verse',      label: 'Verse',      gender: 'Male',   accent: 'American',    desc: 'Versatile & conversational' },
  { value: 'ash',        label: 'Ash',        gender: 'Male',   accent: 'American',    desc: 'Clear & direct' },
  { value: 'alloy',      label: 'Alloy',      gender: 'Male',   accent: 'American',    desc: 'Neutral & synthetic' },
  // Female voices
  { value: 'nova',       label: 'Nova',       gender: 'Female', accent: 'American',    desc: 'Warm & emotive' },
  { value: 'shimmer',    label: 'Shimmer',    gender: 'Female', accent: 'American',    desc: 'Crisp & precise' },
  { value: 'coral',      label: 'Coral',      gender: 'Female', accent: 'American',    desc: 'Bright & engaging' },
  { value: 'sage',       label: 'Sage',       gender: 'Female', accent: 'American',    desc: 'Calm & thoughtful' },
  // ElevenLabs character voice
  { value: 'elevenlabs', label: 'Character',  gender: 'Custom', accent: 'ElevenLabs',  desc: 'Any creature / character voice' },
  // Azure neural voice
  { value: 'azure',      label: 'Azure',      gender: 'Azure',  accent: 'Microsoft',   desc: 'Neural voice (Azure)' },
];

export type TTSVoiceSetting = 'auto' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse' | 'elevenlabs' | 'azure';

interface NarrationPlayerProps {
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  error: string | null;
  playbackRate: number;
  currentVoice?: TTSVoiceSetting;
  /** Current ElevenLabs voice ID (used when currentVoice === 'elevenlabs') */
  elVoiceId?: string;
  /** Saved ElevenLabs character voice presets */
  elPresets?: Array<{ name: string; voiceId: string }>;
  /** Current Azure voice name (used when currentVoice === 'azure') */
  azVoiceId?: string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onSkipForward: (seconds?: number) => void;
  onSkipBack: (seconds?: number) => void;
  onSetSpeed: (rate: number) => void;
  onVoiceChange?: (voice: TTSVoiceSetting) => void;
  onElVoiceIdChange?: (id: string) => void;
  onAzVoiceIdChange?: (id: string) => void;
  onSavePreset?: (name: string, voiceId: string) => void;
  onDeletePreset?: (voiceId: string) => void;
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
  currentVoice = 'auto',
  elVoiceId = '',
  elPresets = [],
  azVoiceId = 'en-US-AriaNeural',
  onPause,
  onResume,
  onStop,
  onSeek,
  onSkipForward,
  onSkipBack,
  onSetSpeed,
  onVoiceChange,
  onElVoiceIdChange,
  onAzVoiceIdChange,
  onSavePreset,
  onDeletePreset,
}: NarrationPlayerProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [elInputValue, setElInputValue] = useState(elVoiceId);
  const [azInputValue, setAzInputValue] = useState(azVoiceId);
  const [savePresetName, setSavePresetName] = useState('');

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

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playbackRate as typeof SPEED_OPTIONS[number]);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % SPEED_OPTIONS.length;
    onSetSpeed(SPEED_OPTIONS[nextIdx]);
  }, [playbackRate, onSetSpeed]);

  const visible = isSpeaking || isPaused || isLoading || !!error;
  if (!visible) return null;

  const activeVoice = VOICE_OPTIONS.find(v => v.value === currentVoice) ?? VOICE_OPTIONS[0];
  const genderIcon = activeVoice.gender === 'Female' ? '♀️' : activeVoice.gender === 'Male' ? '♂️' : activeVoice.gender === 'Custom' ? '🎭' : activeVoice.gender === 'Azure' ? '🔷' : '🎲';

  return (
    // Fixed floating bar, centered above the bottom action bar
    <div className="fixed bottom-[84px] left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl">
        {/* Error state */}
        {error ? (
          <div className="bg-red-900/90 backdrop-blur-sm border border-red-600/50 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xl">
            <span className="text-base">⚠️</span>
            <span className="text-xs text-red-200 flex-1 truncate">Narration failed — try again</span>
            <button
              onClick={onStop}
              className="text-xs text-red-300 hover:text-white px-2 py-1 rounded hover:bg-red-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl px-3 py-2 shadow-xl space-y-1.5">
            {/* Controls row */}
            <div className="flex items-center gap-1.5">
              {/* Voice icon / indicator */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
                <span className={`text-sm ${isSpeaking ? 'animate-pulse' : ''}`}>
                  {isLoading ? '⏳' : '🎙️'}
                </span>
              </div>

              {/* Skip back */}
              {!isLoading && (
                <button
                  onClick={() => onSkipBack(10)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Back 10s"
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

              {/* Skip forward */}
              {!isLoading && (
                <button
                  onClick={() => onSkipForward(10)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Forward 10s"
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
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="1" y="1" width="10" height="10" rx="1.5" />
                </svg>
              </button>

              <div className="flex-1" />

              {/* Voice picker button */}
              <div className="relative">
                <button
                  onClick={() => setShowVoicePicker(p => !p)}
                  className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-700 text-sky-400 hover:bg-slate-600 hover:text-sky-300 transition-colors flex items-center gap-1"
                  title="Change narrator voice"
                >
                  <span>🎙️</span>
                  <span>{genderIcon} {activeVoice.label}</span>
                </button>
                {showVoicePicker && (
                  <div className="absolute bottom-8 right-0 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl p-2.5 z-50 w-[280px]">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-1">Narrator Voice</p>
                    {/* Auto */}
                    <div className="mb-2">
                      {VOICE_OPTIONS.filter(o => o.gender === 'Auto').map(opt => (
                        <button key={opt.value} onClick={() => { onVoiceChange?.(opt.value as TTSVoiceSetting); setShowVoicePicker(false); }}
                          className={`w-full px-2.5 py-2 text-xs rounded-lg text-left transition flex items-center justify-between gap-2 ${
                            currentVoice === opt.value ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                          }`}>
                          <span className="font-medium">🎲 {opt.label}</span>
                          <span className="text-[10px] text-slate-500">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                    {/* Male voices */}
                    <p className="text-[10px] text-slate-600 px-1 mb-1">♂️ Male</p>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      {VOICE_OPTIONS.filter(o => o.gender === 'Male').map(opt => (
                        <button key={opt.value} onClick={() => { onVoiceChange?.(opt.value as TTSVoiceSetting); setShowVoicePicker(false); }}
                          className={`px-2 py-1.5 text-xs rounded-lg text-left transition ${
                            currentVoice === opt.value ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                          }`}>
                          <span className="block font-medium">{opt.label}</span>
                          <span className="block text-[10px] text-slate-500">{opt.accent} · {opt.desc}</span>
                        </button>
                      ))}
                    </div>
                    {/* Female voices */}
                    <p className="text-[10px] text-slate-600 px-1 mb-1">♀️ Female</p>
                    <div className="grid grid-cols-2 gap-1">
                      {VOICE_OPTIONS.filter(o => o.gender === 'Female').map(opt => (
                        <button key={opt.value} onClick={() => { onVoiceChange?.(opt.value as TTSVoiceSetting); setShowVoicePicker(false); }}
                          className={`px-2 py-1.5 text-xs rounded-lg text-left transition ${
                            currentVoice === opt.value ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                          }`}>
                          <span className="block font-medium">{opt.label}</span>
                          <span className="block text-[10px] text-slate-500">{opt.accent} · {opt.desc}</span>
                        </button>
                      ))}
                    </div>
                    {/* ElevenLabs Character Voices */}
                    <div className="mt-3 pt-2.5 border-t border-slate-700">
                      <p className="text-[10px] text-slate-500 px-1 mb-1.5">🎭 ElevenLabs Character Voices</p>

                      {/* Saved presets */}
                      {elPresets.length > 0 && (
                        <div className="flex flex-col gap-1 mb-2">
                          {elPresets.map(p => (
                            <div key={p.voiceId} className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setElInputValue(p.voiceId);
                                  onElVoiceIdChange?.(p.voiceId);
                                  onVoiceChange?.('elevenlabs');
                                  setShowVoicePicker(false);
                                }}
                                className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg text-left transition ${
                                  currentVoice === 'elevenlabs' && elVoiceId === p.voiceId
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent'
                                }`}
                              >
                                <span className="font-medium">{p.name}</span>
                                <span className="block text-[10px] text-slate-600 font-mono truncate">{p.voiceId}</span>
                              </button>
                              <button
                                onClick={() => onDeletePreset?.(p.voiceId)}
                                className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                                title="Remove preset"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Custom voice ID input */}
                      <div className="flex gap-1.5 mb-1.5">
                        <input
                          type="text"
                          value={elInputValue}
                          onChange={e => setElInputValue(e.target.value)}
                          placeholder="Paste ElevenLabs Voice ID…"
                          className="flex-1 px-2 py-1.5 text-[11px] rounded-lg bg-slate-800 border border-slate-600 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
                        />
                        <button
                          onClick={() => {
                            if (elInputValue.trim()) {
                              onElVoiceIdChange?.(elInputValue.trim());
                              onVoiceChange?.('elevenlabs');
                              setShowVoicePicker(false);
                            }
                          }}
                          disabled={!elInputValue.trim()}
                          className="px-2.5 py-1.5 text-[11px] rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Use
                        </button>
                      </div>

                      {/* Save current ID as a named preset */}
                      {elInputValue.trim() && (
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={savePresetName}
                            onChange={e => setSavePresetName(e.target.value)}
                            placeholder="Name this preset…"
                            className="flex-1 px-2 py-1.5 text-[11px] rounded-lg bg-slate-800 border border-slate-600 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
                          />
                          <button
                            onClick={() => {
                              if (savePresetName.trim() && elInputValue.trim()) {
                                onSavePreset?.(savePresetName.trim(), elInputValue.trim());
                                setSavePresetName('');
                              }
                            }}
                            disabled={!savePresetName.trim()}
                            className="px-2.5 py-1.5 text-[11px] rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
                          >
                            Save
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-600 mt-1 px-0.5">
                        <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noreferrer"
                          className="text-purple-400/70 hover:text-purple-300"
                          onClick={e => e.stopPropagation()}
                        >elevenlabs.io/voice-library</a>
                        {' '}— filter Creature, Fantasy, Villain
                      </p>
                    </div>
                    {/* Azure Neural Voices */}
                    <div className="mt-3 pt-2.5 border-t border-slate-700">
                      <p className="text-[10px] text-slate-500 px-1 mb-1.5">🔷 Azure Neural Voices</p>
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        {AZURE_VOICES.map(v => (
                          <button key={v.id}
                            onClick={() => {
                              setAzInputValue(v.id);
                              onAzVoiceIdChange?.(v.id);
                              onVoiceChange?.('azure');
                              setShowVoicePicker(false);
                            }}
                            className={`px-2 py-1.5 text-xs rounded-lg text-left transition ${
                              currentVoice === 'azure' && azVoiceId === v.id
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                            }`}>
                            <span className="block font-medium">{v.gender === 'F' ? '♀️' : '♂️'} {v.label}</span>
                            <span className="block text-[10px] text-slate-500">{v.accent}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Speed */}
              {!isLoading && (
                <button
                  onClick={cycleSpeed}
                  className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-700 text-amber-400 hover:bg-slate-600 hover:text-amber-300 transition-colors tabular-nums min-w-[36px]"
                  title={`Speed: ${playbackRate}x — click to change`}
                >
                  {playbackRate}x
                </button>
              )}

              {/* Time */}
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
              {!isLoading && progress > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `calc(${progress * 100}% - 6px)` }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
