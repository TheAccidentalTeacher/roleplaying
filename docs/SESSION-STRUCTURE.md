# Session Structure — Pacing, Recaps & Legacy
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: Every Session Tells a Story

A great TTRPG session has rhythm. It starts with "previously on...", builds through exploration, roleplay, and tension, peaks with a dramatic encounter, and resolves with reflection. Our AI DM doesn't just react — it **paces** the experience like a skilled game master. Every play session should feel like an episode of the best TV show you've ever watched.

---

## Session Flow

### The Session Arc

Every play session (regardless of length) follows a natural dramatic arc:

```
    ╱╲
   ╱  ╲         ← CLIMAX (major encounter/revelation)
  ╱    ╲
 ╱  ↗   ╲       ← RISING ACTION (building tension)
╱ ↗      ╲↘     ← RESOLUTION
╱          ╲↘
START        END
↑              ↑
OPENING        CLOSING
(recap +       (wrap-up +
 hook)          preview)
```

### Session Phases

```typescript
interface SessionStructure {
  sessionId: string
  sessionNumber: number
  startTime: Date
  
  phases: {
    opening: SessionOpening
    exploration: ExplorationPhase
    risingAction: RisingActionPhase
    climax: ClimaxPhase
    resolution: ResolutionPhase
    closing: SessionClosing
  }
  
  // AI pacing tracking
  pacingState: PacingState
  encounterCount: number
  restCount: number
  combatEncountersThisSession: number
  socialEncountersThisSession: number
  explorationThisSession: number
}
```

---

## Session Opening

### The Recap

Every session begins with a recap of what happened before. The AI generates this based on the chronicle:

```typescript
interface SessionOpening {
  // "Previously, on your adventure..."
  recap: {
    style: RecapStyle
    content: string           // AI-generated summary
    keyEvents: string[]       // Bullet points of important things
    unresolvedThreads: string[] // Dangling plot hooks
    lastLocation: string      // Where we left off
    lastAction: string        // What happened right before session ended
  }
  
  // Re-engagement hook
  hook: {
    type: 'immediate-danger' | 'new-discovery' | 'npc-approach' | 'quiet-moment' | 'time-skip'
    description: string
    choice: string[]          // Player options to kick things off
  }
}

type RecapStyle = 
  | 'narrator'       // "When last we left our heroes..."
  | 'campfire'       // "As you stir the morning fire, you recall..."
  | 'journal'        // A page from the character's journal
  | 'bard-song'      // A traveling bard sings of your deeds
  | 'dream'          // Fragments of memory in a dream
```

### Recap Examples

```
NARRATOR STYLE:
"When we last left our tale, you had just emerged from 
the Sunken Crypt, bearing the Amulet of Whispers. The 
undead army was routed, but the necromancer escaped 
through a portal to parts unknown. The village of 
Thornfield owes you a debt — but the amulet pulses 
with dark energy, and not everyone trusts the one who 
carries it.

Last time:
  - Defeated the Bone Knight commander
  - Recovered the Amulet of Whispers
  - Lyra was wounded and scarred (new scar: left arm)
  - The necromancer Vex escaped through a rift portal
  - Thornfield is safe... for now

Open threads:
  - Where did Vex flee?
  - What does the Amulet actually do?
  - The dwarven merchant wants to buy the amulet — should you sell it?"
```

```
JOURNAL STYLE:
"Your journal entry reads:

Day 23 — Thornfield

We won. The dead lie still again, but the victory 
tastes like ash. Vex slipped through our fingers. 
I can feel the amulet against my chest even through 
the leather pouch — it hums, a low vibration like 
a heartbeat that isn't mine. 

Lyra says the scar will heal. She won't look me 
in the eye when she says it.

Tomorrow we decide: follow Vex into the unknown, or 
answer the Duke's summons from Ironhaven. Both roads 
lead to trouble.

- Kael"
```

### Session Start Hook Types

