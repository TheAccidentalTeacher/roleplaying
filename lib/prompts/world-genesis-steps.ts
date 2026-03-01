// ============================================================
// WORLD GENESIS — 14-STEP HOMEBREW CAMPAIGN FACTORY
// Each step extracts a FOCUSED WORLD BIBLE from accumulated
// prior decisions, then adds EXPLICIT CROSS-REFERENCE DEMANDS
// so every name, faction, region, and NPC stays consistent.
//
// DnD meets WoW meets Elder Scrolls meets Divinity meets XCOM
// ============================================================

import type { CharacterCreationInput } from '@/lib/types/character';

// ── Types ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Acc = Record<string, any>;

export interface StepPrompt {
  system: string;
  user: string;
  maxTokens: number;
}

export interface StepDefinition {
  id: number;
  name: string;
  label: string;
  buildPrompt: (c: CharacterCreationInput, acc: Acc, playerSentence?: string) => StepPrompt;
}

// ── Shared helpers ───────────────────────────────────────────────────

function charContext(c: CharacterCreationInput, playerSentence?: string): string {
  const seed = playerSentence
    ? `\nCreative seed from the player: "${playerSentence}" — use as inspiration but go FAR beyond it.`
    : '';
  return `PLAYER CHARACTER: ${c.name}, ${c.race} ${c.class}, background: ${c.background ?? 'Adventurer'}${seed}`;
}

const JSON_RULES = `
OUTPUT RULES:
- Respond ONLY with valid JSON. No markdown fences, no explanation, no commentary.
- Every name, faction, and concept must be wholly ORIGINAL. NEVER imitate Tolkien, Forgotten Realms, Star Wars, Elder Scrolls, or any existing IP.
- Surprise even veteran RPG players with unexpected concepts.
- You MUST reference the established world facts below by their EXACT names. Do NOT invent alternative names for things that already exist.`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORLD BIBLE — Extracts focused context from accumulated results
// Instead of dumping 40K tokens of raw JSON, each step gets a curated
// briefing of ~500-2500 tokens with exactly the names and facts it needs.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BibleOpts {
  core?: boolean;
  magic?: boolean;
  history?: boolean;
  factions?: boolean;
  villain?: boolean;
  threat?: boolean;
  geography?: boolean;
  settlements?: boolean;
  companions?: boolean;
  bestiary?: boolean;
  dungeons?: boolean;
  economy?: boolean;
}

