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
  const [streamedText, setStreamedText] = useState('');
  const hasStarted = useRef(false);

  // Cycle flavor text
  useEffect(() => {
    const interval = setInterval(() => {
      setFlavorIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // World generation (phases driven by server progress, not timers)
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const generateWorld = async () => {
      try {
        // ═══ PHASE 1: Generate World + Character (Opus, streaming NDJSON) ═══
        const worldResponse = await fetch('/api/world-genesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character,
            playerSentence: storyHook || undefined,
            userId: 'local-player',
          }),
        });

        if (!worldResponse.ok || !worldResponse.body) {
          const errText = await worldResponse.text().catch(() => '');
          let errMsg = `World generation failed (${worldResponse.status})`;
          try { const errJson = JSON.parse(errText); errMsg = errJson.error || errMsg; } catch {}
          throw new Error(errMsg);
        }

        // Read NDJSON stream — Claude tokens keep connection alive,
        // server sends progress updates every 3s + final complete message
        const worldReader = worldResponse.body.getReader();
        const worldDecoder = new TextDecoder();
        let ndjsonBuffer = '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let worldData: any = null;

        const processLine = (line: string) => {
          if (!line.trim()) return;
          try {
            const msg = JSON.parse(line);
            if (msg.error) throw new Error(msg.error);
            if (msg.phase !== undefined) setPhase(msg.phase);
            if (msg.status === 'complete' && msg.data) {
              worldData = msg.data;
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) return;
            throw parseErr;
          }
        };

        while (true) {
          const { done, value } = await worldReader.read();
          if (done) break;

          ndjsonBuffer += worldDecoder.decode(value, { stream: true });
          const lines = ndjsonBuffer.split('\n');
          ndjsonBuffer = lines.pop() || '';

          for (const line of lines) {
            processLine(line);
          }
        }

        // Flush remaining buffer
        ndjsonBuffer += worldDecoder.decode();
        if (ndjsonBuffer.trim()) {
          processLine(ndjsonBuffer);
        }

        if (!worldData) throw new Error('World generation completed without data');

        // Store world and character data
        localStorage.setItem('rpg-active-world', JSON.stringify(worldData.world));
        localStorage.setItem('rpg-active-character', JSON.stringify(worldData.character));
        if (worldData.worldId) localStorage.setItem('rpg-world-id', worldData.worldId);
        if (worldData.characterId) localStorage.setItem('rpg-character-id', worldData.characterId);

        const data = worldData;

        // ═══ PHASE 2: Stream Opening Scene (Opus) ═══
        setPhase(4); // "Writing the opening scene..."

        const sceneResponse = await fetch('/api/world-genesis/opening-scene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            world: data.world,
            character: data.character,
            worldId: data.worldId,
            characterId: data.characterId,
          }),
        });

        if (!sceneResponse.ok) {
          throw new Error(`Opening scene generation failed (${sceneResponse.status})`);
        }

        // Stream the opening scene text
        const reader = sceneResponse.body?.getReader();
        const decoder = new TextDecoder();
        let fullScene = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullScene += chunk;
            setStreamedText(fullScene);
          }
        } else {
          // Fallback: non-streaming
          fullScene = await sceneResponse.text();
          setStreamedText(fullScene);
        }

        localStorage.setItem('rpg-opening-scene', fullScene);

        // Brief delay to let the user read the streamed preview
        await new Promise((r) => setTimeout(r, 2000));

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
            {phase >= 4 ? '✨' : '🌍'}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-cinzel text-amber-400">
          {phase >= 4 ? 'Your World Awaits' : 'Creating Your World'}
        </h2>

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

        {/* Streamed opening scene preview (phase 4+) */}
        {phase >= 4 && streamedText && (
          <div className="text-left bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 max-h-48 overflow-y-auto">
            <p className="text-xs text-amber-500/60 font-cinzel mb-2">Opening Scene Preview</p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {streamedText.slice(0, 400)}
              {streamedText.length > 400 && (
                <span className="text-slate-500">... (continues in game)</span>
              )}
            </p>
          </div>
        )}

        {/* Rotating flavor text (only show when not streaming) */}
        {phase < 4 && (
          <p className="text-slate-500 italic text-sm h-6 transition-opacity duration-500">
            {FLAVOR_TEXTS[flavorIndex]}
          </p>
        )}

        <p className="text-slate-600 text-xs">
          {phase >= 4
            ? 'The AI is writing your unique opening scene with full creative depth...'
            : 'This may take up to a minute. The AI is crafting an entire world just for you.'}
        </p>
      </div>
    </div>
  );
}
