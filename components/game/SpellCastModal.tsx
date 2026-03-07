// ============================================================
// SPELL CAST MODAL
// In-combat (and out-of-combat) spell selection interface.
// Shows known spells and cantrips, lets player choose which
// spell to cast and at what slot level (with upcasting).
// Called from the "Cast Spell" combat action button.
// ============================================================
'use client';

import { useState, useMemo } from 'react';
import { X, Sparkles, Zap, Clock, Crosshair, Timer } from 'lucide-react';
import type { Spell, Spellcasting } from '@/lib/types/character';

interface SpellCastModalProps {
  spellcasting: Spellcasting;
  characterLevel: number;
  onCast: (spell: Spell, slotLevel: number) => void;
  onClose: () => void;
}

// ── School color mapping ─────────────────────────────────────
const SCHOOL_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Evocation:    { text: 'text-red-400',    bg: 'bg-red-900/15',    border: 'border-red-500/30' },
  Conjuration:  { text: 'text-purple-400', bg: 'bg-purple-900/15', border: 'border-purple-500/30' },
  Enchantment:  { text: 'text-pink-400',   bg: 'bg-pink-900/15',   border: 'border-pink-500/30' },
  Abjuration:   { text: 'text-blue-400',   bg: 'bg-blue-900/15',   border: 'border-blue-500/30' },
  Illusion:     { text: 'text-violet-400', bg: 'bg-violet-900/15', border: 'border-violet-500/30' },
  Necromancy:   { text: 'text-green-400',  bg: 'bg-green-900/15',  border: 'border-green-500/30' },
  Divination:   { text: 'text-cyan-400',   bg: 'bg-cyan-900/15',   border: 'border-cyan-500/30' },
  Transmutation:{ text: 'text-amber-400',  bg: 'bg-amber-900/15',  border: 'border-amber-500/30' },
};
const DEFAULT_SCHOOL = { text: 'text-slate-400', bg: 'bg-slate-800/40', border: 'border-slate-600/30' };

function getSchoolStyle(school: string) {
  return SCHOOL_COLORS[school] ?? DEFAULT_SCHOOL;
}

