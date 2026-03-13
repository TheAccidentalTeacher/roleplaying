# RPG App — Next Phase Roadmap
### Merged Plan: Self-Improving AI (JAIMES) + API Integration
*Last updated: March 12, 2026*

---

## The Goal of This Phase

Turn a working single-player RPG into a **self-aware, self-improving game** — one that sounds better, costs less to run, generates richer scenes, and gives you the data to make it measurably better over time. This phase is split into three tiers: things you can ship this week, things worth a focused sprint, and what you need before you could sell it.

---

## What's Already Built

| Capability | Status |
|---|---|
| AI Dungeon Master (GPT-4o streaming) | ✅ |
| Tool calls (combat, dice, items, spells, world events, etc.) | ✅ |
| TTS narration — OpenAI 11 voices + ElevenLabs (Gollum, Sage Wizard) | ✅ |
| Message TTS replay / pause / resume / redo | ✅ |
| Per-session world state + Zustand persistence | ✅ |
| System prompt with world + character context | ✅ |
| Scene images via DALL-E | ✅ |
| 3D dice animation | ✅ |
| Ambient audio | ❌ |
| Per-message feedback (thumbs) | ❌ |
| Cost / token observability | ❌ |
| AI self-evaluation of DM quality | ❌ |
| System prompt versioning | ❌ |
| Session export | ❌ |

---

## TIER 1 — Ship This Week
*Low effort. High payoff. No new infrastructure.*

---

### T1-A · Strip Markdown from TTS Text
**Time:** ~30 minutes  
**APIs needed:** None  
**Why first:** The narrator currently reads `**bold**` as "asterisk asterisk bold asterisk asterisk" and `### Combat` as "hashtag hashtag hashtag Combat". This is a bug that makes every narration session worse. It costs nothing to fix and makes every other TTS improvement feel more impactful.

```ts
// Create: lib/utils/strip-markdown.ts
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/`[^`]+`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}
```

Wire in `page.tsx` wherever `speak()` is called, before the text hits any TTS endpoint.

---

### T1-B · Freesound Ambient Audio Layer
**Time:** ~2-3 hours  
**APIs needed:** `FREESOUND_API_KEY` (already live — `mKkgqv6rxPxcjKFhC8yAutjOKZN3R01fhjS1Le56`)  
**Why:** Your guide explicitly calls out Freesound for "roleplaying: Tavern ambience, dungeon sounds, battle effects — at zero ElevenLabs cost." No text RPG does reactive ambient audio. The DM already knows the scene type (dungeon, tavern, wilderness, combat) — map that to a Freesound query and loop it softly in the background.

**Implementation:**
```ts
// app/api/ambient/route.ts
// POST { sceneType: 'tavern' | 'dungeon' | 'wilderness' | 'combat' | 'town' | 'cave' }
// Fetch from Freesound → return preview_url of first CC0 result

const SCENE_QUERIES: Record<string, string> = {
  tavern:      'medieval tavern ambient',
  dungeon:     'dungeon cave drip ambient',
  wilderness:  'forest nature wind ambient',
  combat:      'battle sword clashing',
  town:        'market crowd medieval',
  cave:        'cave echo dripping water',
};

const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&filter=license:"Creative Commons 0"&fields=previews,name&token=${process.env.FREESOUND_API_KEY}`;
```

The DM tool-call responses already include scene context. Parse `sceneType` from the DM response (or ask the DM to emit it as a tool call), then play the ambient loop at ~15% volume behind narration.

**Commercial note:** Filter `license:"Creative Commons 0"` — zero attribution required. Safe for commercial use.

---

### T1-C · Per-Message Thumbs Feedback
**Time:** ~2 hours  
**APIs needed:** None  
**Why:** This is the raw signal that all the JAIMES-derived features depend on. You can't evaluate what you don't track. Add it now while the feature set is small — costs nothing in infrastructure, persists in Zustand alongside the messages that already live there.

```ts
// Add to lib/types/ui.ts (GameState or UserSettings)
messageFeedback: Record<string, 'up' | 'down'>;

// Add to lib/store.ts defaults
messageFeedback: {},
```

**UI:** Subtle 👍 👎 icons right-aligned under each DM message bubble, next to the existing TTS buttons. Highlight on select. That's it. No backend, no API call — just Zustand.

---

