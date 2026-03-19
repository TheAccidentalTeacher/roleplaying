# Architecture

Current architecture of the AI RPG Dungeon Master application.  
Live: https://roleplaying-nu.vercel.app | Repo: https://github.com/TheAccidentalTeacher/roleplaying  
*Last updated: March 19, 2026*

---

## Directory Layout

```
app/                          Next.js App Router pages & API routes
├── api/
│   ├── dm/route.ts           AI DM streaming endpoint
│   ├── saves/route.ts        Save-game CRUD
│   ├── saves/[id]/route.ts
│   ├── oracle/route.ts       Fate/oracle yes-no questions
│   ├── tts/route.ts          OpenAI TTS-1 text-to-speech (11 voices, streams MP3)
│   ├── tts-az/route.ts       Azure Speech TTS (SSML, 120+ neural voices, free 500K/mo)
│   ├── tts-el/route.ts       ElevenLabs TTS (ultra-realistic character voices)
│   ├── ambient/route.ts      Freesound CC0 ambient audio (scene-type → loop)
│   ├── generate-image/       DALL-E 3 scene images → Cloudinary CDN
│   ├── scene-image-stability/ Stability AI SDXL (style-locked per world type)
│   ├── character-portrait/   Portrait generation + gallery
│   ├── character-help/       AI character-creation assistant
│   ├── spells/generate/      AI spell generation (40-genre adaptive)
│   ├── oracle/route.ts       Fate questions (Groq Llama 3.3 70B — near-instant)
│   ├── eval-message/         DM response scorer (5 rubrics, Groq-powered)
│   ├── prompt-wizard/        3-step prompt improvement wizard (GPT-backed)
│   ├── world-genesis/        Multi-step world + opening-scene generation (16k tokens/step)
│   ├── world/update/         Mutate world state
│   ├── adventures/           Adventure listing
│   ├── adventures/[id]/      Individual adventure CRUD
│   ├── combat/               start + action routes
│   └── shop/generate/        Dynamic shop inventory
│
├── character/new/            Character creation wizard
├── game/                     Main game interface
│   ├── page.tsx              Game loop + chat
│   ├── layout.tsx
│   ├── sheet/                Character sheet view
│   ├── continue/             Resume saved game
│   └── edit-world/           DM world editor
├── games/                    Saved games browser
├── journal/                  Session journal
├── legacy/[characterId]/     Retired hero archive
└── about/

components/
├── character/
│   ├── AbilityScoreRoller.tsx   4d6 drop-lowest roller (uses DiceBoxCanvas)
│   ├── AbilityScoreBlock.tsx
│   ├── AbilitiesTab.tsx
│   ├── CharacterSheet.tsx
│   ├── CharacterPreview.tsx
│   ├── ClassSelector / RaceSelector / BackgroundSelector
│   ├── HeroCard / RetiredHeroCard / CompanionCard
│   ├── HPBar.tsx
│   ├── InventoryTab / JournalTab / OverviewTab / SpellCard
│   ├── Portrait / PortraitGallery
│   ├── PrintableSheet.tsx
│   ├── QuestTracker.tsx
│   └── WorldSelector / WorldGenLoading
│
├── game/
│   ├── ChatArea.tsx           Main message stream
│   ├── InputBar.tsx           Player input
│   ├── TopBar / CharacterSidebar / PartyHUD
│   ├── DiceTray.tsx           Free-roll dice playground (uses DiceBoxCanvas)
│   ├── DiceRoller.tsx         In-game d20 skill-check modal
│   ├── DiceResult.tsx         Roll result display component
│   ├── CombatView / CombatActions / CombatHeader / CombatLog
│   ├── InitiativeTracker / ConditionTracker / TargetSelector
│   ├── SkillChallengeView / TrapDetection
│   ├── ShopView / HaggleDialog / CraftingView
│   ├── TravelView / CampScene
│   ├── NPCPanel / OraclePanel
│   ├── LevelUpCeremony / DiscoveryPopup
│   ├── NarrationPlayer.tsx    TTS audio playback
│   ├── RestMenu / SaveMenu / SettingsModal / SettingsProvider
│   ├── QuickActions / DialogueChoices / MessageBubble
│   ├── RecipeCard / PriceTag / SceneImage
│   └── CompanionRecruitModal
│
├── inventory/
│   ├── ItemCard / ItemCompare
│   ├── LootPopup
│   └── PaperDoll
│
├── shared/
│   ├── DiceBoxCanvas.tsx      3D dice singleton wrapper (see below)
│   └── AnimatedDie.tsx        CSS-only decorative die
│
└── ui/                        Generic primitives
    ├── Button, Badge, Card, Modal, Toast, Tooltip
    ├── Spinner, ProgressBar, LoadingScreen
    ├── Dropdown, Tabs, IconButton
    ├── AchievementPopup, ErrorBoundary, GameImage
    └── index.ts               barrel export

lib/
├── ai-orchestrator.ts         Routes prompts → OpenAI or Anthropic
├── store.ts                   Zustand global state (character, game, UI flags)
│
├── engines/
│   ├── combat-engine.ts       Initiative, attack rolls, damage, conditions
│   ├── economy-engine.ts      Gold, prices, shops, bartering
│   ├── crafting-engine.ts     Recipe lookup, material checks, craft outcomes
│   ├── quest-engine.ts        Quest state machine
│   ├── encounter-generator.ts Random creature/event tables
│   ├── exploration-engine.ts  Travel, hex crawl, discovery
│   ├── stealth-engine.ts      Detection, sneaking, ambushes
│   ├── trap-engine.ts         Trap generation & disarm checks
│   ├── rest-engine.ts         Short/long rest recovery
│   ├── skill-challenge-engine.ts  Opposed/complex skill rolls
│   ├── npc-engine.ts          NPC state, memory, attitude
│   ├── level-engine.ts        XP, levelling, feature unlocks
│   ├── achievement-engine.ts  Milestone detection
│   ├── clock-engine.ts        In-world time tracking
│   ├── chronicle-engine.ts    Session recap generation
│   ├── item-generator.ts      Procedural loot
│   ├── equipment-manager.ts   Equip/unequip, encumbrance
│   ├── session-manager.ts     Session lifecycle
│   └── legacy-engine.ts       Retired hero archive processing
│
├── prompts/
│   ├── dm-system.ts           Main DM system prompt
│   ├── world-genesis.ts       Full-world generation prompt
│   ├── world-genesis-steps.ts Step-by-step world building
│   ├── oracle-system.ts       Oracle/fate question prompt
│   ├── opening-scene.ts       First-scene narrative prompt
│   └── image-prompts.ts       Scene + portrait image prompt builders
│
├── services/
│   ├── database.ts            IndexedDB local persistence
│   ├── supabase.ts            Supabase client init
│   ├── save-service.ts        Save/load game orchestration
│   ├── saved-games.ts         Saved game list management
│   ├── context-builder.ts     Builds DM context from game state
│   ├── gallery-service.ts     Portrait gallery CRUD
│   ├── image-store.ts         Image blob storage
│   └── portrait-prompt.ts     Character portrait prompt builder
│
├── types/                     Full TypeScript type library
│   ├── index.ts               Barrel export
│   ├── character.ts
│   ├── combat.ts
│   ├── economy.ts
│   ├── encounter.ts
│   ├── exploration.ts
│   ├── items.ts
│   ├── map.ts
│   ├── npc.ts
│   ├── quest.ts
│   ├── rest.ts
│   ├── session.ts
│   ├── stealth.ts
│   ├── ui.ts
│   ├── world.ts
│   └── gallery.ts
│
└── utils/
    ├── dice.ts                roll(sides), rollAdvantage, etc.
    ├── calculations.ts        Ability modifiers, proficiency bonus, etc.
    ├── formatters.ts          Number/string helpers
    ├── game-data-parser.ts    AI response → structured game state
    ├── item-converter.ts      Raw item data normalisation
    ├── message-summarizer.ts  Trim old context for AI token budget
    ├── tts-voices.ts          OpenAI voice list + metadata
    ├── azure-voices.ts        Azure Speech neural voice catalog
    ├── strip-markdown.ts      Strip markdown formatting for TTS text
    ├── cloudinary.ts          Cloudinary upload helper → CDN URL
    ├── prompt-version.ts      FNV-1a hash of DM system prompt
    └── engagement-heuristics.ts  Player-message classifier (engaged/confused/frustrated)

types/
└── dice-box.d.ts             Type declarations for @3d-dice/dice-box

hooks/
├── useAutoSave.ts            Auto-save debounce hook
├── useToast.ts               Toast notification hook
└── useTTS.ts                 Multi-provider TTS hook (OpenAI · Azure Speech · ElevenLabs)
                              Parallel chunk fetch, 500-char fast-start first chunk,
                              streaming prefetch during DM response, pipelined playback

public/
└── dice/                    @3d-dice/dice-box worker + WASM assets
    ├── world.offscreen.js
    ├── world.onscreen.js
    ├── world.none.js
    ├── Dice.js
    ├── ammo/ammo.wasm.{js,wasm}
    └── themes/default/
```

