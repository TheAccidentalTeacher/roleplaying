# Stealth & Traps System
**AI RPG Project** | Design Docs

---

## THE PHILOSOPHY: The Rogue's Game

Not every problem should be solved with a sword. The best RPG moments often come from sneaking past the dragon, disarming the deadly trap, or setting an ambush that turns the tables on superior enemies. Stealth isn't just a mechanic — it's an entire **playstyle** that should be fully supported.

---

## Stealth Mechanics

### Core Stealth Resolution

Stealth is a **contested check**: the sneaker's Stealth (DEX) vs the observer's Perception (WIS).

```typescript
interface StealthCheck {
  character: string
  stealthRoll: number         // d20 + DEX mod + proficiency
  conditions: StealthModifier[]
  
  // Vs each observer
  observers: {
    name: string
    passivePerception: number  // 10 + WIS mod + proficiency
    activelyLooking: boolean   // If actively searching, roll Perception instead
    alertLevel: AlertLevel
  }[]
  
  result: 'undetected' | 'suspicious' | 'detected'
}

type AlertLevel = 
  | 'unaware'       // Normal passive perception
  | 'suspicious'    // +5 to passive perception, may actively search
  | 'alert'         // Actively searching, advantage on perception
  | 'alarmed'       // All guards actively searching, reinforcements coming

interface StealthModifier {
  source: string
  modifier: number
  description: string
}
```

### Stealth Modifiers

| Condition | Modifier to Stealth | Notes |
|-----------|---------------------|-------|
| Deep darkness (no light) | +5 | Observers without darkvision auto-fail visual checks |
| Dim light / shadows | +2 | Partial cover from sight |
| Bright light | -5 | Fully exposed |
| Heavy rain / storm | +3 | Sound masked |
| Silence spell / ability | +5 | No sound at all |
| Heavy armor | Disadvantage | Clanking metal |
| Medium armor (no Stealth disadv.) | No modifier | Breastplate, half-plate |
| Light armor | No modifier | Leather, studded leather |
| Invisibility | Advantage + unseen | Visual detection impossible |
| Pass Without Trace | +10 | Powerful stealth spell |
| Boots of Elvenkind | +5 | No sound from footsteps |
| Cloak of Elvenkind | Advantage | Harder to spot visually |
| Moving quickly | -3 | Running = noise |
| Holding still | +3 | Nothing to notice |
| Carrying torch/light | Auto-fail in dark | You're a beacon |
| Number in party > 2 | -2 per extra member | More people = more noise |

### Stealth Gameplay Modes

#### Exploration Stealth
Moving through dangerous areas while trying to avoid detection:

```
You press against the cold stone wall of the corridor, 
listening. Ahead, you can hear the rhythmic footsteps 
of a patrol — two guards, by the sound of it. Their 
torchlight flickers on the far wall.

[Wait for them to pass — Stealth DC 12]
[Move to the alcove on the left — Stealth DC 14]  
[Create a distraction — throw a coin down the hall]
[Ambush them as they pass — Stealth attack]
[Try to bluff your way past — Deception]
[Find another route — Perception DC 13 to spot side passage]
```

#### Combat Stealth
Using stealth during combat per D&D 5e rules:

```
Requirements to Hide in combat:
1. Must have something to hide behind/in (cover, darkness, fog)
2. Use Hide action (uses your action)
3. Roll Stealth vs enemy passive Perception
4. If successful: attacks against you have disadvantage, 
   your next attack has advantage (Unseen Attacker)
5. Attacking from hiding reveals your position

Rogues: Can Hide as a BONUS action (Cunning Action)
Rangers: Can attempt to hide in natural environments even 
         with only light obscurement
```

#### Social Stealth
Blending into crowds, disguises, infiltration:

```
The nobleman's ball is in full swing. You need to reach 
the study on the second floor, but the staircase is 
guarded and the room is full of people who might 
recognize you.

[Disguise yourself as a servant — Deception DC 14]
[Mingle and wait for an opening — Performance DC 12]
[Find a window to climb — Athletics DC 15 + Stealth DC 13]
[Distract the guard — your choice of method]
[Ask your noble contact for help — Persuasion DC 11]
[Cause a scene to clear the staircase — Intimidation DC 16]
```

