# Skill Challenges & Puzzles — Full Design Specification
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: The Third Pillar

TTRPG has three pillars: **Combat**, **Exploration**, and **Social/Problem-Solving**. Combat is fully specced. Exploration is in the map system. But the third pillar — puzzles, skill challenges, riddles, environmental problem-solving — is the one that makes players feel *smart* rather than just powerful.

In D&D, these are the moments the table goes quiet. Everyone leans in. "What if we..." The AI DM needs to create these moments: problems that have multiple valid solutions, reward creative thinking, and can't just be solved by rolling initiative.

---

## Skill Challenge System

### What Is a Skill Challenge?

A skill challenge is a **multi-step non-combat encounter** resolved through a series of ability checks. Think:

- Chasing a thief through a crowded marketplace
- Navigating a collapsing mine before it buries you
- Negotiating a peace treaty between warring factions
- Performing a dangerous magical ritual
- Surviving a storm at sea
- Escaping from a prison

### The Mechanic

Skill challenges use a **successes vs failures** system (borrowed from D&D 4e, which got this exactly right):

```typescript
interface SkillChallenge {
  id: string
  name: string                    // "The Great Chase", "The Diplomatic Summit"
  description: string             // What's happening and what's at stake
  
  // Difficulty
  complexity: 1 | 2 | 3 | 4 | 5  // Determines required successes
  successesRequired: number        // Complexity × 3 (3, 6, 9, 12, 15)
  failuresAllowed: number          // Always 3 (three strikes and you're out)
  
  // Current state
  currentSuccesses: number
  currentFailures: number
  status: 'active' | 'success' | 'failure'
  
  // Skills
  primarySkills: SkillOption[]     // Skills that count as progress
  secondarySkills: SkillOption[]   // Skills that help but don't directly progress
  prohibitedSkills?: string[]      // Skills that auto-fail (can't fight your way out)
  
  // Narrative
  roundDescriptions: string[]      // AI-generated narration per check
  successOutcome: string           // What happens if they win
  failureOutcome: string           // What happens if they lose
  partialOutcome?: string          // What happens if they barely lose (2 failures)
  
  // Stakes
  stakes: 'low' | 'medium' | 'high' | 'critical'
  timeLimit?: number               // Real-time seconds per decision (pressure!)
}

interface SkillOption {
  skill: string                   // "Athletics", "Persuasion", "Arcana"
  dc: number                     // Difficulty Class
  description: string            // How this skill applies: "Vault over the market stalls"
  maxUses: number                // Can only use this skill X times in this challenge
  specialEffect?: string         // "Two successes if you beat DC by 5+"
}
```

### Complexity Levels

| Complexity | Successes Needed | Failures Allowed | Typical Duration | Example |
|-----------|-----------------|-----------------|-----------------|---------|
| 1 | 3 successes | 3 failures | Quick (3-5 checks) | Pick a lock, calm an animal |
| 2 | 6 successes | 3 failures | Short (6-8 checks) | Chase scene, short negotiation |
| 3 | 9 successes | 3 failures | Medium (9-12 checks) | Complex negotiation, dungeon escape |
| 4 | 12 successes | 3 failures | Long (12-15 checks) | Political intrigue, heist |
| 5 | 15 successes | 3 failures | Epic (15-20 checks) | Prevent a war, ritual to save the world |

### Example: The Chase Through Millhaven Market

```
⚡ SKILL CHALLENGE: The Chase! ⚡

The pickpocket has your coin purse — and he's FAST.
He darts into the crowded Millhaven market, weaving
between stalls and carts.

Complexity 2: Need 6 successes before 3 failures.
Progress: [○○○○○○] Successes | [○○○] Failures

What do you do to catch him?

PRIMARY SKILLS (count toward progress):
  🏃 Athletics DC 13 — Sprint through the crowd, vault obstacles
    (Max 2 uses: you can't just keep running forever)
  🤸 Acrobatics DC 14 — Parkour over stalls, shortcut across rooftops
    (Max 2 uses: agility-based pursuit)
  👁️ Perception DC 12 — Spot which way he went at an intersection
    (Max 3 uses: keep eyes on the target)
  🗣️ Intimidation DC 15 — Shout "Stop thief!" loud enough to freeze him
    (Max 1 use: only works once)

SECONDARY SKILLS (help but don't progress):
  🧠 Investigation DC 12 — Predict where he's heading (next check at advantage)
  🤝 Persuasion DC 10 — Ask a bystander to trip him (+2 to next Athletics)
  🐾 Animal Handling DC 13 — Command a street dog to chase him (+1 success on hit)

PROHIBITED: Attacking with weapons in a crowded market (auto-failure + guards!)

[Type what you do, or choose a skill]: ___
```

Player response: "I leap onto the fruit cart and jump across the awnings to get above him!"

