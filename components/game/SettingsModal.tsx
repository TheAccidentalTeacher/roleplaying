'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { uiState, setSettings } = useGameStore();
  const settings = uiState.settings;
  const [elInputValue, setElInputValue] = useState(settings.ttsElVoiceId ?? '');

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-slate-100">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Settings Sections */}
        <div className="p-5 space-y-6">
          {/* Font Size */}
          <SettingGroup label="Text Size">
            <SegmentedControl
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
              value={settings.fontSize}
              onChange={(v) => setSettings({ fontSize: v as 'small' | 'medium' | 'large' })}
            />
          </SettingGroup>

          {/* Narrative Speed */}
          <SettingGroup label="Narrative Speed">
            <SegmentedControl
              options={[
                { value: 'instant', label: 'Instant' },
                { value: 'fast', label: 'Fast' },
                { value: 'normal', label: 'Normal' },
                { value: 'dramatic', label: 'Dramatic' },
              ]}
              value={settings.narrativeSpeed}
              onChange={(v) =>
                setSettings({ narrativeSpeed: v as 'instant' | 'fast' | 'normal' | 'dramatic' })
              }
            />
          </SettingGroup>

          {/* Animations */}
          <SettingGroup label="Animations">
            <SegmentedControl
              options={[
                { value: 'none', label: 'Off' },
                { value: 'reduced', label: 'Reduced' },
                { value: 'full', label: 'Full' },
              ]}
              value={settings.animations}
              onChange={(v) =>
                setSettings({ animations: v as 'none' | 'reduced' | 'full' })
              }
            />
          </SettingGroup>

          {/* Toggles */}
          <div className="space-y-3">
            <ToggleSetting
              label="Show Dice Rolls"
              description="Display dice roll animations in chat"
              checked={settings.showDiceRolls}
              onChange={(v) => setSettings({ showDiceRolls: v })}
            />
            <ToggleSetting
              label="Show Damage Numbers"
              description="Display damage values in combat"
              checked={settings.showDamageNumbers}
              onChange={(v) => setSettings({ showDamageNumbers: v })}
            />
            <ToggleSetting
              label="Tooltips"
              description="Show helpful tooltips on hover"
              checked={settings.tooltipsEnabled}
              onChange={(v) => setSettings({ tooltipsEnabled: v })}
            />
            <ToggleSetting
              label="Auto-Save"
              description="Automatically save progress periodically"
              checked={settings.autoSave}
              onChange={(v) => setSettings({ autoSave: v })}
            />
          </div>

          {/* ── TTS / Voice ── */}
          <div className="border-t border-slate-700/50 pt-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🔊 Voice Narration</h3>
            <ToggleSetting
              label="Text-to-Speech"
              description="DM responses read aloud (OpenAI TTS)"
              checked={settings.ttsEnabled}
              onChange={(v) => setSettings({ ttsEnabled: v })}
            />
            {settings.ttsEnabled && (
              <ToggleSetting
                label="Auto-Play"
                description="Automatically read new DM messages"
                checked={settings.ttsAutoPlay}
                onChange={(v) => setSettings({ ttsAutoPlay: v })}
              />
            )}

            {/* Narrator voice picker — always visible */}
            <SettingGroup label="Narrator Voice">
              {/* Auto */}
              <button
                onClick={() => setSettings({ ttsVoice: 'auto' })}
                className={`w-full mb-2 px-3 py-2 text-xs rounded-lg text-left transition flex items-center justify-between ${
                  settings.ttsVoice === 'auto'
                    ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-transparent'
                }`}
              >
                <span className="font-medium">🎲 Auto (by genre)</span>
                <span className="text-[10px] text-slate-500">Matched to world genre</span>
              </button>
              {/* Male */}
              <p className="text-[10px] text-slate-500 mb-1">♂️ Male voices</p>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {([
                  { value: 'onyx',   label: 'Onyx',   accent: 'American', desc: 'Deep & authoritative' },
                  { value: 'echo',   label: 'Echo',   accent: 'American', desc: 'Warm & ominous' },
                  { value: 'fable',  label: 'Fable',  accent: 'British',  desc: 'Expressive storyteller' },
                  { value: 'ballad', label: 'Ballad', accent: 'British',  desc: 'Lyrical baritone' },
                  { value: 'verse',  label: 'Verse',  accent: 'American', desc: 'Conversational' },
                  { value: 'ash',    label: 'Ash',    accent: 'American', desc: 'Clear & direct' },
                  { value: 'alloy',  label: 'Alloy',  accent: 'American', desc: 'Neutral & synthetic' },
                ] as { value: typeof settings.ttsVoice; label: string; accent: string; desc: string }[]).map((opt) => (
                  <button key={opt.value} onClick={() => setSettings({ ttsVoice: opt.value })}
                    className={`px-2 py-2 text-xs rounded-lg text-left transition ${
                      settings.ttsVoice === opt.value
                        ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-transparent'
                    }`}>
                    <span className="block font-medium">{opt.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{opt.accent} · {opt.desc}</span>
                  </button>
                ))}
              </div>
              {/* Female */}
              <p className="text-[10px] text-slate-500 mb-1">♀️ Female voices</p>
              <div className="grid grid-cols-2 gap-1">
                {([
                  { value: 'nova',    label: 'Nova',    accent: 'American', desc: 'Warm & emotive' },
                  { value: 'shimmer', label: 'Shimmer', accent: 'American', desc: 'Crisp & precise' },
                  { value: 'coral',   label: 'Coral',   accent: 'American', desc: 'Bright & engaging' },
                  { value: 'sage',    label: 'Sage',    accent: 'American', desc: 'Calm & thoughtful' },
                ] as { value: typeof settings.ttsVoice; label: string; accent: string; desc: string }[]).map((opt) => (
                  <button key={opt.value} onClick={() => setSettings({ ttsVoice: opt.value })}
                    className={`px-2 py-2 text-xs rounded-lg text-left transition ${
                      settings.ttsVoice === opt.value
                        ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-transparent'
                    }`}>
                    <span className="block font-medium">{opt.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{opt.accent} · {opt.desc}</span>
                  </button>
                ))}
              </div>
            </SettingGroup>

            {/* ElevenLabs Character Voices */}
            <SettingGroup label="🎭 Character Voices">
              <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                Use any ElevenLabs voice — monsters, villains, creatures, Gollum-style…
                Find voice IDs at{' '}
                <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >elevenlabs.io/voice-library</a>.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={elInputValue}
                  onChange={e => setElInputValue(e.target.value)}
                  placeholder="Paste ElevenLabs Voice ID…"
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-600 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
                />
                <button
                  onClick={() => {
                    if (elInputValue.trim()) {
                      setSettings({ ttsElVoiceId: elInputValue.trim(), ttsVoice: 'elevenlabs' });
                    }
                  }}
                  disabled={!elInputValue.trim()}
                  className="px-3 py-2 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
                >
                  Set Voice
                </button>
              </div>
              {settings.ttsElVoiceId && (
                <p className="text-[10px] text-purple-400/80 mt-1.5">
                  Active ID: <span className="font-mono">{settings.ttsElVoiceId}</span>
                  {settings.ttsVoice === 'elevenlabs' ? ' ✔ In use' : ' (select above to use)'}
                </p>
              )}
              <button
                onClick={() => setSettings({ ttsVoice: 'elevenlabs' })}
                disabled={!settings.ttsElVoiceId}
                className={`w-full mt-2 px-3 py-2 text-xs rounded-lg text-left transition ${
                  settings.ttsVoice === 'elevenlabs'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-transparent disabled:opacity-40'
                }`}
              >
                {settings.ttsVoice === 'elevenlabs' ? '🎭 Character voice active' : 'Use character voice for narration'}
              </button>
            </SettingGroup>

            {settings.ttsEnabled && (
              <SettingGroup label="Playback Speed">
                <div className="flex items-center gap-1.5">
                  {([1, 1.5, 2, 2.5, 3] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSettings({ ttsSpeed: speed })}
                      className={`flex-1 px-2 py-1.5 text-xs font-bold rounded-md transition tabular-nums ${
                        (settings.ttsSpeed ?? 1) === speed
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {(settings.ttsSpeed ?? 1) >= 2 ? 'Audiobook speed' : (settings.ttsSpeed ?? 1) >= 1.5 ? 'Faster narration' : 'Normal pace'}
                </p>
              </SettingGroup>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-lg text-sm hover:bg-sky-500/30 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function SettingGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex bg-slate-800 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition ${
            value === opt.value
              ? 'bg-sky-500/30 text-sky-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-slate-200">{label}</span>
        <p className="text-[10px] text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`w-9 h-5 rounded-full transition-colors relative ${
          checked ? 'bg-sky-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