### Alert System

When enemies are partially aware of the party, an **alert level** escalates:

```
ALERT LEVEL PROGRESSION:

Level 0 — UNAWARE
  Enemies at normal routine. Passive Perception.
  
Level 1 — SUSPICIOUS  
  Trigger: Noise, shadow, "did you hear that?"
  Effect: +5 passive Perception, guards may investigate
  Decay: Returns to Level 0 after 5 minutes if no further triggers
  
Level 2 — ALERT
  Trigger: Found evidence (open door, missing item, tracks)
  Effect: Active Perception checks, guards pair up, patrols change
  Decay: Returns to Level 1 after 15 minutes
  
Level 3 — ALARMED
  Trigger: Spotted intruder, combat heard
  Effect: All guards actively searching, reinforcements called, 
          doors locked, alert spread to adjacent areas
  Decay: Never fully decays. Returns to Level 2 after 30 minutes.
          Area remains on heightened security permanently.
  
Level 4 — LOCKDOWN
  Trigger: Major security breach, boss alerted
  Effect: All exits sealed, every enemy searching, environmental 
          hazards activated (traps armed, portcullises dropped)
  Decay: Must be resolved through combat, negotiation, or escape.
```

### Ambush System

Setting up an ambush reverses the usual dynamic — the PLAYER surprises the enemies:

```typescript
interface AmbushSetup {
  ambushers: string[]            // Who is hiding
  position: string               // Where they're hiding
  triggerCondition: string       // "When the patrol reaches the bridge"
  stealthChecks: number[]        // Each ambusher rolls Stealth
  
  // All ambusher Stealth vs enemy passive Perception
  // If ALL succeed: Surprise round (enemies can't act)
  // If SOME succeed: Those enemies are surprised, others are not
  // If NONE succeed: No surprise, combat starts normally
  
  surpriseRound: boolean
  surprisedEnemies: string[]     // Which enemies didn't notice
}
```

---

## Trap System

### Trap Resolution Flow

Every trap follows this sequence:

```
1. DETECTION
   - Passive Perception notices something suspicious
   - Or active Investigation check when searching
   - AI describes what you notice (without revealing the trap type)
   
2. IDENTIFICATION  
   - Investigation check to understand the trap mechanism
   - Higher roll = more detail (type, trigger, effect)
   
3. DISARMING (or avoidance)
   - Thieves' Tools check to disarm (DEX + proficiency)
   - Or bypass: avoid the trigger area, block the mechanism
   - Or trigger deliberately from safety (if possible)
   - Dispel Magic for magical traps
   
4. CONSEQUENCE
   - Success: Trap disarmed, XP awarded, possible salvage
   - Failure: Trap triggered, damage/effect applied
   - Critical failure: Trap triggers AND complications (collapse, alarm)
```

### Trap Types

```typescript
interface Trap {
  id: string
  name: string
  type: TrapCategory
  tier: TrapTier
  
  // Detection
  detectionDC: number          // Perception (passive or active)
  investigationDC: number      // To identify mechanism
  
  // Disarm
  disarmDC: number             // Thieves' tools check
  disarmMethod: string         // Description of how to disarm
  alternativeBypass: string[]  // Other ways around it
  
  // Effect
  triggerCondition: string     // "Stepping on the pressure plate"
  effect: TrapEffect
  areaOfEffect: string        // "5-foot square" or "10-foot cone" etc.
  
  // Metadata
  resetable: boolean           // Does it reset after triggering?
  magical: boolean             // Requires Detect Magic / Dispel Magic?
  visible: boolean             // Can be seen without Perception check?
  salvageable: boolean         // Can parts be harvested?
  salvageResult?: string       // What you get from salvaging
}

type TrapCategory = 
  | 'mechanical'       // Physical mechanisms (darts, pits, blades)
  | 'magical'          // Arcane traps (glyphs, runes, wards)
  | 'natural'          // Quicksand, sinkholes, unstable terrain
  | 'creature'         // Living traps (mimics, lurkers, web traps)
  | 'environmental'    // Gas, flooding, collapsing ceiling
  | 'alarm'            // Alert traps that don't do damage

type TrapTier = 'minor' | 'moderate' | 'dangerous' | 'deadly' | 'legendary'

interface TrapEffect {
  damageType: string           // "piercing", "fire", "necrotic", etc.
  damageFormula: string        // "2d10", "4d6 + poison", etc.
  savingThrow: {
    ability: string            // "DEX", "CON", "WIS"
    dc: number
    halfOnSuccess: boolean
  }
  additionalEffect?: string   // "Poisoned for 1 hour", "Restrained", "Alarm"
  duration?: string            // How long the effect lasts
}
```

