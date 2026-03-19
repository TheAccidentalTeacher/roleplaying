# AI RPG — Dungeon Master

A single-player role-playing game with an AI Dungeon Master, 3D physics dice, world generation, and persistent character progression. Live at [roleplaying-nu.vercel.app](https://roleplaying-nu.vercel.app).

---

## Features

- **AI Dungeon Master** — streaming narrative using OpenAI GPT-4o or Anthropic Claude (extended output beta, 128k token ceiling)
- **World Genesis** — 14-step procedural world creation (geography, factions, lore, NPCs, opening scene) at 16k tokens/step
- **Character Creation** — race, class, background, ability scores (4d6 drop-lowest with real 3D dice)
- **3D Physics Dice** — `@3d-dice/dice-box` (Babylon.js + Ammo.js WASM physics); full-viewport canvas, amber theme
- **Dice Tray** — free-roll any combination of d4–d100; results match what the dice show
- **Skill Challenges** — opposed rolls, DM-adjudicated checks
- **Combat System** — initiative tracker, action economy, condition tracking
- **Economy** — shop generation, haggling, crafting
- **Exploration** — travel, trap detection, stealth
- **NPC & Companion System** — persistent NPCs with memory
- **Oracle Panel** — yes/no fate questions (powered by Groq Llama 3.3 70B — near-instant)
- **Achievement System** — milestone tracking
- **Character Sheet** — printable, full ability/spell/inventory tabs
- **Text-to-Speech — 3 providers:**
  - **OpenAI TTS-1** — 11 voices, parallel chunk fetch, ~2s first-audio start
  - **Azure Speech** — 500K chars/month free, 120+ neural voices, SSML prosody control
  - **ElevenLabs** — ultra-realistic character voices (Gollum, Sage Wizard), per-NPC assignment
- **Ambient Audio** — Freesound CC0 reactive loops (tavern, dungeon, wilderness, combat)
- **Scene Images** — DALL-E 3 or Stability AI SDXL (style-locked per world type); stored as Cloudinary CDN URLs
- **Character Portraits** — AI-generated at creation, Cloudinary CDN gallery
- **Per-Message Feedback** — 👍👎 on every DM message; auto-triggers eval scoring on 👎
- **AI Self-Evaluation** — Groq-powered endpoint scores DM responses on 5 rubrics (brevity, player agency, story flow, mechanics, immersion)
- **Prompt Improvement Wizard** — 3-step wizard generates GPT-backed targeted prompt improvements from 👎 data
- **System Prompt Versioning** — FNV-1a hash tracks which prompt version produced each response (Langfuse metadata)
- **Session Export** — full JSON export of messages, feedback, and engagement tags
- **Engagement Heuristics** — rule-based player-message classifier (engaged / confused / frustrated)
- **Weapon Codex** — full weapon catalog with affixes, archetypes, and crafting
- **Spell System** — 40-genre adaptive, slot tracking, concentration, AI spell generation
- **Supabase Persistence** — cloud save/load across devices

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.5 |
| AI — DM | OpenAI GPT-4o (streaming) + Anthropic Claude (extended output beta) |
| AI — Oracle/Eval | Groq Llama 3.3 70B (500+ tok/s) |
| TTS | OpenAI TTS-1 · Azure Speech · ElevenLabs |
| Ambient Audio | Freesound API (CC0) |
| Images | DALL-E 3 · Stability AI SDXL · Cloudinary CDN |
| Observability | Langfuse (cost + prompt version tracking) |
| 3D Dice | @3d-dice/dice-box 1.1.4 (Babylon.js 5.57 + Ammo.js) |
| 3D (misc) | Three.js 0.183 / React Three Fiber 8 |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## Project Structure

```
app/
├── api/                    # API routes (dm, saves, tts, images, combat, oracle...)
├── character/new/          # Character creation wizard
├── game/                   # Main game view, sheet, edit-world, continue
├── games/                  # Saved games browser
├── journal/                # Session journal
├── legacy/[characterId]/   # Retired hero archive
└── about/

components/
├── character/              # CharacterSheet, AbilityScoreRoller, HeroCard, etc.
├── game/                   # ChatArea, DiceTray, DiceRoller, CombatView, etc.
├── inventory/              # ItemCard, PaperDoll, LootPopup, ItemCompare
├── shared/                 # DiceBoxCanvas (3D dice singleton), AnimatedDie
└── ui/                     # Button, Modal, Toast, Tooltip, Badge, etc.

lib/
├── ai-orchestrator.ts      # Routes AI requests across providers
├── engines/                # combat, economy, crafting, quest, stealth, rest, etc.
├── prompts/                # DM system, world genesis, oracle, image prompts
├── services/               # database, supabase, save-service, gallery, TTS
├── types/                  # Full TypeScript type library
└── utils/                  # dice, calculations, formatters

types/
└── dice-box.d.ts           # @3d-dice/dice-box type declarations

public/
└── dice/                   # Dice-box worker files + ammo/ + themes/
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Add your API keys — see [DEPLOYMENT.md](./DEPLOYMENT.md) for the full list.

### 3. Run dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 3D Dice — Architecture Notes

The dice system uses a **singleton pattern** in `components/shared/DiceBoxCanvas.tsx`:

- One global `DiceBox` instance is shared across the entire app (`globalBox`)
- `container: 'body'` — the library manages its own full-viewport canvas
- The canvas receives class `.dice-box-canvas`; `globals.css` applies `position:fixed; z-index:99999` so it floats above all page content without blocking interaction (`pointer-events:none`)
- `offscreen: true` — physics runs in a dedicated web worker
- `scale: 6`, `throwForce: 8`, `themeColor: '#f59e0b'` (amber)
- Results come from `onRollComplete` — never pre-computed random numbers
- Asset path: `/dice/` (workers at root, `ammo/` and `themes/` subdirectories)

**Critical CSS** in `app/globals.css`:
```css
.dice-box-canvas {
  position: fixed !important;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  z-index: 99999 !important;
  pointer-events: none !important;
}
```
This must be present before `init()` runs — the library reads `clientWidth/clientHeight` at init time to set physics world bounds.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel deployment instructions.
