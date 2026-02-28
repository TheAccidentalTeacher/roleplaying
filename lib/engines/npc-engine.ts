// ============================================================
// NPC ENGINE
// Generates NPCs, tracks relationships, manages dialogue context.
// Reference: BRAINSTORM.md NPC System
// ============================================================

import type {
  NPC,
  NPCRole,
  StoryRole,
  AttitudeTier,
  RelationshipType,
  NPCMemory,
  DialogueContext,
} from '@/lib/types/npc';
import type { WorldRecord, Genre } from '@/lib/types/world';

// ---- NPC generation prompt ----

export function buildNPCGenerationPrompt(params: {
  world: WorldRecord;
  location: string;
  role?: NPCRole;
  storyRole?: StoryRole;
  context?: string;
}): string {
  const { world, location, role, storyRole, context } = params;

  // Check for pre-defined NPCs in this settlement
  const settlement = world.settlements?.find(s =>
    s.name.toLowerCase() === location.toLowerCase() ||
    location.toLowerCase().includes(s.name.toLowerCase())
  );
  const existingNPCs = settlement?.keyNPCs?.length
    ? `\nESTABLISHED NPCs AT THIS LOCATION (do NOT duplicate — create someone NEW who fits alongside them):
${settlement.keyNPCs.map(n => `- ${n.name} (${n.role}): ${n.personality}. Secret: ${n.secret}`).join('\n')}`
    : '';

  // Settlement context for atmosphere
  const settlementContext = settlement
    ? `\nSETTLEMENT: ${settlement.name} (${settlement.type}, pop. ${settlement.population}). ${settlement.description.slice(0, 100)}
Government: ${settlement.government}. Controlling faction: ${settlement.controllingFaction}.
Laws: ${settlement.laws.slice(0, 2).join('; ')}`
    : '';

  // Faction context for NPC affiliation
  const factionContext = world.factions?.length
    ? `\nACTIVE FACTIONS: ${world.factions.map(f => `${f.name} (${f.attitude_toward_player})`).join(', ')}
Consider making this NPC affiliated with one of these factions.`
    : '';

  // Companion awareness — don't duplicate companions
  const companionNames = world.companions?.length
    ? `\nEXISTING COMPANIONS (do NOT recreate): ${world.companions.map(c => c.name).join(', ')}`
    : '';

  return `Generate an NPC for this RPG world. Return ONLY valid JSON.

WORLD: ${world.worldName} (${world.primaryGenre})
LOCATION: ${location}
${role ? `ROLE: ${role}` : 'Any role appropriate to the location'}
${storyRole ? `STORY IMPORTANCE: ${storyRole}` : ''}
${context ? `CONTEXT: ${context}` : ''}${existingNPCs}${settlementContext}${factionContext}${companionNames}

Create a memorable, three-dimensional character. NOT a stereotype.

JSON schema:
{
  "name": "string",
  "age": number,
  "race": "string",
  "role": "quest-giver|merchant|companion|villain|informant|guard|ruler|priest|sage|artisan|entertainer|commoner|innkeeper|blacksmith|etc",
  "storyRole": "major|minor|background",
  "physicalDescription": "2-3 sentences of vivid physical description",
  "voiceDescription": "1 sentence describing their voice and speech style",
  "personalityCore": "2-3 sentence personality description",
  "motivation": "what drives them",
  "fear": "their deepest fear",
  "secret": "something they're hiding",
  "speechPattern": "description of how they talk: accent, verbal tics, vocabulary level",
  "faction": "optional faction name or null",
  "location": "${location}",
  "knowledgeOf": ["topic1", "topic2"],
  "combatStats": null or {"level": number, "hp": {"current": number, "max": number}, "ac": number, "attackBonus": number, "damage": "1d6+2", "specialAbilities": ["ability"]}
}`;
}

// ---- Parse AI NPC response ----

