// ============================================================
// WORLD GENESIS API ROUTE — Multi-Step World Generation
// POST /api/world-genesis
//
// 3 focused Claude Opus calls, each ~4K tokens, each ~15-20s:
//   Step 1: World Foundation (name, magic, history, tone, genre)
//   Step 2: Conflict Engine (villain, threat, factions)
//   Step 3: Geography & Origin (regions, locations, origin scenario)
//
// TransformStream sends NDJSON progress between each step.
// Each call finishes well within any timeout. No streaming needed.
// ============================================================

import { NextRequest } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';
import { buildStep1Prompt, buildStep2Prompt, buildStep3Prompt } from '@/lib/prompts/world-genesis-steps';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character } from '@/lib/types/character';

// Each step is ~15-20s. 3 steps + DB saves = ~60-90s total.
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

  // Fire-and-forget: 3 Claude calls with progress updates between each
  (async () => {
    try {
      // ═══════════════════════════════════════════════════════
      // STEP 1: World Foundation (~4K tokens, ~15-20s)
      // ═══════════════════════════════════════════════════════
      console.log('[WorldGenesis] Step 1: World Foundation...');
      await send({ status: 'generating', phase: 0, step: 1, totalSteps: 3 });

      const step1Prompt = buildStep1Prompt(charInput, playerSentence);
      const step1 = await callClaudeJSON<Record<string, unknown>>(
        'world_building',
        step1Prompt.system,
        step1Prompt.user,
        { maxTokens: 5000 }
      );

      console.log('[WorldGenesis] Step 1 complete. World:', (step1 as Record<string, unknown>).worldName);
      await send({ status: 'generating', phase: 1, step: 1, done: true });

      // ═══════════════════════════════════════════════════════
      // STEP 2: Conflict Engine (~5K tokens, ~15-20s)
      // ═══════════════════════════════════════════════════════
      console.log('[WorldGenesis] Step 2: Conflicts & Villain...');
      await send({ status: 'generating', phase: 1, step: 2, totalSteps: 3 });

      // Pass Step 1 result as context for consistency
      const step1Summary = JSON.stringify(step1);
      const step2Prompt = buildStep2Prompt(charInput, step1Summary);
      const step2 = await callClaudeJSON<Record<string, unknown>>(
        'world_building',
        step2Prompt.system,
        step2Prompt.user,
        { maxTokens: 6000 }
      );

      console.log('[WorldGenesis] Step 2 complete. Villain:', (step2 as Record<string, unknown>).villainCore ? 'yes' : 'no');
      await send({ status: 'generating', phase: 2, step: 2, done: true });

      // ═══════════════════════════════════════════════════════
      // STEP 3: Geography & Origin (~5K tokens, ~15-20s)
      // ═══════════════════════════════════════════════════════
      console.log('[WorldGenesis] Step 3: Geography & Origin...');
      await send({ status: 'generating', phase: 2, step: 3, totalSteps: 3 });

      const step2Summary = JSON.stringify(step2);
      const step3Prompt = buildStep3Prompt(charInput, step1Summary, step2Summary);
      const step3 = await callClaudeJSON<Record<string, unknown>>(
        'world_building',
        step3Prompt.system,
        step3Prompt.user,
        { maxTokens: 6000 }
      );

      console.log('[WorldGenesis] Step 3 complete. Regions:', Array.isArray((step3 as Record<string, unknown>).geography) ? 'yes' : 'no');
      await send({ status: 'processing', phase: 3, step: 3, done: true });

      // ═══════════════════════════════════════════════════════
      // ASSEMBLE: Merge all 3 steps into a complete WorldRecord
      // ═══════════════════════════════════════════════════════
      console.log('[WorldGenesis] Assembling world record...');

      const worldRecord = {
        // Step 1: Foundation
        ...step1,
        // Step 2: Conflict
        ...step2,
        // Step 3: Geography & Origin
        ...step3,
        // Identity fields
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
