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
  const [savePresetName, setSavePresetName] = useState('');

  // Prompt Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [wizardSuggestions, setWizardSuggestions] = useState<{title: string; description: string; instruction: string}[]>([]);
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});

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
                Use any{' '}
                <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >ElevenLabs</a>{' '}
                voice — monsters, villains, creatures, Gollum…
              </p>

              {/* Saved presets */}
              {(settings.ttsElPresets ?? []).length > 0 && (
                <div className="flex flex-col gap-1 mb-3">
                  {(settings.ttsElPresets ?? []).map(p => (
                    <div key={p.voiceId} className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSettings({ ttsElVoiceId: p.voiceId, ttsVoice: 'elevenlabs' })}
                        className={`flex-1 px-2.5 py-2 text-xs rounded-lg text-left transition ${
                          settings.ttsVoice === 'elevenlabs' && settings.ttsElVoiceId === p.voiceId
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-slate-800 text-slate-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-[10px] text-slate-600 font-mono truncate mt-0.5">{p.voiceId}</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = (settings.ttsElPresets ?? []).filter(x => x.voiceId !== p.voiceId);
                          setSettings({ ttsElPresets: updated });
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-slate-800 transition flex-shrink-0"
                        title="Remove preset"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Voice ID input */}
              <div className="flex gap-2 mb-1.5">
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
                  Use
                </button>
              </div>

              {/* Save as named preset */}
              {elInputValue.trim() && (
                <div className="flex gap-2 mb-1.5">
                  <input
                    type="text"
                    value={savePresetName}
                    onChange={e => setSavePresetName(e.target.value)}
                    placeholder="Name this preset…"
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-600 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
                  />
                  <button
                    onClick={() => {
                      if (savePresetName.trim() && elInputValue.trim()) {
                        const existing = settings.ttsElPresets ?? [];
                        const deduped = existing.filter(p => p.voiceId !== elInputValue.trim());
                        setSettings({ ttsElPresets: [...deduped, { name: savePresetName.trim(), voiceId: elInputValue.trim() }] });
                        setSavePresetName('');
                      }
                    }}
                    disabled={!savePresetName.trim()}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              )}

              {settings.ttsElVoiceId && (
                <p className="text-[10px] text-purple-400/70 mt-1">
                  Active:{' '}<span className="font-mono">{settings.ttsElVoiceId}</span>
                  {settings.ttsVoice === 'elevenlabs' && ' ✔'}
                </p>
              )}
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

        {/* ── Prompt Improvement Wizard ── */}
        <div className="border-t border-slate-700/50">
          <button
            onClick={() => setWizardOpen(p => !p)}
            className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🧙 DM Prompt Wizard</span>
            <span className="text-slate-500 text-xs">{wizardOpen ? '▲' : '▼'}</span>
          </button>

          {wizardOpen && (
            <div className="px-5 pb-4 space-y-4">
              {/* Step 1 — Insights */}
              {(() => {
                const feedback = uiState.messageFeedback ?? {};
                const scores = uiState.messageEvalScores ?? {};
                const thumbsDown = Object.values(feedback).filter(v => v === 'down').length;
                const thumbsUp = Object.values(feedback).filter(v => v === 'up').length;
                const totalRated = thumbsDown + thumbsUp;
                const evalEntries = Object.values(scores);
                const avgOverall = evalEntries.length > 0
                  ? (evalEntries.reduce((sum, e) => sum + (e.overall ?? 3), 0) / evalEntries.length).toFixed(1)
                  : null;
                return (
                  <div className="bg-slate-800/60 rounded-lg p-3 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-300">📊 Session Insights</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-lg font-bold text-red-400">{thumbsDown}</p><p className="text-[10px] text-slate-500">👎 Down</p></div>
                      <div><p className="text-lg font-bold text-green-400">{thumbsUp}</p><p className="text-[10px] text-slate-500">👍 Up</p></div>
                      <div><p className="text-lg font-bold text-amber-400">{avgOverall ?? '—'}</p><p className="text-[10px] text-slate-500">Avg Score</p></div>
                    </div>
                    {totalRated === 0 && <p className="text-[10px] text-slate-600 text-center">No feedback yet — use 👍👎 buttons in chat</p>}
                  </div>
                );
              })()}

              {/* Step 2 — Generate */}
              <div>
                <button
                  disabled={wizardLoading}
                  onClick={async () => {
                    setWizardLoading(true);
                    setWizardError(null);
                    setWizardSuggestions([]);
                    try {
                      const feedback = uiState.messageFeedback ?? {};
                      const scores = uiState.messageEvalScores ?? {};
                      const chatMessages = uiState.chatMessages ?? [];
                      // Collect last 3 thumbs-down message data
                      const thumbsDownMsgs = Object.entries(feedback)
                        .filter(([, v]) => v === 'down')
                        .slice(-3)
                        .map(([msgId]) => {
                          const idx = chatMessages.findIndex(m => m.id === msgId);
                          const dm = chatMessages[idx];
                          const player = idx > 0 ? chatMessages[idx - 1] : null;
                          const evalData = scores[msgId];
                          return {
                            dmResponse: dm?.content ?? '',
                            playerAction: player?.content ?? '',
                            evalNotes: evalData?.notes,
                            scores: evalData,
                          };
                        });
                      const res = await fetch('/api/prompt-wizard', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          thumbsDownMessages: thumbsDownMsgs,
                          genre: 'epic-fantasy',
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error ?? 'Failed');
                      const suggs = data.suggestions ?? [];
                      setWizardSuggestions(suggs);
                      // Initialize toggles: active if already in overrides, else off
                      const init: Record<string, boolean> = {};
                      suggs.forEach((s: {title: string}) => {
                        init[s.title] = !!settings.promptOverrides?.[s.title];
                      });
                      setPendingToggles(init);
                    } catch (e) {
                      setWizardError(e instanceof Error ? e.message : 'Failed to generate');
                    } finally {
                      setWizardLoading(false);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {wizardLoading ? <><span className="animate-spin">⟳</span> Analyzing…</> : '✨ Generate Improvements'}
                </button>
                {wizardError && <p className="text-[10px] text-red-400 mt-1">{wizardError}</p>}
                {!wizardLoading && wizardSuggestions.length === 0 && (
                  <p className="text-[10px] text-slate-600 mt-1 text-center">Click to analyze 👎 feedback and suggest prompt improvements</p>
                )}
              </div>

              {/* Step 3 — Apply */}
              {wizardSuggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-300">💡 Suggested Improvements</p>
                  {wizardSuggestions.map((s) => (
                    <div key={s.title} className={`rounded-lg border p-3 transition ${
                      pendingToggles[s.title] ? 'border-violet-500/40 bg-violet-500/10' : 'border-slate-700 bg-slate-800/40'
                    }`}>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => setPendingToggles(p => ({ ...p, [s.title]: !p[s.title] }))}
                          className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border transition ${
                            pendingToggles[s.title] ? 'bg-violet-500 border-violet-500' : 'bg-transparent border-slate-600'
                          }`}
                        >
                          {pendingToggles[s.title] && <span className="text-white text-[10px] leading-none flex items-center justify-center w-full h-full">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200">{s.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{s.description}</p>
                          <p className="text-[10px] text-slate-500 mt-1 italic">{s.instruction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      // Apply selected overrides, remove deselected
                      const current = { ...(settings.promptOverrides ?? {}) };
                      wizardSuggestions.forEach(s => {
                        if (pendingToggles[s.title]) {
                          current[s.title] = s.instruction;
                        } else {
                          delete current[s.title];
                        }
                      });
                      setSettings({ promptOverrides: current });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-500 font-semibold transition"
                  >
                    Apply Selected
                  </button>
                  {Object.keys(settings.promptOverrides ?? {}).length > 0 && (
                    <p className="text-[10px] text-violet-400/70 text-center">
                      {Object.keys(settings.promptOverrides ?? {}).length} override(s) active — injected into every DM response
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
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
