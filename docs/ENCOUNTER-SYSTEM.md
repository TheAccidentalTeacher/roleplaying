# Encounter System — Full Design Specification
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: Every Fight Is a Story

In TTRPG, the DM doesn't randomly slam enemies at the party. Every encounter is **designed**: it has a purpose, a difficulty curve, environmental context, and a place in the narrative arc. The goblin ambush on the road exists to foreshadow the goblin king in the dungeon. The dragon at the end of the cave exists because you spent 4 hours getting there.

Our AI DM needs to replicate this intuition. Not "random encounter table" — **intelligent encounter design** that considers:
- Where you are in the story arc
- Your current resource state (HP, mana, abilities remaining)
- The narrative purpose of this fight
- Environmental opportunities
- Party composition and level
- The pacing rhythm (when was the last combat?)

---

## Challenge Rating Equivalent: Threat Level

D&D uses Challenge Rating (CR) to measure monster difficulty. We need an equivalent that works with AI-generated encounters.

### The Threat Level System

Every encounter has a **Threat Level (TL)** from 1-20, calibrated to the party's capabilities:

```typescript
interface ThreatAssessment {
  threatLevel: number           // 1-20 scale
  difficulty: EncounterDifficulty
  expectedRounds: number        // How long this fight should last
  expectedResourceCost: ResourceCost
  partyWipeRisk: number         // 0.0 to 1.0 probability
  narrativePurpose: string      // Why this fight exists in the story
}

type EncounterDifficulty = 
  | 'trivial'      // TL 1-3:  Party stomps with minimal effort
  | 'easy'         // TL 4-6:  Manageable, uses few resources
  | 'moderate'     // TL 7-9:  Challenging, significant resource expenditure
  | 'hard'         // TL 10-12: Dangerous, real risk, heavy resources
  | 'deadly'       // TL 13-15: Party might lose members
  | 'epic'         // TL 16-18: Boss fights, all-or-nothing
  | 'legendary'    // TL 19-20: Campaign-defining, everything on the line

interface ResourceCost {
  estimatedHPLoss: number       // % of party total HP
  estimatedManaSpent: number    // % of party total mana
  estimatedAbilitiesUsed: number // Count of per-rest abilities
  estimatedItemsConsumed: number // Potions, scrolls, etc.
  estimatedHitDiceNeeded: number // For short rest recovery after
}
```

### Threat Level Calculation

The AI calculates TL dynamically based on party state:

```typescript
function calculateThreatLevel(
  enemies: EnemyGroup,
  party: PartyState,
  environment: BattlefieldContext
): ThreatAssessment {
  // Factors that increase threat:
  // - Enemy total HP vs party total HP
  // - Enemy damage output vs party AC/HP
  // - Number advantage (outnumbered = harder)
  // - Enemy special abilities (magic, flight, resistances)
  // - Environmental disadvantages (darkness, difficult terrain)
  // - Party resource depletion (low HP, spent abilities)
  // - Surprise (ambush = significantly harder)
  
  // Factors that decrease threat:
  // - Party level advantage
  // - Environmental advantages (choke points, high ground)
  // - Party composition synergy (tank + healer + dps)
  // - Party has information (analyzed enemies before)
  // - Pre-combat preparation (buffs, traps, positioning)
  
  const rawThreat = computeRawThreat(enemies, party)
  const environmentMod = computeEnvironmentModifier(environment)
  const resourceMod = computeResourceStateModifier(party)
  
  return {
    threatLevel: clamp(rawThreat + environmentMod + resourceMod, 1, 20),
    // ... other fields
  }
}
```

### Enemy Stat Blocks

Every enemy the AI creates follows a structured stat block:

