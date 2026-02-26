# IMPLEMENTATION PLAN — Step-by-Step Programming Guide
**AI RPG Project** | Master Coding Reference  
**Last Updated**: 2026-02-25  
**Target Platform**: Vercel (Next.js 14 App Router)  
**Coding Agent**: Claude Opus 4.6

---

## HOW TO USE THIS DOCUMENT

This is the **authoritative programming plan**. Every phase, step, file, and interface is listed here. The coding agent should:

1. Work **one phase at a time**, completing all steps before moving on
2. Reference the linked design doc for each system's full specification
3. Run `npm run build` after each phase to catch errors
4. Commit after each phase with a descriptive message
5. Deploy to Vercel and smoke-test after Phases 1, 3, 5, 7, 10

**Each step includes**: what to build, which files to create/modify, which design doc to reference, acceptance criteria, and dependencies on prior steps.

---

## CURRENT CODEBASE INVENTORY

### What Already Exists (Working)
```
lib/ai-orchestrator.ts      — Full model routing, stream/call/JSON helpers, image gen, cost tracking
lib/store.ts                 — Zustand store (basic: character, messages, location, quests)
app/page.tsx                 — Landing page (3-card menu)
app/layout.tsx               — Root layout (Inter font, metadata)
app/globals.css              — Tailwind base, .btn-primary, .btn-secondary, .card, .input-field
app/character/new/page.tsx   — Basic character creation (name, 6 classes, stat roll, starter items)
app/game/page.tsx            — Chat interface (streaming Claude DM, toggleable stats sidebar)
app/game/continue/page.tsx   — Redirect: saved char → /game, else → /character/new
app/about/page.tsx           — Static info page
app/api/dm/route.ts          — Streaming DM endpoint (Claude only, basic system prompt)
app/api/generate-image/route.ts — Image generation endpoint (not connected to any UI)
tailwind.config.js           — Custom colors (primary/dark), fonts (Cinzel/Merriweather — not loaded)
next.config.js               — Strict mode, API CORS headers
vercel.json                  — Standard Next.js config
package.json                 — next 14, react 18, zustand, anthropic sdk, openai sdk, lucide-react
```

### What Does NOT Exist Yet
- No database (Supabase)
- No world generation
- No TypeScript type system (beyond basic Character/Message)
- No combat engine
- No quest system
- No inventory/item system
- No crafting
- No NPC persistence
- No map rendering
- No image display in UI
- No dice rolling
- No markdown rendering in chat
- No character sheet UI (tabs, paper doll, etc.)
- No audio/TTS
- No save system beyond localStorage
- No Hall of Heroes

---

## PHASE 0 — PROJECT FOUNDATION & TYPE SYSTEM
**Goal**: Establish the TypeScript type system, project structure, and database schema that everything else builds on.  
**Duration estimate**: 1 session  
**Dependencies**: None  
**Deploy after**: No (nothing visible yet)

### Step 0.1 — Project Directory Structure
Create the full directory tree. All future code goes into these directories.

```
Create directories:
  lib/types/              — All TypeScript interfaces
  lib/engines/            — Game logic engines (combat, quest, crafting, etc.)
  lib/services/           — External service wrappers (Supabase, AI, image storage)
  lib/prompts/            — AI system prompts (organized by task)
  lib/utils/              — Utility functions (dice, formatters, validators)
  components/             — Shared React components
  components/ui/          — Base UI components (buttons, modals, cards, bars)
  components/game/        — Game-specific components (chat, combat, map)
  components/character/   — Character sheet, creation, paper doll
  components/inventory/   — Item cards, equipment, crafting
  hooks/                  — Custom React hooks
```

**Files to create**:
- `lib/types/index.ts` — barrel export for all types
- `components/ui/index.ts` — barrel export for UI components

**Acceptance criteria**: `npm run build` passes with empty barrel files.

---

### Step 0.2 — Core Type System
Create the foundational TypeScript interfaces that every system references. These are the contracts that all code must satisfy.

**Reference docs**: BRAINSTORM.md (WorldRecord, Quest), PLAYER-HANDBOOK.md (character types)

**Files to create**:

#### `lib/types/world.ts`
```typescript
// WorldRecord, WorldType, MagicSystem, Era, Legend, Faction, Region,
// Threat, Artifact, Prophecy, VillainProfile, OriginScenario,
// NarrativeTone, Genre
// → Copy/refine from BRAINSTORM.md lines 55-95
```

#### `lib/types/character.ts`
```typescript
// Full Character interface (replacing store.ts's minimal version):
//   - id, worldId, name, race, class, subclass, level, xp
//   - abilityScores (STR/DEX/CON/INT/WIS/CHA with base + modifier)
//   - hitPoints (current, max, temporary, hitDice)
//   - armorClass, initiative, speed, proficiencyBonus
//   - savingThrows, skills (all 18 D&D skills with proficiency flag)
//   - spellcasting (spellSlots, knownSpells, preparedSpells)
//   - features (class features, racial traits, story-earned abilities)
//   - equipment (equipped items by slot)
//   - inventory (backpack items)
//   - gold, background, alignment, personality traits
//   - companionIds[], activeCompanionId
//   - conditions/status effects
//   - exhaustionLevel (0-6)
//   - deathSaves (successes, failures)
// → Reference PLAYER-HANDBOOK.md for full stat blocks
```

#### `lib/types/combat.ts`
```typescript
// CombatState, CombatMode ('detailed' | 'quick'),
// Initiative, Turn, CombatAction, CombatResult,
// Condition (poisoned, stunned, etc.), DamageType,
// AttackRoll, SavingThrow, SpellCast
// → Reference BRAINSTORM.md Combat System section
```

#### `lib/types/items.ts`
```typescript
// Item (from BRAINSTORM.md Inventory section):
//   - id, name, type, subtype, rarity, description
//   - stats (damage, armorClass, bonuses, properties)
//   - requirements (level, class, ability scores)
//   - flavorText, loreText, imageUrl
//   - equippable, equipSlot, stackable, quantity
//   - value (buy/sell price)
//   - enchantments, sockets
//   - craftingRecipe reference
// Rarity enum: Common, Uncommon, Rare, VeryRare, Epic, Legendary, Mythic, Artifact
// EquipSlot enum: head, neck, shoulders, chest, hands, waist, legs, feet,
//                  mainHand, offHand, ring1, ring2, trinket1, trinket2
```

#### `lib/types/npc.ts`
```typescript
// NPC interface (from BRAINSTORM.md NPC System):
//   - id, worldId, name, race, role, description
//   - personality, motivation, secrets
//   - relationship (with player: -100 to +100)
//   - attitude tier (hostile/unfriendly/neutral/friendly/allied)
//   - location, isAlive, isCompanion
//   - dialogueHistory, memories of player actions
//   - stats (if combatant): simplified stat block
//   - voiceProfile (for TTS)
//   - portraitUrl
// → Reference BRAINSTORM.md NPC System, ECONOMY-SYSTEM.md (Merchant extends NPC)
```

#### `lib/types/quest.ts`
```typescript
// Quest (from BRAINSTORM.md Quest Architecture):
//   - id, worldId, type, title, logline, fullDescription, secretTruth
//   - primaryGenre, subGenres, tone
//   - acts[], keyDecisionPoints[], possibleEndings[]
//   - status, choices[], outcome
//   - feedsIntoMainQuest, unlocksWorlds
// QuestAct, Choice, Ending interfaces
```

#### `lib/types/map.ts`
```typescript
// All map interfaces from MAP-SYSTEM.md:
//   WorldMap, GeographyData, Region, RegionalMap, Settlement,
//   DungeonLayout, DungeonFloor, DungeonRoom, RoomConnection,
//   TacticalMap, TacticalCell, TacticalFeature
```

#### `lib/types/encounter.ts`
```typescript
// From ENCOUNTER-SYSTEM.md:
//   ThreatAssessment, EnemyStatBlock, EnemyAttack, EnemyTactics,
//   EncounterSeed, WaveEncounter, BossEnemy, BossPhase,
//   CombatRewards, BestiaryEntry, LootGeneration
```

#### `lib/types/exploration.ts`
```typescript
// From EXPLORATION-SYSTEM.md:
//   GameClock, TimeOfDay, Season, Weather, WeatherCondition,
//   TravelPace, NavigationCheck, TerrainType, TravelResources,
//   TravelDiscovery
```

