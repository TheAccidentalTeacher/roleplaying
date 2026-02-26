// ============================================================
// QUEST ENGINE
// Generates, tracks, and resolves quests.
// Reference: BRAINSTORM.md Quest Architecture section
// ============================================================

import type {
  Quest,
  QuestType,
  QuestStatus,
  QuestAct,
  QuestObjective,
  Choice,
} from '@/lib/types/quest';
import type { WorldRecord, Genre, NarrativeTone } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';

// ---- Quest prompt builders ----

export function buildMainQuestPrompt(
  world: WorldRecord,
  character: Character
): string {
  return `Generate a MAIN QUEST for this RPG world. Return ONLY valid JSON.

WORLD:
- Name: ${world.worldName}
- Genre: ${world.primaryGenre}
- Tone: ${world.narrativeTone}
- Central Conflict: ${world.villainCore?.motivation || 'Unknown'}
- Prophecy: ${world.prophecy?.text || 'None'}
- Main Threat: ${world.mainThreat?.name || 'None'}

CHARACTER:
- Name: ${character.name}
- Class: ${character.class}
- Level: ${character.level}
- Origin: ${character.backstory || 'Unknown'}
- Background: ${character.background}

Generate a 3-act main quest with:
1. A compelling title and logline
2. A secret truth the player doesn't know yet
3. Three acts with objectives
4. Key decision points that affect the ending
5. At least 3 possible endings with different tones
6. Unique mechanics specific to this quest

JSON schema:
{
  "title": "string",
  "logline": "1-sentence hook",
  "fullDescription": "2-3 paragraphs",
  "secretTruth": "the hidden truth",
  "acts": [
    {
      "actNumber": 1,
      "title": "string",
      "description": "paragraph",
      "objectives": [
        {"id": "obj-1", "description": "string", "isOptional": false, "isCompleted": false, "isHidden": false}
      ],
      "keyEvents": ["event description"],
      "isCompleted": false
    }
  ],
  "keyDecisionPoints": ["description of key choice"],
  "possibleEndings": [
    {"id": "end-1", "title": "string", "description": "string", "requirements": "string", "tone": "triumphant|bittersweet|tragic|ambiguous|hopeful", "worldChanges": ["string"]}
  ],
  "uniqueMechanics": ["mechanic description"],
  "lootProfile": {
    "rarityWeights": {"common": 30, "uncommon": 40, "rare": 20, "epic": 8, "legendary": 2},
    "thematicTags": ["tag"],
    "uniqueItemChance": 0.1
  }
}`;
}

export function buildSideQuestPrompt(
  world: WorldRecord,
  character: Character,
  location: string,
  context?: string
): string {
  return `Generate a SIDE QUEST appropriate to the current situation. Return ONLY valid JSON.

WORLD: ${world.worldName} (${world.primaryGenre})
LOCATION: ${location}
CHARACTER: ${character.name}, Level ${character.level} ${character.class}
${context ? `CONTEXT: ${context}` : ''}

The side quest should:
1. Be completable in 1-3 sessions
2. Have 1-2 acts max
3. Tie into the world's themes
4. Offer meaningful rewards
5. Have at least 2 possible outcomes

JSON schema:
{
  "title": "string",
  "logline": "1-sentence hook",
  "fullDescription": "1-2 paragraphs",
  "secretTruth": "the hidden truth",
  "acts": [
    {
      "actNumber": 1,
      "title": "string",
      "description": "paragraph",
      "objectives": [
        {"id": "obj-1", "description": "string", "isOptional": false, "isCompleted": false, "isHidden": false}
      ],
      "keyEvents": ["event"],
      "isCompleted": false
    }
  ],
  "keyDecisionPoints": ["choice description"],
  "possibleEndings": [
    {"id": "end-1", "title": "string", "description": "string", "requirements": "string", "tone": "bittersweet", "worldChanges": ["string"]}
  ],
  "uniqueMechanics": [],
  "lootProfile": {
    "rarityWeights": {"common": 40, "uncommon": 35, "rare": 20, "epic": 5},
    "thematicTags": ["tag"],
    "uniqueItemChance": 0.05
  }
}`;
}

// ---- Parse AI-generated quest JSON ----

