# Rest, Recovery & Downtime — Full Design Specification
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: Rest Is Gameplay

In D&D, rest is a **resource management mechanic** that gives rhythm to the adventure. When you rest, you're not "doing nothing" — you're making a strategic decision about timing, safety, and resource expenditure. The campfire scene is one of the most beloved TTRPG moments: party members talk, bonds form, watches are kept, nightmares happen.

This system makes rest a **three-pillar experience**:
1. **Mechanical**: Resource recovery, ability recharges, condition healing
2. **Narrative**: AI generates campfire scenes, dreams, party conversations
3. **Strategic**: Where you rest, when, and for how long has consequences

---

## The Three Rest Types

### SHORT REST (The Breather)

**TTRPG Analog**: D&D 5e Short Rest (1 hour)

**When it happens**: Player requests a short rest, or AI suggests one after a tough fight.

**Duration**: ~1 hour of in-game time.

**What recovers**:
- HP: Spend Hit Dice to heal (roll dice equal to level, add CON modifier per die)
- Stamina: Fully restored
- Mana: Recover 25% of max
- Abilities marked "per short rest": Recharged (e.g., Fighter's Action Surge, Warlock spell slots)
- Concentration spells: Ended (you relaxed)

**What does NOT recover**:
- Spell slots (except Warlock-type classes)
- Daily abilities (marked "per long rest" or "1/day")
- Hit Dice themselves (those recover on long rest)
- Conditions: Poison, disease, curse remain
- Death saves: Reset only on long rest

**Narrative beat**: Brief. The AI narrates a quick moment:
> "You press your back against the cool stone wall and catch your breath. Lyra rewraps the bandage on her arm. Throk stands watch at the corridor mouth, axe ready. Ten minutes pass in tense silence before you feel ready to move on."

**Interruption risk**: If resting in a dangerous location, there's a chance the rest is interrupted:
```typescript
interface ShortRestResult {
  interrupted: boolean
  interruptionType?: 'combat' | 'event' | 'discovery'
  hpRecovered: number
  hitDiceSpent: number
  hitDiceRemaining: number
  manaRecovered: number
  abilitiesRecharged: string[]
  narrativeBeat: string       // AI-generated rest scene
}
```

**UI Flow**:
```
[Short Rest] button available when out of combat

→ "How many Hit Dice do you want to spend?"
   You have 5/8 Hit Dice remaining.
   Each heals 1d10 + 3 (CON modifier)
   
   [Spend 1] [Spend 2] [Spend 3] [Spend All] [None - Just Recharge Abilities]

→ AI narrates the rest
→ If interrupted: encounter begins
→ Summary of what recovered
```

---

### LONG REST (The Camp)

**TTRPG Analog**: D&D 5e Long Rest (8 hours)

**When it happens**: Player sets up camp, stays at an inn, or finds a safe haven.

**Duration**: 8 hours of in-game time. The world advances.

**What recovers**:
- HP: Fully restored to maximum
- Mana: Fully restored to maximum
- Stamina: Fully restored
- Spell slots: All restored
- Daily abilities: All recharged
- Hit Dice: Recover half your max (round up)
- Minor conditions: Exhaustion reduced by 1 level, minor wounds healed
- Death saves: Reset

**What does NOT recover**:
- Severe conditions: Curses, diseases, magical afflictions persist
- Exhaustion: Only reduces by 1 level (not fully cleared)
- Broken equipment: Needs repair at a smith
- Permanent injuries: Require specific healing

**The Camping Experience** (this is where the TTRPG magic happens):

When you long rest, the AI generates a **camping scene** with multiple interactive phases:

#### Phase 1: Set Up Camp
```
Where do you make camp?

[ By the road] — Easy to find, slight interruption risk
[ Deep in the woods] — Hidden, might get lost
[ In the cave mouth] — Sheltered, defensible, might not be empty
[ At the ruins] — Stone walls, fire ring, but... who built this?
[ The inn at Millhaven] — Safe, costs gold, rumors available

Or describe where you want to camp: ___
```

Location affects:
- Interruption chance (dangerous area = higher chance)
- Weather protection (matters if weather system is active)
- Discovery opportunities (AI might place something interesting near camp)
- NPC encounters (friendly travelers, merchants, mysterious strangers)

#### Phase 2: Watch Shifts
```
Who takes which watch?

First Watch (sunset to midnight):
  [You] [Lyra] [Throk] [Pip]

Second Watch (midnight to dawn):
  [You] [Lyra] [Throk] [Pip]

Or: [Everyone sleeps] (risky!)
    [You take all watches] (gain 1 exhaustion)
```

Watch events (AI-generated, based on location and story state):
- Nothing happens (peaceful night, brief scene of stars/campfire)
- Sounds in the distance (narrative tension)
- A stranger approaches (roleplay encounter)  
- An animal visits camp (taming opportunity?)
- A dream or vision (story foreshadowing)
- Attack! (combat encounter — party members not on watch start prone/surprised)

#### Phase 3: Campfire Activities
Before sleeping, the party spends time at the fire. The player can choose:

```
The fire crackles. The stars are out. What do you do?

[ Talk to a companion] — Deepen a relationship, learn their story
[ Study your spellbook] — Gain a minor arcane insight
[ Sharpen your weapons] — +1 to first attack tomorrow
[ Cook a meal] — Use ingredients for stat buffs
[ Play music/tell stories] — Party morale bonus
[ Write in your journal] — Chronicle entry, reflect on the day
[ Meditate/Pray] — Class-specific benefit
[ Craft something] — Use downtime to craft (if you have materials)
[ Keep to yourself] — Sometimes solitude is needed
[ Plan tomorrow] — Discuss next steps with party (might reveal info)

Or describe what you want to do: ___
```

Each activity has a small mechanical benefit AND a narrative moment:

| Activity | Mechanical Benefit | Narrative |
|----------|-------------------|-----------|
| Talk to companion | +5 relationship, possible loyalty quest trigger | AI generates personal conversation |
| Study spellbook | Learn 1 random cantrip or spell insight | Magical discovery moment |
| Sharpen weapons | +1 attack on first combat next day | Simple, satisfying routine |
| Cook a meal | Stat buff for next day (based on ingredients) | Cooking mini-scene, recipe discovery |
| Music/stories | +1 to party morale (affects combat rolls) | Bard-favored, fun RP scene |
| Write journal | Chronicle entry auto-saved, XP bonus | Reflection and story recap |
| Meditate/pray | Class-specific: Cleric=extra heal, Monk=ki, etc. | Spiritual moment |
| Craft | Full crafting system available | Campfire crafting scene |
| Keep to yourself | Remove 1 extra exhaustion | Quiet character moment |
| Plan tomorrow | AI reveals a hint about next area | Strategic discussion |

#### Phase 4: Dreams
If narratively appropriate, the AI generates a dream sequence:
- Foreshadowing future events
- Processing traumatic events (combat, loss)
- Divine messages (for religious characters)  
- Memory flashbacks (character backstory)
- Nightmares (horror genre — might cause a failed rest!)

Dreams are optional. The AI decides based on story state. In horror campaigns, nightmares might prevent full rest recovery.

#### Phase 5: Morning
```
Dawn breaks over the mountains. You feel [rested / groggy / uneasy].

[Lyra is making tea.]
[Throk is already in his armor, scanning the horizon.]
[Pip is... missing. Her bedroll is empty.]

What do you do?
```

The AI uses the morning scene to either start the next adventure beat or introduce a new plot hook.

---

### EXTENDED REST (The Downtime)

**TTRPG Analog**: D&D downtime activities / between-adventure rest

**When it happens**: Between major quests, in a safe settlement, when the player wants to "take some time off."

**Duration**: Days to weeks of in-game time. The world advances significantly.

**What recovers**: EVERYTHING. Plus:
- All exhaustion cleared
- Diseases/poisons treated (if healer available)
- Equipment repaired (if smith available)
- Crafting projects completed
- Training gains applied
- Relationships can advance significantly

**This is where DOWNTIME ACTIVITIES happen** (see below).

---

## Exhaustion System

**TTRPG Analog**: D&D 5e Exhaustion (6 levels)

Exhaustion tracks accumulated fatigue beyond HP/mana. It's a slow-burn consequence system.

```typescript
interface ExhaustionState {
  level: 0 | 1 | 2 | 3 | 4 | 5 | 6
  sources: string[]             // What caused each level
  canBeRemovedBy: string[]      // How to cure it
}
```

| Level | Effect | Cause Examples |
|-------|--------|---------------|
| 0 | No effect | Normal state |
| 1 | Disadvantage on ability checks | Missed a long rest, forced march, mild poison |
| 2 | Speed halved | Two nights without rest, disease, extreme cold/heat |
| 3 | Disadvantage on attacks and saves | Starvation, magical drain, resurrection sickness |
| 4 | HP maximum halved | Severe curse, multiple days without rest |
| 5 | Speed reduced to 0 | Near death, magical corruption, extreme deprivation |
| 6 | Death | The body gives out |

**Recovery**: Long rest removes 1 level. Extended rest removes all. Greater Restoration spell removes 1 level. Certain potions help.

**AI Integration**: The AI tracks exhaustion and makes it part of narration:
> Level 2: "Your steps feel heavy. The forest trail that should take an hour stretches endlessly before you. Even your sword feels heavier on your hip."

---

## Downtime Activities

When the player takes an Extended Rest (days/weeks in a settlement), they can choose activities that advance their character, the story, or the world.

### Activity Menu

```
You're spending time in Millhaven. How do you use your days?

TRAINING & GROWTH
  [ Train with a master] — Improve a skill or learn a new one
  [ Study at the library] — Research lore, learn spells, gain knowledge
  [ Practice combat] — Sparring, +1 to a combat skill
  [ Learn a language] — Pick up a new language (takes multiple downtimes)
  [ Attune to magic item] — Spend time bonding with a magical item

CRAFTING & CREATION
  [ Craft items] — Smithing, alchemy, enchanting, etc.
  [ Brew potions] — Alchemy crafting session
  [ Scribe scrolls] — Copy spells to scrolls for later use
  [ Repair equipment] — Fix damaged gear (or pay a smith)
  [ Commission custom gear] — Pay an NPC crafter for bespoke equipment

SOCIAL & REPUTATION
  [ Carouse] — Party, drink, make friends (or enemies)
  [ Build contacts] — Network with local factions, merchants, guilds
  [ Perform] — Bard: play at the tavern for gold and fame
  [ Volunteer] — Help the community, boost reputation
  [ Spread rumors] — Plant information, manipulate factions
  [ Romance] — Deepen a romantic relationship (if applicable)

INVESTIGATION & EXPLORATION
  [ Research a quest] — Gather intel on upcoming adventure
  [ Investigate mystery] — Follow up on plot hooks
  [ Explore the area] — Discover hidden locations nearby
  [ Track bounties] — Find bounty board, take side jobs
  [ Spy on faction] — Gather intelligence (risky)

ECONOMIC
  [ Run a business] — If you own a shop/tavern/guild (see Economy doc)
  [ Invest gold] — Put money into ventures for returns
  [ Gamble] — Risk gold at games of chance (skill + luck)
  [ Sell/Buy items] — Extended shopping session with full merchant interaction
  [ Hire followers] — Recruit hirelings, mercenaries, or specialists

PERSONAL
  [ Rest and recover] — Extra healing, remove conditions
  [ Write/Journal] — Chronicle your adventures (meta bonus)
  [ Pray/Meditate] — Religious characters: gain divine favor
  [ Build/Improve home] — If you have a base of operations
  [ Pet/Mount care] — Bond with companion animals
```

### Downtime Resolution

Each activity takes 1-7 days of in-game time. The AI resolves with a narrative scene + mechanical outcome:

```typescript
interface DowntimeResult {
  activity: string
  daysSpent: number
  narrativeScene: string       // AI-generated story of the downtime
  mechanicalOutcome: {
    skillChange?: { skill: string; bonus: number }
    goldChange?: number
    reputationChange?: { faction: string; change: number }
    newContacts?: string[]
    itemsGained?: string[]
    itemsLost?: string[]
    questHooksDiscovered?: string[]
    relationshipChanges?: { npc: string; change: number }[]
    specialEvent?: string      // Unexpected complication or boon
  }
  complications?: string       // "Your carousing got you into a bar fight with a noble's son"
}
```

### Training Deep Dive

Training is the primary character improvement downtime:

```typescript
interface TrainingSession {
  skill: string                // What you're training
  trainer?: string             // NPC trainer (better results)
  daysRequired: number         // Based on current skill level
  goldCost: number             // Trainer fee
  
  // Results
  skillGain: number            // Points gained
  bonusDiscovery?: string      // "Your trainer taught you a secret technique!"
  newAbilityUnlocked?: string  // Hit a threshold → new ability
}
```

**Training rules**:
- Self-training: Slower, free, risk of bad habits (AI may impose quirk)
- NPC trainer: Faster, costs gold, chance to learn bonus technique
- Master trainer: Expensive, rare (quest to find), teaches unique abilities
- Training with a party member: Free, builds relationship, slower than NPC trainer
- Training takes 3-14 days depending on what you're learning

**Training progression example**:
```
Day 1-3: "The old swordmaster watches you swing, correcting your form..."
Day 4-7: "Your muscles ache, but the blade feels lighter in your hand..."
Day 8-10: "Something clicks. Your combinations are flowing, one into the next..."

TRAINING COMPLETE:
  Swordsmanship: 45 → 52 (+7)
  New technique learned: Riposte (counter-attack on successful parry)
  Master Borren says: "You've earned this. Come back when you're ready for the advanced forms."
```

### Carousing Table (The Fun One)

Carousing = going out and partying. Classic D&D downtime. Roll on a random event table:

| d20 Roll | What Happened |
|----------|--------------|
| 1 | You wake up in jail. What did you DO? |
| 2-3 | Bar fight. You made an enemy of a local tough. |
| 4-5 | You gambled and lost. Lose 2d6 × 10 gold. |
| 6-7 | You gambled and won! Gain 2d6 × 10 gold. |
| 8-9 | You made a new friend — a local merchant who owes you a favor. |
| 10-11 | You heard a fascinating rumor about a nearby dungeon/treasure. |
| 12-13 | You impressed a local noble. +1 reputation with local faction. |
| 14-15 | You got tattoed. What does it look like? (Player describes, AI generates) |
| 16-17 | You found a secret underground fight club. Want in? |
| 18-19 | A mysterious stranger shared a drink and a cryptic warning... |
| 20 | JACKPOT: You won a deed to a small property! |

The AI uses this table as inspiration, not gospel — it adapts to your character and the world state.

---

## Resource Management Philosophy

### The Core Loop

```
ADVENTURE → Resources deplete → SHORT REST → Partial recovery → MORE ADVENTURE 
→ Resources low → Decision: push on or retreat? → LONG REST → Full recovery
→ Major quest complete → EXTENDED REST → Downtime activities → New quest
```

This loop creates **tension** and **pacing**:
- After a short rest, you're functional but not optimal
- Choosing whether to push forward or retreat is a real strategic decision
- Long rests are an investment of time (world advances, events happen)
- Extended rests are rewards between major story arcs

### Hit Dice as Strategic Resource

Hit Dice are the bridge between short and long rests:
- You have Hit Dice equal to your level (Level 8 = 8 Hit Dice)
- Short rest: Spend Hit Dice to heal (each die = your class die + CON mod)
- Long rest: Recover half your max Hit Dice
- This means after multiple short rests, your healing pool depletes
- Creates genuine resource tension: "I have 2 Hit Dice left — do I spend them now or save them?"

### Ability Recharge Categories

Every ability has a recharge timer:
```
At Will       — Use unlimited times (basic attacks, cantrips)
Per Short Rest — Recharges after 1-hour rest (frequent abilities)
Per Long Rest  — Recharges after 8-hour rest (powerful abilities)
1/Day          — Once per 24 hours (very powerful)
Per Encounter  — Recharges when combat ends (tactical abilities)
Charges        — Has X charges, regains some per rest (magic items)
Cooldown       — Available again after X rounds (combat abilities)
```

---

## TypeScript Interfaces

```typescript
interface RestState {
  characterId: string
  
  // Current resource state
  hp: { current: number; max: number }
  mana: { current: number; max: number }
  stamina: { current: number; max: number }
  hitDice: { current: number; max: number; dieType: string }  // "d10", "d8", etc.
  
  // Exhaustion
  exhaustion: ExhaustionState
  
  // Ability tracking
  shortRestAbilities: { name: string; used: boolean; maxUses: number; currentUses: number }[]
  longRestAbilities: { name: string; used: boolean; maxUses: number; currentUses: number }[]
  dailyAbilities: { name: string; used: boolean; resetsAt: string }[]  // ISO timestamp
  
  // Conditions
  activeConditions: ActiveCondition[]
  
  // Last rest timestamps
  lastShortRest: Date | null
  lastLongRest: Date | null
  lastExtendedRest: Date | null
  
  // Downtime tracking
  downtimeActivitiesCompleted: DowntimeResult[]
  currentDowntimeActivity?: { activity: string; daysRemaining: number }
}

interface ActiveCondition {
  name: string                  // "Poisoned", "Cursed", "Blessed", "Inspired"
  type: 'buff' | 'debuff' | 'neutral'
  source: string                // What caused it
  duration: 'until_rest' | 'until_cured' | 'permanent' | 'timed'
  turnsRemaining?: number       // If timed in combat
  mechanicalEffect: string      // "+2 to attack rolls" or "disadvantage on STR checks"
  narrativeDescription: string  // Flavor text for the AI
  canBeCuredBy: string[]        // ["long rest", "Lesser Restoration", "antidote"]
}

interface CampSetup {
  location: string
  locationType: 'wilderness' | 'roadside' | 'cave' | 'ruins' | 'inn' | 'safe-haven'
  safetyLevel: 1 | 2 | 3 | 4 | 5  // 1 = very dangerous, 5 = completely safe
  interruptionChance: number       // 0.0 to 1.0
  weatherProtected: boolean
  fireBuilt: boolean
  watchSchedule: WatchShift[]
  campfireActivity?: string
}

interface WatchShift {
  watchNumber: number
  assignedTo: string     // Character or party member name
  duration: number       // Hours
  perceptionBonus: number // That character's perception modifier
  event?: WatchEvent
}

interface WatchEvent {
  type: 'nothing' | 'sound' | 'visitor' | 'animal' | 'dream' | 'attack' | 'discovery' | 'weather'
  description: string
  requiresAction: boolean
  consequence?: string
}
```

---

## AI Integration

### Rest narration prompts

The AI DM generates rest scenes based on context:

```typescript
const restPrompt = (rest: CampSetup, party: PartyState, worldState: WorldState): string => `
You are the DM narrating a ${rest.locationType} camp scene.
Party: ${party.members.map(m => `${m.name} (${m.class}, ${m.hp.current}/${m.hp.max} HP, mood: ${m.mood})`).join(', ')}
Location: ${rest.location}
Weather: ${worldState.currentWeather}
Recent events: ${worldState.recentEvents.slice(-3).join('; ')}
Time of day: ${worldState.timeOfDay}
Story tension level: ${worldState.tensionLevel}/10

Generate a brief, atmospheric camp scene (3-5 sentences). 
Include one detail that hints at the characters' emotional states.
If tension is high (7+), make the rest feel uneasy.
If tension is low (3-), make it warm and restorative.
${rest.campfireActivity ? `The player chose to: ${rest.campfireActivity}` : ''}
`
```

### Interrupted rest handling

```typescript
function resolveRestInterruption(camp: CampSetup, world: WorldState): InterruptionResult | null {
  const roll = seededRandom(camp.location + world.gameDay)
  
  if (roll > camp.interruptionChance) return null  // No interruption
  
  // Who's on watch?
  const watcher = camp.watchSchedule[getCurrentWatch(world.timeOfDay)]
  const perceptionCheck = rollD20() + watcher.perceptionBonus
  
  return {
    detected: perceptionCheck >= 12,  // DC 12 to notice approach
    type: determineInterruptionType(world),
    surprise: perceptionCheck < 12,   // Party is surprised if watcher failed
    watcherName: watcher.assignedTo
  }
}
```

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Rest types | 3: Short (1hr), Long (8hr), Extended (days) | Matches D&D 5e model |
| Short rest healing | Spend Hit Dice + CON mod | Player chooses how many to spend |
| Long rest recovery | Full HP/mana, half Hit Dice back | Standard D&D recovery |
| Exhaustion system | 6 levels, escalating penalties, death at 6 | D&D 5e exhaustion |
| Camping gameplay | Multi-phase: location, watches, campfire, dreams, morning | The TTRPG experience |
| Campfire activities | 15+ options with mechanical + narrative benefits | Each one is a small scene |
| Downtime activities | 20+ options across 6 categories | Extended rest only |
| Training system | Self/NPC/Master tiers, variable time and cost | Primary skill improvement |
| Carousing | d20 random event table, AI-adapted | Classic TTRPG fun |
| Interruption risk | Based on location safety level | Adds tension to wilderness rests |
| Watch system | Party members assigned to shifts, perception checks | Tactical night management |
| Rest in combat zones | Possible but risky, higher interruption chance | Strategic decision |
| Inn stays | Safe (no interruption), costs gold, rumors available | Towns are havens |
| Resource management | Abilities categorized by recharge type | Creates adventure pacing |