#### `lib/types/economy.ts`
```typescript
// From ECONOMY-SYSTEM.md:
//   Merchant, MerchantInventory, MerchantItem, HaggleAttempt,
//   PriceModifier, Property, GamblingGame, GoldSink
```

#### `lib/types/session.ts`
```typescript
// From SESSION-STRUCTURE.md:
//   SessionStructure, SessionOpening, PacingState, Chronicle,
//   ChronicleEntry, SessionClosing, CharacterLegacy,
//   HallOfHeroesEntry, NewGamePlus, SaveState
```

#### `lib/types/stealth.ts`
```typescript
// From STEALTH-AND-TRAPS.md:
//   StealthCheck, StealthModifier, AlertLevel, AmbushSetup,
//   Trap, TrapEffect, PlayerTrap, Lock
```

#### `lib/types/rest.ts`
```typescript
// From REST-AND-DOWNTIME.md:
//   RestState, ExhaustionState, ActiveCondition, CampSetup,
//   WatchShift, WatchEvent, DowntimeResult, TrainingSession
```

#### `lib/types/ui.ts`
```typescript
// From CHARACTER-SHEET-UI.md:
//   OverviewTab, ResourceBar, PaperDoll, EquipSlot,
//   PartyMemberDetail, ResponsiveLayout, CharacterSheetAnimations
```

**Acceptance criteria**: All types compile. `lib/types/index.ts` exports everything. `npm run build` passes.

---

### Step 0.3 — Supabase Setup
Set up the database that persists all game state.

**Install**:
```bash
npm install @supabase/supabase-js
```

**Files to create**:

#### `lib/services/supabase.ts`
```typescript
// Supabase client singleton
// createClient(url, anonKey) using env vars
// SUPABASE_URL and SUPABASE_ANON_KEY in .env
```

#### `lib/services/database.ts`
```typescript
// Database service with typed methods:
//   Worlds: createWorld(), getWorld(), updateWorld()
//   Characters: createCharacter(), getCharacter(), updateCharacter(),
//               listCharacters(), deleteCharacter()
//   Messages: saveMessage(), getMessages(), getRecentMessages(limit)
//   Items: saveItem(), getInventory(), updateItem(), deleteItem()
//   NPCs: createNPC(), getNPC(), updateNPC(), getWorldNPCs()
//   Quests: createQuest(), getQuest(), updateQuest(), getActiveQuests()
//   Images: saveImageRecord(), getImages()
//   Chronicle: saveEntry(), getChronicle()
//   SaveStates: createSave(), loadSave(), listSaves()
```

**Supabase schema** (create via Supabase Dashboard SQL editor):

```sql
-- Table: worlds
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- browser fingerprint or auth ID
  world_name TEXT NOT NULL,
  world_data JSONB NOT NULL,  -- Full WorldRecord as JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: characters
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_data JSONB NOT NULL,  -- Full Character as JSON
  is_active BOOLEAN DEFAULT true,
  is_retired BOOLEAN DEFAULT false,
  play_time_minutes INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: messages (conversation history)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  role TEXT NOT NULL,  -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  metadata JSONB,  -- { location, combat_state, etc. }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_character ON messages(character_id, created_at);

-- Table: npcs
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  npc_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: items
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  item_data JSONB NOT NULL,
  is_equipped BOOLEAN DEFAULT false,
  equip_slot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  quest_data JSONB NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: images
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,  -- 'portrait' | 'npc' | 'item' | 'location' | 'scene'
  prompt TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: chronicle_entries
CREATE TABLE chronicle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  entry_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: save_states
CREATE TABLE save_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  save_type TEXT NOT NULL,  -- 'auto' | 'quick' | 'manual'
  save_data JSONB NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: bestiary
CREATE TABLE bestiary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  creature_key TEXT NOT NULL,
  knowledge_tier INTEGER DEFAULT 1,
  entry_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for images (create via Dashboard)
-- Bucket name: rpg-images
-- Public: true (for image URLs)
```

**Update `.env`** (add):
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**Create SQL migration file**: `supabase/schema.sql` (the SQL above, for reference)

**Acceptance criteria**: Supabase project created, tables exist, `lib/services/supabase.ts` connects, `database.ts` compiles with typed methods.

---

### Step 0.4 — Utility Functions

#### `lib/utils/dice.ts`
```typescript
// roll(sides: number): number — roll a single die
// rollMultiple(count: number, sides: number): number[] — roll N dice
// rollWithModifier(sides: number, modifier: number): { roll, modifier, total }
// rollAbilityScore(): number — 4d6 drop lowest
// rollInitiative(dexMod: number): number
// d20(): number — convenience
// advantage(): number — roll 2d20, take higher
// disadvantage(): number — roll 2d20, take lower
// rollDamage(formula: string): number — parse "2d6+3" and roll it
```

#### `lib/utils/formatters.ts`
```typescript
// formatModifier(mod: number): string — "+2" or "-1"
// formatHP(current: number, max: number): string
// formatGold(amount: number): string
// formatTimeOfDay(time: TimeOfDay): string
// formatDate(clock: GameClock): string
// truncateText(text: string, maxLength: number): string
```

#### `lib/utils/calculations.ts`
```typescript
// getAbilityModifier(score: number): number — (score - 10) / 2 floor
// getProficiencyBonus(level: number): number — +2 to +6
// getArmorClass(character: Character): number
// getInitiativeBonus(character: Character): number
// getPassivePerception(character: Character): number
// getCarryCapacity(strength: number): number
// calculateXPThreshold(level: number): number
// getSpellSaveDC(character: Character): number
// getSpellAttackBonus(character: Character): number
```

**Acceptance criteria**: All utility functions pass unit logic (manual test or quick script). Build passes.

---

### Step 0.5 — Update Zustand Store
Replace the minimal `lib/store.ts` with a comprehensive game state store.

**Modify**: `lib/store.ts`

```typescript
// The store expands to contain:
// 1. characters: Character[] — all created characters
// 2. activeCharacterId: string | null
// 3. activeWorld: WorldRecord | null
// 4. messages: Message[] — current session messages
// 5. combatState: CombatState | null — active combat or null
// 6. gameClock: GameClock — in-game time
// 7. weather: Weather — current weather
// 8. sessionState: SessionStructure — current session tracking
// 9. pacingState: PacingState — AI pacing metrics
// 10. uiState: { sidebarOpen, activeTab, characterSheetOpen, mapOpen, etc. }
//
// Actions for each subsystem (set/update/reset)
// Persist to localStorage as before (fast cache)
// Sync to Supabase on key events (save points)
//
// Keep it modular with Zustand slices if it gets too large
```

**Acceptance criteria**: Store compiles with new types. Existing pages still work with adapted fields.

---

## PHASE 1 — WORLD GENESIS & CHARACTER CREATION
**Goal**: When a player creates a character, Claude Opus generates an entire unique world and an original opening scene. This is the "wow" moment.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 0  
**Deploy after**: Yes — first deployable milestone

### Step 1.1 — World Genesis System Prompts

**Files to create**:

#### `lib/prompts/world-genesis.ts`
```typescript
// Export: WORLD_GENESIS_SYSTEM_PROMPT
// A detailed system prompt for Claude Opus that instructs it to:
//   1. Generate a complete WorldRecord as JSON
//   2. Include: world name, type, magic system, technology level, cosmology
//   3. Generate 3-5 historical eras, 4-8 factions, geography/regions
//   4. Create the central threat, villain, and optional prophecy/artifact
//   5. Determine the player character's role in this world
//   6. Create the first NPC the player meets
//   7. Set narrative tone, genre blends, thematic core
//
// The prompt must emphasize:
//   - EVERYTHING is original, never repeated
//   - The world must feel REAL, with internal consistency
//   - The villain must be complex, not cartoonish
//   - Output MUST be valid JSON matching WorldRecord interface
//
// The prompt receives: character name, race, class, background,
//   optional player sentence (the "one sentence" from BRAINSTORM.md)
```

#### `lib/prompts/opening-scene.ts`
```typescript
// Export: OPENING_SCENE_SYSTEM_PROMPT
// Instructs Claude Opus to write the opening scene:
//   - Receives: WorldRecord + Character
//   - Writes 3-5 paragraphs of immersive narrative prose
//   - Introduces the world through the character's eyes
//   - Presents the first NPC
//   - Ends with 3-5 action choices for the player
//   - Sets the genre's DM voice (literary author style per genre)
//   - Establishes the mood, stakes, and hook
```