function ordinal(n: number) {
  if (n === 0) return 'Cantrip';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// ── Component ────────────────────────────────────────────────

export default function SpellCastModal({
  spellcasting,
  characterLevel,
  onCast,
  onClose,
}: SpellCastModalProps) {
  const allSpells = useMemo(() => [
    ...(spellcasting.cantrips ?? []).map(s => ({ ...s, level: 0 })),
    ...(spellcasting.knownSpells ?? []),
  ], [spellcasting]);

  const [selected, setSelected] = useState<Spell | null>(null);
  const [chosenSlotLevel, setChosenSlotLevel] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'cantrip' | 'leveled'>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

  // Available slot levels for upcasting a selected spell
  const availableSlotLevels = useMemo(() => {
    if (!selected || selected.level === 0) return [];
    return spellcasting.spellSlots
      .filter(s => s.level >= selected.level && s.remaining > 0)
      .sort((a, b) => a.level - b.level);
  }, [selected, spellcasting.spellSlots]);

  // Auto-set slot level when a spell is selected
  const handleSelectSpell = (spell: Spell) => {
    setSelected(spell);
    if (spell.level === 0) {
      setChosenSlotLevel(0); // cantrip — no slot needed
    } else {
      // Default to lowest available slot ≥ spell level
      const cheapest = spellcasting.spellSlots
        .filter(s => s.level >= spell.level && s.remaining > 0)
        .sort((a, b) => a.level - b.level)[0];
      setChosenSlotLevel(cheapest?.level ?? spell.level);
    }
  };

  // Filtered spells
  const filteredSpells = useMemo(() => {
    return allSpells.filter(sp => {
      if (filterTab === 'cantrip' && sp.level !== 0) return false;
      if (filterTab === 'leveled' && sp.level === 0) return false;
      if (schoolFilter !== 'all' && sp.school !== schoolFilter) return false;
      return true;
    });
  }, [allSpells, filterTab, schoolFilter]);

  const schools = useMemo(() => {
    return Array.from(new Set(allSpells.map(s => s.school))).sort();
  }, [allSpells]);

  // Slot summary used in the header
  const slotSummary = spellcasting.spellSlots
    .filter(s => s.total > 0)
    .map(s => `${ordinal(s.level)}: ${s.remaining}/${s.total}`)
    .join(' · ');

  const canCast = selected !== null && (
    selected.level === 0 ||
    (chosenSlotLevel !== null && availableSlotLevels.some(s => s.level === chosenSlotLevel))
  );

  const isUpcast = selected && selected.level > 0 && chosenSlotLevel !== null && chosenSlotLevel > selected.level;

  const handleConfirmCast = () => {
    if (!selected || !canCast) return;
    onCast(selected, chosenSlotLevel ?? 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:max-w-2xl bg-slate-900 border border-purple-500/30 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-purple-900/30 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-200" />
          </div>
          <div>
            <h2 className="font-cinzel text-purple-300 font-bold text-base leading-none">Cast a Spell</h2>
            {slotSummary && (
              <p className="text-[10px] text-slate-500 mt-0.5">{slotSummary}</p>
            )}
          </div>
          {spellcasting.activeConcentrationSpell && (
            <div className="ml-3 flex items-center gap-1.5 bg-amber-900/20 border border-amber-500/30 rounded-lg px-2 py-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-amber-400">Concentrating: {spellcasting.activeConcentrationSpell}</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/60 flex-shrink-0 overflow-x-auto">
          {(['all', 'cantrip', 'leveled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`text-[11px] px-2.5 py-1 rounded-md border flex-shrink-0 transition-colors ${
                filterTab === tab
                  ? 'border-purple-500/60 bg-purple-900/20 text-purple-300'
                  : 'border-slate-700/40 bg-slate-800/30 text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'cantrip' ? '✨ Cantrips' : '📿 Leveled'}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-700/50 flex-shrink-0" />
          <select
            value={schoolFilter}
            onChange={e => setSchoolFilter(e.target.value)}
            className="text-[11px] bg-slate-800/60 border border-slate-600/40 rounded-md px-2 py-1 text-slate-300 flex-shrink-0 focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All schools</option>
            {schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Spell list + detail pane */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Spell list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredSpells.length === 0 && (
              <p className="text-sm text-slate-600 italic text-center py-8">No spells match filter.</p>
            )}
            {filteredSpells.map(spell => {
              const sch = getSchoolStyle(spell.school);
              const isSelected = selected?.id === spell.id;
              const slotForSpell = spellcasting.spellSlots.find(s => s.level === spell.level);
              const hasSlot = spell.level === 0 || spellcasting.spellSlots.some(s => s.level >= spell.level && s.remaining > 0);

              return (
                <button
                  key={spell.id}
                  onClick={() => handleSelectSpell(spell)}
                  disabled={!hasSlot && spell.level !== 0}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                    isSelected
                      ? `${sch.bg} ${sch.border} ring-1 ring-purple-500/40`
                      : hasSlot || spell.level === 0
                      ? `bg-slate-800/40 border-slate-700/30 hover:${sch.bg} hover:${sch.border}`
                      : 'bg-slate-800/20 border-slate-800/30 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold text-sm ${isSelected ? sch.text : 'text-slate-200'} truncate`}>
                          {spell.name}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider font-bold ${sch.text} flex-shrink-0`}>
                          {spell.school}
                        </span>
                        {spell.isRitual && (
                          <span className="text-[9px] text-amber-400 bg-amber-900/20 border border-amber-500/30 rounded px-1">ritual</span>
                        )}
                        {spell.duration?.includes('concentration') && (
                          <span className="text-[9px] text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 rounded px-1">conc</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {spell.castingTime ?? '1 action'}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Crosshair className="w-2.5 h-2.5" /> {spell.range ?? 'Self'}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Timer className="w-2.5 h-2.5" /> {spell.duration ?? 'Instant'}
                        </span>
                        {spell.damage && (
                          <span className="text-[10px] text-red-400 font-mono font-bold">{spell.damage}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-xs font-bold ${sch.text}`}>
                        {spell.level === 0 ? 'Cantrip' : ordinal(spell.level)}
                      </div>
                      {spell.level > 0 && slotForSpell && (
                        <div className="text-[9px] text-slate-600 mt-0.5">
                          {slotForSpell.remaining}/{slotForSpell.total} slots
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && spell.description && (
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{spell.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cast bar */}
        <div className="flex-shrink-0 border-t border-slate-700/50 px-4 py-3 bg-slate-900/80">
          {selected ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <span className="text-sm text-slate-200 font-medium truncate">{selected.name}</span>
                {selected.level > 0 && availableSlotLevels.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-500">Slot level:</span>
                    {availableSlotLevels.map(slot => (
                      <button
                        key={slot.level}
                        onClick={() => setChosenSlotLevel(slot.level)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          chosenSlotLevel === slot.level
                            ? 'border-purple-500/60 bg-purple-900/20 text-purple-300'
                            : 'border-slate-600/40 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ordinal(slot.level)}
                        {slot.level > selected.level && <span className="text-amber-400 ml-0.5">↑</span>}
                        <span className="text-slate-600 ml-1">({slot.remaining} left)</span>
                      </button>
                    ))}
                  </div>
                )}
                {selected.level > 0 && availableSlotLevels.length === 0 && (
                  <p className="text-[11px] text-red-400 mt-0.5">No available spell slots.</p>
                )}
                {isUpcast && (
                  <p className="text-[10px] text-amber-400 mt-0.5">
                    ✨ Upcasting at {ordinal(chosenSlotLevel!)} level — enhanced effects
                  </p>
                )}
              </div>
              <button
                onClick={handleConfirmCast}
                disabled={!canCast}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                  canCast
                    ? 'border-purple-500/60 bg-purple-900/20 text-purple-300 hover:bg-purple-900/30 hover:border-purple-500/80'
                    : 'border-slate-700 bg-slate-800/40 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${canCast ? 'text-purple-400' : 'text-slate-600'}`} />
                {selected.level === 0 ? 'Cast Cantrip' : `Cast (${ordinal(chosenSlotLevel ?? selected.level)} slot)`}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-600 italic text-center">Select a spell to cast.</p>
          )}
        </div>
      </div>
    </div>
  );
}
