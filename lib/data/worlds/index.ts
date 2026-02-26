import type { WorldDefinition, WorldCategory } from '../world-types';

import { fantasyWorlds } from './fantasy';
import { fantasyExtWorlds } from './fantasy-ext';
import { scifiWorlds } from './scifi';
import { postApocWorlds } from './post-apoc';
import { horrorWorlds } from './horror';
import { modernWorlds } from './modern';
import { historicalWorlds } from './historical';
import { hybridWorlds } from './hybrid';
import { exoticWorlds } from './exotic';

/* ──────────────────────────────────────────────
   World categories for the selection UI
   ────────────────────────────────────────────── */

export const WORLD_CATEGORIES: WorldCategory[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🏰',
    description: 'Magic, myth, and medieval adventure.',
    worlds: [...fantasyWorlds, ...fantasyExtWorlds],
  },
  {
    id: 'scifi',
    name: 'Science Fiction',
    icon: '🚀',
    description: 'Starships, cyberspace, and the far frontier.',
    worlds: scifiWorlds,
  },
  {
    id: 'post-apoc',
    name: 'Post-Apocalyptic',
    icon: '☢️',
    description: 'Survival after the end of the world.',
    worlds: postApocWorlds,
  },
  {
    id: 'horror',
    name: 'Horror',
    icon: '👁️',
    description: 'Terror, madness, and the unknown.',
    worlds: horrorWorlds,
  },
  {
    id: 'modern',
    name: 'Modern & Urban',
    icon: '🌆',
    description: 'Contemporary settings with extraordinary twists.',
    worlds: modernWorlds,
  },
  {
    id: 'historical',
    name: 'Historical',
    icon: '📜',
    description: 'Past eras brought to life with RPG flair.',
    worlds: historicalWorlds,
  },
  {
    id: 'hybrid',
    name: 'Hybrid & Strange',
    icon: '🌀',
    description: 'Genre-bending, weird, and wonderful.',
    worlds: hybridWorlds,
  },
  {
    id: 'exotic',
    name: 'Cultural & Mythic',
    icon: '🐉',
    description: 'Settings rooted in real-world mythology and culture.',
    worlds: exoticWorlds,
  },
];

/* ──────────────────────────────────────────────
   Flat list of every world
   ────────────────────────────────────────────── */

export const ALL_WORLDS: WorldDefinition[] = WORLD_CATEGORIES.flatMap(
  (cat) => cat.worlds
);

/* ──────────────────────────────────────────────
   Lookup helpers
   ────────────────────────────────────────────── */

const worldMap = new Map<string, WorldDefinition>(
  ALL_WORLDS.map((w) => [w.id, w])
);

export function getWorldById(id: string): WorldDefinition | undefined {
  return worldMap.get(id);
}

export function getWorldsByGenre(genre: string): WorldDefinition[] {
  return ALL_WORLDS.filter((w) => w.genre === genre);
}

export function getCategoryForWorld(worldId: string): WorldCategory | undefined {
  return WORLD_CATEGORIES.find((cat) =>
    cat.worlds.some((w) => w.id === worldId)
  );
}