```typescript
interface EnemyStatBlock {
  // Identity
  name: string                  // "Orc Berserker", "Shadow Wraith", "Malfunctioning Security Bot"
  type: CreatureType            // humanoid, beast, undead, construct, aberration, etc.
  alignment?: string            // "chaotic evil", "neutral", "lawful good"
  
  // Core Stats
  level: number                 // Equivalent to party level range
  hp: { current: number; max: number }
  ac: number
  speed: number                 // Feet per round
  
  // Ability Scores
  str: number; dex: number; con: number
  int: number; wis: number; cha: number
  
  // Combat
  attacks: EnemyAttack[]
  specialAbilities: SpecialAbility[]
  reactions: Reaction[]         // Opportunity attacks, counters
  
  // Defenses
  resistances: string[]         // "fire", "physical", etc.
  vulnerabilities: string[]     // "cold", "radiant"
  immunities: string[]          // "poison", "psychic"
  conditionImmunities: string[] // "frightened", "charmed"
  savingThrowBonuses: { [key: string]: number }
  
  // AI Behavior
  tactics: EnemyTactics
  morale: number                // 0-100, flees when low
  moraleBreakpoint: number      // HP% where morale checks begin
  intelligenceLevel: 'mindless' | 'animal' | 'low' | 'average' | 'high' | 'genius'
  
  // Meta
  threatContribution: number    // How much this enemy adds to encounter TL
  xpValue: number
  lootTable: string             // Reference to loot table ID
  bestiary: BestiaryEntry
}

interface EnemyAttack {
  name: string              // "Greataxe Swing", "Bite", "Laser Blast"
  type: 'melee' | 'ranged' | 'spell' | 'special'
  toHit: number             // Attack bonus
  damage: string            // "2d12 + 5 slashing"
  range: string             // "5ft" or "60/120ft"
  properties: string[]      // "reach", "finesse", "heavy"
  specialEffect?: string    // "Target must make DC 14 CON save or be poisoned"
}

interface EnemyTactics {
  preferredTargets: string[]     // ["lowest HP", "spellcaster", "healer"]
  openingMove: string            // "Charge the nearest enemy" or "Cast buff spell"
  retreatCondition: string       // "Below 25% HP and not enraged"
  groupBehavior: string          // "Flank with allies" or "Protect the shaman"
  specialTriggers: TacticTrigger[]
}

interface TacticTrigger {
  condition: string          // "ally dies", "HP below 50%", "outnumbered"
  action: string             // "enter rage", "call reinforcements", "attempt to flee"
}
```

---

## Encounter Types

### 1. Story Encounters (Scripted by Quest)

The quest module defines key encounters tied to the narrative:

```
Quest: "The Shadow Over Millhaven"
  Encounter 1 (TL 5, Easy): Zombie patrol on the outskirts — establishes undead threat
  Encounter 2 (TL 8, Moderate): Ghoul pack in the cemetery — raises the stakes
  Encounter 3 (TL 7, Moderate): Corrupted priest — moral dilemma, can be avoided
  Encounter 4 (TL 12, Hard): Wight commander + skeleton horde — dungeon climax
  Encounter 5 (TL 16, Epic): The Shadow Lich — final boss
```

These are generated by Claude Opus when the quest is created. They have narrative context, escalating difficulty, and meaningful variety.

### 2. Exploration Encounters (Semi-Random)

While traveling or exploring, the AI generates encounters based on location:

```typescript
interface ExplorationEncounterTable {
  regionId: string
  regionDangerLevel: 1 | 2 | 3 | 4 | 5
  
  encounterTypes: {
    combat: number        // Weight: 40%
    social: number        // Weight: 25%
    environmental: number // Weight: 15%
    discovery: number     // Weight: 15%
    nothing: number       // Weight: 5%
  }
  
  combatEncounters: EncounterSeed[]
  socialEncounters: EncounterSeed[]
  environmentalEvents: EncounterSeed[]
  discoveries: EncounterSeed[]
}

interface EncounterSeed {
  description: string    // "A band of highway robbers"
  threatRange: [number, number]  // [4, 8] — TL range
  factionTied?: string   // Ties to a faction in the world
  storyHook?: string     // Could lead to a side quest
  timeOfDay?: string     // "night only", "dawn", "any"
  weatherCondition?: string // "rain", "fog", "clear"
  prerequisites?: string[] // Things that must be true in world state
}
```

### 3. Random Encounters (True Random)

