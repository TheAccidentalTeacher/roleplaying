'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { uiState, setSettings } = useGameStore();
  const settings = uiState.settings;

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