### T1-D · Langfuse Observability
**Time:** ~1 hour  
**APIs needed:** `LANGFUSE_SECRET_KEY` + `LANGFUSE_PUBLIC_KEY` (already live)  
**Why:** You don't know what a session costs right now. You're calling GPT-4o on every DM response, every oracle call, and every DALL-E image. Before you can price a subscription, before you can optimize, you need to know cost per session. Langfuse installs in one `npm install langfuse` call and wraps your existing route handlers.

```ts
// Wrap your DM route handler
const trace = langfuse.trace({ name: 'dm-response', metadata: { worldType, genre } });
const generation = trace.generation({
  name: 'gpt4o-dm',
  model: 'gpt-4o',
  input: messages,
});
// ... existing stream logic ...
generation.end({ output: dmResponse, usage: { inputTokens, outputTokens } });
```

Install: `npm install langfuse`  
Env vars to add to `.env.local`:
```
LANGFUSE_SECRET_KEY=sk-lf-20ac2017-fd5f-4de4-9680-240618f57a3d
LANGFUSE_PUBLIC_KEY=pk-lf-5460c465-094f-48fc-bd7e-8031cb07598d
LANGFUSE_BASE_URL=https://us.cloud.langfuse.com
```

---

### T1-E · Session Export
**Time:** ~1 hour  
**APIs needed:** None  
**Why:** A JSON export of a session is the foundation of everything in Phase 2 that requires data. You can manually review sessions, identify weak DM responses, and build test cases — all without any infrastructure.

```ts
function exportSession(messages: ChatMessage[], worldName: string) {
  const data = {
    worldName,
    exportedAt: new Date().toISOString(),
    messages,
    feedback: messageFeedback,  // include the thumbs data
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${worldName}-${Date.now()}.json`;
  a.click();
}
```

Add a "📋 Export Session" button to the Settings modal.

---

## TIER 2 — Focused Sprint
*More work, but where the app starts to feel meaningfully different.*

---

### T2-A · Azure Speech as 3rd TTS Provider (Free 500K chars/month)
**Time:** ~3 hours  
**APIs needed:** `AZURE_SPEECH_KEY` (already live — `REDACTED_AZURE_SPEECH_KEY`)  
**Why:** ElevenLabs burns credits fast on long sessions. OpenAI TTS costs $15/1M chars. Azure Speech gives you 500K chars/month free, then $16/1M. 120+ neural voices, streams MP3 just like your existing routes. Perfect for minor NPC voices and system messages so ElevenLabs credits stay reserved for Gollum and the Sage Wizard.

```ts
// app/api/tts-az/route.ts
// SSML call to https://westus.tts.speech.microsoft.com/cognitiveservices/v1
// Headers: Ocp-Apim-Subscription-Key, Content-Type: application/ssml+xml
// X-Microsoft-OutputFormat: audio-24khz-160kbitrate-mono-mp3
// Returns: MP3 buffer — same pattern as /api/tts and /api/tts-el
```

Add `'azure'` to `TTSVoiceSetting` type, add a voice picker section showing neural voice names (Jenny, Guy, Aria, etc.) with gender labels matching the existing OpenAI pattern.

Env vars to add to `.env.local`:
```
AZURE_SPEECH_KEY=REDACTED_AZURE_SPEECH_KEY
AZURE_SPEECH_REGION=westus
```

---

### T2-B · Scene Images via Stability AI (Style Control)
**Time:** ~3 hours  
**APIs needed:** `STABILITY_API_KEY` (already live — `sk-vmUjKJbneI2Yq7Yq5rrLei4mgHArhIgimDrA8lCt8GYDz47U`)  
**Why:** DALL-E 3 works but you have zero control over art style — every scene image looks different. Stability AI lets you lock a style preset (e.g., `fantasy-art`, `dark-fantasy`, `digital-art`) per world type, so a dark-fantasy world's images look consistently like a dark-fantasy world. Add it as a second image backend selectable per world.

```ts
// app/api/scene-image-stability/route.ts
// POST to https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image
// style_preset: map worldType → 'fantasy-art' | 'dark-fantasy' | 'cinematic'
```

---

### T2-C · Groq for Oracle / Eval Calls
**Time:** ~2 hours  
**APIs needed:** `GROQ_API_KEY` (already live — `REDACTED_GROQ_API_KEY`)  
**Why:** The Oracle (the quick-decision secondary AI) doesn't need GPT-4o quality and is currently the highest-latency call in the stack. Groq runs Llama 3.3 70B at 500+ tokens/second — close to instant. Move the Oracle route to Groq and your oracle panels will appear noticeably faster. Also use Groq for the eval endpoint (T2-E) to make it near-zero cost.

```ts
// app/api/oracle/route.ts — swap model endpoint to Groq
// https://api.groq.com/openai/v1/chat/completions
// model: "llama-3.3-70b-versatile"
// Same OpenAI-compatible API shape — drop-in replacement
```

Env vars to add to `.env.local`:
```
GROQ_API_KEY=REDACTED_GROQ_API_KEY
```

---

### T2-D · System Prompt Versioning
**Time:** ~2 hours  
**APIs needed:** None  
**Why (JAIMES):** When you change `lib/prompts/dm-system.ts` and sessions feel better or worse, right now you have no record of which version was running. Hash the prompt string when the game starts and store it in session state. Include it in session exports. This becomes the linking key when you compare quality across exports.

```ts
// lib/utils/prompt-version.ts
import { createHash } from 'crypto';
export function hashPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').slice(0, 8);
}