For wilderness travel, a lightweight random encounter check:

```
Every travel segment (4 hours of in-game travel):
  Roll d20
  
  1-10: Nothing happens (safe travel, AI narrates scenery)
  11-14: Environmental event (weather, terrain obstacle, natural wonder)
  15-17: Social encounter (travelers, merchant, patrol)
  18-19: Combat encounter (scaled to region danger level)
  20: Unusual encounter (something truly unexpected — AI gets creative)
```

The frequency adjusts:
- Safe roads: Roll only once per day
- Wilderness: Roll every 4 hours
- Enemy territory: Roll every 2 hours
- Extremely dangerous zone: Roll every hour

### 4. Ambushes & Surprise

Some encounters begin with one side surprised:

```typescript
interface SurpriseState {
  partySurprised: boolean
  enemiesSurprised: boolean
  
  // If party is surprised:
  // - Enemies get a free round of actions
  // - Party members can't take reactions
  // - Stealth characters may avoid surprise (DEX save)
  
  // If enemies are surprised:
  // - Party gets a free round
  // - Assassination damage applies (rogue)
  // - Can set up positioning before enemies act
  
  awarenessCheck: {
    dc: number               // Perception DC to detect ambush
    partyBestPerception: number
    result: 'detected' | 'partially-detected' | 'ambushed'
  }
}
```

### 5. Multi-Stage Encounters

Boss fights and set pieces that evolve:

```
STAGE 1: The Dragon lands. Fight it on the ground.
  (TL 14, enemies: Adult Dragon)

STAGE 2: At 50% HP, the dragon takes flight. 
  Ranged/magic only. It strafes with breath weapon.
  (TL increases to 15, add: 2 Dragon Wyrmlings join)

STAGE 3: The cavern begins to collapse!
  Fight while dodging falling rocks (environmental hazard).
  Dragon is weakened but desperate.
  (TL 13, but environmental damage adds pressure)

STAGE 4: The dragon crashes through the floor.
  Follow it down? Or let it escape?
  (Player choice: push for the kill or retreat)
```

### 6. Wave Encounters

Enemies arrive in waves, testing endurance:

```typescript
interface WaveEncounter {
  totalWaves: number
  currentWave: number
  waves: {
    waveNumber: number
    enemies: EnemyGroup
    triggerCondition: string   // "previous wave defeated" or "after 3 rounds"
    reinforcementNarrative: string  // "More orcs pour through the gate!"
  }[]
  
  // Between waves, player can:
  // - Quick heal (bonus action equivalent)
  // - Reposition
  // - Prepare (set traps, buff)
  // - NO short rest (combat is ongoing)
  
  bonusForClearingAllWaves: string  // Extra loot, XP bonus, reputation
}
```

---

## Encounter Building: The AI Process

### Step 1: Determine Context

Before generating any encounter, the AI considers:

```typescript
interface EncounterContext {
  // Story position
  questPhase: 'introduction' | 'rising-action' | 'climax' | 'falling-action' | 'resolution'
  narrativePurpose: string     // Why this fight should exist right now
  
  // Pacing
  combatsSinceLastRest: number
  totalResourcesRemaining: number  // % of party's total resources
  lastCombatDifficulty: EncounterDifficulty
  playerEngagement: 'high' | 'medium' | 'low'  // Based on response length/speed
  
  // World state
  currentLocation: string
  locationDangerLevel: number
  activeFactions: string[]
  timeOfDay: string
  weather: string
  
  // Party state
  partyLevel: number
  partySize: number
  partyComposition: string[]   // Classes present
  partyHP: number              // % of total
  availableAbilities: number   // Count of unused per-rest abilities
}
```

### Step 2: Select Difficulty

The AI uses an **encounter budget** system per adventure day:

```
TARGET: 6-8 encounters per adventuring day (before needing a long rest)
  2-3 Easy encounters (TL 4-6)
  2-3 Moderate encounters (TL 7-9)
  1-2 Hard encounters (TL 10-12)
  0-1 Deadly encounter (TL 13-15)

RESOURCE CURVE:
  Start of day: Party at full → face harder encounters
  Mid-day: Party at 60% → moderate encounters
  End of day: Party depleted → either retreat to rest or face one final hard fight
  
  This creates the "do we push on or rest?" decision point
```