### Trap Tier Table

| Tier | Detection DC | Disarm DC | Damage | Save DC | Level Range |
|------|-------------|-----------|--------|---------|-------------|
| Minor | 10-12 | 10-12 | 1d6-2d6 | 10-12 | 1-4 |
| Moderate | 13-15 | 13-15 | 3d6-4d6 | 13-15 | 5-8 |
| Dangerous | 15-17 | 15-17 | 5d6-8d6 | 15-17 | 9-12 |
| Deadly | 18-20 | 18-20 | 10d6-12d6 | 18-20 | 13-16 |
| Legendary | 21+ | 21+ | 16d6+ | 21+ | 17-20 |

### Common Trap Examples

#### Mechanical Traps
```
PIT TRAP (Minor)
  Detection: DC 12 (notice slightly different colored floor)
  Trigger: Weight on pressure plate
  Effect: 10-foot fall, 1d6 bludgeoning
  Disarm: DC 10 (jam the mechanism with a piton)
  Variants: Spiked pit (+1d6 piercing), hidden pit (DC 15), 
            locking pit (grate closes above)

DART WALL (Moderate)
  Detection: DC 14 (tiny holes in the wall at chest height)
  Trigger: Tripwire at ankle height
  Effect: 4d6 piercing, DEX save DC 14 for half
  Disarm: DC 14 (cut tripwire AND plug holes)
  Variant: Poisoned darts (+poisoned condition 1hr)

CRUSHING CEILING (Dangerous)
  Detection: DC 16 (scratches on floor, dust from above)
  Trigger: When central treasure is removed
  Effect: 8d6 bludgeoning, STR save DC 16 to hold it
  Disarm: DC 17 (wedge supports into ceiling mechanism)
  Countdown: 3 rounds to escape or disarm after trigger

BLADE CORRIDOR (Deadly)
  Detection: DC 18 (razor-thin slots in walls)
  Trigger: Entering the corridor
  Effect: 10d6 slashing, DEX save DC 18 for half
  Disarm: DC 19 (requires navigating to the end to disable)
  Pattern: Blades swing in a pattern — Acrobatics DC 15 to time it
```

#### Magical Traps
```
GLYPH OF WARDING (Moderate)
  Detection: DC 15 (glowing rune, visible with Detect Magic)
  Trigger: Moving within 5 feet of the glyph
  Effect: 4d8 elemental damage (varies), DEX save DC 14
  Disarm: DC 15 (Dispel Magic or Thieves' Tools + Arcana)
  Variant: Spell glyph (stores a spell instead of damage)

PHANTASMAL TRAP (Dangerous)
  Detection: DC 17 (ripple in the air, WIS check)
  Trigger: Looking at it directly
  Effect: WIS save DC 16 or frightened + 4d10 psychic
  Disarm: Close your eyes and Dispel Magic, or Arcana DC 17
  
SOUL SNARE (Deadly)
  Detection: DC 20 (invisible to non-magical senses)
  Trigger: Touching designated object
  Effect: CHA save DC 19 or trapped in gem (as Soul Trap)
  Disarm: DC 20 Arcana + Dispel Magic DC 18
  Warning: Detect Magic reveals overwhelming necromancy aura
```

