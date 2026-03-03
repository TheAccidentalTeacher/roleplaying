'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GenericJsonEditor from './GenericJsonEditor';
import type { CharacterCreationInput } from '@/lib/types/character';
import { useGameStore } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────

interface WorldGenLoadingProps {
  character: CharacterCreationInput;
  storyHook: string;
}

interface StepResult {
  stepId: number;
  stepName: string;
  label: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  data: Record<string, unknown> | null;
  editedData: Record<string, unknown> | null;
  isEdited: boolean;
  duration?: number;
}

// ─── Constants ────────────────────────────────────────────────────────

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
  'Companion bonds are forged in futures yet unwritten...',
  'Creatures stir in undiscovered lairs...',
  'Trade routes connect cities that never existed before...',
  'An origin story crystallizes from the aether...',
  'The final threads of destiny are woven...',
  'Your adventure is almost ready...',
];

const STEP_DEFS = [
  { id: 1,  name: 'world-concept',    label: 'Forging the world concept' },
  { id: 2,  name: 'magic-system',     label: 'Designing magic & power systems' },
  { id: 3,  name: 'history',          label: 'Writing deep history & legends' },
  { id: 4,  name: 'factions',         label: 'Building factions & politics' },
  { id: 5,  name: 'villain',          label: 'Crafting the villain' },
  { id: 6,  name: 'threat',           label: 'Shaping the main threat & prophecy' },
  { id: 7,  name: 'geography',        label: 'Mapping the world geography' },
  { id: 8,  name: 'settlements',      label: 'Detailing cities & settlements' },
  { id: 9,  name: 'companions',       label: 'Creating companion characters' },
  { id: 10, name: 'bestiary',         label: 'Populating the bestiary' },
  { id: 11, name: 'dungeons',         label: 'Designing dungeons & adventure sites' },
  { id: 12, name: 'economy-crafting', label: 'Building economy & crafting' },
  { id: 13, name: 'campaign-arc',     label: 'Mapping the campaign arc' },
  { id: 14, name: 'relationships',    label: 'Weaving relationships & origin' },
];

const TOTAL_STEPS = STEP_DEFS.length;

// ─── Helpers ──────────────────────────────────────────────────────────

function initSteps(): StepResult[] {
  return STEP_DEFS.map((s) => ({
    stepId: s.id,
    stepName: s.name,
    label: s.label,
    status: 'pending' as const,
    data: null,
    editedData: null,
    isEdited: false,
  }));
}

// ─── Component ────────────────────────────────────────────────────────

