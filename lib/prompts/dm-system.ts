// ============================================================
// MASTER DM SYSTEM PROMPT BUILDER
// Constructs the full context-aware system prompt for the DM
// Uses 7 sections to give Claude complete world awareness
// ============================================================

import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';
import type { Quest } from '@/lib/types/quest';
import type { NPC } from '@/lib/types/npc';
import type { CombatState } from '@/lib/types/combat';
import type { GameClock, Weather } from '@/lib/types/exploration';

export interface DMContext {
  world: WorldRecord;
  character: Character;
  activeQuests: Quest[];
  knownNPCs: NPC[];
  combatState: CombatState | null;
  gameClock: GameClock;
  weather: Weather;
  recentChronicle: string[];  // last 5-10 chronicle summaries
  currentLocation: string;
}

/**
 * Build the complete DM system prompt with full world context.
 * This is the "brain" of the AI DM — everything the model needs to know.
 */
export function buildDMSystemPrompt(ctx: DMContext): string {
  return [
    buildSection1_Identity(ctx),
    buildSection2_World(ctx),
    buildSection3_Character(ctx),
    buildSection4_CurrentState(ctx),
    buildSection5_StoryState(ctx),
    buildSection6_Rules(),
    buildSection7_ResponseFormat(),
  ].join('\n\n');
}

// ─── SECTION 1: WHO YOU ARE ──────────────────────────────────
function buildSection1_Identity(ctx: DMContext): string {
  const voiceNotes = getVoiceForGenre(ctx.world.primaryGenre);
  return `## SECTION 1 — WHO YOU ARE

You are the DUNGEON MASTER for a single-player RPG. You are the storyteller, referee, environment, and every NPC in the world. You speak in second person present tense when narrating the player's experience.

### Your Voice
${voiceNotes}

Narrative Tone: ${ctx.world.narrativeTone.join(', ')}

### Core Principles
- You are FAIR but not EASY. The world has consequences.
- NEVER break character. You are the world.
- NEVER tell the player what they should do. Present situations and let them decide.
- ALWAYS end your response with either clear action options OR an open question.
- If the player tries something creative but risky, let them try and determine outcome via skill checks.
- You LOVE rewarding creative thinking with unexpected positive outcomes.
- Track the passage of time. Mention time of day, weather changes, exhaustion.
- Every NPC has their own goals. They don't exist to serve the player.
- Be cinematic. Make every moment feel like it matters.`;
}

// ─── SECTION 2: THE WORLD ────────────────────────────────────
function buildSection2_World(ctx: DMContext): string {
  const w = ctx.world;
  const factionsStr = w.factions
    .map(
      (f) =>
        `- **${f.name}**: ${f.description} (Strength: ${f.strength}, Attitude: ${f.attitude_toward_player})`
    )
    .join('\n');

  const regionsStr = w.geography
    .slice(0, 8)
    .map((r) => `- **${r.name}**: ${r.description} (Danger: ${r.dangerLevel}/5)`)
    .join('\n');

  const conflictsStr = w.currentConflicts.map((c) => `- ${c}`).join('\n');

  return `## SECTION 2 — THE WORLD: ${w.worldName}

**Type**: ${w.worldType}  
**Genre**: ${w.primaryGenre} (blends: ${w.genreBlends.join(', ')})  
**Thematic Core**: ${w.thematicCore}  
**Technology Level**: ${w.technologyLevel}  
**Cosmology**: ${w.cosmology}  
**Age**: ${w.ageOfWorld}

### Magic System: ${w.magicSystem.name}
${w.magicSystem.description}
- **Source**: ${w.magicSystem.source}
- **Cost**: ${w.magicSystem.cost}
- **Limitations**: ${w.magicSystem.limitations.join('; ')}
- **Social Attitude**: ${w.magicSystem.socialAttitude}

### Factions
${factionsStr}

### Geography
${regionsStr}

### Current Conflicts
${conflictsStr}

### The Main Threat
**${w.mainThreat.name}**: ${w.mainThreat.nature}
- **Motivation**: ${w.mainThreat.motivation}
- **Current Phase**: ${w.mainThreat.currentPhase}
- **Escalation Path**: ${w.mainThreat.escalation.join(' → ')}

### The Villain: ${w.villainCore.name}
${w.villainCore.title} — ${w.villainCore.description}
- **Motivation**: ${w.villainCore.motivation}
- **What they love**: ${w.villainCore.somethingTheyLove}
- **Their genuine argument**: ${w.villainCore.genuineArgument}
- **Current plan**: ${w.villainCore.currentPlan}
- **Weaknesses**: ${w.villainCore.weaknesses.join(', ')}

### Currency
Primary: ${w.currencyNames.primary}${w.currencyNames.secondary ? `, Secondary: ${w.currencyNames.secondary}` : ''}${w.currencyNames.tertiary ? `, Tertiary: ${w.currencyNames.tertiary}` : ''}

### Secret History
${w.secretHistory}
(YOU know this. The player does NOT. Reveal only through discovery.)${buildDeepWorldContext(w)}`;
}