```
Acrobatics check! DC 14
🎲 Roll: d20 + 5 = [17] + 5 = 22 — SUCCESS! (Beat by 8!)

You launch yourself off the fruit cart — apples scatter
everywhere, the vendor screams — and grab the edge of a
canvas awning. It sags under your weight but holds just long
enough for you to swing to the next one. From above, you 
can see the thief darting through the crowd below!

Progress: [●○○○○○] Successes | [○○○] Failures

Your aerial view gives you advantage on your next check!
What's your next move?
```

### Party Participation

In skill challenges, **every party member can contribute**:

```
The Diplomatic Summit — Complexity 3 (9 successes needed)

Round 3 of negotiations. Duke Aldric is skeptical.
Progress: [●●○○○○○○○] Successes | [●○○] Failures

Who acts?
  [YOU] — Persuasion DC 15 to appeal to the Duke's honor
  [LYRA] — History DC 13 to cite a precedent that supports your case
  [THROK] — Intimidation DC 16 to remind him of your military strength
  [PIP] — Insight DC 12 to read the Duke's real concerns (secondary: reveals his motivation)
```

Each party member uses their strengths. The party composition matters — a face-heavy party excels at social challenges; a physical party excels at chases and escapes.

---

## Puzzle System

### Types of Puzzles

The AI generates puzzles that are solvable through **player intelligence**, not just character stats:

#### 1. Logic Puzzles
Riddles, pattern recognition, deduction:

```
The door bears an inscription in ancient Dwarvish:

"I have cities, but no houses live there.
 I have mountains, but no trees grow there.  
 I have water, but no fish swim there.
 I have roads, but no carts travel there.
 What am I?"

[Type your answer]: ___

Hint available? [Use INT check DC 10 for a hint]
```

Answer: A map. The AI recognizes synonyms and close answers ("a map", "map", "a chart", "cartography").

#### 2. Environmental Puzzles
Room-based puzzles using physical elements:

```
THE WEIGHT ROOM

The chamber has two stone pedestals, each with a 
pressure plate depression. Above the sealed door,
an inscription reads: "Balanced as justice, equal as law."

Objects in the room:
  🗿 Stone idol (heavy — ~50 lbs)
  ⚱️ Ancient urn (medium — ~25 lbs)
  📦 Wooden crate (light — ~15 lbs)
  🪨 Loose rocks (variable — collect as needed)
  🏋️ Iron weights: 5lb, 10lb, 10lb, 25lb

The left pedestal is currently depressed. Something 
heavy was on it before. The right pedestal is raised.

What do you do? [Describe your approach]: ___
```

The AI evaluates the player's solution logically. Multiple valid solutions exist:
- Place equal weights on both pedestals
- Place the stone idol on one, urn + crate on the other (50 ≈ 40 — close enough?)
- Use the iron weights to balance exactly (requires math)
- Brute force: STR check DC 20 to force the door (works but triggers a trap)

#### 3. Moral/Decision Puzzles
No right answer, consequences either way:

```
THE TROLLEY PROBLEM BRIDGE

Two chains hang from the ceiling, connected to a 
mechanism above. Through the grating in the floor, 
you can see:

LEFT CHAIN: Releases a caged group of prisoners (5 villagers)
            But dropping them releases the bridge support
            allowing the pursuing worg pack to cross.

RIGHT CHAIN: Destroys the bridge behind you forever,
             trapping the prisoners but ensuring the 
             worg pack can never reach the village.

A third option might exist... if you look carefully.

What do you do? ___
```

#### 4. Mechanical Puzzles
Levers, gears, pipes, pressure plates:

```typescript
interface MechanicalPuzzle {
  name: string
  description: string
  elements: PuzzleElement[]
  solution: string[]           // Ordered steps to solve
  alternativeSolutions: string[][] // Other valid approaches
  hintProgression: string[]    // Hints of increasing specificity
  bruteForceOption?: {
    skillCheck: string
    dc: number
    consequence: string        // "The mechanism breaks but the door opens"
  }
  failureConsequence: string   // Wrong solution: trap, reset, damage
  timeLimit?: number           // Rounds before something bad happens
}

interface PuzzleElement {
  id: string
  name: string                 // "Red Lever", "Stone Dial", "Water Valve"
  currentState: string         // "up", "pointing north", "closed"
  possibleStates: string[]     // ["up", "down"], ["N", "S", "E", "W"]
  connectedTo: string[]        // Other elements this affects
  interactDescription: string  // What happens when you use it
}
```

#### 5. Social Puzzles
Figure out the right thing to say or do:

```
The ghost of the murdered queen hovers before you.
She screams when you approach. She attacks when you 
speak. She cries when you retreat.

Your party's attempts so far:
  ❌ Throk tried intimidation — she shrieked louder
  ❌ Lyra tried a calming spell — the ghost resisted
  ❌ You tried to talk — she attacked

What is she trying to communicate?

Observe her more carefully?
[Insight DC 12] [Perception DC 14]
[History DC 13 — research who she was]
[Or describe what you try]: ___
```