// Add to game state: dmPromptVersion: string
// Set at game start: dmPromptVersion = hashPrompt(buildDMSystemPrompt(world, character))
```

---

### T2-E · AI Self-Evaluation Endpoint
**Time:** ~4 hours  
**APIs needed:** Groq (near-zero cost) or GPT-5-mini  
**Why (JAIMES):** This is the core of the JAIMES approach — use a second, cheaper AI call to judge the DM's output on rubrics you care about. The key is triggering it only on 👎 clicks, not every message, so cost stays negligible.

**Rubrics** (adapted from JAIMES for this app):

| Rubric | Question | Scale |
|---|---|---|
| **Brevity** | Appropriate length — not padding, not cutting short? | 1–5 |
| **Player Agency** | Does it leave meaningful choices to the player? | 1–5 |
| **Story Flow** | Does it advance narrative without dead ends? | 1–5 |
| **Game Mechanics** | Rules applied correctly (HP, dice, spells)? | 1–5 |
| **Immersion** | Tone matches world genre, stays in character? | 1–5 |

```ts
// app/api/eval-message/route.ts
// POST { dmResponse: string, playerAction: string, worldType: string, genre: string }
// Returns { scores: { brevity, playerAgency, storyFlow, gameMechanics, immersion }, overall, notes }
// Use groq llama-3.3-70b — essentially free per eval
```

**Trigger:** Auto-call when 👎 is clicked. Store result in `messageFeedback` alongside the rating.  
**Display:** Show scores in a collapsible panel under the 👎'd message for dev purposes.

---

### T2-F · Prompt Improvement Wizard (3-Step)
**Time:** ~6 hours  
**APIs needed:** OpenAI or Groq  
**Why (JAIMES):** The whole point of collecting 👎 feedback and eval scores is to feed them back into improving the prompt. This is a 3-step Settings panel wizard:

- **Step 1 — Insights**: Show stats from stored feedback: 👎 ratio, average response word count, most-used tool calls, eval score averages (if T2-E is live)
- **Step 2 — Generate**: Send 3 recent 👎 messages + current prompt + eval notes to GPT, ask for 3 specific targeted improvements
- **Step 3 — Apply**: Show suggestions as readable diffs. Toggle each on/off. Apply writes to a "custom prompt overrides" object in settings that layers on top of the base `dm-system.ts` prompt

This is the JAIMES Prompt Improvement Wizard stripped of the Azure Foundry infrastructure. Same output, zero ML, runs on one GPT call.

---

### T2-G · Cloudinary for Scene Images
**Time:** ~2 hours  
**APIs needed:** `CLOUDINARY_URL` (already live — `cloudinary://528486665875958:SLs2GQF_TfMgv6vBBHXcWj5Cqvo@dpn8gl54c`)  
**Why:** Right now, DALL-E generates a base64 image blob, which gets stored in Zustand state and re-sent in game state syncs. That's a 500KB+ payload living in localStorage. Instead: generate the image → upload to Cloudinary → store the CDN URL (25 chars) in state. Page loads faster, state stays lean, images persist across sessions by URL.

```ts
// After DALL-E generates: upload buffer to Cloudinary via /api/image-upload
// Return: https://res.cloudinary.com/dpn8gl54c/image/upload/f_auto,q_auto/v1/{publicId}.jpg
// Store URL in message, not base64
```

---