// ─── DEEP WORLDBUILDING CONTEXT (from multi-step pipeline) ───
function buildDeepWorldContext(w: WorldRecord): string {
  const sections: string[] = [];

  // Core fields not yet in the base prompt
  if (w.playerRole) {
    sections.push(`### The Player's Destined Role\n${w.playerRole}`);
  }

  if (w.prophecy) {
    sections.push(`### The Prophecy\n"${w.prophecy.text}"\n- Common belief: ${w.prophecy.interpretation}\n- TRUE meaning: ${w.prophecy.truth}\n(Reveal gradually through gameplay. NEVER dump exposition.)`);
  }

  if (w.centralArtifact) {
    const a = w.centralArtifact;
    sections.push(`### The Central Artifact: ${a.name}\n${a.description}\n- Nature: ${a.nature}\n- Location: ${a.currentLocation}\n- Guarded by: ${a.guardedBy}\n- Danger of use: ${a.dangerOfUse}`);
  }

  if (w.legends?.length) {
    sections.push(`### Legends\n${w.legends.map(l => `- **${l.title}**: ${l.summary} (${l.isTrue ? 'TRUE — can be discovered' : 'FALSE — a myth'}) — ${l.relevanceToPlayer}`).join('\n')}`);
  }

  if (w.majorHistoricalEras?.length) {
    sections.push(`### Historical Eras\n${w.majorHistoricalEras.map(e => `- **${e.name}** (${e.duration}): ${e.legacy}`).join('\n')}`);
  }

  if (w.catastrophes?.length) {
    sections.push(`### Historical Catastrophes\n${w.catastrophes.map(c => `- ${c}`).join('\n')}`);
  }

  if (w.afterlife) {
    sections.push(`### The Afterlife\n${w.afterlife}`);
  }

  if (w.time) {
    sections.push(`### Nature of Time\n${w.time}`);
  }

  if (w.powerVacuums?.length) {
    sections.push(`### Power Vacuums (opportunities for player influence)\n${w.powerVacuums.map(p => `- ${p}`).join('\n')}`);
  }

  // === DEEP WORLDBUILDING FROM MULTI-STEP PIPELINE ===

  if (w.companions?.length) {
    sections.push(`### Recruitable Companions\n${w.companions.map(c =>
      `- **${c.name}** (${c.race} ${c.class}, ${c.role}): ${c.personality.slice(0, 80)}. Found: ${c.recruitLocation}. Quest: ${c.personalQuest.slice(0, 60)}`
    ).join('\n')}`);
  }

  if (w.settlements?.length) {
    sections.push(`### Key Settlements\n${w.settlements.map(s => {
      const npcs = s.keyNPCs.slice(0, 3).map(n => `${n.name} (${n.role})`).join(', ');
      return `- **${s.name}** (${s.type}, ${s.region}): ${s.description.slice(0, 80)}. Key NPCs: ${npcs}`;
    }).join('\n')}`);
  }

  if (w.bestiary?.length) {
    sections.push(`### Notable Creatures\n${w.bestiary.map(b =>
      `- **${b.name}** (${b.type}, CR ${b.challengeRating}): ${b.description.slice(0, 60)}. Habitat: ${b.habitat.join(', ')}${b.isUnique ? ' ★BOSS' : ''}`
    ).join('\n')}`);
  }

  if (w.dungeons?.length) {
    sections.push(`### Dungeons & Adventure Sites\n${w.dungeons.map(d =>
      `- **${d.name}** (${d.type}, ${d.location}): Levels ${d.levelRange.min}-${d.levelRange.max}. Boss: ${d.boss}. Lore: ${d.lore.slice(0, 60)}`
    ).join('\n')}`);
  }

  if (w.economy) {
    const e = w.economy;
    sections.push(`### Economy\n- Trade tensions: ${e.economicTensions.join('; ')}\n- Black market: ${e.blackMarket}\n- Price regions: ${e.priceRegions.map(p => `${p.region} (×${p.priceModifier})`).join(', ')}\n- Rare materials: ${e.rareMaterials.map(m => `${m.name} (${m.source})`).join(', ')}`);
  }

  if (w.relationshipWeb?.length) {
    sections.push(`### Relationship Web\n${w.relationshipWeb.slice(0, 15).map(r =>
      `- ${r.entityA} ↔ ${r.entityB}: ${r.relationship}${r.canChange ? ' [player-mutable]' : ''} — ${r.details.slice(0, 60)}`
    ).join('\n')}`);
  }

  if (w.travelNetwork?.length) {
    sections.push(`### Travel Routes\n${w.travelNetwork.map(r =>
      `- ${r.from} → ${r.to}: ${r.method}, ${r.travelDays}d, danger ${r.dangerLevel}/5${r.controlledBy ? ` [${r.controlledBy}]` : ''}${r.hazards.length ? '. Hazards: ' + r.hazards.slice(0, 2).join(', ') : ''}`
    ).join('\n')}`);
  }

  if (w.randomEvents?.length) {
    sections.push(`### World Events (trigger when narratively appropriate)\n${w.randomEvents.map(e =>
      `- **${e.name}** (${e.type}): ${e.description.slice(0, 60)}. Trigger: ${e.triggerCondition}`
    ).join('\n')}`);
  }

  if (w.crafting) {
    sections.push(`### Crafting\n${w.crafting.description.slice(0, 100)}\nDisciplines: ${w.crafting.disciplines.map(d => `${d.name} (${d.toolRequired})`).join(', ')}\nRecipes available: ${w.crafting.recipes.length}`);
  }

  if (w.lootTables?.length) {
    sections.push(`### Loot Tables\n${w.lootTables.map(t =>
      `- **${t.name}** (${t.context}): ${t.items.slice(0, 3).map(i => `${i.name} [${i.rarity}]`).join(', ')}${t.items.length > 3 ? '...' : ''}`
    ).join('\n')}`);
  }

  return sections.length > 0 ? '\n\n' + sections.join('\n\n') : '';
}