function worldBible(acc: Acc, opts: BibleOpts): string {
  if (!acc.worldName) return '';
  const L: string[] = ['\n══ ESTABLISHED WORLD FACTS (use these EXACT names) ══'];

  // ── Core identity ──
  if (opts.core) {
    L.push(`\n■ WORLD: "${acc.worldName}"`);
    L.push(`  Type: ${acc.worldType || '?'} | Genre: ${acc.primaryGenre || '?'}`);
    if (acc.narrativeTone) L.push(`  Tone: ${Array.isArray(acc.narrativeTone) ? acc.narrativeTone.join(', ') : acc.narrativeTone}`);
    if (acc.thematicCore) L.push(`  Central Theme: ${acc.thematicCore}`);
    if (acc.cosmology) L.push(`  Cosmology: ${acc.cosmology}`);
    if (acc.technologyLevel) L.push(`  Technology: ${acc.technologyLevel}`);
    if (acc.ageOfWorld) L.push(`  Age: ${acc.ageOfWorld}`);
    if (acc.afterlife) L.push(`  Afterlife: ${acc.afterlife}`);
    if (acc.time) L.push(`  Time: ${acc.time}`);
  }

  // ── Magic system ──
  if (opts.magic && acc.magicSystem) {
    const ms = acc.magicSystem;
    L.push(`\n■ MAGIC: "${ms.name}"`);
    L.push(`  ${ms.description || ''}`);
    L.push(`  Source: ${ms.source || '?'} | Cost: ${ms.cost || '?'}`);
    if (ms.schools?.length) L.push(`  Schools: ${ms.schools.join(', ')}`);
    if (ms.limitations?.length) L.push(`  Hard Limits: ${ms.limitations.join('; ')}`);
    if (ms.socialAttitude) L.push(`  Society views magic as: ${ms.socialAttitude}`);
  }
  if (opts.magic && acc.currencyNames) {
    const cn = acc.currencyNames;
    L.push(`  Currency: ${cn.primary} / ${cn.secondary} / ${cn.tertiary}`);
  }

  // ── History ──
  if (opts.history) {
    if (acc.majorHistoricalEras?.length) {
      L.push(`\n■ HISTORY:`);
      for (const era of acc.majorHistoricalEras) {
        L.push(`  • Era "${era.name}" (${era.duration || '?'}): ${era.description || ''}`);
        if (era.legacy) L.push(`    Legacy today: ${era.legacy}`);
      }
    }
    if (acc.catastrophes?.length) L.push(`  Catastrophes: ${acc.catastrophes.join('; ')}`);
    if (acc.legends?.length) {
      L.push(`  Legends: ${acc.legends.map((l: Acc) => `"${l.title}" [${l.isTrue ? 'TRUE' : 'FALSE'}] — ${l.summary || ''}`).join(' | ')}`);
    }
    if (acc.secretHistory) L.push(`  SECRET HISTORY (DM only): ${acc.secretHistory}`);
  }

  // ── Factions ──
  if (opts.factions && acc.factions?.length) {
    L.push(`\n■ FACTIONS:`);
    for (const f of acc.factions) {
      L.push(`  • "${f.name}" [${f.id}] — ${f.strength || '?'} strength, territory: ${f.territory || '?'}, alignment: ${f.alignment || '?'}`);
      L.push(`    Goals: ${f.goals?.join('; ') || '?'}`);
      if (f.leader) L.push(`    Leader: ${f.leader}`);
      if (f.secrets?.length) L.push(`    Secrets: ${f.secrets.join('; ')}`);
      if (f.resources?.length) L.push(`    Resources: ${f.resources.join(', ')}`);
    }
    if (acc.currentConflicts?.length) L.push(`  Active Conflicts: ${acc.currentConflicts.join('; ')}`);
    if (acc.powerVacuums?.length) L.push(`  Power Vacuums: ${acc.powerVacuums.join('; ')}`);
  }

  // ── Villain ──
  if (opts.villain && acc.villainCore) {
    const v = acc.villainCore;
    L.push(`\n■ VILLAIN: "${v.name}" — ${v.title || ''}`);
    L.push(`  ${v.description || ''}`);
    L.push(`  Motivation: ${v.motivation || '?'}`);
    L.push(`  History: ${v.history || '?'}`);
    L.push(`  Current Plan: ${v.currentPlan || '?'}`);
    L.push(`  Something They Love: ${v.somethingTheyLove || '?'}`);
    L.push(`  Genuine Argument: ${v.genuineArgument || '?'}`);
    if (v.weaknesses?.length) L.push(`  Weaknesses: ${v.weaknesses.join('; ')}`);
    if (v.resources?.length) L.push(`  Resources: ${v.resources.join(', ')}`);
  }

  // ── Threat, Artifact, Prophecy ──
  if (opts.threat) {
    if (acc.mainThreat) {
      const t = acc.mainThreat;
      L.push(`\n■ MAIN THREAT: "${t.name}"`);
      L.push(`  Nature: ${t.nature || '?'} | Origin: ${t.origin || '?'}`);
      L.push(`  Current Phase: ${t.currentPhase || '?'}`);
      if (t.escalation?.length) L.push(`  Escalation: ${t.escalation.join(' → ')}`);
      if (t.weakness) L.push(`  Weakness: ${t.weakness}`);
    }
    if (acc.centralArtifact) {
      const a = acc.centralArtifact;
      L.push(`  Artifact: "${a.name}" — ${a.nature || '?'}, at ${a.currentLocation || '?'}, guarded by ${a.guardedBy || '?'}`);
    }
    if (acc.prophecy) {
      L.push(`  Prophecy: "${acc.prophecy.text || '?'}"`);
      L.push(`    People think: ${acc.prophecy.interpretation || '?'} | Truth: ${acc.prophecy.truth || '?'}`);
    }
  }

  // ── Geography ──
  if (opts.geography && acc.geography?.length) {
    L.push(`\n■ REGIONS:`);
    for (const r of acc.geography) {
      const locs = r.knownLocations?.map((loc: Acc) => `${loc.name} (${loc.type})`).join(', ') || 'none mapped';
      L.push(`  • "${r.name}" [${r.id}] — ${r.terrain || '?'}, ${r.climate || '?'}, controlled by ${r.controlledBy || '?'}, danger ${r.dangerLevel || '?'}/10`);
      L.push(`    Locations: ${locs}`);
    }
  }

  // ── Settlements ──
  if (opts.settlements && acc.settlements?.length) {
    L.push(`\n■ SETTLEMENTS:`);
    for (const s of acc.settlements) {
      const npcs = s.keyNPCs?.map((n: Acc) => `${n.name} (${n.role})`).join(', ') || 'none';
      const districts = s.districts?.map((d: Acc) => d.name).join(', ') || 'none';
      L.push(`  • "${s.name}" [${s.id}] — ${s.type} in ${s.region || '?'}, pop ${s.population || '?'}, faction: ${s.controllingFaction || '?'}`);
      L.push(`    Districts: ${districts}`);
      L.push(`    Key NPCs: ${npcs}`);
      if (s.rumors?.length) L.push(`    Rumors: ${s.rumors.join('; ')}`);
    }
  }

  // ── Companions ──
  if (opts.companions && acc.companions?.length) {
    L.push(`\n■ COMPANIONS:`);
    for (const comp of acc.companions) {
      L.push(`  • "${comp.name}" [${comp.id}] — ${comp.race} ${comp.class}, role: ${comp.role}, at ${comp.recruitLocation || '?'}`);
      L.push(`    Personality: ${comp.personality || '?'}`);
      L.push(`    Personal Quest: ${comp.personalQuest || '?'}`);
      if (comp.secretOrFlaw) L.push(`    Secret/Flaw: ${comp.secretOrFlaw}`);
    }
  }

  // ── Bestiary ──
  if (opts.bestiary && acc.bestiary?.length) {
    L.push(`\n■ BESTIARY:`);
    for (const cr of acc.bestiary) {
      L.push(`  • "${cr.name}" [${cr.id}] — ${cr.type}, CR ${cr.challengeRating}, habitat: ${cr.habitat?.join(', ') || '?'}${cr.isUnique ? ' [UNIQUE BOSS]' : ''}`);
      if (cr.loot?.length) L.push(`    Drops: ${cr.loot.join(', ')}`);
      if (cr.loreConnection) L.push(`    Lore: ${cr.loreConnection}`);
    }
  }

  // ── Dungeons ──
  if (opts.dungeons && acc.dungeons?.length) {
    L.push(`\n■ DUNGEONS:`);
    for (const d of acc.dungeons) {
      L.push(`  • "${d.name}" [${d.id}] — ${d.type} in ${d.location || '?'}, LVL ${d.levelRange?.min || '?'}-${d.levelRange?.max || '?'}, boss: ${d.boss || '?'}`);
      if (d.factionTies?.length) L.push(`    Faction Ties: ${d.factionTies.join(', ')}`);
    }
  }

  // ── Economy ──
  if (opts.economy && acc.economy) {
    L.push(`\n■ ECONOMY:`);
    if (acc.economy.tradeGoods?.length) {
      L.push(`  Trade Goods: ${acc.economy.tradeGoods.map((g: Acc) => `${g.name} (${g.abundance}, from ${g.producedIn?.join('/')})`).join('; ')}`);
    }
    if (acc.economy.rareMaterials?.length) {
      L.push(`  Rare Materials: ${acc.economy.rareMaterials.map((m: Acc) => `${m.name} — source: ${m.source}`).join('; ')}`);
    }
  }

  return L.join('\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1 — WORLD CONCEPT & COSMOLOGY
// The high concept: what KIND of world, its genre DNA, tone, and
// cosmic structure. This is the creative seed everything else grows from.
// No prior context needed — this IS the seed.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step01_worldConcept(c: CharacterCreationInput, _acc: Acc, playerSentence?: string): StepPrompt {
  return {
    maxTokens: 8000,
    system: `You are a WORLD ARCHITECT. Create the high concept for an original RPG world.
${charContext(c, playerSentence)}
${JSON_RULES}

Return JSON:
{
  "worldName": "string — evocative, original",
  "worldType": "string — e.g. dying-world, clockwork-fantasy, post-singularity",
  "primaryGenre": "string",
  "genreBlends": ["2-3 genre influences"],
  "narrativeTone": ["2-3 tones — e.g. dark-unforgiving, epic-heroic"],
  "genreArtStyle": "string — visual style for this world",
  "thematicCore": "string — the central philosophical question this world explores",
  "cosmology": "string — the shape and nature of the universe",
  "afterlife": "string — what happens after death",
  "time": "string — how time works (linear, cyclical, broken, etc.)",
  "ageOfWorld": "string",
  "technologyLevel": "string"
}`,
    user: `Design a world concept for ${c.name}, a ${c.race} ${c.class}. Make it feel like a world that has never existed before.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2 — MAGIC & POWER SYSTEMS
// Needs: core (world type, cosmology, technology)
// Cross-refs: magic must FIT the cosmology and world type
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step02_magicSystem(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true });
  return {
    maxTokens: 8000,
    system: `You are continuing to build the RPG world "${acc.worldName || '?'}". Design its magic and power system.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- The magic system MUST logically fit the cosmology: "${acc.cosmology || '?'}"
- The magic's source must connect to the world type: "${acc.worldType || '?'}"
- Consider how a ${c.class} would interact with this magic system
- The currency names should reflect the world's culture and technology level: "${acc.technologyLevel || '?'}"
- The magic's social attitude should connect to the thematic core: "${acc.thematicCore || '?'}"
${JSON_RULES}

Return JSON:
{
  "magicSystem": {
    "name": "string",
    "description": "string — 2-3 sentences",
    "source": "string — where power comes from (must relate to ${acc.cosmology || 'the cosmology'})",
    "cost": "string — what using it costs",
    "limitations": ["3-5 hard limits"],
    "socialAttitude": "string — how society views it",
    "schools": ["3-6 disciplines/schools"]
  },
  "currencyNames": {
    "primary": "string",
    "secondary": "string",
    "tertiary": "string"
  }
}`,
    user: `Design the magic system and currency for "${acc.worldName || 'the world'}". The world is a ${acc.worldType || 'fantasy'} setting with ${acc.technologyLevel || 'medieval'} technology and a cosmology of "${acc.cosmology || 'unknown'}". How does power work here, and how would a ${c.class} wield it?`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — HISTORY & LEGENDS
// Needs: core, magic
// Cross-refs: eras must involve the magic system, catastrophes
// shaped the cosmology, legends reference the thematic core
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step03_history(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true });
  const magicName = acc.magicSystem?.name || 'the magic system';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create its deep history.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- At least one era must explain the ORIGIN or DISCOVERY of "${magicName}"
- Catastrophes must be consistent with the cosmology — they shaped the world described above
- At least one legend must reference "${magicName}" or its schools
- The secret history must connect to the thematic core: "${acc.thematicCore || '?'}"
- Legends should foreshadow events a ${c.class} might encounter
- The afterlife ("${acc.afterlife || '?'}") should factor into at least one legend or era
${JSON_RULES}

Return JSON:
{
  "majorHistoricalEras": [
    {
      "name": "string",
      "description": "string",
      "duration": "string",
      "keyEvents": ["2-4 events"],
      "legacy": "string — how this era still affects the present"
    }
  ],
  "catastrophes": ["3-5 world-shaping disasters"],
  "legends": [
    {
      "title": "string",
      "summary": "string",
      "isTrue": true,
      "relevanceToPlayer": "string — how this matters to a ${c.race} ${c.class}"
    }
  ],
  "secretHistory": "string — the hidden truth connecting world events (DM eyes only)"
}

Generate 3-5 eras, 3-5 legends. At least one legend should be false.`,
    user: `Write the deep history and legends of "${acc.worldName || 'the world'}". The magic system is called "${magicName}" and its source is "${acc.magicSystem?.source || '?'}". What ages has this world passed through, and what stories do people tell about them?`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4 — FACTIONS & POLITICAL LANDSCAPE
// Needs: core, magic, history
// Cross-refs: factions react to magic, history, and each other
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step04_factions(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, history: true });
  const magicName = acc.magicSystem?.name || 'the magic system';
  const eraNames = acc.majorHistoricalEras?.map((e: Acc) => `"${e.name}"`).join(', ') || 'the historical eras';
  const catList = acc.catastrophes?.join('; ') || 'the catastrophes';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create the political landscape.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Every faction MUST have an opinion about "${magicName}" (pro, anti, or neutral with reason)
- At least 2 factions must trace their origins to specific historical eras: ${eraNames}
- At least 1 faction must have been shaped by the catastrophes: ${catList}
- The secret history ("${acc.secretHistory || '?'}") should connect to at least 1 faction's secrets
- Factions MUST have conflicting goals that create interesting dynamics
- At least 1 faction should be relevant to a ${c.class}'s interests
${JSON_RULES}

Return JSON:
{
  "factions": [
    {
      "id": "faction-1",
      "name": "string",
      "description": "string",
      "leader": "string",
      "goals": ["2-3 goals"],
      "strength": "weak | moderate | strong | dominant",
      "alignment": "string",
      "territory": "string — general area they control",
      "attitude_toward_player": "hostile | unfriendly | neutral | friendly | allied",
      "secrets": ["1-3 secrets — at least 1 must connect to established lore"],
      "resources": ["2-4 resources"],
      "magicStance": "string — their position on ${magicName}"
    }
  ],
  "currentConflicts": ["3-5 ongoing wars, disputes, or crises between NAMED factions"],
  "powerVacuums": ["2-3 opportunities for ambitious characters"]
}

Generate 5-7 factions. At least 2 should be hostile to each other. Current conflicts must name the specific factions involved.`,
    user: `Create the factions for "${acc.worldName || 'the world'}". The magic "${magicName}" divides society (${acc.magicSystem?.socialAttitude || '?'}). The world survived ${catList}. Who holds power now, who lost it, and what are they fighting over?`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5 — THE VILLAIN
// Needs: core, magic, history, factions
// Cross-refs: villain must connect to SPECIFIC factions by name,
// reference the secret history, use or exploit the magic system
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step05_villain(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, history: true, factions: true });
  const factionNames = acc.factions?.map((f: Acc) => `"${f.name}"`).join(', ') || 'the factions';
  const magicName = acc.magicSystem?.name || 'the magic system';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create the MAIN VILLAIN.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- The villain MUST be connected to at least 2 of these factions: ${factionNames}
  (as former member, hidden puppet master, sworn enemy, or secret patron)
- The villain's history MUST reference at least 1 specific historical era or catastrophe
- The villain MUST have a relationship with "${magicName}" — they either exploit it, were twisted by it, or seek to control/destroy it
- The villain's genuine argument should connect to the thematic core: "${acc.thematicCore || '?'}"
- The secret history ("${acc.secretHistory || '?'}") should factor into the villain's backstory

VILLAIN RULES:
- Comprehensible, even sympathetic motivation
- They must love something genuinely
- There was a moment they could have been saved
- They have a genuine argument — something they're RIGHT about
- NEVER pure evil. A person who made terrible choices for understandable reasons
${JSON_RULES}

Return JSON:
{
  "villainCore": {
    "name": "string",
    "title": "string",
    "description": "string — physical and personality",
    "motivation": "string — human, comprehensible",
    "history": "string — how they became what they are (MUST reference specific era/catastrophe/faction)",
    "somethingTheyLove": "string",
    "missedPoint": "string — when they could have been stopped",
    "genuineArgument": "string — what they're right about (connects to ${acc.thematicCore || 'the theme'})",
    "currentPlan": "string — what they're doing RIGHT NOW",
    "factionConnections": ["which factions they're connected to and HOW"],
    "magicRelationship": "string — their relationship with ${magicName}",
    "resources": ["3-5 resources"],
    "weaknesses": ["2-4 weaknesses"],
    "archetype": "string"
  }
}`,
    user: `Create the main villain of "${acc.worldName || 'the world'}". They must be entangled with these factions: ${factionNames}. They have a history with "${magicName}". The secret history ("${acc.secretHistory || '?'}") is part of who they are. Make them unforgettable.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 6 — THE MAIN THREAT & PROPHECY
// Needs: core, magic, history, factions, villain
// Cross-refs: threat connects to villain's plan, artifact
// relates to magic system, prophecy references the player
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step06_threat(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, history: true, factions: true, villain: true });
  const villainName = acc.villainCore?.name || 'the villain';
  const magicName = acc.magicSystem?.name || 'the magic system';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create the main threat, central artifact, and prophecy.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- The main threat MUST connect to "${villainName}"'s current plan: "${acc.villainCore?.currentPlan || '?'}"
  (The threat may be bigger than the villain — something they're unleashing or awakening)
- The central artifact MUST relate to "${magicName}" — it amplifies, breaks, or rewrites the rules of magic
- The prophecy text MUST reference the thematic core: "${acc.thematicCore || '?'}"
- The prophecy MUST have relevance to ${c.name} specifically (a ${c.race} ${c.class})
- The threat's escalation stages should involve specific factions being affected
- The artifact's history should connect to a specific historical era or legend
${JSON_RULES}

Return JSON:
{
  "mainThreat": {
    "name": "string",
    "nature": "string — what IS this threat",
    "origin": "string — must reference established lore",
    "motivation": "string",
    "connectionToVillain": "string — how ${villainName} relates to this threat",
    "currentPhase": "string",
    "escalation": ["4-6 stages — name specific factions/regions affected at each stage"],
    "weakness": "string — how it COULD be stopped"
  },
  "centralArtifact": {
    "name": "string",
    "description": "string",
    "nature": "string — its relationship to ${magicName}",
    "currentLocation": "string",
    "guardedBy": "string",
    "dangerOfUse": "string",
    "history": "string — connect to a specific era or legend"
  },
  "prophecy": {
    "text": "string — poetic prophetic text (must reference ${acc.thematicCore || 'the theme'})",
    "interpretation": "string — what people THINK it means",
    "truth": "string — what it REALLY means",
    "relevanceToPlayer": "string — why ${c.name} the ${c.race} ${c.class} matters"
  }
}`,
    user: `Create the main threat facing "${acc.worldName || 'the world'}". "${villainName}" is ${acc.villainCore?.currentPlan || 'executing their plan'}. The threat connects to "${magicName}". Write a prophecy that ties to "${acc.thematicCore || 'the theme'}" and hints at ${c.name}'s role.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 7 — GEOGRAPHY & REGIONS
// Needs: core, magic, history (catastrophes), factions (territories)
// Cross-refs: regions controlled by NAMED factions, terrain shaped
// by specific catastrophes, magic influenced by geography
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step07_geography(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, history: true, factions: true, villain: true, threat: true });
  const factionNames = acc.factions?.map((f: Acc) => `"${f.name}" (claims: ${f.territory || '?'})`).join(', ') || 'the factions';
  const catList = acc.catastrophes?.join('; ') || 'the catastrophes';
  const villainName = acc.villainCore?.name || 'the villain';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create the geography and regions.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- EVERY region must have a "controlledBy" that references a SPECIFIC faction name: ${factionNames}
  (or "contested" between named factions, or "unclaimed")
- The terrain and climate must be consistent with the world type: "${acc.worldType || '?'}"
- At least 2 regions must show visible scars from these catastrophes: ${catList}
- "${villainName}"'s base/stronghold must be in one of these regions
- The central artifact "${acc.centralArtifact?.name || '?'}" is at "${acc.centralArtifact?.currentLocation || '?'}" — place it in a specific region
- Magic ("${acc.magicSystem?.name || '?'}") should influence at least 1 region's landscape
- Include at least 1 region that would be HOME or natural territory for a ${c.race}
- Map positions (x,y from 0-1) should be geographically coherent
${JSON_RULES}

Return JSON:
{
  "geography": [
    {
      "id": "region-1",
      "name": "string",
      "description": "string",
      "terrain": "string",
      "climate": "string",
      "controlledBy": "EXACT faction name from above, or contested/unclaimed",
      "dangerLevel": 1,
      "knownLocations": [
        { "name": "string", "type": "city|town|village|dungeon|ruin|landmark|wilderness|camp|fortress|temple|port", "description": "string", "significance": "string" }
      ],
      "magicInfluence": "string — how ${acc.magicSystem?.name || 'magic'} manifests here",
      "catastropheScar": "string — visible effect of past catastrophe, or 'none'",
      "mapPosition": { "x": 0.5, "y": 0.3 },
      "pointsOfInterest": ["2-4 items"],
      "travelNotes": "string"
    }
  ]
}

Generate 5-8 regions with 2-5 locations each. Every faction must control at least 1 region.`,
    user: `Map the geography of "${acc.worldName || 'the world'}". Assign each region to a specific faction: ${factionNames}. The terrain was shaped by: ${catList}. "${villainName}" needs a stronghold. Where is everything?`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 8 — SETTLEMENTS & CITIES
// Needs: core, magic, factions, geography
// Cross-refs: settlements in NAMED regions, controlled by NAMED
// factions, NPCs who care about established conflicts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step08_settlements(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, factions: true, villain: true, geography: true });
  const regionNames = acc.geography?.map((r: Acc) => `"${r.name}" (${r.terrain}, controlled by ${r.controlledBy})`).join(', ') || 'the regions';
  const conflicts = acc.currentConflicts?.join('; ') || 'the ongoing conflicts';
  const currency = acc.currencyNames ? `${acc.currencyNames.primary}/${acc.currencyNames.secondary}/${acc.currencyNames.tertiary}` : 'local currency';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Detail the major settlements.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Every settlement MUST be in a SPECIFIC region from: ${regionNames}
- Every settlement's "controllingFaction" MUST be the faction that controls that region
- Key NPCs MUST have opinions about ongoing conflicts: ${conflicts}
- NPC secrets should connect to faction secrets or the secret history
- Rumors should seed side quests involving established factions, the villain, or the prophecy
- Services and economy should reference the currency: ${currency}
- At least 1 settlement should be near "${acc.centralArtifact?.name || '?'}"
- Every NPC has a secret. Every settlement has rumors connected to ESTABLISHED lore.
${JSON_RULES}

Return JSON:
{
  "settlements": [
    {
      "id": "settlement-1",
      "name": "string",
      "type": "capital | city | town | village | outpost | camp | port | fortress",
      "region": "EXACT region name from above",
      "population": "string — e.g. ~5,000",
      "government": "string",
      "controllingFaction": "EXACT faction name",
      "description": "string",
      "districts": [
        { "name": "string", "description": "string", "notableLocations": ["2-3"], "dangerLevel": 1, "atmosphere": "string" }
      ],
      "keyNPCs": [
        { "name": "string", "role": "string", "personality": "string", "secret": "string — connects to established lore", "questHook": "string", "factionLoyalty": "string — which faction" }
      ],
      "services": ["inn", "smith", "temple", "market"],
      "rumors": ["2-4 rumors — each references established names/events"],
      "laws": ["1-3 local laws"],
      "economicProfile": "string"
    }
  ]
}

Detail 3-5 major settlements. Each should have 2-3 districts and 3-5 key NPCs. NPCs must reference established factions and conflicts.`,
    user: `Detail the major settlements of "${acc.worldName || 'the world'}". Place them in these regions: ${regionNames}. The ongoing conflicts are: ${conflicts}. NPCs should take sides.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 9 — COMPANIONS & PARTY MEMBERS
// Needs: core, magic, factions, villain, geography, settlements
// Cross-refs: companions found in NAMED settlements, connected
// to NAMED factions, opinions about the villain, complementary roles
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step09_companions(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, factions: true, villain: true, threat: true, geography: true, settlements: true });
  const settlementNames = acc.settlements?.map((s: Acc) => `"${s.name}" (${s.type} in ${s.region})`).join(', ') || 'the settlements';
  const factionNames = acc.factions?.map((f: Acc) => `"${f.name}"`).join(', ') || 'the factions';
  const villainName = acc.villainCore?.name || 'the villain';
  const magicName = acc.magicSystem?.name || 'the magic system';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create recruitable companion characters.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Every companion's "recruitLocation" MUST be a SPECIFIC settlement or location from: ${settlementNames}
- Every companion MUST have a clear connection to at least 1 faction: ${factionNames}
  (as member, defector, enemy, or secret agent)
- At least 2 companions must have strong opinions about "${villainName}"
- Companions' personal quests MUST intersect with established lore (factions, threat, prophecy)
- At least 1 companion should use "${magicName}" in their combat style
- At least 1 companion should have been affected by a historical catastrophe or era
- Companion relationships with EACH OTHER must reflect faction tensions
- The party MUST fill archetypes that complement a ${c.class}: tank, healer, DPS, support

COMPANION DESIGN (think Mass Effect / Dragon Age / Divinity):
- Each companion is a full character with personality, not a stat block
- Loyalty triggers connect to gameplay decisions about factions and morality
- Betrayal triggers are things the player might actually do (not cartoonish evil)
- The "secretOrFlaw" should create dramatic tension during the campaign
${JSON_RULES}

Return JSON:
{
  "companions": [
    {
      "id": "companion-1",
      "name": "string",
      "race": "string",
      "class": "string",
      "level": 1,
      "role": "tank | healer | dps-melee | dps-ranged | support | utility",
      "personality": "string — 2-3 sentences",
      "backstory": "string — MUST reference specific faction/era/event",
      "motivation": "string — what drives them",
      "factionConnection": "string — which faction and how",
      "recruitLocation": "EXACT settlement or location name",
      "recruitCondition": "string — what triggers joining",
      "loyaltyTriggers": ["3-4 actions — connect to faction/moral choices"],
      "betrayalTriggers": ["2-3 actions — realistic player decisions"],
      "personalQuest": "string — MUST intersect with main storyline",
      "combatStyle": "string",
      "signature": "string — signature ability",
      "relationships": [
        { "companionId": "companion-2", "attitude": "friendly | rival | hostile | neutral | romantic-potential", "reason": "string — connects to faction tensions" }
      ],
      "dialogueStyle": "string — how they speak",
      "secretOrFlaw": "string — creates dramatic tension",
      "villainOpinion": "string — what they think about ${villainName}"
    }
  ]
}

Generate 5-7 companions. Cover tank, healer, DPS, and support roles.
At least one morally grey. At least one pair with tension. At least one with ties to ${villainName}.`,
    user: `Create companion characters for "${acc.worldName || 'the world'}". ${c.name} is a ${c.class} who needs allies. Place them in: ${settlementNames}. They must take sides in faction conflicts: ${factionNames}. Some must know about "${villainName}".`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 10 — BESTIARY & CREATURES
// Needs: core, magic, geography, history
// Cross-refs: creatures native to NAMED regions, connected to
// magic system, some tied to villain or historical events
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step10_bestiary(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, history: true, villain: true, geography: true });
  const regionList = acc.geography?.map((r: Acc) => `"${r.name}" (${r.terrain}, ${r.climate})`).join(', ') || 'the regions';
  const magicName = acc.magicSystem?.name || 'the magic system';
  const villainName = acc.villainCore?.name || 'the villain';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create the bestiary — creatures native to this world.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Every creature's habitat MUST reference SPECIFIC regions: ${regionList}
- Creatures must feel endemic to "${acc.worldName || '?'}" — shaped by its "${acc.worldType || '?'}" nature
- At least 3 creatures must be connected to "${magicName}" (mutated by it, feed on it, produce it)
- At least 1 creature must be a weapon or servant of "${villainName}"
- At least 1 creature must be a remnant of a historical catastrophe
- Show an ECOSYSTEM: predators and prey in the same region, symbiotic relationships
- Loot drops should include materials useful for crafting (set up step 12)
- loreConnection MUST reference specific established facts (era names, magic schools, faction names)
${JSON_RULES}

Return JSON:
{
  "bestiary": [
    {
      "id": "creature-1",
      "name": "string — original, evocative, fits the world",
      "type": "beast | undead | elemental | construct | aberration | fiend | celestial | dragon | monstrosity | plant | ooze",
      "challengeRating": 1,
      "habitat": ["EXACT region names from above"],
      "description": "string — appearance and behavior",
      "behavior": "string — combat and exploration behavior",
      "loot": ["2-3 drops — include craftable materials"],
      "weaknesses": ["1-2"],
      "resistances": ["0-2"],
      "isUnique": false,
      "loreConnection": "string — MUST reference a specific era, faction, magic school, or villain connection"
    }
  ]
}

Generate 10-15 creatures. CR 1-3 common, CR 4-7 regional threats, CR 8+ boss-tier.
Include 2-3 unique bosses. At least 1 creature per major region.`,
    user: `Create the bestiary of "${acc.worldName || 'the world'}". Creatures live in: ${regionList}. "${magicName}" has shaped evolution here. "${villainName}" commands some creatures. What hunts in these lands?`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 11 — DUNGEONS & ADVENTURE SITES
// Needs: core, magic, geography, villain, threat, bestiary, factions
// Cross-refs: dungeons in NAMED regions, bosses from bestiary,
// one must be villain's stronghold, faction ties explicit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step11_dungeons(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, factions: true, villain: true, threat: true, geography: true, bestiary: true });
  const regionList = acc.geography?.map((r: Acc) => `"${r.name}"`).join(', ') || 'the regions';
  const creatureList = acc.bestiary?.filter((cr: Acc) => cr.isUnique || cr.challengeRating >= 5)
    .map((cr: Acc) => `"${cr.name}" (CR ${cr.challengeRating})`).join(', ') || 'boss creatures';
  const villainName = acc.villainCore?.name || 'the villain';
  const artifactName = acc.centralArtifact?.name || 'the artifact';
  const magicName = acc.magicSystem?.name || 'the magic system';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Design the major dungeon and adventure sites.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Every dungeon MUST be located in a SPECIFIC region: ${regionList}
- Dungeon bosses SHOULD be specific creatures from the bestiary: ${creatureList}
  (Or named NPCs connected to factions)
- ONE dungeon MUST be "${villainName}"'s stronghold or headquarters
- At least 1 dungeon must contain or relate to "${artifactName}"
- Puzzles must fit the world's magic system: "${magicName}" — use its schools and limitations
- factionTies must reference EXACT faction names
- Traps should reflect the world's technology level: "${acc.technologyLevel || '?'}"
- Secret rooms should reward knowledge of established lore (legends, history)
- Each dungeon tells a story through its environment that CONNECTS to established history
${JSON_RULES}

Return JSON:
{
  "dungeons": [
    {
      "id": "dungeon-1",
      "name": "string",
      "location": "EXACT region name",
      "type": "dungeon | cave | tower | ruins | stronghold | labyrinth | mine | crypt | temple | lair",
      "levelRange": { "min": 1, "max": 5 },
      "floors": [
        {
          "level": 1,
          "name": "string",
          "description": "string",
          "roomCount": 6,
          "keyEncounters": ["2-3 — reference bestiary creatures by name"],
          "environmentalHazards": ["1-2"],
          "lootHighlights": ["1-2 notable items"]
        }
      ],
      "boss": "string — EXACT creature name from bestiary or named NPC",
      "lore": "string — why this place exists (reference specific historical era or event)",
      "reward": "string — what's at the end",
      "traps": ["2-4 trap types"],
      "puzzles": ["1-3 puzzles — must use ${magicName}'s rules"],
      "secretRooms": ["1-2 secrets — reward lore knowledge"],
      "factionTies": ["EXACT faction names that care about this place"]
    }
  ]
}

Design 4-6 dungeons across different regions. One MUST be ${villainName}'s stronghold. Bosses from the bestiary.`,
    user: `Design dungeons for "${acc.worldName || 'the world'}". Place them in: ${regionList}. Use these boss creatures: ${creatureList}. One is "${villainName}"'s stronghold. "${artifactName}" is guarded somewhere. Puzzles use "${magicName}".`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 12 — ECONOMY, CRAFTING & LOOT
// Needs: core, magic, geography, settlements, bestiary, factions
// Cross-refs: materials from NAMED creatures, trade between NAMED
// regions, price regions map to geography, crafting uses magic system
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step12_economyAndCrafting(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, { core: true, magic: true, factions: true, geography: true, settlements: true, bestiary: true });
  const regionNames = acc.geography?.map((r: Acc) => `"${r.name}"`).join(', ') || 'the regions';
  const creatureLoot = acc.bestiary?.flatMap((cr: Acc) => cr.loot?.map((l: string) => `${l} (from ${cr.name})`) || []).slice(0, 10).join(', ') || 'creature drops';
  const settlementNames = acc.settlements?.map((s: Acc) => `"${s.name}" in ${s.region}`).join(', ') || 'the settlements';
  const currency = acc.currencyNames ? `${acc.currencyNames.primary}/${acc.currencyNames.secondary}/${acc.currencyNames.tertiary}` : 'local currency';
  const magicName = acc.magicSystem?.name || 'the magic system';
  const conflicts = acc.currentConflicts?.join('; ') || 'the ongoing conflicts';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Create the economy, crafting, and loot systems.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Trade goods "producedIn" and "demandedIn" MUST use EXACT region names: ${regionNames}
- Rare materials "source" should reference specific bestiary creatures or dungeon locations
- Known creature drops to incorporate: ${creatureLoot}
- Price regions MUST match the geography regions exactly
- Economic tensions should connect to faction conflicts: ${conflicts}
- Crafting should use "${magicName}" — at least 1 discipline must be magical/enchanting
- Loot table items should include items useful for established quests and faction allegiances
- All prices in ${currency}
- The black market should connect to faction secrets or the villain's operations
${JSON_RULES}

Return JSON:
{
  "economy": {
    "tradeGoods": [
      { "name": "string", "baseValue": 10, "abundance": "scarce | uncommon | common | abundant", "producedIn": ["EXACT region names"], "demandedIn": ["EXACT region names"] }
    ],
    "rareMaterials": [
      { "name": "string", "description": "string", "source": "string — specific creature, dungeon, or region", "uses": ["what it crafts"], "value": 100, "dangerToObtain": "string" }
    ],
    "priceRegions": [
      { "region": "EXACT region name", "priceModifier": 1.0, "specialties": ["cheap here"], "scarcities": ["expensive here"] }
    ],
    "blackMarket": "string — connects to faction secrets or villain",
    "economicTensions": ["2-3 trade wars — reference NAMED factions and regions"]
  },
  "crafting": {
    "description": "string — how crafting works (relates to ${magicName})",
    "disciplines": [
      { "name": "string", "description": "string", "toolRequired": "string", "skillRequirements": "string" }
    ],
    "recipes": [
      { "name": "string", "discipline": "string", "inputs": [{ "material": "string — use creature drops or rare materials", "quantity": 1 }], "output": "string", "difficulty": "novice | journeyman | expert | master", "specialConditions": "string" }
    ]
  },
  "lootTables": [
    {
      "name": "string — e.g. ${acc.geography?.[0]?.name || 'Region'} Creature Drops",
      "context": "string — when to use",
      "items": [
        { "name": "string", "type": "weapon | armor | consumable | quest-item | material", "rarity": "common | uncommon | rare | epic | legendary | mythic", "description": "string", "properties": ["stat effect"], "value": 10, "loreNote": "string — connect to established lore" }
      ]
    }
  ]
}

5-8 trade goods, 4-6 rare materials, 3-4 crafting disciplines with 4-6 recipes each, 3-5 loot tables. ALL cross-referenced with established names.`,
    user: `Build the economy of "${acc.worldName || 'the world'}". Trade flows between ${regionNames}. Crafts using materials from: ${creatureLoot}. Prices in ${currency}. The conflicts (${conflicts}) disrupt trade. Connect everything to what already exists.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 13 — CAMPAIGN ARC, ENCOUNTERS & TRAVEL
// Needs: ALL prior steps
// Cross-refs: story beats in NAMED locations, involving NAMED
// companions, NAMED dungeons, NAMED creatures. The kitchen sink.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step13_campaignAndEncounters(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, {
    core: true, magic: true, factions: true, villain: true, threat: true,
    geography: true, settlements: true, companions: true, bestiary: true, dungeons: true,
  });
  const companionNames = acc.companions?.map((comp: Acc) => `"${comp.name}" [${comp.id}] at ${comp.recruitLocation}`).join(', ') || 'companions';
  const dungeonNames = acc.dungeons?.map((d: Acc) => `"${d.name}" in ${d.location}`).join(', ') || 'dungeons';
  const regionNames = acc.geography?.map((r: Acc) => `"${r.name}" [${r.id}]`).join(', ') || 'regions';
  const villainName = acc.villainCore?.name || 'the villain';
  const threatName = acc.mainThreat?.name || 'the threat';
  const creatureNames = acc.bestiary?.map((cr: Acc) => `"${cr.name}"`).join(', ') || 'creatures';
  return {
    maxTokens: 8000,
    system: `Continue building "${acc.worldName || '?'}". Map out the full campaign arc, encounter tables, and travel network.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS — THIS IS THE MOST CRITICAL STEP FOR COHERENCE:
- Story beat "location" MUST use EXACT settlement or region names
- Story beat "involvedNPCs" MUST use EXACT names from settlements, companions, or the villain
- "newCompanions" in each act MUST use EXACT companion IDs: ${companionNames}
- "villainPhase" must track "${villainName}"'s plan escalation as described in the threat
- Dungeon beats must reference EXACT dungeons: ${dungeonNames}
- Encounter table "regionId" MUST match geography region IDs: ${regionNames}
- Encounter "creatures" MUST use EXACT bestiary names: ${creatureNames}
- Travel routes "from" and "to" MUST use EXACT settlement or region names
- Travel route "controlledBy" MUST use EXACT faction names
- The campaign climax must involve "${villainName}", "${threatName}", and "${acc.centralArtifact?.name || 'the artifact'}"
- Key twists should connect to secrets established in faction/villain/history steps
${JSON_RULES}

Return JSON:
{
  "storyArc": {
    "title": "string — campaign title",
    "logline": "string — one-sentence hook",
    "acts": [
      {
        "actNumber": 1,
        "title": "string",
        "summary": "string",
        "keyBeats": [
          {
            "name": "string",
            "type": "quest | revelation | boss-fight | choice | companion-event | world-event | dungeon | social",
            "description": "string",
            "location": "EXACT settlement or region name",
            "involvedNPCs": ["EXACT NPC/companion/villain names"],
            "consequences": "string",
            "optional": false
          }
        ],
        "estimatedSessions": 5,
        "levelRange": { "min": 1, "max": 5 },
        "mainLocations": ["EXACT location names"],
        "newCompanions": ["EXACT companion IDs available this act"],
        "villainPhase": "string — what ${villainName} is doing (from threat escalation)"
      }
    ],
    "possibleEndings": [
      { "name": "string", "condition": "string", "description": "string", "tone": "triumphant | bittersweet | tragic | ambiguous | pyrrhic" }
    ],
    "keyTwists": ["2-3 — MUST reference established secrets"],
    "recurringThemes": ["2-3 — connect to ${acc.thematicCore || 'the theme'}"],
    "playerAgencyPoints": ["3-5 key decision points affecting faction relations"]
  },
  "encounterTables": [
    {
      "regionId": "EXACT region ID",
      "regionName": "EXACT region name",
      "encounters": [
        { "name": "string", "type": "combat | social | environmental | mystery | merchant | ambush", "difficulty": "easy | medium | hard | deadly", "description": "string", "creatures": ["EXACT bestiary creature names"], "levelRange": { "min": 1, "max": 5 }, "special": "string" }
      ]
    }
  ],
  "travelNetwork": [
    { "from": "EXACT name", "to": "EXACT name", "method": "road | trail | river | sea | air | underground | portal | wilderness", "travelDays": 2, "dangerLevel": 2, "description": "string", "hazards": ["1-2"], "pointsOfInterest": ["1-2"], "controlledBy": "EXACT faction name" }
  ]
}

3 acts, 4-6 beats each. 3-4 endings. Encounter tables for EVERY region. 6-10 travel routes. ALL names EXACT.`,
    user: `Map the campaign arc for "${acc.worldName || 'the world'}". "${villainName}"'s plan escalates from "${acc.mainThreat?.currentPhase || '?'}" through ${acc.mainThreat?.escalation?.length || '?'} stages. Companions (${companionNames}) join at different acts. Story flows through dungeons (${dungeonNames}) and regions (${regionNames}). Encounters use bestiary creatures. Everything connects.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 14 — RELATIONSHIPS, EVENTS & ORIGIN
// Needs: ALL prior steps
// Cross-refs: relationship web links ALL named entities,
// random events affect NAMED regions/factions, origin places
// player in a NAMED settlement with a NAMED NPC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function step14_relationshipsAndOrigin(c: CharacterCreationInput, acc: Acc): StepPrompt {
  const bible = worldBible(acc, {
    core: true, magic: true, factions: true, villain: true, threat: true,
    geography: true, settlements: true, companions: true, bestiary: true, dungeons: true, economy: true,
  });
  const allNPCs = [
    ...(acc.factions?.map((f: Acc) => `${f.leader || f.name + ' Leader'} (faction: ${f.name})`) || []),
    ...(acc.settlements?.flatMap((s: Acc) => s.keyNPCs?.map((n: Acc) => `${n.name} (${n.role} in ${s.name})`) || []) || []),
    ...(acc.companions?.map((comp: Acc) => `${comp.name} (companion, ${comp.role})`) || []),
  ];
  const villainName = acc.villainCore?.name || 'the villain';
  const factionNames = acc.factions?.map((f: Acc) => `"${f.name}"`).join(', ') || 'factions';
  const regionNames = acc.geography?.map((r: Acc) => `"${r.name}"`).join(', ') || 'regions';
  const startSettlement = acc.settlements?.[0]?.name || acc.geography?.[0]?.knownLocations?.[0]?.name || 'the starting town';
  return {
    maxTokens: 8000,
    system: `FINAL STEP. Complete "${acc.worldName || '?'}" with the relationship web, random events, and origin scenario.
${charContext(c)}
${bible}

CROSS-REFERENCE REQUIREMENTS:
- Relationship web MUST connect established named entities. Available entities:
  VILLAIN: "${villainName}"
  FACTIONS: ${factionNames}
  NPCs: ${allNPCs.slice(0, 20).join('; ')}
  PLAYER: "${c.name}"
- Every relationship "entityA" and "entityB" must be EXACT names from above
- Random events must affect SPECIFIC regions: ${regionNames}
  and SPECIFIC factions: ${factionNames}
- The origin scenario MUST place ${c.name} in a SPECIFIC settlement: "${startSettlement}" (or another named settlement)
- The first NPC the player meets MUST be an established NPC from that settlement
- Initial choices MUST lead to different faction alignments or questlines
- "playerRole" must connect to the prophecy: "${acc.prophecy?.text || '?'}"
${JSON_RULES}

Return JSON:
{
  "relationshipWeb": [
    {
      "entityA": "EXACT name from established entities",
      "entityAType": "faction | npc | companion | villain | player | creature",
      "entityB": "EXACT name from established entities",
      "entityBType": "faction | npc | companion | villain | player | creature",
      "relationship": "ally | enemy | rival | servant | patron | lover | family | trade-partner | debtor | secret-ally | former-ally",
      "details": "string — the nature of this connection",
      "canChange": true
    }
  ],
  "randomEvents": [
    {
      "name": "string",
      "type": "weather | political | economic | supernatural | military | social | natural-disaster",
      "description": "string",
      "triggerCondition": "string",
      "affectedRegions": ["EXACT region names"],
      "affectedFactions": ["EXACT faction names"],
      "effects": ["2-3 effects"],
      "duration": "string",
      "playerInteraction": "string"
    }
  ],
  "playerRole": "string — why ${c.name} matters (connect to prophecy)",
  "originScenario": {
    "setting": "EXACT settlement name — ${startSettlement} or another established settlement",
    "situation": "string — what's happening (connects to act 1 of the campaign)",
    "hook": "string — why ${c.name} is involved",
    "firstNPCMet": "EXACT NPC name from that settlement",
    "firstNPCIntro": "string — memorable first meeting description",
    "initialChoices": ["3-5 choices — lead to different faction paths"]
  }
}

10-15 relationship links between NAMED entities. 6-10 random events affecting NAMED regions/factions. An IMMEDIATELY gripping origin in a NAMED settlement with a NAMED NPC.`,
    user: `Complete "${acc.worldName || 'the world'}". Connect everything: "${villainName}" to the factions, companions to the NPCs, creatures to the regions. The player starts in "${startSettlement}". Their first NPC encounter must be someone already established. Every thread ties together.`,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP REGISTRY — Ordered pipeline for the route handler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GENESIS_STEPS: StepDefinition[] = [
  { id: 1,  name: 'world-concept',    label: 'Forging the world concept...',             buildPrompt: step01_worldConcept },
  { id: 2,  name: 'magic-system',     label: 'Designing magic & power systems...',       buildPrompt: step02_magicSystem },
  { id: 3,  name: 'history',          label: 'Writing deep history & legends...',        buildPrompt: step03_history },
  { id: 4,  name: 'factions',         label: 'Building factions & politics...',          buildPrompt: step04_factions },
  { id: 5,  name: 'villain',          label: 'Crafting the villain...',                  buildPrompt: step05_villain },
  { id: 6,  name: 'threat',           label: 'Shaping the main threat & prophecy...',    buildPrompt: step06_threat },
  { id: 7,  name: 'geography',        label: 'Mapping the world geography...',           buildPrompt: step07_geography },
  { id: 8,  name: 'settlements',      label: 'Detailing cities & settlements...',        buildPrompt: step08_settlements },
  { id: 9,  name: 'companions',       label: 'Creating companion characters...',         buildPrompt: step09_companions },
  { id: 10, name: 'bestiary',         label: 'Populating the bestiary...',               buildPrompt: step10_bestiary },
  { id: 11, name: 'dungeons',         label: 'Designing dungeons & adventure sites...',  buildPrompt: step11_dungeons },
  { id: 12, name: 'economy-crafting', label: 'Building economy & crafting...',           buildPrompt: step12_economyAndCrafting },
  { id: 13, name: 'campaign-arc',     label: 'Mapping the campaign arc...',              buildPrompt: step13_campaignAndEncounters },
  { id: 14, name: 'relationships',    label: 'Weaving relationships & origin...',        buildPrompt: step14_relationshipsAndOrigin },
];

export const TOTAL_STEPS = GENESIS_STEPS.length;
