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

type HelpField =
  | 'name'
  | 'description'
  | 'storyHook'
  | 'backstory'
  | 'motivation'
  | 'fears'
  | 'mannerisms'
  | 'connections'
  | 'trait'
  | 'ideal'
  | 'bond'
  | 'flaw';

interface AIHelpButtonProps {
  field: HelpField;
  context: CharacterContext | Record<string, unknown>;
  onSelect: (text: string) => void;
  /** Optional label override for the button */
  label?: string;
  /** Compact mode for inline use */
  compact?: boolean;
}

export default function AIHelpButton({
  field,
  context,
  onSelect,
  label = '✨ AI Suggest',
  compact = false,
}: AIHelpButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setShowSuggestions(true);

    try {
      const res = await fetch('/api/character-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, context }),
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');

      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setError('No suggestions generated. Try again!');
      }
    } catch {
      setError('AI is unavailable. Try again later.');
    } finally {
      setLoading(false);
    }
  }, [field, context]);

  const handleSelect = (text: string) => {
    onSelect(text);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClose = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className={`
          inline-flex items-center gap-1 rounded-lg font-semibold transition-all
          bg-gradient-to-r from-purple-600/80 to-sky-600/80 hover:from-purple-500 hover:to-sky-500
          text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/40
          disabled:opacity-60 disabled:cursor-wait
          ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
        `}
      >
        {loading ? (
          <>
            <span className="animate-spin text-sm">⚡</span>
            <span>Thinking...</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 left-0 right-0 mt-2 min-w-[320px] max-w-lg">
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
              <span className="text-xs text-purple-300 font-semibold">
                {loading ? '⚡ Generating...' : '✨ AI Suggestions — click to use'}
              </span>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-white text-sm px-1"
              >
                ✕
              </button>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 bg-slate-700 rounded w-16" />
                    <div className="h-4 bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchSuggestions}
                  className="mt-2 text-xs text-sky-400 hover:text-sky-300 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Suggestion Cards */}
            {!loading && suggestions.length > 0 && (
              <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
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

                {/* Regenerate */}
                <div className="text-center pt-1 pb-1">
                  <button
                    onClick={fetchSuggestions}
                    className="text-xs text-slate-500 hover:text-purple-400 transition-colors"
                  >
                    🔄 Generate more
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