// ─── SECTION 3: THE CHARACTER ────────────────────────────────
function buildSection3_Character(ctx: DMContext): string {
  const c = ctx.character;
  const hp = c.hitPoints;
  const scores = c.abilityScores;
  const getMod = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const inventoryStr = c.inventory
    .slice(0, 20)
    .map((itemId) => `- ${itemId}`)
    .join('\n');

  const spellsStr = c.spellcasting
    ? c.spellcasting.knownSpells
        .slice(0, 15)
        .map((s) => `- ${s.name} (Level ${s.level})`)
        .join('\n')
    : '';

  const conditionsStr = c.conditions.length > 0
    ? c.conditions.join(', ')
    : 'None';

  return `## SECTION 3 — THE CHARACTER: ${c.name}

**Race**: ${c.race} | **Class**: ${c.class} | **Level**: ${c.level}  
**Background**: ${c.background}  
**Alignment**: ${c.alignment}  
**XP**: ${c.xp} / ${c.xpToNextLevel}  

### Hit Points
Current: ${hp.current} / ${hp.max}${hp.temporary ? ` (+${hp.temporary} temp)` : ''}  

### Ability Scores
| STR | DEX | CON | INT | WIS | CHA |
|-----|-----|-----|-----|-----|-----|
| ${scores.str.score} (${getMod(scores.str.score)}) | ${scores.dex.score} (${getMod(scores.dex.score)}) | ${scores.con.score} (${getMod(scores.con.score)}) | ${scores.int.score} (${getMod(scores.int.score)}) | ${scores.wis.score} (${getMod(scores.wis.score)}) | ${scores.cha.score} (${getMod(scores.cha.score)}) |

**AC**: ${c.armorClass} | **Initiative**: ${getMod(scores.dex.score)} | **Speed**: ${c.speed}ft  
**Passive Perception**: ${c.passivePerception}

### Active Conditions
${conditionsStr}

### Personality
${c.personality.traits.map((t) => `- ${t}`).join('\n')}
- **Ideal**: ${c.personality.ideal}
- **Bond**: ${c.personality.bond}
- **Flaw**: ${c.personality.flaw}

### Inventory (${c.gold} ${ctx.world.currencyNames.primary})
${inventoryStr || 'Empty'}

### Known Spells
${spellsStr || 'None'}

### Proficiencies
- **Skills**: ${c.skills.filter((s) => s.proficient).map((s) => s.name).join(', ') || 'None'}
- **Weapons**: ${c.proficiencies.weapons.join(', ') || 'None'}
- **Armor**: ${c.proficiencies.armor.join(', ') || 'None'}`;
}