#### 6. Combination Puzzles
Multiple puzzle types combined into one encounter:

```
THE WIZARD'S TRIAL — Three Tests

Test 1 (Logic): "What walks on four legs in the 
morning, two at noon, three in the evening?"
  → Riddle of the Sphinx

Test 2 (Mechanical): Align the three crystal prisms
to redirect a beam of light to the door lock.
  → Environmental manipulation

Test 3 (Moral): "Choose: the Door of Mercy or 
the Door of Justice. One leads forward. The other 
leads to what you deserve."
  → Character-defining choice
```

### Puzzle Design Rules for the AI

```typescript
const puzzleDesignPrompt = (context: PuzzleContext): string => `
Design a puzzle for an AI RPG dungeon.

RULES:
1. The puzzle MUST have at least 2 valid solutions
2. One solution should use intelligence (player thinks)
3. One solution should use character ability (skill check)
4. Brute force should work but at a cost (damage, resources, noise)
5. There should be 3 escalating hints available
6. The puzzle should fit the dungeon theme: ${context.dungeonTheme}
7. The puzzle difficulty should match: ${context.difficulty}
8. If the player is stuck for 3 attempts, offer a clearer hint
9. NEVER make a puzzle unsolvable — the AI must accept creative solutions
10. Puzzle should take 2-5 minutes of player deliberation

IMPORTANT:
The player types in natural language. The AI must evaluate whether
their approach would logically solve the puzzle, even if it's not
the "intended" solution. If the player's approach makes logical sense,
it WORKS. This is a TTRPG — creativity is rewarded, not punished.
`
```

### The Hint System

Players should never be permanently stuck:

```
Attempt 1: No hint. Let the player think.

Attempt 2: Subtle hint.
  "You notice scratch marks on the floor near the left pedestal..."

Attempt 3: Moderate hint.  
  "The inscription mentions 'balance.' Both pedestals seem 
   to respond to weight..."

Attempt 4: Direct hint.
  "Perhaps if both sides held the same amount of weight,
   they would be 'balanced as justice.'"

Attempt 5+: Solution hint.
  "You could use the iron weights to balance exactly 25 
   pounds on each side. Or find objects of equal weight."

INT Check Option: At any time, roll INT check for a hint:
  DC 10: Get Moderate hint
  DC 15: Get Direct hint
  DC 20: Get Solution hint (your character figures it out)
```

---

## Trap Encounters as Puzzles

Some "puzzles" are really trap encounters — the puzzle is figuring out how to proceed safely:

```
THE CORRIDOR OF DARTS

The 60-foot hallway is lined with small holes in both walls.
Every 10 feet, there's a stone tile slightly raised from the 
floor. Scorch marks and dart holes pepper the walls.

At the far end: a lever and a rusty metal door.

Known information:
  🔍 Perception DC 12: The tiles are pressure plates
  🔍 Investigation DC 14: The holes are dart launchers
  🧠 Arcana DC 15: Faint magical trigger on every other plate

Options your party considers:
  [Walk carefully between plates] — DEX check per plate
  [Disable the trap mechanism] — Thieves' Tools, multiple checks
  [Tank through it] — Take the dart damage, heal after
  [Trigger from afar] — Throw rocks on plates to exhaust darts
  [Find another way] — Search for secret passage
  [Shield wall] — Throk shields while party advances
  [Your idea]: ___
```

---

## Social Encounters as Challenges

### Structured Social Encounters

Major social encounters (negotiations, trials, interrogations) can use the skill challenge framework:

```
⚖️ SKILL CHALLENGE: The Trial of Aldric Thorne ⚖️

You stand before the Council of Millhaven, defending
the accused herbalist. The evidence against him is
circumstantial but damning. The crowd is hostile.

Complexity 3: Need 9 successes before 3 failures.
Progress: [○○○○○○○○○] | Failures: [○○○]

This round: Cross-examining the accusing witness.

PRIMARY SKILLS:
  🗣️ Persuasion DC 14 — Appeal to the witness's conscience
  🧠 Insight DC 13 — Spot a lie in their testimony
  🔍 Investigation DC 15 — Find a contradiction in the evidence
  ⚖️ History DC 12 — Cite legal precedent

SECONDARY SKILLS:
  🎭 Performance DC 11 — Dramatic courtroom moment (advantage on next)
  🤝 Intimidation DC 16 — Rattle the witness (risky: could alienate jury)

[Your approach]: ___
```

### NPC Attitude System

NPCs have an attitude toward the player that affects social interaction DCs:

