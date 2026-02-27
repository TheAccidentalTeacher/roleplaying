// ============================================================
// WORLD GENESIS — 14-STEP HOMEBREW CAMPAIGN FACTORY
// Like a real DM prepping a campaign guide: piece by piece,
// layer by layer. Each step is a focused Claude call (~3-5K tokens)
// that completes in 10-20 seconds and feeds into the next.
//
// DnD meets WoW meets Elder Scrolls meets Divinity meets XCOM
// ============================================================

import type { CharacterCreationInput } from '@/lib/types/character';

// ── Shared context preamble ─────────────────────────────────────────

function charContext(c: CharacterCreationInput, playerSentence?: string): string {
  const seed = playerSentence
    ? `\nCreative seed from the player: "${playerSentence}" — use as inspiration but go FAR beyond it.`
    : '';
  return `PLAYER CHARACTER: ${c.name}, ${c.race} ${c.class}, background: ${c.background ?? 'Adventurer'}${seed}`;
}

const JSON_RULES = `
RULES:
- Respond ONLY with valid JSON. No markdown fences, no explanation, no commentary.
- Every name, faction, and concept must be wholly ORIGINAL. NEVER imitate Tolkien, Forgotten Realms, Star Wars, Elder Scrolls, or any existing IP.
- Surprise even veteran RPG players with unexpected concepts.`;

// ── Step interface ───────────────────────────────────────────────────

