// ============================================================
// WORLD GENESIS REGENERATION API ROUTE
// POST /api/world-genesis/regenerate
//
// Re-runs world generation from a specific step forward,
// using provided accumulated data for prior steps.
// Returns NDJSON stream like the main world-genesis route.
// ============================================================

import { NextRequest } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';
import { GENESIS_STEPS, TOTAL_STEPS } from '@/lib/prompts/world-genesis-steps';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character } from '@/lib/types/character';

export const maxDuration = 300;

interface RegenerateRequest {
  character: CharacterCreationInput;
  playerSentence?: string;
  userId: string;
  fromStep: number; // 1-based step ID to regenerate from
  priorData: Record<string, unknown>; // Accumulated results from steps 1..(fromStep-1)
}

/**
 * Get the hit die size for a class.
 */
function getHitDie(characterClass: string): number {
  const hitDice: Record<string, number> = {
    barbarian: 12,
    fighter: 10, paladin: 10, ranger: 10,
    bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
    sorcerer: 6, wizard: 6,
  };
  return hitDice[characterClass?.toLowerCase()] ?? 8;
}

/**
 * Build a full Character object from the creation input.
 */
function buildCharacterFromInput(input: CharacterCreationInput, worldId: string): Character {
  const scores = input.abilityScores ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const makeScore = (base: number) => ({
    base,
    racialBonus: 0,
    itemBonus: 0,
    score: base,
    modifier: Math.floor((base - 10) / 2),
  });

  const conMod = Math.floor((scores.con - 10) / 2);
  const dexMod = Math.floor((scores.dex - 10) / 2);
  const wisMod = Math.floor((scores.wis - 10) / 2);

  return {
    id: crypto.randomUUID(),
    worldId,
    userId: '',
    name: input.name,
    race: input.race,
    class: input.class,
    subclass: undefined,
    level: 1,
    xp: 0,
    xpToNextLevel: 300,
    abilityScores: {
      str: makeScore(scores.str),
      dex: makeScore(scores.dex),
      con: makeScore(scores.con),
      int: makeScore(scores.int),
      wis: makeScore(scores.wis),
      cha: makeScore(scores.cha),
    },
    hitPoints: { current: 10 + conMod, max: 10 + conMod, temporary: 0, hitDice: { total: 1, remaining: 1, dieType: getHitDie(input.class) } },
    armorClass: 10 + dexMod,
    initiative: dexMod,
    speed: 30,
    proficiencyBonus: 2,
    skills: [],
    savingThrows: [],
    passivePerception: 10 + wisMod,
    features: [],
    proficiencies: { armor: [], weapons: [], tools: [], languages: ['Common'] },
    equipment: {},
    inventory: [],
    gold: 15,
    carryWeight: 0,
    carryCapacity: scores.str * 15,
    encumbrance: 'light',
    conditions: [],
    exhaustionLevel: 0,
    deathSaves: { successes: 0, failures: 0 },
    isAlive: true,
    isRetired: false,
    personality: input.personality ?? {
      traits: [],
      ideal: '',
      bond: '',
      flaw: '',
    },
    background: input.background ?? 'adventurer',
    alignment: 'true-neutral',
    appearance: input.appearance ?? '',
    creationMode: input.creationMode ?? 'questionnaire',
    companionIds: [],
    currentLocation: 'Unknown',
    playTimeMinutes: 0,
    sessionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  let body: RegenerateRequest;
  try {
    body = (await request.json()) as RegenerateRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { character: charInput, playerSentence, userId, fromStep, priorData } = body;

  if (!charInput?.name || !charInput?.race || !charInput?.class) {
    return new Response(
      JSON.stringify({ error: 'Character must have name, race, and class' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!fromStep || fromStep < 1 || fromStep > TOTAL_STEPS) {
    return new Response(
      JSON.stringify({ error: `fromStep must be between 1 and ${TOTAL_STEPS}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const send = async (msg: Record<string, unknown>) => {
    try {
      await writer.write(encoder.encode(JSON.stringify(msg) + '\n'));
    } catch { /* writer closed */ }
  };

  (async () => {
    try {
      // Start with the user's provided prior data (steps 1..fromStep-1)
      let accumulated: Record<string, unknown> = { ...priorData };
      let progressCounter = fromStep - 1; // progress starts after prior steps

      /** Run a single step */
      const runStep = async (stepIndex: number): Promise<Record<string, unknown>> => {
        const step = GENESIS_STEPS[stepIndex];
        console.log(`[WorldGenesis:Regen] Step ${step.id}/${TOTAL_STEPS}: ${step.name}...`);
        await send({ status: 'generating', phase: progressCounter, step: step.id, totalSteps: TOTAL_STEPS, label: step.label });

        const prompt = step.buildPrompt(charInput, accumulated, playerSentence);
        const result = await callClaudeJSON<Record<string, unknown>>(
          'world_building',
          prompt.system,
          prompt.user,
          { maxTokens: prompt.maxTokens }
        );

        progressCounter++;
        console.log(`[WorldGenesis:Regen] Step ${step.id} complete.`);
        await send({ status: 'step_complete', phase: progressCounter, step: step.id, stepName: step.name, data: result });
        return result;
      };

      // Determine which steps to run (fromStep onward, 0-indexed)
      const startIndex = fromStep - 1;

      // Run remaining steps sequentially (simpler for regeneration — no parallelism needed since it's partial)
      for (let i = startIndex; i < TOTAL_STEPS; i++) {
        const result = await runStep(i);
        accumulated = { ...accumulated, ...result };
      }

      // Assemble world record
      console.log('[WorldGenesis:Regen] Assembling world record...');
      await send({ status: 'processing', phase: TOTAL_STEPS, label: 'Assembling the world...' });

      const worldRecord = {
        ...accumulated,
        id: crypto.randomUUID(),
        characterId: 'pending',
        createdAt: new Date().toISOString(),
      } as WorldRecord;

      // Save to Supabase
      let worldRow;
      try {
        worldRow = await createWorld(userId, worldRecord);
      } catch (dbError) {
        console.warn('[WorldGenesis:Regen] Supabase save failed, continuing local-only:', dbError);
        worldRow = { id: worldRecord.id };
      }

      const character = buildCharacterFromInput(charInput, worldRow.id);
      character.userId = userId;
      worldRecord.characterId = character.id;

      let characterRow;
      try {
        characterRow = await createCharacter(userId, worldRow.id, character);
      } catch (dbError) {
        console.warn('[WorldGenesis:Regen] Character save failed, continuing local-only:', dbError);
        characterRow = { id: character.id };
      }

      console.log('[WorldGenesis:Regen] Complete! World:', worldRecord.worldName);

      await send({
        status: 'complete',
        data: {
          worldId: worldRow.id,
          characterId: characterRow.id,
          world: worldRecord,
          character,
          worldSummary: {
            name: worldRecord.worldName,
            type: worldRecord.worldType,
            genre: worldRecord.primaryGenre,
            tone: worldRecord.narrativeTone,
            threat: worldRecord.mainThreat?.name,
            villain: worldRecord.villainCore?.name,
          },
        },
      });
    } catch (error) {
      console.error('[WorldGenesis:Regen] Error:', error);
      await send({
        error: error instanceof Error ? error.message : 'Failed to regenerate. Please try again.',
      });
    }

    try { await writer.close(); } catch { /* already closed */ }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
