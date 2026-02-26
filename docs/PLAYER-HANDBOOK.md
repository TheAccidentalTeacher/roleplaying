# Player's Handbook  Full Design Specification
**AI RPG Project** | Design Docs

---

##  CHARACTER SYSTEM � The Heart of Everything

> "Character creation is the most fun part of the game. In D&D those chapters of the books are massive. I want this and more and more and more."

This is not a form you fill out. It is the first act of your story. It should feel like the best hour you've ever spent before an adventure. And then at every level-up, it should feel like that again.

---

###  DECIDED: All Four Creation Modes + More

The character creation screen is a **mode selector**. Players choose how they want to arrive at their character. No wrong answer. All modes produce a complete, fully-specified character and trigger World Genesis.

---

#### Mode 1: Quick Spark
*"I want to start now. Surprise me."*

- Enter a name (or generate one)
- Pick a portrait archetype (10-12 illustrated options, no class lock-in)
- One optional sentence: a feeling, a word, an image, or nothing
- Click: **Begin**
- The world generates around you. You discover who you are in the first scene.

Time investment: 90 seconds. Surprise is the feature.

---

#### Mode 2: The Questionnaire
*"I want to know my character before I play them."*

7 evocative questions. No mechanical framing. Pure character work.

```
1. What is your name, and does it mean something?
2. Where did you grow up, and what made you want to leave?
3. What is the thing you are most proud of?
4. What is the thing you are most ashamed of?
5. Who did you love? What happened to them?
6. What do you believe that almost no one else believes?
7. What are you willing to die for?
```

AI reads the answers, infers everything else:
- Class/archetype that fits the character as described
- Starting stats weighted toward their evident strengths
- Background traits and skill affinities
- The world genesis uses these answers as **seed material** � people from your past may appear, the thing you lost may resurface, what you believe will be tested

Time investment: 10-15 minutes. You know this person.

---

#### Mode 3: The Builder
*"I want to make every choice deliberately."*

Full D&D-style character construction, but AI-assisted at every step:

**Step 1 � Race/Ancestry** (generated per world, not a fixed list)
- The world bible contains the species/peoples of THIS world
- Classic options always available (human, elf, dwarf equivalents)
- World-specific options: might be "people who were born in the collapsed timeline" or "second-generation colony workers" depending on world type
- Each ancestry has: stat bonuses, innate traits, cultural knowledge, social perception (how NPCs see you)

**Step 2 � Class**
Full class roster with AI explanation tailored to your world:

| Class | Core Fantasy | Example World-Specific Flavor |
|-------|-------------|-------------------------------|
| Warrior | Master of weapons and force | "Ironbound" � soldiers who had runes burned into their skin by a dying empire |
| Mage | Bends reality through study and will | "Threadwalker" � those who can see the invisible strings that connect all things |
| Rogue | Precision, deception, opportunity | "Fadeling" � people touched by the void between worlds who learned to slip through attention |
| Cleric | Channel divine power | "Witness" � the god you serve may be real, dead, or something pretending to be divine |
| Ranger | Mastery of wilderness and survival | "Scarwalker" � hunters who track creatures that shouldn't exist |
| Bard | Story, music, and social power | "Voicekeeper" � some words have power here; bards know which ones |
| Paladin | Sacred oath, divine warrior | "Oathbound" � the oath is a real contract, witnessed by something ancient |
| Druid | Nature's fury and patience | "Skindeep" � the natural world in this world has a will of its own, and you can speak it |
| Warlock | Power through a pact | "Bargained" � something gave you power. It will want something back. |
| Monk | Body as weapon, self as fortress | "Stilled" � those who found the silence inside the storm and live there permanently |
| Artificer | Magic through craft and invention | "Forgeborn" � the magic system runs on constructed objects in some worlds |
| Blood Mage | Power through sacrifice | "Bleeder" � your own life force is the fuel. Every spell costs you. |

Each class description includes:
- What you can DO mechanically
- What you ARE narratively
- How the world treats people like you (respected? feared? persecuted?)
- What your class means for YOUR specific generated world
- Sample level 1-5 ability progression

**Step 3 � Background / Origin**
Not a preset list � AI generates valid backgrounds for your world. Classic templates plus world-specific options:

*Classic*: Soldier, Criminal, Sage, Noble, Outlander, Acolyte, Folk Hero, Hermit, Merchant, Sailor  
*World-Specific examples*: Rift Survivor (if world has portals), Last Priest of a Dead God, Corporate Deserter (cyberpunk world), Colony Orphan (space world), Witch-Hunter's Apprentice (hidden magic world)

Each background gives: 2 skill proficiencies, 1 tool/language, starting equipment pack, and a **Story Hook** � one sentence the DM will incorporate into the opening scene

**Step 4 � Ability Scores**
Three methods, player chooses:

- **Roll** � 4d6 drop lowest, six times, assign freely. AI comments on the result: *"An 18 STR and a 7 INT � you are the strongest person in any room and you know it. You've survived on instinct when cleverness failed you."*
- **Point Buy** � 27 points, standard D&D rules
- **Standard Array** � 15/14/13/12/10/8, assign as desired
- **AI Recommended** � describe your character concept in prose, AI assigns scores that fit

**Step 5 � Derived Stats** (auto-calculated, always visible)
```
HP = Class base + CON modifier � level
AC = 10 + DEX modifier (base, armor changes this)
Initiative = DEX modifier
Speed = Race/class base
Proficiency Bonus = +2 at level 1, scales with level
Passive Perception = 10 + WIS modifier + proficiency (if proficient)
Saving Throws = by class (2 proficient at level 1)
Carry Weight = STR � 15 lbs (light/medium/heavy encumbrance tracked)
```

**Step 6 � Starting Equipment**
Class starting pack OR gold roll to buy custom gear (see GEAR SYSTEM below)

**Step 7 � Character Traits**
Four fields, player fills or AI generates from backstory:
- *Personality Trait*: How you act day-to-day
- *Ideal*: What principle drives you
- *Bond*: What ties you to the world
- *Flaw*: What holds you back

These are NOT cosmetic. The DM reads them and plays them. Your flaw will create problems. Your bond will be threatened.

**Step 8 � Portrait**
AI generates a character portrait using `gpt-image-1` based on race, class, described appearance, and background. Full body illustration in the world's art style.

Time investment: 30-45 minutes. You know everything about this person.

---

#### Mode 4: Import / Conceptual
*"I already know who I want to be."*

A single large text field:

> *Describe any character from any fiction, or a completely original character concept in any detail you want. Name them, describe them, tell me their backstory. I'll build them.*

Examples that work:
- "I want to play Geralt of Rivia but in a zombie apocalypse world"
- "A morally grey spy who is very good at her job and has never once thought about whether what she does is right until now"
- "A disgraced general who lost everything in a war he started, trying to find one thing worth protecting before he dies"
- "Something like a Witcher crossed with a Buddhist monk, in a world that's running out of magic"
- "I want to be the villain. Not a 'dark hero', an actual villain who is trying to build something terrible and believes completely in it"

AI extracts: name, class, background, stats, personality, bond/ideal/flaw, and suggests starting equipment.  
You accept, adjust, or say "not quite" and refine.

---

#### Mode 5: AI Collaborative
*"I want to talk through it."*

A conversation interface before the game begins. The AI plays character-creation counselor:

> "Tell me what you're in the mood for tonight. We'll figure it out together."

It asks questions, listens, makes suggestions, pushes back. You might say "I want to play someone powerful" and it asks "Powerful how � do you mean feared, respected, physically dominant, or someone who moves the world with words?" and the answer unlocks the direction. You co-create the character through dialogue. When both you and the AI feel ready, it summarizes: "Here's who you are" � and you confirm or adjust.

---

###  THE CHARACTER SHEET � A Living Document

The character sheet is **the most-viewed piece of UI in the game**. It has to be beautiful, comprehensive, and alive. It updates in real time as the story unfolds.

**Format**: A rendered HTML panel, styled to match the world's art style:
- Fantasy world  parchment, ink, illuminated borders
- Sci-fi world  clean white interface, terminal-style readouts
- Horror world  worn paper, water-stained, handwritten annotations
- Cyberpunk  glowing neon HUD overlay aesthetic

**Layout** (tabs within the sheet):

**Tab 1: The Person**
```

  [PORTRAIT]   NAME                          
               CLASS � LEVEL � BACKGROUND    
               Race/Ancestry � Alignment     
               XP:    Level 5         

  STR  DEX  CON  INT  WIS  CHA              
  18   14   16   10   12   13               
  +4   +2   +3   +0   +1   +1               

  HP: 42/42    AC: 16    Speed: 30ft         
  Initiative: +2    Proficiency: +3          
  Passive Perception: 14                     

  SAVING THROWS    SKILLS                    
   STR  +7         Athletics  +7          
   CON  +6         Perception +4          
   DEX  +2          Stealth   +2           
  ...              ...                       

  Personality: ...    Ideal: ...            
  Bond: ...           Flaw: ...             

```

**Tab 2: Abilities & Spells**
- All class features, fully described
- Spell slots visual tracker (candles that snuff, not just numbers)
- Ability usage tracker (X/day abilities)
- Conditions currently active (poisoned, inspired, frightened, etc. with real game effects)
- Special status effects (world-specific � "Rift-touched: +2 on portal saves, -1 to sleep")

**Tab 3: Equipment**
See full GEAR SYSTEM below

**Tab 4: The Story**
- Character backstory (what they wrote at creation)
- Significant story moments (auto-logged by DM � "Defeated the Iron Captain", "Saved Mira from the flood")
- Relationships (mini NPC relationship panel � faces, names, relationship status)
- Active quests
- Personal goals / character arc tracker