**Acceptance criteria**: Prompt files export well-structured strings. No AI calls yet.

---

### Step 1.2 — World Genesis API Route

**Files to create**:

#### `app/api/world-genesis/route.ts`
```typescript
// POST endpoint
// Input: { character: CharacterCreationInput, playerSentence?: string }
// Process:
//   1. Call Claude Opus with WORLD_GENESIS_SYSTEM_PROMPT
//   2. Parse response as WorldRecord JSON (callClaudeJSON)
//   3. Save WorldRecord to Supabase worlds table
//   4. Create Character record in Supabase (linked to world)
//   5. Call Claude Opus with OPENING_SCENE_SYSTEM_PROMPT
//   6. Save opening scene as first message in Supabase
//   7. Return: { worldId, characterId, openingScene, worldSummary }
//
// Error handling: retry once on JSON parse failure, validate WorldRecord shape
// Timeout: maxDuration 60 seconds (world gen is slow but worth it)
```

**Acceptance criteria**: POST to `/api/world-genesis` with minimal character data returns a complete WorldRecord + opening scene. Data persists in Supabase.

---

### Step 1.3 — Enhanced Character Creation Page
Rebuild `app/character/new/page.tsx` to be the "most fun part of the game."

**Reference**: PLAYER-HANDBOOK.md (all 5 creation modes, 35+ races, 17 classes)

**For Phase 1 MVP, implement Creation Mode 2: "The Questionnaire"**  
(Other modes added in later phases)

**Modify**: `app/character/new/page.tsx` → complete rewrite

```
Page flow:
  Step 1: RACE SELECTION
    - Grid of race cards with portraits (placeholder images for now)
    - Show racial traits and ability score bonuses
    - Categories: Common (Human, Elf, Dwarf, etc.) → Uncommon → Exotic
    - Each race has a 1-line description and stat summary
    
  Step 2: CLASS SELECTION
    - Grid of class cards with icons
    - Show core features, hit die, primary stats
    - All 12 D&D + 5 original classes
    - Highlight recommended classes for chosen race
    
  Step 3: ABILITY SCORES
    - Standard Array / Point Buy / Roll (3 sub-options)
    - Visual display of 6 stats with modifiers
    - Racial bonuses applied automatically
    - Show derived stats (AC, HP, initiative, etc.)
    
  Step 4: BACKGROUND & PERSONALITY
    - Background selection (Soldier, Scholar, Criminal, etc.)
    - Personality traits (2 from a suggested list or custom)
    - Ideal, Bond, Flaw (D&D 5e style)
    - Starting equipment from background
    
  Step 5: APPEARANCE & STORY HOOK
    - Name input
    - Brief physical description (text input)
    - The "one sentence" optional input
    - Preview card showing full character summary
    
  Step 6: WORLD GENERATION
    - "Creating your world..." loading screen
    - Animated progress (show flavor text during wait)
    - Call /api/world-genesis
    - On success: redirect to /game with opening scene
```

**Components to create**:
- `components/character/RaceSelector.tsx`
- `components/character/ClassSelector.tsx`
- `components/character/AbilityScoreRoller.tsx`
- `components/character/BackgroundSelector.tsx`
- `components/character/CharacterPreview.tsx`
- `components/character/WorldGenLoading.tsx`

**Acceptance criteria**: Player can fully create a character through multi-step flow, world is generated, and game begins with a unique opening scene.

---

### Step 1.4 — Context-Aware DM Route
Upgrade the DM API to use full world context.

**Modify**: `app/api/dm/route.ts` → major rewrite

```typescript
// The DM route now:
//   1. Receives: { messages, characterId, worldId }
//   2. Loads from Supabase: WorldRecord, Character, recent messages (last 50)
//   3. Builds a massive system prompt containing:
//       - World bible (factions, geography, magic rules, current conflicts)
//       - Character sheet (stats, inventory, conditions, quest log)
//       - Story state (active quests, NPC relationships, recent chronicle)
//       - Current context (location, time of day, weather, combat state)
//       - DM instructions (genre voice, pacing guidelines, what to do/not do)
//   4. Streams Claude Opus response
//   5. After response completes: save assistant message to Supabase
//   6. Parse any structured data from response (location changes, item gains, etc.)
//
// System prompt structure (lib/prompts/dm-system.ts):
//   Section 1: WHO YOU ARE (the DM's role and voice)
//   Section 2: THE WORLD (world bible summary)
//   Section 3: THE CHARACTER (full sheet)
//   Section 4: CURRENT STATE (location, time, weather, combat)
//   Section 5: STORY STATE (active quests, NPC relationships)
//   Section 6: RULES (how to handle combat, skills, magic, etc.)
//   Section 7: RESPONSE FORMAT (how to structure output)
```

**Files to create**:
- `lib/prompts/dm-system.ts` — the master DM system prompt builder
- `lib/services/context-builder.ts` — fetches all data from Supabase and assembles context

**Acceptance criteria**: The DM knows the world, remembers past conversations via Supabase, and stays in character for the genre.

---

## PHASE 2 — GAME INTERFACE OVERHAUL
**Goal**: Transform the basic chat interface into an immersive game screen with proper layout, markdown rendering, dice rolling, and the character sheet panel.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 1  
**Deploy after**: Yes

### Step 2.1 — Base UI Components

**Files to create**:
- `components/ui/Button.tsx` — styled button with variants (primary, secondary, danger, ghost)
- `components/ui/Modal.tsx` — reusable modal dialog
- `components/ui/Card.tsx` — card container with header/body/footer
- `components/ui/ProgressBar.tsx` — animated bar (HP, XP, etc.)
- `components/ui/Badge.tsx` — rarity-colored badges
- `components/ui/Tooltip.tsx` — hover tooltips
- `components/ui/Tabs.tsx` — tab navigation component
- `components/ui/Dropdown.tsx` — select/dropdown
- `components/ui/Toast.tsx` — notification toasts
- `components/ui/Spinner.tsx` — loading spinner
- `components/ui/IconButton.tsx` — icon-only button

**Install**:
```bash
npm install react-markdown remark-gfm
```

**Acceptance criteria**: All components render correctly, are responsive, and use the dark RPG theme.

---

### Step 2.2 — Game Layout Overhaul
Rebuild `app/game/page.tsx` as a proper game interface.

**Reference**: CHARACTER-SHEET-UI.md (layout spec)

```
Desktop Layout (≥1024px):
┌─────────────────────────────────────────────────┐
│ TOP BAR: Location │ Time │ Weather │ Menu       │
├──────────────────────────────┬──────────────────┤
│                              │                  │
│  MAIN CONTENT AREA           │  CHARACTER SHEET  │
│  (Chat / Combat / Map)       │  (350px sidebar)  │
│                              │  5 tabs           │
│                              │                  │
├──────────────────────────────┴──────────────────┤
│ INPUT BAR: Text input │ Quick Actions │ Send     │
└─────────────────────────────────────────────────┘

Mobile Layout (<768px):
  - Full-width chat
  - Character sheet = full-screen overlay (swipe or button)
  - Top bar collapses to icons
```

**Files to create/modify**:
- `app/game/layout.tsx` — game-specific layout wrapper
- `app/game/page.tsx` — complete rewrite with new layout
- `components/game/TopBar.tsx` — location, time, weather, menu
- `components/game/ChatArea.tsx` — message display with markdown rendering
- `components/game/MessageBubble.tsx` — individual message (DM vs player styling)
- `components/game/InputBar.tsx` — text input with quick action buttons
- `components/game/QuickActions.tsx` — common actions (rest, inventory, map, etc.)

**Acceptance criteria**: Game screen renders with proper layout on desktop and mobile. Chat displays with markdown. Top bar shows location/time. Character sheet toggles.

---

### Step 2.3 — Markdown & Rich Text in Chat
DM responses should render with proper formatting.

**Modify**: `components/game/MessageBubble.tsx`

```
Features:
  - Render markdown (bold, italic, headers, lists, blockquotes)
  - Style DM messages with a distinct visual treatment (parchment-like background?)
  - Player messages styled differently (simpler, darker)
  - System messages (dice rolls, combat results) have their own style
  - Inline images render when the DM includes them
  - Action choices render as clickable buttons when DM presents options
  - Dice roll results highlighted with special formatting
```

