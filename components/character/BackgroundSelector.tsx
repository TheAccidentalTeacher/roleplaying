'use client';

import { useState } from 'react';
import type { BackgroundType } from '@/lib/types/character';
import { getBackgroundsForGenre } from '@/lib/data/genre-backgrounds';
import AIHelpButton from './AIHelpButton';

interface PersonalityTraitsInput {
  traits: string[];
  ideal: string;
  bond: string;
  flaw: string;
}

interface BackgroundSelectorProps {
  selectedBackground: BackgroundType | null;
  onBackgroundSelect: (bg: BackgroundType) => void;
  personality: PersonalityTraitsInput;
  onPersonalityChange: (p: PersonalityTraitsInput) => void;
  aiContext?: Record<string, unknown>;
  genre?: string;
}

export default function BackgroundSelector({
  selectedBackground,
  onBackgroundSelect,
  personality,
  onPersonalityChange,
  aiContext,
  genre,
}: BackgroundSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const backgrounds = getBackgroundsForGenre(genre);
  const selectedBg = backgrounds.find((b) => b.id === selectedBackground);

  const handleTraitToggle = (trait: string) => {
    const newTraits = personality.traits.includes(trait)
      ? personality.traits.filter((t) => t !== trait)
      : personality.traits.length < 3
      ? [...personality.traits, trait]
      : personality.traits;
    onPersonalityChange({ ...personality, traits: newTraits });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-cinzel text-amber-400 mb-2">Background & Personality</h2>
        <p className="text-slate-400 text-sm">
          Your background shapes who you were before adventure called.
        </p>
      </div>

      {/* Background Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => {
              onBackgroundSelect(bg.id);
              setShowSuggestions(true);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedBackground === bg.id
                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                : 'border-slate-700 bg-slate-900/50 hover:border-sky-500/50'
            }`}
          >
            <div className="text-xl mb-1">{bg.icon}</div>
            <div className="text-white font-semibold text-sm">{bg.name}</div>
            <div className="text-slate-400 text-xs mt-1 line-clamp-2">{bg.description}</div>
          </button>
        ))}
      </div>

      {/* Selected Background Details & Personality */}
      {selectedBg && (
        <div className="border border-slate-700 rounded-xl bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selectedBg.icon}</span>
            <div>
              <h3 className="text-lg font-cinzel text-amber-400">{selectedBg.name}</h3>
              <p className="text-slate-400 text-sm">
                <span className="text-sky-400">Skills:</span> {selectedBg.skillProficiencies} •{' '}
                <span className="text-sky-400">Feature:</span> {selectedBg.feature}
              </p>
            </div>
          </div>

          {/* Toggle suggestions vs freeform */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowSuggestions(true)}
              className={`px-3 py-1 text-sm rounded ${
                showSuggestions
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Choose from suggestions
            </button>
            <button
              onClick={() => setShowSuggestions(false)}
              className={`px-3 py-1 text-sm rounded ${
                !showSuggestions
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              Write your own
            </button>
          </div>

          {showSuggestions ? (
            <div className="space-y-4">
              {/* Personality Traits (pick up to 2-3) */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">
                  Personality Traits <span className="text-slate-500">(pick up to 3)</span>
                </label>
                <div className="space-y-1">
                  {selectedBg.suggestedTraits.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTraitToggle(t)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        personality.traits.includes(t)
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ideal */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">Ideal</label>
                <div className="flex flex-wrap gap-2">
                  {selectedBg.suggestedIdeals.map((ideal) => (
                    <button
                      key={ideal}
                      onClick={() => onPersonalityChange({ ...personality, ideal })}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        personality.ideal === ideal
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {ideal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bond */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">Bond</label>
                <div className="space-y-1">
                  {selectedBg.suggestedBonds.map((bond) => (
                    <button
                      key={bond}
                      onClick={() => onPersonalityChange({ ...personality, bond })}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        personality.bond === bond
                          ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {bond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flaw */}
              <div>
                <label className="text-sm text-slate-300 font-semibold block mb-2">Flaw</label>
                <div className="space-y-1">
                  {selectedBg.suggestedFlaws.map((flaw) => (
                    <button
                      key={flaw}
                      onClick={() => onPersonalityChange({ ...personality, flaw })}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        personality.flaw === flaw
                          ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                      }`}
                    >
                      {flaw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Freeform Personality Traits */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-slate-300 font-semibold">
                    Personality Traits
                  </label>
                  {aiContext && (
                    <AIHelpButton
                      field="trait"
                      context={aiContext}
                      onSelect={(text) =>
                        onPersonalityChange({
                          ...personality,
                          traits: [...personality.traits.filter(Boolean), text].slice(0, 3),
                        })
                      }
                      label="✨ Suggest Trait"
                      compact
                    />
                  )}
                </div>
                <textarea
                  value={personality.traits.join('\n')}
                  onChange={(e) =>
                    onPersonalityChange({
                      ...personality,
                      traits: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="Describe your character's personality (one trait per line)..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-slate-300 font-semibold">Ideal</label>
                  {aiContext && (
                    <AIHelpButton
                      field="ideal"
                      context={aiContext}
                      onSelect={(text) => onPersonalityChange({ ...personality, ideal: text })}
                      label="✨ Suggest"
                      compact
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={personality.ideal}
                  onChange={(e) => onPersonalityChange({ ...personality, ideal: e.target.value })}
                  placeholder="What principle guides you?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-slate-300 font-semibold">Bond</label>
                  {aiContext && (
                    <AIHelpButton
                      field="bond"
                      context={aiContext}
                      onSelect={(text) => onPersonalityChange({ ...personality, bond: text })}
                      label="✨ Suggest"
                      compact
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={personality.bond}
                  onChange={(e) => onPersonalityChange({ ...personality, bond: e.target.value })}
                  placeholder="Who or what do you care about most?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-slate-300 font-semibold">Flaw</label>
                  {aiContext && (
                    <AIHelpButton
                      field="flaw"
                      context={aiContext}
                      onSelect={(text) => onPersonalityChange({ ...personality, flaw: text })}
                      label="✨ Suggest"
                      compact
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={personality.flaw}
                  onChange={(e) => onPersonalityChange({ ...personality, flaw: e.target.value })}
                  placeholder="What is your greatest weakness?"
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
