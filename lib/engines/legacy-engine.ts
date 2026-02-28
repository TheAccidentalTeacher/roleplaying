// ============================================================
// LEGACY ENGINE
// Character retirement, epilogue, NG+, achievements
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type {
  CharacterLegacy,
  NewGamePlusConfig,
  HallOfHeroesEntry,
} from '@/lib/types/session';

// ---- Hall of Heroes Storage ----

const HALL_KEY = 'rpg-hall-of-heroes';

function getHall(): HallOfHeroesEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HALL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHall(entries: HallOfHeroesEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HALL_KEY, JSON.stringify(entries));
}

// ---- Retire Character ----

export function retireCharacter(
  character: Character,
  world: WorldRecord,
  stats: {
    totalSessions: number;
    totalPlayTimeMinutes: number;
    enemiesDefeated: number;
    questsCompleted: number;
    npcsRecruited: number;
    deathsSuffered: number;
    goldEarned: number;
    goldSpent: number;
    itemsCollected: number;
    secretsDiscovered: number;
  },
  epilogue: string,
  cause: CharacterLegacy['causeOfRetirement']
): CharacterLegacy {
  const legacy: CharacterLegacy = {
    characterId: character.id,
    characterName: character.name,
    characterClass: character.class,
    characterLevel: character.level,
    worldName: world.worldName,
    worldType: world.worldType || world.primaryGenre,
    epilogue,
    finalTitle: generateTitle(character, stats),
    alignment: character.alignment || 'True Neutral',
    ...stats,
    achievements: [], // Populated by achievement engine
    legacyItems: character.inventory.slice(0, 1), // 1 carry-over item
    legacyGold: Math.floor(character.gold * 0.1),
    discoveredRecipes: [],
    mapKnowledge: [],
    worldChanges: [],
    retiredAt: new Date().toISOString(),
    causeOfRetirement: cause,
  };

  // Add to Hall of Heroes
  const hall = getHall();
  hall.unshift({
    legacy,
    displayOrder: hall.length,
    isFavorite: false,
  });
  saveHall(hall);

  return legacy;
}

// ---- Generate Title ----

function generateTitle(
  character: Character,
  stats: { enemiesDefeated: number; questsCompleted: number; secretsDiscovered: number }
): string {
  if (stats.enemiesDefeated > 100) return `${character.name} the Slayer`;
  if (stats.questsCompleted > 20) return `${character.name} the Hero`;
  if (stats.secretsDiscovered > 15) return `${character.name} the Seeker`;
  if (character.level >= 15) return `${character.name} the Legendary`;
  if (character.level >= 10) return `${character.name} the Veteran`;
  return `${character.name} the Adventurer`;
}

// ---- New Game Plus ----

export function createNewGamePlus(legacy: CharacterLegacy): NewGamePlusConfig {
  return {
    sourceCharacterId: legacy.characterId,
    carryoverItem: legacy.legacyItems[0],
    carryoverGold: legacy.legacyGold,
    carryoverRecipes: legacy.discoveredRecipes,
    carryoverMapKnowledge: legacy.mapKnowledge,
    worldModifications: legacy.worldChanges,
    difficultyIncrease: 1.25,
    newNGPlusLevel: 1,
  };
}

// ---- Hall of Heroes Queries ----

export function getHallOfHeroes(): HallOfHeroesEntry[] {
  return getHall();
}

export function getActiveCharacters(): HallOfHeroesEntry[] {
  // Not in hall = active (hall is for retired characters)
  return [];
}

export function toggleFavorite(characterId: string): void {
  const hall = getHall();
  const entry = hall.find((h) => h.legacy.characterId === characterId);
  if (entry) {
    entry.isFavorite = !entry.isFavorite;
    saveHall(hall);
  }
}

export function removeFromHall(characterId: string): void {
  const hall = getHall().filter((h) => h.legacy.characterId !== characterId);
  saveHall(hall);
}

// ---- Epilogue Prompt Builder ----

export function buildEpiloguePrompt(
  character: Character,
  world: WorldRecord,
  questsCompleted: number,
  notableEvents: string[]
): string {
  return `Write a brief epilogue (3-5 paragraphs) for a retiring RPG character.
  
Character: ${character.name}, Level ${character.level} ${character.race} ${character.class}
World: ${world.worldName} (${world.primaryGenre})
Quests Completed: ${questsCompleted}

Notable events from their journey:
${notableEvents.map((e) => `- ${e}`).join('\n')}

The epilogue should:
- Summarize their legacy and impact on the world
- Mention key accomplishments
- Describe what they do after retiring from adventuring
- Have a satisfying, bittersweet tone
- End with a memorable final line`;
}

// NOTE: Achievement checking is handled by achievement-engine.ts (canonical source).
// Previously a duplicate checkAchievements existed here — removed to avoid conflicting names/definitions.