### T2-H · RPG-Aware Engagement Heuristics
**Time:** ~1 hour  
**APIs needed:** None  
**Why (JAIMES):** JAIMES' biggest insight was that generic sentiment analysis misreads RPG players. "I stab the guard!" is enthusiasm, not hostility. Instead of ML, use a simple rule-based classifier that tags player messages as `engaged`, `confused`, or `frustrated`. Log these tags in session exports alongside 👍/👎 — building ground truth data for any future classifier without needing a training pipeline yet.

```ts
// lib/utils/engagement-heuristics.ts
const ENGAGED = [/I (attack|charge|cast|stab|fire|slash|run|grab|hide)/i, /let's|let me|I want to/i];
const CONFUSED = [/what\?|huh\?|wait,?\s*(what|no)|doesn't make sense|confused|I don't understand/i];
const FRUSTRATED = [/that's wrong|that's not right|you said|but earlier|undo|go back/i];
```

---

## TIER 3 — Pre-Commercial
*Only matters if you decide to sell access. Do none of this until Tier 1+2 are done.*

---

### T3-A · Supabase — Saved Games + User Accounts
**Why:** Everything currently lives in localStorage. If a player clears their browser, their world is gone. Supabase gives you PostgreSQL-backed saves, cloud sync across devices, and the user table you need for accounts.

**Tables needed (minimal):**
- `users` (id, email, created_at)
- `game_sessions` (id, user_id, world_data JSONB, updated_at)
- `message_feedback` (session_id, message_id, rating, eval_scores JSONB)

---

### T3-B · Clerk — Authentication
**Why:** You already have dev keys. Before charging money, you need accounts. Clerk is a 1-hour integration with Next.js and handles all the auth flow — magic links, OAuth, session management.

**Configuration:** Swap `pk_test_` → `pk_live_` before deploying. No code changes after that.

---

### T3-C · Stripe — Payments
**Already have test keys.** Likely model: subscription ($9.99/mo) or lifetime ($49 one-time). The ElevenLabs API cost is the main COGS concern — you'll want a usage cap or credit system per user on the free tier.

**Wire order:** Stripe webhook → QStash queue → `/api/activate-account` → Supabase `users.plan`

---

### T3-D · Azure Content Safety — Before Any Public Users
**Why and when:** The moment anyone other than you types into the DM input, you are accepting arbitrary user text sent to GPT-4o. Content Safety screens for hate speech, sexual content, violence (severity 0–6) before the DM call. This is not optional for a commercial product, especially one that could attract younger players.

**Already have the key** — `AZURE_AI_FOUNDRY_KEY`. Wire it as middleware in the `/api/dm` route.

```ts
// Check before every DM call — only adds ~80ms
// Block at severity >= 4 (medium+)
// Return a "The world goes quiet..." fallback message instead of the DM response
```

---

### T3-E · Upstash Redis — Rate Limiting + Response Cache
**Why:** On the free tier you'll want to cap AI calls per user per day. On any tier, caching identical or near-identical oracle queries (same location + same question) prevents duplicate API spend.

**Already have the URL/token.** Add `@upstash/redis` and `@upstash/ratelimit` — both are 15-minute installs.

---

### T3-F · Sentry — Crash Reporting
**Why:** You already have the DSN. One command:
```bash
npx @sentry/wizard@latest -i nextjs --saas --org next-chapter-homeschool-op --project javascript-nextjs
```
After that, every unhandled exception in production gets caught with full stack trace. Do this before anyone else plays the game.

---

## What NOT to Build (for this app)

| Feature | Source | Why skip |
|---|---|---|
| ML.NET classifier training | JAIMES | Needs thousands of labeled examples. You have one player (you). |
| Azure AI Foundry bulk evaluation | JAIMES | Heavy infrastructure. Groq + a single eval prompt achieves 90% of the value. |
| Multi-agent async evaluation pipeline | JAIMES | No scale problem to solve. |
| Neo4j NPC relationship graph | API guide | Genuinely interesting (NPC webs, faction relationships) but Phase 3+ when the world system is more complex |
| HeyGen avatar videos | API guide | Scott-avatar videos — no RPG use case |
| Twilio SMS | API guide | Parent notifications — no fit for a solo RPG |
| Vector search (Pinecone / Upstash Vector) | API guide | No semantic search need yet. Possible future use: "find NPCs similar to this description" |

---

## Architecture — Nothing New Required for Tier 1+2

