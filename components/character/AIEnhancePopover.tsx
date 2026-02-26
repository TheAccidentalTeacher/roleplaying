'use client';

import { useState, useCallback } from 'react';

interface Suggestion {
  text: string;
  label: string;
}

interface CharacterContext {
  worldName?: string;
  worldGenre?: string;
  origin?: string;
  className?: string;
  classRole?: string;
  background?: string;
  abilityScores?: Record<string, number>;
  personality?: {
    traits: string[];
    ideal: string;
    bond: string;
    flaw: string;
  };
  name?: string;
  description?: string;
  backstory?: string;
  motivation?: string;
  storyHook?: string;
}

interface AIEnhancePopoverProps {
  /** The full text of the field being enhanced */
  fullText: string;
  /** Callback to replace the full text */
  onReplace: (newText: string) => void;
  /** Character context for AI */
  context: CharacterContext;
  /** The field name for context */
  fieldLabel: string;
}

const QUICK_DIRECTIONS = [
  { label: '🎭 More vivid', value: 'Make it more vivid and sensory — add sights, sounds, smells, textures' },
  { label: '📖 More detailed', value: 'Expand with more specific details, names, places, and events' },
  { label: '🌑 Darker tone', value: 'Make it grittier, darker, more dramatic — add conflict and tension' },
  { label: '✨ More heroic', value: 'Make it more epic and heroic — emphasize courage, destiny, and grandeur' },
  { label: '🤔 Add mystery', value: 'Add an unanswered question, a secret, or a hint of something hidden' },
  { label: '💔 Add emotion', value: 'Deepen the emotional content — add vulnerability, longing, or passion' },
];

export default function AIEnhancePopover({
  fullText,
  onReplace,
  context,
  fieldLabel,
}: AIEnhancePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [customDirection, setCustomDirection] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'direction' | 'results'>('direction');

  const handleEnhance = useCallback(async (direction: string) => {
    if (!fullText.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setStep('results');

    try {
      const res = await fetch('/api/character-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'enhance',
          context,
          selectedText: fullText,
          enhanceDirection: direction,
        }),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      if (data.suggestions?.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setError('No enhancements generated. Try a different direction.');
      }
    } catch {
      setError('AI is unavailable. Try again later.');
    } finally {
      setLoading(false);
    }
  }, [fullText, context]);

  const handleSelect = (text: string) => {
    onReplace(text);
    setIsOpen(false);
    setSuggestions([]);
    setStep('direction');
    setCustomDirection('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStep('direction');
    setSuggestions([]);
    setError(null);
    setCustomDirection('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('direction');
    setSuggestions([]);
    setError(null);
    setCustomDirection('');
  };

  if (!fullText.trim()) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all border border-transparent hover:border-purple-500/30"
      >
        ✨ AI Enhance
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 w-[380px]">
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
              <span className="text-xs text-purple-300 font-semibold">
                ✨ Enhance {fieldLabel}
              </span>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-white text-sm px-1"
              >
                ✕
              </button>
            </div>

            {/* Preview of current text */}
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-700">
              <p className="text-xs text-slate-400 italic line-clamp-2">
                &ldquo;{fullText}&rdquo;
              </p>
            </div>

            {/* Step 1: Choose direction */}
            {step === 'direction' && (
              <div className="p-3 space-y-3">
                <p className="text-xs text-slate-400">How should AI enhance this?</p>

                {/* Quick direction buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_DIRECTIONS.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => handleEnhance(d.value)}
                      className="text-left px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-xs text-slate-300 hover:text-white"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Custom direction */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDirection}
                    onChange={(e) => setCustomDirection(e.target.value)}
                    placeholder="Or type your own direction..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customDirection.trim()) {
                        handleEnhance(customDirection);
                      }
                    }}
                  />
                  <button
                    onClick={() => customDirection.trim() && handleEnhance(customDirection)}
                    disabled={!customDirection.trim()}
                    className="px-3 py-2 rounded-lg bg-purple-600 text-white text-xs hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Show results */}
            {step === 'results' && (
              <div className="p-3 space-y-2">
                {loading && (
                  <div className="space-y-3 py-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-3 bg-slate-700 rounded w-16" />
                        <div className="h-4 bg-slate-700 rounded w-full" />
                        <div className="h-4 bg-slate-700 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-center py-3">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                      onClick={() => setStep('direction')}
                      className="mt-2 text-xs text-sky-400 hover:text-sky-300 underline"
                    >
                      Try different direction
                    </button>
                  </div>
                )}

                {!loading && suggestions.length > 0 && (
                  <>
                    <div className="max-h-[350px] overflow-y-auto space-y-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelect(s.text)}
                          className="w-full text-left p-3 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                        >
                          <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
                            {s.label}
                          </span>
                          <p className="text-sm text-slate-300 mt-1 group-hover:text-white transition-colors leading-relaxed">
                            {s.text}
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between pt-1">
                      <button
                        onClick={() => setStep('direction')}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        ← Different direction
                      </button>
                      <button
                        onClick={handleClose}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Keep original
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