export function parseAINPC(
  json: Record<string, unknown>,
  worldId: string,
  characterId: string
): NPC {
  const id = `npc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  return {
    id,
    worldId,
    characterId,
    name: (json.name as string) || 'Mysterious Stranger',
    age: json.age as number | undefined,
    race: (json.race as string) || 'human',
    role: (json.role as NPCRole) || 'commoner',
    storyRole: (json.storyRole as StoryRole) || 'minor',
    physicalDescription: (json.physicalDescription as string) || 'An unremarkable figure.',
    voiceDescription: (json.voiceDescription as string) || 'Speaks plainly.',
    personalityCore: (json.personalityCore as string) || 'Reserved and cautious.',
    motivation: (json.motivation as string) || 'Survival.',
    fear: (json.fear as string) || 'The unknown.',
    secret: (json.secret as string) || 'None apparent.',
    speechPattern: (json.speechPattern as string) || 'Common speech.',
    relationshipScore: 0,
    relationshipType: 'stranger',
    attitudeTier: 'neutral',
    sharedHistory: [],
    currentEmotionalState: 'neutral',
    faction: json.faction as string | undefined,
    location: (json.location as string) || 'Unknown',
    knowledgeOf: (json.knowledgeOf as string[]) || [],
    isAlive: true,
    isCompanion: false,
    combatStats: json.combatStats as NPC['combatStats'] | undefined,
    memories: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ---- Relationship management ----

export function getAttitudeTier(score: number): AttitudeTier {
  if (score <= -60) return 'hostile';
  if (score <= -20) return 'unfriendly';
  if (score <= 20) return 'neutral';
  if (score <= 60) return 'friendly';
  return 'allied';
}

export function getRelationshipType(score: number, _history?: string[]): RelationshipType {
  if (score <= -60) return 'enemy';
  if (score <= -20) return 'rival';
  if (score <= 5) return 'stranger';
  if (score <= 20) return 'acquaintance';
  if (score <= 60) return 'friend';
  return 'close-friend';
}

export function updateRelationship(
  npc: NPC,
  event: string,
  playerAction: string,
  impact: number
): NPC {
  const newScore = Math.max(-100, Math.min(100, npc.relationshipScore + impact));

  const memory: NPCMemory = {
    event,
    playerAction,
    npcReaction: impact > 0 ? 'appreciative' : impact < 0 ? 'displeased' : 'indifferent',
    emotionalImpact: impact,
    timestamp: new Date().toISOString(),
  };

  return {
    ...npc,
    relationshipScore: newScore,
    attitudeTier: getAttitudeTier(newScore),
    relationshipType: getRelationshipType(newScore, npc.sharedHistory),
    memories: [...npc.memories, memory],
    sharedHistory: [...npc.sharedHistory, event],
    updatedAt: new Date().toISOString(),
  };
}

// ---- Build dialogue context for DM prompt ----

export function buildDialogueContext(npc: NPC): DialogueContext {
  // Get the 5 most recent memories
  const recentMemories = npc.memories.slice(-5);

  return {
    npcId: npc.id,
    npcName: npc.name,
    personality: npc.personalityCore,
    motivation: npc.motivation,
    attitudeTier: npc.attitudeTier,
    relationshipScore: npc.relationshipScore,
    recentMemories,
    currentLocation: npc.location,
    currentEmotionalState: npc.currentEmotionalState,
    knowledgeOf: npc.knowledgeOf,
    speechPattern: npc.speechPattern,
    secret: npc.secret,
  };
}

// ---- Build dialogue prompt for AI ----

export function buildDialoguePrompt(
  context: DialogueContext,
  playerMessage: string,
  genre: Genre
): string {
  const attitudeGuide: Record<AttitudeTier, string> = {
    hostile: 'Actively antagonistic. May threaten, insult, or refuse to cooperate. Can be convinced with exceptional persuasion.',
    unfriendly: 'Suspicious and reluctant. Short answers, guarded. Requires effort to get information from.',
    neutral: 'Polite but distant. Will engage in basic conversation. Will help for fair compensation.',
    friendly: 'Warm and helpful. Offers information freely. May give small discounts or favors.',
    allied: 'Loyal and supportive. Goes out of their way to help. Shares secrets and provides significant aid.',
  };

  return `You are roleplaying as the NPC "${context.npcName}" in a ${genre} setting.

CHARACTER SHEET:
- Personality: ${context.personality}
- Motivation: ${context.motivation}
- Speech pattern: ${context.speechPattern}
- Current mood: ${context.currentEmotionalState}
- Attitude toward player: ${attitudeGuide[context.attitudeTier]} (Score: ${context.relationshipScore}/100)
- Secret (do NOT reveal unless trust is high): ${context.secret}
- Location: ${context.currentLocation}
- Knowledge topics: ${context.knowledgeOf.join(', ')}

RECENT HISTORY WITH PLAYER:
${context.recentMemories.length > 0
  ? context.recentMemories.map((m) => `- ${m.event}: Player ${m.playerAction} → NPC ${m.npcReaction}`).join('\n')
  : 'No previous interactions.'}

PLAYER SAYS: "${playerMessage}"

Respond in character. Stay true to the speech pattern. Do NOT break character.
If the player asks about a topic in your knowledge, share appropriately based on attitude.
If attitude is hostile/unfriendly, be difficult but not impossible.
Keep response to 2-4 sentences unless the NPC is telling a story.`;
}

// ---- Get NPC summary for game context ----

export function getNPCSummary(npc: NPC): string {
  return `${npc.name} (${npc.race} ${npc.role}, ${npc.attitudeTier}): ${npc.personalityCore.slice(0, 80)}`;
}

// ---- Calculate persuasion DC based on relationship ----

export function getPersuasionDC(npc: NPC, requestDifficulty: 'easy' | 'medium' | 'hard' | 'extreme'): number {
  const baseDC: Record<string, number> = {
    easy: 10,
    medium: 15,
    hard: 20,
    extreme: 25,
  };

  let dc = baseDC[requestDifficulty];

  // Adjust by attitude
  if (npc.attitudeTier === 'hostile') dc += 10;
  else if (npc.attitudeTier === 'unfriendly') dc += 5;
  else if (npc.attitudeTier === 'friendly') dc -= 5;
  else if (npc.attitudeTier === 'allied') dc -= 10;

  return Math.max(5, Math.min(30, dc));
}
