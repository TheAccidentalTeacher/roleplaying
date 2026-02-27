// ============================================================
// WORLD GENESIS API ROUTE — Phase 1: World + Character
// POST /api/world-genesis
// Generates a unique world using Claude Opus (full creativity)
// Returns JSON with world + character data
// Opening scene is generated separately via /api/world-genesis/opening-scene
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';
import { buildWorldGenesisPrompt } from '@/lib/prompts/world-genesis';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character } from '@/lib/types/character';

// Vercel Pro plan supports up to 300s — Opus needs ~60-90s for rich world gen
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
  try {
    const body = (await request.json()) as WorldGenesisRequest;
    const { character: charInput, playerSentence, userId } = body;

    // Validate minimum required fields
    if (!charInput?.name || !charInput?.race || !charInput?.class) {
      return NextResponse.json(
        { error: 'Character must have name, race, and class' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // ── Generate World via Claude Sonnet 4.6 ──
    const worldGenesisPrompt = buildWorldGenesisPrompt(charInput, playerSentence);

    let worldRecord: WorldRecord;
    try {
      worldRecord = await callClaudeJSON<WorldRecord>(
        'world_building',
        worldGenesisPrompt,
        `Generate a world for ${charInput.name}, a ${charInput.race} ${charInput.class}.${playerSentence ? ` Player says: "${playerSentence}"` : ''}`,
        { maxTokens: 8192 }
      );
    } catch (parseError) {
      // Retry once on JSON parse failure
      console.warn('[WorldGenesis] First attempt failed, retrying...', parseError);
      worldRecord = await callClaudeJSON<WorldRecord>(
        'world_building',
        worldGenesisPrompt,
        `Generate a world for ${charInput.name}, a ${charInput.race} ${charInput.class}. IMPORTANT: Output ONLY valid JSON, no other text.${playerSentence ? ` Player says: "${playerSentence}"` : ''}`,
        { maxTokens: 8192 }
      );
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

    // ── Return world + character data ──
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('[WorldGenesis] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate world. Please try again.' },
      { status: 500 }
    );
  }
}
