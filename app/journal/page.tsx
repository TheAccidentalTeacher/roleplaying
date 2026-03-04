'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import type { CampaignAct, StoryBeat, CampaignEnding } from '@/lib/types/world';

// ── Beat type icons ──────────────────────────────────────────
const BEAT_ICONS: Record<string, string> = {
  'quest': '📜',
  'revelation': '💡',
  'boss-fight': '⚔️',
  'choice': '🪄',
  'companion-event': '🤝',
  'world-event': '🌍',
  'dungeon': '🏰',
  'social': '💬',
};

// ── Ending tone colors ───────────────────────────────────────
const ENDING_COLORS: Record<string, string> = {
  'triumphant': 'border-emerald-700/50 bg-emerald-900/20 text-emerald-300',
  'bittersweet': 'border-amber-700/50 bg-amber-900/20 text-amber-300',
  'tragic': 'border-red-700/50 bg-red-900/20 text-red-300',
  'ambiguous': 'border-slate-600/50 bg-slate-800/30 text-slate-300',
  'pyrrhic': 'border-orange-700/50 bg-orange-900/20 text-orange-300',
};

const ENDING_TONE_ICONS: Record<string, string> = {
  'triumphant': '🏆',
  'bittersweet': '🌅',
  'tragic': '💀',
  'ambiguous': '🌫️',
  'pyrrhic': '🔥',
};