```
IMMEDIATE DANGER:
  "You wake to the sound of screaming. Something is 
   wrong in Thornfield — the ground is shaking and 
   purple light pours from the abandoned mine shaft 
   at the edge of town."

NEW DISCOVERY:
  "As you examine the Amulet over breakfast, you 
   notice something you missed before — tiny runes 
   along the inner rim. They're in a language Lyra 
   recognizes: Deep Elvish. She goes pale."

NPC APPROACH:
  "You're packing your supplies when a messenger 
   arrives, breathless and mud-splattered. He bears 
   the seal of Duke Ironhand. 'You must come. Now. 
   The Duke is... the Duke is dying.'"

QUIET MOMENT:
  "The morning is peaceful. Birdsong and wood-smoke 
   and the distant sound of the river. After 
   everything you've been through, you have a rare 
   moment of peace. How do you spend it?"

TIME SKIP:
  "A week passes in Thornfield. You help rebuild, 
   train with the militia, and get to know the 
   villagers. On the seventh morning, the peace 
   is shattered by [hook]."
```

---

## Pacing Engine

### The AI Pacing Model

The AI tracks the session's pacing and adjusts dynamically:

```typescript
interface PacingState {
  currentTension: number        // 0-100 tension meter
  targetTensionCurve: number[]  // Where tension should be over time
  
  // Recent activity tracking
  consecutiveCombats: number    // Too many = player fatigue
  consecutiveSocial: number     // Too many without action = restlessness
  consecutiveExploration: number
  timeSinceLastCombat: number   // Minutes of real play time
  timeSinceLastRest: number     // In-game time since rest
  
  // Resource tracking for pacing
  playerHPPercentage: number    // Low HP = tension naturally high
  spellSlotsRemaining: number   // Low resources = climax approaching
  healingPotionsRemaining: number
  
  // Session timing
  estimatedSessionLength: number // Player's typical session length
  currentSessionDuration: number // How long this session has been
  percentComplete: number        // Rough estimate of session progress
}
```

### Pacing Rules

```
THE RHYTHM:
  - Alternate encounter types: combat → social → exploration → combat
  - Never more than 2 consecutive combats without a breather
  - Never more than 30 minutes (real time) without a meaningful choice
  - After a major combat, give a "decompression" scene
  - After emotional roleplay, follow with lighter activity

TENSION CURVE:
  Session Start — Tension 20-30 (re-engagement, setup)
  Early Session — Tension 30-50 (building, exploring)
  Mid Session — Tension 50-70 (complications, stakes rising)
  Pre-Climax — Tension 70-85 (everything on the line)
  Climax — Tension 85-100 (the big fight/choice/revelation)
  Post-Climax — Tension 20-40 (resolution, reward, future hooks)

IF PLAYER IS LOW ON RESOURCES:
  - The AI recognizes this is natural climax territory
  - Next significant encounter should be THE encounter
  - Don't throw more trash fights — go to the boss/goal
  - Offer a "last chance to rest" before the final push

IF PLAYER SEEMS DISENGAGED:
  Signals: Very short responses, choosing "skip" options frequently
  Response: Introduce a twist, a surprise, or ask "What would make 
            this more interesting?"
```

### Encounter Mix Guidelines

```
PER SESSION (assuming ~2 hour session):

  Ideal Mix:
    2-3 Combat encounters (40% of content)
    2-3 Social/roleplay scenes (30% of content)
    1-2 Exploration/puzzle sequences (20% of content)
    1 Quiet/rest moment (10% of content)
  
  Variation by game phase:
    DUNGEON CRAWL: 4 combat, 1 puzzle, 1 discovery = higher intensity
    CITY ARC: 1 combat, 4 social, 1 exploration = narrative focused
    WILDERNESS: 2 combat, 1 social, 3 exploration = journey focused
    BOSS SESSION: 1 massive combat, 2 buildup scenes = climax focused
```

---

## The Chronicle System

### Automatic Session Journal

The game automatically maintains a **Chronicle** — a living record of everything that happens:

```typescript
interface Chronicle {
  entries: ChronicleEntry[]
  worldState: WorldStateSnapshot   // Current state of the world
  relationships: NPCRelationship[] // All NPC relationships
  questLog: QuestEntry[]           // All quests (active, complete, failed)
  
  // Generation
  style: ChronicleStyle            // How entries are written
  autoGenerate: boolean            // Generate after each significant event
}

interface ChronicleEntry {
  id: string
  sessionNumber: number
  dayInGame: number
  timestamp: Date                  // Real-world time
  
  type: ChronicleEntryType
  title: string                    // "The Battle of Thornfield"
  summary: string                  // 2-3 sentence summary
  detailedAccount: string          // Full narrative paragraph(s)
  
  // What happened
  significantEvents: string[]
  npcsInvolved: string[]
  locationsVisited: string[]
  itemsGained: string[]
  itemsLost: string[]
  decisionsMode: string[]          // Key player choices
  consequencesNoted: string[]      // Known consequences of choices
  
  // Mood and tone
  mood: string                     // "triumphant", "somber", "mysterious"
  playerSentiment?: string         // If player expressed feelings
}

type ChronicleEntryType = 
  | 'combat'         // Battle description
  | 'quest-start'    // New quest accepted
  | 'quest-complete' // Quest resolved
  | 'discovery'      // Found something important
  | 'social'         // Significant conversation/relationship change
  | 'travel'         // Journey between locations
  | 'rest'           // Campfire scene or downtime
  | 'level-up'       // Character advancement
  | 'death'          // Character or important NPC death
  | 'world-event'    // Something happened in the world
  | 'milestone'      // Achievement or significant moment

type ChronicleStyle = 
  | 'historical'     // "On the 14th day of Greenleaf, the party..."
  | 'journal'        // "I write this by candlelight. We barely survived..."
  | 'bardic'         // "And lo, did the heroes of Thornfield rise..."
  | 'newspaper'      // "ADVENTURERS SLAY BONE KNIGHT — Thornfield Saved"
  | 'neutral'        // Clean, factual summary
```

### Chronicle UI

The player can access the Chronicle from the menu:

```
╔═══════════════════════════════════════════╗
║          📜 THE CHRONICLE                 ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Session 7 — Day 23 — "The Price of       ║
║  Salvation"                               ║
║                                           ║
║  The battle for Thornfield reached its    ║
║  climax in the Sunken Crypt. After        ║
║  fighting through waves of undead, you    ║
║  confronted the Bone Knight commander     ║
║  in the deepest chamber.                  ║
║                                           ║
║  Key Events:                              ║
║  ● Defeated the Bone Knight (-4,200 XP)   ║
║  ● Recovered the Amulet of Whispers       ║
║  ● Lyra scarred by necrotic bolt          ║
║  ● Necromancer Vex escaped through rift   ║
║  ● Thornfield liberated                   ║
║                                           ║
║  Decisions Made:                          ║
║  ✦ Chose to spare the undead dwarves      ║
║  ✦ Kept the amulet (didn't destroy it)    ║
║  ✦ Promised vengeance against Vex         ║
║                                           ║
║  [◄ Session 6]  [Session 8 ►]            ║
║  [Full Timeline]  [Quest Log]  [World Map]║
╚═══════════════════════════════════════════╝
```

### Chronicle Search & Reference

The Chronicle is searchable. The player can look up:
- **NPC**: "What do I know about the Duke?" → All entries mentioning the Duke
- **Location**: "What happened at Thornfield?" → All entries set in Thornfield
- **Item**: "Where did I get the silver key?" → Entry where the key was found
- **Quest**: "What's the quest about Vex?" → All entries related to the Vex quest line

The AI can also reference the Chronicle when the player asks:
```
Player: "Wait, didn't that merchant say something about
         a hidden temple?"
         
AI/DM: *checks chronicle*
       "Yes — in Session 4, the merchant Gilda mentioned 
        a 'temple of the old gods' hidden in the Thornwood. 
        She said sometimes you can hear chanting at midnight 
        near the standing stones."
```

---

## Session Closing

### The Wind-Down

When the AI detects the session is reaching a natural stopping point (or the player indicates they want to stop):

```typescript
interface SessionClosing {
  // Wrap-up
  wrapUp: {
    cliffhanger: boolean          // End on a dramatic beat?
    safeHaven: boolean            // Party in a safe location?
    openLoops: string[]           // Unresolved tensions
    nextHook: string              // "Next time..." teaser
  }
  
  // Session summary
  summary: {
    duration: number              // Real-time session length
    daysPassed: number            // In-game time elapsed
    xpEarned: number
    goldEarned: number
    itemsFound: string[]
    questsAdvanced: string[]
    decisionsRecap: string[]      // Key choices this session
    characterGrowth: string       // How the character developed
  }
  
  // End-of-session choices
  endChoices: {
    save: boolean                 // Auto-save state
    generateChronicle: boolean    // Write chronicle entry
    reviewCharacterSheet: boolean // Level up, manage inventory
    setNextGoal: string          // "What do you want to do next session?"
  }
}
```

### Session End Examples