```typescript
interface NPCAttitude {
  npcId: string
  attitude: 'hostile' | 'unfriendly' | 'indifferent' | 'friendly' | 'allied'
  
  // DC modifiers based on attitude
  persuasionMod: number    // hostile: +10, unfriendly: +5, indifferent: 0, friendly: -5, allied: -10
  deceptionMod: number     // Harder to deceive allies (they know you)
  intimidationMod: number  // Harder to intimidate hostiles (they're already angry)
  
  // What shifts attitude
  positiveActions: string[] // Things that improve attitude
  negativeActions: string[] // Things that worsen attitude
  relationship: number     // -100 to +100 running score
}
```

---

## Investigation Encounters

### Mystery-Solving

Some encounters are investigative — collect clues, interview witnesses, piece together the truth:

```typescript
interface InvestigationEncounter {
  mystery: string              // "Who murdered the blacksmith?"
  
  // Clue system
  clues: Clue[]
  minimumCluesForSolution: number  // Must find at least X clues
  totalCluesAvailable: number
  
  // The truth (AI knows, player discovers)
  solution: string
  culprit?: string
  motive?: string
  method?: string
  
  // Red herrings (false leads)
  redHerrings: string[]
  
  // Time pressure
  deadline?: string           // "The execution is at dawn. You have until then."
  consequenceOfFailure: string
}

interface Clue {
  id: string
  description: string
  location: string            // Where to find this clue
  discoverySkill: string      // "Perception", "Investigation", "Insight"
  discoveryDC: number
  importance: 'critical' | 'supporting' | 'color'
  leadsTo: string[]           // Other clue IDs this connects to
  discoveredBy?: string       // Which check found it
  narrativeReveal: string     // How the AI describes finding it
}
```

### The Investigation Flow

```
🔍 INVESTIGATION: The Blacksmith's Murder

The blacksmith was found dead in his forge at dawn.
The town guard wants answers by nightfall, or they're
blaming the stranger (that's you).

WHAT YOU KNOW SO FAR:
  ✅ The body was found near the anvil
  ✅ No obvious wounds (strange — a forge is full of weapons)
  ❓ The forge fire was still burning
  ❓ His apprentice is "missing"

LOCATIONS TO INVESTIGATE:
  [The Forge] — Examine the body and scene
  [The Apprentice's Room] — Search for clues
  [The Tavern] — Ask who saw the blacksmith last
  [The Market] — Talk to merchants who knew him  
  [The Temple] — The priest might know secrets

You have until sundown (5 investigation actions remaining).
Where do you go first? ___
```

Each location yields clues based on what skills the player uses. The AI tracks which clues have been found and adapts the narrative:
- Found enough clues → can accuse the right person
- Missed critical clues → must make accusations based on incomplete info
- Found red herrings → might accuse the wrong person (consequences!)

---

## Ritual and Ceremony System

### Magic Rituals as Skill Challenges

Major magical events use the skill challenge framework:

```
🌙 RITUAL: Sealing the Rift Between Worlds

The interdimensional rift pulses with chaotic energy.
You must channel the four elemental stones to seal it.

Complexity 4: Need 12 successes before 3 failures.
Round 1/4: Channel the Earth Stone

Arcana DC 15 — Direct the magical energy
Constitution DC 13 — Withstand the backlash
Religion DC 14 — Invoke the proper blessing
Concentration Check DC 12 — Maintain focus while the rift fights back

Each failure: The rift grows wider, something comes through...

PARTY ASSIST:
  Lyra can use Arcana to amplify your channeling (+2 to your next check)
  Throk can anchor the ritual circle physically (auto-success on CON)
  Pip can watch for creatures emerging from the rift (Perception to prevent surprise)
```

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Skill challenge system | Successes vs. failures (4e-inspired) | 3 failures = challenge failed |
| Complexity levels | 5 levels: 3 to 15 successes needed | Scales with narrative importance |
| Puzzle types | 6 types: logic, environmental, moral, mechanical, social, combination | Maximum variety |
| Puzzle solutions | Always 2+ valid solutions including creative player approaches | Creativity rewarded |
| Hint system | 5-tier escalating hints, INT check shortcut option | Players never permanently stuck |
| AI puzzle evaluation | Accept any logically sound player solution, even unintended ones | TTRPG spirit: creativity wins |
| Party participation | Every member can contribute their strengths | Party composition matters |
| Social encounters | Can use skill challenge framework for major negotiations | Structured but flexible |
| Investigation system | Clue-based with red herrings, time pressure, multiple locations | Mystery-solving gameplay |
| Ritual system | Complex skill challenges with magical theming | Multi-person, multi-round |
| Brute force option | Always available but at a cost | Never punishment-locked |
| Time pressure | Optional real-time or in-game time limits | Creates tension |
| Non-stat solutions | Player intelligence valued alongside character abilities | Think, don't just roll |
| NPC attitudes | 5-tier attitude system affecting social DCs | Reputation matters |
