# AI RPG Dungeon Master - Feature Brainstorming & Planning
**Living Document** | Last Updated: 2026-02-25

---

##  Core Vision � THE FUNDAMENTAL TRUTH

> **This is not a game with a story. This is an infinite story engine.**
>
> Every character creates a brand new world, from scratch, that has never existed before and will never exist again.
> Two players will never have the same experience. Ever.
> Each character IS their story. Each story IS their universe.
> When you delete a character, that universe ends.
> When you create a new one, a new universe is born.

### What This Actually Is

**NOT**: A game where you follow a pre-written story with branching paths  
**NOT**: A game where AI fills in Mad-Libs around a fixed quest template  
**IS**: A generative fiction engine where Claude Opus authors an entirely original world � its history, cosmology, factions, geography, magic system, villains, prophecies, secrets � specifically for YOUR character, at the moment of creation, never to be repeated  

**Every single thing is generated**:
- The world's name and history
- The current political landscape
- The central conflict (could be anything � a dying god, a stolen child, a plague that turns people into light, a machine that erases memory, a war between corporations in space)
- The magic system (or lack of it)
- Your character's place in it
- The companions you'll meet
- The villain's face, name, motivation
- The artifact or threat at the center of it all
- The lore you'll discover in old books
- The rumors in taverns

The Belgariad, the Malloreon, Skyrim, Oblivion, Witcher, Mass Effect, The Last of Us, Dune � these are not templates. They are **proof that certain narrative shapes resonate deeply with humans**. Claude knows all of them. Claude draws on all of them. But the result is always something new.

###  DECIDED: Core Philosophy

-  Each character = unique world, completely separate, no crossover
-  No two playthroughs share the same world, quest, or arc
-  AI generates everything at world creation � nothing is pre-written
-  Stories are ever-evolving, never truly "finished" � NG+ and sequel arcs possible
-  The player's choices genuinely shape what the story becomes
-  Genre is fluid � a story can start as fantasy and become horror after a pivotal event
-  The DM never says "you can't do that" � it adapts to everything
-  Completely unlimited scope: as small as one village, as large as the multiverse
-  Budget and AI capability are the only limits, and both are effectively unlimited

---

##  WORLD GENERATION � The Engine Room

### What Gets Generated When You Create a Character

Before the first scene plays, Claude Opus runs a **World Genesis** sequence. This generates and stores the complete world bible for this character's universe. It takes ~10-15 seconds and happens once.

```typescript
interface WorldRecord {
  // Identity
  id: string
  characterId: string
  worldName: string
  createdAt: Date

  // Cosmology & Structure
  worldType: WorldType          // See below � hundreds of options
  magicSystem: MagicSystem      // Fully described rules
  technologyLevel: string       // Stone age to post-singularity
  cosmology: string             // How the universe works in this world
  afterlife: string             // What death means here
  time: string                  // Linear? Cyclical? Broken?

  // History
  ageOfWorld: string            // Ancient, young, dying, reborn?
  majorHistoricalEras: Era[]    // 3-5 defining periods
  catastrophes: string[]        // What has already broken this world
  legends: Legend[]             // Myths that may or may not be true

  // Current State
  factions: Faction[]           // 4-8 competing powers
  geography: Region[]           // Named regions with distinct character
  currentConflicts: string[]    // What's happening RIGHT NOW
  powerVacuums: string[]        // Where the world is unstable

  // The Central Story
  mainThreat: Threat            // What will destroy/transform everything
  centralArtifact?: Artifact    // The thing at the heart of it all (optional)
  prophecy?: Prophecy           // Ancient prediction about the player (optional)
  villainCore: VillainProfile   // The primary antagonist � with real motivations
  secretHistory: string         // What nobody knows yet but the player will discover

  // The Player's Place
  playerRole: string            // Why THIS character matters in THIS world
  originScenario: OriginScenario  // How the story starts for them
  firstNPCMet: NPC              // The person who changes everything in scene 1

  // Tone & Feel
  narrativeTone: NarrativeTone  // See below
  primaryGenre: Genre
  genreBlends: Genre[]          // Secondary genre flavors
  thematicCore: string          // The ONE human truth this story explores
}
```

### World Types � The Starting Shape

These are NOT templates � they are **seeds**. Claude uses them as a launching point and generates everything else original.

**Fantasy Worlds**:
- Classic High Fantasy (magic is wondrous, evil is ancient)
- Dark Fantasy (magic corrupts, power has cost, death is common)
- Dying World (the magic is fading, the old powers are failing)
- Young World (gods still walk, everything is being decided for the first time)
- Fallen Empire (glorious past, crumbling present, uncertain future)
- Conquered World (a great evil already won � you live under its shadow)
- Mythic Age (you ARE the heroes of legend, creating the myths people will tell forever)
- Hidden Magic (magic exists but is secret, feared, hunted)
- Clockwork Fantasy (magic AND technology in fragile balance)
- Planar World (multiple overlapping realities, thin walls between them)