| Layer | Tool | Notes |
|---|---|---|
| Client state | Zustand (already in use) | Add `messageFeedback`, `dmPromptVersion`, `ambientTrack` fields |
| Persistence | Zustand localStorage middleware (already in use) | All new state persists automatically |
| New API routes | Next.js route handlers | `/api/ambient`, `/api/tts-az`, `/api/eval-message`, `/api/improve-prompt` |
| Image storage (T2-G) | Cloudinary CDN | Replace base64 in state with URL |
| Observability (T1-D) | Langfuse cloud | Wraps existing route handlers, no DB needed |
| Eval model (T2-E) | Groq Llama 3.3 70B | Near-zero cost, OpenAI-compatible API |

No new database, no new auth layer, no new infrastructure required until Tier 3.

---

## Ordered Implementation Checklist

### ✅ Tier 1 — Shipped (commit `f5e777b`)
- [x] **T1-A** Strip markdown from TTS text (`lib/utils/strip-markdown.ts` + wire in `page.tsx`)
- [x] **T1-D** Add Langfuse to DM route handler (1 npm install, 3 env vars)
- [x] **T1-C** Per-message thumbs 👍 👎 (Zustand field + ChatArea UI)
- [x] **T1-B** Freesound ambient audio (scene-type → API query → looping background audio)
- [x] **T1-E** Session export button (Settings modal → JSON download)

### ✅ Tier 2 — Shipped (commits `97c9d6d` + `a3498c5`)
- [x] **T2-A** Azure Speech as 3rd TTS provider (`/api/tts-az`, `NarrationPlayer.tsx` Azure section, `useTTS.ts` wiring)
- [x] **T2-C** Move Oracle route to Groq (`llama-3.3-70b-versatile`, SSE → streaming text)
- [x] **T2-D** System prompt versioning (FNV-1a hash, `X-Prompt-Version` header, Langfuse metadata)
- [x] **T2-G** Cloudinary for scene images (`lib/utils/cloudinary.ts`, updated `/api/generate-image`)
- [x] **T2-B** Stability AI scene images with style presets (`/api/scene-image-stability`, genre → `style_preset` map)
- [x] **T2-E** Eval endpoint (`/api/eval-message`, Groq-powered, 5 rubrics, triggers on 👎 in `page.tsx`)
- [x] **T2-H** Engagement heuristics (`lib/utils/engagement-heuristics.ts`, tags in session export)
- [x] **T2-F** Prompt improvement wizard (`/api/prompt-wizard`, Settings panel 3-step UI, `promptOverrides` injected into DM system prompt)

### Pre-Commercial (when ready)
- [ ] **T3-F** Sentry (`npx @sentry/wizard` — do before first external user)
- [ ] **T3-D** Azure Content Safety middleware on `/api/dm`
- [ ] **T3-A** Supabase — saved games + user table
- [ ] **T3-B** Clerk auth (dev keys already configured)
- [ ] **T3-E** Upstash Redis rate limiting
- [ ] **T3-C** Stripe payments (test keys already configured)

---

## Test Case Library (start building now)

Save these to `lib/test-cases/dm-bench.json`. Run against the eval endpoint after any prompt change.

```json
[
  { "id": "combat-01", "playerInput": "I draw my sword and charge the nearest goblin.", "scenarioType": "combat", "expectedBehaviors": ["combat initiated", "dice roll requested or applied", "result narrated"] },
  { "id": "dialogue-01", "playerInput": "I try to persuade the innkeeper to give me a room for free.", "scenarioType": "dialogue", "expectedBehaviors": ["charisma check or persuasion roll", "NPC responds in character", "outcome narrated"] },
  { "id": "lore-01", "playerInput": "What do I know about the Crimson Brotherhood?", "scenarioType": "lore", "expectedBehaviors": ["world-appropriate information", "stays within established world lore", "doesn't invent contradictions"] },
  { "id": "ambiguous-01", "playerInput": "I look around.", "scenarioType": "exploration", "expectedBehaviors": ["describes environment", "reveals relevant detail", "offers implicit choice or hook"] },
  { "id": "recovery-01", "playerInput": "I try to stabilize the fallen warrior.", "scenarioType": "healing", "expectedBehaviors": ["medicine check or healing mechanics applied", "result reflects HP/death-save rules"] }
]
```

---

*Sources: Matt Eland — JAIMES self-improving AI system article + admin UI screenshots. API analysis from api-guide-master.md (local only).*