#### Natural Hazards (Treated as Traps)
```
QUICKSAND
  Detection: DC 13 (ground looks slightly different)
  Trigger: Walking onto it
  Effect: Restrained, sinking 1 foot/round
  Escape: STR DC 14 (with help), DC 17 (alone)
  Time pressure: Submerged in 3 rounds → drowning

CAVE-IN
  Detection: DC 15 (cracks in ceiling, dust falling)
  Trigger: Loud noise, vibration, combat
  Effect: 6d6 bludgeoning, DEX save DC 15, buried if failed
  Buried: STR DC 16 to dig free (or be dug out by allies)
  
POISONOUS SPORES
  Detection: DC 14 (faintly glowing mushrooms)
  Trigger: Disturbing the fungi (stepping on, wind from movement)
  Effect: CON save DC 13 or poisoned + 2d6 poison/round
  Bypass: Hold breath, wind spell to clear, or careful avoidance
```

#### Creature "Traps"
```
MIMIC
  Detection: DC varies (mimics have Stealth +5)
  Trigger: Touching/opening the object
  Effect: Bite attack + Adhesive (grappled)
  "Disarm": It's a monster. Kill it or negotiate (some mimics are friendly!)

SPIDER WEB
  Detection: DC 12 (hard to see in darkness)
  Trigger: Walking into it
  Effect: Restrained, STR DC 13 to break free
  Complication: The spider(s) that made it arrive in 1d4 rounds

YELLOW MOLD
  Detection: DC 12 (patches of yellow-green on walls/floor)
  Trigger: Touching or disturbing
  Effect: CON save DC 13 or 2d10 poison damage + poisoned
  Destroy: Sunlight or fire (but fire triggers it first!)
```

### Player-Set Traps

Players (especially rogues and rangers) can SET traps:

```typescript
interface PlayerTrap {
  setter: string               // Who sets it
  trapType: string             // From their known traps
  location: string             // Where they place it
  setupTime: number            // Minutes to set up
  skillCheck: number           // Tinker's tools or Survival check
  
  // The resulting trap's DCs are based on the setter's check
  resultingDetectionDC: number // Based on setter's roll
  resultingDisarmDC: number    // Based on setter's roll
  
  // Materials required
  materialsUsed: string[]      // "10 feet of rope", "hunting trap", "flask of oil"
}
```

Craftable trap examples:
```
HUNTING TRAP (Equipment)
  Materials: Hunting trap item (5 GP)
  Setup: 1 minute, no check needed
  Effect: 1d4 piercing + restrained, STR DC 13 to escape
  
TRIPWIRE ALARM (Ranger/Rogue)
  Materials: 50 feet of string, bells or cans
  Setup: 5 minutes, Survival DC 10
  Effect: Noise alert — wakes camp, warns of approach
  
OIL SLICK (Anyone)
  Materials: Flask of oil
  Setup: 1 action
  Effect: 10-foot area becomes difficult terrain
  Combo: Light it on fire = 2d6 fire damage per round for 2 rounds

SNARE TRAP (Ranger)
  Materials: Rope, anchor point
  Setup: 10 minutes, Survival DC 13
  Effect: Target hoisted upside-down, restrained
  Detection DC: Equal to ranger's Survival check

EXPLOSIVE RUNE (Wizard/Sorcerer)
  Materials: Spell slot, chalk/ink
  Setup: 10 minutes of ritual casting
  Effect: 4d8 damage (type chosen at creation)
  Detection DC: Equal to caster's spell DC
```

---

## Lockpicking

### Lock Complexity

```typescript
interface Lock {
  quality: LockQuality
  dc: number
  specialRequirement?: string   // "Requires specific key shape" or "Magically sealed"
  consequences: string          // What happens on failure
  attempts: number              // How many tries before it's jammed/alerting
}

type LockQuality = 'simple' | 'average' | 'good' | 'superior' | 'masterwork' | 'magical'
```