**Acceptance criteria**: Markdown renders properly. Action choices are clickable. Messages are visually distinct by role.

---

### Step 2.4 — Character Sheet Panel (5 Tabs)
Build the full character sheet as a sidebar panel.

**Reference**: CHARACTER-SHEET-UI.md (complete spec with wireframes)

**Files to create**:
- `components/character/CharacterSheet.tsx` — main panel with tab navigation
- `components/character/OverviewTab.tsx` — portrait, name, level, HP/mana bars, ability scores, conditions
- `components/character/AbilitiesTab.tsx` — class features, spells (card view), racial traits
- `components/character/InventoryTab.tsx` — paper doll equipment + backpack grid + gold
- `components/character/JournalTab.tsx` — quest log, chronicle entries, lore notes
- `components/character/PartyTab.tsx` — companion cards with tactics settings

**Sub-components**:
- `components/character/HPBar.tsx` — animated HP/damage/heal bar
- `components/character/AbilityScoreBlock.tsx` — single ability with score + modifier
- `components/character/SpellCard.tsx` — expandable spell detail
- `components/character/ItemCard.tsx` — inventory item with rarity border
- `components/character/PaperDoll.tsx` — equipment display on character silhouette
- `components/character/QuestTracker.tsx` — active quest with progress bar
- `components/character/CompanionCard.tsx` — party member summary

**Acceptance criteria**: All 5 tabs render with character data. Paper doll shows equipped items. HP bar animates on changes. Responsive for mobile.

---

### Step 2.5 — Dice Rolling System

**Reference**: BRAINSTORM.md (Dice Rolling System section)

**Files to create**:
- `components/game/DiceRoller.tsx` — visual dice roll display
- `components/game/DiceResult.tsx` — shows roll result with breakdown

```
Implementation:
  - When the DM determines a check is needed, it returns a structured
    JSON block embedded in the response: { "diceCheck": { "type": "ability",
    "ability": "STR", "dc": 15, "skill": "Athletics" } }
  - The UI presents the roll to the player with a "Roll" button
  - Animated dice roll (2D animation — CSS transitions, number spin)
  - Result displayed: "Athletics (STR): [d20: 14] + 3 = 17 vs DC 15 — SUCCESS!"
  - Result sent back to DM as context in next message
  - Player can also type "I want to roll Perception" to trigger a check
```

**Acceptance criteria**: Dice rolls trigger visually, results display clearly, and feed back into the DM conversation.

---

## PHASE 3 — IMAGE SYSTEM & VISUAL IDENTITY
**Goal**: Generate and persist images. Character portraits, NPCs, locations, and items display in-game.  
**Duration estimate**: 1 session  
**Dependencies**: Phase 1 (Supabase), Phase 2 (UI)  
**Deploy after**: Yes

### Step 3.1 — Image Storage Service

**Files to create**:

#### `lib/services/image-store.ts`
```typescript
// Image lifecycle:
//   1. generateAndStore(task, prompt, characterId, type, metadata)
//      - Call generateImage() from ai-orchestrator
//      - Download image from OpenAI temporary URL
//      - Upload to Supabase Storage (rpg-images bucket)
//      - Save record to images table
//      - Return permanent Supabase URL
//
//   2. getImage(characterId, type, referenceId)
//      - Check if image already exists in DB
//      - Return URL if found (never regenerate unless requested)
//
//   3. regenerateImage(imageId)
//      - Re-run stored prompt
//      - Replace in storage + update DB record
```

**Acceptance criteria**: Images generate, persist to Supabase Storage, and return permanent URLs. No broken images after 1 hour (OpenAI URL expiry bypassed).

---

### Step 3.2 — Character Portrait Generation
Generate a portrait at character creation.

**Modify**: `app/api/world-genesis/route.ts` — add portrait generation step

```
After world genesis:
  1. Build portrait prompt from character description + race + class + genre art style
  2. Call generateAndStore('image_character', prompt, characterId, 'portrait')
  3. Save portraitUrl to character record
```

**Files to create**:
- `lib/prompts/image-prompts.ts` — prompt builders for all image types (portrait, NPC, item, location, scene)

**Acceptance criteria**: Every new character has a generated portrait stored permanently.

---

### Step 3.3 — Image Display Components

**Files to create**:
- `components/ui/GameImage.tsx` — image display with loading state, zoom, and regenerate button
- `components/game/SceneImage.tsx` — full-width scene illustration in chat
- `components/character/Portrait.tsx` — character portrait card

**Modify**: `components/game/MessageBubble.tsx` — render images inline when DM triggers them

**Acceptance criteria**: Images display in chat and character sheet. Loading states work. Regenerate button functions.

---

### Step 3.4 — NPC Portrait Generation
When the DM introduces a named NPC, auto-generate their portrait.

**Files to create**:

#### `app/api/generate-npc-portrait/route.ts`
```typescript
// POST: { npcId, npcDescription, genre }
// Generate portrait + save to Supabase
// Return: { portraitUrl }
```

**Modify**: DM system prompt to indicate when a new named NPC is introduced (structured data in response), triggering portrait generation on the client.

**Acceptance criteria**: New NPCs get portraits that display in chat and in the party/NPC panel.

---

## PHASE 4 — COMBAT ENGINE
**Goal**: Full tactical combat system with initiative, turns, conditions, and two combat modes (detailed and quick).  
**Duration estimate**: 2-3 sessions  
**Dependencies**: Phase 2 (UI), Phase 0 (types)  
**Deploy after**: Yes — major gameplay milestone

### Step 4.1 — Combat State Machine

**Reference**: BRAINSTORM.md Combat System (500+ lines of combat design)

**Files to create**:

#### `lib/engines/combat-engine.ts`
```typescript
// Core combat state machine:
//
// States: IDLE → INITIATIVE → COMBAT_ACTIVE → TURN_START →
//         PLAYER_ACTION → ACTION_RESOLUTION → TURN_END →
//         (loop to TURN_START or → COMBAT_END) → IDLE
//
// Methods:
//   startCombat(party: Character[], enemies: EnemyStatBlock[]): CombatState
//   rollInitiative(combatState): CombatState — sort turn order
//   getAvailableActions(combatState, characterId): CombatAction[]
//   executeAction(combatState, action): { newState, narration, rolls }
//   processConditions(combatState): CombatState — tick conditions
//   checkCombatEnd(combatState): { ended, result: 'victory'|'defeat'|'fled' }
//   endCombat(combatState): CombatRewards
//
// Action types:
//   attack, castSpell, useItem, dodge, dash, disengage, hide,
//   help, ready, grapple, shove, interact, flee
//
// Handles:
//   - Attack rolls with advantage/disadvantage
//   - Damage rolls with type (slashing, fire, etc.)
//   - Saving throws
//   - Conditions (stunned, poisoned, frightened, etc.)
//   - Concentration checks
//   - Death saving throws
//   - Opportunity attacks
//   - Area of effect spells
```

**Acceptance criteria**: Combat engine can run a full combat encounter end-to-end with correct D&D 5e-like mechanics.

---

### Step 4.2 — Combat API Routes

**Files to create**:

#### `app/api/combat/start/route.ts`
```typescript
// POST: { characterId, encounterSeed }
// 1. Use AI (Claude Sonnet) to generate enemy stat blocks from encounter seed
// 2. Initialize combat state
// 3. Roll initiative
// 4. Generate combat narration for the opening
// 5. Return: { combatState, narration, availableActions }
```

#### `app/api/combat/action/route.ts`
```typescript
// POST: { combatState, action }
// 1. Validate action is available
// 2. Execute via combat engine
// 3. Process enemy turns (AI decides enemy actions via Claude Sonnet)
// 4. Generate narration for what happened
// 5. Check combat end
// 6. Return: { updatedCombatState, narration, nextAvailableActions }
```

#### `app/api/combat/enemy-turn/route.ts`
```typescript
// POST: { combatState, enemy }
// Claude Sonnet picks the enemy's action based on its tactics profile
// Returns: { action, reasoning }
```

**Acceptance criteria**: Combat can be initiated, actions resolve correctly, enemies act intelligently, combat ends with rewards.

---

