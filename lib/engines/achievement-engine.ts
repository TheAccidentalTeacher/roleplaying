// ============================================================
// ACHIEVEMENT ENGINE — Achievement definitions, checking, tracking
// Reference: SESSION-STRUCTURE.md
// ============================================================

import type { Achievement } from '@/lib/types/session';
import type { Character } from '@/lib/types/character';

// ---- Achievement Definitions ----

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Achievement['rarity'];
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  character: Character;
  totalEnemiesDefeated: number;
  totalQuestsCompleted: number;
  totalNpcsRecruited: number;
  totalDeaths: number;
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalSessionsPlayed: number;
  totalItemsCollected: number;
  totalSecretsDiscovered: number;
  events: string[]; // List of story events that occurred
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ---- Common ----
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Defeat your first enemy',
    icon: '⚔️',
    rarity: 'common',
    check: (ctx) => ctx.totalEnemiesDefeated >= 1,
  },
  {
    id: 'quest-beginner',
    name: 'Adventurer',
    description: 'Complete your first quest',
    icon: '📜',
    rarity: 'common',
    check: (ctx) => ctx.totalQuestsCompleted >= 1,
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    rarity: 'common',
    check: (ctx) => ctx.character.level >= 5,
  },
  {
    id: 'gold-hoarder',
    name: 'Gold Hoarder',
    description: 'Accumulate 500 gold',
    icon: '🪙',
    rarity: 'common',
    check: (ctx) => ctx.character.gold >= 500,
  },
  {
    id: 'session-3',
    name: 'Regular',
    description: 'Play 3 sessions',
    icon: '📖',
    rarity: 'common',
    check: (ctx) => ctx.totalSessionsPlayed >= 3,
  },

  // ---- Uncommon ----
  {
    id: 'level-10',
    name: 'Seasoned Adventurer',
    description: 'Reach level 10',
    icon: '🌟',
    rarity: 'uncommon',
    check: (ctx) => ctx.character.level >= 10,
  },
  {
    id: 'slayer-50',
    name: 'Slayer',
    description: 'Defeat 50 enemies',
    icon: '💀',
    rarity: 'uncommon',
    check: (ctx) => ctx.totalEnemiesDefeated >= 50,
  },
  {
    id: 'quest-10',
    name: 'Questmaster',
    description: 'Complete 10 quests',
    icon: '🏆',
    rarity: 'uncommon',
    check: (ctx) => ctx.totalQuestsCompleted >= 10,
  },
  {
    id: 'companion-3',
    name: 'Party Leader',
    description: 'Recruit 3 companions',
    icon: '🤝',
    rarity: 'uncommon',
    check: (ctx) => ctx.totalNpcsRecruited >= 3,
  },
  {
    id: 'rich',
    name: 'Wealthy',
    description: 'Earn 5000 gold total',
    icon: '💰',
    rarity: 'uncommon',
    check: (ctx) => ctx.totalGoldEarned >= 5000,
  },
  {
    id: 'session-10',
    name: 'Dedicated',
    description: 'Play 10 sessions',
    icon: '📚',
    rarity: 'uncommon',
    check: (ctx) => ctx.totalSessionsPlayed >= 10,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discover 10 secrets',
    icon: '🗺️',
    rarity: 'uncommon',
    check: (ctx) => ctx.totalSecretsDiscovered >= 10,
  },

  // ---- Rare ----
  {
    id: 'level-15',
    name: 'Legendary Hero',
    description: 'Reach level 15',
    icon: '💫',
    rarity: 'rare',
    check: (ctx) => ctx.character.level >= 15,
  },
  {
    id: 'slayer-200',
    name: 'Butcher',
    description: 'Defeat 200 enemies',
    icon: '🩸',
    rarity: 'rare',
    check: (ctx) => ctx.totalEnemiesDefeated >= 200,
  },
  {
    id: 'pacifist-session',
    name: 'Diplomat',
    description: 'Complete a session without any combat',
    icon: '🕊️',
    rarity: 'rare',
    check: (ctx) => ctx.events.includes('pacifist-session'),
  },
  {
    id: 'dragon-slayer',
    name: 'Dragon Slayer',
    description: 'Defeat a dragon',
    icon: '🐉',
    rarity: 'rare',
    check: (ctx) => ctx.events.includes('dragon-defeated'),
  },
  {
    id: 'collector-100',
    name: 'Collector',
    description: 'Collect 100 items',
    icon: '🎒',
    rarity: 'rare',
    check: (ctx) => ctx.totalItemsCollected >= 100,
  },

  // ---- Legendary ----
  {
    id: 'level-20',
    name: 'Demigod',
    description: 'Reach level 20',
    icon: '👑',
    rarity: 'legendary',
    check: (ctx) => ctx.character.level >= 20,
  },
  {
    id: 'no-deaths',
    name: 'Undying',
    description: 'Complete the game without dying',
    icon: '💎',
    rarity: 'legendary',
    check: (ctx) => ctx.totalDeaths === 0 && ctx.events.includes('game-completed'),
  },
  {
    id: 'world-savior',
    name: 'World Savior',
    description: 'Save the world from the main threat',
    icon: '🌍',
    rarity: 'legendary',
    check: (ctx) => ctx.events.includes('world-saved'),
  },
  {
    id: 'session-50',
    name: 'Eternal Champion',
    description: 'Play 50 sessions with one character',
    icon: '♾️',
    rarity: 'legendary',
    check: (ctx) => ctx.totalSessionsPlayed >= 50,
  },
];

// ---- Achievement Checking ----

export function checkAchievements(
  context: AchievementContext,
  alreadyEarned: string[],
): Achievement[] {
  const newAchievements: Achievement[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (alreadyEarned.includes(def.id)) continue;

    try {
      if (def.check(context)) {
        newAchievements.push({
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          rarity: def.rarity,
          earnedAt: new Date().toISOString(),
          characterId: context.character.id,
        });
      }
    } catch {
      // Skip silently on check errors
    }
  }

  return newAchievements;
}

// ---- Helpers ----

export function getAllAchievementDefs(): AchievementDef[] {
  return [...ACHIEVEMENT_DEFS];
}

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find((d) => d.id === id);
}

export function getTotalAchievementCount(): number {
  return ACHIEVEMENT_DEFS.length;
}

export function getAchievementsByRarity(rarity: Achievement['rarity']): AchievementDef[] {
  return ACHIEVEMENT_DEFS.filter((d) => d.rarity === rarity);
}