| Quality | DC | Typical Location | Cost |
|---------|----|--------------------|------|
| Simple | 10 | Peasant homes, basic chests | 5 GP |
| Average | 13 | Merchant shops, standard doors | 20 GP |
| Good | 15 | Noble homes, guild halls | 50 GP |
| Superior | 18 | Vaults, prisons, important doors | 200 GP |
| Masterwork | 21 | Royal treasury, arcane locks | 500 GP |
| Magical | 22+ | Requires Dispel Magic / specific key | Priceless |

### Lockpicking Process

```
You examine the lock on the treasury door. It's a 
complex mechanism — superior quality dwarven make, 
with three tumblers and an anti-pick guard.

Lockpicking (Thieves' Tools + DEX): DC 18
Attempt 1 of 3 before the lock jams.

[Pick the lock carefully — takes 1 minute]
[Rush it — takes 1 action, DC +3]
[Use magic (Knock spell) — automatic success, LOUD]
[Look for the key instead]
[Try to break the door — STR DC 20]
```

---

## Stealth Mission Structure

### Infiltration Encounters

The AI can generate full stealth missions as alternative approaches to combat encounters:

```
INFILTRATION MISSION TEMPLATE:

1. BRIEFING
   What needs to be stolen/reached/accomplished
   Known layout (partial)
   Known guards/security
   
2. APPROACH
   Multiple entry points (front, window, roof, sewers, etc.)
   Each has different challenges
   
3. INTERIOR
   Guard patrols with patterns (AI generates routes)
   Environmental obstacles
   Information to be gathered
   
4. OBJECTIVE
   Reach the target / steal the item / rescue the person
   
5. EXTRACTION
   Getting out (may trigger alert)
   Consequences of alert level
   
SUCCESS CONDITIONS:
  Perfect: No alerts raised, objective complete
  Good: Alert level 1-2, objective complete
  Messy: Alert level 3+, objective complete but consequences
  Failed: Detected, objective not complete, consequences
```

---

## AI Integration Notes

The AI handles stealth with special care:

```
STEALTH AI GUIDELINES:
1. DESCRIBE what the player perceives, not what's hidden
   Good: "The corridor is quiet. Torchlight flickers from around the corner."
   Bad: "There are two guards around the corner."
   
2. REWARD creative solutions
   If the player's stealth plan makes sense, it should work or at least 
   improve their odds, even if it's unconventional.
   
3. TELEGRAPH danger fairly
   Players should have enough information to make informed stealth decisions.
   Don't spring undetectable traps or invisible guards without warning.
   
4. GIVE partial information for partial successes
   Perception 14 vs DC 15: "You sense something is wrong with this door, 
   but you can't pinpoint what."
   
5. MAKE stealth feel powerful
   Sneaky characters should feel rewarded for their build. A rogue who 
   invested in stealth should feel like a ghost.
```

---

## Decisions Table

| Decision | Choice | Notes |
|----------|--------|-------|
| Core stealth | Contested check: Stealth vs Perception | Standard D&D 5e resolution |
| Stealth modifiers | Extensive table (light, armor, weather, movement, party size) | Comprehensive tactical options |
| Stealth modes | Exploration, combat, social stealth | Three distinct gameplay modes |
| Alert system | 5 levels: Unaware → Lockdown | Escalating tension mechanic |
| Alert decay | Levels 0-2 decay over time, 3+ permanent heightened security | Consequences for being noticed |
| Ambush system | Stealth vs passive Perception for surprise round | Rewards stealth-oriented parties |
| Trap categories | 6 types: mechanical, magical, natural, creature, environmental, alarm | Full variety |
| Trap tiers | 5 tiers scaling from levels 1-20 | Appropriate challenge at every level |
| Trap flow | Detect → Identify → Disarm/Bypass → Consequence | Clear resolution sequence |
| Player traps | Characters can craft and set their own traps | Rogue/ranger fantasy |
| Lockpicking | Quality-based DCs, limited attempts | Meaningful lockpick gameplay |
| Stealth missions | Full infiltration encounter structure | Complete alternative to combat |
| AI stealth rules | Don't reveal hidden info, reward creativity, telegraph fairly | Fair play principles |
| Common traps | 15+ fully statted examples across all categories | Ready to use immediately |