// ── Infer beat completion from quest titles ──────────────────
function isBeatComplete(beat: StoryBeat, completedQuestTitles: Set<string>): boolean {
  const beatNameLower = beat.name.toLowerCase();
  for (const title of completedQuestTitles) {
    if (title.toLowerCase().includes(beatNameLower) || beatNameLower.includes(title.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// ── Act progress summary ─────────────────────────────────────
function ActProgress({ completedCount, total }: { completedCount: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-slate-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function JournalPage() {
  const router = useRouter();
  const { activeWorld, activeQuests } = useGameStore();

  const [revealedTwists, setRevealedTwists] = useState<Set<number>>(new Set());
  const [expandedActs, setExpandedActs] = useState<Set<number>>(new Set([0])); // First act open by default

  const world = activeWorld;
  const arc = world?.storyArc;

  // Build set of completed quest titles for beat inference
  const completedQuestTitles = new Set(
    activeQuests.filter((q) => q.status === 'completed').map((q) => q.title)
  );

  if (!world) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-3xl">📖</p>
          <p className="text-slate-400">No active adventure found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm text-white"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!arc) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <p className="text-3xl">🌑</p>
          <p className="text-slate-300 font-cinzel">Campaign Arc Not Yet Generated</p>
          <p className="text-slate-500 text-sm">
            The world is still being written. Begin your adventure to unlock the full campaign arc.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Count total required beats and completed ones
  const totalRequiredBeats = arc.acts.flatMap((a) => a.keyBeats).filter((b) => !b.optional).length;
  const completedRequiredBeats = arc.acts
    .flatMap((a) => a.keyBeats)
    .filter((b) => !b.optional && isBeatComplete(b, completedQuestTitles))
    .length;
  const overallProgress = totalRequiredBeats
    ? Math.round((completedRequiredBeats / totalRequiredBeats) * 100)
    : 0;

  const toggleTwist = (i: number) => {
    setRevealedTwists((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAct = (actNumber: number) => {
    setExpandedActs((prev) => {
      const next = new Set(prev);
      next.has(actNumber) ? next.delete(actNumber) : next.add(actNumber);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded"
            aria-label="Go back"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-cinzel font-bold text-amber-300 text-base truncate">
              📖 Campaign Journal
            </h1>
            <p className="text-[10px] text-slate-500 truncate">{world.worldName}</p>
          </div>
          {/* Overall progress */}
          <div className="flex-shrink-0 text-right">
            <span className="text-xs text-amber-400 font-mono font-bold">{overallProgress}%</span>
            <p className="text-[10px] text-slate-600">complete</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-12 space-y-6 pt-4">

        {/* Arc Header */}
        <div className="bg-gradient-to-b from-amber-950/30 to-slate-900/20 border border-amber-800/30 rounded-xl p-4">
          <h2 className="font-cinzel text-xl font-bold text-amber-200 mb-1">{arc.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">{arc.logline}</p>
          {/* Tags */}
          {arc.recurringThemes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {arc.recurringThemes.map((theme, i) => (
                <span key={i} className="px-2 py-0.5 text-[11px] rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  {theme}
                </span>
              ))}
            </div>
          )}
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Story Progress</span>
              <span>{completedRequiredBeats}/{totalRequiredBeats} key beats</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Villain Tracker */}
        {world.villainCore && (
          <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-4">
            <h3 className="text-[10px] text-red-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>💀</span> Antagonist
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="font-cinzel font-bold text-red-200">
                  {world.villainCore.name}
                  {world.villainCore.title && (
                    <span className="text-red-400 font-sans font-normal text-sm"> · {world.villainCore.title}</span>
                  )}
                </p>
                <p className="text-sm text-slate-400 mt-1">{world.villainCore.motivation}</p>
              </div>
            </div>
            <div className="mt-3 bg-slate-900/40 rounded-lg px-3 py-2">
              <p className="text-[10px] text-red-400/70 font-semibold uppercase tracking-wider mb-0.5">Their Current Plan</p>
              <p className="text-sm text-slate-300">{world.villainCore.currentPlan}</p>
            </div>
          </div>
        )}

        {/* Campaign Acts */}
        <div>
          <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Story Acts</h3>
          <div className="space-y-3">
            {arc.acts.map((act: CampaignAct) => {
              const actBeats = act.keyBeats || [];
              const actCompleted = actBeats.filter((b) => isBeatComplete(b, completedQuestTitles)).length;
              const isExpanded = expandedActs.has(act.actNumber);
              const isStarted = actCompleted > 0;

              return (
                <div
                  key={act.actNumber}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isStarted
                      ? 'border-amber-700/40 bg-amber-950/10'
                      : 'border-slate-700/40 bg-slate-900/30'
                  }`}
                >
                  {/* Act header — clickable to expand */}
                  <button
                    onClick={() => toggleAct(act.actNumber)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Act number badge */}
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                      isStarted
                        ? 'bg-amber-800/40 border-amber-600 text-amber-200'
                        : 'bg-slate-800 border-slate-600 text-slate-400'
                    }`}>
                      {act.actNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-cinzel font-semibold text-sm truncate ${
                          isStarted ? 'text-amber-200' : 'text-slate-300'
                        }`}>
                          {act.title}
                        </span>
                        <span className="flex-shrink-0 text-[10px] text-slate-500 font-mono">
                          Lv {act.levelRange.min}–{act.levelRange.max}
                        </span>
                      </div>
                      <ActProgress completedCount={actCompleted} total={actBeats.length} />
                    </div>
                    <span className={`flex-shrink-0 text-slate-500 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      ›
                    </span>
                  </button>

                  {/* Act details — collapsible */}
                  {isExpanded && (
                    <div className="border-t border-slate-700/30 px-4 pb-4 pt-3 space-y-3">
                      {/* Summary */}
                      <p className="text-sm text-slate-400 leading-relaxed">{act.summary}</p>

                      {/* Villain phase */}
                      {act.villainPhase && (
                        <div className="flex items-start gap-2 bg-red-950/20 rounded-lg px-3 py-2 border border-red-900/20">
                          <span className="text-sm mt-0.5">💀</span>
                          <div>
                            <p className="text-[10px] text-red-400/70 font-semibold uppercase tracking-wider mb-0.5">Villain Is…</p>
                            <p className="text-sm text-slate-300">{act.villainPhase}</p>
                          </div>
                        </div>
                      )}

                      {/* New companions */}
                      {act.newCompanions && act.newCompanions.length > 0 && (
                        <div className="flex items-start gap-2 bg-amber-950/20 rounded-lg px-3 py-2 border border-amber-900/20">
                          <span className="text-sm mt-0.5">🤝</span>
                          <div>
                            <p className="text-[10px] text-amber-500/70 font-semibold uppercase tracking-wider mb-0.5">Companions Available</p>
                            <div className="flex flex-wrap gap-1.5">
                              {act.newCompanions.map((cId, i) => {
                                const cp = world.companions?.find((c) => c.id === cId);
                                return (
                                  <span key={i} className="text-xs text-amber-200 bg-amber-900/30 border border-amber-800/30 px-2 py-0.5 rounded-full">
                                    {cp?.name || cId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Story beats */}
                      {actBeats.length > 0 && (
                        <div>
                          <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Key Beats</h4>
                          <div className="space-y-2">
                            {actBeats.map((beat: StoryBeat, bi: number) => {
                              const done = isBeatComplete(beat, completedQuestTitles);
                              return (
                                <div
                                  key={bi}
                                  className={`flex items-start gap-2.5 rounded-lg px-3 py-2 border ${
                                    done
                                      ? 'bg-emerald-950/20 border-emerald-800/30'
                                      : beat.optional
                                      ? 'bg-slate-800/20 border-slate-700/20'
                                      : 'bg-slate-800/30 border-slate-700/30'
                                  }`}
                                >
                                  {/* Status marker */}
                                  <span className="flex-shrink-0 mt-0.5">
                                    {done ? '✅' : beat.optional ? '⭕' : '🔲'}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs">{BEAT_ICONS[beat.type] || '📍'}</span>
                                      <span className={`text-sm font-medium ${done ? 'text-emerald-300' : 'text-slate-200'}`}>
                                        {beat.name}
                                      </span>
                                      {beat.optional && (
                                        <span className="text-[10px] text-slate-600 px-1.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/30">
                                          optional
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">{beat.description}</p>
                                    {beat.location && (
                                      <p className="text-[10px] text-slate-600 mt-0.5">📍 {beat.location}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Twists — spoiler-blurred by default */}
        {arc.keyTwists && arc.keyTwists.length > 0 && (
          <div>
            <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
              🌀 Key Revelations
              <span className="text-slate-600 font-normal normal-case tracking-normal">(tap to reveal)</span>
            </h3>
            <div className="space-y-2">
              {arc.keyTwists.map((twist, i) => (
                <button
                  key={i}
                  onClick={() => toggleTwist(i)}
                  className="w-full text-left bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-3 transition-all hover:border-slate-600/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-400 text-sm">💡</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Revelation {i + 1}
                    </span>
                    {!revealedTwists.has(i) && (
                      <span className="text-[10px] text-slate-600 ml-auto">🔒 spoiler</span>
                    )}
                  </div>
                  {revealedTwists.has(i) ? (
                    <p className="text-sm text-slate-300 leading-relaxed">{twist}</p>
                  ) : (
                    <p className="text-sm text-transparent bg-slate-700/60 select-none rounded leading-relaxed blur-[5px] pointer-events-none">
                      {twist}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Possible Endings */}
        {arc.possibleEndings && arc.possibleEndings.length > 0 && (
          <div>
            <h3 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
              🎭 Possible Endings
            </h3>
            <div className="space-y-2">
              {arc.possibleEndings.map((ending: CampaignEnding, i) => (
                <div
                  key={i}
                  className={`border rounded-lg px-4 py-3 ${ENDING_COLORS[ending.tone] || ENDING_COLORS['ambiguous']}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{ENDING_TONE_ICONS[ending.tone] || '🎭'}</span>
                    <span className="font-cinzel font-semibold text-sm">{ending.name}</span>
                    <span className="text-[10px] opacity-60 ml-auto capitalize">{ending.tone}</span>
                  </div>
                  <p className="text-[12px] opacity-80 leading-relaxed">{ending.condition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Agency */}
        {arc.playerAgencyPoints && arc.playerAgencyPoints.length > 0 && (
          <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-4">
            <h3 className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🎲</span> Your Choices Matter
            </h3>
            <ul className="space-y-1.5">
              {arc.playerAgencyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 text-xs mt-0.5">›</span>
                  <span className="text-sm text-slate-400">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Back button */}
        <div className="pt-2">
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 text-sm transition-colors"
          >
            ← Return to Adventure
          </button>
        </div>
      </div>
    </div>
  );
}