The AI adapts this budget dynamically:
- If the player is breezing through combats → increase difficulty
- If the player is struggling → reduce difficulty or offer escape routes
- If the player seems disengaged → skip to story-relevant encounters
- If the player is loving combat → more encounters, more variety

### Step 3: Generate Enemies

Claude generates enemies appropriate to the context:

```typescript
const encounterGenPrompt = (context: EncounterContext): string => `
Generate a combat encounter for an AI RPG.

CONTEXT:
- Location: ${context.currentLocation}
- World genre: ${context.worldGenre}
- Story phase: ${context.questPhase}
- Narrative purpose: ${context.narrativePurpose}
- Party: Level ${context.partyLevel}, ${context.partySize} members (${context.partyComposition.join(', ')})
- Party resources: ${context.totalResourcesRemaining}% remaining
- Target difficulty: ${context.targetDifficulty} (Threat Level ${context.targetTL})
- Last combat was: ${context.lastCombatDifficulty}
- Time of day: ${context.timeOfDay}

GENERATE:
1. Enemy group (1-6 enemies) with full stat blocks
2. Battlefield description with 2-4 interactive environmental features
3. Enemy tactics (how they fight, retreat conditions, special moves)
4. 1-2 non-combat resolution options (negotiation, intimidation, stealth)
5. Loot table (what they drop on defeat)
6. Story connection (how this fight ties to the broader narrative)

RULES:
- Enemies should feel like they belong in this location
- Mixed enemy groups are more interesting (ranged + melee + support)
- At least one enemy should have a special ability worth discovering
- Include a potential surprise element the player could exploit
- Environmental features should reward creative thinking

Return as structured JSON matching the EnemyGroup and TacticalMap interfaces.
`
```

### Step 4: Present to Player

The encounter begins with an atmospheric description:

```
The trail narrows between two massive boulders. Throk holds up 
a fist — stop.

"Smell that?" He whispers. "Goblin sweat."

Before you can respond, arrows whistle from the rocks above!

⚔️ COMBAT INITIATED ⚔️

ENEMIES:
  Goblin Boss (Level 6) — commanding from atop the boulder
  Goblin Archers ×3 (Level 3) — positioned in the rocks
  Goblin Wolf Rider (Level 5) — charging from behind

ENVIRONMENT:
  🪨 Boulders — Full cover, climbable (Athletics DC 12)
  🌿 Thick brush — Half cover, difficult terrain
  🪤 Rope trap — Tripwire visible (Perception DC 14) near the path
  🔥 Dry brush — Could be ignited to create smoke screen

SURPRISE: The goblins have the drop on you.
  They get a free round of actions. Then initiative order.

[Roll Initiative]
```

---

## Enemy Scaling

### Level-Appropriate Stats

Enemies scale with party level using these guidelines:

| Party Level | Enemy HP Range | Enemy AC | Enemy Attack Bonus | Enemy Damage/Round |
|------------|---------------|----------|-------------------|-------------------|
| 1-2 | 8-25 | 11-13 | +3 to +4 | 4-8 |
| 3-4 | 20-55 | 12-14 | +4 to +6 | 8-15 |
| 5-6 | 40-85 | 13-16 | +5 to +7 | 12-22 |
| 7-8 | 60-120 | 14-17 | +6 to +8 | 18-30 |
| 9-10 | 80-160 | 15-18 | +7 to +9 | 24-40 |
| 11-13 | 110-200 | 16-19 | +8 to +11 | 30-50 |
| 14-16 | 150-280 | 17-20 | +9 to +12 | 40-65 |
| 17-20 | 200-400+ | 18-22 | +10 to +14 | 50-100+ |

### Boss Design Rules

Boss enemies follow special rules to make them feel epic:

```typescript
interface BossEnemy extends EnemyStatBlock {
  isBoss: true
  
  // Legendary Actions (acts between player turns)
  legendaryActions: {
    perRound: number          // Usually 3
    options: LegendaryAction[]
  }
  
  // Lair Actions (environment changes on initiative 20)
  lairActions?: LairAction[]
  
  // Phase transitions
  phases: BossPhase[]
  
  // Plot armor (optional — cannot be killed until story allows)
  plotArmor?: {
    minimumHP: number         // Can't go below this until a condition is met
    condition: string         // "Destroy the phylactery" or "Phase 2 must trigger"
  }
  
  // Dramatic features
  monologue: string           // What they say when combat starts
  deathScene: string          // Dramatic death narration
  escapeCondition?: string    // Can they flee? When?
}

interface BossPhase {
  phaseNumber: number
  triggerCondition: string    // "HP below 75%", "ally dies", "round 5"
  changes: {
    newAbilities?: SpecialAbility[]
    statChanges?: Partial<EnemyStatBlock>
    narrativeTransition: string  // "The lich's eyes blaze with unholy fire as it sheds its mortal disguise!"
    environmentChange?: string   // "The floor cracks open, revealing lava below"
    summons?: EnemyStatBlock[]   // New enemies appear
  }
}
```

---

## Encounter Pacing: The Adventure Day

### The Rhythm

An "adventure day" follows a pacing curve inspired by classic TTRPG session design:

```
OPENING (1-2 encounters)
  - Set the tone for the session
  - Easy to moderate difficulty
  - Establish location and faction
  - Uses: 10-20% of party resources

RISING ACTION (2-3 encounters)
  - Increasing difficulty
  - Introduce complications
  - Environmental variety
  - Uses: 30-40% of resources

CLIMAX (1 encounter)
  - The boss or major setpiece
  - Hardest fight of the day
  - Multi-stage, environmental, dramatic
  - Uses: 25-35% of resources

FALLING ACTION (0-1 encounters)
  - Optional: one more challenge on the way out
  - Or: narrative resolution, loot, story beats
  - Party should be spent, running on fumes
```

### Pacing Signals

The AI reads player behavior to adjust pacing:

| Signal | Meaning | AI Response |
|--------|---------|-------------|
| Long, detailed player responses | Engaged, wants depth | More tactical encounters, more options |
| Short "just attack" responses | Wants it faster | Compress combat, skip to outcomes |
| Player asks to rest frequently | Finding it too hard | Reduce encounter frequency, offer safe havens |
| Player never rests | Finding it too easy or rushing | Increase difficulty, drain resources faster |
| Player explores everything | Loves discovery | More environmental encounters, hidden content |
| Player beelines to objective | Story-focused | Reduce random encounters, advance plot |

---

## Non-Combat Resolution

Every encounter should have at least one non-combat option:

### Negotiation
```
The bandit leader holds up a hand. "Wait. We don't have to do this.
Pay the toll — 50 gold — and walk on."

[Pay the toll – 50 gold]
[Negotiate – "How about 20?"]  (CHA check DC 12)
[Intimidate – "How about you move."] (CHA check DC 15)
[Insight – "You're not really bandits, are you?"] (WIS check DC 14)
[Attack – Draw your weapon]
[Stealth – Signal Pip to circle around] (Party DEX check DC 13)
```

### Surrender & Mercy
When the party is clearly winning:
```
The remaining goblin throws down his weapon and kneels.
"Mercy! Mercy! I tell you everything! Where the chief hides, 
where the treasure is! Just don't kill Skritch!"

[Accept surrender – Interrogate]  
[Accept surrender – Let him go with a warning]
[Refuse – "No mercy for ambushers."]
[Recruit – "Work for me instead."]
```

### Escape
Not every fight needs to be fought to the death:
```
The owlbear is massive. Easily twice the size of any you've seen.
Its territorial roar shakes the ground.

[Fight it]
[Back away slowly – Survival check DC 12 to retreat safely]
[Distract with food – Throw rations to create an opening]
[Scare it off – Make loud noises, fire (Animal Handling DC 16)]
[Go around – Add 2 hours to travel time]
```