### Step 4.3 — Combat UI (Mode A: Detailed)

**Reference**: BRAINSTORM.md Mode A combat spec, ENCOUNTER-SYSTEM.md

**Files to create**:
- `components/game/CombatView.tsx` — main combat container (replaces chat during combat)
- `components/game/InitiativeTracker.tsx` — turn order display
- `components/game/CombatActions.tsx` — action button grid with all available actions
- `components/game/CombatLog.tsx` — scrolling log of combat events with dice results
- `components/game/TargetSelector.tsx` — click to select target
- `components/game/ConditionTracker.tsx` — active conditions display
- `components/game/CombatHeader.tsx` — round number, current turn, combat summary

```
Mode A Layout:
┌────────────────────────────────────────┐
│ Round 3 │ Kael's Turn │ 4 enemies      │
├──────────────────────┬─────────────────┤
│                      │ INITIATIVE      │
│  COMBAT NARRATION    │ > Kael (18)     │
│  (scrolling log      │   Goblin A (15) │
│   of what happened)  │   Lyra (12)     │
│                      │   Goblin B (10) │
│                      │   Goblin C (7)  │
├──────────────────────┴─────────────────┤
│ YOUR ACTIONS:                          │
│ [⚔️ Attack] [🔮 Cast Spell] [🧪 Item] │
│ [🛡️ Dodge] [🏃 Dash] [🤝 Help]       │
│ [🎯 Target: Goblin A ▼]               │
└────────────────────────────────────────┘
```

**Acceptance criteria**: Combat renders with full action selection, initiative tracker, narration log, and target selection. Combats play out fully in the UI.

---

### Step 4.4 — Combat UI (Mode B: Quick)

```
Mode B: Simplified for faster encounters
  - AI narrates the entire combat
  - Player makes key decisions when prompted
  - No initiative tracker or action grid
  - DM writes: "The goblins rush at you! What do you do?"
  - Player responds naturally
  - Dice rolls embedded in narration
```

**Modify**: `components/game/CombatView.tsx` — add mode toggle

**Acceptance criteria**: Quick mode works as enhanced DM narration with occasional player choices. Toggle between modes works.

---

### Step 4.5 — Enemy AI & Encounter Generation

**Reference**: ENCOUNTER-SYSTEM.md (full spec)

**Files to create**:

#### `lib/engines/encounter-generator.ts`
```typescript
// generateEncounter(context: EncounterContext): EncounterSeed
//   - Takes: party level, party size, location, time, story state
//   - Uses AI to generate appropriate encounter
//   - Returns: enemy types, count, difficulty, narrative setup
//
// generateEnemyStatBlock(seed: string, threatLevel: number): EnemyStatBlock
//   - AI generates a full stat block from a concept + desired difficulty
//
// generateBoss(context, questArc): BossEnemy
//   - Multi-phase boss with legendary actions and lair effects
```

**Acceptance criteria**: Encounters generate with appropriate difficulty. Enemies have full stat blocks. Boss fights have phases.

---

## PHASE 5 — INVENTORY, ITEMS & LOOT
**Goal**: Full item system with rarity, equipment slots, loot drops, and the item card UI.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 4 (combat rewards), Phase 3 (item images)  
**Deploy after**: Yes

### Step 5.1 — Item Engine

**Reference**: BRAINSTORM.md Inventory & Items section

**Files to create**:

#### `lib/engines/item-generator.ts`
```typescript
// generateItem(context): Item
//   - AI generates item with name, stats, description, flavor text
//   - Rarity determines stat ranges
//   - Genre affects naming and aesthetics
//
// generateLoot(context: LootGeneration): Item[]
//   - Post-combat loot generation
//   - Rarity weighted by encounter difficulty
//   - Genre-appropriate items
//
// generateShopInventory(merchant: Merchant): MerchantItem[]
//   - Stock appropriate to merchant type and town size
```

#### `lib/engines/equipment-manager.ts`
```typescript
// equipItem(character, item, slot): Character
// unequipItem(character, slot): Character
// getEquipmentBonuses(character): StatBonuses
// canEquip(character, item): { canEquip, reason }
// compareItems(equipped, candidate): ComparisonResult
```

**Acceptance criteria**: Items generate with full stats. Equipment system handles all slots. Loot drops after combat.

---

### Step 5.2 — Inventory UI

**Reference**: CHARACTER-SHEET-UI.md (Inventory tab wireframe)

**Modify**: `components/character/InventoryTab.tsx` — full implementation

**Files to create**:
- `components/inventory/ItemCard.tsx` — card with rarity border, stats, image
- `components/inventory/ItemCompare.tsx` — side-by-side comparison overlay
- `components/inventory/LootPopup.tsx` — animated loot presentation after combat
- `components/inventory/PaperDoll.tsx` — equipment slot visualization

**Acceptance criteria**: Items display with rarity-colored borders. Equip/unequip works. Loot popup shows after combat. Item comparison works.

---

### Step 5.3 — Loot Presentation

**Reference**: BRAINSTORM.md "HOW LOOTING ACTUALLY WORKS" section

```
Loot display sequence:
  1. Combat ends → victory narration
  2. "Search the area?" prompt
  3. Loot reveals one at a time with drama:
     - Common items: simple list
     - Uncommon: brief description
     - Rare+: full card reveal with animation, sound cue, image generation
  4. Gold amount shown
  5. "Take All" or individual select
```

**Acceptance criteria**: Loot presentation matches the tiered drama system. Rare+ items trigger image generation.

---

## PHASE 6 — QUEST & STORY ENGINE
**Goal**: Quest tracking, journal, AI-generated quest arcs, and the chronicle system.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 1 (world/DM), Phase 2 (journal tab)  
**Deploy after**: Yes

### Step 6.1 — Quest Engine

**Reference**: BRAINSTORM.md Quest Architecture

**Files to create**:

#### `lib/engines/quest-engine.ts`
```typescript
// generateMainQuest(world: WorldRecord, character: Character): Quest
//   - Create the main story arc with acts, decision points, endings
//
// generateSideQuest(context): Quest
//   - AI generates a side quest appropriate to location/story state
//
// updateQuestProgress(quest, event): Quest
//   - Track progress through quest acts
//
// completeQuest(quest, outcome): { rewards, worldChanges, chronicleEntry }
//   - Resolve quest, generate rewards, update world state
```

**Acceptance criteria**: Main quest generates at world creation. Side quests generate organically during play. Quest log tracks progress.

---

### Step 6.2 — Chronicle System

**Reference**: SESSION-STRUCTURE.md (Chronicle section)

**Files to create**:

#### `lib/engines/chronicle-engine.ts`
```typescript
// generateChronicleEntry(session, events): ChronicleEntry
//   - AI summarizes what happened in a session
//   - Multiple writing styles (narrator, journal, bardic, etc.)
//
// searchChronicle(characterId, query): ChronicleEntry[]
//   - Search past entries by NPC, location, item, quest
```

**Modify**: `components/character/JournalTab.tsx` — display chronicle entries and quest log

**Acceptance criteria**: Chronicle entries auto-generate. Journal tab shows quests and chronicle. Search works.

---

### Step 6.3 — Session Structure

**Reference**: SESSION-STRUCTURE.md (full spec)

**Files to create**:

#### `lib/engines/session-manager.ts`
```typescript
// startSession(characterId): SessionOpening
//   - Generate recap of last session
//   - Create opening hook
//
// trackPacing(sessionState, event): PacingState
//   - Update tension meter
//   - Suggest encounter type changes to DM
//
// endSession(characterId): SessionClosing
//   - Generate summary
//   - Auto-save
//   - Create cliffhanger or safe-haven ending
```

**Acceptance criteria**: Sessions start with AI-generated recap. Pacing adjusts during play. Clean session endings with summaries.

---

## PHASE 7 — NPC SYSTEM & SOCIAL ENCOUNTERS
**Goal**: NPCs persist, remember, have relationships, and drive social gameplay.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 1 (Supabase/NPCs), Phase 3 (portraits)  
**Deploy after**: Yes

### Step 7.1 — NPC Engine

**Reference**: BRAINSTORM.md NPC System section

**Files to create**:

#### `lib/engines/npc-engine.ts`
```typescript
// createNPC(context): NPC
//   - AI generates name, appearance, personality, motivation, secrets
//   - Portrait generated and stored
//   - Saved to Supabase
//
// updateRelationship(npcId, event): NPC
//   - Modify relationship score based on player actions
//   - Trigger attitude tier changes
//
// getNPCDialogueContext(npc): string
//   - Build context string for DM prompt about this NPC
//   - Include: personality, memories of player, current attitude, secrets
//
// trackNPCMemory(npcId, event): void
//   - NPCs remember what the player did
//   - Affects future dialogue and behavior
```

**Acceptance criteria**: NPCs persist between sessions. Relationship tracking works. NPCs reference past interactions in dialogue.

---

### Step 7.2 — Social Encounter UI

**Reference**: SKILL-CHALLENGES.md (NPC attitude system)

**Files to create**:
- `components/game/NPCPanel.tsx` — shows NPC portrait, name, attitude, relationship bar during conversation
- `components/game/DialogueChoices.tsx` — styled dialogue options with skill check tags

**Acceptance criteria**: NPC conversations display with portrait and attitude indicator. Dialogue choices show relevant skill checks.

---

## PHASE 8 — EXPLORATION & TRAVEL
**Goal**: Travel system, weather, time of day, navigation, and discoverables.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 1 (world), Phase 2 (top bar)  
**Deploy after**: Yes

### Step 8.1 — Game Clock & Weather Engine

**Reference**: EXPLORATION-SYSTEM.md (full spec)

**Files to create**:

#### `lib/engines/clock-engine.ts`
```typescript
// advanceTime(clock: GameClock, hours: number): GameClock
// getTimeOfDay(clock: GameClock): TimeOfDay
// getSeason(clock: GameClock): Season
// isNight(clock: GameClock): boolean
// getTimeEffects(timeOfDay: TimeOfDay): TimeEffects
```

#### `lib/engines/weather-engine.ts`
```typescript
// generateWeather(season: Season, terrain: TerrainType, region?: Region): Weather
// getWeatherEffects(weather: Weather): WeatherEffects
// advanceWeather(current: Weather, hours: number): Weather
// getWeatherNarration(weather: Weather): string
```

**Modify**: `components/game/TopBar.tsx` — display time of day icon, date, weather, location

**Acceptance criteria**: Time advances with actions. Weather changes affect gameplay. Top bar updates in real-time.

---

### Step 8.2 — Travel System

**Reference**: EXPLORATION-SYSTEM.md (Travel section)

**Files to create**:

#### `lib/engines/travel-engine.ts`
```typescript
// planTravel(from, to, method, pace): TravelPlan
//   - Calculate segments, time, resource consumption
//
// processSegment(plan, segment): TravelSegmentResult
//   - Weather check, encounter check, navigation check
//   - Discovery roll, resource consumption
//   - Narrative description
//
// fastTravel(from, to): FastTravelResult
//   - Advance clock, deduct resources, summary narration
//   - Random encounter chance (significant only)
```

**Files to create**:
- `components/game/TravelView.tsx` — travel sequence UI with progress
- `components/game/DiscoveryPopup.tsx` — show discoveries along travel routes

**Acceptance criteria**: Travel between locations works with time passage, resource consumption, and possible encounters. Fast travel available to visited locations.

---

### Step 8.3 — Rest & Camping

**Reference**: REST-AND-DOWNTIME.md (full spec)

**Files to create**:

#### `lib/engines/rest-engine.ts`
```typescript
// shortRest(character): ShortRestResult
//   - Spend hit dice to heal
//   - Recharge short-rest abilities
//
// longRest(character): LongRestResult
//   - Full HP recovery, half hit dice, spell slots
//   - Advance clock 8 hours
//
// setupCamp(party, location): CampSetup
//   - Determine camp quality, assign watches
//   - Campfire activities
//
// processWatch(watch: WatchShift): WatchEvent | null
//   - Random encounter during watch
```

**Files to create**:
- `components/game/RestMenu.tsx` — rest type selection with resource preview
- `components/game/CampScene.tsx` — camping sequence UI

**Acceptance criteria**: Short/long rest works mechanically. Camping has interactive phases. Watch encounters can trigger combat.

---

## PHASE 9 — MAP SYSTEM
**Goal**: Procedural map generation and display at multiple scales.  
**Duration estimate**: 2-3 sessions  
**Dependencies**: Phase 8 (exploration/travel)  
**Deploy after**: Yes

### Step 9.1 — Map Infrastructure

**Install**:
```bash
npm install simplex-noise alea
```

**Reference**: MAP-SYSTEM.md (full spec with algorithms)

**Files to create**:

#### `lib/engines/map-generator.ts`
```typescript
// generateWorldMap(world: WorldRecord): WorldMap
//   - Simplex noise terrain (elevation, moisture, temperature)
//   - Place regions from world bible
//   - SVG rendering with region labels
//
// generateRegionalMap(region: Region): RegionalMap
//   - AI generates location list + placement
//   - Roads, rivers, points of interest
//   - SVG or Canvas rendering
//
// generateDungeon(config): DungeonLayout
//   - BSP for built dungeons, cellular automata for caves
//   - Room connections, doors, traps, treasure
//   - Full fog-of-war (starts completely fogged)
//
// generateTacticalMap(encounter): TacticalMap
//   - Grid-based combat map
//   - Terrain features (cover, difficult terrain, elevation)
```

### Step 9.2 — Map Display Components

**Files to create**:
- `components/game/WorldMap.tsx` — SVG world map with region click targets
- `components/game/RegionalMap.tsx` — regional map with location markers
- `components/game/DungeonMap.tsx` — fog-of-war dungeon map (Canvas)
- `components/game/TacticalMap.tsx` — combat grid overlay
- `components/game/MapOverlay.tsx` — fullscreen map view with zoom/pan

**Acceptance criteria**: World map renders from generated data. Dungeon fog reveals room-by-room. Tactical map shows during combat. Maps are interactive (click locations, zoom).

---

## PHASE 10 — ECONOMY & CRAFTING
**Goal**: Shopping, haggling, crafting, property — the economic gameplay loop.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 5 (items), Phase 7 (NPCs)  
**Deploy after**: Yes

### Step 10.1 — Economy Engine

**Reference**: ECONOMY-SYSTEM.md (full spec)

**Files to create**:

#### `lib/engines/economy-engine.ts`
```typescript
// generateMerchant(context): Merchant
//   - AI creates merchant with personality, inventory, prices
//
// calculatePrice(item, merchant, playerCHA): number
//   - Base price × modifiers (relationship, world events, supply/demand)
//
// haggle(attempt: HaggleAttempt): HaggleResult
//   - CHA check + argument quality affects price
//
// buyItem(character, merchant, item, price): Transaction
// sellItem(character, merchant, item): Transaction
//
// updateMerchantStock(merchant, daysPassed): Merchant
//   - Restock on schedule, rotate inventory
```

### Step 10.2 — Shopping UI

**Files to create**:
- `components/game/ShopView.tsx` — merchant interface with inventory grid
- `components/game/HaggleDialog.tsx` — haggling mini-encounter
- `components/game/PriceTag.tsx` — item price with modifier tooltips

**Acceptance criteria**: Player can browse merchant inventory, haggle, buy/sell. Prices adjust dynamically.

---

### Step 10.3 — Crafting Engine

**Reference**: BRAINSTORM.md Crafting System section

**Files to create**:

#### `lib/engines/crafting-engine.ts`
```typescript
// getAvailableRecipes(character): Recipe[]
// craft(character, recipe, materials): CraftingResult
//   - Success/failure/proc system
//   - WoW-style quality tiers
// discoverRecipe(character, method): Recipe
// getCraftingStations(location): CraftingStation[]
```

**Files to create**:
- `components/game/CraftingView.tsx` — crafting interface
- `components/game/RecipeCard.tsx` — recipe display with materials needed

**Acceptance criteria**: Crafting works with recipes, material requirements, skill checks, and proc chances.

---

## PHASE 11 — STEALTH, TRAPS & SKILL CHALLENGES
**Goal**: Non-combat problem-solving systems.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 4 (combat for trap damage), Phase 7 (NPC social)  
**Deploy after**: Yes

### Step 11.1 — Stealth System

**Reference**: STEALTH-AND-TRAPS.md (full spec)

**Files to create**:

#### `lib/engines/stealth-engine.ts`
```typescript
// calculateStealth(character, modifiers): StealthCheck
// resolveDetection(stealthCheck, observers): DetectionResult
// updateAlertLevel(current: AlertLevel, event): AlertLevel
// setupAmbush(ambushers, position): AmbushSetup
```

### Step 11.2 — Trap System

**Files to create**:

#### `lib/engines/trap-engine.ts`
```typescript
// generateTrap(tier, dungeon): Trap
// detectTrap(character, trap): DetectionResult
// disarmTrap(character, trap, method): DisarmResult
// triggerTrap(trap, targets): TrapDamageResult
// setPlayerTrap(character, trapType, materials): PlayerTrap
```

### Step 11.3 — Skill Challenge System

**Reference**: SKILL-CHALLENGES.md (full spec)

**Files to create**:

#### `lib/engines/skill-challenge-engine.ts`
```typescript
// createChallenge(complexity, context): SkillChallenge
// attemptSkill(challenge, skill, approach): SkillAttemptResult
// getHint(challenge, hintTier): string
// resolveChallenge(challenge): ChallengeOutcome
```

**Files to create**:
- `components/game/SkillChallengeView.tsx` — progress bar with successes/failures
- `components/game/TrapDetection.tsx` — trap discovery and disarm UI

**Acceptance criteria**: Skill challenges run as multi-roll encounters. Traps detect/disarm/trigger with proper mechanics. Stealth works in exploration and combat.

---

## PHASE 12 — AUDIO SYSTEM
**Goal**: Text-to-speech for DM narration, NPC voices, ambient sounds.  
**Duration estimate**: 1 session  
**Dependencies**: Phase 7 (NPC voices)  
**Deploy after**: Yes

### Step 12.1 — TTS Service

**Reference**: BRAINSTORM.md Audio section

**Install**:
```bash
npm install @google-cloud/text-to-speech
```

**Files to create**:

#### `lib/services/tts-service.ts`
```typescript
// Abstract TTS interface (can swap Google → ElevenLabs later):
//   speak(text, voiceProfile): AudioBuffer
//   getAvailableVoices(): Voice[]
//   assignVoiceToNPC(npcId, voiceProfile): void
//
// Google Cloud TTS implementation
// Voice profiles: deep male, female elven, raspy villain, etc.
// The DM narrator has a distinct voice
// Each NPC gets a persistent voice assignment
```

### Step 12.2 — Audio UI

**Files to create**:
- `components/ui/AudioControls.tsx` — volume, mute, TTS toggle
- `hooks/useAudio.ts` — audio playback hook

**Files to modify**:
- `components/game/MessageBubble.tsx` — add "read aloud" button on DM messages
- `components/game/TopBar.tsx` — add audio controls

**Acceptance criteria**: DM narration can be read aloud. NPCs have distinct voices. Audio controls work.

---

## PHASE 13 — HALL OF HEROES & META SYSTEMS
**Goal**: Character select screen, save system, legacy, achievements, NG+.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: Phase 6 (chronicle), Phase 1 (characters)  
**Deploy after**: Yes — final major feature milestone

### Step 13.1 — Hall of Heroes (Character Select)

**Reference**: SESSION-STRUCTURE.md (Hall of Heroes, Legacy), BRAINSTORM.md Meta Systems

**Modify**: `app/page.tsx` — transform landing page into Hall of Heroes

```
Hall of Heroes IS the landing page:
  - Grid of character cards (portrait, name, class, level, world, playtime)
  - Visual style per world genre
  - "New Character" button (prominent)
  - Each character card: [Continue] [View Chronicle] [Retire]
  - Retired characters in "Hall of the Fallen" section (grayed, read-only)
  - Statistics button for meta-stats
```

**Files to create**:
- `components/character/HeroCard.tsx` — character card for Hall of Heroes
- `components/character/RetiredHeroCard.tsx` — fallen/retired hero display

### Step 13.2 — Save System

**Reference**: SESSION-STRUCTURE.md (Save System)

**Files to create**:

#### `lib/services/save-service.ts`
```typescript
// autoSave(characterId): SaveState — triggered at key moments
// quickSave(characterId): SaveState — player-triggered
// manualSave(characterId, label): SaveState
// loadSave(saveId): FullGameState
// listSaves(characterId): SaveState[]
// deleteSave(saveId): void
```

**Files to create**:
- `components/game/SaveMenu.tsx` — save/load interface
- `app/game/continue/page.tsx` — rewrite to use Supabase saves

**Acceptance criteria**: Auto-save at key moments. Manual save works. Loading restores full state. Continue screen shows all saves.

---

### Step 13.3 — Epilogue & Legacy System

**Reference**: SESSION-STRUCTURE.md (Epilogue, Legacy, NG+)

**Files to create**:

#### `lib/engines/legacy-engine.ts`
```typescript
// retireCharacter(characterId): CharacterLegacy
//   - AI generates epilogue narrative
//   - Calculate final statistics
//   - Determine legacy items and world changes
//   - Create Hall of Heroes entry
//
// startNewGamePlus(sourceCharacterId): NGPlusConfig
//   - Determine carryover (1 item, 10% gold, recipes, map knowledge)
//   - Generate world modifications based on previous playthrough
```

**Files to create**:
- `components/character/EpilogueView.tsx` — final narrative + statistics display
- `app/legacy/[characterId]/page.tsx` — full legacy/chronicle read-only view

**Acceptance criteria**: Characters can be retired. Epilogue generates. Legacy items carry to new characters. NG+ works.

---

### Step 13.4 — Achievement System

**Files to create**:

#### `lib/engines/achievement-engine.ts`
```typescript
// checkAchievements(characterId, event): Achievement[]
//   - Check all achievement conditions against event
//   - Return newly earned achievements
//
// getAchievements(userId): { earned, available }
// getLegacyBonuses(userId): LegacyBonus[]
```

**Files to create**:
- `components/ui/AchievementPopup.tsx` — achievement earned notification
- `components/character/AchievementList.tsx` — achievements display

**Acceptance criteria**: Achievements trigger on correct conditions. Display in character profile. Legacy bonuses available to new characters.

---

## PHASE 14 — POLISH, PERFORMANCE & DEPLOYMENT
**Goal**: Production-quality polish, performance optimization, final Vercel deployment configuration.  
**Duration estimate**: 1-2 sessions  
**Dependencies**: All previous phases  
**Deploy after**: Yes — production release

### Step 14.1 — Fonts & Typography

**Modify**: `app/layout.tsx`
```
  - Load Cinzel (headers/fantasy UI) and Merriweather (body/narrative) via next/font/google
  - Apply to appropriate elements
  - Ensure fallbacks work
```

### Step 14.2 — Loading States & Error Handling

**Files to create**:
- `components/ui/ErrorBoundary.tsx` — React error boundary
- `components/ui/LoadingScreen.tsx` — full-page loading with RPG flavor text
- `app/error.tsx` — Next.js error page
- `app/not-found.tsx` — 404 page (RPG themed: "You have wandered into the void...")

**Modify all API routes**: Add try/catch, proper error responses, retry logic for AI calls.

### Step 14.3 — Responsive Design Pass

Go through every component and ensure:
- Desktop (≥1024px): full layout with sidebar
- Tablet (768-1023px): overlay panels
- Mobile (<768px): full-screen panels, touch-friendly, no hover-dependent UI

### Step 14.4 — Performance Optimization

```
  - Image optimization: next/image with Supabase URLs, WebP format, lazy loading
  - Bundle analysis: check for oversized client bundles
  - API route optimization: edge runtime where possible
  - Supabase query optimization: proper indexes, pagination for messages
  - Zustand store: split into slices if needed, selective subscriptions
  - React.memo on expensive components (map, inventory grid)
  - Debounce/throttle on frequent updates (typing indicator, pacing metrics)
```

### Step 14.5 — Vercel Configuration

**Modify**: `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "functions": {
    "app/api/world-genesis/route.ts": { "maxDuration": 60 },
    "app/api/dm/route.ts": { "maxDuration": 30 },
    "app/api/combat/**": { "maxDuration": 30 },
    "app/api/generate-npc-portrait/route.ts": { "maxDuration": 30 }
  },
  "env": [
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_KEY"
  ]
}
```

### Step 14.6 — Analytics & Monitoring

**Modify**: `app/layout.tsx` — add Vercel Analytics
```tsx
import { Analytics } from '@vercel/analytics/react'
// Add <Analytics /> to layout
```

