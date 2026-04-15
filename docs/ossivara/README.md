# Ossivara — Session State System

A structured-document continuity system for solo TTRPG play with Claude as
Dungeon Master. Designed to keep the **Ossivara / Beldokin** campaign coherent
across sessions and across long-context drift.

This folder is **not application code**. It is a set of human-edited markdown
documents that get assembled into the prompt context Claude sees at the start of
each DM session.

---

## The problem this solves

Running a long-form solo RPG with an LLM as DM hits four predictable failure
modes:

1. **NPC drift** — the bone-surgeon Fenne Orrath is reintroduced, her accent
   changes, her shop relocates.
2. **Rule drift** — Auric Pressure mechanics get reinvented; Pallor is treated
   as a curse one turn and a disease the next.
3. **Premature collapse of ambiguity** — Maret is "really there" by turn 4
   because the model defaulted to the simpler reading.
4. **Lost dice consequences** — a high WIS roll that revealed something gets
   forgotten three exchanges later, and the revelation never lands.

The fix is to give Claude a **canonical, human-curated state document** at the
top of every session, plus a **turn-closure protocol** that lets Claude emit
structured updates the human can splice back in.

---

## Architecture — which approach, and why

You asked whether this should be a system prompt, a tool, RAG, or a JSON state
object. Short answer: **a layered system prompt + a structured state ledger
maintained turn-by-turn**, with a tool-use upgrade path if you decide to host
this in the existing Next.js app rather than running it conversationally.

| Approach | Verdict | Why |
|---|---|---|
| **System prompt only** (paste a static doc) | Necessary but not sufficient | Captures stable canon, but volatile state (current scene, dice log, mystery status) drifts during a session. |
| **RAG over a campaign wiki** | Wrong tool | Retrieval is fuzzy. You'd routinely miss the *one fact* that matters (e.g. Maret's filing-date discrepancy) because no chunk scored high enough. Solo TTRPG context is small enough to fit in-window — retrieval adds failure modes without saving tokens. |
| **JSON state object passed each turn** | Right shape, wrong serialization | Forcing JSON loses voice and nuance. ("Maret's reality status" is not a boolean — it's `{value: 'unresolved', narrative_weight: 'load-bearing — do not collapse'}`.) Use markdown with consistent headers; it parses fine for the model and stays human-editable. |
| **Tool calls that read/write state** | Best, *if* you build it into the app | The natural fit for `lib/services/context-builder.ts`. A `state.read()` / `state.update()` tool pair lets Claude propose mutations the engine validates. Until then, the human is the validator. |

**Recommended stack (current — conversational use):**
- A **two-tier system prompt** pasted at session start:
  - **Tier 1 (stable):** DM directives + world canon + character. Rarely changes.
  - **Tier 2 (volatile):** scene state, cast status, open mysteries, dice log.
    Edited by the human between sessions; updated mid-session via the
    turn-closure block Claude emits.
- A **turn-closure protocol** (`TURN-CLOSURE-PROTOCOL.md`) — Claude emits a
  fenced ```state-delta``` block at the end of any beat that changes durable
  state. The human pastes those deltas into `04-STATE.md` between sessions.
- A **bootstrap prompt** (`BOOTSTRAP.md`) — a single paste-it-once message that
  loads everything in the right order if you don't want to paste files
  individually.

**Recommended stack (future — if you wire this into the Next.js app):**
- Promote `04-STATE.md` to a typed Zustand slice (`session.narrativeState`)
  alongside the existing `world` / `character` / `combat` slices in
  `lib/store.ts`.
- Add a `narrative-state` builder section to `lib/prompts/dm-system.ts`
  alongside the existing seven sections — feeds in Cast, Mysteries, and
  Dice-Log-with-Locked-Consequences.
- Expose two tool calls to the DM model: `state.lockConsequence(rollId, text)`
  and `state.flagAmbiguity(threadId, status)`. The first prevents the model
  from forgetting that an 18-WIS roll *meant something*. The second prevents
  unilateral collapse of unresolved threads.
- The existing `lib/engines/chronicle-engine.ts` is the natural place to emit
  a per-session diff, which becomes the next session's "previously on" recap.

---

## File layout

```
docs/ossivara/
├── README.md                    ← you are here
├── BOOTSTRAP.md                 ← single-paste session opener
├── 00-DM-DIRECTIVES.md          ← how Claude should behave as DM (stable)
├── 01-CANON.md                  ← world rules, lore, factions (stable)
├── 02-CAST.md                   ← NPC ledger (semi-stable)
├── 03-CHARACTER.md              ← Beldokin (semi-stable)
├── 04-STATE.md                  ← scene, mysteries, dice log (volatile)
├── TURN-CLOSURE-PROTOCOL.md     ← what Claude emits at end of each beat
└── templates/                   ← blank versions for new campaigns
    ├── 00-DM-DIRECTIVES.template.md
    ├── 01-CANON.template.md
    ├── 02-CAST.template.md
    ├── 03-CHARACTER.template.md
    └── 04-STATE.template.md
```

---

## How to use

### Starting a session

1. Open `BOOTSTRAP.md`. Copy its contents.
2. Paste into a fresh Claude conversation as the first message.
3. Claude will acknowledge the canon and re-state the current scene in its own
   words. Verify it has the load-bearing facts (especially anything in
   `04-STATE.md` under **Do Not Collapse**).
4. Play.

### During a session

- When Claude emits a ```state-delta``` block, paste it into a scratch buffer.
  Don't interrupt the scene to file it.
- If Claude *doesn't* emit a delta after a beat that clearly changed state
  (a roll happened, an NPC revealed something, the location shifted), prompt:
  > Emit a state-delta for what just changed.

### Between sessions

- Open the scratch buffer. Apply each delta to the right file
  (`02-CAST.md`, `04-STATE.md`, etc.).
- Bump `04-STATE.md`'s `last_updated` field.
- If the canon itself changed (you canonised something Claude improvised that
  you liked), promote it from `04-STATE.md` to `01-CANON.md`.

### When context gets long mid-session

If a single session runs long enough that Claude starts drifting, paste the
**volatile tier only** (`04-STATE.md` + the most recent `state-delta` blocks)
as a refresher message. You don't need to reload `01-CANON.md` — that's
already in-context.

---

## Design principles baked into the docs

- **Stable vs volatile separation.** Things that change every turn live in one
  file. Things that never change live in another. This means small edits
  between sessions and big edits never.
- **Explicit ambiguity flags.** Anything that *must remain unresolved* is
  marked `[DO NOT COLLAPSE]`. Without this, models default to resolving
  ambiguity for narrative tidiness.
- **Locked consequences.** Dice results aren't just logged — they're paired
  with the *interpretation* the DM committed to. An 18-WIS roll that "caught
  what neither woman was saying" stays caught.
- **Voice anchors.** Each NPC entry includes a one-line voice/accent note and
  a remembered phrase. This is what survives token compression in the model's
  internal representation when literal text doesn't.
- **Source-of-truth ordering.** When canon and improvisation conflict, canon
  wins. The DM directives explicitly tell Claude this.