---

## Bestiary Integration

Every enemy encountered gets logged in the player's bestiary:

```typescript
interface BestiaryEntry {
  creatureId: string
  name: string
  type: CreatureType
  firstEncountered: Date
  timesEncountered: number
  timesDefeated: number
  timesFleed: number
  
  // Knowledge grows with encounters
  knowledgeLevel: 'unknown' | 'basic' | 'familiar' | 'expert' | 'mastered'
  
  // What the player knows (unlocked progressively)
  basicInfo: string           // Always known: name, type, appearance
  combatTips?: string         // After 2+ encounters: tactical advice
  weaknesses?: string         // After 3+ or Analyze action: vulnerabilities
  fullStats?: EnemyStatBlock  // After 5+ or Expert knowledge: full stat block
  loreEntry?: string          // After mastered: world lore about this creature
  
  // Image
  imageUrl?: string           // Generated on first encounter
  imageGenerated: boolean
}
```

Knowledge levels:
- **Unknown**: First sighting, only appearance description
- **Basic**: 2nd encounter, learn attack types and general behavior
- **Familiar**: 3rd-4th encounter, learn resistances and common tactics
- **Expert**: 5th+ encounter or Analyze action, learn full stats and weaknesses
- **Mastered**: Special achievement, detailed lore entry, advantage on attacks

---

## XP and Rewards

### Experience Points

```typescript
interface CombatRewards {
  baseXP: number              // Based on enemy TL and count
  bonusXP: {
    flawlessVictory: number   // No party members took damage
    creativeStrategy: number  // Used environment or unexpected tactics
    nonLethal: number         // Defeated without killing
    diplomacy: number         // Resolved without combat
    speedKill: number         // Won in fewer rounds than expected
    underdog: number          // Won against higher TL enemies
  }
  totalXP: number
  
  // Party shares XP equally
  xpPerMember: number
  
  // Milestone tracking
  milestoneTriggers: string[]  // Did this combat trigger any milestone events?
}
```

### Loot Distribution

After combat, loot is generated based on:
- Enemy type and level
- Encounter difficulty (harder = better loot)
- Location context (dungeon final room = better than hallway)
- Story significance (boss drops are curated, not random)

```typescript
interface LootGeneration {
  method: 'random-table' | 'curated' | 'contextual'
  
  // Random table (for generic enemies)
  randomTable: {
    goldRange: [number, number]
    itemChance: number        // % chance of dropping an item
    rarityWeights: { [key in Rarity]: number }
    guaranteedDrop?: string   // "crafting material" always drops
  }
  
  // Curated (for bosses, story encounters)
  curatedLoot?: {
    guaranteedItems: string[]  // Specific named items
    optionalItems: string[]    // Chance-based bonus items
    questItems: string[]       // Story items always drop
  }
}
```

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Difficulty system | Threat Level 1-20, 7 difficulty tiers | Replaces D&D Challenge Rating |
| Enemy stat blocks | Full structured stats with tactics AI | Enemies behave intelligently |
| Encounter types | 6 types: story, exploration, random, ambush, multi-stage, wave | Varied combat experiences |
| Daily budget | 6-8 encounters per adventuring day | Creates rest tension |
| Pacing | Opening → Rising → Climax → Falling action curve | Classic narrative structure |
| AI encounter building | Context-aware generation with party state analysis | Smart, not random |
| Non-combat resolution | Every encounter has at least 1 non-combat option | Player agency |
| Scaling | Enemy stats scale with party level, guidelines table | Keeps challenge appropriate |
| Boss design | Legendary actions, phases, lair actions, plot armor option | Bosses feel epic |
| Bestiary | Progressive knowledge system, 5 tiers | Rewards repeat encounters |
| XP rewards | Base + bonus for creative play, shared equally | Rewards good play |
| Player behavior reading | AI adjusts pacing based on engagement signals | Responsive difficulty |
| Encounter frequency | Varies by location danger level | Roads safe, wilderness dangerous |
| Surprise mechanics | Perception checks, free rounds, positioning advantage | Ambushes matter |