**Acceptance criteria**: Full application works on Vercel. All API routes have appropriate timeouts. Images load efficiently. Mobile works. Error states handle gracefully.

---

## APPENDIX A: FILE MANIFEST (Expected Final State)

```
lib/
  types/
    index.ts, world.ts, character.ts, combat.ts, items.ts, npc.ts,
    quest.ts, map.ts, encounter.ts, exploration.ts, economy.ts,
    session.ts, stealth.ts, rest.ts, ui.ts
  engines/
    combat-engine.ts, encounter-generator.ts, quest-engine.ts,
    chronicle-engine.ts, session-manager.ts, npc-engine.ts,
    clock-engine.ts, weather-engine.ts, travel-engine.ts,
    rest-engine.ts, map-generator.ts, economy-engine.ts,
    crafting-engine.ts, stealth-engine.ts, trap-engine.ts,
    skill-challenge-engine.ts, item-generator.ts,
    equipment-manager.ts, legacy-engine.ts, achievement-engine.ts
  services/
    supabase.ts, database.ts, image-store.ts, tts-service.ts,
    context-builder.ts
  prompts/
    world-genesis.ts, opening-scene.ts, dm-system.ts,
    image-prompts.ts
  utils/
    dice.ts, formatters.ts, calculations.ts
  ai-orchestrator.ts (existing)
  store.ts (existing, expanded)

components/
  ui/
    Button.tsx, Modal.tsx, Card.tsx, ProgressBar.tsx, Badge.tsx,
    Tooltip.tsx, Tabs.tsx, Dropdown.tsx, Toast.tsx, Spinner.tsx,
    IconButton.tsx, AudioControls.tsx, ErrorBoundary.tsx,
    LoadingScreen.tsx, AchievementPopup.tsx, GameImage.tsx
  game/
    TopBar.tsx, ChatArea.tsx, MessageBubble.tsx, InputBar.tsx,
    QuickActions.tsx, CombatView.tsx, InitiativeTracker.tsx,
    CombatActions.tsx, CombatLog.tsx, TargetSelector.tsx,
    ConditionTracker.tsx, CombatHeader.tsx, DiceRoller.tsx,
    DiceResult.tsx, SceneImage.tsx, TravelView.tsx,
    DiscoveryPopup.tsx, RestMenu.tsx, CampScene.tsx,
    ShopView.tsx, HaggleDialog.tsx, PriceTag.tsx,
    CraftingView.tsx, RecipeCard.tsx, SkillChallengeView.tsx,
    TrapDetection.tsx, NPCPanel.tsx, DialogueChoices.tsx,
    SaveMenu.tsx, WorldMap.tsx, RegionalMap.tsx, DungeonMap.tsx,
    TacticalMap.tsx, MapOverlay.tsx
  character/
    CharacterSheet.tsx, OverviewTab.tsx, AbilitiesTab.tsx,
    InventoryTab.tsx, JournalTab.tsx, PartyTab.tsx,
    HPBar.tsx, AbilityScoreBlock.tsx, SpellCard.tsx,
    ItemCard.tsx, PaperDoll.tsx, QuestTracker.tsx,
    CompanionCard.tsx, Portrait.tsx, RaceSelector.tsx,
    ClassSelector.tsx, AbilityScoreRoller.tsx,
    BackgroundSelector.tsx, CharacterPreview.tsx,
    WorldGenLoading.tsx, HeroCard.tsx, RetiredHeroCard.tsx,
    EpilogueView.tsx, AchievementList.tsx
  inventory/
    ItemCard.tsx, ItemCompare.tsx, LootPopup.tsx, PaperDoll.tsx

hooks/
  useAudio.ts

app/
  page.tsx (Hall of Heroes)
  layout.tsx
  globals.css
  error.tsx
  not-found.tsx
  game/
    page.tsx
    layout.tsx
    continue/page.tsx
  character/
    new/page.tsx
  about/page.tsx
  legacy/[characterId]/page.tsx
  api/
    dm/route.ts
    world-genesis/route.ts
    generate-image/route.ts
    generate-npc-portrait/route.ts
    combat/start/route.ts
    combat/action/route.ts
    combat/enemy-turn/route.ts
```

---

## APPENDIX B: DESIGN DOC REFERENCE INDEX

| System | Design Doc | Key Interfaces |
|--------|-----------|----------------|
| World Generation | BRAINSTORM.md | WorldRecord, Quest, Faction, VillainProfile |
| Character System | docs/PLAYER-HANDBOOK.md | Character, AbilityScores, Race, Class |
| Map System | docs/MAP-SYSTEM.md | WorldMap, DungeonLayout, TacticalMap |
| Rest & Downtime | docs/REST-AND-DOWNTIME.md | RestState, CampSetup, ExhaustionState |
| Encounters | docs/ENCOUNTER-SYSTEM.md | EnemyStatBlock, ThreatAssessment, BossEnemy |
| Skill Challenges | docs/SKILL-CHALLENGES.md | SkillChallenge, MechanicalPuzzle, InvestigationEncounter |
| Economy | docs/ECONOMY-SYSTEM.md | Merchant, HaggleAttempt, Property |
| Character Sheet UI | docs/CHARACTER-SHEET-UI.md | OverviewTab, PaperDoll, ResponsiveLayout |
| Exploration | docs/EXPLORATION-SYSTEM.md | GameClock, Weather, TravelPace, NavigationCheck |
| Stealth & Traps | docs/STEALTH-AND-TRAPS.md | StealthCheck, Trap, AlertLevel, Lock |
| Session Structure | docs/SESSION-STRUCTURE.md | SessionStructure, Chronicle, CharacterLegacy |
| Combat | BRAINSTORM.md (Combat section) | CombatState, CombatAction, Initiative |
| Items & Inventory | BRAINSTORM.md (Items section) | Item, Rarity, EquipSlot |
| Crafting | BRAINSTORM.md (Crafting section) | Recipe, CraftingResult |
| NPCs | BRAINSTORM.md (NPC section) | NPC, Relationship, DialogueHistory |
| Visual Strategy | BRAINSTORM.md (Visual Strategy) | ImageTier, GenreArtStyle |
| AI Routing | BRAINSTORM.md (AI Strategy) | AITask (in ai-orchestrator.ts) |
| Meta Systems | BRAINSTORM.md (Meta section) | HallOfHeroesEntry, Achievement |

---

## APPENDIX C: VERCEL DEPLOYMENT NOTES

### Environment Variables Required
```
ANTHROPIC_API_KEY          — Claude API key
OPENAI_API_KEY             — OpenAI API key (images + reasoning models)
SUPABASE_URL               — Supabase project URL
SUPABASE_ANON_KEY          — Supabase anonymous key (client-side)
SUPABASE_SERVICE_KEY       — Supabase service role key (server-side only)
GOOGLE_CLOUD_TTS_KEY       — Google Cloud TTS API key (Phase 12)
```

### Vercel Limitations to Watch
- **Function timeout**: Free tier = 10s, Pro = 60s. World genesis needs Pro tier.
- **Function size**: 50MB max. Keep dependencies lean.
- **Edge Runtime**: Use for simple streaming routes (DM chat). Can't use for heavy compute.
- **Serverless Cold Starts**: First request after idle may be slow. Supabase connection pooling helps.
- **Image Storage**: Images stored in Supabase Storage, not Vercel. OpenAI URLs expire in 1hr — always download and re-host immediately.

### Recommended Vercel Config
- **Framework Preset**: Next.js
- **Node.js Version**: 20.x
- **Build Command**: `npm run build`
- **Root Directory**: `.` (default)
- **Output Directory**: `.next` (default)

---

## APPENDIX D: NPM PACKAGES TO INSTALL (By Phase)

| Phase | Package | Purpose |
|-------|---------|---------|
| 0 | `@supabase/supabase-js` | Database client |
| 2 | `react-markdown` | Markdown rendering in chat |
| 2 | `remark-gfm` | GitHub-flavored markdown tables/checkboxes |
| 9 | `simplex-noise` | Procedural terrain generation |
| 9 | `alea` | Seeded random number generator |
| 12 | `@google-cloud/text-to-speech` | TTS service |

All other functionality is built with existing dependencies (next, react, zustand, anthropic sdk, openai sdk, lucide-react, tailwind).