**Tab 5: The World**
- World name and brief description
- Faction standings (mini reputation bars for each known faction)
- Map (fog-of-war, grows with exploration)
- Known locations
- Discovered lore entries (the book shelf)

---

###  GEAR SYSTEM � Everything Means Something

> "No buying spelunking tools and never actually needing them as the story progresses."

This is the core design principle. **The DM is inventory-aware at all times.** Every item in your pack exists in the fiction. If it's there, it gets used. If it never gets used, that's a failure of the DM, not the player.

**The Inventory Contract**:
The contents of your bag are a standing context injection in every DM prompt:
```
Character equipment includes: [listed items]
The DM must actively look for natural moments to make inventory items story-relevant.
If a player owns rope, there should be a ravine, a well, or a hanging.
If a player owns a spyglass, there should be a distant thing worth seeing.
If a player owns a forgery kit, there should be a document that matters.
```

**Equipment Slots (body-based)**:
```
HEAD:    Helm / Hood / Crown / Nothing
NECK:    Amulet / Necklace / Pendant
CHEST:   Armor / Gambeson / Robes
BACK:    Cloak / Mantle / Cape
HANDS:   Gloves / Bracers
RING L:  Ring
RING R:  Ring
BELT:    Belt / Sash (small items attach here)
FEET:    Boots / Sandals / Greaves
WEAPON MAIN:   Right hand
WEAPON OFF:    Left hand (shield, dagger, spell focus, torch)
PACK:    Everything carried (weight-tracked)
SECRET:  Hidden items (not visible to others � poison vials, lockpick sets)
```

**Item States** (each item tracks):
- `condition`: pristine / good / worn / damaged / broken
- `identified`: true/false (some items are unidentified � what IS this exactly?)
- `history`: string[] � events this item has been part of ("Used to kill the Thornwall captain")
- `attuned`: boolean (for magical items requiring attunement)
- `charges?`: current/max if applicable
- `story_weight`: number � how narratively significant is this item? (1-10, drives DM attention)

**Encumbrance � Real but Not Annoying**:
- Light load ( STR�5 lbs): No penalty
- Medium load ( STR�10): Speed -10ft
- Heavy load ( STR�15): Speed -20ft, disadvantage on STR/DEX/CON checks
- Overloaded (> STR�15): Can't move
- The DM mentions encumbrance narratively, not as a rules lecture: *"The pack is dead weight on your shoulders. You eye the spare rope and wonder if it's worth it."*

**Item Quality Tiers** (beyond rarity � quality is separate):
```
Shoddy      -1 to relevant rolls, may break on a nat 1
Standard    No modifier
Quality     +0 to rolls but never breaks, reliable
Masterwork  +1 to relevant rolls, beautifully made
Legendary   Named item, unique, has a history, has a destiny
```

**Mundane Items That Actually Matter**:

| Item | When It WILL Matter |
|------|---------------------|
| Rope (50ft) | Descent, restraint, rigging, rescue, hanging |
| Spelunking Kit | Cave navigation, underground passage, collapsed structure |
| Healer's Kit | Field medicine, stabilizing dying allies, treating disease |
| Forgery Kit | Documents, seals, false identities that matter to the plot |
| Thieves' Tools | Locks that hide things you need, cages that hold things you want |
| Spyglass | Distant threat spotted early, ship on the horizon, signal fire |
| Mirror | Signal, seeing around corners, the thing that shouldn't reflect you |
| Poison Vials | The assassination option the DM will present |
| Chalk | Trail markers that others follow or find |
| Crowbar | The sealed door, the crate that holds the evidence |
| Manacles | Capture options, prisoner transport, binding a demon |
| Net | Non-lethal capture, underwater movement, improvised climbing |
| Ink / Quill | Letters that matter, copying a spell, the treaty you write |
| Candles/Lantern | Darkness that means something, ritual use, timer mechanics |

**The principle**: If an item isn't going to come up organically in this world, the DM suggests you don't buy it. Items are not a checklist � they are props in your story.