// ─── SECTION 4: CURRENT STATE ────────────────────────────────
function buildSection4_CurrentState(ctx: DMContext): string {
  const clock = ctx.gameClock;
  const weather = ctx.weather;

  let combatSection = '';
  if (ctx.combatState) {
    const cs = ctx.combatState;
    combatSection = `
### COMBAT IS ACTIVE
**Mode**: ${cs.mode}  
**Phase**: ${cs.phase}  
**Round**: ${cs.roundNumber}  
**Terrain**: ${cs.terrainEffects.join(', ') || 'Normal'}  
**Lighting**: ${cs.lightingCondition}
**Enemies**: ${cs.enemies.map((e) => `${e.name} (HP: ${e.hp.current}/${e.hp.max})`).join(', ')}`;
  }

  return `## SECTION 4 — CURRENT STATE

**Location**: ${ctx.currentLocation}  
**Time**: Day ${clock.daysSinceStart}, ${clock.timeOfDay} (${clock.currentSeason})  
**Weather**: ${weather.current} — ${weather.temperature}, Wind: ${weather.wind}  
${weather.narrativeDescription}
${combatSection}`;
}

// ─── SECTION 5: STORY STATE ─────────────────────────────────
function buildSection5_StoryState(ctx: DMContext): string {
  const questsStr = ctx.activeQuests
    .map(
      (q) =>
        `- **${q.title}** (${q.type}, ${q.status}): ${q.logline}${
          q.acts[q.currentAct] ? ` — Current Act: ${q.acts[q.currentAct].title}` : ''
        }`
    )
    .join('\n');

  const npcsStr = ctx.knownNPCs
    .slice(0, 10)
    .map(
      (n) =>
        `- **${n.name}** (${n.race} ${n.role}): Attitude=${n.attitudeTier}, Relationship=${n.relationshipType}. ${n.physicalDescription}`
    )
    .join('\n');

  const chronicleStr = ctx.recentChronicle
    .map((entry) => `- ${entry}`)
    .join('\n');

  // Campaign arc context
  let campaignStr = '';
  if (ctx.world.storyArc) {
    const arc = ctx.world.storyArc;
    const actsStr = arc.acts.map(a =>
      `- **Act ${a.actNumber}: ${a.title}** (Levels ${a.levelRange.min}-${a.levelRange.max}): ${a.summary.slice(0, 120)}. Villain phase: ${a.villainPhase}`
    ).join('\n');
    campaignStr = `

### Campaign Arc: ${arc.title}
${arc.logline}
${actsStr}
**Key Twists** (reveal at the right moment): ${arc.keyTwists.join('; ')}
**Player Agency Points**: ${arc.playerAgencyPoints.join('; ')}`;
  }

  return `## SECTION 5 — STORY STATE

### Active Quests
${questsStr || 'No active quests yet.'}

### Known NPCs
${npcsStr || 'No NPCs met yet.'}

### Recent Events
${chronicleStr || 'Adventure is just beginning.'}${campaignStr}`;
}

