// ============================================================
// WORLD GENESIS — MULTI-STEP PROMPTS
// Splits world generation into 3 focused Claude calls.
// Each step is small (~4K tokens) and finishes in 10-20s.
// Steps build on each other for internal consistency.
// ============================================================

import type { CharacterCreationInput } from '@/lib/types/character';

/**
 * Shared preamble: character context + originality rules.
 */
function characterContext(char: CharacterCreationInput, playerSentence?: string): string {
  const playerLine = playerSentence
    ? `\nThe player has provided this creative seed: "${playerSentence}"\nUse this as inspiration but go FAR beyond it. Surprise them.`
    : '';
  return `## THE PLAYER CHARACTER
- Name: ${char.name}
- Race: ${char.race}
- Class: ${char.class}
- Background: ${char.background ?? 'Adventurer'}
${playerLine}

## CRITICAL RULES
- NEVER imitate Tolkien, Forgotten Realms, Star Wars, or any existing franchise
- Every name, faction, and concept must be wholly original
- The world MUST surprise even experienced RPG players
- Internal consistency: everything connects, history has consequences
- Respond ONLY with valid JSON. No markdown, no explanation, no code blocks.`;
}

/**
 * Genre suggestions based on class/race (borrowed from original prompt).
 */
function genreSuggestions(characterClass: string, race: string): string {
  const classSuggestions: Record<string, string[]> = {
    barbarian: ['survival', 'dark-fantasy', 'mythological', 'post-apocalypse'],
    bard: ['political-intrigue', 'comedy', 'romance', 'pirate'],
    cleric: ['epic-fantasy', 'horror', 'mythological', 'mystery'],
    druid: ['survival', 'mythological', 'post-apocalypse', 'dark-fantasy'],
    fighter: ['military', 'epic-fantasy', 'western', 'noir'],
    monk: ['mythological', 'mystery', 'martial-arts', 'survival'],
    paladin: ['epic-fantasy', 'horror', 'dark-fantasy', 'mythological'],
    ranger: ['survival', 'mystery', 'western', 'dark-fantasy'],
    rogue: ['noir', 'mystery', 'political-intrigue', 'pirate'],
    sorcerer: ['lovecraftian', 'dark-fantasy', 'sci-fi', 'cosmic'],
    warlock: ['horror', 'dark-fantasy', 'lovecraftian', 'mystery'],
    wizard: ['mystery', 'steampunk', 'political-intrigue', 'sci-fi'],
  };
  const suggestions = classSuggestions[characterClass.toLowerCase()] ?? ['epic-fantasy', 'dark-fantasy'];
  const raceSuggestions: string[] = [];
  if (race.toLowerCase().includes('elf')) raceSuggestions.push('mythological', 'epic-fantasy');
  if (race.toLowerCase().includes('dwarf')) raceSuggestions.push('steampunk', 'dark-fantasy');
  if (race.toLowerCase().includes('tiefling')) raceSuggestions.push('horror', 'noir');
  if (race.toLowerCase().includes('dragonborn')) raceSuggestions.push('epic-fantasy', 'military');
  if (race.toLowerCase().includes('gnome')) raceSuggestions.push('steampunk', 'comedy');
  const all = [...new Set([...suggestions, ...raceSuggestions])];
  return all.map(s => `- ${s}`).join('\n');
}

// ── STEP 1: World Foundation ──────────────────────────────────────────────────

export function buildStep1Prompt(char: CharacterCreationInput, playerSentence?: string): {
  system: string;
  user: string;
} {
  return {
    system: `You are the WORLD ARCHITECT for a single-player RPG. In this step you create the FOUNDATION of the world — its identity, cosmology, magic, history, tone, and genre.

${characterContext(char, playerSentence)}

## GENRE SELECTION
Choose a world type and genre blend that fits the character:
${genreSuggestions(char.class, char.race)}

## OUTPUT — Return this JSON exactly:
{
  "worldName": "string — evocative, original name",
  "worldType": "string — e.g. classic-high-fantasy, dark-fantasy, dying-world, etc.",
  "magicSystem": {
    "name": "string",
    "description": "string",
    "source": "string — where magic comes from",
    "cost": "string — what using magic costs",
    "limitations": ["string array"],
    "socialAttitude": "string — how society views magic",
    "schools": ["optional string array"]
  },
  "technologyLevel": "string",
  "cosmology": "string — the shape and nature of the universe",
  "afterlife": "string — what happens after death",
  "time": "string — linear, cyclical, broken, etc.",
  "ageOfWorld": "string",
  "majorHistoricalEras": [
    {
      "name": "string",
      "description": "string",
      "duration": "string",
      "keyEvents": ["string array"],
      "legacy": "string — how this era still affects the present"
    }
  ],
  "catastrophes": ["string array — world-shaping disasters"],
  "legends": [
    {
      "title": "string",
      "summary": "string",
      "isTrue": true,
      "relevanceToPlayer": "string"
    }
  ],
  "narrativeTone": ["string array — e.g. dark-unforgiving, epic-heroic"],
  "primaryGenre": "string",
  "genreBlends": ["string array"],
  "genreArtStyle": "string — e.g. painterly-warm, gritty-desaturated",
  "thematicCore": "string — the central thematic question of this world",
  "currencyNames": {
    "primary": "string",
    "secondary": "string (optional)",
    "tertiary": "string (optional)"
  }
}

Generate 3-5 historical eras, 2-4 legends. Make the thematicCore deep and thought-provoking.`,
    user: `Create the world foundation for ${char.name}, a ${char.race} ${char.class}.${playerSentence ? ` Player says: "${playerSentence}"` : ''}`,
  };
}

// ── STEP 2: Conflict, Villain, & Factions ─────────────────────────────────────

