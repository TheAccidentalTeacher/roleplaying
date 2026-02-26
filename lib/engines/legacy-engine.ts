// ============================================================
// LEGACY ENGINE
// Character retirement, epilogue, NG+, achievements
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type { Character } from '@/lib/types/character';
import type { WorldRecord } from '@/lib/types/world';
import type {
  CharacterLegacy,
  Achievement,
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

// ---- Achievement Checking ----

export function checkAchievements(
  character: Character,
  event: string,
  existingAchievements: Achievement[]
): Achievement[] {
  const earned: Achievement[] = [];
  const has = (id: string) => existingAchievements.some((a) => a.id === id);
  const now = new Date().toISOString();

  // Level achievements
  if (character.level >= 5 && !has('level-5')) {
    earned.push({
      id: 'level-5',
      name: 'Seasoned Adventurer',
      description: 'Reach level 5',
      icon: '⭐',
      rarity: 'common',
      earnedAt: now,
      characterId: character.id,
    });
  }
  if (character.level >= 10 && !has('level-10')) {
    earned.push({
      id: 'level-10',
      name: 'Veteran Hero',
      description: 'Reach level 10',
      icon: '🌟',
      rarity: 'uncommon',
      earnedAt: now,
      characterId: character.id,
    });
  }
  if (character.level >= 20 && !has('level-20')) {
    earned.push({
      id: 'level-20',
      name: 'Living Legend',
      description: 'Reach level 20',
      icon: '👑',
      rarity: 'legendary',
      earnedAt: now,
      characterId: character.id,
    });
  }

  // Gold achievements
  if (character.gold >= 1000 && !has('rich-1k')) {
    earned.push({
      id: 'rich-1k',
      name: 'Well Off',
      description: 'Accumulate 1,000 gold',
      icon: '💰',
      rarity: 'common',
      earnedAt: now,
      characterId: character.id,
    });
  }

  // Event-based
  if (event === 'first-combat-victory' && !has('first-blood')) {
    earned.push({
      id: 'first-blood',
      name: 'First Blood',
      description: 'Win your first combat encounter',
      icon: '⚔️',
      rarity: 'common',
      earnedAt: now,
      characterId: character.id,
    });
  }

  if (event === 'critical-hit' && !has('crit-master')) {
    earned.push({
      id: 'crit-master',
      name: 'Critical Strike',
      description: 'Land a critical hit',
      icon: '💥',
      rarity: 'common',
      earnedAt: now,
      characterId: character.id,
    });
  }

  if (event === 'survived-deadly-encounter' && !has('death-defier')) {
    earned.push({
      id: 'death-defier',
      name: 'Death Defier',
      description: 'Survive a deadly encounter',
      icon: '💀',
      rarity: 'rare',
      earnedAt: now,
      characterId: character.id,
    });
  }

  return earned;
}
