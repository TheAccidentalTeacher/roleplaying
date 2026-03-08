// ============================================================
// THE ORACLE — Transparent game state analyst
// Out-of-world, fourth-wall-breaking AI that tells the player
// exactly what's happening under the hood.
// ============================================================

import type { DMContext } from './dm-system';
import { getSpellTerminology } from '@/lib/utils/spell-terminology';

/**
 * Build the Oracle system prompt — dumps full game state in raw
 * analytical form and instructs the model to answer honestly with
 * no in-world fiction.
 */
export function buildOracleSystemPrompt(ctx: DMContext, dmMessages: { role: string; content: string }[]): string {
  const w = ctx.world;
  const c = ctx.character;

  // ── World bible summary ───────────────────────────────────
  const companionCount = w.companions?.length ?? 0;
  const companionsList = (w.companions ?? []).map(comp =>
    `  - ${comp.name} (${comp.race} ${comp.class}, ${comp.role}) — Recruit at: ${comp.recruitLocation ?? 'Unknown'}. Condition: ${comp.recruitCondition ?? 'Unknown'}. Personal quest: ${(comp.personalQuest ?? '').slice(0, 100)}`
  ).join('\n');

  const factionsList = (w.factions ?? []).map(f =>
    `  - ${f.name}: attitude=${f.attitude_toward_player ?? 'neutral'}, strength=${f.strength ?? '?'}. ${(f.description ?? '').slice(0, 80)}`
  ).join('\n');

  const settlementsList = (w.settlements ?? []).map(s =>
    `  - ${s.name} (${s.type ?? 'settlement'}, ${s.region ?? 'unknown region'}) — ${(s.description ?? '').slice(0, 60)}`
  ).join('\n');

  const dungeonsList = (w.dungeons ?? []).map(d =>
    `  - ${d.name} (${d.type}, levels ${d.levelRange?.min ?? '?'}-${d.levelRange?.max ?? '?'}) at ${d.location ?? 'Unknown'}. Boss: ${d.boss ?? 'Unknown'}`
  ).join('\n');

  const bestiaryList = (w.bestiary ?? []).map(b =>
    `  - ${b.name} (CR ${b.challengeRating}) — ${(b.description ?? '').slice(0, 60)}`
  ).join('\n');

  // ── Legends & history ────────────────────────────────────
  const legendsList = (w.legends ?? []).map(l =>
    `  - "${l.title}": ${(l.summary ?? '').slice(0, 100)} (${l.isTrue ? 'TRUE' : 'MYTH'}) — ${l.relevanceToPlayer ?? ''}`
  ).join('\n');

  const historicalErasList = (w.majorHistoricalEras ?? []).map(e =>
    `  - ${e.name} (${e.duration ?? '?'}): ${e.legacy ?? (e.description ?? '').slice(0, 80)}`
  ).join('\n');

  // ── Geography brief ───────────────────────────────────────
  const geographyList = (w.geography ?? []).map(r =>
    `  - ${r.name} (${r.terrain ?? '?'}, ${r.climate ?? '?'}) — controlled by: ${r.controlledBy ?? 'unclaimed'}, danger ${r.dangerLevel ?? '?'}/5`
  ).join('\n');

  // ── Relationship web ──────────────────────────────────────
  const relationshipWebList = (w.relationshipWeb ?? []).slice(0, 20).map(r =>
    `  - ${r.entityA} ↔ ${r.entityB}: ${r.relationship}${r.details ? ` (${(r.details as string).slice(0, 60)})` : ''}${r.canChange ? ' [player-mutable]' : ''}`
  ).join('\n');

  // ── Travel network ────────────────────────────────────────
  const travelNetworkList = (w.travelNetwork ?? []).map(r =>
    `  - ${r.from} → ${r.to}: ${r.travelDays}d via ${r.method ?? 'road'}, danger ${r.dangerLevel ?? '?'}/5, controlled by: ${r.controlledBy ?? 'unclaimed'}`
  ).join('\n');

  // ── Random world events ───────────────────────────────────
  const randomEventsList = (w.randomEvents ?? []).map(e =>
    `  - ${e.name} (${e.type}): ${e.triggerCondition} — duration: ${e.duration}, interaction: ${(e.playerInteraction ?? '').slice(0, 80)}`
  ).join('\n');

  // ── Campaign arc breakdown ────────────────────────────────
  let arcSection = 'NO CAMPAIGN ARC DEFINED — the DM is improvising.';
  if (w.storyArc) {
    const arc = w.storyArc;
    const actDetails = (arc.acts ?? []).map(a => {
      const beats = (a.keyBeats ?? []).map((b: { name: string; type: string; description?: string; optional?: boolean }, i: number) =>
        `      Beat ${i + 1}: "${b.name}" (${b.type})${b.optional ? ' [optional]' : ''} — ${(b.description ?? '').slice(0, 80)}`
      ).join('\n');
      return `    Act ${a.actNumber ?? '?'}: "${a.title ?? 'Untitled'}" (Levels ${a.levelRange?.min ?? '?'}-${a.levelRange?.max ?? '?'})
      Summary: ${(a.summary ?? '').slice(0, 200)}
      Villain phase: ${a.villainPhase ?? 'Unknown'}
${beats || '      No beats defined'}`;
    }).join('\n\n');

    arcSection = `CAMPAIGN: "${arc.title ?? 'Untitled'}"
  Logline: ${arc.logline ?? 'None'}
  Themes: ${(arc.recurringThemes ?? []).join(', ') || 'None'}
  Player agency points: ${(arc.playerAgencyPoints ?? []).join('; ') || 'None'}
  Key twists: ${(arc.keyTwists ?? []).join('; ') || 'None'}

  ACTS:
${actDetails}`;
  }

  // ── Quest state ───────────────────────────────────────────
  const questsList = (ctx.activeQuests ?? []).map(q =>
    `  - "${q.title}" (${q.type ?? 'main'}, status: ${q.status ?? 'active'}) — ${q.logline ?? 'No description'}`
  ).join('\n');

  // ── NPC state ─────────────────────────────────────────────
  const npcsList = (ctx.knownNPCs ?? []).map(n =>
    `  - ${n.name} (${n.race ?? ''} ${n.role ?? ''}): attitude=${n.attitudeTier ?? 'neutral'}, relationship=${n.relationshipType ?? 'stranger'}`
  ).join('\n');

  // ── Recent DM messages (last 6) ──────────────────────────
  const recentDMMessages = dmMessages
    .filter(m => m.role === 'assistant')
    .slice(-6)
    .map((m, i) => `  [DM message ${i + 1}]: ${m.content.slice(0, 300)}${m.content.length > 300 ? '...' : ''}`)
    .join('\n');

  const recentPlayerMessages = dmMessages
    .filter(m => m.role === 'user')
    .slice(-6)
    .map((m, i) => `  [Player message ${i + 1}]: ${m.content.slice(0, 200)}`)
    .join('\n');

  // ── Villain info ──────────────────────────────────────────
  const vc = w.villainCore ?? {} as Record<string, unknown>;
  const mt = w.mainThreat ?? {} as Record<string, unknown>;

  // ── Character snapshot ────────────────────────────────────
  const hp = c.hitPoints ?? { current: 0, max: 0 };
  const companionIds = c.companionIds ?? [];

  // ── Spell status (genre-adaptive) ───────────────────────
  const oracleTerm = getSpellTerminology(w.primaryGenre, w.magicSystem);
  const capO = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const spellStatusStr = c.spellcasting ? (() => {
    const sc = c.spellcasting;
    const slots = sc.spellSlots?.filter(s => s.total > 0)
      .map(s => `${oracleTerm.tierLabel(s.level)}=${s.remaining}/${s.total}`).join(', ') || 'none';
    const concStr = sc.activeConcentrationSpell
      ? ` | ${oracleTerm.concentratingVerb}: "${sc.activeConcentrationSpell}"`
      : '';
    return `${capO(oracleTerm.abilities)}caster (DC=${sc.spellSaveDC}, Atk+${sc.spellAttackBonus}) | Known: ${(sc.knownSpells?.length ?? 0) + (sc.cantrips?.length ?? 0)} (${sc.cantrips?.length ?? 0} ${oracleTerm.cantripsLabel}) | ${capO(oracleTerm.slotsLabel)}: ${slots}${concStr}`;
  })() : `Not a ${oracleTerm.ability}caster`;

  return `# YOU ARE "THE ORACLE" — A TRANSPARENT GAME ANALYST

You are NOT the Dungeon Master. You are a META-LAYER assistant that exists OUTSIDE the game fiction.
You have COMPLETE access to the entire game state — the world bible, campaign arc, villain plans,
faction attitudes, companion unlock conditions, everything. You break the fourth wall completely.

## YOUR RULES
1. NEVER roleplay or narrate in-world. Speak as a blunt, honest analyst.
2. Answer in plain language with concrete data. Cite numbers, names, and states.
3. When the player asks "does the DM know X" — check the data below and give a YES/NO with proof.
4. When asked about progression, compare current state against the campaign arc beats.
5. Be direct about what's working and what's not. If something seems off or broken, say so.
6. Format responses with headers, bullets, and bold for readability.
7. Keep responses concise — max 300 words unless the player asks for a deep dive.
8. You can suggest strategies or point out opportunities the player hasn't noticed.
9. If data is missing or undefined, say so explicitly: "This field is empty/undefined in your world data."

## COMPLETE GAME STATE DUMP

### CHARACTER
- Name: ${c.name ?? 'Unknown'}
- Race: ${c.race ?? 'Unknown'} | Class: ${c.class ?? 'Unknown'} | Level: ${c.level ?? 1}
- HP: ${hp.current}/${hp.max} | AC: ${c.armorClass ?? 10} | Gold: ${c.gold ?? 0}
- XP: ${c.xp ?? 0} / ${c.xpToNextLevel ?? 300}
- Location: ${ctx.currentLocation ?? 'Unknown'}
- Gender/Pronouns: ${c.gender ?? 'unspecified'}
- Active conditions: ${(c.conditions ?? []).length > 0 ? c.conditions.map(co => typeof co === 'string' ? co : co.type).join(', ') : 'None'}
- Companions recruited: ${companionIds.length} (IDs: ${companionIds.join(', ') || 'none'})
- Inventory items: ${(c.inventory ?? []).length}
- Known spells: ${spellStatusStr}

### WORLD: "${w.worldName ?? 'Unknown'}"
- Type: ${w.worldType ?? 'Unknown'} | Genre: ${w.primaryGenre ?? 'Unknown'}
- Theme: ${w.thematicCore ?? 'Unknown'}
- Cosmology: ${w.cosmology ?? 'Unknown'} | Afterlife: ${w.afterlife ?? 'Unknown'} | Time: ${w.time ?? 'Unknown'}
- Technology: ${w.technologyLevel ?? 'Unknown'} | Age: ${w.ageOfWorld ?? 'Unknown'}
- Magic system: ${w.magicSystem?.name ?? 'Unknown'} — ${(w.magicSystem?.description ?? '').slice(0, 120)}
  Source: ${w.magicSystem?.source ?? '?'} | Cost: ${w.magicSystem?.cost ?? '?'}
  Schools: ${(w.magicSystem?.schools ?? []).join(', ') || 'None'}
  Social attitude: ${w.magicSystem?.socialAttitude ?? 'Unknown'}
- Currency: ${w.currencyNames?.primary ?? '?'} / ${w.currencyNames?.secondary ?? '?'} / ${w.currencyNames?.tertiary ?? '?'}

### GEOGRAPHY (${(w.geography ?? []).length} regions)
${geographyList || '  None defined'}

### VILLAIN
- Name: ${vc.name ?? 'Unknown'} — ${vc.title ?? ''}
- Motivation: ${vc.motivation ?? 'Unknown'}
- Current plan: ${vc.currentPlan ?? 'Unknown'}
- Weaknesses: ${(vc.weaknesses as string[] ?? []).join(', ') || 'Unknown'}
- Their genuine argument: ${vc.genuineArgument ?? 'Unknown'}

### MAIN THREAT
- Name: ${mt.name ?? 'Unknown'}
- Nature: ${mt.nature ?? 'Unknown'}
- Current phase: ${mt.currentPhase ?? 'Unknown'}
- Escalation: ${(mt.escalation as string[] ?? []).join(' → ') || 'Unknown'}

### CAMPAIGN ARC
${arcSection}

### COMPANIONS (${companionCount} defined in world)
${companionsList || '  None defined'}

### FACTIONS (${(w.factions ?? []).length} defined)
${factionsList || '  None defined'}

### SETTLEMENTS (${(w.settlements ?? []).length} defined)
${settlementsList || '  None defined'}

### DUNGEONS (${(w.dungeons ?? []).length} defined)
${dungeonsList || '  None defined'}

### BESTIARY (${(w.bestiary ?? []).length} creatures)
${bestiaryList || '  None defined'}

### LEGENDS & HISTORY
**Historical eras (${(w.majorHistoricalEras ?? []).length}):**
${historicalErasList || '  None defined'}
**Catastrophes:** ${(w.catastrophes ?? []).join(' | ') || 'None defined'}
**Secret history:** ${w.secretHistory ?? 'Not defined'}
**Legends (${(w.legends ?? []).length}):**
${legendsList || '  None defined'}

### PROPHECY
${w.prophecy ? `"${w.prophecy.text}"
- Common belief: ${w.prophecy.interpretation ?? 'Unknown'}
- TRUE meaning: ${w.prophecy.truth ?? 'Unknown'}
- Relevance to player: ${w.prophecy.relevanceToPlayer ?? 'Unknown'}` : '  None defined'}

### CENTRAL ARTIFACT
${w.centralArtifact ? `${w.centralArtifact.name}: ${w.centralArtifact.description ?? ''}
  Location: ${w.centralArtifact.currentLocation ?? 'Unknown'} | Guarded by: ${w.centralArtifact.guardedBy ?? 'Unknown'}
  Nature: ${w.centralArtifact.nature ?? 'Unknown'} | Danger of use: ${w.centralArtifact.dangerOfUse ?? 'Unknown'}` : '  None defined'}

### PLAYER'S DESTINED ROLE
${w.playerRole ?? '  Not defined'}

### POWER VACUUMS (exploitation opportunities)
${(w.powerVacuums ?? []).map(p => `  - ${p}`).join('\n') || '  None defined'}

### ECONOMY
${w.economy ? `- Black market: ${w.economy.blackMarket ?? 'Unknown'}
- Economic tensions: ${(w.economy.economicTensions ?? []).join(' | ') || 'None'}
- Price regions: ${(w.economy.priceRegions ?? []).map(p => `${p.region} (×${p.priceModifier})`).join(', ') || 'None'}
- Trade goods: ${(w.economy.tradeGoods ?? []).map(g => `${g.name} (${g.abundance})`).join(', ') || 'None'}
- Rare materials: ${(w.economy.rareMaterials ?? []).map(m => `${m.name} — ${m.source ?? '?'}`).join(', ') || 'None'}` : '  Not defined'}

### CRAFTING
${w.crafting ? `${w.crafting.description ?? ''}
- Disciplines (${(w.crafting.disciplines ?? []).length}): ${(w.crafting.disciplines ?? []).map(d => d.name).join(', ') || 'None'}
- Recipes (${(w.crafting.recipes ?? []).length} defined)` : '  Not defined'}

### LOOT TABLES (${(w.lootTables ?? []).length} defined)
${(w.lootTables ?? []).map(t => `  - ${t.name}: ${(t.items ?? []).length} items (context: ${t.context ?? '?'})`).join('\n') || '  None defined'}

### RELATIONSHIP WEB (${(w.relationshipWeb ?? []).length} links)
${relationshipWebList || '  None defined'}

### TRAVEL NETWORK (${(w.travelNetwork ?? []).length} routes)
${travelNetworkList || '  None defined'}

### WORLD EVENTS (${(w.randomEvents ?? []).length} triggers)
${randomEventsList || '  None defined'}

### ACTIVE QUESTS (${(ctx.activeQuests ?? []).length})
${questsList || '  None active'}

### KNOWN NPCs (${(ctx.knownNPCs ?? []).length} met)
${npcsList || '  None met yet'}

### GAME CLOCK
- Day ${ctx.gameClock?.daysSinceStart ?? 1}, ${ctx.gameClock?.timeOfDay ?? 'morning'}, ${ctx.gameClock?.currentSeason ?? 'unknown season'}

### RECENT DM CONVERSATION (last 6 exchanges)
**Player said:**
${recentPlayerMessages || '  No messages yet'}

**DM responded:**
${recentDMMessages || '  No messages yet'}

### MESSAGE HISTORY
- Total messages in current session: ${dmMessages.length}

### CHRONICLE
${(ctx.recentChronicle ?? []).map(e => `  - ${e}`).join('\n') || '  No chronicle entries yet'}
`;
}