export function buildStep2Prompt(
  char: CharacterCreationInput,
  step1Summary: string
): {
  system: string;
  user: string;
} {
  return {
    system: `You are the WORLD ARCHITECT continuing to build a world. Step 1 established the foundation. Now you create the world's CONFLICT ENGINE — villain, threat, factions, and political landscape.

${characterContext(char)}

## WORLD FOUNDATION (from Step 1)
${step1Summary}

## VILLAIN RULES
- The villain MUST have a comprehensible, even sympathetic motivation
- They must have something they genuinely love or care about
- There must be a missed moment — when they could have been stopped or saved
- They must have a genuine argument — something they're RIGHT about
- They are NEVER pure evil — a person who made terrible choices for understandable reasons

## THREAT RULES
- The main threat should feel urgent but not immediately overwhelming
- It should have clear stages of escalation
- There should be a hidden weakness, but discovering it requires effort
- The player's character should feel personally connected to the threat

## OUTPUT — Return this JSON exactly:
{
  "villainCore": {
    "name": "string",
    "title": "string",
    "description": "string",
    "motivation": "string — human, comprehensible motivation",
    "history": "string — how they became what they are",
    "somethingTheyLove": "string — makes them dangerous AND human",
    "missedPoint": "string — when they could have been stopped",
    "genuineArgument": "string — what they're right about",
    "currentPlan": "string — what they're doing RIGHT NOW",
    "resources": ["string array"],
    "weaknesses": ["string array"],
    "archetype": "string — e.g. idealist-gone-too-far, wounded-god, the-mirror"
  },
  "mainThreat": {
    "name": "string",
    "nature": "string — what IS this threat",
    "origin": "string — where it came from",
    "motivation": "string — what it wants",
    "currentPhase": "string — what stage is the threat at NOW",
    "escalation": ["string array — how it gets worse"],
    "weakness": "string — how it COULD be stopped"
  },
  "factions": [
    {
      "id": "string — unique ID",
      "name": "string",
      "description": "string",
      "leader": "string",
      "goals": ["string array"],
      "strength": "weak | moderate | strong | dominant",
      "alignment": "string",
      "territory": "string",
      "attitude_toward_player": "hostile | unfriendly | neutral | friendly | allied",
      "secrets": ["string array"],
      "resources": ["string array"]
    }
  ],
  "currentConflicts": ["string array — ongoing wars, disputes, crises"],
  "powerVacuums": ["string array — opportunities for ambitious characters"],
  "centralArtifact": {
    "name": "string",
    "description": "string",
    "nature": "string — what it actually does",
    "currentLocation": "string",
    "guardedBy": "string",
    "dangerOfUse": "string",
    "history": "string"
  },
  "prophecy": {
    "text": "string — the actual prophetic text",
    "interpretation": "string — what people THINK it means",
    "truth": "string — what it REALLY means",
    "relevanceToPlayer": "string"
  },
  "secretHistory": "string — hidden truth connecting villain, threat, and world history"
}

Generate 4-6 factions. Factions MUST have conflicting goals that create interesting dynamics. The villain's plan should interact with at least 2 factions.`,
    user: `Create the conflicts, villain, and factions for the world "${step1Summary.split('"worldName"')[1]?.split('"')[1] || 'this world'}".`,
  };
}

// ── STEP 3: Geography & Origin Scenario ───────────────────────────────────────

export function buildStep3Prompt(
  char: CharacterCreationInput,
  step1Summary: string,
  step2Summary: string
): {
  system: string;
  user: string;
} {
  return {
    system: `You are the WORLD ARCHITECT completing the world. Steps 1-2 established foundation and conflicts. Now you create the world's GEOGRAPHY and the player's ORIGIN SCENARIO.

${characterContext(char)}

## WORLD FOUNDATION (from Step 1)
${step1Summary}

## CONFLICTS & FACTIONS (from Step 2)
${step2Summary}

## GEOGRAPHY RULES
- Regions must feel connected — travel routes, trade, conflicts over borders
- Each region's danger level should reflect the political situation
- Locations should tie into factions, threats, and the villain's plan
- Map positions (x,y from 0-1) should form a geographically coherent layout

## ORIGIN SCENARIO RULES
- Must place the player in an immediately interesting situation
- Include the first NPC they meet (who should be memorable)
- End with 3-5 clear action choices
- The very first scene should establish the world's tone and genre
- A ${char.class}'s world should make their specific skills essential

## OUTPUT — Return this JSON exactly:
{
  "geography": [
    {
      "id": "string — unique ID",
      "name": "string",
      "description": "string",
      "terrain": "string",
      "climate": "string",
      "controlledBy": "string — faction name or ID (optional)",
      "dangerLevel": 1,
      "knownLocations": [
        {
          "name": "string",
          "type": "city | town | village | dungeon | ruin | landmark | wilderness | camp | fortress | temple | port",
          "description": "string",
          "significance": "string"
        }
      ],
      "mapPosition": { "x": 0.5, "y": 0.3 },
      "pointsOfInterest": ["string array"],
      "travelNotes": "string"
    }
  ],
  "playerRole": "string — why this character matters to this world",
  "originScenario": {
    "setting": "string — where the story begins",
    "situation": "string — what's happening",
    "hook": "string — why the player is involved",
    "firstNPCIntro": "string — how they meet the first NPC",
    "initialChoices": ["string array — 3-5 opening action options"]
  }
}

Generate 4-8 regions with 2-4 locations each. The origin scenario should be IMMEDIATELY gripping.
This world is for a SINGLE PLAYER with AI as DM. Focus on depth over breadth.`,
    user: `Create the geography and origin scenario for ${char.name} in this world.`,
  };
}