```
CLIFFHANGER ENDING:
"As you settle into the inn at Millhaven, exhausted from 
the road, a knock at the door. You open it to find — 
no one. Just a letter on the floor, sealed with black 
wax. The seal bears a skull with a crown of thorns.

The letter reads: 'I know what you carry. I know what 
it whispers to you at night. We should talk.'

[End of Session]

SESSION SUMMARY:
  ⏱ Duration: 1 hour 45 minutes
  📅 Days Passed: 3 (Day 23 → Day 26)
  ⭐ XP Earned: 1,200
  💰 Gold Earned: 85
  📦 Items: Amulet of Whispers, 3 healing potions
  📋 Quests: 'The Necromancer's Trail' advanced
  🎭 Key Choice: Kept the amulet despite warnings
  
  [Save & Quit]  [Continue Playing]  [Review Character]"
```

```
SAFE HAVEN ENDING:
"The fire crackles low in your room at the Crossed 
Swords tavern. Through the window, you can see the 
first stars appearing. Tomorrow, you'll decide: follow 
the Duke's summons, or hunt the necromancer. Tonight, 
you rest.

What would you like to focus on next time?
  [Follow the Vex trail — action/combat focus]
  [Answer the Duke's summons — political/social focus]
  [Explore the Thornwood temple — mystery/exploration focus]
  [Train and prepare — downtime/character building]
  [I don't know yet — surprise me]"
```

---

## Epilogue & Legacy System

### Character Retirement

When a character's story reaches its natural conclusion (or they die permanently), the legacy system activates:

```typescript
interface CharacterLegacy {
  character: CharacterSummary
  
  // Story completion
  finalChapter: {
    endingType: EndingType
    finalNarrative: string      // AI-generated final story paragraph
    worldImpact: string[]       // How the world changed because of them
    questsCompleted: number
    questsFailed: number
    majorDecisions: string[]    // The big choices and their outcomes
  }
  
  // Stats & Achievements
  statistics: {
    totalPlayTime: number       // Hours
    totalSessions: number
    finalLevel: number
    enemiesDefeated: number
    goldEarned: number
    goldSpent: number
    deathCount: number          // Times they fell unconscious
    criticalHits: number
    fumbles: number
    npcsHelped: number
    npcsBetrayed: number
    bossesDefeated: string[]
    exploredLocations: number
    secretsFound: number
  }
  
  // Legacy effects
  legacy: {
    hallOfHeroesEntry: HallOfHeroesEntry
    legacyItems: LegacyItem[]    // Items that can appear in future games
    legacyNPCs: LegacyNPC[]     // Named NPCs who carry the character's memory
    worldChanges: WorldChange[]  // Permanent world modifications
    unlocks: string[]            // New options unlocked for future characters
  }
}

type EndingType = 
  | 'heroic-triumph'     // Saved the world, lived to tell the tale
  | 'sacrifice'          // Died saving others
  | 'retirement'         // Settled down, opened a shop, became a king
  | 'corruption'         // Fell to darkness
  | 'mystery'            // Disappeared, fate unknown
  | 'death-permanent'    // Killed, no resurrection
  | 'ascension'          // Became something more than mortal
  | 'exile'              // Left the known world
```

### The Epilogue Sequence

When a character retires, the AI generates a full epilogue:

```
EPILOGUE — KAEL STORMBLADE

The Amulet of Whispers was destroyed in the fires of 
Mount Ashfall, and with it, Vex's power was broken. The 
dead returned to their rest. The living mourned, then 
rebuilt.

Kael returned to Thornfield — not as a stranger this 
time, but as a hero. They offered him the lordship. He 
declined. Instead, he built a small house by the river, 
hung his sword above the fireplace, and opened a school 
for young adventurers.

Lyra stayed for a time, teaching the students magic. 
Eventually, she answered the call of the Elven Academy 
and returned to her people, though she visits every 
spring when the flowers bloom.

Throk went back to the mountains, but not before sharing 
one last ale at the Crossed Swords. He left his battle 
horn with Kael. "You'll know when to blow it," he said, 
and walked into the snow.

FINAL STATISTICS:
  Level 12 Human Fighter (Champion)
  23 sessions — 47 hours of adventure
  168 enemies defeated
  12 quests completed, 2 failed
  3,847 gold earned
  7 near-death experiences
  1 true love found (Lyra? ...it's complicated)
  
WORLD IMPACT:
  ✦ Thornfield is now a thriving town
  ✦ The Sunken Crypt is sealed permanently
  ✦ Vex's cult was dismantled
  ✦ The Amulet of Whispers no longer exists
  ✦ A school for adventurers trains the next generation

LEGACY UNLOCKED:
  🗡️ [Kael's Blade] may appear in future playthroughs
  👤 [Old Man Kael] may appear as a quest-giving NPC
  📖 [School of Heroes] available as a starting background
  🌍 Thornfield appears as an established city in future worlds
```