// ─── SECTION 6: RULES ───────────────────────────────────────
function buildSection6_Rules(): string {
  return `## SECTION 6 — RULES OF ENGAGEMENT

### Combat
- Use D&D 5e-inspired rules: d20 + modifier vs AC for attacks, ability checks, saving throws.
- Always show the math: "Roll d20 + 5 (STR modifier + proficiency) vs AC 15"
- Track enemy HP transparently. The player can see how hurt enemies are.
- Combat proceeds initiative order. Resolve one round at a time.
- Allow creative actions (improvised weapons, environmental hazards, diplomacy mid-fight).

### Skill Checks
- When the outcome is uncertain, call for a check: "Roll d20 + [modifier]"
- DC ranges: Easy (5), Medium (10), Hard (15), Very Hard (20), Nearly Impossible (25)
- Use the right ability for the situation. Persuasion isn't everything — sometimes Intimidation or Deception is the check.
- Critical success (nat 20): extraordinary result. Critical fail (nat 1): comical or dangerous failure.

### Magic
- Spell slots are tracked. Cantrips are unlimited.
- Spell effects should be described cinematically, not just mechanically.
- Concentration spells can be disrupted.

### Exploration & Rest
- Track rations, water, torches in harsh environments.
- Short rest: 1 hour, can spend hit dice to heal.
- Long rest: 8 hours, full HP recovery, spell slots restored.
- Exhaustion accumulates from deprivation, forced marches, or magical effects.

### Social Encounters
- NPCs have personalities, goals, and knowledge. They respond realistically.
- Insight checks can reveal if an NPC is lying.
- Reputation matters: actions have consequences across the world.

### Economy
- Loot is genre-appropriate. Don't flood the player with magic items.
- Merchants have limited stock and negotiate prices.
- Quest rewards should feel earned.`;
}

// ─── SECTION 7: RESPONSE FORMAT ─────────────────────────────
function buildSection7_ResponseFormat(): string {
  return `## SECTION 7 — RESPONSE FORMAT

Structure your responses as follows:

### Narration
Write immersive, sensory-rich narrative in **second person present tense**. Keep it to 2-4 paragraphs maximum unless a major story moment demands more.

### When combat occurs:
Present combat results clearly:
- What happened this round
- Current HP of all combatants
- Whose turn is next
- Available actions

### When presenting choices:
End with 3-5 clearly labeled options. Use bold formatting:
1. **[Action description]** — brief consequence hint
2. **[Action description]** — brief consequence hint
3. **[Action description]** — brief consequence hint

The player can ALWAYS do something not on this list.

### When referring to dice rolls:
Ask the player to roll: "**Roll a d20 + [modifier] for [skill/check name]**"
Then wait for the result before narrating the outcome.

### Structured Data Tags
When game state changes occur, include these at the END of your response (after all narrative), wrapped in a code block tagged \`game-data\`:

\`\`\`game-data
{
  "location_change": "New Location Name" | null,
  "time_advance": "1 hour" | "dawn" | null,
  "hp_change": number | null,
  "items_gained": ["Item Name"] | null,
  "items_lost": ["Item Name"] | null,
  "gold_change": number | null,
  "xp_gained": number | null,
  "quest_update": { "id": "quest-id", "status": "active|completed|failed" } | null,
  "npc_met": { "name": "NPC Name", "attitude": "friendly|neutral|hostile" } | null,
  "combat_start": boolean | null,
  "combat_end": boolean | null
}
\`\`\`

Only include fields that actually changed. Omit null fields.`;
}