export interface StepPrompt {
  system: string;
  user: string;
  maxTokens: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1 — WORLD CONCEPT & COSMOLOGY
// The high concept: what KIND of world, its genre DNA, tone, and
// cosmic structure. This is the creative seed everything else grows from.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step01_worldConcept(c: CharacterCreationInput, playerSentence?: string): StepPrompt {
  return {
    maxTokens: 3000,
    system: `You are a WORLD ARCHITECT. Create the high concept for an original RPG world.
${charContext(c, playerSentence)}
${JSON_RULES}

Return JSON:
{
  "worldName": "string — evocative, original",
  "worldType": "string — e.g. dying-world, clockwork-fantasy, post-singularity",
  "primaryGenre": "string",
  "genreBlends": ["2-3 genre influences"],
  "narrativeTone": ["2-3 tones — e.g. dark-unforgiving, epic-heroic"],
  "genreArtStyle": "string — visual style for this world",
  "thematicCore": "string — the central philosophical question this world explores",
  "cosmology": "string — the shape and nature of the universe",
  "afterlife": "string — what happens after death",
  "time": "string — how time works (linear, cyclical, broken, etc.)",
  "ageOfWorld": "string",
  "technologyLevel": "string"
}`,
    user: `Design a world concept for ${c.name}, a ${c.race} ${c.class}. Make it feel like a world that has never existed before.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2 — MAGIC & POWER SYSTEMS
// How power works: magic, technology, psionics, divine gifts.
// The rules that govern what's possible.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step02_magicSystem(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 3000,
    system: `You are continuing to build an RPG world. Step 1 established the concept.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Design the magic/power system. Consider how a ${c.class} would interact with it.

Return JSON:
{
  "magicSystem": {
    "name": "string",
    "description": "string — 2-3 sentences",
    "source": "string — where power comes from",
    "cost": "string — what using it costs",
    "limitations": ["3-5 hard limits"],
    "socialAttitude": "string — how society views it",
    "schools": ["3-6 disciplines/schools"]
  },
  "currencyNames": {
    "primary": "string",
    "secondary": "string",
    "tertiary": "string"
  }
}`,
    user: `Design the magic system and currency for this world.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — HISTORY & LEGENDS
// The deep lore: ages, catastrophes, legends true and false.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step03_history(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 4000,
    system: `Continue building the world. Create its deep history.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Return JSON:
{
  "majorHistoricalEras": [
    {
      "name": "string",
      "description": "string",
      "duration": "string",
      "keyEvents": ["2-4 events"],
      "legacy": "string — how this era still affects the present"
    }
  ],
  "catastrophes": ["3-5 world-shaping disasters"],
  "legends": [
    {
      "title": "string",
      "summary": "string",
      "isTrue": true,
      "relevanceToPlayer": "string"
    }
  ],
  "secretHistory": "string — the hidden truth connecting world events (DM eyes only)"
}

Generate 3-5 eras, 3-5 legends. At least one legend should be false.`,
    user: `Write the deep history and legends for this world.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4 — FACTIONS & POLITICAL LANDSCAPE
// Who holds power, who wants it, and why they're fighting.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step04_factions(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Create the political landscape.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Factions MUST have conflicting goals that create interesting dynamics.

Return JSON:
{
  "factions": [
    {
      "id": "faction-1",
      "name": "string",
      "description": "string",
      "leader": "string",
      "goals": ["2-3 goals"],
      "strength": "weak | moderate | strong | dominant",
      "alignment": "string",
      "territory": "string",
      "attitude_toward_player": "hostile | unfriendly | neutral | friendly | allied",
      "secrets": ["1-3 secrets"],
      "resources": ["2-4 resources"]
    }
  ],
  "currentConflicts": ["3-5 ongoing wars, disputes, or crises"],
  "powerVacuums": ["2-3 opportunities for ambitious characters"]
}

Generate 5-7 factions. At least 2 should be hostile to each other.`,
    user: `Create the factions and political landscape.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5 — THE VILLAIN
// Deep, sympathetic villain with genuine arguments and human flaws.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step05_villain(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 3500,
    system: `Continue building the world. Create the MAIN VILLAIN.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

VILLAIN RULES:
- Comprehensible, even sympathetic motivation
- They must love something genuinely
- There was a moment they could have been saved
- They have a genuine argument — something they're RIGHT about
- NEVER pure evil. A person who made terrible choices for understandable reasons
- They must be connected to at least 2 factions

Return JSON:
{
  "villainCore": {
    "name": "string",
    "title": "string",
    "description": "string — physical and personality",
    "motivation": "string — human, comprehensible",
    "history": "string — how they became what they are",
    "somethingTheyLove": "string",
    "missedPoint": "string — when they could have been stopped",
    "genuineArgument": "string — what they're right about",
    "currentPlan": "string — what they're doing RIGHT NOW",
    "resources": ["3-5 resources"],
    "weaknesses": ["2-4 weaknesses"],
    "archetype": "string"
  }
}`,
    user: `Create the main villain. Make them unforgettable.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 6 — THE MAIN THREAT & PROPHECY
// The looming danger, its escalation path, and any prophetic hooks.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step06_threat(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 3000,
    system: `Continue building the world. Create the main threat and prophecy.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

The threat should connect to the villain's plan but may be bigger than the villain.

Return JSON:
{
  "mainThreat": {
    "name": "string",
    "nature": "string — what IS this threat",
    "origin": "string",
    "motivation": "string",
    "currentPhase": "string",
    "escalation": ["4-6 stages of escalation"],
    "weakness": "string — how it COULD be stopped"
  },
  "centralArtifact": {
    "name": "string",
    "description": "string",
    "nature": "string — what it does",
    "currentLocation": "string",
    "guardedBy": "string",
    "dangerOfUse": "string",
    "history": "string"
  },
  "prophecy": {
    "text": "string — the actual prophetic text (poetic)",
    "interpretation": "string — what people THINK it means",
    "truth": "string — what it REALLY means",
    "relevanceToPlayer": "string"
  }
}`,
    user: `Create the main threat, central artifact, and prophecy.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 7 — GEOGRAPHY & REGIONS
// The map: regions, terrain, climate, connections.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step07_geography(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Create the geography.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Regions must connect to factions and reflect the political situation.
Map positions (x,y from 0-1) should be geographically coherent.

Return JSON:
{
  "geography": [
    {
      "id": "region-1",
      "name": "string",
      "description": "string",
      "terrain": "string",
      "climate": "string",
      "controlledBy": "faction name or contested",
      "dangerLevel": 1,
      "knownLocations": [
        { "name": "string", "type": "city|town|village|dungeon|ruin|landmark|wilderness|camp|fortress|temple|port", "description": "string", "significance": "string" }
      ],
      "mapPosition": { "x": 0.5, "y": 0.3 },
      "pointsOfInterest": ["2-4 items"],
      "travelNotes": "string"
    }
  ]
}

Generate 5-8 regions with 2-5 locations each.`,
    user: `Map out the geography: regions, terrain, and key locations.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 8 — SETTLEMENTS & CITIES
// Detailed cities with districts, NPCs, services, rumors, and laws.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step08_settlements(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Detail the major settlements.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

For each major city/town from the geography, flesh out districts, NPCs, services.
Every NPC has a secret. Every settlement has rumors that seed side quests.

Return JSON:
{
  "settlements": [
    {
      "id": "settlement-1",
      "name": "string",
      "type": "capital | city | town | village | outpost | camp | port | fortress",
      "region": "string — which region",
      "population": "string — e.g. ~5,000",
      "government": "string",
      "controllingFaction": "string",
      "description": "string",
      "districts": [
        { "name": "string", "description": "string", "notableLocations": ["2-3"], "dangerLevel": 1, "atmosphere": "string" }
      ],
      "keyNPCs": [
        { "name": "string", "role": "string", "personality": "string", "secret": "string", "questHook": "string" }
      ],
      "services": ["inn", "smith", "temple", "market"],
      "rumors": ["2-4 rumors"],
      "laws": ["1-3 local laws"],
      "economicProfile": "string"
    }
  ]
}

Detail 3-5 major settlements. Each should have 2-3 districts and 3-5 key NPCs.`,
    user: `Detail the major settlements: districts, NPCs, services, rumors.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 9 — COMPANIONS & PARTY MEMBERS
// Recruitable allies: their stories, combat roles, loyalty systems.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step09_companions(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Create recruitable companions.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Think Mass Effect / Dragon Age / Divinity. Each companion is a full character with:
- A role that complements the player (tank, healer, DPS, support, utility)
- A personal quest that intersects with the main story
- Opinions about other companions
- Loyalty triggers and potential for betrayal
- A secret or flaw that creates dramatic tension
The party should fill out archetypes the ${c.class} player needs.

Return JSON:
{
  "companions": [
    {
      "id": "companion-1",
      "name": "string",
      "race": "string",
      "class": "string",
      "level": 1,
      "role": "tank | healer | dps-melee | dps-ranged | support | utility",
      "personality": "string — 2-3 sentences",
      "backstory": "string — 2-3 sentences",
      "motivation": "string — what drives them",
      "recruitLocation": "string — where to find them",
      "recruitCondition": "string — what triggers joining",
      "loyaltyTriggers": ["3-4 actions that build loyalty"],
      "betrayalTriggers": ["2-3 actions that break trust"],
      "personalQuest": "string — their companion quest",
      "combatStyle": "string",
      "signature": "string — signature ability",
      "relationships": [
        { "companionId": "companion-2", "attitude": "friendly | rival | hostile | neutral | romantic-potential", "reason": "string" }
      ],
      "dialogueStyle": "string — how they speak",
      "secretOrFlaw": "string"
    }
  ]
}

Generate 5-7 companions. Cover tank, healer, DPS, and support roles.
At least one should be morally grey. At least one pair should have tension.`,
    user: `Create the recruitable companions: their roles, stories, and relationships.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 10 — BESTIARY & CREATURES
// World-native creatures, their ecology, loot, and lore connections.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step10_bestiary(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Create the bestiary — creatures native to this world.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Like Monster Hunter / Elder Scrolls creature design:
- Creatures should feel endemic to THIS world, not generic fantasy monsters
- Show an ecosystem: predators, prey, territorial creatures, symbiotes
- Some should be connected to factions, history, or the villain's plan
- Include a range from CR 1 to CR 10+

Return JSON:
{
  "bestiary": [
    {
      "id": "creature-1",
      "name": "string",
      "type": "beast | undead | elemental | construct | aberration | fiend | celestial | dragon | monstrosity | plant | ooze",
      "challengeRating": 1,
      "habitat": ["plains", "forest"],
      "description": "string — appearance and behavior",
      "behavior": "string — combat and exploration behavior",
      "loot": ["2-3 drops"],
      "weaknesses": ["1-2"],
      "resistances": ["0-2"],
      "isUnique": false,
      "loreConnection": "string — how it ties to world lore"
    }
  ]
}

Generate 10-15 creatures across all challenge ratings. Include 2-3 unique boss creatures.`,
    user: `Create the bestiary: creatures, their ecology, and lore connections.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 11 — DUNGEONS & ADVENTURE SITES
// Pre-planned dungeon crawls with floors, bosses, puzzles, traps.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step11_dungeons(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Design the major dungeon and adventure sites.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Think Dark Souls / Zelda / Divinity dungeon design:
- Each dungeon tells a story through its environment
- Multi-floor with escalating difficulty
- Puzzles that fit the world's lore and magic system
- Secret rooms that reward exploration
- A boss that connects to the story

Return JSON:
{
  "dungeons": [
    {
      "id": "dungeon-1",
      "name": "string",
      "location": "string — which region or settlement",
      "type": "dungeon | cave | tower | ruins | stronghold | labyrinth | mine | crypt | temple | lair",
      "levelRange": { "min": 1, "max": 5 },
      "floors": [
        {
          "level": 1,
          "name": "string",
          "description": "string",
          "roomCount": 6,
          "keyEncounters": ["2-3 notable encounters"],
          "environmentalHazards": ["1-2"],
          "lootHighlights": ["1-2 notable items"]
        }
      ],
      "boss": "string — creature or NPC name",
      "lore": "string — why this place exists",
      "reward": "string — what's at the end",
      "traps": ["2-4 trap types"],
      "puzzles": ["1-3 puzzles"],
      "secretRooms": ["1-2 secrets"],
      "factionTies": ["which factions care about this place"]
    }
  ]
}

Design 4-6 dungeons across different regions. One should be the villain's stronghold.`,
    user: `Design the major dungeons: floors, bosses, puzzles, and traps.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 12 — ECONOMY, CRAFTING & LOOT
// Trade routes, materials, crafting disciplines, and loot tables.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step12_economyAndCrafting(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Continue building the world. Create the economy, crafting, and loot systems.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Think Elder Scrolls / WoW crafting meets XCOM resource management:
- Rare materials tied to specific regions and creatures
- Crafting recipes that encourage exploration
- Regional price differences that reward trade
- World-specific loot with lore flavor

Return JSON:
{
  "economy": {
    "tradeGoods": [
      { "name": "string", "baseValue": 10, "abundance": "scarce | uncommon | common | abundant", "producedIn": ["region names"], "demandedIn": ["region names"] }
    ],
    "rareMaterials": [
      { "name": "string", "description": "string", "source": "string", "uses": ["what it crafts"], "value": 100, "dangerToObtain": "string" }
    ],
    "priceRegions": [
      { "region": "string", "priceModifier": 1.0, "specialties": ["cheap here"], "scarcities": ["expensive here"] }
    ],
    "blackMarket": "string — description of underground economy",
    "economicTensions": ["2-3 trade wars or embargoes"]
  },
  "crafting": {
    "description": "string — how crafting works in this world",
    "disciplines": [
      { "name": "string", "description": "string", "toolRequired": "string", "skillRequirements": "string" }
    ],
    "recipes": [
      { "name": "string", "discipline": "string", "inputs": [{ "material": "string", "quantity": 1 }], "output": "string", "difficulty": "novice | journeyman | expert | master", "specialConditions": "string" }
    ]
  },
  "lootTables": [
    {
      "name": "string — e.g. Forest Creature Drops, Dungeon Treasure",
      "context": "string — when to use",
      "items": [
        { "name": "string", "type": "weapon | armor | consumable | quest-item | material", "rarity": "common | uncommon | rare | epic | legendary | mythic", "description": "string", "properties": ["stat effect"], "value": 10, "loreNote": "string" }
      ]
    }
  ]
}

Generate 5-8 trade goods, 4-6 rare materials, 3-4 crafting disciplines with 4-6 recipes each, and 3-5 loot tables.`,
    user: `Build the economy, crafting system, and loot tables.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 13 — CAMPAIGN ARC, ENCOUNTERS & TRAVEL
// The full story structure: acts, beats, encounter tables, travel routes.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step13_campaignAndEncounters(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 6000,
    system: `Continue building the world. Map out the full campaign arc, encounter tables, and travel network.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

Think XCOM strategic layer meets DnD campaign guide:
- A 3-act structure with branching paths
- Player agency points where choices matter
- Encounter tables that reflect each region's ecology
- Travel routes with hazards and points of interest

Return JSON:
{
  "storyArc": {
    "title": "string — campaign title",
    "logline": "string — one-sentence hook",
    "acts": [
      {
        "actNumber": 1,
        "title": "string",
        "summary": "string",
        "keyBeats": [
          {
            "name": "string",
            "type": "quest | revelation | boss-fight | choice | companion-event | world-event | dungeon | social",
            "description": "string",
            "location": "string",
            "involvedNPCs": ["npc names"],
            "consequences": "string",
            "optional": false
          }
        ],
        "estimatedSessions": 5,
        "levelRange": { "min": 1, "max": 5 },
        "mainLocations": ["location names"],
        "newCompanions": ["companion IDs available this act"],
        "villainPhase": "string — what the villain is doing"
      }
    ],
    "possibleEndings": [
      { "name": "string", "condition": "string", "description": "string", "tone": "triumphant | bittersweet | tragic | ambiguous | pyrrhic" }
    ],
    "keyTwists": ["2-3 major revelations"],
    "recurringThemes": ["2-3 themes"],
    "playerAgencyPoints": ["3-5 key decision points"]
  },
  "encounterTables": [
    {
      "regionId": "string",
      "regionName": "string",
      "encounters": [
        { "name": "string", "type": "combat | social | environmental | mystery | merchant | ambush", "difficulty": "easy | medium | hard | deadly", "description": "string", "creatures": ["creature names"], "levelRange": { "min": 1, "max": 5 }, "special": "string" }
      ]
    }
  ],
  "travelNetwork": [
    { "from": "string", "to": "string", "method": "road | trail | river | sea | air | underground | portal | wilderness", "travelDays": 2, "dangerLevel": 2, "description": "string", "hazards": ["1-2"], "pointsOfInterest": ["1-2"], "controlledBy": "string" }
  ]
}

Create 3 acts with 4-6 beats each. 3-4 possible endings. Encounter tables for each region. 6-10 travel routes.`,
    user: `Map out the full campaign arc, encounter tables, and travel network.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 14 — RELATIONSHIPS, EVENTS & ORIGIN
// The web connecting everything, random events, and the opening scene.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step14_relationshipsAndOrigin(c: CharacterCreationInput, prev: string): StepPrompt {
  return {
    maxTokens: 5000,
    system: `Final step. Complete the world with the relationship web, random events, and origin scenario.
${charContext(c)}
WORLD SO FAR: ${prev}
${JSON_RULES}

The origin scenario must place the player in an IMMEDIATELY interesting situation.
Include the first NPC they meet — make them memorable.
End with 3-5 clear action choices that set the story in motion.

Return JSON:
{
  "relationshipWeb": [
    {
      "entityA": "string — name",
      "entityAType": "faction | npc | companion | villain | player | creature",
      "entityB": "string — name",
      "entityBType": "faction | npc | companion | villain | player | creature",
      "relationship": "ally | enemy | rival | servant | patron | lover | family | trade-partner | debtor | secret-ally | former-ally",
      "details": "string",
      "canChange": true
    }
  ],
  "randomEvents": [
    {
      "name": "string",
      "type": "weather | political | economic | supernatural | military | social | natural-disaster",
      "description": "string",
      "triggerCondition": "string",
      "effects": ["2-3 effects"],
      "duration": "string",
      "playerInteraction": "string"
    }
  ],
  "playerRole": "string — why this character matters to this world",
  "originScenario": {
    "setting": "string — where the story begins",
    "situation": "string — what's happening",
    "hook": "string — why the player is involved",
    "firstNPCIntro": "string — memorable first NPC encounter",
    "initialChoices": ["3-5 opening action choices"]
  }
}

Generate 10-15 relationship links, 6-10 random events, and an IMMEDIATELY gripping origin scenario.`,
    user: `Complete the world: relationship web, random events, and origin scenario.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP REGISTRY — Ordered pipeline for the route handler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface StepDefinition {
  id: number;
  name: string;
  label: string;  // User-facing label for loading screen
  buildPrompt: (c: CharacterCreationInput, prevContext: string, playerSentence?: string) => StepPrompt;
  isFirst?: boolean;
}

export const GENESIS_STEPS: StepDefinition[] = [
  { id: 1,  name: 'world-concept',    label: 'Forging the world concept...',             buildPrompt: (c, _p, s) => step01_worldConcept(c, s), isFirst: true },
  { id: 2,  name: 'magic-system',     label: 'Designing magic & power systems...',       buildPrompt: (c, p) => step02_magicSystem(c, p) },
  { id: 3,  name: 'history',          label: 'Writing deep history & legends...',        buildPrompt: (c, p) => step03_history(c, p) },
  { id: 4,  name: 'factions',         label: 'Building factions & politics...',          buildPrompt: (c, p) => step04_factions(c, p) },
  { id: 5,  name: 'villain',          label: 'Crafting the villain...',                  buildPrompt: (c, p) => step05_villain(c, p) },
  { id: 6,  name: 'threat',           label: 'Shaping the main threat & prophecy...',    buildPrompt: (c, p) => step06_threat(c, p) },
  { id: 7,  name: 'geography',        label: 'Mapping the world geography...',           buildPrompt: (c, p) => step07_geography(c, p) },
  { id: 8,  name: 'settlements',      label: 'Detailing cities & settlements...',        buildPrompt: (c, p) => step08_settlements(c, p) },
  { id: 9,  name: 'companions',       label: 'Creating companion characters...',         buildPrompt: (c, p) => step09_companions(c, p) },
  { id: 10, name: 'bestiary',         label: 'Populating the bestiary...',               buildPrompt: (c, p) => step10_bestiary(c, p) },
  { id: 11, name: 'dungeons',         label: 'Designing dungeons & adventure sites...',  buildPrompt: (c, p) => step11_dungeons(c, p) },
  { id: 12, name: 'economy-crafting', label: 'Building economy & crafting...',           buildPrompt: (c, p) => step12_economyAndCrafting(c, p) },
  { id: 13, name: 'campaign-arc',     label: 'Mapping the campaign arc...',              buildPrompt: (c, p) => step13_campaignAndEncounters(c, p) },
  { id: 14, name: 'relationships',    label: 'Weaving relationships & origin...',        buildPrompt: (c, p) => step14_relationshipsAndOrigin(c, p) },
];

export const TOTAL_STEPS = GENESIS_STEPS.length;