---

## 3D Dice Singleton (`components/shared/DiceBoxCanvas.tsx`)

One `DiceBox` instance (`globalBox`) is shared across the entire app via module-level variables.

```
globalBox        – the single DiceBox instance
globalReady      – true after init() completes
globalCallbacks  – onRollComplete handlers, one per mounted consumer
initPromise      – deduplicates concurrent mount calls
```

### Init sequence
1. First component to mount calls `initGlobalBox()`
2. Dynamically imports `@3d-dice/dice-box`
3. Constructs `new DiceBox({ container: 'body', offscreen: true, scale: 6, ... })`
4. `globalBox.init()` — library appends a `<canvas class="dice-box-canvas">` to `<body>`
5. CSS in `globals.css` (loaded before JS) gives it `position:fixed; 100vw×100vh; z-index:99999; pointer-events:none`
   - **This CSS must exist before init() runs** — the library reads `canvas.clientWidth/clientHeight` at init to set physics world bounds
6. Subsequent mounts skip 2–5 and just register their `onRollComplete` callback

### Roll flow
1. Consumer calls `ref.current.roll(['1d20', '2d6'])`  ← array notation required for mixed die types
2. Ammo.js WASM physics simulates and settles the dice
3. `onRollComplete(results)` fires with `results[i].value` = actual face value from physics
4. All registered callbacks receive results