**Science Fiction Worlds**:
- Deep Space Opera (galaxy-spanning civilization, ancient alien secrets)
- Hard Sci-Fi (physics matters, no FTL, survival is engineering)
- Post-Singularity (AI became god, what are humans now?)
- Generation Ship (born in space, never seen a planet, ship is your whole world)
- Colony World (first settlers, alien biosphere, corporate ownership)
- Post-Contact (aliens arrived � was it good? bad? complicated?)
- Dyson Sphere (megastructure civilization, impossible scale)
- Time War (history itself is the battlefield)
- Uploaded World (most humans are digital, some aren't, conflict ensues)

**Contemporary/Near-Future Worlds**:
- Modern Magic Revealed (magic was always real, now everyone knows)
- Zombie Apocalypse (choose your strain: fast, slow, hive mind, parasitic, etc.)
- Alien Occupation (they came and they stayed)
- Pandemic World (not zombies � something stranger)
- Climate Collapse (flooded coasts, migration wars, survival economy)
- Corporate Dystopia (megacorps replaced governments, cyberpunk light)
- Superhuman Emergence (some people developed powers � society fractured)
- Secret Government (shadow organizations control everything � you found out)
- Interdimensional Leak (other worlds are bleeding into ours)

**Historical/Mythological Worlds**:
- Norse Twilight (Ragnarok has begun, you fight alongside gods)
- Greek Heroic Age (monsters are real, gods are literal, fate is everything)
- Egyptian Eternal (the afterlife is real and accessible, gods need champions)
- Arthurian Twilight (the age of heroes is ending � or beginning)
- Feudal Japan Supernatural (oni, yokai, spirits � and the world is at war)
- Age of Sail Mythology (sea monsters are real, islands appear and vanish)
- Mesopotamian Dawn (the first cities, the first gods, the first wars)
- Celtic Spiritworld (the veil between worlds is paper-thin)
- Aztec Sun-Keeping (the sun requires sacrifice to keep moving � you discover why)

**Hybrid / Strange Worlds**:
- Dying Universe (heat death is coming, last civilization, last hope)
- Dream World (is this real? does it matter?)
- Recursive Reality (stories within stories � are you in someone else's fiction?)
- The Long Fall (a world falling through space � where did it come from? where is it going?)
- Reversed History (Rome never fell, the Mongols built a space program, etc.)
- Monster's World (you are what humans would call a monster)
- The Afterlife Itself (you're dead � now what?)
- Inside a God (the world is a living divine being)
- Pocket Universe (someone built this world deliberately � who? why?)
- THE VOID BETWEEN (the space between realities � you are a traveler with no home)

### Narrative Tones

Combined freely � a world can be multiple:
- Epic & Heroic | Dark & Unforgiving | Mythic & Ancient
- Intimate & Personal | Political & Complex | Cosmic & Vast
- Humorous & Absurd | Tense & Paranoid | Oppressive & Claustrophobic
- Wondrous & Exploratory | Tragic & Inevitable | Hopeful Against All Odds
- Surreal & Dreamlike | Brutal & Grounded | Philosophical & Questioning

### The Villain � Always Real, Always Complex

Generated villains are NOT "evil for evil's sake." Every villain has:
- A comprehensible motivation (what do they WANT and WHY)
- A history that explains how they got here
- Something they love (makes them dangerous AND human)
- A point where they could have been stopped (missed opportunity that haunts them)
- A genuine argument (could they be right about anything?)
- A face and a name and a voice
- Their own tragic arc unfolding parallel to yours

**Villain archetypes** (all generated into original characters):
- The Idealist Gone Too Far (ends justify means, truly believes in their cause)
- The Wounded God (ancient power, ancient hurt, ancient rage)
- The Mirror (someone who made the exact choices you could have made)
- The Machine (something that was built to do something � it won't stop)
- The Grieving Parent / Child (loss transformed into world-destroying purpose)
- The Revolutionary (the current order IS evil � their methods are worse)
- The Last Believer (everyone else abandoned the cause � they won't)
- The One Who Knows (they've seen the future and it's terrible � this is prevention)
- The Replaced (something inhuman wearing a familiar face)
- The Forgotten (power that was cast aside and accumulated hatred in the dark)

---

##  QUEST ARCHITECTURE � How Stories Are Structured

### The Main Story Arc

**Generated fresh for every character.** Not a template filled in � a genuinely authored story.

The AI is given:
- The World Record (full world bible)
- The Character Record (who you are, where you came from, what you're capable of)
- A set of **narrative architecture principles** (the shapes that make stories work)
- Permission to surprise

The result is an **Act Structure** that is:
- Unique to this world and this character
- Internally consistent (the villain's plan was always in motion)
- Emotionally complete (has a real arc, real stakes, real cost)
- Open-ended (can always grow � new threats, new revelations, NG+)

**Narrative Architecture Principles** (what Claude draws from � not a formula, but a compass):

```
Every great story has:
- Something the hero WANTS (external goal)
- Something the hero NEEDS (internal truth they haven't realized)
- Something they MUST LOSE to become who they need to be
- A moment where everything they believed is tested
- A choice that could go either way
- A cost that makes the victory meaningful
- A world that is genuinely different because they were in it
```

**Story length is fluid**:
- Short Arc: 5-10 sessions (one focused conflict resolved)
- Standard Arc: 15-30 sessions (full hero journey)
- Epic Arc: 50+ sessions (world-spanning saga with multiple acts)
- Endless Arc: Story continues indefinitely, always evolving, NG+ layers

### Genre Quests � The Multiverse in Action

**Q8 DECIDED**: Primary = The Multiverse (D), with Rift/Portal (A) as the physical mechanism

**How it works**:
Your world is part of a multiverse. Other worlds exist � some impossibly different. Rifts, portals, artifacts, and ancient rituals allow travel between them. Your character is among the vanishingly few who can survive the crossing.

Genre quests are:
- **Diplomatic missions** � a neighboring world needs help
- **Rescue operations** � someone was pulled through a rift
- **Resource gathering** � something in another world is needed here
- **Strategic necessity** � understanding a threat requires seeing its source world
- **Personal** � someone you love crossed over
- **Accidental** � you fell through a rift and now you have to find your way back
- **Orchestrated** � an enemy deliberately opened a rift as a weapon

Each genre world is **fully real and fully generated**:
- It has its own inhabitants, history, current crisis
- It is not a "level" � it is a place with stakes of its own
- Decisions you make there have consequences in that world
- The people you help remember you
- Loot from that world is exotic/legendary in yours

**50+ Genre World Seeds** (generated from scratch each time you access them):

_Horror_: Zombie outbreak, viral horror, body horror, haunt, eldritch manifestation, slasher survival, cosmic horror, ghost world, vampiric aristocracy, werewolf nation, pandemic of consciousness, digital ghost plague

_Sci-Fi_: Deep space colony, generation ship, AI uprising, first contact, time loop, dyson sphere mystery, uploaded consciousness, megastructure failure, cold war in space, alien occupation Earth, uploaded god

_Contemporary_: Secret magic city, corporate dystopia, superhuman underground, shadow government conspiracy, interdimensional refugee crisis, last library of human knowledge

_Historical/Mythological_: Norse Ragnarok in progress, Trojan War with real gods, Arthurian endgame, Egyptian Book of the Dead made literal, Mesoamerican apocalypse, Feudal Japan spirit war

_Weird_: A world where everyone forgot how to die, a world made of music, a world of endless ocean, a world inside a dream, a world where history runs backwards, a world that is a single enormous creature, a world in freefall through a void, a world of eternal night that has never seen the sun

_Future_: Post-human civilization, uploaded afterlife gone wrong, last organic being, machine civilization seeking its origin, heat death countdown, reality being deliberately unmade

**These are seeds. The ACTUAL worlds are generated fresh every time.** No two visits to "a zombie world" will ever be the same world.

### Quest Module Structure

Every quest � main, side, or genre � is stored as:

```typescript
interface Quest {
  id: string
  worldId: string            // Which universe this belongs to
  type: 'main' | 'side' | 'genre' | 'personal' | 'faction' | 'companion'
  
  // Identity
  title: string              // Generated, evocative, unique
  logline: string            // One sentence: the whole quest
  fullDescription: string    // What the player is told at the start
  secretTruth: string        // What's REALLY happening (revealed during quest)
  
  // Genre
  primaryGenre: Genre
  subGenres: Genre[]
  worldType: WorldType       // If it takes place in another world
  tone: NarrativeTone[]
  magicRules: string         // The specific rules for this quest's world
  
  // Structure
  acts: QuestAct[]           // Generated story beats
  keyDecisionPoints: string[] // The moments where player choices actually matter
  possibleEndings: Ending[]  // Multiple real endings depending on choices
  
  // Mechanics specific to this quest type
  uniqueMechanics: string[]  // "Infection spreads if you take damage" / "Magic doesn't work here"
  survivalRules?: string     // Special rules for this world
  
  // Connections
  feedsIntoMainQuest: boolean
  unlocksWorlds?: string[]   // Does completing this open access to new worlds?
  npcCarryover: NPC[]        // NPCs who travel back with you
  lootProfile: LootProfile   // What kinds of items fit this world
  
  // State
  status: 'available' | 'active' | 'completed' | 'failed' | 'abandoned'
  choices: Choice[]          // Record of every decision made
  outcome: string            // Final result, written by AI post-completion
}
```

### Starting Points � Infinite Origins

**Q10 DECIDED**: Completely unlimited. AI generates the opening scene.

At character creation, a player provides:
1. **Character basics** (name, rough archetype or class, optional physical description)
2. **One sentence** (optional): anything � a feeling, an image, a situation, a genre, a mood
3. **That's it**

Claude Opus takes those inputs plus the newly-generated World Record and authors a completely original opening scene. There is no menu of starting scenarios. The scene IS the start. It will never repeat.

**Examples of what that one sentence could produce**:

- *"I want to start in a city"*  Opens in a teeming port city, morning market, a suspicious merchant drops something at your feet and runs
- *"Something about ships"*  You wake up on a ship you don't remember boarding, in the middle of an ocean that doesn't match any map
- *"I want to feel like I have no power at first"*  Slave auction scene, a buyer with strange eyes purchases you for an unusual reason
- *"Start me in danger"*  In the middle of a chase. Someone is after you. You don't know why yet.
- *"Family"*  Your sister hasn't come home. She was investigating something. Her room is empty except for a strange symbol carved into the floor.
- *"Cold"*  A glacier. You are partially frozen but alive. No memory of how you got here. On the ice beside you: a weapon that doesn't belong in this era.
- *"Begin at the end"*  The war is over. Your side lost. You are the only one who escaped. The thing you were protecting is now in enemy hands.
- *"Something funny"*  You are running from an angry tavern owner. You owe them for last night. Also possibly you accidentally stole a magical goat.
- *"I want romance"*  A letter arrives. Someone you loved years ago needs help. But the handwriting is wrong � they've been dead for three years.
- *"Cosmic"*  You receive a vision. A being of immense age and power shows you the end of everything. Then wakes you up. "Good," it says. "You saw it. Now it doesn't have to happen."
- *"Science fiction, hard"*  Wake-up cycle complete. You are 47 light years from Earth. The rest of the crew is dead. The mission log shows 300 years have passed.
- *"I want to be bad"*  You ARE the assassin. The contract is simple. Then you see who you're supposed to kill. A child. Something shifts.
- *nothing at all*  Pure surprise. Claude authors something completely out of left field. The most unpredictable opening possible.

---

##  AI Integration Strategy

### Available AI Models (CURRENT as of Feb 2026)

**Anthropic Claude**:
- `claude-opus-4-6` � Most intelligent, $5/$25 per MTok, 200K context
- `claude-sonnet-4-6` � Best speed+intelligence balance, $3/$15 per MTok
- `claude-haiku-4-5` � Fastest/cheapest, $1/$5 per MTok

**OpenAI**:
- `gpt-5.2` � Flagship, highest reasoning, $1.75/$14 per MTok, 400K context
- `gpt-5` � Strong general, $1.25/$10 per MTok
- `gpt-5-mini` � Fast + cheap, $0.25/$1 per MTok
- `o3` � Deep reasoning (puzzles/strategy), $10/$40 per MTok
- `o4-mini` � Fast reasoning (math/calc), $1.10/$4.40 per MTok
- `gpt-image-1` � Latest image generation (highest quality)
- `dall-e-3` � Reliable image generation (fallback)

###  DECIDED: Task-to-Model Routing

| Task | Model | Why |
|------|-------|-----|
| Main DM Narration | `claude-opus-4-6` | Best storytelling, richest output |
| Quest Generation | `claude-opus-4-6` | Complex creative world-building |
| World Building | `claude-opus-4-6` | Deep, consistent lore |
| Combat Narration | `claude-sonnet-4-6` | Fast + vivid descriptions |
| Loot Generation | `claude-sonnet-4-6` | Creative + structured |
| NPC Dialogue | `claude-sonnet-4-6` | Great character voice |
| Bestiary Entries | `claude-sonnet-4-6` | Detail + speed |
| Item Descriptions | `claude-haiku-4-5` | Cheap, fast, high volume |
| Quick Lookups | `claude-haiku-4-5` | Instant responses |
| Combat Math/Dice | `o4-mini` | Fast structured reasoning |
| Crafting Outcomes | `o4-mini` | Math + proc calc |
| Scene/Character Art | `gpt-image-1` | Highest quality |
| Item/Location Art | `dall-e-3` | Reliable, fast fallback |

### Multi-Model Strategy

#### **Option A: Single Primary Model**
Use GPT-4 for everything, super consistent
- Pros: Consistency, simpler, lower cost
- Cons: Potentially less variety, single point of failure

#### **Option B: Specialized Models**
Different AI for different purposes
- **Main DM Narration**: GPT-4 or Claude (alternating?)
- **Combat System**: Faster model (GPT-3.5 or Llama)
- **NPC Dialogue**: Claude (known for character work)
- **Image Generation**: Mix of DALL-E, Stability, Replicate
- **Item/Quest Generation**: Specialized prompts on GPT-4

#### **Option C: Ensemble Approach**
Multiple AIs vote/collaborate on decisions
- DM gets input from 2-3 models, synthesizes
- Pros: More creative, diverse
- Cons: Slower, more expensive

**Questions to Answer**:
1. Do you want consistency (same AI voice) or variety?
2. Is cost a concern? (GPT-4 is $0.01-0.03 per request)
3. Should different NPCs have different "AI voices"?

**Current Decision**:  DECIDED � Specialized Routing via `lib/ai-orchestrator.ts` (see Task-to-Model table below)

---

##  Visual Strategy - Making It Unforgettable

###  DECIDED: Tiered Generation with Genre-Shifting Art Style

#### Art Style: Shifts with Quest Genre
 **DECIDED**: Each quest genre has its own visual identity. The prompts encode the style.

| Genre | Art Style |
|-------|-----------|
| Classic Epic Fantasy | Painterly, warm � Tolkien/Elden Ring illustrated concept art |
| Dark Fantasy | Gritty, desaturated, high-contrast � Diablo/Witcher |
| Zombie / Horror | Desaturated, grainy, cinematic � The Last of Us |
| Sci-Fi / Alien | Clean, cold, glowing � Mass Effect / Arrival |
| Cyberpunk | Neon-lit, rain-soaked, dystopian |
| Post-Apocalypse | Dusty, ruined beauty � Road / Mad Max |
| Mystery / Noir | Moody shadows, sepia tones |
| Pirate / Sea | Painterly, oceanic � classic maritime illustration |
| Lovecraftian | Surreal, unsettling, non-Euclidean geometry |
| Mythological | Classical oil painting style � Renaissance meets ancient world |

Every image prompt is prefixed with the genre style descriptor so art is **instantly recognizable by genre** while still looking premium.

#### Image Trigger Tiers

**Tier 1 � Always Generate** (`gpt-image-1`, highest quality):
 Character portrait at creation (saved permanently to database)
 Every named NPC on first meeting
 Every Rare+ item discovered (saved to character's item card)
 Boss / Elite enemy portraits
 Quest completion cinematic moments
 Limit Break / Execution move "hero shot"

**Tier 2 � Generate on First Visit, Cache Forever** (`dall-e-3`):
 Major locations (same tavern always looks the same)
 Dungeon/area establishing shots
 New biome/region discovery
 Key story scenes (cutscene equivalents)

**Tier 3 � Free Stock Photos** (Pexels/Unsplash/Pixabay � instant, $0):
 Ambient backgrounds while traveling
 Weather / atmosphere overlays
 Generic scene filler between key moments
 Quest genre establishing mood shots

**Tier 4 � Player-Triggered** (`gpt-image-1`):
 "Illustrate this scene" command anytime
 "Regenerate" button on any existing image
 "Show my party" group portrait
 "Show my full inventory spread"

#### Image Persistence: Database Storage
 **DECIDED**: Supabase (preferred) or MongoDB Atlas
- All generated images downloaded from OpenAI URL immediately (URLs expire in 1hr)
- Stored as: database record with URL pointing to Supabase Storage bucket
- Schema: `{ id, characterId, type, prompt, url, storageKey, createdAt, questGenre }`
- Character portraits, item images, location images all linked to character record
- Regenerate button re-runs the stored prompt  replaces record
- Images travel with the character save � never lost

```
Supabase Storage Structure:
/rpg-images
  /characters/{characterId}/portrait.webp
  /characters/{characterId}/items/{itemId}.webp
  /characters/{characterId}/npcs/{npcId}.webp
  /locations/{locationKey}.webp
  /quests/{questId}/cover.webp
  /bestiary/{creatureType}.webp
```

#### Legendary Item Image Cards
 **DECIDED**: Every Rare+ item gets an AI-generated image
- Displayed as a physical card in inventory (like a collectible card game)
- Card shows: item image, name (in rarity color), key stats, flavor text
- Can view full-screen
- Regenerate option always available
- Hovering/selecting an item shows its card

---

##  COMBAT SYSTEM - DEEP TACTICAL SIMULATION

###  DECIDED: Option D - Maximum Tactical Depth

**Philosophy**: Complete transparency with robust simulation. Player knows ALL OPTIONS and can make informed tactical decisions.

### Combat Framework Features (ALL IMPLEMENTED)

#### Core Mechanics
 **Full D&D 5e-Style Engine**
- Turn-based initiative system (roll d20 + DEX modifier)
- Action economy: Action, Bonus Action, Movement, Reaction
- Tactical positioning and battlefield awareness
- Spell slots and resource management
- Opportunity attacks when enemies move away
- Cover system (half cover, full cover)
- Line of sight calculations
- Status effects (poisoned, stunned, paralyzed, burning, frozen, etc.)

 **Enhanced Tactical Elements**
- Terrain effects (high ground bonus, difficult terrain, hazards)
- Enemy AI with tactics (flanking, focus fire, retreat when low HP)
- Combo system (chain abilities with party for massive damage)
- Weak point targeting (head/body/legs have different AC/effects)
- Weapon type effectiveness (slash/pierce/blunt vs armor types)
- Armor type interactions (plate weak to blunt, leather weak to pierce)
- Morale system (enemies flee at low HP or when leader dies)
- Environmental interactions (push off cliffs, collapse ceiling, etc.)

### Display Mode: Toggleable! (BOTH options available)

#### Mode A: Full Detailed Combat (For Deep Encounters)
```

  COMBAT ROUND 3 - YOUR TURN  


YOUR STATUS:
 HP: 67/100  (Wounded)
 Mana: 40/50 
 Stamina: 25/30 
 Position: High Ground (+2 to hit)
 Status: Blessed (+1d4 to saves)
 AC: 18 (16 base + 2 shield)

PARTY STATUS:
 Lyra (Mage): 45/60 HP, 10/80 Mana (Concentrating: Haste)
 Throk (Fighter): 98/120 HP (Defending you, +2 AC bonus)
 Pip (Rogue): 52/70 HP (Hidden, advantage on next attack)

ENEMIES:
1. Orc Berserker  [RAGING]
    HP: 45/90  (Bloodied)
    AC: 13 (lowered due to rage)
    Position: 10ft away, charging position
    Status: Rage (+4 damage, -2 AC, resistance to physical)
    Weaknesses: Magic damage, Silver weapons
    Morale: HIGH (berserker, won't flee)

2. Orc Shaman  [CASTING]
    HP: 30/30  (Healthy, behind cover)
    AC: 15 (+2 from half cover)
    Position: 25ft away, behind rock formation
    Status: Concentrating on Dark Blessing (enemies +2 AC)
    Weaknesses: Disrupting concentration, low HP
    Morale: MODERATE (will flee if berserker dies)

3. Dire Wolf  [FLANKING]
    HP: 22/40  (Wounded, limping)
    AC: 14
    Position: 5ft to your left (flanking with berserker)
    Status: Bleeding (-2 HP per turn)
    Weaknesses: Already wounded, low morale
    Morale: LOW (will flee if takes more damage)

BATTLEFIELD:

  Rock (Cover)    YOU  (High Ground)
                                       
               Orc Berserker (10ft)   
   Dire Wolf                          
  (5ft left)    Orc Shaman (behind )
                                        
  Lyra         Throk        Pip 
  (20ft back)     (Defending)    (Hidden)


AVAILABLE ACTIONS:


 ATTACK OPTIONS:
1. Sword Attack (Orc Berserker) - Melee, d20+8 vs AC 13
    Damage: 2d8+5 slashing (he resists: half damage)
   
2. Sword Attack (Dire Wolf) - Melee, d20+8 vs AC 14  
    Damage: 2d8+5 slashing, might cause flee

3. Charge Shaman - Move 25ft + Attack, d20+8 vs AC 17 (cover)
    Provokes opportunity attack from berserker & wolf
    Could disrupt his spell!

4. Power Attack - Disadvantage to hit, +10 damage
    Choose target after

5. Weak Point Strike - Target specific area:
    Head (-2 to hit, 1.5x damage, chance to stun)
    Weapon Arm (-1 to hit, might disarm)
    Legs (normal hit, reduce movement speed)

 MAGIC/ABILITIES:
6. Thunderstrike (30 Mana) - Lightning AOE
    25ft radius, hits all enemies, 4d6 damage (berserker resists, shaman vulnerable!)

7. Divine Smite (Channel: 1/day) - Add 3d8 radiant to melee hit
    Combo with sword attack, undead take double

8. Whirlwind Strike (20 Stamina) - Hit all adjacent enemies
    Hits Berserker + Wolf, 2d8+5 each

9. Rallying Cry (Bonus Action, 1/rest) - Party heals 1d6+CHA
    Would heal you and allies

 DEFENSIVE OPTIONS:
10. Dodge - Enemies have disadvantage to hit you
11. Defensive Stance - +5 AC until next turn, can't attack
12. Parry - Ready reaction to parry next attack (negate damage)

 TACTICAL OPTIONS:
13. Shove Berserker - STR contest, push 5ft (off cliff edge nearby!)
14. Disarm Attempt - DEX vs STR, remove enemy weapon
15. Grapple - Restrain enemy (makes them easier to hit)

 ENVIRONMENTAL:
16. Kick Rock - DEX check to kick loose stone at Shaman
     Might knock him from cover or disrupt concentration
    
17. Collapse Overhang - STR check to collapse rock on Shaman
     3d10 damage, requires positioning

 ITEMS (Quick Use):
18. Health Potion (restore 2d4+2 HP)
19. Mana Potion (restore 30 Mana)
20. Alchemist's Fire (throw, 2d6 fire damage + burning)
21. Smoke Bomb (create obscurement, escape or hide)

 COMMAND PARTY (Bonus Action):
22. Lyra: Cast Fireball at enemies (-30 mana)
23. Lyra: Counterspell if Shaman casts (-20 mana)
24. Throk: Charge Berserker (tank the big guy)
25. Throk: Protect (give you +4 AC this turn)
26. Pip: Sneak Attack Shaman (2d6 bonus damage)
27. Pip: Distract enemy (give you advantage)

 MOVEMENT:
28. Reposition - Move up to 30ft (might provoke attacks)
29. Take Cover - Move to nearby cover (+2 AC)
30. High Ground Advantage - Maintain position (keep +2 bonus)

 COMBO ABILITIES (Party Synergy):
31. Pincer Attack - You + Pip both strike same target (advantage + bonus damage)
32. Mage Strike - Lyra casts, you attack in spell wake (enemy disadvantage to dodge you)
33. Shield Wall - You + Throk defensive formation (both +3 AC, taunt enemies)

 OTHER:
34. Analyze Enemy - Bonus Action, learn more about chosen enemy
35. Intimidate - CHA check to break enemy morale (might cause flee)
36. Custom Action - Describe your own tactic!

YOUR CHOICE: ___
```

#### Mode B: Quick Tactical (For Fast Encounters)
```

  YOUR TURN  


You: 67/100 HP  | Mana: 40/50 

Enemies:
1. Orc Berserker: 45/90 HP (Raging, low AC)
2. Orc Shaman: 30/30 HP (Behind cover, buffing enemies)  
3. Dire Wolf: 22/40 HP (Wounded, will flee soon)

Choose your approach:

[ Aggressive Attack]    [ Tactical Strike]
[ Magic/Abilities]      [ Defend]
[ Use Environment]      [ Use Item]
[ Command Party]        [ Combo Attack]

[Player chooses:  Combo Attack]

Available Combos:
 Pincer Attack with Pip (both attack same target)
 Mage Strike with Lyra (she casts, you attack)
 Shield Wall with Throk (defensive formation)

[Player chooses: Pincer Attack - Target Shaman]

You signal Pip! She nods from the shadows...

You dash toward the Shaman while Pip circles behind!

 Your Attack: d20+8 = [16]+8 = 24 vs AC 17  HIT!
 Your Damage: 2d8+5 = [6,4]+5 = 15 damage!

 Pip's Sneak Attack: d20+7 = [19]+7 = 26  HIT!
 Pip's Damage: 1d6+3+2d6 = [4]+3+[5,6] = 18 damage!

TOTAL: 33 damage to Shaman!

The Shaman screams as your blade and Pip's dagger 
strike simultaneously! He collapses, his dark blessing 
fading from the other enemies!

Orc Shaman: DEAD! 
Dire Wolf morale breaks - it FLEES! 

Only the Berserker remains!
```

### Visibility & Transparency: FULL

 **What Player Can See**:
- Enemy HP (exact numbers + visual bars)
- Enemy AC and all defensive stats
- Enemy active buffs/debuffs and effects
- Enemy position and tactical situation
- All available player actions explained
- Probability hints (advantage/disadvantage shown)
- Environmental opportunities highlighted
- Party member status and capabilities

 **Analyze Enemy Feature**:
```
You analyze the Orc Berserker...

 ANALYSIS COMPLETE 

Orc Berserker - Level 8 Warrior
HP: 45/90 | AC: 13 (15 normally, -2 from rage)
STR: 18 (+4) | DEX: 10 (+0) | CON: 16 (+3)

ABILITIES:
- Rage: +4 damage, resistance to physical, -2 AC
- Reckless Attack: Advantage to hit, enemies have advantage
- Savage Critical: Crits deal extra damage

RESISTANCES: Physical damage (half damage while raging)
VULNERABILITIES: Psychic damage (2x damage)
IMMUNITIES: Fear effects

WEAKNESSES: 
- Low AC during rage (easy to hit)
- Poor against magic
- Will not retreat (can be exploited)

TACTICS:
- Focuses on biggest threat (currently: you)
- Uses reckless attacks when bloodied
- Berserker rage lasts 3 more rounds

LOOT POTENTIAL: Uncommon-Rare (Berserker Axe, Hide Armor)

BESTIARY: Entry added! (12/1000 creatures discovered)
```

 **Bestiary System**:
- Fills in as you encounter creatures
- First encounter: Basic info
- After multiple fights: Learn resistances, tactics
- After analysis: Full stats revealed
- Legendary creatures get lore entries
- Can review bestiary anytime
- AI generates creature images for entries

### Death & Consequences: Player Choice at Character Creation

When creating character, choose death mode:

**1. Story Mode** (Forgiving)
- Death = Respawn at last checkpoint
- Lose 10% current gold
- No permanent consequences
- AI narrates "close call" story

**2. Normal Mode** (Balanced)  
- Death = Respawn with consequences
- Lose 25% gold and all consumables
- Gain "Death Scar" debuff (-1 to random stat)
- NPC who could save you reaches out
- Dramatic resurrection story

**3. Hardcore Mode** (Challenging)
- Death = Major consequences
- Lose 50% gold, random equipped item
- Permanent stat reduction
- Quest failures for time-sensitive quests
- "Near death" changes you

**4. Ironman Mode** (Permadeath)
- Death = Character deleted
- Game over, start new character
- Can view "Hall of Fallen Heroes"
- (Optional: Allow ONE resurrection via legendary quest)

**5. Custom Mode**
- Mix and match consequences
- Set your own penalties

**Can change difficulty mid-game?** 
- Can make easier anytime
- Can make harder ONLY at checkpoints
- Prevents save-scumming

### Combat Pacing: Variable & Smart

 **AI Adjusts Combat Depth**:
- **Trash Mobs** (3-5 messages) - "You dispatch 3 bandits easily"
- **Regular Enemies** (5-10 messages) - Tactical but streamlined
- **Elite/Mini-Boss** (10-15 messages) - Full tactical options
- **Boss Fights** (15-30+ messages) - Deep simulation, epic
- **Story Fights** (Variable) - As long as player wants

 **Player Can Toggle**:
- Quick Combat button: AI resolves with your general strategy
- Manual Combat: Full control every turn
- Hybrid: AI handles allies, you control main character

### Special Combat Features: ALL OF THEM

####  Execution Moves (MUST HAVE)
When enemy below 20% HP:
```
The Orc Berserker staggers, bloodied and beaten!

 EXECUTION AVAILABLE 

[ Execute: Decapitation Strike]
- Finish him dramatically (CON save to resist)
- If success: Instant kill + intimidate other enemies
- Grants "Executioner" bonus: +2 damage for 3 rounds

[ Execute: Disarm and Demand Surrender]  
- Force surrender (CHA check)
- If success: Gain information, possible ally
- Peaceful resolution XP bonus

[ Execute: Soul Harvest]
- Drain his life force (magical execute)
- Restore your HP equal to damage dealt
- Learn one of his abilities

[Continue Normal Combat] - Keep fighting normally
```

####  Environmental Combat (MUST HAVE)
Every battlefield has interactive elements:

```
ENVIRONMENTAL HAZARDS:
 Brazier - Knock over for fire damage (2d6 AOE)
 Oil Barrels - Shoot to explode (3d10 in 15ft radius)
 Chandelier - Drop on enemies below (4d8 damage + prone)
 Cliff Edge - Shove enemies off (instant death, no save)
 Ice Patches - Create with magic, enemies slip (DEX save)
 Wind Gusts - Blow arrows off course, push flying enemies
 Trees - Chop down to create barriers/bridges
 Lightning Rod - Channel electricity through
 Trap Doors - Open beneath enemies
 Alarm Bell - Ring to summon guards (context-dependent)
```

AI describes environment at combat start:
"The throne room's chandelier sways overhead. Braziers 
burn along the walls. Behind the necromancer, a balcony 
overlooks a 100-foot drop. What do you do?"

####  Companion Combat (ABSOLUTE MUST - Full Party System)

**Party Control Options**:

**Mode 1: AI Controlled (Recommended)**
- AI controls all party members tactically
- Makes smart decisions based on situation
- You can override with commands
- Shows what they're doing each turn

**Mode 2: Full Manual Control**
- You control every party member's turn
- Deep tactical control
- Takes longer but maximum strategy

**Mode 3: Tactics System (Dragon Age style)**
- Set AI behaviors for each party member:
  - "Lyra: Focus on AOE spells when 3+ enemies grouped"
  - "Throk: Protect me when my HP below 50%"
  - "Pip: Sneak attack highest HP enemy"
- AI follows tactics, you override when needed

**Party Member Features**:
```typescript
interface PartyMember {
  name: string
  class: string
  level: number
  
  // Combat Stats
  hp: { current: number; max: number }
  mana: { current: number; max: number }
  ac: number
  initiative: number
  
  // Abilities
  abilities: Ability[]
  passiveEffects: string[]
  
  // AI Behavior
  tactics: TacticSettings
  personality: string // Affects combat dialogue
  
  // Relationship
  loyalty: number // 0-100, affects following orders
  friendship: number // Affects combo damage
  
  // Progression
  experience: number
  skillPoints: number
  equipment: Equipment
  
  // Permanent/Temporary
  canDie: boolean // Story-essential NPCs can't die
  isControlled: boolean // Temporarily controlled by enemy?
}
```

**Party Commands**:
- Direct Action: "Lyra, fireball the group!"
- Strategic: "Throk, protect the healer!"
- Formation: "Everyone, defensive positions!"
- Ultimate: "All out attack! Combo strike!"

**Party Death**:
- Temporary: Unconscious, can be revived (Medicine check or spell)
- Death: Dead until resurrection magic/service
- Story Essential: Plot-armored, always downed not dead
- Betrayal: Party member might leave if you're cruel

####  Mounted Combat
Riding horses, griffons, dragons:
- Mount HP separate from yours
- Mounted bonus: +2 AC, +10ft movement, charge attacks
- Mounted disadvantage: DEX saves, some spells
- Can be dismounted (opposed check)
- Mount can fight too (hoof attacks, bite)
- Mounted archery: Special rules

####  Aerial Combat  
Flying creatures, dragon riding, airships:
- 3D positioning (altitude matters)
- Dive attacks (fall damage bonus)
- Aerial maneuvers (barrel roll, loop)
- Ground forces can't reach you
- Ranged attacks more important
- Can drop objects/bombs
- Mid-air collisions
- Weather effects (wind, storms)

####  Naval Combat
Ship-to-ship battles:
- Crew management
- Broadside cannon attacks
- Boarding actions
- Ramming maneuvers
- Fire/water hazards
- Crew morale affects ship performance
- Sink enemy or capture vessel
- Sea monsters can join the fight

####  Siege Combat
Large-scale battles:
- Command troops while fighting personally
- Siege engines (catapults, ballistae, battering rams)
- Wall defense/assault
- Morale system for armies
- Strategic objectives (gates, towers, keep)
- You're THE hero but army fights too
- Epic scale but you matter most
- Can affect outcome solo or with army

####  All Other Features

**Stealth Attacks**: 
- Assassinate before combat starts (instant kill on success)
- Failed stealth = combat starts with you exposed

**Non-Lethal**:
- Knock out instead of kill
- Requires declaration before attack
- Useful for interrogation, bounties, morality

**Taming System**:
- Attempt to tame beasts/monsters (Animal Handling)
- Tamed creatures fight for you
- Feed and care for them (bonding)
- Can have multiple pets/mounts

**Combo System**:
- Chain attacks with party members
- Timing-based bonuses
- Special combo finishers
- Combo counter increases power

**Limit Breaks**:
- Ultimate ability when meter full
- Meter builds from giving/taking damage
- Devastating effects (full heal, massive damage, etc.)
- Class-specific limit breaks
- Can combine limit breaks with party

**Parry/Counter**:
- React to enemy attacks (reaction)
- Perfect timing = negate damage + counter
- Skill-based mechanic
- High risk/reward

**Morale System**:
- Enemies flee when demoralized
- Kill leader = panic
- Intimidation can scare enemies
- Some enemies (undead, constructs) immune

### Combat Resolution Examples

I'll add specific encounter examples to show how this all works in practice. Want me to continue with more sections, or should we implement this combat system first?

**Next topics to cover**:
- AI Model Strategy (which AI for what)
- Visual Generation (when/how to generate images)
- Audio Systems (TTS, music, SFX)
- Quest Structure (the 20-40 genre system)
- Or start building?

### Dice Rolling System
If we implement dice:
- [ ] Visual 3D dice animation (physics-based)
- [ ] Simple 2D dice roll animation
- [ ] Text-based with sound effect
- [ ] Just show final number
- [ ] Let AI roll behind scenes

**Tools Available**:
- Could use animation library for 3D dice
- Sound effects from Freesound/YouTube
- Dice roller API exists but we can do it in JS

### Character Progression

#### Experience System
- **Current**: XP tracked but not used
- **Options**:
  1. Kill monsters = XP (traditional)
  2. Story milestones = XP (narrative-focused)
  3. AI decides when you level (dynamic)
  4. Player chooses when to "spend" XP on levels

#### Leveling Up - What Changes?
When you level up:
- [ ] Max HP increases
- [ ] Stats improve (choose which?)
- [ ] New abilities/spells unlock
- [ ] New class skills
- [ ] Prestige class options at high level
- [ ] AI DM throws harder challenges

**Question**: Should leveling be:
- [ ] Automatic triggers (AI says "You've leveled up!")
- [ ] Manual (player clicks "Level Up" button)
- [ ] Milestone-based (complete Chapter 1 = level up)

### Skills & Abilities

#### Class-Specific Abilities
Should each class have unique mechanics?

**Warrior**:
- [ ] Rage mode (bonus damage, reduced defense)
- [ ] Shield block (reduce incoming damage)
- [ ] Battle cry (intimidate enemies)

**Mage**:
- [ ] Spell slots/mana system
- [ ] Spell list to choose from
- [ ] Ritual casting for big magic
- [ ] Spell backfire risks

**Rogue**:
- [ ] Sneak attack bonus
- [ ] Lockpicking mini-game
- [ ] Stealth success rolls
- [ ] Pickpocket NPCs

**Cleric**:
- [ ] Healing spells (restore HP)
- [ ] Turn undead ability
- [ ] Divine intervention (save from death)
- [ ] Blessings/curses

**Ranger**:
- [ ] Track enemies
- [ ] Animal companion
- [ ] Survival skills (find food/water)
- [ ] Bow mastery

**Bard**:
- [ ] Inspire allies (buff system)
- [ ] Persuasion bonuses
- [ ] Performance for gold/info
- [ ] Magical music effects

###  DECIDED: Option D � Hybrid Static + Story-Generated Abilities

**Core Kit** (static, consistent across playthroughs, balanced):
- Every class has a defined base kit: core spells, core strikes, core skills
- These are predictable � you know Mage always starts with Magic Missile + a utility spell
- Provides consistency and a learnable foundation
- Balanced against each other for fair play

**Story-Earned Abilities** (AI-generated, unique to YOUR playthrough):
- Earned through meaningful story choices, not just leveling
- Example: Spent 3 sessions in a dwarven mine  unlock Stonecunning passive
- Example: Talked your way out of 5 combats  unlock Silver Tongue ability  
- Example: Survived a dragon's breath  unlock Dragonscaled resistance
- These are generated by Claude Opus based on your actual story history
- Logged in your character sheet with the story moment that earned them
- Nobody else will ever have your exact ability set

**Consistent Magic System Per Playthrough**:
 Magic system is established at the START of each quest/playthrough:
- Classic Fantasy quest  Mana-based arcane magic
- Dark Fantasy quest  Corrupting blood magic with costs
- Sci-Fi quest  Tech/psionic abilities replace magic
- Horror quest  Magic is unreliable, dangerous, feared
- The AI DM is briefed on the magic rules for the current genre and enforces them
- Magic system is written into the quest module spec
- Player is told the rules upfront: "In this world, magic requires verbal components and drains HP..."

**Ability Display**:
- Full ability card for each ability (name, description, cooldown, cost, story origin)
- Your story-earned abilities have flavor text showing HOW you earned them
- Sortable: by type, by source (class vs story-earned)
- AI-generated icon/visual for each ability card

---

##  Audio & Atmosphere

###  DECIDED: Minimal but Meaningful Audio

**Philosophy**: Text-first experience. Think late-era Commodore 64 / classic CRPG � the words ARE the experience. Audio enhances without overwhelming.

#### TTS (Text-to-Speech)
 **Currently**: Google Cloud TTS API (already have key)
 **Future upgrade**: ElevenLabs (get account, swap in � abstracted behind one interface)
 **Default**: Toggle OFF (Option B) � player turns it on in settings
 **Voice style when on**: Dramatic narrator voice for DM text
 **Per-NPC voices**: YES � every named NPC gets an assigned voice profile
  - Google TTS has enough voice variety for a good range now
  - ElevenLabs will dramatically improve this when added
  - NPC voice is generated at NPC creation and stored in their record
  - Same NPC always sounds the same across sessions

#### Music
 **DECIDED**: AI-generated music for key moments only
- No constant background loop
- AI composes music for:
  - **Character creation**  Your personal hero theme (unique, generated once, saved)
  - **Quest start**  Short genre-appropriate intro sting
  - **Boss fight start**  Epic combat theme
  - **Victory / Quest complete**  Triumphant fanfare
  - **Character death**  Somber requiem
  - **Legendary item found**  Rare discovery sting
- Music is generated via Suno or Udio through Replicate API
- Generated tracks saved to database alongside character
- Your hero theme plays at your triumphant moments � nobody else has it

#### Sound Effects
 **Minimal, purposeful**:
- Dice rolling sound (satisfying, mechanical click)
- UI sounds only where they add clarity (chest open, item equip, level up)
- No ambient loops, no constant combat clanging
- Think: sound design that punctuates, doesn't narrate

#### TTS Architecture (Abstracted for Easy Swap)
```typescript
// All TTS goes through one interface � swap provider anytime
interface TTSProvider {
  synthesize(text: string, voiceId: string): Promise<AudioBuffer>
  listVoices(): Promise<Voice[]>
  getVoiceForPersonality(traits: string[]): Promise<string> // AI picks voice
}
// providers/google-tts.ts   current
// providers/elevenlabs.ts    drop-in when ready
```

---

##  INVENTORY & ITEMS - DEEP SYSTEM DESIGN

### DECIDED: Full-Featured Deep Item System
**Complexity Level**: MAXIMUM - All features, unlimited budget

### Item Rarity System (WoW-Style)
 **DECIDED**: Multi-tier color-coded rarity
- **Junk** (Gray) - Vendor trash, but might have crafting use
- **Common** (White) - Basic items, starting gear
- **Uncommon** (Green) - Decent items, minor bonuses
- **Rare** (Blue) - Solid items, good bonuses, special effects
- **Epic** (Purple) - Powerful items, multiple special effects
- **Legendary** (Orange) - Named unique items with lore and quests
- **Mythic** (Red) - World-altering artifacts, one per playthrough
- **Set Items** (Golden) - Collect full sets for massive bonuses

### Item Properties (ALL OF THESE)
 **DECIDED**: Every item is a full object with:

```typescript
interface Item {
  // Core Identity
  id: string
  name: string
  rarity: 'junk' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  type: 'weapon' | 'armor' | 'potion' | 'material' | 'quest' | 'consumable' | 'magic'
  slot?: 'head' | 'chest' | 'legs' | 'hands' | 'feet' | 'weapon' | 'offhand' | 'ring' | 'amulet'
  
  // Stats & Combat
  damage?: string // "2d6 + 5 fire damage"
  armor?: number
  statBonuses: {
    strength?: number
    dexterity?: number
    constitution?: number
    intelligence?: number
    wisdom?: number
    charisma?: number
  }
  
  // Special Properties
  specialEffects: string[] // ["10% chance to freeze", "Deals double damage to undead"]
  activeAbilities?: string[] // ["Cast Fireball once per day"]
  setName?: string // "Dragonplate Armor Set"
  socketSlots?: number // How many gems can be added
  currentSockets?: Socket[] // What gems are installed
  
  // Enchantments
  enchantments: Enchantment[]
  canBeEnchanted: boolean
  maxEnchantments: number
  
  // Durability & Condition
  durability: { current: number; max: number }
  condition: 'pristine' | 'good' | 'worn' | 'damaged' | 'broken'
  
  // Requirements & Restrictions
  levelRequirement?: number
  classRequirement?: string[]
  raceRequirement?: string[]
  skillRequirement?: { skill: string; level: number }
  
  // Lore & Story
  description: string
  loreText: string
  questTied?: string // Quest ID if this triggers/needs quest
  discoveryStory: string // How you found it
  
  // Visual
  imageUrl?: string // AI-generated item image
  imageGenerationPrompt?: string // So we can regenerate
  canRegenerateImage: boolean
  
  // Economy
  baseValue: number
  sellValue: number
  buyValue: number
  canBeSold: boolean
  canBeDropped: boolean
  
  // Crafting
  isCrafted: boolean
  craftingMaterials?: { itemId: string; quantity: number }[]
  craftingRecipeId?: string
  craftedBy?: string // Player name or NPC
  craftQuality?: 'poor' | 'normal' | 'superior' | 'masterwork' | 'legendary'
  
  // Misc
  stackSize: number // For consumables/materials
  weight: number
  tags: string[] // ["magical", "cursed", "ancient", "dwarven"]
  isUnique: boolean // Only one can exist
  boundToCharacter: boolean // Can't trade/sell
}
```

### Item Categories (All Implemented)
 Weapons (melee, ranged, magic)
 Armor (head, chest, legs, hands, feet)
 Accessories (rings, amulets, trinkets)
 Potions (healing, mana, buffs, debuffs)
 Quest Items (keys, artifacts, letters)
 Consumables (food, torches, bandages)
 Magic Items (scrolls, wands, orbs)
 Crafting Materials (ores, leather, herbs, gems)
 Gems/Runes (socket into gear)
 Recipes/Blueprints (learn crafting)
 Books/Scrolls (lore, spells, skills)

---

##  HOW LOOTING ACTUALLY WORKS (Critical Design)

**Problem**: This isn't WoW. You can't click "Loot All". How does looting work in a text-based AI game?

### Solution: Multi-Modal Looting System

#### **Method 1: Natural Language Commands (Primary)**
Player types natural actions:
- "I search the bandit's body"
- "I check the chest for traps then open it"
- "I loot everything in the room"
- "I examine the wizard's corpse carefully"
- "Look for hidden compartments"

AI interprets intent and responds with loot description + auto-adds to inventory

#### **Method 2: Quick Action Buttons (UI Helper)**
After combat/finding lootable object, show contextual buttons:
```

 You've defeated the Orc Warrior 
                                  
 [ Search Body]  [ Quick Loot]
 [ Leave]        [ Burn Body] 

```

Clicking triggers appropriate action

#### **Method 3: Auto-Loot with Summary**
After combat, AI auto-generates loot, shows summary:
```

 LOOT ACQUIRED 

[RARE] Orcish Battle Axe (+12 damage, +3 STR)
[UNCOMMON] Minor Health Potion x3
[COMMON] Gold Coins x47
[MATERIAL] Iron Ore x5
[JUNK] Torn Leather Scraps

[Keep All] [Review Each] [Sell Junk]

```

#### **Method 4: Loot Dice Rolls (WoW-Style Excitement)**
When looting, system rolls for quality:
```
You search the Ancient Chest...

 Rolling loot quality... 

[] 87/100 - EPIC DROP!

You've found: 

  Thunderfury, Blessed Blade of the 
    Windseeker                         
                                       
 [LEGENDARY WEAPON]                    
 +50 Attack, +20% Lightning Damage     
 "Chance to strike with lightning"    
                                       
 [ Generate Image] [ Read Lore]   

```

#### **Method 5: Environmental Interaction**
AI recognizes context:
```
DM: "You're in the wizard's laboratory. Shelves 
line the walls, filled with dusty tomes and 
strange reagents. A workbench holds unfinished 
experiments. What do you do?"

Player: "I search the shelves for spell scrolls"

DM: "You carefully examine the shelves. Most 
books are ruined, but you find:
- Scroll of Fireball [RARE]
- Scroll of Invisibility [RARE]  
- Spellbook: Beginner's Guide to Necromancy [UNCOMMON]

[Add All to Inventory] [Choose Specific Items]"
```

#### **Method 6: Choice-Based Looting (Meaningful Decisions)**
```
You find a locked chest. Inside are three items,
but you can only carry one:

1. [EPIC] Amulet of Eternal Flame 
   +30 Fire Damage, Immunity to Cold
   
2. [EPIC] Ring of the Archmage
   +50 Mana, +20% Spell Power
   
3. [LEGENDARY] Ancient Spell Tome
   Teaches powerful forbidden magic
   (Quest Item - may have consequences)

Which do you take? Or try to carry all? (STR check)
```

### Combined Approach (RECOMMENDED)
 Natural language always works (AI interprets)
 Quick action buttons for common actions
 Auto-loot with summary after combat
 Dice roll excitement for special loot
 Meaningful choices for important loot
 Environmental context recognition

**Player can loot however they want - AI adapts**

---

##  CRAFTING SYSTEM - OPTION D (MAXIMUM DEPTH)

 **DECIDED**: Meta Crafting System with ALL features

### Crafting Components

#### 1. Materials Have Quality & Properties
```typescript
interface Material {
  name: string
  quality: 'poor' | 'average' | 'fine' | 'exceptional' | 'masterwork'
  properties: string[] // ["fire-resistant", "lightweight", "magically-conductive"]
  sourceType: 'mined' | 'harvested' | 'looted' | 'hunted' | 'purchased'
  rarity: RarityLevel
}
```

Example: "Dwarven Steel (Exceptional)" vs "Rusted Iron (Poor)"

#### 2. Recipes & Discovery
- **Found Recipes**: Loot recipe books, scrolls, blueprints
- **Taught by NPCs**: Masters teach advanced techniques
- **Experimental Discovery**: Combine materials, AI discovers new recipes
- **Quest Rewards**: Legendary recipes from epic quests
- **Skill Level Unlocks**: Learning smithing reveals basic recipes

#### 3. Crafting Skills Progression
```
Smithing Level 1  Can craft basic weapons/armor
Smithing Level 25  Unlock Advanced Metallurgy
Smithing Level 50  Can craft Epic items
Smithing Level 100  Masterwork certification
```

Skills:
- Smithing (weapons, armor)
- Alchemy (potions, poisons)
- Enchanting (magical properties)
- Tailoring (cloth armor, bags)
- Leatherworking (light armor)
- Jewelcrafting (rings, amulets, gems)
- Engineering (gadgets, traps)
- Cooking (food buffs)
- Inscription (scrolls, glyphs)

#### 4. WoW-Style Proc System
When crafting, roll for quality:

```
You craft an Iron Sword...
 Crafting Roll: 78/100

 PROC! You've created:
[UNCOMMON] Fine Iron Sword (+2 bonus stats!)

Possible Procs:
- Normal (60% chance) - Get basic item
- Fine (25% chance) - +1-2 bonus stats  
- Superior (10% chance) - +3-5 bonus stats + special effect
- Masterwork (4% chance) - +epic tier jump + unique property
- Legendary Proc (1% chance) - Becomes legendary, AI generates unique name/lore
```

#### 5. Advanced Crafting Mechanics

**A. Material Choice Matters**
Crafting "Sword" with different materials = different results:
- Iron Ore  Iron Sword (basic)
- Dwarven Steel  Dwarven Sword (+durability, +damage)
- Dragon Bone  Dragonbone Sword (+fire damage, lightweight)
- Meteoric Iron  Starsword (magic resistance, rare properties)

**B. Method/Location Matters**
- Craft at campfire  Limited options
- Craft at town forge  Normal crafting
- Craft at Master Forge  Bonus to quality rolls
- Craft at Ancient Dwarven Forge  Epic items possible
- Craft during full moon  Magic items get bonus

**C. Special Ingredients = Special Properties**
Base Recipe: Iron Sword = Iron Ore + Handle
Add fire salts  Iron Sword with Fire Damage
Add soul gem  Soul-Trapping Iron Sword
Add dragon heart  Dragonslayer Sword

**D. Enchanting System**
Separate from crafting:
1. Disenchant magic items  Learn enchantment
2. Collect soul gems (trap creature souls)
3. Apply enchantment to items
4. Stronger souls = stronger enchantments

**E. Item Combination**
- Combine two items  Transfer enchantment
- Salvage items  Get materials back
- Upgrade items  Use materials to improve existing gear

**F. Crafting Mini-Game (Optional)**
For legendary crafts, player participates:
```
Forging the Legendary Blade...

Step 1: Heat the metal
[Too Cold  Too Hot]
        (click when centered)

Step 2: Hammer technique  
Choose: [Powerful Strikes] [Precise Taps] [Rhythmic Pattern]

Step 3: Quenching
Dip in: [Water] [Oil] [Liquid Nitrogen] [Dragon Blood]

Each choice affects final stats!
```

#### 6. Quest-Locked Legendary Crafts
Some recipes require quests:
```
Recipe: Excalibur, Sword of Kings

Requirements:
 Smithing Level 100
 Completed: "Pull the Sword from the Stone" quest
 Materials: Celestial Steel x10, Dragon Heart x1
 Must craft at Avalon Forge during solar eclipse
 Mysterious ingredient (discovered in quest)

This weapon will be unique to your playthrough.
```

### Loot Fun Factor Maximized

 **Every loot moment is a story beat**
- AI narrates discovery with flavor
- Items have history and context
- Mystery items need identification

 **Proc excitement (WoW-style)**
- Visual dice rolls  
- Dramatic announcements
- Legendary drops get special treatment

 **Environmental storytelling**
- Searchable objects everywhere
- Context-aware loot (wizard tower has scrolls, armory has weapons)
- Player investigates, AI rewards curiosity

 **Surprising discoveries**
- Hidden compartments 
- Trapped chests
- Cursed items (with consequences)
- Items that trigger quests

 **Out-of-the-box ideas**:
-  **Morally gray looting**: Steal from NPCs? Consequences if caught
-  **Cursed loot**: That legendary sword might be cursed...
-  **Investigation mode**: "Appraise" items reveals hidden properties
-  **Item history**: AI generates backstory for legendary items
-  **Custom items**: Describe an item, AI crafts it for you
-  **Living items**: Sentient weapons with personalities (talk to you!)
-  **Item evolution**: Items grow stronger as you use them
-  **Gift wrapping**: Special items come with dramatic reveals
-  **Treasure photography**: Auto-generate image of your best loot hauls
-  **Loot journal**: AI tracks every legendary item's discovery story

---

##  WORLD BUILDING & EXPLORATION

###  DECIDED: Fog-of-War Emergent World

The world does not pre-exist. It EMERGES as you explore. The AI maintains a **World Manifest** in Supabase � a growing record of everything that has been generated in this character's universe. The world is always consistent because the same world bible is referenced on every AI call.

**Structure**: Pure narrative sandbox with intelligent structure  
- The AI knows the shape of the story (what exists, what's possible, what's coming)  
- The player can go anywhere, do anything, pursue or ignore the main quest  
- Choices have genuine consequences that ripple through the world  
- Areas visited become real; areas not yet visited are held in potential  

**Location Generation**: On-demand, informed by world bible  
When you travel to a new location, Claude generates it consistent with the world's established geography, faction control, and story state. It was always there. You just hadn't been there yet.

**Location Types** (all generated fresh, not pre-built):
- Cities & Settlements (political power, commerce, rumor, rest)
- Wilderness & Frontiers (random encounters, resource gathering, survival)
- Dungeons & Ruins (combat, treasure, lore, secrets)
- Enemy Territory (higher danger, higher reward, stealth options)
- Faction Strongholds (political quests, reputation mechanics)
- Sacred/Cursed Sites (magic, mystery, history)
- Rift Locations (genre-shift portal zones)
- Liminal Spaces (the strange in-between places the world bible defines)

**Map System**: DECIDED - Full five-layer system documented in:
> **-> docs/MAP-SYSTEM.md**

| Decision | Choice | Notes |
|----------|--------|-------|
| Map layers | 5 layers: World / Regional / Location / Dungeon / Tactical | TTRPG analog at each scale |
| Map philosophy | Living journal artifact, not video game navigation | Maps feel hand-made, in-world |
| World map render | SVG procedural (MVP) then AI image blend (v2) | simplex-noise for terrain |
| Dungeon algorithm | Rooms + Mazes (BSP) for built; Cellular Automata for caves | Full fog-of-war reveal room by room |
| Town/city maps | Road-first: road network, lots, buildings (Watabou approach) | AI image via gpt-image-1 |
| Tactical map | Grid-based, inline with combat UI, togglable | Canvas 2D API for performance |
| Fog of war | Room-by-room reveal stored in Supabase | Dungeon maps ship fully fogged |
| Genre visual styles | Fantasy=parchment, Sci-Fi=blueprint, Horror=distorted, PostApoc=damaged | Style prompt per world type |
| Map annotations | Player click-to-note on any revealed location | Stored with character in Supabase |
| Map as loot item | Yes, partial maps, treasure maps, enemy operational maps | Narrative texture |
| Storage | Supabase tables per layer + images in Supabase Storage | SVG for dungeons, WebP for others |
| Key NPM packages | simplex-noise, alea, @napi-rs/canvas | All Vercel-compatible |

**Fast Travel**:  DECIDED � Narrative-gated  
- Can return to any location you've previously visited  
- Time passes during travel (AI advances the world appropriately)  
- Travel can trigger encounters, events, world changes  
- Special fast-travel methods exist in-world (mounts, portals, magic)  

---

##  NPC SYSTEM � Persistent Living Characters

###  DECIDED: Full Persistent NPC System

Every significant NPC exists as a record in Supabase. They have lives that continue when you're not with them.

```typescript
interface NPC {
  id: string
  worldId: string
  characterId: string
  
  // Identity (generated at creation)
  name: string
  age: number
  physicalDescription: string
  voiceDescription: string      // For TTS style
  voiceId: string               // Assigned Google/ElevenLabs voice
  portrait?: string             // Generated image URL
  
  // Personality
  personalityCore: string       // 2-3 sentence core traits
  motivation: string            // What do they WANT?
  fear: string                  // What do they FEAR?
  secret: string                // What are they hiding?
  speechPattern: string         // How do they talk? What are their verbal tics?
  
  // Relationship to Player
  relationshipScore: number     // -100 (enemy) to 100 (devoted)
  relationshipType: RelType     // friend, rival, companion, enemy, neutral, romantic
  sharedHistory: string[]       // Key events you've experienced together
  currentEmotionalState: string // How do they feel about you RIGHT NOW?
  
  // World Position
  faction: string               // Primary allegiance
  location: string              // Where they currently are
  role: string                  // What function they serve in the world's story
  isCompanion: boolean          // Are they actively with the player?
  isAlive: boolean              // Permanent death is real
  
  // Story Significance
  storyRole: 'major' | 'minor' | 'background'
  knowledgeOf: string[]         // What do they know that's plot-relevant?
}
```

**Key NPC Design Decisions**:
-  Major NPCs have full personality profiles, generated at world creation
-  Minor NPCs generated on-demand but persist if meaningful interaction occurs
-  NPCs can die permanently � this has consequences for the story
-  NPCs have their own agendas that operate whether or not you're watching
-  Romance is possible (narrative, tasteful, earned through relationship score)
-  Betrayal is possible � trusted allies can turn based on choices you made
-  Each named NPC gets a unique voice assignment for TTS
-  Companion system: up to 3 active companions who participate in combat

**Dialogue**:  
Free-form conversation is the default. The DM narrates NPC responses in character. Player can type anything. The NPC responds consistent with their personality, relationship score, current emotional state, and what they know. No dialogue trees � real conversation.

**Faction System**: Fully generated per world  
- 4-8 factions per world, each with goals, leadership, power level, and relationship to the player  
- Reputation tracked per faction (-100 to 100)  
- Actions have faction consequences (helping one may harm another)  
- Factions have their own stories that progress  

---

##  META SYSTEMS � Hall of Heroes & Beyond

###  DECIDED: Full Featured

**Multiple Characters / Save Slots**:
- Unlimited characters, each with their own complete universe
- Each character is a separate Supabase world record
- Switching characters is switching between universes
- Characters do NOT interact (each universe is separate)
- The character select screen is the "Hall of Heroes"

**Hall of Heroes Display (character select)**:
- Character portrait (generated)
- World name
- Character name, class, level
- Play time
- Last seen: [location summary]
- Story status: [brief current arc summary]
- Visual distinction per world type (fantasy art vs sci-fi aesthetic)

**Achievement System**:  IMPLEMENTED
- Per-character achievements (earned in their world)
- Cross-character legacy achievements (across all your characters)
- Achievements can unlock starting bonuses for NEW characters (meta-progression)
- Examples:
  - **First Blood** � Completed your first combat
  - **The Long Road** � Played a single character for 20+ hours
  - **World Ender** � Defeated the main villain of your world
  - **The Wanderer** � Visited 3 different genre worlds as portals
  - **Death is Not the End** � Used permadeath mode
  - **The Collector** � Acquired 50 unique items
  - **Silver Tongue** � Resolved 10 conflicts without combat
  - **Multiverse Pathfinder** � Completed a full genre quest
  - **Legendary** � Found a Legendary rarity item
  - **The Unbroken** � Completed a full arc without dying once

**Permadeath Mode**: Optional (selected at character creation)
- On: Death is permanent. Character record preserved in "Hall of the Fallen" � a read-only memorial. Their story ends. It meant something.
- Off: Death has story consequences (injury, loss, time) but not character deletion

**Statistics Tracking** (per character, displayed on profile):
- Total sessions
- Total play time
- Enemies defeated
- Items found / crafted
- Gold earned / spent
- Deaths (if not permadeath)
- Words written by the DM (a measure of how rich the story got)
- Worlds visited

**New Game+**: When you complete your world's main arc, NG+ begins:
- Same character, same world, new threat
- Higher stakes, stronger enemies, deeper lore revealed
- Some NPCs remember what happened
- The villain's defeat had consequences � new power vacuum, new faction rise
- The world CHANGED because of what you did
- [ ] Custom (adjust individual settings)

### Statistics Tracking
Should the game track stats?

- [ ] Total playtime
- [ ] Enemies defeated
- [ ] Damage dealt/received
- [ ] Items collected
- [ ] Gold earned/spent
- [ ] Locations discovered
- [ ] NPCs met
- [ ] Quests completed
- [ ] Deaths
- [ ] Choices made

---

##  UI/UX Improvements

### Quality of Life Features

- [ ] **Quick Actions Menu** - Common actions as buttons
- [ ] **Suggested Actions** - AI suggests 3 possible moves
- [ ] **History Scroll** - Review past conversation
- [ ] **Export Story** - Download your adventure as PDF
- [ ] **Share Moments** - Share screenshots/highlights
- [ ] **Dark/Light Mode** - Theme options
- [ ] **Accessibility** - Screen reader support, font size
- [ ] **Mobile Responsive** - Play on phone

### Visual Enhancements
- [ ] **HP Bar** - Visual health indicator
- [ ] **XP Progress Bar** - See progress to next level
- [ ] **Loading Animations** - While AI thinks
- [ ] **Typing Indicator** - DM is "typing..."
- [ ] **Dice Roll Animations** - When rolls happen
- [ ] **Particle Effects** - Sparkles for magic, blood for combat
- [ ] **Screen Shake** - During dramatic moments
- [ ] **Transitions** - Smooth animations between scenes

---

##  Advanced/Experimental Ideas

### Multi-Modal Inputs
- [ ] **Voice Input** - Speak your actions (speech-to-text)
- [ ] **Image Upload** - Uploadcharacter sketch, AI incorporates it
- [ ] **Map Drawing** - Sketch a map, AI generates story from it
- [ ] **Gesture Controls** - (mobile) Swipe for actions

### AI Director Mode
- AI analyzes your play style and adapts:
  - Prefer combat? More battles
  - Prefer dialogue? More social encounters
  - Prefer puzzles? More mysteries
  - Prefer exploration? More discoveries

### Procedural Generation
- [ ] Infinite dungeons
- [ ] Random world generation
- [ ] Procedural quest generation
- [ ] Dynamic NPC generation

### Multiplayer/Social (Future)
- [ ] Share your character with friends
- [ ] Co-op mode (multiple players, one DM)
- [ ] Spectator mode (watch others play)
- [ ] Hall of Fame (legendary characters)

### Integration with Stock Photos
Since you have Pexels, Unsplash, Pixabay:
- Use for ambient scene backgrounds (landscapes, establishing shots)
- Mix AI art (characters, monsters, key scene moments) with stock (environments, ambiance)
- Stock photos: instant, free, photorealistic

**Strategy (DECIDED)**:
- **gpt-image-1** = Key narrative moments, characters, monsters (highest quality, used sparingly)
- **dall-e-3** = Items, locations, repeated-use images (cost efficient)
- **Stock photos** = Ambiance, backgrounds, world-building images that don't need uniqueness
- Images stored permanently in **Supabase Storage** � never regenerate the same image

---

##  COST REALITY CHECK (Current Models, Feb 2026)

### API Costs Per Session (Actual Current Pricing)

**Text Generation**:
- Claude Opus 4.6 (DM narration): ~$0.05-0.15/session (heavy use)
- Claude Sonnet 4.6 (combat/loot): ~$0.02-0.05/session
- Claude Haiku 4.5 (quick lookups): ~$0.005/session
- o4-mini (dice/math): ~$0.01/session
- **Total text: ~$0.10-0.25/session** (very reasonable)

**Image Generation** (used selectively):
- gpt-image-1: ~$0.04-0.08/image
- dall-e-3: ~$0.04/image
- World Genesis (character creation images): ~$0.20 one-time
- **Estimated: 3-5 images/session = $0.15-0.40**

**World Genesis** (one-time per new character):
- One large Claude Opus call to generate the world bible
- ~$0.10-0.20 per new character creation
- One-time cost, stored forever

**Total per session: ~$0.25-0.65**  
**Per character created: ~$0.30-0.40 one-time setup**

 DECIDED: Budget is non-material. Build with the best models for every task. Never downgrade for cost. This is a personal creative tool.

---

##  IMPLEMENTATION ROADMAP

### DECIDED Build Order (Shortest Path to Playable)

#### Phase 0: Database Foundation (Day 1 AM)
- [ ] Supabase project setup
- [ ] Schema: worlds, characters, messages, items, npcs, images, quests
- [ ] Row Level Security policies
- [ ] Storage bucket for images

#### Phase 1: World Genesis Engine (Day 1 PM)
- [ ] `app/api/world-genesis/route.ts` � the world creation call
- [ ] `lib/world-generator.ts` � prompts and parsers
- [ ] `lib/types/world.ts` � full WorldRecord TypeScript interface
- [ ] Store world record to Supabase on creation
- [ ] Enhanced character creation page (triggers genesis)

#### Phase 2: Context-Injected DM (Day 1 PM)
- [ ] DM API route receives full world context on every call
- [ ] System prompt includes: world bible + character history + message history
- [ ] Message persistence to Supabase (no more localStorage-only history)
- [ ] The DM knows your world. It is always your world.

#### Phase 3: Image Persistence Layer (Day 2 AM)
- [ ] On image generation: download URL  upload to Supabase Storage  store permanent URL
- [ ] `lib/image-store.ts` � handles generate  persist cycle
- [ ] Images never regenerated if the same content is requested again

#### Phase 4: Full Quest System (Day 2)
- [ ] `lib/quest-engine.ts` � quest generation, tracking, completion
- [ ] Quest journal UI component
- [ ] Genre quest portal system
- [ ] Quest state persisted to Supabase

#### Phase 5: Combat Engine (Day 2-3)
- [ ] `lib/combat-engine.ts` � full tactical combat
- [ ] Combat state machine (initiative, turns, conditions)
- [ ] Combat display component (toggle text/tactical)
- [ ] NPC AI via Claude Sonnet 4.6 (enemy decision-making)

#### Phase 6: Item & Crafting System (Day 3)
- [ ] `lib/item-generator.ts` � procedural item creation with narrative hooks
- [ ] `lib/crafting-engine.ts` � recipe system with procs
- [ ] Inventory UI with item details
- [ ] Loot presentation (drama + information)

#### Phase 7: NPC System (Day 3-4)
- [ ] NPC record creation and persistence
- [ ] Relationship tracking
- [ ] Companion combat participation
- [ ] Per-NPC TTS voice assignment

#### Phase 8: Audio (Day 4)
- [ ] Google Cloud TTS integration
- [ ] Voice toggle per-NPC
- [ ] `lib/tts.ts` � abstracted interface (swap ElevenLabs later)
- [ ] Replicate music generation for key moments

#### Phase 9: Polish (Day 4-5)
- [ ] Hall of Heroes character select
- [ ] Achievement system
- [ ] Map/world tracker
- [ ] Stats dashboard
- [ ] Performance optimization

---

##  CHARACTER SYSTEM  Decisions & Links

**Full specification**: [docs/PLAYER-HANDBOOK.md](docs/PLAYER-HANDBOOK.md)

###  DECIDED: Everything Below

| Decision | Choice |
|----------|--------|
| Creation modes | 5 modes: Quick Spark, Questionnaire, Full Builder, Import/Conceptual, AI Collaborative |
| Character sheet | Tabbed HTML panel, world-art-styled, fully live  5 tabs: Person / Abilities / Equipment / Story / World |
| Stats | 6 stats (STR/DEX/CON/INT/WIS/CHA), all mechanically AND narratively active; DM must use 4 per session |
| Gear system | Body-slot inventory, DM is inventory-aware at all times, every item must come up organically |
| Level-ups | Triggered by narrative moments, not XP thresholds; full AI-assisted feature/feat/spell selection |
| Races | 35+ ancestries; world-contextualized (your world generates its own people drawing from this codex) |
| Classes | All 12 D&D classes + 5 originals (Blood Mage, Psion, Witch Hunter, Runesmith, Summoner) + full subclasses |
| Non-fantasy classes | Genre equivalents for every class (Soldier, Netrunner, Scavenger, Splice, etc.) |
| Multiclassing | Fully supported; narrative justification required; 12 named archetype builds documented |
| Spell browser | Filterable, AI-annotated, world-flavored, with Synergies / Visualize / Compare / AI Recommend |
| Companions | Full creation experience (same as PC) every time a companion joins; 4 autonomy levels; dev arcs |
| HeroForge | Character sheet auto-generates a HeroForge sculpting guide for every character and companion |
| DM voice | Fully adaptive  different literary author per genre (King for horror, Pratchett for comedy, etc.) |
| Companion control | Hybrid: AI executes strategy; player can seize any companion's turn at any moment |
| Hall of Heroes | Full multi-character lobby from day 1; IS the landing screen |

## REST & DOWNTIME SYSTEM — Decisions & Links

**Full specification**: [docs/REST-AND-DOWNTIME.md](docs/REST-AND-DOWNTIME.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Rest types | 3 types: Short (1hr), Long (8hr), Extended (days) | D&D 5e analog with downtime added |
| Short rest healing | Hit Dice based (spend HD to heal) | Strategic resource, not free healing |
| Long rest recovery | Full HP, half HD, spell slots, daily abilities | Standard full recovery |
| Exhaustion | 6-level escalating system matching D&D 5e | Real stakes for overexertion |
| Camping | Multi-phase: location → watches → campfire → dreams → morning | Camping IS gameplay |
| Watch system | Party assigns watches, random events per watch | Night ambush tension |
| Campfire activities | Conversation, cooking, crafting, stargazing, training | Roleplay + mechanical rewards |
| Downtime | 20+ activities across 6 categories | Training, crafting, social, investigation, economic, personal |
| Training | NPC masters improve skills over time (days/weeks) | Long-term character investment |
| Ability recharge | 7 categories: At Will, Per Short/Long Rest, 1/Day, Per Encounter, Charges, Cooldown | Granular resource management |

---

## ENCOUNTER SYSTEM — Decisions & Links

**Full specification**: [docs/ENCOUNTER-SYSTEM.md](docs/ENCOUNTER-SYSTEM.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Difficulty system | Threat Level (TL) 1-20 replacing D&D CR | Genre-neutral challenge rating |
| Difficulty tiers | 7 tiers: Trivial → Legendary | Clear expectations per fight |
| Enemy stat blocks | Full TypeScript interface with AI tactics built in | Enemies fight smart |
| Encounter types | 6: story, exploration, random, ambush, multi-stage, wave | Variety in every session |
| Encounter pacing | 6-8 encounters per adventure day, resource attrition model | Tension builds naturally |
| Boss design | Legendary actions, multiple phases, lair actions, plot armor | Epic boss fights |
| Non-combat resolution | Every encounter can be resolved without fighting | Player choice always valid |
| Bestiary | Progressive knowledge system (5 tiers: Unknown → Mastered) | Learning about enemies is gameplay |
| XP & rewards | XP + gold + loot per encounter, scaled to difficulty | Fair reward pacing |
| AI encounter building | 4-step process: context → budget → populate → narrate | AI as encounter designer |

---

## SKILL CHALLENGES — Decisions & Links

**Full specification**: [docs/SKILL-CHALLENGES.md](docs/SKILL-CHALLENGES.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Skill challenge system | Successes vs failures (D&D 4e inspired) | Multi-roll narrative encounters |
| Complexity levels | 5 levels: 3-15 successes needed, always 3 failures allowed | Scales from quick to epic |
| Puzzle types | 6: logic, environmental, moral, mechanical, social, combination | Never the same twice |
| Hint system | 5-tier escalating hints (free → small cost → guaranteed solve) | Players never permanently stuck |
| Investigation system | Clue-based with red herrings and deduction | Mystery encounters |
| NPC attitude | 5 tiers affecting social DCs | Social encounters have depth |
| Creative solutions | AI must accept any logically sound approach | Player agency paramount |
| Party participation | Multiple characters contribute to challenges | Everyone has a role |

---

## ECONOMY SYSTEM — Decisions & Links

**Full specification**: [docs/ECONOMY-SYSTEM.md](docs/ECONOMY-SYSTEM.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Currency | Genre-adaptive (GP/Credits/Caps etc.) | Fits any world |
| Merchants | NPC merchants with personality, inventory, relationship | Shopping is roleplay |
| Stock system | Limited rotating stock with restock schedules | Scarcity drives exploration |
| Haggling | Mini social encounter (CHA-based, argument affects DC) | Interactive negotiation |
| Dynamic pricing | World events modify prices (war = weapons cost more) | Living economy |
| Money sinks | 4 tiers: essential → upgrade → luxury → world-shaping | Gold always matters |
| Selling | Specialist buyers, auctions for rare items | Selling is its own gameplay |
| Gambling | 6 mini-games available at taverns | Entertainment + risk/reward |
| Property | Houses → shops → fortresses with passive income | Late-game investment |
| Price tables | Complete gear, weapons, armor, potions, services tables | Ready for implementation |

---

## CHARACTER SHEET UI — Decisions & Links

**Full specification**: [docs/CHARACTER-SHEET-UI.md](docs/CHARACTER-SHEET-UI.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Layout | 5-tab side panel: Overview, Abilities, Inventory, Journal, Party | Organized, accessible |
| Paper doll | Equipment displayed on character silhouette | Visual gear management |
| Spell cards | Expandable detail view with cast/cost/description | At-a-glance magic |
| Quest tracker | Progress bars with active/completed/failed states | Always know your goals |
| Party display | Member cards with companion tactics settings | Manage your team |
| Responsive | Desktop=docked 350px, tablet=overlay, mobile=fullscreen | Works everywhere |
| Theme | Dark RPG palette with CSS variables, genre-adaptive (6 variants) | Matches world style |
| Animations | HP flash, heal glow, level-up burst, item equip, rare drop celebration | Juicy feedback |
| Keyboard shortcuts | Full shortcut set for power users | Efficiency |
| Component structure | 20+ React components in organized directories | Clean implementation |

---

## EXPLORATION SYSTEM — Decisions & Links

**Full specification**: [docs/EXPLORATION-SYSTEM.md](docs/EXPLORATION-SYSTEM.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Time system | Narrative advancement (not real-time) | Time passes based on actions |
| Time of day | 8 periods: dawn through midnight with gameplay effects | Light, encounters, NPC schedules |
| Calendar | In-world named months/days, 30-day months, moon phases | Genre-adaptive names |
| Seasons | 4 seasons affecting weather, ecology, events | Temperature + encounter shifts |
| Weather | 16 weather types including magical (blood moon, eclipse) | Affects travel, combat, mood |
| Travel system | Segment-based (4-hour blocks) with event checks | Traveling is gameplay |
| Travel pace | 4 paces: cautious to forced march | Strategic speed choice |
| Navigation | Survival checks in wilderness, auto on roads | Getting lost is a real risk |
| Terrain | 10 types with unique speed/encounter/forage/hazard effects | World variety |
| Survival | Rations, water, shelter, foraging with exhaustion stakes | Resource management |
| Discovery | 12 discovery types along travel routes | Rewards exploration |
| Fast travel | Visit-locked, time still passes, encounters possible | Convenience without immersion break |

---

## STEALTH & TRAPS — Decisions & Links

**Full specification**: [docs/STEALTH-AND-TRAPS.md](docs/STEALTH-AND-TRAPS.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Core stealth | Contested check: Stealth vs Perception | D&D 5e standard |
| Stealth modifiers | Full table (light, armor, weather, movement, party size) | Tactical depth |
| Stealth modes | Exploration, combat, and social stealth | Three playstyles |
| Alert system | 5 levels: Unaware → Lockdown with decay timers | Escalating tension |
| Ambush | Stealth vs passive Perception for surprise round | Rewards stealthy parties |
| Trap categories | 6: mechanical, magical, natural, creature, environmental, alarm | Full variety |
| Trap tiers | 5 tiers scaling levels 1-20 | Appropriate challenge always |
| Trap flow | Detect → Identify → Disarm/Bypass → Consequence | Clear resolution |
| Player traps | Characters craft and set their own traps | Rogue/ranger fantasy |
| Lockpicking | Quality-based DCs with limited attempts | Meaningful mechanic |
| Stealth missions | Full infiltration encounter structure | Alternative to combat |
| 15+ example traps | Fully statted across all categories | Ready to use |

---

## SESSION STRUCTURE — Decisions & Links

**Full specification**: [docs/SESSION-STRUCTURE.md](docs/SESSION-STRUCTURE.md)

| Decision | Choice | Notes |
|----------|--------|-------|
| Session arc | 5-phase: opening → exploration → rising → climax → resolution | Every session = mini story |
| Recap system | AI-generated, 5 styles (narrator, journal, bardic, campfire, dream) | Immersive re-engagement |
| Session hooks | 5 types: danger, discovery, NPC, quiet moment, time skip | Varied session starts |
| Pacing engine | AI tracks tension 0-100, adjusts dynamically | Invisible to player |
| Encounter mix | ~40% combat, 30% social, 20% exploration, 10% rest | Variety enforced |
| Chronicle | Auto-generated searchable journal, multiple writing styles | Living history of adventure |
| Session closing | Stats summary + cliffhanger/safe haven + next goal | Clean wrap-up |
| Epilogue | AI-generated character ending with full stats + world impact | Story conclusion |
| Hall of Heroes | Gallery of completed characters with rankings | Meta-progression hub |
| New Game Plus | Keep 1 item, 10% gold, recipes, map knowledge, altered world | Deep replayability |
| Save system | Auto-save at milestones + quick save + 10 manual slots | Never lose progress |
| AI pacing rules | Read engagement signals, manage arc, enforce variety | Smart DM behavior |

---

## PARKING LOT — Ideas Without Homes Yet

- **The Dream Sequence**: A mechanic where death could trigger a surreal dream/limbo scene instead of hard game over. The character can fight their way back. Cost: they wake up changed.
- **The Chronicle**: An auto-generated narrative summary of your character's story so far, readable in prose, shareable. Like a book.
- **The Bestiary**: A growing personal journal of every creature you've encountered, with generated illustration and your personal note about the fight.
- **Letter Writing**: The ability to write in-world letters that NPCs respond to. Persistent NPC correspondence.
- **World Events**: Background events that happen without player involvement (a war starts, a city falls, an NPC you know dies off-screen). The DM references them.
- **The Ancestral Weapon**: A mechanic where one weapon grows with you throughout the entire story, gaining new properties, a name, a history. Becomes legendary by the end.
- **Photo Mode**: Pause the story and request a specific scene be illustrated. No gameplay � just art.
- **The Ripple Effect**: A visible timeline showing consequences of your choices. Not real-time, but viewable as a story artifact.



