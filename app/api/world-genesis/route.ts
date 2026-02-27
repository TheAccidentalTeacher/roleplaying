// ============================================================
// WORLD GENESIS API ROUTE — Phase 1: World + Character
// POST /api/world-genesis
// Generates a unique world using Claude Opus (full creativity)
// Uses STREAMING Claude call — tokens flow every ~100ms keeping the
// connection alive indefinitely. Progress sent as NDJSON lines.
// Opening scene is generated separately via /api/world-genesis/opening-scene
// ============================================================

import { NextRequest } from 'next/server';
import { createClaudeStream } from '@/lib/ai-orchestrator';
import { buildWorldGenesisPrompt } from '@/lib/prompts/world-genesis';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character } from '@/lib/types/character';

// Safety net — streaming keeps connection alive well beyond this
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

  // Build the prompt
  const worldGenesisPrompt = buildWorldGenesisPrompt(charInput, playerSentence);
  const fullSystemPrompt = `${worldGenesisPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Just raw JSON.`;
  const userMessage = `Generate a world for ${charInput.name}, a ${charInput.race} ${charInput.class}.${playerSentence ? ` Player says: "${playerSentence}"` : ''}`;

  // Return a streaming NDJSON response
  // Claude tokens flow every ~100ms, and we send progress updates every 3s
  // This keeps the connection alive indefinitely — no timeout possible
  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'));
        } catch {
          // Controller closed — safe to ignore
        }
      };

      try {
        // ── Immediate first byte ──
        send({ status: 'started', phase: 0 });

        // ── Stream world JSON from Opus ──
        // createClaudeStream returns a raw Anthropic MessageStream (async iterable)
        // We iterate events directly — NO nested ReadableStream
        const claudeStream = createClaudeStream(
          'world_building',
          fullSystemPrompt,
          [{ role: 'user', content: userMessage }],
          { maxTokens: 16384 }
        );

        let fullText = '';
        let lastProgressTime = Date.now();

        for await (const event of claudeStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text;

            // Send progress update every 3 seconds (keeps connection alive)
            if (Date.now() - lastProgressTime > 3000) {
              const estimatedPhase = Math.min(Math.floor(fullText.length / 4000), 3);
              send({ status: 'generating', phase: estimatedPhase, chars: fullText.length });
              lastProgressTime = Date.now();
            }
          }
        }

        send({ status: 'processing', phase: 3 });

        // ── Parse the accumulated JSON ──
        const cleaned = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        let worldRecord: WorldRecord;
        try {
          worldRecord = JSON.parse(cleaned) as WorldRecord;
        } catch (parseError) {
          console.error('[WorldGenesis] JSON parse failed. Raw text length:', fullText.length);
          console.error('[WorldGenesis] First 500 chars:', fullText.slice(0, 500));
          send({ error: 'World generation produced invalid JSON. Please try again.' });
          controller.close();
          return;
        }

        // Ensure required fields
        worldRecord.id = worldRecord.id || crypto.randomUUID();
        worldRecord.createdAt = worldRecord.createdAt || new Date().toISOString();

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

        // ── Send completed world + character data ──
        send({
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
              threat: worldRecord.mainThreat.name,
              villain: worldRecord.villainCore.name,
            },
          },
        });
      } catch (error) {
        console.error('[WorldGenesis] Error:', error);
        send({ error: error instanceof Error ? error.message : 'Failed to generate world. Please try again.' });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