export function parseAIQuest(
  json: Record<string, unknown>,
  worldId: string,
  characterId: string,
  questType: QuestType,
  genre: Genre,
  tone: NarrativeTone[]
): Quest {
  const id = `quest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  return {
    id,
    worldId,
    characterId,
    type: questType,
    title: (json.title as string) || 'Untitled Quest',
    logline: (json.logline as string) || '',
    fullDescription: (json.fullDescription as string) || '',
    secretTruth: (json.secretTruth as string) || '',
    primaryGenre: genre,
    subGenres: [],
    tone,
    acts: ((json.acts as QuestAct[]) || []).map((act, i) => ({
      actNumber: act.actNumber || i + 1,
      title: act.title || `Act ${i + 1}`,
      description: act.description || '',
      objectives: (act.objectives || []).map((obj: QuestObjective) => ({
        id: obj.id || `obj-${i}-${Math.random().toString(36).slice(2, 6)}`,
        description: obj.description || '',
        isOptional: obj.isOptional || false,
        isCompleted: false,
        isHidden: obj.isHidden || false,
      })),
      keyEvents: act.keyEvents || [],
      isCompleted: false,
    })),
    keyDecisionPoints: (json.keyDecisionPoints as string[]) || [],
    possibleEndings: ((json.possibleEndings as Array<Record<string, unknown>>) || []).map((end) => ({
      id: (end.id as string) || `end-${Math.random().toString(36).slice(2, 6)}`,
      title: (end.title as string) || 'Unknown Ending',
      description: (end.description as string) || '',
      requirements: (end.requirements as string) || '',
      tone: (end.tone as 'triumphant' | 'bittersweet' | 'tragic' | 'ambiguous' | 'hopeful') || 'ambiguous',
      worldChanges: (end.worldChanges as string[]) || [],
    })),
    uniqueMechanics: (json.uniqueMechanics as string[]) || [],
    feedsIntoMainQuest: questType === 'main',
    lootProfile: (json.lootProfile as Quest['lootProfile']) || {
      rarityWeights: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 },
      thematicTags: [],
      uniqueItemChance: 0.05,
    },
    status: 'active' as QuestStatus,
    currentAct: 1,
    choices: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ---- Update quest progress ----

export function updateQuestProgress(
  quest: Quest,
  objectiveId: string,
  completed: boolean
): Quest {
  const updated = { ...quest, updatedAt: new Date().toISOString() };

  // Find and update the objective
  for (const act of updated.acts) {
    for (const obj of act.objectives) {
      if (obj.id === objectiveId) {
        obj.isCompleted = completed;
      }
    }

    // Check if all required objectives in this act are complete
    const requiredObjectives = act.objectives.filter((o) => !o.isOptional);
    act.isCompleted = requiredObjectives.every((o) => o.isCompleted);

    // Auto-advance to next act
    if (act.isCompleted && act.actNumber === updated.currentAct) {
      updated.currentAct = act.actNumber + 1;
    }
  }

  // Check if all acts are completed
  if (updated.acts.every((a) => a.isCompleted)) {
    updated.status = 'completed';
  }

  return updated;
}

// ---- Record a quest choice ----

export function recordChoice(
  quest: Quest,
  description: string,
  consequences: string,
  reversible: boolean = false
): Quest {
  const choice: Choice = {
    id: `choice-${Date.now()}`,
    description,
    madeAt: new Date().toISOString(),
    consequences,
    wasReversible: reversible,
  };

  return {
    ...quest,
    choices: [...quest.choices, choice],
    updatedAt: new Date().toISOString(),
  };
}

// ---- Complete a quest ----

export function completeQuest(
  quest: Quest,
  endingId: string,
  outcome: string
): {
  quest: Quest;
  xpReward: number;
  goldReward: number;
  narrativeSummary: string;
} {
  const ending = quest.possibleEndings.find((e) => e.id === endingId);

  // Calculate rewards based on quest type and acts completed
  const actsCompleted = quest.acts.filter((a) => a.isCompleted).length;
  const baseXP = quest.type === 'main' ? 500 : quest.type === 'side' ? 200 : 300;
  const xpReward = baseXP * actsCompleted;
  const goldReward = Math.floor(xpReward * 0.4);

  const completedQuest: Quest = {
    ...quest,
    status: 'completed',
    outcome,
    updatedAt: new Date().toISOString(),
  };

  const narrativeSummary = ending
    ? `Quest "${quest.title}" concluded with the "${ending.title}" ending. ${ending.description}`
    : `Quest "${quest.title}" has been completed. ${outcome}`;

  return {
    quest: completedQuest,
    xpReward,
    goldReward,
    narrativeSummary,
  };
}

// ---- Fail a quest ----

export function failQuest(quest: Quest, reason: string): Quest {
  return {
    ...quest,
    status: 'failed',
    outcome: reason,
    updatedAt: new Date().toISOString(),
  };
}

// ---- Abandon a quest ----

export function abandonQuest(quest: Quest): Quest {
  return {
    ...quest,
    status: 'abandoned',
    updatedAt: new Date().toISOString(),
  };
}

// ---- Get active objectives for current act ----

export function getCurrentObjectives(quest: Quest): QuestObjective[] {
  const currentAct = quest.acts.find((a) => a.actNumber === quest.currentAct);
  if (!currentAct) return [];
  return currentAct.objectives.filter((o) => !o.isHidden || o.isCompleted);
}

// ---- Get quest progress percentage ----

export function getQuestProgress(quest: Quest): number {
  const totalObjectives = quest.acts.flatMap((a) => a.objectives).filter((o) => !o.isOptional);
  if (totalObjectives.length === 0) return 0;
  const completed = totalObjectives.filter((o) => o.isCompleted).length;
  return Math.round((completed / totalObjectives.length) * 100);
}