**Buying and Selling**:
- Shops exist in every settlement, contents tied to world type and faction control
- Prices fluctuate with story events (war = steel prices triple)
- Merchants have opinions, relationships, and occasionally ulterior motives
- Haggling is a real option (CHA roll vs. merchant's disposition)
- Black markets exist (require reputation or contacts to access)
- Rare items are not in stores � they are in the world, waiting to be found

---

###  LEVELING UP � The Best Moment in the Game

Level-ups happen at **narrative moments**, not just XP thresholds. The DM decides when you've grown:
- After a major revelation
- After surviving something you shouldn't have
- After making a choice that cost you something
- After completing a significant quest arc

**Why**: Nothing kills immersion faster than "you have reached the XP threshold." Instead: *"Something has changed in you. The fight with the iron captain, the choice you made at the bridge, the dream you had � it's all settling into something different. You feel it."*

**The Level-Up Screen** (full panel, AI-assisted):

**Step 1: Reflection** � The DM writes a brief paragraph acknowledging what has changed in the character narratively. Not mechanical. Just: this is who you are becoming.

**Step 2: Class Features** � New abilities unlocked at this level. For each option:
- Full description of what it does mechanically
- AI narrative gloss: what this looks like in YOUR world, with YOUR character
- If it's a choice (e.g., Battle Master maneuver selection): AI recommends based on your play history and story situation, explains why
- Preview: "If you choose this, here's how your next fight might go differently"

**Step 3: Ability Score Improvement or Feat**
At certain levels (4, 8, 12, etc.): +2 to one stat OR +1/+1 OR a Feat.

**Feats** � not a simple list, organized by how they feel:

*Power Feats* (you hit harder, take more punishment):
Great Weapon Master, Polearm Master, Sentinel, War Caster, Resilient, Tough, Shield Master

*Precision Feats* (you hit smarter):
Sharpshooter, Crossbow Expert, Skulker, Alert, Lucky, Mobile

*Social/Story Feats* (narrative power, not just combat):
Actor, Inspiring Leader, Linguist, Skilled, Tavern Brawler (more story than combat), Observant, Healer

*Magic Feats*:
Magic Initiate (touch of another class's magic), Ritual Caster, Spell Sniper, Elemental Adept

*World-Specific Feats* (generated per world):
In a world with portals: "Rift-Stable" (advantage on disorientation saves from dimensional travel)
In a political intrigue world: "Noble Bearing" (advantage on court etiquette, recognition by nobility)
In a zombie world: "Blood Smell" (advantage on horror saves, you've smelled enough death to be numb to it)

For each feat, AI shows:
- Mechanical benefit
- Story implication: "What does having this feat say about who you've become?"
- Whether it opens or closes story options: "With Healer, NPCs may begin seeking you out for medical help"

**Step 4: Skills / Proficiencies** (if applicable at this level)

**Step 5: New HP** � Roll hit die + CON modifier. Option to "take average" for safety.

**Step 6: Spell Slots & Spells** (if spellcaster)
For each new spell:
- Full description
- AI scenario: "Here is a situation you have already been in where this spell would have changed everything"
- Spell interaction suggestions: "Combine with your existing Web spell for a layered battlefield control strategy"

**Step 7: The New You**
Updated portrait option (AI re-generates portrait with visual evolution reflecting the level), updated character sheet auto-populated, DM acknowledges the growth in the next scene.

---

###  STATS THAT MEAN EVERYTHING � The Full System

Every ability score has mechanical AND narrative weight. The DM uses ALL of them.

```typescript
interface AbilityScores {
  STR: number  // Strength
  DEX: number  // Dexterity  
  CON: number  // Constitution
  INT: number  // Intelligence
  WIS: number  // Wisdom
  CHA: number  // Charisma
}
```

**Strength** (STR)
- *Mechanically*: Melee attack/damage, athletics, carry weight, breaking things
- *Narratively*: High STR � you are physically imposing, doors open (literally and figuratively), people don't pick fights with you, you can carry a wounded companion. Low STR � you rely on leverage, wit, help. The DM describes physical challenges differently based on your STR.
- *DM usage*: Heavy portcullises, stuck doors, restrained prisoners, collapsed structures, swimming in armor, intimidation through demonstration

**Dexterity** (DEX)
- *Mechanically*: Ranged attacks, AC (light armor), initiative, stealth, sleight of hand, acrobatics
- *Narratively*: High DEX � you move through spaces, you're first to act, your hands are sure. Low DEX � you're deliberate, forceful, not subtle. Picking pockets isn't your thing. You trip in the dark.
- *DM usage*: Narrow ledges, falling hazards, pickpocket situations, rope climbing, hiding positions, first-to-draw scenarios

**Constitution** (CON)
- *Mechanically*: HP, concentration saves, endurance checks, resisting poison/disease
- *Narratively*: High CON � you endure. Pain doesn't stop you. You can go days without rest when you have to. Low CON � every brutal fight shows on you. You're sick longer. The cold bites harder.
- *DM usage*: Multi-day forced marches, disease exposure, poison traps, concentration during combat, environmental hazards

**Intelligence** (INT)
- *Mechanically*: Arcane magic (save DC, attack), Investigation, History, Arcana, Nature, Religion
- *Narratively*: High INT � you notice what others miss, you know things, you form plans others didn't see coming. Low INT � the DM doesn't insult you, but your character misses things that others catch. You're not stupid, you just process differently. Street smart where book-smart failed.
- *DM usage*: Ancient inscriptions, tactical puzzles, recognizing monster weaknesses, researching lore, spotting the flaw in a villain's plan

**Wisdom** (WIS)
- *Mechanically*: Divine magic (Clerics/Druids), Perception, Insight, Animal Handling, Medicine, Survival
- *Narratively*: High WIS � you feel things before they happen. You read people accurately. The world makes sense to you at a level others don't access. Low WIS � you're impulsive, you trust the wrong people, your gut leads you wrong at the worst moments.
- *DM usage*: Sensing danger before it arrives, reading NPC emotional states, detecting lies, tracking in wilderness, first aid, animal cooperation

**Charisma** (CHA)
- *Mechanically*: Bard/Paladin/Warlock/Sorcerer magic, Persuasion, Deception, Intimidation, Performance
- *Narratively*: High CHA � rooms shift when you walk in. People want to help you. Strangers trust you. Enemies underestimate the danger of someone so charming. Low CHA � you're honest to a fault or simply difficult. The words don't come. You'd rather act than speak.
- *DM usage*: Negotiating with enemies, rallying demoralized allies, convincing a gate guard, seducing an NPC, intimidating a crowd, performing for information

**The DM Stat-Usage Promise**:
In every session, at least 4 of the 6 stats should be meaningfully tested. A stat that goes untouched for 3 sessions in a row is a DM failure. An 8 in WIS should cause problems. An 18 in CHA should open doors that are otherwise closed. Stats are not a character sheet curiosity � they are who you are today.

---

###  DECIDED: DM Voice

**Option B � Fully Adaptive. The DM becomes a different author for each world type.**

- Epic Fantasy  Tolkien / Guy Gavriel Kay. Grand, mythic, sentences that breathe
- Dark Fantasy  Joe Abercrombie / Cormac McCarthy. Spare. Brutal. No ornament
- Horror  Stephen King. Personal dread. The monster is secondary to the fear
- Science Fiction  Iain M. Banks / Ursula K. Le Guin. Vast, precise, philosophical
- Comedy/Absurdist  Terry Pratchett. Wit that hides heartbreak
- Noir/Mystery  Raymond Chandler. Every observation is a judgment
- Zombie/Apocalypse  Cormac McCarthy's The Road. Silence between sentences
- Cyberpunk  William Gibson. Surface is everything. Surface is a lie
- Space Opera  Frank Herbert. Every action has political weight
- Mythological  Neil Gaiman. The gods are real and tired and dangerous
- Historical  Bernard Cornwell. Mud and blood and tired men doing great things
- Thriller  Lee Child. Short sentences. High stakes. Economy of language
- Romance-inflected  every scene has emotional texture under the action
- Weird/Surreal  Borges. Jeff VanderMeer. The rules are consistent but strange

The DM knows which world it is in and writes accordingly from scene one.

---

###  DECIDED: Companion Control
**Hybrid: Player sets strategy, AI executes � but player can seize full control of any companion for any turn.**

Default: Companions act intelligently under AI direction, consistent with their personality and your stated party strategy ("aggressive", "protect the healer", "focus fire", "conserve resources"). You watch them fight as real characters with agency.

Override: At the start of any companion's turn you can click "Take Control" and play their turn yourself � full action, bonus action, movement. Release and they go back to auto.

Why this is right: It feels like leading a real party. They're not puppets, they're people who fight alongside you. But you can always step in when it matters.

---

###  DECIDED: Hall of Heroes
**Full multi-character lobby from day 1.** It IS the landing screen. Walking into the Hall is walking into your world collection.

---

##  THE RACES � A Complete Codex

> This is not a fixed list. Every world generates its own people. But these are the **available seeds** � the archetypes Claude draws from when building your world's ancestries. When you create a character, the races available to you are the ones that exist IN YOUR WORLD, flavored specific to it.
>
> HeroForge.com compatibility note: every race below maps to a HeroForge build path. Each entry includes sculpting notes.

###  DECIDED: Races are world-contextualized, not a universal menu

You don't pick from a global list. Your world has 4-8 playable ancestries, generated specifically for it. They might include familiar archetypes (a race clearly "like elves") but named and flavored for this world, or they might be completely original. A sci-fi world has no elves � it has clone lineages, AI-integrated humans, and alien hybrid descendants.

---

### FANTASY ANCESTRIES

**Human**
The most common, the most adaptable, the least defined � and therefore the most interesting. Humans are in every world because they breed fast, travel far, and refuse to accept limits. They get no innate magic but gain one extra feat at level 1 and one extra skill proficiency.
*HeroForge*: Any base body, any equipment, no constraints.
*Narrative*: In worlds dominated by ancient magical races, humans are the upstarts who keep winning anyway. The old powers find this baffling and infuriating.

**Elf** (and world-specific variants)
Longevity (centuries to millennia), heightened perception, connection to the natural/magical world, and a tendency toward melancholy that comes from watching everything you love age and die. Gain: +2 DEX, Darkvision 60ft, Keen Senses (proficiency in Perception), Fey Ancestry (advantage vs charm, can't be magically slept), Trance (4hr rest = 8hr sleep).

*Subvariants generated per world*:
- **High Elf** � scholarly, arcane focus, +1 INT, one wizard cantrip
- **Wood Elf** � wilderness mastery, +1 WIS, mask of the wild (hide in nature)
- **Dark Elf / Drow** � underground civilization, +1 CHA, sunlight sensitivity, superior darkvision 120ft, innate spellcasting (Dancing Lights, Darkness, Faerie Fire)
- **Sea Elf** � coastal/aquatic culture, +1 CON, swim speed, breathe water
- **Astral Elf** � planar travelers, +1 INT, radiant soul (resistance to radiant), Astral Fire (light cantrips)
- **Eladrin** � fey-touched, +1 CHA, Fey Step (bonus action: teleport 30ft, 1/short rest)
- **Shadar-kai** � shadow-touched, +1 CON, Blessing of the Raven Queen (teleport + resistance to all damage, 1/long rest)
- **Grugach (Wild Elf)** � feral, isolationist, +1 STR, natural armor, primitive weapon master
- **Lolthsworn** � cursed spider-elf servants, unique dark powers
*HeroForge*: Pointed ears (size choice), lithe builds, high cheekbones, long hair. Drow: inverted skin/hair and glowing eyes.

**Dwarf**
Stone-dense bones, resistance to poison, stonecunning (mastery of underground geology), weapon training (axes/hammers), tool proficiency. +2 CON, Darkvision 60ft, Stonecunning, Dwarven Resilience.

*Subvariants*:
- **Mountain Dwarf** � warrior culture, +2 STR, medium armor proficiency
- **Hill Dwarf** � trader culture, +1 WIS, extra HP per level (Dwarven Toughness)
- **Duergar (Gray Dwarf)** � enslaved and escaped, sunlight sensitivity, innate psionics (Enlarge, Invisibility, 1/day each), advantage vs illusions/charm/paralysis
- **Forge Dwarf** � artificer/smith lineage, natural fire resistance, tool proficiency +1
- **Arctic Dwarf** � cold-weather culture, cold resistance, ice tools mastery
*HeroForge*: Stocky build, large beard options, wide armor options. Duergar: gaunt, pale, scarred.

**Halfling**
Small (2.5-3ft), Lucky (reroll 1s on attack/ability/save), Brave (advantage vs frightened), Nimbleness (move through larger creatures' spaces). +2 DEX.

*Subvariants*:
- **Lightfoot** � wandering, social, can hide behind larger creatures, +1 CHA
- **Stout** � hardier, resistance to poison, +1 CON
- **Ghostwise** � feral telepathy (can communicate mentally with one creature), +1 WIS
- **Lotusden** � forest-bonded, plant magic (Druidcraft, Entangle, Spike Growth innately)
- **Harengon (Rabbitfolk)** � rabbit ancestry, Hare-Trigger (+proficiency to initiative), Rabbit Hop (jump as bonus action)
*HeroForge*: Small base, light builds, wide variety of "cozy adventurer" aesthetics.

**Gnome**
Small, curious, mechanically gifted or magically talented. Gnomish Cunning (advantage on INT/WIS/CHA saves vs magic). +2 INT, Darkvision 60ft.

*Subvariants*:
- **Forest Gnome** � animal friends, natural illusionist, Minor Illusion cantrip, +1 DEX
- **Rock Gnome** � tinkers and inventors, Tinker trait (build clockwork devices), +1 CON
- **Deep Gnome (Svirfneblin)** � underground spies, Stone Camouflage (advantage on Stealth in rocky terrain), +1 DEX
- **Autognome** � constructed gnome, constructed body (don't need food/air), proficiency bonuses to objects
*HeroForge*: Small frame, big expressive features, gnome-specific build options.

**Half-Elf**
Human ambition + elven awareness. +2 CHA, +1 to two other stats, Darkvision 60ft, Fey Ancestry, two skill proficiencies (any). The diplomats, the wanderers, the ones who belong fully to neither world.
*HeroForge*: Human base with subtle pointed ears, elven facial structure options.

**Half-Orc**
Human hunger + orcish power. +2 STR, +1 CON, Darkvision 60ft, Relentless Endurance (drop to 1HP instead of 0, 1/long rest), Savage Attacks (extra die on crit melee damage), Menacing (proficiency in Intimidation).
*HeroForge*: Human base with tusks, green/grey/brown skin options, heavy bone structure.

**Tiefling**
Infernal bloodline � somewhere in your ancestry, a devil. +2 CHA, +1 INT, Darkvision 60ft, Hellish Resistance (fire), innate spellcasting (Thaumaturgy cantrip  Hellish Rebuke 1/day  Darkness 1/day).

*Subvariants by infernal patron*:
- **Asmodeus** � standard, charm and deception focus
- **Zariel** � warrior line, smite spells, fire resistance ++ 
- **Glasya** � thief line, Minor Illusion + Disguise Self + Invisibility
- **Levistus** � survival line, armor of Agathys + fog cloud
- **Baalzebul** � corruption line, friends + ray of sickness + crown of madness
- **Dispater** � diplomacy line, thaumaturgy + disguise self + detect thoughts
- **Mammon** � wealth line, tenser's floating disk + arcane lock + Leomund's tiny hut
- **Mephistopheles** � arcane line, mage hand + burning hands + flame blade
- **Feral Tiefling** � primal manifestation, +2 DEX instead of INT
*HeroForge*: Horns (many styles), tail, hooves or humanoid feet, skin in any non-human color range, solid-color eyes.

**Dragonborn**
Draconic heritage � you are NOT a dragon, but your blood is. Breath weapon (choose damage type matching ancestry), resistance to matching damage, +2 STR, +1 CHA.

*Chromatic (Evil dragon lines)*: Black (acid), Blue (lightning), Green (poison), Red (fire), White (cold)
*Metallic (Good dragon lines)*: Brass (fire), Bronze (lightning), Copper (acid), Gold (fire), Silver (cold)
*Gem (Psionic lines)*: Amethyst (force), Crystal (radiant), Emerald (psychic), Sapphire (thunder), Topaz (necrotic)
*Draconblood* � lost tail, diplomatic focus, +2 INT, +1 CHA, Forceful Presence (advantage on Persuasion/Intimidation)
*Ravenite* � escaped slaves, vengeance, +2 STR, +1 CON, Revenant's Hunger (bonus necrotic damage on crit)
*HeroForge*: Dragonborn body type, scale texture, snout, tail, color selection.

**Aasimar**
Touched by celestial blood. Healing Hands (touch heal = your level in HP, 1/long rest), Light Bearer (Light cantrip), Darkvision 60ft, +2 CHA.

*Subvariants*:
- **Protector** � guardian of the weak, +1 WIS, Radiant Soul (grow wings, fly speed 30ft, 1/short rest, adds radiant damage)
- **Scourge** � war against evil, +1 CON, Radiant Consumption (emit searing light aura, damages enemies and yourself, 1/short rest)
- **Fallen** � corrupted celestial, +1 STR, Necrotic Shroud (terrify creatures, 1/short rest)
*HeroForge*: Human base, halo effect (ornamental), feathered hair/wing options for Protector, scarred for Fallen.

---

### EXOTIC & MONSTROUS PLAYABLE ANCESTRIES

**Orc (full)**  
Not half, not softened. +2 STR, +1 CON, Darkvision 60ft, Aggressive (bonus action: move toward enemy), Powerful Build (count as large for carry weight), Primal Intuition (+2 skills from Animal Handling/Insight/Intimidation/Medicine/Nature/Perception/Survival).
*HeroForge*: Orc body type, full tusk options, green/grey/brown/black skin.

**Goblin**  
Small and fast, Darkvision 60ft, Fury of the Small (once/short rest, deal extra damage = your level), Nimble Escape (Disengage or Hide as bonus action), +2 DEX, +1 CON.
Stories told about goblins are almost always wrong. Your goblin is the exception that proves the rule, or the character who changes the story entirely.
*HeroForge*: Small frame, large ears, wide eyes, many skin tones.

**Kobold**  
Pack Tactics (advantage when ally within 5ft of target), Darkvision 60ft, Draconic Legacy (each kobold tied to a dragon type), Grovel/Cower/Beg (distract enemy as action), +2 DEX, -2 STR.
*HeroForge*: Lizard-small body, snout, tail, scale texture.

**Lizardfolk**  
Natural armor (AC = 13 + DEX mod), Hold Breath (15min), Hungry Jaws (bonus action bite = 1d6 + STR, gain temp HP = CON mod), Natural skills (Athletics, Perception, Stealth, Survival � pick 2), +2 CON, +1 WIS.
*HeroForge*: Lizardfolk body type, scale selection, tail.

**Tortle**  
Natural AC 17 (no armor needed), Shell Defense (withdraw into shell = AC 19 + advantage on STR/CON saves + disadvantage on DEX + can't move/attack), Hold Breath (1hr), Claws (1d4 slashing), +2 STR, +1 WIS.
*HeroForge*: Tortle body, shell on back.

**Tabaxi (Cat People)**  
Feline Agility (double speed on turn, then must rest on ground before using again), Cat's Claws (climb speed 20ft, 1d4 claws), Cat's Talent (proficiency Perception + Stealth), +2 DEX, +1 CHA.
*HeroForge*: Cat-featured humanoid, tail, ear, fur pattern selection.

**Kenku (Raven People)**  
Expert Forgery (copy handwriting/craftwork perfectly), Mimicry (copy any sound heard, voice checks with advantage), Kenku Training (pick 2 from Acrobatics/Deception/Stealth/Sleight of Hand), +2 DEX, +1 WIS.
Cannot speak except in sounds/voices they've heard. This is either a hindrance or a deeply interesting character constraint.
*HeroForge*: Avian head, feathered body, taloned feet, wing-stump or full wings.

**Aarakocra (Bird People)**  
Flight speed 50ft (outdoors only), Talons (1d4 slashing), +2 DEX, +1 WIS.
*HeroForge*: Full avian body, large wings, beak, taloned feet.

**Firbolg**  
Firbolg Magic (Detect Magic + Disguise Self as humanoid/human, 2/short rest), Hidden Step (turn invisible until next attack or end of turn, 1/short rest), Powerful Build, Speech of Beast and Leaf (communicate with animals/plants), +2 WIS, +1 STR.
*HeroForge*: Large humanoid, giant-kin features, cow-like nose.

**Goliath**  
Stone's Endurance (reaction: reduce damage by 1d12+CON mod, 1/short rest), Powerful Build, Mountain Born (cold resistance, acclimated to high altitude), +2 STR, +1 CON.
*HeroForge*: Large human frame, stone-patch skin markings.

**Yuan-Ti Pureblood**  
Innate Spellcasting (Poison Spray cantrip, Animal Friendship on snakes unlimited, Suggestion 1/day, Poison Immunity), Magic Resistance (advantage on saves vs spells), Darkvision 60ft, +2 CHA, +1 INT.
*HeroForge*: Human body, scales on cheeks/arms, slit pupils, optional snake features.

**Triton**  
Amphibious, swim speed 30ft, breathe water, Darkvision 60ft, Control Air and Water (Fog Cloud + Gust of Wind + Wall of Water 1/day each), Emissary of the Sea (communicate with aquatic beasts), Guardian of the Depths (cold resistance, pressure immunity), +1 STR/CON/CHA.
*HeroForge*: Blue/silver humanoid, fin features, scale accents.

**Vedalken**  
Tireless Precision (proficiency in one tool/skill + d4 to those checks), Partially Amphibious (breathe air and water 1hr), Vedalken Dispassion (advantage on all INT/WIS/CHA saves), +2 INT, +1 WIS.
*HeroForge*: Blue-skinned humanoid, elongated head, no hair.

**Verdan**  
Telepathy (speak into minds of creatures you can see within 30ft), Persuasion and Insight proficiency, Black Blood (if crit hit against you, attacker takes psychic damage = your proficiency), +1 CHA, +2 STR or +1 CON at maturity.
*HeroForge*: Goblinoid small frame with black-veined skin.

**Centaur**  
Equine Build (count as large, 40ft speed), Charge (if move 30ft toward target, bonus 2d6 piercing), Hooves (1d6 bludgeoning melee), Natural Affinity (proficiency in Animal Handling or Nature), +2 STR, +1 WIS.
*HeroForge*: Centaur body, choose upper body humanoid style.

**Minotaur**  
Horns (1d6 piercing), Goring Rush (Dash  horn attack as bonus action), Hammering Horns (after melee hit, bonus action: push target 10ft), Imposing Presence (proficiency in Intimidation or Persuasion), +2 STR, +1 CON.
*HeroForge*: Bull head on human body, horn style/size, fur texture.

**Satyr**  
Ram (1d4 bludgeoning bonus action charge), Magic Resistance (advantage on saves vs spells/magical effects), Mirthful Leaps (+roll to long/high jump), Reveler (proficiency in Performance + Persuasion), +2 CHA, +1 DEX.
*HeroForge*: Goat-legged humanoid, horns, hooves.

**Loxodon (Elephant People)**  
Natural Armor (AC = 12 + CON mod), Trunk (5ft reach for grapple/interact), Keen Smell (advantage on Perception via smell), Powerful Build, Pachyderm Resilience (once/short rest: remove frightened/charmed), +2 CON, +1 WIS.
*HeroForge*: Elephant-headed humanoid, trunk, tusk options.

**Warforged**  
Constructed Resilience (advantage vs poison, resistance to poison damage, immune to disease, no need to eat/drink/breathe, advantage on saves against exhaustion), Sentry's Rest (trance 6hr, remain semi-conscious), Integrated Protection (+1 AC always, can don/doff armor in 1hr). +2 CON, +1 any.
*HeroForge*: Mechanical/construct body type, plating options, joint style, eye design.

**Simic Hybrid**  
Animal Enhancement � at creation choose 1, at level 5 add another:
*Manta Glide* (wing flaps, fly 30ft/turn while falling), *Nimble Climber* (climb speed = walk speed), *Underwater Adaptation* (breathe water + swim 30ft), *Grappling Appendages* (2 extra tentacles, grapple as bonus action), *Carapace* (+1 AC), *Acid Spit* (2d10 acid, DEX save, 15ft, 1/short rest).
+2 CON, +1 any.
*HeroForge*: Human base with animal feature additions.

**Shifter (Bestial Heritage)**  
Shifting (bonus action: manifest bestial feature for 1min, 1/short rest � adds temp HP + unique power per subtype):
- *Beasthide* � +1d6 temp HP, +1 AC
- *Longtooth* � grow fangs, melee bite attack
- *Swiftstride* � +10 speed, reaction-Disengage
- *Wildhunt* � advantage on WIS checks, can't be surprised
+1 DEX, +1 WIS.
*HeroForge*: Human with animalistic features that can vary per shifting type.

**Changeling**  
Shapechanger (change appearance including voice to any humanoid at will � size must stay medium/small), Instinctive (+1 any skill from Deception/Insight/Intimidation/Persuasion), +2 CHA, +1 any.
Playing the one who is always someone else. Can be any character design at will.
*HeroForge*: Build your "true form" � blank features, pale, unsettling. Then note all personas elsewhere.

**Kalashtar**  
Dual Mind (advantage on WIS saves), Mental Discipline (resistance to psychic damage), Mind Link (telepathy range = 10�your level), Severed from Dreams (can't be targeted by Dream spell, advantage vs frightened), +2 WIS, +1 CHA.
*HeroForge*: Human base, glowing eyes optional, spiritual aura ornamental.

**Shadar-kai** (Shadow touched humans)  
As Elf subvariant above but built on human baseline.

**Hollow One (The Returned)**  
You died and came back. There's something missing. Eerie Presence (advantage on Intimidation checks, or use WIS instead of CHA), Revived Nature (resistance to necrotic, don't need food/drink, can stabilize without Healer's Kit), The Weight of Death (advantage on saves vs being frightened). No stat bonuses � the cost of returning was something else.
*HeroForge*: Any base body, scarring, ethereal/hollowed eyes.

---

### NON-FANTASY / GENRE ANCESTRIES

When the world type is not fantasy, races become **lineages** or **origins** � different but mechanically equivalent.

**Sci-Fi World Ancestries**:
- *Baseline Human* � standard stats, extra feat, adaptability bonus  
- *Engineered Human (Splice)* � genetically modified: choose two stat boosts reflecting the modifications, one skill expertise, one resistance
- *AI-Integrated (Augment)* � cybernetic enhancement: no magic, but Advantage on INT checks + one technological specialty (hacking, engineering, weapons systems)
- *Clone Lineage* � grown in vats, no childhood, extraordinary physical capability (choose focus: combat, intelligence, or endurance) + eerie emotional flatness (disadvantage on Insight/Persuasion)
- *Alien (First Contact)* � choose alien physiology from world-generated species. Stats and abilities generated by Claude based on world type
- *Uplift (Augmented Animal)* � any animal made sapient: retains some physical traits of origin species + full human cognition. The tension between instinct and intelligence is the character.

**Post-Apocalyptic / Zombie World**:
- *Survivor Human* � standard human + Hardened (advantage on fear saves, can't be disturbed by gore)
- *Infected Carrier* � you carry the virus but are immune. Other infected won't attack you. Humans sometimes won't trust you.
- *Mutant* � radiation exposure created physical deviation. Roll or choose: extra limb function, enhanced one sense, bizarre appearance, one supernatural resistance
- *Enhanced (Pre-War Experiment)* � survived a government program: +2 to two physical stats, one unique ability, the people who made you are looking for you

**Cyberpunk World**:
- *Natural* � no mods. Increasingly rare. Other naturals trust you; corps don't understand you
- *Street Mod* � black market augmentations: 2 low-grade cybernetic enhancements, one is glitching
- *Corp Augmented* � premium modifications: 3 high-grade implants, but the corp owns the warranty and the kill switch
- *Full Conversion* � mostly machine now. Max STR/CON, immune to biological threats, no longer able to be read by empaths
- *Ghost* � no digital signature. Invisible to systems. Unique vulnerability: can't access digital infrastructure

**Contemporary / Hidden Magic World**:
- *Mundane Human* � standard stats + Common Sense (advantage on saves vs magical deception, you simply don't believe it enough to fall for it)
- *Awakened* � discovered magic is real and you can touch it. Access to one cantrip and one 1st-level spell
- *Bloodline Carrier* � ancient magical ancestry so diluted you didn't know. Manifests under stress. Unpredictable
- *Touched* � something happened to you. Near-death, cosmic event, divine intervention. You carry a mark. You don't fully understand what it means yet.

---

##  THE CLASSES � All of Them, Plus More

> DnD has 12 classes. We have those and more. For every fantasy class, there are genre-equivalent versions. An Archer/Warrior is a Fighter multiclass. A Battle Mage is a Spellblade or Fighter/Wizard multiclass. Everything is on the table.

###  DECIDED: Full Class Roster With Subclasses

---

### FIGHTER
*The master of warfare in any form. Every weapon, every style, every battlefield.*

**Core**: Action Surge, Second Wind, Fighting Style, Extra Attack (�3 by level 20), Indomitable (reroll saving throw)

**Subclasses** � pick at level 3:

| Subclass | Fantasy | Feel |
|----------|---------|------|
| **Champion** | Pure warrior perfection | Expanded crits, remarkable athlete |
| **Battle Master** | Tactical genius | 16 combat maneuvers, superiority dice system |
| **Eldritch Knight** | Fighter who learned magic | Emergency Shield/Absorb Elements, War Magic |
| **Cavalier** | Mounted supremacy | Protect mount, never dismounted, unwavering mark |
| **Samurai** | Honorbound perfection | Fighting Spirit (temp HP + advantage), Elegant Courtly presence |
| **Arcane Archer** | Magical projectiles | 6 Arcane Shot options (Banishing, Bursting, Enfeebling, Shadow, Seeking, Grasping) |
| **Psi Warrior** | Telekinetic fighter | Psionic Power dice, move objects, psionic shield |
| **Rune Knight** | Giant rune magic | Carve 5 rune types into equipment, grow large |
| **Echo Knight** | Manifest duplicate of self | Echo avatar (36ft range), attack from echo position, manifest multiple echoes |

*Genre equivalents*: Soldier (military sci-fi), Merc (cyberpunk), Survivor (post-apoc), Detective (noir with combat training), Operator (special forces)

---

### RANGER
*Hunter, tracker, wilderness master. The gap between you and the prey is always narrowing.*

**Core**: Favored Enemy, Natural Explorer, Primeval Awareness, Spells (half-caster), Extra Attack, Hide in Plain Sight, Vanish, Feral Senses, Foe Slayer

**Subclasses** � pick at level 3:

| Subclass | Feel |
|----------|------|
| **Hunter** | Pure predator � choose prey type, specialize destruction of it |
| **Beast Master** | Animal companion (full CR-scaled companion, fights alongside you) |
| **Gloom Stalker** | Darkness hunter � invisible in dark, ambush master, first-strike terror |
| **Horizon Walker** | Planar ranger � detect portals, step through planes briefly, banish extraplanar creatures |
| **Monster Slayer** | Expert creature destruction � identify vulnerabilities, protect against supernatural powers |
| **Fey Wanderer** � fey-touched hunter, extra CHA to attacks, misty step, charm resistance |
| **Swarmkeeper** � bound to a swarm of tiny creatures (insects, birds, leaves), swarm attacks and repositions you |
| **Drakewarden** � bond with a drake companion that grows into a true dragon mount by level 15 |

*Archer/Warrior multiclass*: Fighter 5 / Ranger 5 is the canonical build. Full martial training, Extra Attack, and Ranger spells plus Hunter subclass. The best archer in any party.

---

### ROGUE
*Precision, patience, and the understanding that the best fight is the one where only you know it happened.*

**Core**: Sneak Attack (scales to 10d6 at level 20), Thieves' Cant, Cunning Action (Dash/Disengage/Hide as bonus action), Uncanny Dodge, Evasion, Reliable Talent, Blindsense, Slippery Mind, Stroke of Luck

**Subclasses** � pick at level 3:

| Subclass | Feel |
|----------|------|
| **Thief** | Pure skill and speed � Fast Hands (bonus action Use Item), Second Story Work (climb speed), Use Magic Device |
| **Assassin** | First-strike lethality � Disguise expert, false identity, Assassinate (advantage + auto-crit on surprised targets) |
| **Arcane Trickster** | Magical misdirection � Illusion/Enchantment spells, Mage Hand (enhanced), Magical Ambush |
| **Swashbuckler** | Dashing duelist � Fancy Footwork (disengage free after melee), Rakish Audacity (sneak attack 1v1, no ally needed), Panache (charm or force retreat) |
| **Inquisitive** | Detective � Ear for Deceit (can't roll below 8 on Insight), Eye for Detail (bonus action Perception/Investigation), Insightful Fighting (sneak attack off Insight check) |
| **Mastermind** | Social manipulator � Master of Intrigue (mimicry/forgery), Master of Tactics (Help as bonus action 30ft) |
| **Scout** | Wilderness variant � Skirmisher (reaction move when enemy ends near you), Survivalist (Survival+Nature expertise) |
| **Phantom** � death-touched, steal soul fragments from dying creatures, ghost walk through walls briefly |
| **Soulknife** � psionic blades manifest from mind, no weapon needed, telepathic communication |

---

### WIZARD
*The scholar of the impossible. Every spell is a solved equation in a language older than the world.*

**Core**: Spellbook (learn any spell ever), Arcane Recovery, spell slot range level 1-9, all schools available

**Subclasses (Arcane Traditions)** � pick at level 2:

| Tradition | Specialty |
|-----------|-----------|
| **Abjuration** | Protective magic � Arcane Ward (absorb damage), Projected Ward (protect allies) |
| **Conjuration** | Summoning � Minor Conjuration (object), Benign Transposition (teleport you/summon) |
| **Divination** | Seeing � Portent (replace any roll with pre-rolled dice), Expert Divination, Third Eye |
| **Enchantment** | Mind control � Hypnotic Gaze (1 creature entranced), Instinctive Charm (redirect attacks) |
| **Evocation** | Pure destructive power � Sculpt Spells (protect allies in AoE), Potent Cantrip, Empowered Evocation |
| **Illusion** | Reality bending � Improved Minor Illusion, Malleable Illusions, Illusory Self, Illusory Reality |
| **Necromancy** � raise the dead as servants, Command Undead, Inured to Undeath |
| **Transmutation** � change matter, Transmuter's Stone (constant buff item), Shapechanger, Master Transmuter |
| **Bladesinging** � elven combat wizard tradition, physical finesse + spell bonus, dual-wield magic |
| **War Magic** � tactical battlefield wizard, Arcane Deflection (reaction defense), Tactical Wit (INT to initiative) |
| **Graviturgy** � control gravity, pull/push creatures, weight manipulation |
| **Chronurgy** � time magic, Chronal Shift (reroll any roll), Convergent Future (dictate success/failure) |
| **Order of Scribes** � living spellbook, Awakened Spellbook (sentient tome companion), copy spells faster |

*Battle Mage*: Fighter 3 (Eldritch Knight) / Wizard 5+ is the true Battle Mage. Or: Bladesinging Wizard who never multiclasses. Both valid. Completely different feel.

---

### CLERIC
*The divine conduit. Your god's power flows through you � and you must decide whether to be a vessel or a partner.*

**Core**: Divine Domain at level 1 (shapes everything), Channel Divinity (2/short rest at 6), Destroy Undead, Divine Intervention (1/day at level 10, chance your god actually shows up)

**Subclasses (Divine Domains)** � pick at level 1:

| Domain | God Type | Power |
|--------|----------|-------|
| **Life** | Healing deity | Disciple of Life (heals extra), Preserve Life, mass cure |
| **Light** | Sun/truth deity | Warding Flare (blind attackers), Channel: Radiance of the Dawn |
| **War** | Battle deity | War Priest (bonus weapon attack), Channel: Guided Strike (+10 to hit) |
| **Knowledge** | Wisdom deity | Extra languages, expertise in 2 skills, Channel: Knowledge of the Ages |
| **Nature** | Nature deity | Heavy armor + Druid cantrips, Channel: Charm Animals |
| **Tempest** | Storm deity | Wrath of the Storm (lightning reaction), Thunderbolt Strike |
| **Trickery** | Deception deity | Blessing of the Trickster (stealth advantage), Channel: Invoke Duplicity |
| **Death** | Death deity | Reaper (extend single-target necrotic spells to two targets), Channel: Touch of Death |
| **Arcana** | Magic deity | Arcane Initiate (Wizard cantrips + spells), Channel: Arcane Abjuration |
| **Forge** | Smith deity | Bonus proficiency/crafting, Channel: Artisan's Blessing (craft metal objects) |
| **Grave** | Death's caretaker | Sentinel at Death's Door (cancel crits), Channel: Path to the Grave (next hit auto-crits) |
| **Order** | Law deity | Voice of Authority (companion attack reaction), Embodiment of the Law |
| **Peace** | Harmony deity | Emboldening Bond (share proficiency bonuses between bonded creatures) |
| **Twilight** | Dusk deity | Twilight Sanctuary (healing aura), Steps of Night (fly in darkness) |
| **Ambition** | Power deity | Whispers of the Dead (learn secrets from corpses), Weal and Woe |

---

### PALADIN
*The oath is everything. Not just a promise � a binding covenant with something larger than yourself.*

**Core**: Divine Smite (expend spell slots for radiant burst on hit), Divine Health, Lay on Hands, Aura of Protection (+CHA to all saves for you and allies within 10ft), Extra Attack

**Subclasses (Sacred Oaths)** � pick at level 3:

| Oath | What You Swore | Power |
|------|---------------|-------|
| **Devotion** | Protect the innocent, honor the light | Sacred Weapon, Turn the Unholy, Holy Nimbus |
| **Ancients** | Preserve life and the light of joy | Nature's Wrath, Turn the Faithless, Undying Sentinel |
| **Vengeance** | Hunt down evil without mercy | Vow of Enmity (advantage on attacks), Retributive Strike, Soul of Vengeance |
| **Conquest** | Dominate, spread fear, hold | Conquering Presence, Guided Strike, Aura of Conquest (fear aura + slow) |
| **Redemption** | Give every creature a chance to change | Emissary of Peace, Rebuke the Violent, Aura of the Guardian |
| **Glory** | Be magnificent, inspire others to greatness | Inspiring Smite, Aura of Alacrity, Living Legend |
| **Watchers** | Protect the world from extraplanar threats | Watcher's Will, Abjure the Extraplanar, Vigilant Rebuke |
| **Oathbreaker** | The fallen paladin. Broke their oath for power | Animate Dead, Aura of Hate, Dread Lord |

---

### BARBARIAN
*Rage is not anger. Rage is the removal of everything between you and survival. When the rage comes, thinking stops. And that is exactly what you need.*

**Core**: Rage (2� STR damage bonus, resistance to bludgeoning/piercing/slashing, advantage on STR checks), Unarmored Defense (AC = 10 + DEX + CON), Reckless Attack, Danger Sense, Extra Attack, Fast Movement, Relentless Rage, Persistent Rage, Indomitable Might, Primal Champion (+4 STR/CON)

**Subclasses (Primal Paths)** � pick at level 3:

| Path | Rage Source | Powers |
|------|------------|--------|
| **Berserker** | Pure fury | Frenzy (bonus attack whole rage, fatigue cost), Mindless Rage (immune to charm/fear in rage) |
| **Totem Warrior** | Spirit animal bond | Bear (resistance everything in rage), Eagle (Dash as bonus action), Wolf (allies advantage on attacks) |
| **Ancestral Guardian** | Ancestor spirits | Spectral warriors protect allies, Consult the Spirits |
| **Storm Herald** | Elemental storm | Aura: Desert (fire), Sea (lightning), Tundra (ice temp HP aura) |
| **Zealot** | Divine fury | Divine Fury (extra radiant/necrotic damage), Warrior of the Gods (free Raise Dead)  |
| **Beast** � manifest body horror: claws, hide, carapace, animated tail, sharp teeth |
| **Wild Magic** � rage triggers random wild magic surges from a table of 8 effects |
| **Giant** � giant's power, giant's size (grow to large), stone-throw attack |
| **Battlerager** � dwarf spiked armor tradition, bonus spikes, grapple master |

---

### DRUID
*You are not in nature. You are nature, temporarily wearing a shape that can talk.*

**Core**: Wild Shape (become any beast twice per short rest, scales with level), Spellcasting, Timeless Body, Beast Spells, Archdruid

**Subclasses (Circles)** � pick at level 2:

| Circle | Philosophy | Powers |
|--------|-----------|--------|
| **Land** | Terrain mystic | Extra cantrip, Natural Recovery (regain spell slot), bonus spells by terrain type |
| **Moon** | Primal beast master | Enhanced Wild Shape (CR 1 at level 2, elemental forms at level 10), Thousand Forms |
| **Dreams** � fey touched, Balm of Summer Court (healing burst), Hearth of Moonlight (protective camp) |
| **Shepherd** � summon expert, Spirit Totem (bear/hawk/unicorn auras), Faithful Summons (summon beast army on 0HP) |
| **Spores** � death/life cycle, Halo of Spores (necrotic reaction aura), Symbiotic Entity (undead-enhanced wild shape) |
| **Stars** � celestial magic, Star Map (extra spells), Starry Form (3 constellation shapes: Archer/Chalice/Dragon) |
| **Wildfire** � destruction + regrowth, Wildfire Spirit (summon phoenix spirit), Enhanced Bond, Blazing Revival |

---

### MONK
*Every fight is a conversation between bodies. You are the one who finishes the sentence.*

**Core**: Martial Arts (unarmed strikes scale: d4d10 by level), Ki Points (fuel special abilities), Unarmored Defense (AC = 10 + DEX + WIS), Stunning Strike, Deflect Missiles, Slow Fall, Evasion, Stillness of Mind, Purity of Body, Tongue of the Sun and Moon, Diamond Soul, Empty Body, Perfect Self

**Subclasses (Monastic Traditions)** � pick at level 3:

| Tradition | Philosophy | Powers |
|-----------|-----------|--------|
| **Open Hand** | Pure physical mastery | Open Hand Technique (3 effects on Flurry), Wholeness of Body (heal self), Quivering Palm (death touch) |
| **Shadow** | Darkness assassin | Spellcasting (minor illusion, pass without trace, silence, darkness), Shadow Step (teleport between darkness) |
| **Four Elements** | Elemental avatar | Disciplines: water whip, fist of unbroken air, flames of the phoenix, ride the wind |
| **Mercy** � plague doctor monk, inflict and remove conditions, Hand of Harm and Hand of Healing |
| **Astral Self** � project astral arms (10ft reach), astral visage (defense), complete astral body |
| **Ascendant Dragon** � draconic weaponry, elemental breath, flight at high level |
| **Long Death** � death's student, touch of death (temp HP from kills), hour of reaping (fear), mastery of death (cheat death) |
| **Sun Soul** � radiant ki: Radiant Sun Bolt ranged attack, Searing Arc Strike, Searing Sunburst |
| **Drunken Master** � fluid and unpredictable, stumble as evasion, drunkard's luck |

---

### SORCERER
*You didn't study magic. Magic is what you are. The question isn't how to control it � it's whether you should.*

**Core**: Sorcery Points, Flexible Casting (convert points  spell slots), Metamagic (reshape spells)

**Metamagic Options**: Careful Spell, Distant Spell, Empowered Spell, Extended Spell, Heightened Spell, Quickened Spell, Subtle Spell, Twinned Spell, Transmuted Spell, Seeking Spell

**Subclasses (Sorcerous Origins)** � pick at level 1:

| Origin | Your Power Source | Core |
|--------|------------------|------|
| **Draconic Bloodline** | Dragon ancestor | +1 HP/level, draconic resilience (natural armor), dragon wings at L14 |
| **Wild Magic** | Unstable random source | Wild Magic Surge table (20 effects), Tides of Chaos, Controlled Chaos |
| **Divine Soul** | Direct divine gift | Access Divine spell list, Favored by the Gods (reroll saves/attacks), angelic form L18 |
| **Shadow Magic** � Hound of Ill Omen (spectral wolf summon), Shadow Walk (shadow teleport), Umbral Form (incorporeal) |
| **Storm Sorcery** � lightning/storm power, fly speed in storms, heart of the storm (damage aura) |
| **Lunar Sorcery** � moon phases shift available spells, waxing/waning/full power modes |
| **Aberrant Mind** � psionics + Far Realm touch, telepathy, telekinesis, warp reality |
| **Clockwork Soul** � modrons/Mechanus, restore balance (cancel advantage/disadvantage), bastion of law (absorb chaos) |

---

### WARLOCK
*You wanted power. Something offered it. Now you have both the power and the debt.*

**Core**: Pact Magic (fewer but always-recovering slots), Eldritch Invocations (customizable enhancements), Mystic Arcanum (high-level spell 1/day each)

**Patrons**:

| Patron | What They Are | Flavor |
|--------|--------------|--------|
| **The Fiend** | A powerful devil | Fire, death, unholy deals |
| **The Archfey** | A fey lord/lady | Illusion, charm, emotion, the dangerous beautiful |
| **The Great Old One** | Cosmic entity (Cthulhu-tier) | Telepathy, madness, forbidden knowledge |
| **The Celestial** | An angel or divine radiance | Healing warlock, light magic, angelic gifts |
| **The Hexblade** | A sentient weapon entity | Hexblade's Curse (bonus damage), medium armor, Hex Warrior |
| **The Fathomless** | Ancient ocean entity | Tentacle attack, aquatic mastery, void communication |
| **The Genie** | A noble genie | Bottle sanctuary, 4 genie types = 4 element bonus spells |
| **The Undead** | A powerful undead (lich, vampire, death knight) | Form of Dread, necrotic magic, undying nature |
| **The Undying** | Who has cheated death for eons | Near-immortality, save-against-death |

**Pact Boons** (choose at level 3):
- **Pact of the Chain** � summon familiar (imp, pseudodragon, quasit, sprite, or patron-specific)
- **Pact of the Blade** � summon any weapon from nothing, bond with magic weapon
- **Pact of the Tome** � Book of Shadows (3 extra cantrips from any class)
- **Pact of the Talisman** � magic amulet that helps save vs failure

---

### BARD
*You know a song for everything. You've lived enough to mean it.*

**Core**: Bardic Inspiration (bonus die gift to allies), Jack of All Trades (+half proficiency to everything), Song of Rest, Magical Secrets (steal spells from any class list), Superior Inspiration

**Subclasses (Colleges)** � pick at level 3:

| College | What Kind of Bard | Powers |
|---------|------------------|--------|
| **Lore** | Scholar + generalist | Cutting Words (subtract die from enemy), Additional Magical Secrets |
| **Valor** | Warrior-poet | Combat Inspiration (reaction defense), Extra Attack, Battle Magic |
| **Glamour** | Fey performer | Mantle of Inspiration (temp HP movement), Enthralling Performance, Mantle of Majesty |
| **Swords** � blade-focused, Flourishes (blade attacks with Inspiration dice), Mobile Flourish, Slashing Flourish |
| **Whispers** � shadow operative, Psychic Blades (bonus psychic sneak attack), Shadow Lore (dominate) |
| **Eloquence** � peak persuasion, Unsettling Words (Inspiration subtract on save), Unfailing Inspiration |
| **Creation** � song made real, Performance of Creation (object from air), Animating Performance (dance object to fight) |
| **Spirits** � channel ancestral spirits, Spirit Session (ritual magic), Spiritual Focus, Tales from Beyond |

---

### BLOOD MAGE *(Original Class)*
*The oldest magic. Before words, before symbols � there was blood. Yours is a resource you can always draw on. The question is how much you're willing to spend.*

This class does not exist in standard D&D. We build it.

**Core Mechanic � Blood Price**: Every Blood Mage spell costs HP instead of spell slots. No slots. Instead: spend HP to cast. More HP = more powerful version. You can never run out of magic. You can absolutely run out of life.

**Key Features**:
- Blood Well (bonus HP pool regenerates on short rest, draw from here first)
- Hemomancy cantrips cost nothing (Bloodwhip, Vital Leech, Clot)
- Combat: can spend Reaction to convert incoming damage to fuel a spell
- Healing magic is reversed � spells that normally heal cause damage, spells that damage can heal you

**Subclasses**:
- *The Surgeon* � precision control of blood (stop hearts, reverse poison, surgical precision attacks, can heal others by spending more HP)
- *The Flood* � unleash your blood as a force (area attacks, blood pools as terrain, terrifying to witness)
- *The Bound* � bond with one creature through shared blood (you feel their wounds, they can draw on your power, you are linked in life)

---

### PSION *(Original Class)*
*You found the place inside your mind where physics is just a suggestion. Now it bends when you push.*

**Core Mechanic � Psi Points**: Fuel all abilities. Regenerate on rest. At high level, generate passively.

**Disciplines** (choose at level 1, gain more):
- Telekinesis (move objects, crush, throw)
- Telepathy (read surface thoughts, project thoughts, dominate at high level)
- Clairvoyance (see distant places, sense emotions, true sight)
- Psychoportation (teleport self and others)
- Metacreativity (create objects from ectoplasm)
- Psychometabolism (enhance/modify your own body)

---

### WITCH HUNTER *(Original Class)*
*You know what magic can do. You've seen what it does to the unprepared. Your job is making sure they don't get to finish the spell.*

**Core**: Anti-magic proficiency (advantage on saves vs spells), Spellseeker (detect magic use within 60ft passively), Counter Magic training (+proficiency to counterspell and dispel), Studied Enemy (pick a school of magic: extra damage to users of that school)

**Subclasses**:
- *Inquisitor* � divine authority, interrogation tools, mass area dispel
- *Hexblade Hunter* � fight magic with magic (learn stolen spells), limited casting
- *The Stalker* � pure hunter mechanics, track magic users by their aura, ambush master

---

### RUNESMITH *(Original Class)*
*Words have power in every world. You carve them into iron and stone and bone and the world obeys.*

**Core**: Rune Lore (learn runes from slain creatures and ancient places), Carve (inscribe runes on surfaces or objects, takes time), Activate (trigger runes in combat or exploration), Bind Rune (permanent rune on yourself)

**Rune Types**: Fire (heat and forge), Ice (stasis and cold), Stone (earth and endurance), Storm (lightning and wind), Life (healing and growth), Death (necrosis and horror), Fate (luck and prediction), War (strength and ferocity)

---

### SUMMONER *(Original Class)*
*You don't fight. You manage the things that fight.*

**Core**: Summon Familiar (scales far beyond standard), Binding Contract (summon creatures more powerful than standard summoning spells), Stable Rift (maintain up to 3 active summons instead of 1), Master of Pacts (your summons are more controllable, more loyal, and more powerful than anyone else's)

---

### NON-FANTASY CLASS EQUIVALENTS

Every genre has equivalents that map to the same mechanical chassis:

| Fantasy Class | Military Sci-Fi | Cyberpunk | Post-Apoc | Noir/Mystery |
|---------------|----------------|-----------|-----------|--------------|
| Fighter | Soldier / Marine | Street Samurai | Wastelander | Enforcer |
| Ranger | Scout / Spec Ops | Runner | Hunter | Skip Tracer |
| Rogue | Infiltrator | Netrunner | Scavenger | Private Eye |
| Wizard | Hacker / Techno | AI Contractor | Scientist-Survivor | Mentalist |
| Cleric | Combat Medic | Corporate Fixer | Cult Leader | Spiritualist |
| Paladin | Honor Guard | Corporate Knight | The Righteous | Justiciar |
| Barbarian | Berserker Veteran | Rage Juicer (drug-enhanced) | Feral Survivor | The Unstoppable |
| Druid | Biotech Engineer | Viral Coder | Nature Cult | Naturalist |
| Monk | Martial Arts Master | Street Fighter | Ascetic | The Disciplined |
| Bard | Propogandist / Hacker-Artist | Media Influencer | Storyteller | Journalist |
| Warlock | Black Site Asset | Corp Experiment | Patron-Touched | Occult Operative |
| Sorcerer | Psi-Gifted | Awakened Psion | Irradiated Mutant | Wild Talent |
| Blood Mage | Bioweapon Operative | Splice Extremist | Pain-Speaker | Ritual Killer |

---

##  MULTICLASSING � The Build Is the Character

Multiclassing is not a power-gaming tool. It is a story tool. Your class is what you are. When you add a second class, something happened.

**The Narrative Question**: Why did you multiclass? This is required before the sheet updates. Examples:
- *Fighter / Rogue*: "I ran with criminals for three years before I went legitimate. I still know how to move in the dark."
- *Cleric / Warlock*: "My god abandoned me. Something else was listening."
- *Wizard / Barbarian*: "The rage was there before the magic. The magic is trying to survive the rage."
- *Paladin / Warlock*: The most dramatic combo in D&D. "My oath has the same goals as my patron. For now."

**The DM response**: Acknowledges the multiclass story in the next narrative beat. It matters. It shows. NPCs notice.

**Popular Multiclass Archetypes** (with nicknames):

| Build | Classes | Description |
|-------|---------|-------------|
| **Archer** | Fighter 11 / Ranger 9 | Peak archery. Action Surge + Extra Attack + Hunter's Mark + Archery fighting style |
| **Battle Mage** | Bladesinger 6 / Fighter 5 | DEX-based sword + magic, Extra Attack + Bladesong bonus |
| **Hexblade Warlock/Paladin** | Warlock 5 / Paladin 5 | "Hexadin" � short rest smites, CHA to all saves |
| **Arcane Trickster** (pure) | Rogue 17 / Wizard 3 | The standard AT but deeper |
| **War Cleric/Fighter** | Cleric 1 / Fighter 11 | Heavy armor from level 1, fantastic spell + weapon combo |
| **Draconic Sorcerer/Divine Soul** | Sorcerer 10 / Cleric 2 | Divine + arcane origin, massive spell list |
| **Moon Druid/Barbarian** | Druid 6 / Barbarian 4 | Rage while wildshaped. Yes, really. You become a raging bear |
| **Valor Bard/Paladin** | Bard 10 / Paladin 2 | Smite with Bardic Inspiration, Aura of Protection |
| **Shadow Monk/Rogue** | Monk 9 / Rogue 3 | Stunning Strike + Sneak Attack for assassination |
| **Witch Hunter/Eldritch Knight** | Original 6 / Fighter 5 | Anti-magic fighter with Action Surge counterspell |
| **The Gish** | Wizard 5 / Fighter 5 | Pure Battle Mage: Extra Attack + Fireball same turn |
| **The Face** | Bard 6 / Warlock 2 | CHA maximum, Agonizing Blast, expertise in everything social |

**Triple-class**: Allowed, increasingly complex, maximum flavour. Example: Paladin 5 / Warlock 3 / Sorcerer 2 = "The Fallen Star" � divine and infernal and chaotic, smiting with quickened eldritch blasts.

---

##  THE SPELL BROWSER � Your Digital Player's Handbook

> "When you're playing D&D you get to open the book and read all the cool stuff about the spell."

This is one of the best features we build. Not just a list � an **interactive, filterable, AI-annotated spell browser** that makes picking spells feel like treasure hunting.

### The Spell Browser UI

**Filters** (visible on left panel, instant update):
- Class (which class lists include this spell)
- Level (0 = cantrips through 9)
- School (Abjuration / Conjuration / Divination / Enchantment / Evocation / Illusion / Necromancy / Transmutation)
- Damage type (fire / cold / lightning / acid / poison / psychic / necrotic / radiant / force / bludgeoning / piercing / slashing / thunder)
- Casting time (1 action / bonus action / reaction / 1 minute / ritual)
- Range (self / touch / 30ft / 60ft / 90ft / 120ft / 150ft / 300ft / 1 mile / sight / unlimited)
- Concentration (yes / no)
- Save type (STR / DEX / CON / INT / WIS / CHA / no save)
- Component (V / S / M � filter by which components are needed)
- Tags: Utility / Control / Damage / Buff / Debuff / Healing / Social / Exploration / Ritual

**Each spell card shows**:
```

  FIREBALL                            Evocation Lv3   
   1 action   150ft   20ft sphere   DEX save  
   V, S, M (bat guano + sulfur)     Instantaneous 

  A bright streak flashes from your pointing finger   
  to a point you choose within range then blossoms    
  with a low roar into an explosion of flame...       
                                                      
  8d6 fire damage. DEX save for half. Ignites         
  flammable objects. Higher levels: +1d6 per slot.    

   AI INSIGHT                                       
  "The most iconic area spell in the game. Your 5th   
  level slot gets you 10d6 � potentially 60 damage    
  with a bad roll for the enemy. Remember: it ignites 
  EVERYTHING. The oil lamp merchant will not forgive  
  you. The assassin hidden in the hay bales was not   
  expecting this."                                    

   IN YOUR WORLD                                    
  "In the Ashwalker setting, fire magic is associated  
  with the fallen empire. Using Fireball in certain   
  regions will immediately mark you as either a       
  soldier or a war criminal."                         

   SYNERGIES: Web (trap in fire), Grease, Stinking  
  Cloud, Ice Storm (shatter frozen targets after)     
                                                      
   ADD TO SPELLBOOK     COMPARE     VISUALIZE   

```

**Features**:
- **AI Insight** on every spell: tactical advice, memorable uses, warnings
- **In Your World**: world-specific flavor for this spell in YOUR current world
- **Synergies**: which other spells/abilities combine well
- **Visualize**: generate an image of this spell being cast by your character
- **Compare**: put 2-4 spells side-by-side to decide
- **AI Recommend**: "Given your character build and playstyle so far, here are the 5 spells I'd pick at this level"

**Cantrip showcase** � cantrips are permanent, so they get extra attention:
Every cantrip card includes a "What kind of caster does this define?" section. Picking `Vicious Mockery` means something. Picking `Toll the Dead` means something different. The browser tells you.

**Spell slot tracker** integrates: as you add spells to your list, it shows your daily casting budget in real time.

---

##  COMPANION CREATION � Your Band of Brothers

> "Maybe each time we come to a new character joining your band, I get to reroll that character with the same immersive experience."

###  DECIDED: Full Companion Creation � Same System as Player Character

When a companion joins your party, you get to build them. The DM introduces the character narratively � you meet them, there's a scene, you decide if you want them. Then:

**The Companion Builder triggers** � same creation system as player character, adapted:

**What's the same**:
- Full race selection from the world's available ancestries
- Full class + subclass selection
- Stat generation (you roll or choose)
- Equipment selection
- Personality traits / ideal / bond / flaw
- Full portrait generation
- Backstory (the DM provides a seed, you can expand it)
- AI explains every class feature, every ability, every spell

**What's different**:
- Their backstory is seeded by the story � they have a past in this world
- Their class reflects who they've been, not just who they'll be
- Their flaws are plot-active � the DM has already decided how these will matter
- Their bond often connects to the main story or the villain
- You can suggest or fully define them � anywhere on the spectrum

**Companion Types**:

*Active Companions* (in your party, up to 3):
- Full character sheet, full combat participation
- Relationship score tracks (you can damage or strengthen it through choices)
- They have opinions. If you do something they find repugnant, they'll say so. If you do something that aligns with their deepest belief, they'll remember.
- Can die. Permanently. And it will mean something.
- Level up alongside you at the same narrative moments

*Distant Companions* (alive but not traveling with you):
- Track their location and current activity
- Can be contacted (letters, magic, messengers)
- Can be pulled back into active party
- DM may reference them in story � things happen to them

*Lost Companions* (dead or gone):
- Preserved in character history
- Their death shapes the story
- Can appear as ghosts, echoes, dreams
- Their equipment can pass to you or another companion

**Companion Autonomy Levels** (set per companion):
- *Fully Yours*: You control every decision. They're your character.
- *AI-Assisted*: You set personality and intent. Claude plays them in dialogue and combat by default; you can override any moment.
- *NPC-Adjacent*: Claude controls them fully. You've defined who they are and they act accordingly. You watch.
- *Hybrid*: Autonomous in dialogue and exploration, player-controlled in combat.

**The Companion Welcome Scene**:
Every time a new companion joins, the DM writes a proper scene. Not "X joins your party." Something real. Their reason for joining. What they're not saying. The moment you decided to trust each other. This is a story beat. It gets an image generated.

**Companion Development Arcs**:
Each companion has a personal arc running parallel to the main story. Threads that develop, questions that need answers, wounds that need addressing. Like Dragon Age companions, but authored for your specific world. The DM tracks these and weaves them in when the moment is right.

---

##  HEROFORGE INTEGRATION CONCEPT

HeroForge (heroforge.com) lets you design 3D-printed miniatures. Every race above maps to a HeroForge build. The vision:

**Character Sheet  HeroForge Build Guide**:
When you finalize your character, the sheet includes:
- *HeroForge Base*: Which base body type applies
- *Key Features*: Specific features to select (pointed ears, horns, tail, wing type)
- *Equipment*: Weapon type, armor class, shield/offhand
- *Equipment Style*: Style notes (weathered, ornate, primitive, etc.) matching backstory
- *Pose suggestion*: Based on class and personality

Example output:
```
HEROFORGE BUILD GUIDE: Serana the Drow Bladesinger
Base: Elf Female, Medium
Skin: Deep blue-black
Eyes: Solid white glow
Hair: White, flowing, long
Ears: Standard elf pointed (large)
Equipment:
  - Right hand: Rapier (thin, elegant)
  - Left hand: Arcane focus / Book
  - Armor: Light cloth robes, partial chain visible
  - Cloak: Cape, billowing
  - Head: No helmet (leave hair visible)
  - Accessories: Bracers (magical-looking), necklace
Expression: Focused, slight arrogance
Pose: Mid-step, sword raised, one hand gesturing magic
Notes: Drow-style aesthetic � spider web motif on robe hem if available
```

Every character and companion gets this. Print your party.

---

