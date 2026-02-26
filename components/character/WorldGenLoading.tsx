'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CharacterCreationInput } from '@/lib/types/character';

interface WorldGenLoadingProps {
  character: CharacterCreationInput;
  storyHook: string;
}

const FLAVOR_TEXTS = [
  'The cosmos trembles as a new world takes shape...',
  'Ancient mountains rise from the void...',
  'Rivers carve their paths through virgin earth...',
  'Kingdoms bloom where once there was nothing...',
  'Legends whisper of a hero yet to come...',
  'Dark forces stir in the shadows between worlds...',
  'The gods argue over the fate of your soul...',
  'A villain\'s ambition takes root in distant lands...',
  'Prophecies align across the stars...',
  'Taverns are stocked. Dungeons are trapped. Quests await...',
  'The world map unfurls across forgotten continents...',
  'Factions vie for power in halls you\'ve yet to see...',
  'An origin story crystallizes from the aether...',
  'The final threads of destiny are woven...',
  'Your adventure is almost ready...',
];

const PHASE_LABELS = [
  'Generating world lore and geography...',
  'Creating factions and political landscapes...',
  'Crafting the villain and their machinations...',
  'Designing your origin story...',
  'Writing the opening scene...',
];

export default function WorldGenLoading({ character, storyHook }: WorldGenLoadingProps) {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [flavorIndex, setFlavorIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hasStarted = useRef(false);

  // Cycle flavor text
  useEffect(() => {
    const interval = setInterval(() => {
      setFlavorIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Advance phases on timer for visual progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev < PHASE_LABELS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Call world genesis API
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const generateWorld = async () => {
      try {
        const response = await fetch('/api/world-genesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character,
            playerSentence: storyHook || undefined,
            userId: 'local-player',
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `World generation failed (${response.status})`);
        }

        const data = await response.json();

        // Store world and character data in localStorage for the game page
        localStorage.setItem('rpg-active-world', JSON.stringify(data.world));
        localStorage.setItem('rpg-active-character', JSON.stringify(data.character));
        localStorage.setItem('rpg-opening-scene', data.openingScene);
        if (data.worldId) localStorage.setItem('rpg-world-id', data.worldId);
        if (data.characterId) localStorage.setItem('rpg-character-id', data.characterId);

        // Brief delay to let the user see "Your adventure is almost ready"
        setPhase(PHASE_LABELS.length - 1);
        await new Promise((r) => setTimeout(r, 1500));

        router.push('/game');
      } catch (err) {
        console.error('World generation error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    generateWorld();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setError(null);
    setPhase(0);
    setRetryCount((prev) => prev + 1);
    hasStarted.current = false;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-cinzel text-red-400">World Generation Failed</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          )}
          {retryCount >= 3 && (
            <p className="text-red-400 text-xs">
              Multiple failures. Check your API keys in the .env file and ensure the server is running.
            </p>
          )}
          <button
            onClick={() => router.back()}
            className="block mx-auto text-sm text-slate-500 hover:text-slate-300 underline"
          >
            Go back to character creation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Animated glyph */}
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-amber-500/30 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-4 rounded-full border border-sky-400/40 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">
            🌍
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-cinzel text-amber-400">Creating Your World</h2>

        {/* Phase indicator */}
        <div className="space-y-3">
          {PHASE_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < phase
                    ? 'bg-green-500'
                    : i === phase
                    ? 'bg-sky-400 animate-pulse'
                    : 'bg-slate-700'
                }`}
              />
              <span
                className={`text-sm transition-colors ${
                  i < phase
                    ? 'text-slate-500 line-through'
                    : i === phase
                    ? 'text-sky-400'
                    : 'text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((phase + 1) / PHASE_LABELS.length) * 100}%` }}
          />
        </div>

        {/* Rotating flavor text */}
        <p className="text-slate-500 italic text-sm h-6 transition-opacity duration-500">
          {FLAVOR_TEXTS[flavorIndex]}
        </p>

        <p className="text-slate-600 text-xs">
          This may take 30–60 seconds. The AI is crafting an entire world just for you.
        </p>
      </div>
    </div>
  );
}
