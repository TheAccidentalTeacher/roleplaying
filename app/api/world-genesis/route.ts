// ============================================================
// WORLD GENESIS API ROUTE — 14-Step Homebrew Campaign Factory
// POST /api/world-genesis
//
// 14 focused Claude Opus calls, each ~3-6K tokens, each ~10-20s:
// Builds a full homebrew campaign world piece by piece.
// TransformStream sends NDJSON progress between each step.
// ============================================================

import { NextRequest } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';
import { GENESIS_STEPS, TOTAL_STEPS } from '@/lib/prompts/world-genesis-steps';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character } from '@/lib/types/character';

// 14 steps × ~15s each + DB saves ≈ 3.5-4 min. Vercel Pro allows up to 300s.
export const maxDuration = 300;

interface WorldGenesisRequest {
  character: CharacterCreationInput;
  playerSentence?: string;
  userId: string;
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
    hitPoints: { current: 10 + conMod, max: 10 + conMod, temporary: 0, hitDice: { total: 1, remaining: 1, dieType: 8 } },
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

  // Parse and validate the request body BEFORE starting the stream
  let body: WorldGenesisRequest;
  try {
    body = (await request.json()) as WorldGenesisRequest;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { character: charInput, playerSentence, userId } = body;

  if (!charInput?.name || !charInput?.race || !charInput?.class) {
    return new Response(
      JSON.stringify({ error: 'Character must have name, race, and class' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // TransformStream: writer.write() data is IMMEDIATELY readable on the other side.
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  const send = async (msg: Record<string, unknown>) => {
    try {
      await writer.write(encoder.encode(JSON.stringify(msg) + '\n'));
    } catch {
      // Writer closed
    }
  };

  // Fire-and-forget: 14 Claude calls with progress updates between each
  (async () => {
    try {
      // ═══════════════════════════════════════════════════════
      // GENERIC STEP EXECUTOR — loops through all 14 steps
      // Each step gets the accumulated prior results as context
      // ═══════════════════════════════════════════════════════
      let accumulated: Record<string, unknown> = {};

      for (let i = 0; i < GENESIS_STEPS.length; i++) {
        const step = GENESIS_STEPS[i];
        console.log(`[WorldGenesis] Step ${step.id}/${TOTAL_STEPS}: ${step.name}...`);
        await send({ status: 'generating', phase: i, step: step.id, totalSteps: TOTAL_STEPS, label: step.label });

        // Build the prompt — each step extracts its own targeted context from accumulated
        const prompt = step.buildPrompt(charInput, accumulated, playerSentence);

        const result = await callClaudeJSON<Record<string, unknown>>(
          'world_building',
          prompt.system,
          prompt.user,
          { maxTokens: prompt.maxTokens }
        );

        // Merge this step's result into accumulated context
        accumulated = { ...accumulated, ...result };
        console.log(`[WorldGenesis] Step ${step.id} complete.`);
        await send({ status: 'generating', phase: i + 1, step: step.id, done: true });
      }

      // ═══════════════════════════════════════════════════════
      // ASSEMBLE: Merge all steps into a complete WorldRecord
      // ═══════════════════════════════════════════════════════
      console.log('[WorldGenesis] Assembling world record...');
      await send({ status: 'processing', phase: TOTAL_STEPS, label: 'Assembling the world...' });

      const worldRecord = {
        ...accumulated,
        id: crypto.randomUUID(),
        characterId: 'pending',
        createdAt: new Date().toISOString(),
      } as WorldRecord;

      // ── Save World to Supabase ──
      let worldRow;
      try {
        worldRow = await createWorld(userId, worldRecord);
      } catch (dbError) {
        console.warn('[WorldGenesis] Supabase save failed, continuing local-only:', dbError);
        worldRow = { id: worldRecord.id };
      }

      // ── Build Character record ──
      const character = buildCharacterFromInput(charInput, worldRow.id);
      character.userId = userId;
      worldRecord.characterId = character.id;

      let characterRow;
      try {
        characterRow = await createCharacter(userId, worldRow.id, character);
      } catch (dbError) {
        console.warn('[WorldGenesis] Character save failed, continuing local-only:', dbError);
        characterRow = { id: character.id };
      }

      console.log('[WorldGenesis] Complete! World:', worldRecord.worldName);

      // ── Send completed world + character data ──
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
      console.error('[WorldGenesis] Error:', error);
      await send({
        error: error instanceof Error ? error.message : 'Failed to generate world. Please try again.',
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
