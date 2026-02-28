import { NextRequest, NextResponse } from 'next/server';
import { callGPTJSON } from '@/lib/ai-orchestrator';
import {
  startCombat,
  rollInitiative,
  getAvailableActions,
} from '@/lib/engines/combat-engine';
import {
  buildEncounterPrompt,
  parseAIEncounter,
} from '@/lib/engines/encounter-generator';
import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type { TerrainType, TimeOfDay } from '@/lib/types/exploration';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      character,
      world,
      encounterDescription,
      difficulty = 'moderate',
      terrain = 'plains',
      timeOfDay = 'midday',
      regionName,
    } = body as {
      character: Character;
      world?: WorldRecord;
      encounterDescription?: string;
      difficulty?: 'easy' | 'moderate' | 'hard' | 'deadly';
      terrain?: TerrainType;
      timeOfDay?: TimeOfDay;
      regionName?: string;
    };

    if (!character) {
      return NextResponse.json({ error: 'Character required' }, { status: 400 });
    }

    // Build prompt using encounter-generator (leverages world bestiary + encounter tables)
    const prompt = world
      ? buildEncounterPrompt({
          world,
          character,
          terrain,
          timeOfDay,
          difficulty,
          context: encounterDescription,
          regionName,
        })
      : `Generate a ${difficulty} combat encounter for a Level ${character.level} ${character.race} ${character.class}.
${encounterDescription ? `Context: ${encounterDescription}` : ''}
Return JSON: { "encounterName": "...", "description": "...", "enemies": [...], "terrain": "${terrain}", "environmentalEffects": [], "lighting": "bright" }
Each enemy needs: id, name, type, challengeRating, hp ({current, max}), ac, speed, abilityScores ({str, dex, con, int, wis, cha}), attacks ([{name, attackBonus, damage, damageType}]), specialAbilities, reactions, tactics, resistances, immunities, vulnerabilities, conditionImmunities, savingThrows, xpValue, isAlive, description.`;

    const raw = await callGPTJSON<Record<string, unknown>>(
      'combat_resolution',
      prompt,
      'Generate combat encounter'
    );

    // Parse using encounter-generator's structured parser
    const parsed = parseAIEncounter(raw);

    // Initialize combat state
    let combatState = startCombat(character.id, parsed.enemies, {
      mode: 'detailed',
      terrain: [parsed.terrain],
      encounterName: parsed.encounterName,
    });

    combatState = rollInitiative(combatState, character);

    const availableActions = getAvailableActions(combatState, character);
    combatState = { ...combatState, availableActions };

    return NextResponse.json({
      combatState,
      narration: parsed.description,
      enemies: parsed.enemies,
      encounterName: parsed.encounterName,
      environmentalEffects: parsed.environmentalEffects,
      lighting: parsed.lighting,
    });
  } catch (error) {
    console.error('Combat start error:', error);
    return NextResponse.json(
      { error: 'Failed to start combat' },
      { status: 500 }
    );
  }
}
