#!/usr/bin/env node
// ============================================================
// AUTOMATED GAME TEST — Full end-to-end simulation
// Runs every route as a simulated human player from world
// creation through 8 DM turns, combat, oracle, shop, eval.
//
// Usage:
//   node scripts/test-game.mjs                  (full test)
//   node scripts/test-game.mjs --skip-genesis   (skip 4-min world build, use saved fixture)
//   node scripts/test-game.mjs --save-fixture   (run genesis + save world/char to fixture)
//
// Requires the Next.js dev server running: npm run dev
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { performance } from 'perf_hooks';

const BASE      = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const FIXTURE   = new URL('./fixtures/world-snapshot.json', import.meta.url).pathname;
const SKIP      = process.argv.includes('--skip-genesis');
const SAVE      = process.argv.includes('--save-fixture');

// ── Colour helpers ────────────────────────────────────────────────
const G = (s) => `\x1b[32m${s}\x1b[0m`;  // green
const R = (s) => `\x1b[31m${s}\x1b[0m`;  // red
const Y = (s) => `\x1b[33m${s}\x1b[0m`;  // yellow
const B = (s) => `\x1b[36m${s}\x1b[0m`;  // blue/cyan
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

// ── Result tracking ───────────────────────────────────────────────
const results = [];
function pass(label, detail = '') {
  results.push({ ok: true, label });
  console.log(G(`  ✓ ${label}`) + (detail ? DIM(` — ${detail}`) : ''));
}
function fail(label, err) {
  results.push({ ok: false, label, err: String(err) });
  console.log(R(`  ✗ ${label}`) + ` — ${String(err)}`);
}

// ── Utilities ─────────────────────────────────────────────────────
async function collectStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  return text;
}

function elapsed(start) {
  return `${((performance.now() - start) / 1000).toFixed(1)}s`;
}

function preview(text, len = 120) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > len ? clean.slice(0, len) + '…' : clean;
}

// ── Step 1: Health check ──────────────────────────────────────────
async function checkServer() {
  console.log(B('\n══ 1. Server health check ══'));
  try {
    const t = performance.now();
    const res = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
    // Any HTTP response (even 500) means the server is up
    pass('Server reachable', `${BASE} — HTTP ${res.status} — ${elapsed(t)}`);
    return true;
  } catch (e) {
    fail('Server reachable', e.message + '. Is `npm run dev` running?');
    return false;
  }
}

// ── Step 2: World Genesis (streaming NDJSON) ──────────────────────
async function runWorldGenesis() {
  const charInput = {
    name: 'Aerin Duskwalker',
    race: 'half-elf',
    class: 'rogue',
    background: 'criminal',
    creationMode: 'quick-spark',
    abilityScoreMethod: 'standard-array',
    abilityScores: { str: 10, dex: 16, con: 12, int: 14, wis: 10, cha: 13 },
    playerSentence: 'A former guild thief turned reluctant hero',
    gender: 'female',
  };

  console.log(B('\n══ 2. World Genesis (streaming, ~3-4 min) ══'));
  console.log(Y(`  Building world for "${charInput.name}" — this will take a few minutes…`));

  const t = performance.now();
  let res;
  try {
    res = await fetch(`${BASE}/api/world-genesis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character: charInput, userId: 'test-runner' }),
      signal: AbortSignal.timeout(900_000), // 15 min max
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    fail('World genesis request', e.message);
    return null;
  }

  // Parse NDJSON stream line by line
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lastStepLabel = '';
  let completePayload = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete last chunk

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let parsed;
        try { parsed = JSON.parse(trimmed); } catch { continue; }

        if (parsed.status === 'step_complete') {
          lastStepLabel = parsed.stepName ?? `Step ${parsed.step}`;
          process.stdout.write(DIM(`    [${parsed.step}/14] ${lastStepLabel} (${elapsed(t)})\n`));
        } else if (parsed.status === 'complete') {
          completePayload = parsed.data;
        } else if (parsed.error) {
          fail('World genesis', parsed.error);
          return null;
        }
      }
    }
  } catch (e) {
    fail('World genesis stream', e.message);
    return null;
  }

  if (!completePayload?.world || !completePayload?.character) {
    fail('World genesis', 'No world/character in final payload');
    return null;
  }

  pass('World genesis', `"${completePayload.world.worldName}" — ${elapsed(t)}`);
  console.log(DIM(`    Genre: ${completePayload.world.primaryGenre} | World type: ${completePayload.world.worldType}`));
  console.log(DIM(`    Villain: ${completePayload.world.villainCore?.name ?? 'unknown'}`));
  console.log(DIM(`    Threat: ${completePayload.world.mainThreat?.name ?? 'unknown'}`));

  return completePayload;
}

// ── Step 3: Opening Scene ─────────────────────────────────────────
async function runOpeningScene(world, character, worldId, characterId) {
  console.log(B('\n══ 3. Opening scene ══'));
  const t = performance.now();
  try {
    const res = await fetch(`${BASE}/api/world-genesis/opening-scene`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world, character, worldId, characterId }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const text = await collectStream(res);
    if (text.length < 50) throw new Error('Response too short');
    pass('Opening scene', `${text.length} chars — ${elapsed(t)}`);
    console.log(DIM(`    "${preview(text)}"`));
    return text;
  } catch (e) {
    fail('Opening scene', e.message);
    return null;
  }
}

// ── Step 4: Ambient audio ─────────────────────────────────────────
async function testAmbient() {
  console.log(B('\n══ 4. Ambient audio ══'));
  const scenes = ['tavern', 'dungeon', 'combat', 'wilderness'];
  for (const scene of scenes) {
    const t = performance.now();
    try {
      const res = await fetch(`${BASE}/api/ambient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneType: scene }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.previewUrl) throw new Error(json.error ?? 'No previewUrl in response');
      pass(`Ambient: ${scene}`, `${json.title ?? 'unnamed'} — ${elapsed(t)}`);
    } catch (e) {
      fail(`Ambient: ${scene}`, e.message);
    }
  }
}

