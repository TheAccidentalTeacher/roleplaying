'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import type { WorldRecord, VillainProfile, CompanionProfile, Faction, CampaignArc, StoryBeat } from '@/lib/types/world';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/Toast';

// ── Small helpers ─────────────────────────────────────────────

type Tab = 'villain' | 'arc' | 'companions' | 'factions' | 'tone';

function Field({ label, value, onChange, multiline = false, rows = 3, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; rows?: number; placeholder?: string;
}) {
  const base = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600 transition-colors resize-none placeholder:text-slate-600';
  return (
    <div>
      <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</label>
      {multiline
        ? <textarea className={base} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={base + ' h-9'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

function ListEditor({ label, items, onChange }: {
  label: string; items: string[]; onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 transition-colors"
              value={item}
              onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="px-2.5 py-1.5 text-slate-500 hover:text-red-400 bg-slate-800 border border-slate-700 rounded-lg transition-colors text-xs">
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ''])}
          className="text-[11px] text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

function SectionCard({ children, title, icon }: { children: React.ReactNode; title: string; icon: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
      <h3 className="font-cinzel font-semibold text-amber-300 text-sm flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────

export default function EditWorldPage() {
  const router = useRouter();
  const { activeWorld, activeWorldId, setActiveWorld } = useGameStore();
  const { toasts, addToast, removeToast } = useToast();

  const [draft, setDraft] = useState<WorldRecord | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('villain');
  const [saving, setSaving] = useState(false);
  const [expandedActs, setExpandedActs] = useState<Set<number>>(new Set([0]));
  const [expandedCompanions, setExpandedCompanions] = useState<Set<string>>(new Set());
  const [expandedFactions, setExpandedFactions] = useState<Set<string>>(new Set());

  // Load world into local draft
  useEffect(() => {
    if (activeWorld && !draft) {
      setDraft(JSON.parse(JSON.stringify(activeWorld))); // deep clone
    }
  }, [activeWorld, draft]);

  const patch = useCallback((updater: (d: WorldRecord) => void) => {
    setDraft(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as WorldRecord;
      updater(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const save = async () => {
    if (!draft || !activeWorldId || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/world/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId: activeWorldId, updates: draft }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      setActiveWorld(draft, activeWorldId);
      setIsDirty(false);
      addToast('✅ World saved — changes are live in your current session.', 'success');
    } catch (err) {
      addToast(`❌ Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const revert = () => {
    if (!activeWorld) return;
    setDraft(JSON.parse(JSON.stringify(activeWorld)));
    setIsDirty(false);
    addToast('↩️ All edits discarded.', 'info');
  };

  if (!activeWorld || !draft) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">No active world found.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'villain', label: 'Villain', icon: '💀' },
    { id: 'arc', label: 'Campaign', icon: '📜' },
    { id: 'companions', label: 'Companions', icon: '🤝' },
    { id: 'factions', label: 'Factions', icon: '⚔️' },
    { id: 'tone', label: 'Tone', icon: '🎭' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => {
            if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
            router.back();
          }}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded"
          >←</button>
          <div className="flex-1 min-w-0">
            <h1 className="font-cinzel font-bold text-amber-300 text-base">⚙️ World Bible Editor</h1>
            <p className="text-[10px] text-slate-500 truncate">{draft.worldName}</p>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button onClick={revert}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-lg transition-colors">
                Revert
              </button>
            )}
            <button
              onClick={save}
              disabled={!isDirty || saving}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isDirty && !saving
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
              }`}
            >
              {saving ? 'Saving…' : isDirty ? '💾 Save' : 'Saved ✓'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-amber-700/40 text-amber-200 border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12 pt-4 space-y-4">

        {/* ── Villain tab ── */}
        {activeTab === 'villain' && draft.villainCore && (
          <>
            <p className="text-xs text-slate-500">Edit the antagonist. These changes take effect immediately in the DM's next response.</p>
            <SectionCard title="Identity" icon="💀">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={draft.villainCore.name}
                  onChange={v => patch(d => { d.villainCore.name = v; })} />
                <Field label="Title" value={draft.villainCore.title || ''}
                  onChange={v => patch(d => { d.villainCore.title = v; })} />
              </div>
              <Field label="Archetype" value={draft.villainCore.archetype || ''}
                onChange={v => patch(d => { d.villainCore.archetype = v as VillainProfile['archetype']; })} />
            </SectionCard>

            <SectionCard title="Psychology" icon="🧠">
              <Field label="Motivation (why they do this)" multiline rows={2}
                value={draft.villainCore.motivation}
                onChange={v => patch(d => { d.villainCore.motivation = v; })} />
              <Field label="Their Genuine Argument (could they be right?)" multiline rows={2}
                value={draft.villainCore.genuineArgument}
                onChange={v => patch(d => { d.villainCore.genuineArgument = v; })} />
              <Field label="Something They Love (makes them human)" multiline rows={2}
                value={draft.villainCore.somethingTheyLove}
                onChange={v => patch(d => { d.villainCore.somethingTheyLove = v; })} />
              <Field label="Their History (how they became this)" multiline rows={3}
                value={draft.villainCore.history}
                onChange={v => patch(d => { d.villainCore.history = v; })} />
            </SectionCard>

            <SectionCard title="Current Situation" icon="⚡">
              <Field label="Their Plan Right Now" multiline rows={2}
                value={draft.villainCore.currentPlan}
                onChange={v => patch(d => { d.villainCore.currentPlan = v; })} />
              <ListEditor label="Weaknesses"
                items={draft.villainCore.weaknesses || []}
                onChange={v => patch(d => { d.villainCore.weaknesses = v; })} />
              <ListEditor label="Resources / Allies"
                items={draft.villainCore.resources || []}
                onChange={v => patch(d => { d.villainCore.resources = v; })} />
            </SectionCard>
          </>
        )}

        {/* ── Campaign Arc tab ── */}
        {activeTab === 'arc' && (
          <>
            <p className="text-xs text-slate-500">Edit story acts and beats. Beat completion is inferred from your quest log.</p>

            {!draft.storyArc ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-3xl mb-2">🌑</p>
                <p>Campaign arc not yet generated for this world.</p>
              </div>
            ) : (
              <>
                <SectionCard title="Arc Overview" icon="📜">
                  <Field label="Arc Title" value={draft.storyArc.title}
                    onChange={v => patch(d => { if (d.storyArc) d.storyArc.title = v; })} />
                  <Field label="Logline" multiline rows={2}
                    value={draft.storyArc.logline}
                    onChange={v => patch(d => { if (d.storyArc) d.storyArc.logline = v; })} />
                  <ListEditor label="Recurring Themes"
                    items={draft.storyArc.recurringThemes || []}
                    onChange={v => patch(d => { if (d.storyArc) d.storyArc.recurringThemes = v; })} />
                  <ListEditor label="Player Agency Points (where choices matter)"
                    items={draft.storyArc.playerAgencyPoints || []}
                    onChange={v => patch(d => { if (d.storyArc) d.storyArc.playerAgencyPoints = v; })} />
                </SectionCard>

                {/* Acts */}
                {draft.storyArc.acts.map((act, ai) => {
                  const isExpanded = expandedActs.has(ai);
                  return (
                    <div key={ai} className="border border-slate-700/50 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedActs(prev => {
                          const n = new Set(prev); n.has(ai) ? n.delete(ai) : n.add(ai); return n;
                        })}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 text-left transition-colors"
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-800/40 border border-amber-700 text-xs font-bold text-amber-200">
                          {act.actNumber}
                        </span>
                        <span className="flex-1 font-cinzel text-sm text-amber-200 truncate">{act.title}</span>
                        <span className="text-[10px] text-slate-500">Lv {act.levelRange.min}–{act.levelRange.max}</span>
                        <span className={`text-slate-500 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-700/30">
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Title" value={act.title}
                              onChange={v => patch(d => { if (d.storyArc) d.storyArc.acts[ai].title = v; })} />
                            <div className="grid grid-cols-2 gap-2">
                              <Field label="Min Level" value={String(act.levelRange.min)}
                                onChange={v => patch(d => { if (d.storyArc) d.storyArc.acts[ai].levelRange.min = Number(v) || 1; })} />
                              <Field label="Max Level" value={String(act.levelRange.max)}
                                onChange={v => patch(d => { if (d.storyArc) d.storyArc.acts[ai].levelRange.max = Number(v) || 1; })} />
                            </div>
                          </div>
                          <Field label="Summary" multiline rows={3}
                            value={act.summary}
                            onChange={v => patch(d => { if (d.storyArc) d.storyArc.acts[ai].summary = v; })} />
                          <Field label="Villain's Phase (what they're doing this act)" multiline rows={2}
                            value={act.villainPhase || ''}
                            onChange={v => patch(d => { if (d.storyArc) d.storyArc.acts[ai].villainPhase = v; })} />

                          {/* Beats */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Key Beats</label>
                              <button
                                onClick={() => patch(d => {
                                  if (d.storyArc) d.storyArc.acts[ai].keyBeats.push({
                                    name: 'New Beat', type: 'quest', description: '', location: '',
                                    involvedNPCs: [], consequences: '', optional: true,
                                  });
                                })}
                                className="text-[11px] text-amber-500 hover:text-amber-400 transition-colors"
                              >
                                + Add Beat
                              </button>
                            </div>
                            <div className="space-y-2">
                              {act.keyBeats.map((beat: StoryBeat, bi: number) => (
                                <div key={bi} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                                      value={beat.name}
                                      onChange={e => patch(d => { if (d.storyArc) d.storyArc.acts[ai].keyBeats[bi].name = e.target.value; })}
                                      placeholder="Beat name"
                                    />
                                    <select
                                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                                      value={beat.type}
                                      onChange={e => patch(d => { if (d.storyArc) d.storyArc.acts[ai].keyBeats[bi].type = e.target.value as StoryBeat['type']; })}
                                    >
                                      {['quest','revelation','boss-fight','choice','companion-event','world-event','dungeon','social'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </select>
                                    <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                                      <input type="checkbox" checked={beat.optional}
                                        onChange={e => patch(d => { if (d.storyArc) d.storyArc.acts[ai].keyBeats[bi].optional = e.target.checked; })}
                                        className="accent-amber-600"
                                      />
                                      Optional
                                    </label>
                                    <button
                                      onClick={() => patch(d => { if (d.storyArc) d.storyArc.acts[ai].keyBeats.splice(bi, 1); })}
                                      className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                                    >✕</button>
                                  </div>
                                  <textarea
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-600 resize-none"
                                    rows={2} value={beat.description}
                                    placeholder="Description…"
                                    onChange={e => patch(d => { if (d.storyArc) d.storyArc.acts[ai].keyBeats[bi].description = e.target.value; })}
                                  />
                                  <input
                                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-amber-600"
                                    value={beat.location}
                                    placeholder="Location…"
                                    onChange={e => patch(d => { if (d.storyArc) d.storyArc.acts[ai].keyBeats[bi].location = e.target.value; })}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Key Twists */}
                <SectionCard title="Key Revelations / Twists" icon="💡">
                  <ListEditor label="Twists (shown spoiler-blurred in Campaign Journal)"
                    items={draft.storyArc.keyTwists || []}
                    onChange={v => patch(d => { if (d.storyArc) d.storyArc.keyTwists = v; })} />
                </SectionCard>
              </>
            )}
          </>
        )}

        {/* ── Companions tab ── */}
        {activeTab === 'companions' && (
          <>
            <p className="text-xs text-slate-500">Edit personality and story hooks. These feed directly into the DM's portrayal when a companion speaks or acts.</p>
            {!draft.companions || draft.companions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-3xl mb-2">🤷</p>
                <p>No companions generated for this world.</p>
              </div>
            ) : (
              draft.companions.map((companion: CompanionProfile, ci: number) => {
                const isExpanded = expandedCompanions.has(companion.id);
                return (
                  <div key={companion.id} className="border border-slate-700/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCompanions(prev => {
                        const n = new Set(prev); n.has(companion.id) ? n.delete(companion.id) : n.add(companion.id); return n;
                      })}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 text-left transition-colors"
                    >
                      <span className="text-lg">{companion.role === 'healer' ? '💚' : companion.role === 'tank' ? '🛡️' : '⚔️'}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-cinzel text-sm text-amber-200 block truncate">{companion.name}</span>
                        <span className="text-[10px] text-slate-500">{companion.race} · {companion.class} · {companion.role}</span>
                      </div>
                      <span className={`text-slate-500 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-700/30">
                        <div className="grid grid-cols-3 gap-2">
                          <Field label="Name" value={companion.name}
                            onChange={v => patch(d => { if (d.companions) d.companions[ci].name = v; })} />
                          <Field label="Race" value={companion.race}
                            onChange={v => patch(d => { if (d.companions) d.companions[ci].race = v; })} />
                          <Field label="Class" value={companion.class}
                            onChange={v => patch(d => { if (d.companions) d.companions[ci].class = v; })} />
                        </div>
                        <Field label="Personality" multiline rows={2}
                          value={companion.personality}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].personality = v; })} />
                        <Field label="Backstory" multiline rows={3}
                          value={companion.backstory}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].backstory = v; })} />
                        <Field label="Motivation (what drives them)" multiline rows={2}
                          value={companion.motivation}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].motivation = v; })} />
                        <Field label="Personal Quest Hook" multiline rows={2}
                          value={companion.personalQuest}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].personalQuest = v; })} />
                        <Field label="Recruit Condition (what triggers them joining)"
                          value={companion.recruitCondition}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].recruitCondition = v; })} />
                        <Field label="Recruit Location"
                          value={companion.recruitLocation}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].recruitLocation = v; })} />
                        <Field label="Combat Style"
                          value={companion.combatStyle}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].combatStyle = v; })} />
                        <Field label="Signature Ability / Trait"
                          value={companion.signature}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].signature = v; })} />
                        <Field label="Dialogue Style (how they speak)"
                          value={companion.dialogueStyle}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].dialogueStyle = v; })} />
                        <Field label="Secret or Flaw (hidden depth)" multiline rows={2}
                          value={companion.secretOrFlaw}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].secretOrFlaw = v; })} />
                        <ListEditor label="Loyalty Triggers (what increases their loyalty)"
                          items={companion.loyaltyTriggers || []}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].loyaltyTriggers = v; })} />
                        <ListEditor label="Betrayal Triggers (what lowers loyalty)"
                          items={companion.betrayalTriggers || []}
                          onChange={v => patch(d => { if (d.companions) d.companions[ci].betrayalTriggers = v; })} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── Factions tab ── */}
        {activeTab === 'factions' && (
          <>
            <p className="text-xs text-slate-500">Adjust how factions view the player and edit their descriptions and goals.</p>
            {(!draft.factions || draft.factions.length === 0) ? (
              <div className="text-center py-12 text-slate-500">No factions found.</div>
            ) : (
              draft.factions.map((faction: Faction, fi: number) => {
                const isExpanded = expandedFactions.has(faction.id);
                const attitudeColor: Record<string, string> = {
                  'hostile': 'text-red-400', 'unfriendly': 'text-orange-400',
                  'neutral': 'text-slate-400', 'friendly': 'text-green-400', 'allied': 'text-emerald-400',
                };
                return (
                  <div key={faction.id} className="border border-slate-700/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFactions(prev => {
                        const n = new Set(prev); n.has(faction.id) ? n.delete(faction.id) : n.add(faction.id); return n;
                      })}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 text-left transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-cinzel text-sm text-amber-200 block truncate">{faction.name}</span>
                        <span className="text-[10px] text-slate-500">{faction.strength} · {faction.territory}</span>
                      </div>
                      <span className={`text-xs font-medium ${attitudeColor[faction.attitude_toward_player] || 'text-slate-400'}`}>
                        {faction.attitude_toward_player}
                      </span>
                      <span className={`text-slate-500 text-xs transition-transform ml-2 ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-3 space-y-3 border-t border-slate-700/30">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Name" value={faction.name}
                            onChange={v => patch(d => { d.factions[fi].name = v; })} />
                          <div>
                            <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Attitude Toward Player</label>
                            <select
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                              value={faction.attitude_toward_player}
                              onChange={e => patch(d => { d.factions[fi].attitude_toward_player = e.target.value as Faction['attitude_toward_player']; })}
                            >
                              {['hostile','unfriendly','neutral','friendly','allied'].map(a => (
                                <option key={a} value={a}>{a}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Strength</label>
                            <select
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                              value={faction.strength}
                              onChange={e => patch(d => { d.factions[fi].strength = e.target.value as Faction['strength']; })}
                            >
                              {['weak','moderate','strong','dominant'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <Field label="Territory" value={faction.territory}
                            onChange={v => patch(d => { d.factions[fi].territory = v; })} />
                        </div>
                        <Field label="Description" multiline rows={2}
                          value={faction.description}
                          onChange={v => patch(d => { d.factions[fi].description = v; })} />
                        <Field label="Leader" value={faction.leader}
                          onChange={v => patch(d => { d.factions[fi].leader = v; })} />
                        <ListEditor label="Goals"
                          items={faction.goals || []}
                          onChange={v => patch(d => { d.factions[fi].goals = v; })} />
                        <ListEditor label="Secrets"
                          items={faction.secrets || []}
                          onChange={v => patch(d => { d.factions[fi].secrets = v; })} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── Tone tab ── */}
        {activeTab === 'tone' && (
          <>
            <p className="text-xs text-slate-500">Adjust the world's narrative feel. These feed directly into how the DM writes every response.</p>
            <SectionCard title="World Identity" icon="🌍">
              <Field label="World Name" value={draft.worldName}
                onChange={v => patch(d => { d.worldName = v; })} />
              <Field label="Thematic Core (the central idea / question)" multiline rows={2}
                value={draft.thematicCore}
                onChange={v => patch(d => { d.thematicCore = v; })} />
              <Field label="Secret History (what the world hides from everyone)" multiline rows={3}
                value={draft.secretHistory}
                onChange={v => patch(d => { d.secretHistory = v; })} />
            </SectionCard>
            <SectionCard title="Magic System" icon="✨">
              {draft.magicSystem && (
                <>
                  <Field label="Name" value={draft.magicSystem.name}
                    onChange={v => patch(d => { if (d.magicSystem) d.magicSystem.name = v; })} />
                  <Field label="Description" multiline rows={2}
                    value={draft.magicSystem.description}
                    onChange={v => patch(d => { if (d.magicSystem) d.magicSystem.description = v; })} />
                  <Field label="Source (where magic comes from)"
                    value={draft.magicSystem.source}
                    onChange={v => patch(d => { if (d.magicSystem) d.magicSystem.source = v; })} />
                  <Field label="Cost (what using magic costs)"
                    value={draft.magicSystem.cost}
                    onChange={v => patch(d => { if (d.magicSystem) d.magicSystem.cost = v; })} />
                  <Field label="Social Attitude (how society views magic)" multiline rows={2}
                    value={draft.magicSystem.socialAttitude}
                    onChange={v => patch(d => { if (d.magicSystem) d.magicSystem.socialAttitude = v; })} />
                  <ListEditor label="Limitations"
                    items={draft.magicSystem.limitations || []}
                    onChange={v => patch(d => { if (d.magicSystem) d.magicSystem.limitations = v; })} />
                </>
              )}
            </SectionCard>
            <SectionCard title="Current World State" icon="⚔️">
              <ListEditor label="Current Conflicts"
                items={draft.currentConflicts || []}
                onChange={v => patch(d => { d.currentConflicts = v; })} />
              <ListEditor label="Power Vacuums"
                items={draft.powerVacuums || []}
                onChange={v => patch(d => { d.powerVacuums = v; })} />
            </SectionCard>
          </>
        )}

        {/* ── Save bar at bottom ── */}
        {isDirty && (
          <div className="sticky bottom-4 flex gap-3">
            <button onClick={revert}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm text-slate-300 transition-colors font-medium">
              ↩ Revert All
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm text-white font-semibold transition-all shadow-lg shadow-amber-900/40 active:scale-95">
              {saving ? 'Saving…' : '💾 Save Changes'}
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