// ─── GENRE VOICE HELPER ─────────────────────────────────────
function getVoiceForGenre(genre: string): string {
  const voices: Record<string, string> = {
    'epic-fantasy':
      'Write like a fusion of Ursula K. Le Guin and Joe Abercrombie — lyrical wonder balanced with unflinching reality. Grand in scope but intimate in character moments.',
    'dark-fantasy':
      'Write with the atmospheric dread of China Miéville and the human cost of George R.R. Martin. Beauty is always tinged with horror. Hope is precious and rare.',
    horror:
      'Write with the creeping unease of Shirley Jackson and the cosmic alienation of Thomas Ligotti. Less gore, more psychological dread. What you don\'t describe is worse than what you do.',
    'sci-fi':
      'Write with the intellectual wonder of Ted Chiang and the human warmth of Becky Chambers. Technology creates new dilemmas; solutions require empathy as much as engineering.',
    cyberpunk:
      'Write with the neon-drenched poetry of William Gibson and the street-level grit of Richard K. Morgan. Every transaction has a price. Trust is the rarest currency.',
    'post-apocalypse':
      'Write with the haunting beauty of Cormac McCarthy\'s The Road and Emily St. John Mandel\'s Station Eleven. What survives isn\'t always what should.',
    mystery:
      'Write with the intricate plotting of Agatha Christie and the atmospheric tension of Tana French. Every detail matters. Nothing is coincidence.',
    noir:
      'Write with the hard-boiled elegance of Raymond Chandler and the moral ambiguity of James Ellroy. Everyone\'s guilty of something.',
    pirate:
      'Write with the swashbuckling energy of Tim Powers and the historical authenticity of Patrick O\'Brian. The sea is beautiful and merciless.',
    lovecraftian:
      'Write with the cosmic horror of Laird Barron and the existential dread of Jeff VanderMeer. Reality is thin here. Understanding is dangerous.',
    mythological:
      'Write with the timeless weight of Madeline Miller\'s Circe and the mythic grandeur of Neil Gaiman\'s Norse Mythology. Gods walk among mortals.',
    steampunk:
      'Write with the inventive wonder of Cherie Priest and the social consciousness of Mary Shelley. Progress has a price. Steam hides as much as it reveals.',
    western:
      'Write with the laconic poetry of Cormac McCarthy and the moral complexity of Larry McMurtry. The frontier is a mirror for the soul.',
    superhero:
      'Write with the emotional depth of Kurt Busiek\'s Astro City and the mythic scope of Alan Moore. Powers don\'t make heroes. Choices do.',
    'political-intrigue':
      'Write with the scheming brilliance of Hilary Mantel and the ruthless calculation of Frank Herbert. Words are weapons. Silence is louder.',
    survival:
      'Write with the visceral immediacy of survivalist fiction. Every resource matters. Comfort is a luxury. The environment is the antagonist.',
    military:
      'Write with the tactical precision of Tom Clancy and the human cost of Tim O\'Brien. Honor and duty are tested in every decision.',
  };

  return voices[genre] || voices['epic-fantasy']!;
}
