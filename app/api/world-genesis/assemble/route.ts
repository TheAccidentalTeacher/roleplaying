// ============================================================
// WORLD GENESIS — ASSEMBLE & SAVE
// POST /api/world-genesis/assemble
//
// Called AFTER all 14 steps are complete on the client.
// Takes the accumulated step data, builds WorldRecord + Character,
// saves both to Supabase, returns IDs + full objects.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createWorld, createCharacter } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { CharacterCreationInput, Character } from '@/lib/types/character';

export const maxDuration = 30;

interface AssembleRequest {
  character: CharacterCreationInput;
  userId: string;
  accumulated: Record<string, unknown>; // All 14 steps merged
}

function getHitDie(characterClass: string): number {
  const hitDice: Record<string, number> = {
    barbarian: 12,
    fighter: 10, paladin: 10, ranger: 10,
    bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
    sorcerer: 6, wizard: 6,
  };
  return hitDice[characterClass?.toLowerCase()] ?? 8;
}

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
    hitPoints: {
      current: 10 + conMod,
      max: 10 + conMod,
      temporary: 0,
      hitDice: { total: 1, remaining: 1, dieType: getHitDie(input.class) },
    },
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
    personality: input.personality ?? { traits: [], ideal: '', bond: '', flaw: '' },
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
  let body: AssembleRequest;
  try {
    body = (await request.json()) as AssembleRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { character: charInput, userId, accumulated } = body;

  if (!charInput?.name || !charInput?.race || !charInput?.class) {
    return NextResponse.json(
      { error: 'Character must have name, race, and class' },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  if (!accumulated || Object.keys(accumulated).length === 0) {
    return NextResponse.json({ error: 'No accumulated world data provided' }, { status: 400 });
  }

  try {
    console.log('[WorldGenesis:Assemble] Building world record...');

    const worldRecord = {
      ...accumulated,
      id: crypto.randomUUID(),
      characterId: 'pending',
      createdAt: new Date().toISOString(),
    } as WorldRecord;

    // Save World to Supabase
    let worldRow;
    try {
      worldRow = await createWorld(userId, worldRecord);
    } catch (dbError) {
      console.warn('[WorldGenesis:Assemble] Supabase world save failed, continuing local-only:', dbError);
      worldRow = { id: worldRecord.id };
    }

    // Build Character record
    const character = buildCharacterFromInput(charInput, worldRow.id);
    character.userId = userId;
    worldRecord.characterId = character.id;

    let characterRow;
    try {
      characterRow = await createCharacter(userId, worldRow.id, character);
    } catch (dbError) {
      console.warn('[WorldGenesis:Assemble] Character save failed, continuing local-only:', dbError);
      characterRow = { id: character.id };
    }

    console.log('[WorldGenesis:Assemble] Complete! World:', worldRecord.worldName);

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
        threat: worldRecord.mainThreat?.name,
        villain: worldRecord.villainCore?.name,
      },
    });
  } catch (error) {
    console.error('[WorldGenesis:Assemble] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assemble world' },
      { status: 500 }
    );
  }
}
