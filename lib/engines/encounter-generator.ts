// ============================================================
// ENCOUNTER GENERATOR
// Generates encounters for exploration, travel, and combat.
// Reference: ENCOUNTER-SYSTEM.md
// ============================================================

import type { EnemyStatBlock, EncounterSeed, BestiaryEntry } from '@/lib/types/encounter';
import type { Character } from '@/lib/types/character';
import type { WorldRecord, Genre } from '@/lib/types/world';
import type { TerrainType, TimeOfDay, WeatherCondition } from '@/lib/types/exploration';
import { d20, d6, d4 } from '@/lib/utils/dice';

// ---- Encounter chance by terrain ----

const ENCOUNTER_CHANCE: Record<string, number> = {
  plains: 0.15,
  forest: 0.25,
  hills: 0.20,
  mountains: 0.30,
  desert: 0.20,
  swamp: 0.35,
  tundra: 0.15,
  jungle: 0.35,
  coast: 0.15,
  ocean: 0.10,
  underground: 0.40,
  urban: 0.10,
  ruins: 0.45,
  volcanic: 0.30,
  arctic: 0.20,
};

// ---- Time of day modifiers ----

const TIME_MODIFIERS: Partial<Record<TimeOfDay, number>> = {
  dawn: -0.05,
  morning: -0.05,
  midday: -0.10,
  afternoon: 0,
  dusk: 0.05,
  evening: 0.10,
  night: 0.15,
  midnight: 0.20,
};

// ---- Check if a random encounter should occur ----

export function rollForEncounter(
  terrain: TerrainType,
  timeOfDay: TimeOfDay,
  weather: WeatherCondition,
  partyLevel: number
): boolean {
  let chance = ENCOUNTER_CHANCE[terrain] || 0.20;

  // Time modifier
  chance += TIME_MODIFIERS[timeOfDay] || 0;

  // Weather modifier — bad weather reduces encounters
  if (['heavy-rain', 'thunderstorm', 'blizzard', 'sandstorm'].includes(weather)) {
    chance -= 0.10;
  }

  // Low level = slightly fewer encounters
  if (partyLevel <= 2) chance -= 0.05;

  return Math.random() < Math.max(0.05, Math.min(0.5, chance));
}

// ---- Build encounter generation prompt ----

export function buildEncounterPrompt(params: {
  world: WorldRecord;
  character: Character;
  terrain: TerrainType;
  timeOfDay: TimeOfDay;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  context?: string;
  regionName?: string;
}): string {
  const { world, character, terrain, timeOfDay, difficulty, context, regionName } = params;

  // Pull matching creatures from world bestiary
  const bestiaryHits = world.bestiary
    ?.filter(b => b.habitat.some(h =>
      h.toLowerCase().includes(terrain) || terrain.includes(h.toLowerCase())
    ))
    .slice(0, 6) ?? [];
  const bestiaryContext = bestiaryHits.length
    ? `\nWORLD-NATIVE CREATURES IN THIS TERRAIN:\n${bestiaryHits.map(b =>
      `- ${b.name} (${b.type}, CR ${b.challengeRating}): ${b.behavior}. Weaknesses: ${b.weaknesses.join(', ')}. Loot: ${b.loot.join(', ')}`
    ).join('\n')}\nPREFER using creatures from this list. Adapt stats to match difficulty.`
    : '';

  // Pull encounter table entries for this region
  const regionTable = regionName && world.encounterTables?.length
    ? world.encounterTables.find(t =>
      t.regionName.toLowerCase() === regionName.toLowerCase()
    )
    : undefined;
  const tableContext = regionTable?.encounters?.length
    ? `\nPRE-PLANNED ENCOUNTERS FOR ${regionTable.regionName}:\n${regionTable.encounters
      .filter(e => e.difficulty === difficulty || e.type === 'combat')
      .slice(0, 4)
      .map(e => `- ${e.name} (${e.difficulty}): ${e.description}. Creatures: ${e.creatures.join(', ')}`)
      .join('\n')}\nYou may use one of these encounters or create a variant.`
    : '';

  return `Generate a combat encounter for this RPG. Return ONLY valid JSON.

WORLD: ${world.worldName} (${world.primaryGenre})
TERRAIN: ${terrain}
TIME: ${timeOfDay}
DIFFICULTY: ${difficulty}
PLAYER: Level ${character.level} ${character.class}
${context ? `CONTEXT: ${context}` : ''}${bestiaryContext}${tableContext}

Generate 1-4 enemies appropriate to the terrain, difficulty, and world genre.

JSON schema:
{
  "encounterName": "dramatic name for the encounter",
  "description": "2-3 sentence scene-setting description",
  "enemies": [
    {
      "id": "enemy-1",
      "name": "string",
      "type": "humanoid|beast|undead|elemental|construct|aberration|fiend|celestial|dragon|monstrosity|plant|ooze",
      "challengeRating": number,
      "hp": {"current": number, "max": number},
      "ac": number,
      "speed": number,
      "abilityScores": {"str": number, "dex": number, "con": number, "int": number, "wis": number, "cha": number},
      "attacks": [{"name": "string", "attackBonus": number, "damage": "1d6+2", "damageType": "string", "description": "string"}],
      "specialAbilities": [{"name": "string", "description": "string", "usesPerDay": -1}],
      "reactions": [],
      "tactics": {"preferredRange": "melee|ranged|mixed", "targetPriority": "weakest|spellcaster|healer|closest|random", "fleeThreshold": 0.25, "specialBehavior": "string"},
      "resistances": [],
      "immunities": [],
      "vulnerabilities": [],
      "conditionImmunities": [],
      "savingThrows": [],
      "senses": ["darkvision 60ft"],
      "languages": [],
      "lootTable": {"guaranteedItems": [], "randomItems": [], "goldRange": {"min": 1, "max": 10}},
      "isAlive": true,
      "xpValue": number,
      "description": "1 sentence physical description",
      "imagePrompt": "description for image generation"
    }
  ],
  "terrain": "${terrain}",
  "environmentalEffects": ["string"],
  "lighting": "bright|dim|darkness"
}`;
}