export default function WorldGenLoading({ character, storyHook }: WorldGenLoadingProps) {
  const router = useRouter();

  // Step tracking
  const [steps, setSteps] = useState<StepResult[]>(initSteps);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // World/char data (set after assemble)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [worldData, setWorldData] = useState<any>(null);

  // Opening scene
  const [showingOpeningScene, setShowingOpeningScene] = useState(false);
  const [streamedText, setStreamedText] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [flavorIndex, setFlavorIndex] = useState(0);

  // Regeneration
  const [regeneratingFromStep, setRegeneratingFromStep] = useState<number | null>(null);

  // Accumulated data shared across the generation loop
  const accumulatedRef = useRef<Record<string, unknown>>({});
  const hasStarted = useRef(false);
  const abortRef = useRef(false);

  // ─── Cycle flavor text ──────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFlavorIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // ─── Run ONE step via API (with retry) ──────────────────────────────
  const runSingleStep = useCallback(
    async (stepIndex: number, accumulated: Record<string, unknown>) => {
      const MAX_RETRIES = 2;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[WorldGen] Step ${stepIndex + 1} attempt ${attempt + 1}/${MAX_RETRIES + 1} — sending request...`);
          const startTime = performance.now();

          const res = await fetch('/api/world-genesis/step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character,
              playerSentence: storyHook || undefined,
              stepIndex,
              accumulated,
            }),
          });

          const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);

          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            let errMsg = `Step ${stepIndex + 1} failed (${res.status})`;
            let debugInfo = '';
            try {
              const errJson = JSON.parse(errText);
              errMsg = errJson.error || errMsg;
              // Log full server debug info to console
              debugInfo = JSON.stringify(errJson, null, 2);
            } catch { /* not JSON */ 
              debugInfo = errText;
            }
            console.error(`[WorldGen] Step ${stepIndex + 1} HTTP ${res.status} after ${elapsed}s`);
            console.error(`[WorldGen] Server response:`, debugInfo);
            throw new Error(errMsg);
          }

          const data = await res.json();
          console.log(`[WorldGen] Step ${stepIndex + 1} ✓ complete in ${elapsed}s — keys: ${data.data ? Object.keys(data.data).join(', ') : 'none'}`);
          return data;
        } catch (err) {
          console.warn(`[WorldGen] Step ${stepIndex + 1} attempt ${attempt + 1} failed:`, err);
          if (attempt === MAX_RETRIES) throw err;
          const delay = (attempt + 1) * 3000;
          console.log(`[WorldGen] Retrying step ${stepIndex + 1} in ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }

      throw new Error(`Step ${stepIndex + 1} failed after ${MAX_RETRIES + 1} attempts`);
    },
    [character, storyHook]
  );

  // ─── Assemble all steps into world + character via API ──────────────
  const assembleWorld = useCallback(
    async (accumulated: Record<string, unknown>) => {
      const res = await fetch('/api/world-genesis/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          userId: 'local-player',
          accumulated,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        let errMsg = `World assembly failed (${res.status})`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error || errMsg;
        } catch { /* not JSON */ }
        throw new Error(errMsg);
      }

      return res.json();
    },
    [character]
  );

  // ─── Main generation loop: one step at a time ──────────────────────
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    abortRef.current = false;

    const generate = async () => {
      try {
        setIsGenerating(true);
        const accumulated: Record<string, unknown> = {};
        console.log(`[WorldGen] ━━━ Starting world generation (${TOTAL_STEPS} steps) ━━━`);
        console.log(`[WorldGen] Character: ${character.name}, ${character.race} ${character.class}`);

        // Run each step sequentially — one HTTP call per step
        for (let i = 0; i < TOTAL_STEPS; i++) {
          if (abortRef.current) return;

          // Small gap between steps to prevent connection/rate issues
          if (i > 0) await new Promise((r) => setTimeout(r, 1500));

          console.log(`[WorldGen] ── Step ${i + 1}/${TOTAL_STEPS} ──`);
          console.log(`[WorldGen] Accumulated keys so far: ${Object.keys(accumulated).join(', ') || '(none)'}`);

          // Mark step as generating
          setSteps((prev) =>
            prev.map((s) =>
              s.stepId === i + 1 ? { ...s, status: 'generating' } : s
            )
          );

          const result = await runSingleStep(i, accumulated);

          // Merge result data into accumulated
          if (result.data) {
            Object.assign(accumulated, result.data);
            console.log(`[WorldGen] Step ${i + 1} merged ${Object.keys(result.data).length} keys into accumulated`);
          }

          // Mark step as complete with data
          setSteps((prev) =>
            prev.map((s) =>
              s.stepId === i + 1
                ? { ...s, status: 'complete', data: result.data, duration: result.duration }
                : s
            )
          );
        }

        if (abortRef.current) return;

        // Store accumulated for later use (regeneration, assemble)
        accumulatedRef.current = accumulated;
        console.log(`[WorldGen] ━━━ All ${TOTAL_STEPS} steps complete. Assembling world... ━━━`);
        console.log(`[WorldGen] Final accumulated keys: ${Object.keys(accumulated).join(', ')}`);

        // Assemble world + save to DB
        const finalData = await assembleWorld(accumulated);
        console.log(`[WorldGen] ✓ World assembled successfully!`);

        setWorldData(finalData);
        setIsGenerating(false);
        setIsComplete(true);

        // Store as draft (server already saved to DB)
        localStorage.setItem('rpg-active-world', JSON.stringify(finalData.world));
        localStorage.setItem('rpg-active-character', JSON.stringify(finalData.character));
        if (finalData.worldId) localStorage.setItem('rpg-world-id', finalData.worldId);
        if (finalData.characterId) localStorage.setItem('rpg-character-id', finalData.characterId);
      } catch (err) {
        if (abortRef.current) return;
        console.error('World generation error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsGenerating(false);
      }
    };

    generate();
  }, [retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Finalize & begin adventure ─────────────────────────────────────
  const handleFinalize = useCallback(async () => {
    if (!worldData) return;
    setIsFinalizing(true);

    try {
      // Merge any edits into the world record
      let mergedWorld = { ...worldData.world };
      for (const step of steps) {
        if (step.isEdited && step.editedData) {
          mergedWorld = { ...mergedWorld, ...step.editedData };
        }
      }

      // Save merged world to localStorage
      localStorage.setItem('rpg-active-world', JSON.stringify(mergedWorld));

      // ─── Stream opening scene ───────────────────────────────────
      setShowingOpeningScene(true);

      const sceneResponse = await fetch('/api/world-genesis/opening-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: mergedWorld,
          character: worldData.character,
          worldId: worldData.worldId,
          characterId: worldData.characterId,
        }),
      });

      if (!sceneResponse.ok) {
        const errText = await sceneResponse.text().catch(() => '');
        console.error(`[WorldGen] Opening scene failed (${sceneResponse.status}):`, errText);
        let errMsg = `Opening scene generation failed (${sceneResponse.status})`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error || errMsg;
          if (errJson.stack) console.error('[WorldGen] Server stack:', errJson.stack);
        } catch { /* not JSON */ }
        throw new Error(errMsg);
      }

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
        fullScene = await sceneResponse.text();
        setStreamedText(fullScene);
      }

      localStorage.setItem('rpg-opening-scene', fullScene);

      // Clear old game state so previous world's chat doesn't persist
      useGameStore.getState().resetGame();

      await new Promise((r) => setTimeout(r, 2000));
      router.push('/game');
    } catch (err) {
      console.error('Finalize error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start adventure');
      setIsFinalizing(false);
      setShowingOpeningScene(false);
    }
  }, [worldData, steps, router]);

  // ─── Regenerate from a specific step ────────────────────────────────
  const handleRegenerateFromStep = useCallback(
    async (fromStepId: number) => {
      setRegeneratingFromStep(fromStepId);
      setIsComplete(false);
      setIsGenerating(true);
      setWorldData(null);

      // Reset steps from fromStepId onward
      setSteps((prev) =>
        prev.map((s) =>
          s.stepId >= fromStepId
            ? { ...s, status: 'pending', data: null, editedData: null, isEdited: false }
            : s
        )
      );

      // Build accumulated data from steps before fromStepId (use edited data if available)
      const accumulated: Record<string, unknown> = {};
      for (const step of steps) {
        if (step.stepId >= fromStepId) break;
        const data = step.isEdited && step.editedData ? step.editedData : step.data;
        if (data) Object.assign(accumulated, data);
      }

      try {
        // Run steps from fromStepId onward, one at a time
        for (let i = fromStepId - 1; i < TOTAL_STEPS; i++) {
          // Small gap between steps
          if (i > fromStepId - 1) await new Promise((r) => setTimeout(r, 1500));

          // Mark step as generating
          setSteps((prev) =>
            prev.map((s) =>
              s.stepId === i + 1 ? { ...s, status: 'generating' } : s
            )
          );

          const result = await runSingleStep(i, accumulated);

          if (result.data) {
            Object.assign(accumulated, result.data);
          }

          setSteps((prev) =>
            prev.map((s) =>
              s.stepId === i + 1
                ? { ...s, status: 'complete', data: result.data, duration: result.duration }
                : s
            )
          );
        }

        accumulatedRef.current = accumulated;

        // Assemble world
        const finalData = await assembleWorld(accumulated);

        setWorldData(finalData);
        setIsGenerating(false);
        setIsComplete(true);

        localStorage.setItem('rpg-active-world', JSON.stringify(finalData.world));
        if (finalData.worldId) localStorage.setItem('rpg-world-id', finalData.worldId);
        if (finalData.characterId) localStorage.setItem('rpg-character-id', finalData.characterId);
      } catch (err) {
        console.error('Regeneration error:', err);
        setError(err instanceof Error ? err.message : 'Regeneration failed');
        setIsGenerating(false);
      } finally {
        setRegeneratingFromStep(null);
      }
    },
    [steps, runSingleStep, assembleWorld]
  );

  // ─── Update step data from editor ───────────────────────────────────
  const handleStepEdit = useCallback((stepId: number, newData: unknown) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.stepId === stepId
          ? {
              ...s,
              editedData: newData as Record<string, unknown>,
              isEdited: true,
            }
          : s
      )
    );
  }, []);

  // ─── Handle retry ───────────────────────────────────────────────────
  const handleRetry = () => {
    abortRef.current = true;
    setError(null);
    setSteps(initSteps());
    setWorldData(null);
    setIsComplete(false);
    setIsGenerating(true);
    setStreamedText('');
    setShowingOpeningScene(false);
    accumulatedRef.current = {};
    hasStarted.current = false;
    setRetryCount((prev) => prev + 1);
  };

  // ─── Toggle accordion ──────────────────────────────────────────────
  const toggleStep = (stepId: number) => {
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  // ─── Count completed steps ─────────────────────────────────────────
  const completedCount = steps.filter((s) => s.status === 'complete').length;
  const hasEdits = steps.some((s) => s.isEdited);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Error State
  // ═══════════════════════════════════════════════════════════════════
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
              Multiple failures. Check your API keys and ensure the server is running.
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

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Opening Scene (post-finalize)
  // ═══════════════════════════════════════════════════════════════════
  if (showingOpeningScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Animation */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-amber-500/30 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">✨</div>
          </div>

          <h2 className="text-2xl font-cinzel text-amber-400">Your World Awaits</h2>

          {streamedText && (
            <div className="text-left bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-amber-500/60 font-cinzel mb-2">Opening Scene</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {streamedText.slice(0, 600)}
                {streamedText.length > 600 && (
                  <span className="text-slate-500">... (continues in game)</span>
                )}
              </p>
            </div>
          )}

          <p className="text-slate-600 text-xs">
            Writing your unique opening scene with full creative depth...
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER: Main — Progress + Accordion
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────── */}
        <div className="text-center space-y-4">
          {/* Animated globe */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-amber-500/30 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute inset-4 rounded-full border border-sky-400/40 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">
              {isComplete ? '✨' : '🌍'}
            </div>
          </div>

          <h2 className="text-2xl font-cinzel text-amber-400">
            {isComplete ? 'Review Your World' : 'Creating Your World'}
          </h2>

          {!isComplete && isGenerating && (
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Step {Math.min(completedCount + 1, TOTAL_STEPS)} of {TOTAL_STEPS} — each step takes ~15-20 seconds
            </p>
          )}

          {isComplete && (
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Your world has been generated! Expand any section below to review and edit.
              {hasEdits && <span className="text-amber-400"> You have unsaved edits.</span>}
            </p>
          )}
        </div>

        {/* ── Progress bar ──────────────────────────── */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(completedCount / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* ── Step Accordion ────────────────────────── */}
        <div className="space-y-2">
          {steps.map((step) => {
            const isExpanded = expandedStep === step.stepId;
            const canExpand = step.status === 'complete';
            const isRegenerating = regeneratingFromStep !== null && step.stepId >= regeneratingFromStep;
            const displayData = step.isEdited && step.editedData ? step.editedData : step.data;

            return (
              <div
                key={step.stepId}
                className={`rounded-lg border transition-all duration-300 ${
                  isExpanded
                    ? 'border-sky-500/40 bg-slate-900/80'
                    : step.status === 'complete'
                    ? 'border-slate-700/50 bg-slate-900/40 hover:border-slate-600'
                    : 'border-slate-800/50 bg-slate-900/20'
                }`}
              >
                {/* Step Header */}
                <button
                  onClick={() => canExpand && toggleStep(step.stepId)}
                  disabled={!canExpand}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    canExpand ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {step.status === 'complete' ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
                        {step.isEdited ? (
                          <span className="text-amber-400 text-xs">✎</span>
                        ) : (
                          <span className="text-green-400 text-xs">✓</span>
                        )}
                      </div>
                    ) : step.status === 'generating' || isRegenerating ? (
                      <div className="w-5 h-5 rounded-full bg-sky-400/20 border border-sky-400 animate-pulse" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-700/50 border border-slate-700" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`flex-1 text-sm font-medium ${
                      step.status === 'complete'
                        ? step.isEdited
                          ? 'text-amber-300'
                          : 'text-slate-300'
                        : step.status === 'generating' || isRegenerating
                        ? 'text-sky-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                    {step.status === 'generating' && '...'}
                    {isRegenerating && step.status !== 'generating' && ' (queued)'}
                  </span>

                  {/* Duration + step number */}
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {step.duration ? `${step.duration}s · ` : ''}
                    {step.stepId}/{TOTAL_STEPS}
                  </span>

                  {/* Expand indicator */}
                  {canExpand && (
                    <span
                      className={`text-xs text-slate-500 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    >
                      ▶
                    </span>
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && displayData && (
                  <div className="px-4 pb-4 border-t border-slate-700/30">
                    {/* Quick summary bar */}
                    <div className="flex items-center justify-between py-2 mb-2">
                      <span className="text-xs text-slate-500">
                        {Object.keys(displayData).length} fields
                        {step.isEdited && (
                          <span className="text-amber-400 ml-2">• edited</span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        {step.isEdited && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSteps((prev) =>
                                prev.map((s) =>
                                  s.stepId === step.stepId
                                    ? { ...s, editedData: null, isEdited: false }
                                    : s
                                )
                              );
                            }}
                            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            Reset edits
                          </button>
                        )}
                        {isComplete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegenerateFromStep(step.stepId);
                            }}
                            disabled={regeneratingFromStep !== null}
                            className="text-xs text-sky-400 hover:text-sky-300 disabled:text-slate-600 transition-colors flex items-center gap-1"
                          >
                            🔄 Regenerate from here
                          </button>
                        )}
                      </div>
                    </div>

                    {/* JSON Editor */}
                    <GenericJsonEditor
                      data={displayData}
                      onChange={(updated) => handleStepEdit(step.stepId, updated)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Flavor text (while generating) ────────── */}
        {isGenerating && (
          <p className="text-center text-slate-500 italic text-sm h-6 transition-opacity duration-500">
            {FLAVOR_TEXTS[flavorIndex]}
          </p>
        )}

        {isGenerating && (
          <p className="text-center text-slate-600 text-xs">
            Building your homebrew campaign world one step at a time. Each step completes independently — no timeouts!
          </p>
        )}

        {/* ── Finalize Button (after completion) ────── */}
        {isComplete && !isFinalizing && (
          <div className="text-center space-y-3 pt-4">
            <button
              onClick={handleFinalize}
              disabled={regeneratingFromStep !== null}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-cinzel font-bold text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              ✨ Accept & Begin Adventure
            </button>
            <p className="text-slate-500 text-xs">
              {hasEdits
                ? 'Your edits will be applied before the adventure begins.'
                : 'Click to generate your opening scene and enter the world.'}
            </p>
          </div>
        )}

        {isFinalizing && !showingOpeningScene && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin text-amber-400 text-2xl mb-2">⚡</div>
            <p className="text-slate-400 text-sm">Preparing your adventure...</p>
          </div>
        )}
      </div>
    </div>
  );
}
