import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON, streamClaude } from '@/lib/ai-orchestrator';
import {
  startCombat,
  rollInitiative,
  getAvailableActions,
} from '@/lib/engines/combat-engine';
import type { EnemyStatBlock } from '@/lib/types/encounter';
import type { Character } from '@/lib/types/character';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      character,
      encounterDescription,
      enemyCount = 2,
      difficulty = 'moderate',
      terrain = [],
      genre = 'high-fantasy',
    } = body as {
      character: Character;
      encounterDescription: string;
      enemyCount?: number;
      difficulty?: string;
      terrain?: string[];
      genre?: string;
    };

    if (!character) {
      return NextResponse.json({ error: 'Character required' }, { status: 400 });
    }

    // 1. Generate enemy stat blocks via AI
    const enemyPrompt = `Generate ${enemyCount} enemy stat blocks for a ${difficulty} difficulty combat encounter.
    
Context:
- Player is a Level ${character.level} ${character.race} ${character.class}
- Player AC: ${character.armorClass}, HP: ${character.hitPoints.current}/${character.hitPoints.max}
- Encounter: ${encounterDescription}
- Genre: ${genre}

Generate enemies appropriate for this encounter. Each enemy must have this EXACT JSON structure:
{
  "id": "unique-id",
  "name": "Enemy Name",
  "type": "humanoid",
  "level": 2,
  "hp": { "current": 20, "max": 20 },
  "ac": 13,
  "speed": "30 ft",
  "str": 14, "dex": 12, "con": 13, "int": 10, "wis": 11, "cha": 8,
  "attacks": [
    {
      "name": "Sword",
      "type": "melee",
      "toHit": 4,
      "damage": "1d8+2",
      "damageType": "slashing"
    }
  ],
  "specialAbilities": [],
  "reactions": [],
  "resistances": [],
  "vulnerabilities": [],
  "immunities": [],
  "conditionImmunities": [],
  "savingThrowBonuses": {},
  "tactics": {
    "preferredTargets": "closest enemy",
    "openingMove": "charge",
    "retreatCondition": "below 25% HP",
    "groupBehavior": "fight together",
    "specialTriggers": []
  },
  "morale": 70,
  "moraleBreakpoint": 25,
  "intelligenceLevel": "average",
  "threatContribution": 1,
  "xpValue": 100,
  "isAlive": true
}

Return a JSON object: { "enemies": [...], "encounterName": "...", "openingNarration": "..." }`;

    const generated = await callClaudeJSON<{
      enemies: EnemyStatBlock[];
      encounterName: string;
      openingNarration: string;
    }>('combat_resolution', enemyPrompt, 'Generate enemies');

    // 2. Initialize combat
    let combatState = startCombat(character.id, generated.enemies, {
      mode: 'detailed',
      terrain,
      encounterName: generated.encounterName,
    });

    // 3. Roll initiative
    combatState = rollInitiative(combatState, character);

    // 4. Get available actions
    const availableActions = getAvailableActions(combatState, character);
    combatState = { ...combatState, availableActions };

    return NextResponse.json({
      combatState,
      narration: generated.openingNarration,
      enemies: generated.enemies,
    });
  } catch (error) {
    console.error('Combat start error:', error);
    return NextResponse.json(
      { error: 'Failed to start combat' },
      { status: 500 }
    );
  }
}