// ---- Parse AI encounter response ----

export function parseAIEncounter(json: Record<string, unknown>): {
  encounterName: string;
  description: string;
  enemies: EnemyStatBlock[];
  terrain: string;
  environmentalEffects: string[];
  lighting: string;
} {
  const raw = (json.enemies as Array<Record<string, unknown>>) || [];
  const enemies: EnemyStatBlock[] = raw.map((e) => {
    const abs = (e.abilityScores as Record<string, number>) || {};
    return {
      id: (e.id as string) || `enemy-${Math.random().toString(36).slice(2, 8)}`,
      name: (e.name as string) || 'Unknown Creature',
      type: ((e.type as string) || 'beast') as EnemyStatBlock['type'],
      level: (e.level as number) || (e.challengeRating as number) || 1,
      hp: (e.hp as { current: number; max: number }) || { current: 10, max: 10 },
      ac: (e.ac as number) || 12,
      speed: String((e.speed as string | number) ?? '30 ft.'),
      str: abs.str ?? (e.str as number) ?? 10,
      dex: abs.dex ?? (e.dex as number) ?? 10,
      con: abs.con ?? (e.con as number) ?? 10,
      int: abs.int ?? (e.int as number) ?? 10,
      wis: abs.wis ?? (e.wis as number) ?? 10,
      cha: abs.cha ?? (e.cha as number) ?? 10,
      attacks: (e.attacks as EnemyStatBlock['attacks']) || [],
      specialAbilities: (e.specialAbilities as EnemyStatBlock['specialAbilities']) || [],
      reactions: (e.reactions as EnemyStatBlock['reactions']) || [],
      tactics: (e.tactics as EnemyStatBlock['tactics']) || {
        preferredRange: 'melee' as const,
        targetPriority: 'closest' as const,
        fleeThreshold: 0.25,
        specialBehavior: '',
      },
      resistances: (e.resistances as EnemyStatBlock['resistances']) || [],
      immunities: (e.immunities as EnemyStatBlock['immunities']) || [],
      vulnerabilities: (e.vulnerabilities as EnemyStatBlock['vulnerabilities']) || [],
      conditionImmunities: (e.conditionImmunities as string[]) || [],
      savingThrowBonuses: (e.savingThrowBonuses as EnemyStatBlock['savingThrowBonuses']) || {},
      morale: (e.morale as number) ?? 70,
      moraleBreakpoint: (e.moraleBreakpoint as number) ?? 25,
      intelligenceLevel: ((e.intelligenceLevel as string) || 'average') as EnemyStatBlock['intelligenceLevel'],
      threatContribution: (e.threatContribution as number) ?? 1,
      xpValue: (e.xpValue as number) || 50,
      lootTable: e.lootTable as string | undefined,
      isAlive: true,
    };
  });

  return {
    encounterName: (json.encounterName as string) || 'Hostile Encounter',
    description: (json.description as string) || '',
    enemies,
    terrain: (json.terrain as string) || 'unknown',
    environmentalEffects: (json.environmentalEffects as string[]) || [],
    lighting: (json.lighting as string) || 'bright',
  };
}

// ---- Calculate encounter difficulty ----

export function getEncounterDifficulty(
  totalEnemyCR: number,
  partyLevel: number,
  partySize: number = 1
): 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' {
  const effectiveCR = totalEnemyCR / partySize;
  const ratio = effectiveCR / partyLevel;

  if (ratio <= 0.25) return 'trivial';
  if (ratio <= 0.5) return 'easy';
  if (ratio <= 1.0) return 'medium';
  if (ratio <= 1.5) return 'hard';
  return 'deadly';
}

// ---- Generate a random non-combat encounter ----

const NON_COMBAT_ENCOUNTERS = [
  'A traveling merchant approaches with exotic wares.',
  'You discover ancient ruins partially hidden by overgrowth.',
  'A mysterious traveler offers cryptic advice.',
  'You find the remains of a recent battle.',
  'A fork in the path — each branch feels different.',
  'Strange lights flicker in the distance.',
  'An animal approaches, seemingly tame and intelligent.',
  'You stumble upon a hidden shrine to an unknown deity.',
  'Weather changes suddenly and dramatically.',
  'A distant sound catches your attention — music? Screaming?',
  'You discover footprints that don\'t match any creature you know.',
  'A campsite, recently abandoned. Something was left behind.',
];

export function getRandomNonCombatEncounter(): string {
  return NON_COMBAT_ENCOUNTERS[Math.floor(Math.random() * NON_COMBAT_ENCOUNTERS.length)];
}