// ── Step 5: DM turns ──────────────────────────────────────────────
async function buildDMBody(world, character, messages) {
  return {
    messages,
    character,
    world,
    activeQuests: [],
    knownNPCs: [],
    combatState: null,
  };
}

const PLAYER_ACTIONS = [
  'I look around slowly, taking in every detail of my surroundings.',
  'I approach the nearest figure and introduce myself, studying their reaction carefully.',
  'I examine the area for anything unusual — hidden doors, traps, or signs of recent activity.',
  'I ask if anyone knows about recent disappearances in this area.',
  'I notice something suspicious and follow it cautiously, keeping my hand near my blade.',
  'I attempt to pick the lock on the old wooden chest in the corner.',
  'I draw my daggers and step into a combat stance. "I\'ve been watching you. It ends here."',
  'After the confrontation, I tend to my wounds and search the area thoroughly.',
];

async function runDMTurns(world, character) {
  console.log(B('\n══ 5. DM turns (8 rounds) ══'));
  const messages = [];
  let evalTriggered = false;
  let lastDMResponse = '';

  for (let i = 0; i < PLAYER_ACTIONS.length; i++) {
    const action = PLAYER_ACTIONS[i];
    const turnNum = i + 1;
    const t = performance.now();

    messages.push({ role: 'user', content: action });

    try {
      const res = await fetch(`${BASE}/api/dm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(await buildDMBody(world, character, messages)),
        signal: AbortSignal.timeout(60_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const dmText = await collectStream(res);
      if (dmText.length < 20) throw new Error('Response too short');

      messages.push({ role: 'assistant', content: dmText });
      lastDMResponse = dmText;

      const promptVer = res.headers.get('X-Prompt-Version') ?? 'none';
      pass(`Turn ${turnNum}`, `${dmText.length} chars — ${elapsed(t)} — prompt@${promptVer}`);
      console.log(DIM(`    Player: "${preview(action, 60)}"`));
      console.log(DIM(`    DM:     "${preview(dmText, 80)}"`));

      // Trigger eval on turn 3 (simulate thumbs-down)
      if (turnNum === 3 && !evalTriggered) {
        evalTriggered = true;
        await runEvalMessage(world, character, action, dmText);
      }
    } catch (e) {
      fail(`Turn ${turnNum}`, e.message);
      messages.pop(); // remove the user message if DM failed
    }
  }

  return { messages, lastDMResponse };
}

// ── Step 6: Eval message ─────────────────────────────────────────
async function runEvalMessage(world, character, playerAction, dmResponse) {
  console.log(B('\n  ══ 5b. Eval message (triggered by 👎 on turn 3) ══'));
  const t = performance.now();
  try {
    const res = await fetch(`${BASE}/api/eval-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dmResponse,
        playerAction,
        worldType: world.worldType,
        genre: world.primaryGenre,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.scores) throw new Error('No scores in response');
    const s = json.scores;
    pass('Eval message', `overall ${json.overall ?? '?'}/5 — ${elapsed(t)}`);
    console.log(DIM(`    Brevity: ${s.brevity} | Agency: ${s.playerAgency} | Flow: ${s.storyFlow} | Mechanics: ${s.gameMechanics} | Immersion: ${s.immersion}`));
    if (json.notes) console.log(DIM(`    Notes: "${preview(json.notes, 100)}"`));
  } catch (e) {
    fail('Eval message', e.message);
  }
}

// ── Step 7: Oracle ────────────────────────────────────────────────
async function testOracle(world, character, dmMessages) {
  console.log(B('\n══ 6. Oracle ══'));
  const questions = [
    'What do I know about the main threat in this region?',
    'Is it wise for me to confront the figure I spotted, or should I wait?',
  ];

  for (const q of questions) {
    const t = performance.now();
    try {
      const res = await fetch(`${BASE}/api/oracle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: q }],
          dmMessages: dmMessages ?? [],
          character,
          world,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await collectStream(res);
      if (text.length < 10) throw new Error('Empty response');
      pass(`Oracle: "${preview(q, 50)}"`, `${text.length} chars — ${elapsed(t)}`);
      console.log(DIM(`    Response: "${preview(text, 100)}"`));
    } catch (e) {
      fail(`Oracle: "${preview(q, 40)}"`, e.message);
    }
  }
}

// ── Step 8: Combat start ──────────────────────────────────────────
async function testCombatStart(world, character) {
  console.log(B('\n══ 7. Combat ══'));
  const t = performance.now();
  let combatState = null;
  try {
    const res = await fetch(`${BASE}/api/combat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        world,
        encounterDescription: 'Two shadowy bandits blocking the alley',
        difficulty: 'moderate',
        terrain: 'urban',
        timeOfDay: 'night',
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.combatState) throw new Error('No combatState in response');
    combatState = json.combatState;
    const enemies = combatState.enemies?.map(e => e.name).join(', ') ?? 'none';
    pass('Combat start', `${combatState.enemies?.length ?? 0} enemies: ${enemies} — ${elapsed(t)}`);
    return combatState;
  } catch (e) {
    fail('Combat start', e.message);
    return null;
  }
}

async function testCombatAction(character, combatState) {
  if (!combatState) { fail('Combat action', 'No combat state from prior step'); return; }
  const t = performance.now();
  try {
    const firstEnemy = combatState.enemies?.[0];
    if (!firstEnemy) throw new Error('No enemies in combat state');

    const res = await fetch(`${BASE}/api/combat/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character,
        combatState,
        action: 'attack',
        targetId: firstEnemy.id,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const summary = json.narration ?? json.result?.description ?? (json.actionResults?.[0]?.description ?? 'ok');
    pass('Combat action', `${preview(summary, 80)} — ${elapsed(t)}`);
  } catch (e) {
    fail('Combat action', e.message);
  }
}

// ── Step 9: Shop ──────────────────────────────────────────────────
async function testShop(world, character) {
  console.log(B('\n══ 8. Shop ══'));
  const t = performance.now();
  try {
    const res = await fetch(`${BASE}/api/shop/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        world,
        shopType: 'general',
        location: 'The Crooked Lantern',
        playerLevel: character.level ?? 1,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const items = json.stock ?? json.items ?? [];
    pass('Shop generate', `${items.length} items from "${json.shopName ?? 'shop'}" — ${elapsed(t)}`);
    if (items.length > 0) {
      console.log(DIM(`    Items: ${items.slice(0, 4).map(it => it.name ?? it).join(', ')}${items.length > 4 ? '…' : ''}`));
    }
  } catch (e) {
    fail('Shop generate', e.message);
  }
}

// ── Step 10: Prompt wizard ────────────────────────────────────────
async function testPromptWizard(world, character, thumbsDownMessages) {
  console.log(B('\n══ 9. Prompt wizard ══'));
  if (thumbsDownMessages.length === 0) {
    console.log(Y('  (skipped — no 👎 messages collected)'));
    return;
  }
  const t = performance.now();
  try {
    const res = await fetch(`${BASE}/api/prompt-wizard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thumbsDownMessages,
        genre: world.primaryGenre,
        promptSnippet: `You are the DM for a ${world.primaryGenre} world.`,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.suggestions?.length) throw new Error('No suggestions returned');
    pass('Prompt wizard', `${json.suggestions.length} suggestions — ${elapsed(t)}`);
    json.suggestions.slice(0, 2).forEach((s, i) => {
      console.log(DIM(`    [${i+1}] ${s.title}: ${preview(s.description, 80)}`));
    });
  } catch (e) {
    fail('Prompt wizard', e.message);
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const startTime = performance.now();
  console.log(B('\n╔═══════════════════════════════════════════╗'));
  console.log(B('║   RPG AUTOMATED GAME TEST                 ║'));
  console.log(B('╚═══════════════════════════════════════════╝'));
  console.log(DIM(`  Target: ${BASE}`));
  console.log(DIM(`  Mode: ${SKIP ? 'SKIP GENESIS (fixture)' : SAVE ? 'FULL + SAVE FIXTURE' : 'FULL'}`));
  console.log(DIM(`  ${new Date().toLocaleString()}\n`));

  // ── Health check ────────────────────────────────────────────────
  const alive = await checkServer();
  if (!alive) {
    console.log(R('\n  Cannot reach server. Aborting.\n'));
    process.exit(1);
  }

  let world, character, worldId, characterId;

  // ── World Genesis or fixture ─────────────────────────────────────
  if (SKIP && existsSync(FIXTURE)) {
    console.log(B('\n══ 2. World Genesis (loading fixture) ══'));
    const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'));
    world = fixture.world;
    character = fixture.character;
    worldId = fixture.worldId ?? 'local';
    characterId = fixture.characterId ?? 'local';
    pass('Fixture loaded', `"${world.worldName}"`);
  } else {
    const payload = await runWorldGenesis();
    if (!payload) {
      console.log(R('\n  World genesis failed. Aborting.\n'));
      process.exit(1);
    }
    world = payload.world;
    character = payload.character;
    worldId = payload.worldId ?? 'local';
    characterId = payload.characterId ?? 'local';

    if (SAVE || !existsSync(FIXTURE)) {
      try {
        const dir = new URL('./fixtures/', import.meta.url).pathname;
        try { mkdirSync(dir, { recursive: true }); } catch {}
        writeFileSync(FIXTURE, JSON.stringify({ world, character, worldId, characterId }, null, 2));
        console.log(DIM(`  Fixture saved to scripts/fixtures/world-snapshot.json`));
      } catch (e) {
        console.log(Y(`  Warning: Could not save fixture: ${e.message}`));
      }
    }
  }

  // ── Opening scene ────────────────────────────────────────────────
  const openingScene = await runOpeningScene(world, character, worldId, characterId);

  // ── Ambient ──────────────────────────────────────────────────────
  await testAmbient();

  // ── 8 DM turns (includes inline eval on turn 3) ──────────────────
  const { messages: dmMessages, lastDMResponse } = await runDMTurns(world, character);

  // ── Oracle ───────────────────────────────────────────────────────
  await testOracle(world, character, dmMessages);

  // ── Combat ───────────────────────────────────────────────────────
  console.log(B('\n══ 7. Combat ══'));
  const combatState = await testCombatStart(world, character);
  await testCombatAction(character, combatState);

  // ── Shop ─────────────────────────────────────────────────────────
  await testShop(world, character);

  // ── Prompt wizard ────────────────────────────────────────────────
  // Use turn 3 exchange as the "👎'd" message  
  const thumbsDown = dmMessages.length >= 6
    ? [{ dmResponse: dmMessages[3]?.content ?? '', playerAction: dmMessages[2]?.content ?? '' }]
    : [];
  await testPromptWizard(world, character, thumbsDown);

  // ── Summary ──────────────────────────────────────────────────────
  const passed  = results.filter(r => r.ok).length;
  const failed  = results.filter(r => !r.ok).length;
  const total   = results.length;
  const totalTime = elapsed(startTime);

  console.log(B('\n╔═══════════════════════════════════════════╗'));
  console.log(B('║   TEST SUMMARY                            ║'));
  console.log(B('╚═══════════════════════════════════════════╝'));
  console.log(`  Total:  ${total} checks`);
  console.log(G(`  Passed: ${passed}`));
  if (failed > 0) console.log(R(`  Failed: ${failed}`));
  console.log(`  Time:   ${totalTime}`);

  if (failed > 0) {
    console.log(R('\n  Failed checks:'));
    results.filter(r => !r.ok).forEach(r => {
      console.log(R(`    ✗ ${r.label}`) + ` — ${r.err}`);
    });
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(R('\nUnhandled error:'), e);
  process.exit(1);
});