### Hall of Heroes

All retired/completed characters go into the **Hall of Heroes** — a meta-game gallery:

```typescript
interface HallOfHeroesEntry {
  characterName: string
  title: string               // "Kael Stormblade, Hero of Thornfield"
  portrait: string            // Character portrait URL
  level: number
  class: string
  race: string
  
  endingType: EndingType
  epitaph: string             // One-line summary: "He came to save one village and saved the world."
  
  // Sorting/display
  completionDate: Date
  totalPlaytime: number
  difficultyPlayed: string
  
  // Comparison
  ranking: {
    overallScore: number       // Composite score for leaderboard
    combatProwess: number
    socialMastery: number
    explorationDepth: number
    roleplayQuality: number
  }
}
```

```
╔═══════════════════════════════════════════════╗
║           ⚔️ HALL OF HEROES ⚔️               ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  🥇 KAEL STORMBLADE                          ║
║     Level 12 Human Fighter (Champion)         ║
║     "He came to save one village and          ║
║      saved the world."                        ║
║     23 sessions · Heroic Triumph              ║
║     [View Chronicle] [Continue in NG+]        ║
║                                               ║
║  🥈 SHADOW WHISPER                            ║
║     Level 8 Tiefling Rogue (Assassin)         ║
║     "They never found out her real name."     ║
║     11 sessions · Mystery                     ║
║     [View Chronicle] [Continue in NG+]        ║
║                                               ║
║  🥉 BROTHER ALDRIC                            ║
║     Level 6 Human Cleric (Life)               ║
║     "He healed the world but couldn't         ║
║      heal himself."                           ║
║     7 sessions · Sacrifice                    ║
║     [View Chronicle]                          ║
║                                               ║
║  [Start New Character]  [Import Character]    ║
╚═══════════════════════════════════════════════╝
```

### New Game Plus (NG+)

When a character completes their story, NG+ becomes available:

```typescript
interface NewGamePlus {
  sourceCharacter: string      // Who completed the original game
  
  ngPlusFeatures: {
    // What carries over
    carryOver: {
      oneItem: string          // Choose ONE legendary item to keep
      goldPercentage: number   // Keep 10% of gold
      knownRecipes: string[]   // Keep crafting recipes
      mapKnowledge: boolean    // Keep discovered locations (grayed out)
      bestiaryKnowledge: boolean // Keep monster knowledge
    }
    
    // What changes
    worldChanges: {
      newFaction: boolean       // A new faction based on previous actions
      legacyNPCs: string[]     // NPCs who remember the previous hero
      alteredHistory: string[]  // World reflects previous playthrough
      newThreats: string[]     // New enemies that arose from past actions
      hiddenContent: string[]  // Content that was locked before
    }
    
    // Difficulty
    enemyScaling: number       // +10% enemy stats
    newEnemyTypes: boolean     // Unique NG+ enemies
    trueEnding: boolean        // Access to the "real" final boss/story
  }
}
```

---

## Save System

### Auto-Save Points

The game auto-saves at key moments:

```typescript
interface SaveSystem {
  autoSavePoints: string[]
  // Auto-save triggers:
  // - Start of each session
  // - After combat encounters
  // - After quest milestones
  // - After level up
  // - After significant story choices
  // - Every 10 minutes of play
  // - On session end
  
  saveSlots: {
    autosave: SaveState          // Most recent auto-save
    quicksave: SaveState         // Player-triggered quick save
    manualSaves: SaveState[]     // Up to 10 manual saves
  }
}

interface SaveState {
  id: string
  timestamp: Date
  sessionNumber: number
  characterName: string
  level: number
  location: string
  questSummary: string
  playtime: number
  thumbnail?: string           // Screenshot of the moment
  
  // Full game state
  characterState: CharacterState
  worldState: WorldState
  questState: QuestState
  inventoryState: InventoryState
  chronicleState: ChronicleState
  npcRelationships: NPCRelationshipState
  mapState: MapState
}
```

### Continue Screen

When returning to the game:

```
╔═══════════════════════════════════════════════╗
║           CONTINUE YOUR ADVENTURE             ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  🔄 AUTOSAVE — 2 hours ago                   ║
║     Kael (Lvl 12) — Millhaven Inn             ║
║     Day 26 · Session 7 · 47h played           ║
║     "Received mysterious letter..."           ║
║     [Continue]                                ║
║                                               ║
║  💾 QUICK SAVE — 3 hours ago                  ║
║     Kael (Lvl 12) — Thornfield                ║
║     Day 24 · Session 7 · 45h played           ║
║     "After defeating the Bone Knight"         ║
║     [Load]                                    ║
║                                               ║
║  📁 Manual Saves (3)                          ║
║     [View All Saves]                          ║
║                                               ║
║  [New Character]  [Hall of Heroes]            ║
╚═══════════════════════════════════════════════╝
```

---

## AI Pacing Integration

### How the AI Manages Session Flow

The AI doesn't just respond — it **orchestrates**:

```
AI PACING DIRECTIVES:

1. TRACK THE ARC
   Know where the session is in its arc. If we're 30+ minutes in 
   and still at low tension, introduce a complication.

2. READ THE PLAYER
   Short responses = bored or tired → accelerate toward climax
   Long responses = engaged → lean into the current scene
   Questions about lore = curious → provide more world detail
   "Can I rest?" = resource-depleted → this is pre-climax territory

3. MANAGE EXHAUSTION (real player, not character)
   After 2+ hours: Start looking for closure points
   After 3+ hours: Actively create a stopping point
   If player seems tired: "This seems like a good place to rest. 
   Save and continue next time?"

4. CLIFFHANGER AWARENESS
   If the player says they need to stop, find the nearest 
   dramatic beat to end on. Don't end mid-combat or mid-nothing.
   
5. VARIETY ENFORCEMENT
   Never let the session become monotonous. If it's been 
   all combat, introduce an NPC. If it's been all talking, 
   something exciting happens.

6. REWARD PACING
   Loot and XP should feel earned, not random. Major rewards 
   come at major milestones. Small rewards peppered throughout.
```

### Session Metrics (Hidden from Player)

The AI tracks these internally to manage pacing:

```typescript
interface SessionMetrics {
  // Engagement signals
  averageResponseLength: number   // Player's average message length
  responseTimeAverage: number     // How quickly player responds
  questionsAsked: number          // Player curiosity level
  
  // Content balance
  combatMinutes: number
  socialMinutes: number
  explorationMinutes: number
  puzzleMinutes: number
  restMinutes: number
  
  // Satisfaction signals
  exclamationMarks: number        // Excitement indicator
  laughIndicators: number         // "lol", "haha", etc.
  frustrationIndicators: number   // Repeated attempts, short responses
  
  // Session health
  deathsThisSession: number
  resourcesRemainingPercent: number
  majorChoicesMade: number
  plotAdvancement: number          // 0-100, how much story progressed
}
```

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Session structure | 5-phase arc: opening → exploration → rising action → climax → resolution | Every session = mini story |
| Recap system | AI-generated, 5 styles (narrator, journal, bardic, campfire, dream) | Immersive re-engagement |
| Session hooks | 5 types: immediate danger, discovery, NPC approach, quiet moment, time skip | Varied session starts |
| Pacing engine | AI tracks tension 0-100, adjusts encounter types/difficulty dynamically | Invisible to player |
| Encounter mix | ~40% combat, 30% social, 20% exploration, 10% rest per session | Variety is key |
| Chronicle system | Auto-generated journal, searchable, multiple writing styles | Living history |
| Chronicle UI | Per-session entries with events, decisions, NPCs, items | Accessible and useful |
| Session closing | Summary stats + cliffhanger or safe haven ending + next session goal | Clean wrap-up |
| Epilogue system | AI-generated character ending with full statistics and world impact | Story conclusion |
| Legacy items | Retired character's items can appear in future playthroughs | Cross-character continuity |
| Hall of Heroes | Gallery of all completed characters with rankings and chronicles | Meta-progression |
| New Game Plus | Keep 1 item, 10% gold, recipes, map knowledge, world reflects past actions | Replayability |
| Save system | Auto-save at key moments + quick save + 10 manual slots | Never lose progress |
| AI pacing rules | Read player engagement, manage arc, enforce variety, find stopping points | Smart DM behavior |
| Session metrics | Hidden engagement tracking (response length, speed, frustration signals) | AI self-correction |