### Critical CSS (`app/globals.css`)
```css
.dice-box-canvas {
  position: fixed !important;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 99999 !important;
  pointer-events: none !important;
}
```

### Config
```ts
scale: 6          // die size relative to canvas
throwForce: 8     // launch velocity
offscreen: true   // physics in web worker
themeColor: '#f59e0b'  // amber
assetPath: '/dice/'
```

---

## State Management (`lib/store.ts`)

Zustand store with `persist` middleware (localStorage). Key slices:

| Slice | Contents |
|-------|----------|
| `character` | stats, inventory, spells, HP, XP, conditions |
| `world` | lore, factions, locations, clock |
| `session` | messages, journal entries, dmPromptVersion |
| `combat` | initiative order, combatants, round counter |
| `ui` | active modals, toast queue, settings flags |
| `feedback` | per-message 👍👎 ratings + eval scores |
| `settings` | TTS voice/provider, autoPlay, promptOverrides |

---

## API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dm` | POST (stream) | Main DM narration — returns SSE |
| `/api/saves` | GET/POST | List / create saves |
| `/api/saves/[id]` | GET/PUT/DELETE | Individual save CRUD |
| `/api/oracle` | POST | Fate question → yes/no/maybe (Groq Llama 3.3 70B) |
| `/api/tts` | POST | OpenAI TTS-1 → MP3 stream |
| `/api/tts-az` | POST | Azure Speech TTS → MP3 stream |
| `/api/tts-el` | POST | ElevenLabs TTS → MP3 stream |
| `/api/ambient` | POST | Freesound CC0 ambient audio URL by scene type |
| `/api/generate-image` | POST | DALL-E 3 scene image → Cloudinary URL |
| `/api/scene-image-stability` | POST | Stability AI SDXL scene image (style-locked per world type) |
| `/api/character-portrait` | POST | Character portrait generation |
| `/api/character-portrait/gallery` | GET | Saved portrait list |
| `/api/character-help` | POST | AI character-creation guidance |
| `/api/spells/generate` | POST | AI spell generation (40-genre adaptive) |
| `/api/eval-message` | POST | Score a DM response on 5 rubrics (Groq-powered) |
| `/api/prompt-wizard` | POST | Generate prompt improvements from 👎 feedback data |
| `/api/world-genesis` | POST | Full world generation |
| `/api/world-genesis/step` | POST | Single world-gen step (16k tokens, extended output beta) |
| `/api/world-genesis/assemble` | POST | Assemble world from steps |
| `/api/world-genesis/opening-scene` | POST | Generate opening scene |
| `/api/world-genesis/regenerate` | POST | Regenerate a world section |
| `/api/world/update` | POST | Mutate world state |
| `/api/adventures` | GET | List adventures |
| `/api/adventures/[id]` | GET/PUT/DELETE | Individual adventure CRUD |
| `/api/combat/start` | POST | Begin combat encounter |
| `/api/combat/action` | POST | Process a combat action |
| `/api/shop/generate` | POST | Generate shop inventory |
