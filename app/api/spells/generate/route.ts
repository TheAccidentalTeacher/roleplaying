// ============================================================
// SPELL GENERATION API
// Generates world-flavored spells for a character using AI.
// The magic system flavor is injected so names, descriptions,
// and school classifications match the world's aesthetic.
//
// POST /api/spells/generate
// Body: {
//   characterClass: string,
//   characterLevel: number,
//   castingAbility: string,
//   existingSpellNames: string[],
//   count: number,         // how many spells to generate (1-4)
//   spellLevel?: number,   // if specified, target that spell level; else auto-pick
//   isCantrip?: boolean,
//   magicSystem: {
//     name: string,
//     description: string,
//     source: string,
//     cost: string,
//     limitations: string[],
//     socialAttitude: string,
//     schools?: string[],
//   },
//   worldGenre?: string,
//   worldTheme?: string,
//   characterContext?: string, // brief description of class/background
// }
// Returns: { spells: Spell[] }
// ============================================================

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Spell } from '@/lib/types/character';
import { getSpellTerminology, getSchoolRenameMap } from '@/lib/utils/spell-terminology';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Map class + level to appropriate spell level range
function getAppropriateSpellLevels(characterClass: string, characterLevel: number): number[] {
  const casterLevel = ['warlock'].includes(characterClass)
    ? characterLevel
    : ['paladin', 'ranger', 'artificer'].includes(characterClass)
    ? Math.floor(characterLevel / 2)
    : characterLevel; // full casters

  const maxSlotLevel = casterLevel >= 17 ? 9
    : casterLevel >= 15 ? 8
    : casterLevel >= 13 ? 7
    : casterLevel >= 11 ? 6
    : casterLevel >= 9  ? 5
    : casterLevel >= 7  ? 4
    : casterLevel >= 5  ? 3
    : casterLevel >= 3  ? 2
    : 1;

  // Return available levels — weight toward lower levels for new casters
  const levels: number[] = [];
  for (let i = 1; i <= maxSlotLevel; i++) levels.push(i);
  return levels;
}

function getSchoolsForClass(characterClass: string): string[] {
  const CLASS_SCHOOLS: Record<string, string[]> = {
    mage:         ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'],
    sorcerer:     ['Abjuration', 'Conjuration', 'Enchantment', 'Evocation', 'Illusion', 'Transmutation'],
    warlock:      ['Conjuration', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'],
    cleric:       ['Abjuration', 'Divination', 'Enchantment', 'Evocation', 'Necromancy', 'Transmutation'],
    druid:        ['Abjuration', 'Conjuration', 'Divination', 'Evocation', 'Transmutation'],
    bard:         ['Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Transmutation'],
    paladin:      ['Abjuration', 'Divination', 'Enchantment', 'Evocation'],
    ranger:       ['Abjuration', 'Conjuration', 'Divination', 'Transmutation'],
    artificer:    ['Abjuration', 'Conjuration', 'Divination', 'Evocation', 'Transmutation'],
    'blood-mage': ['Conjuration', 'Enchantment', 'Evocation', 'Necromancy', 'Transmutation'],
  };
  return CLASS_SCHOOLS[characterClass] ?? CLASS_SCHOOLS.mage;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      characterClass = 'mage',
      characterLevel = 1,
      castingAbility = 'int',
      existingSpellNames = [] as string[],
      count = 2,
      spellLevel,
      isCantrip = false,
      magicSystem,
      worldGenre = 'epic-fantasy',
      worldTheme,
      characterContext,
    } = body;

    const availableLevels = getAppropriateSpellLevels(characterClass, characterLevel);
    const targetLevel = isCantrip
      ? 0
      : spellLevel ?? availableLevels[Math.floor(availableLevels.length / 2)]; // mid-tier default

    const schools = getSchoolsForClass(characterClass);
    const magicFlavor = magicSystem
      ? `
Magic System: "${magicSystem.name}"
${magicSystem.description}
Source of power: ${magicSystem.source}
Cost/limitation: ${magicSystem.cost}. ${magicSystem.limitations?.join('; ') ?? ''}
Social attitude toward magic: ${magicSystem.socialAttitude}
${magicSystem.schools?.length ? `Named schools in this world: ${magicSystem.schools.join(', ')}` : ''}`
      : 'Standard arcane magic in a fantasy setting.';

    const term = getSpellTerminology(worldGenre);
    const schoolRenames = getSchoolRenameMap(worldGenre);
    const schoolRenameHint = Object.keys(schoolRenames).length > 0
      ? `\nIn this world, magic schools are renamed — use THESE names in the "school" field: ${Object.entries(schoolRenames).map(([k, v]) => `"${v}" (was ${k})`).join(', ')}.`
      : '';

    const GENRE_STYLES: Record<string, string> = {
      'epic-fantasy':        'Classic high fantasy: grand, arcane, mythic spell names. "Fireball", "Arcane Surge" are appropriate.',
      'dark-fantasy':        'Grim dark: bleak, brutal, blood-soaked names. "Crimson Tide" not "Fireball". "Soul Flay" not "Disintegrate". Horror always lurks.',
      'dying-world':         'Fading magic: names feel ancient, half-remembered, from a broken age. "Last Flame", "Echo of the Old Word", "The One Remaining Spell".',
      'young-world':         'Raw, primal magic: elemental, direct, named for natural forces. "Stone Shatter", "Wildfire Surge", "Beast Speak".',
      'fallen-empire':       'Corrupted imperial magic: "Remnant Curse", "Broken Standard", "Echo Blade", "Legion Scar".',
      'mythic-age':          'Mythic heroic age: inspired by real-world mythology. "Thunder Seal", "Fate-Binding", "Song of the Wyrd".',
      'conquered-world':     'Occupied land, underground resistance magic: "Freedom\'s Flame", "Chain-Break", "Hidden Fire".',
      'clockwork-fantasy':   'Steampunk-adjacent fantasy alchemical formulae: "Pneumatic Ward", "Voltaic Spark", "Alchemical Blast", "Clockwork Summons".',
      'planar-world':        'Planar travel magic: "Astral Shift", "Planelock", "Dimensional Anchor", "Portal Crush".',
      'hidden-magic':        'Magic hidden from mundane world: subtle, minimalist. "Quiet Working", "The Unseen Hand", "The Weaver\'s Touch".',
      'horror':              'Horror: dread-inducing, visceral. "Screaming Dark", "The Red Hour", "Hollow Stare", "Blood Tide".',
      'lovecraftian':        'Lovecraftian cosmic horror: non-Euclidean, incomprehensible names. "Void Ignition", "The Dreaming Whisper", "Outside the Angles", "Thousand-Eyed Gaze".',
      'cosmic-horror':       'Cosmic horror: vast, alien, incomprehensible. "Outer Calling", "The Breach", "Fold of Un-Space", "The Worm That Turns".',
      'sci-fi':              'Science fiction psionic abilities — NO fantasy language. "Kinetic Thrust", "Neural Override", "Deep Scan", "Temporal Reading", "Bio-Pulse". Clinical or dramatic, never mystical.',
      'hard-scifi':          'Hard sci-fi cognitive techniques — scientific, clinical. "Cognitive Override Protocol", "EM Discharge", "Structural Reconstitution", "Biometric Signature Cloak".',
      'deep-space-opera':    'Space opera stellar abilities — sweeping, cosmic scale. "Void Nova", "Gravity Crush", "Warp-Step", "Stellar Empathy", "Event Horizon Strike".',
      'post-singularity':    'Post-singularity AI/digital world: code as reality. "Process Spike", "Memory Overwrite", "Reality Render", "Self-Modification", "Context Window Collapse".',
      'generation-ship':     'Generation ship systems as powers: "Engine Pulse", "Atmo-Breach", "Shield-Wall Protocol", "Cryo-Field", "Navigation Lock".',
      'colony-world':        'Colony world frontier tech: "Terraforming Touch", "Settlers\' Ward", "Atmosphere Seed", "Soil Communion".',
      'post-contact':        'First contact alien xenotech: strange, xenomorphic. "Xenokinesis", "Alien Echo", "Empathic Mesh", "Translation Override".',
      'uploaded-world':      'Digital existence, code as reality: "Packet Spike", "Deepfake Veil", "Process Deletion", "Loop Exploit", "Reality Patch".',
      'time-war':            'Temporal war: paradoxes and timeline damage. "Chrono-Spike", "Causal Loop", "Timeline Sever", "Grandfather Paradox Strike".',
      'dyson-sphere':        'Megastructure world: vast engineering scale. "Solar Tap", "Gravity Anchor", "Orbital Strike", "Structural Resonance Pulse".',
      'cyberpunk':           'Cyberpunk — hacker, neon, netrunner language. NO fantasy words. "Overclock Burst", "Neural Tap", "Ghost Protocol", "ICE Breaker", "Signal Flood".',
      'post-apocalypse':     'Post-apocalyptic wasteland: industrial, scarred, salvage-tech. "Napalm Burst", "Field Triage Pulse", "Rad-Surge", "Rust Cloud", "Wasteland Howl".',
      'steampunk':           'Steampunk clockwork alchemy: "Pneumatic Ward", "Tesla Arc", "Phlogiston Blast", "Gear Golem Summon", "Alchemical Tincture".',
      'zombie-apocalypse':   'Zombie wasteland survival: grim, scavenging. "Rotguard", "Shambler\'s Bane", "Death\'s Immunity", "Bone Wall", "Plague Touch".',
      'alien-occupation':    'Guerilla resistance: "Scrambler Pulse", "Ghost Step", "Frequency Jam", "Resistance Signal", "Uprising Roar".',
      'pandemic-world':      'Plague-ravaged world: biological. "Immunogen Burst", "Viral Purge", "Quarantine Field", "Pathogen Control".',
      'corporate-dystopia':  'Corporate dystopia: jargon twisted into power. "Hostile Takeover Strike", "PR Blackout", "Compliance Pulse", "Brand Loyalty Compulsion".',
      'superhuman-emergence':'Superhero emergence: comic-book punchy names. "Kinetic Strike", "Force Bubble", "Precog Flash", "Thermal Vision Wave".',
      'superhero':           'Superhero world: iconic punchy power names. "Energy Blast", "Psych Shatter", "Force Cage", "Super-Speed Burst", "Heat Vision".',
      'western':             'Frontier western: dust, gunfire, grit. "Dust Devil Step", "Frontier Fortune", "Cursed Brand", "Deadman\'s Draw", "Brimstone Hex".',
      'pirate':              'High seas piracy: tidal curses, sea shanties. "Deepwater Curse", "Siren\'s Pull", "Navigator\'s Eye", "Kraken\'s Mark", "Dead Man\'s Tide".',
      'noir':                'Noir mystery: smoky, cynical, grimy. "Smokescreen", "The Long Con", "Cold Read", "Two-Faced Charm", "Night Shroud".',
      'mythological':        'Classical mythology: divine epithets. "Zeus-Fire", "Aegis Ward", "Apollo\'s Sight", "Ares\' Fury", "Hermes\' Veil".',
      'norse-twilight':      'Norse apocalypse — runes, giants, ravens. "Mjolnir Strike", "Valknut Ward", "Huginn\'s Sight", "Jormungandr\'s Coil", "Ragnarok\'s Edge".',
      'greek-heroic-age':    'Greek heroic age — olympian names. "Olympian Thunderbolt", "Medusa Stare", "Hermes\' Veil", "Labyrinth Fear", "Hydra Strike".',
      'egyptian-eternal':    'Ancient Egypt — Ka-soul, hieroglyphic. "Eye of Ra", "Ka Drain", "Khepri\'s Wings", "Anubis Judgment", "Scarab Swarm".',
      'arthurian-twilight':  'Arthurian legend — chivalric, Grail-quest. "Excalibur\'s Edge", "Holy Grail Light", "Morgan\'s Hex", "Pendragon\'s Will".',
      'feudal-japan-supernatural': 'Feudal Japan supernatural — kanji-inspired jutsu. "Kage Shuriken", "Binding Seal", "Ninpo: Shadow Step", "Oni\'s Roar", "Cherry Blossom Storm".',
      'age-of-sail-mythology': 'Age of sail mythology — sea gods, monsters. "Kraken\'s Reach", "Neptune\'s Wrath", "Corsair\'s Luck", "Siren Song".',
      'celtic-spiritworld':  'Celtic spirit world — druidic, nature-spirit. "Greenwood Surge", "The Wild Calling", "Fae Mist", "Sidhe Step", "Ogham Ward".',
      'aztec-sun-keeping':   'Aztec sun ritual — sacrifice, solar power. "Sun-Blood Burst", "Eagle Knight Strike", "Feathered Serpent\'s Blessing", "Sun-Heart Fire".',
      'mesopotamian-dawn':   'Mesopotamian — cuneiform, divine word. "Word of Ea", "The Flood\'s Memory", "Marduk\'s Seal", "Gilgamesh\'s Might".',
      'dream-world':         'Dreamscape — surreal, layered. "The Long Fall", "False Waking", "Glass Memory", "Loop Nightmare", "Lucid Prison".',
      'modern-magic-revealed': 'Hidden magic in modern world: standard fantasy names are fine, but add contemporary texture. "Combustion Hex", "Digital Ward", "Road-Curse".',
      'interdimensional-leak': 'Reality bleeding from other dimensions: glitchy. "Dimensional Bleed", "Phase Stutter", "Reality Patch", "The Seam Tears".',
      'recursive-reality':   'Looping reality: meta. "Rewind", "Save State", "Loop Break", "Undo", "The Skip".',
      'the-long-fall':       'Endless falling world: gravity-themed. "Terminal Velocity", "Ground Rush", "The Plummet", "Soft Landing".',
      'survival':            'Brutal survival: harsh, direct. "Endurance", "Hunter\'s Focus", "Iron Skin", "Predator\'s Eye", "Pack Howl".',
      'military':            'Military sci-fi/fantasy: tactical, callsign-based. "Fire Mission Alpha", "Smoke Grenade", "Suppressive Burst", "Breach and Clear".',
      'political-intrigue':  'Political court intrigue: social, subtle. "Whispered Threat", "Scandal\'s Edge", "Noble\'s Boon", "Silver Tongue", "The Hidden Knife".',
    };

    const genreStyle = GENRE_STYLES[worldGenre]
      ?? `Genre: ${worldGenre}${worldTheme ? ` (${worldTheme})` : ''}. Name all ${term.abilities} to fit the world's aesthetic — avoid generic D&D spell names.`;

    const systemPrompt = `You are a master game designer creating thematically unique ${term.abilities} for a tabletop RPG.
In this world, these abilities are called "${term.abilities}" (singular: "${term.ability}"). The act of using them is to "${term.verb}" them. Slots/resources are called "${term.slotsLabel}".

${magicFlavor}

Genre aesthetic: ${worldGenre}${worldTheme ? ` / ${worldTheme}` : ''}
${genreStyle}${schoolRenameHint}

STRICT RULES:
- All ${term.ability} names MUST fit the world's aesthetic — NO generic D&D names.
- Descriptions: 1-2 rich, flavorful sentences matching the world's tone. For sci-fi remove spell-casting language.
- Mechanics balanced for D&D 5e: cantrips=1d8-1d10, 1st=2d6-2d8, 2nd=3d6-4d6, 3rd=6d6-8d6, 4th=8d6, 5th=12d6.
- Components: in sci-fi/cyberpunk/tech genres, use "Mental focus" or "Biometric signature" instead of "V, S, M".
- Range/duration: match genre conventions ("30 meters" or "line-of-sight" for sci-fi; "60 feet" for fantasy).
- Mix attack-based and saving-throw-based effects where count > 1.
- isRitual=true only for appropriate utility/exploration effects.

DO NOT repeat ${term.abilities} the character already knows: ${existingSpellNames.join(', ') || 'none'}.

Return ONLY a JSON array, no markdown:
[
  {
    "id": "unique-slug",
    "name": "World-Flavored Name matching the aesthetic",
    "level": ${targetLevel},
    "school": "${schools[0]}",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": "V, S",
    "duration": "Instantaneous",
    "description": "1-2 rich sentences matching the world's tone and genre.",
    "damage": "Xd6 fire",
    "savingThrow": "dex",
    "isPrepared": false,
    "isRitual": false
  }
]
Only include "damage" and "savingThrow" when applicable.`;

    const userPrompt = `Generate ${count} ${isCantrip ? term.cantripLabel : `${term.tierLabel(targetLevel)} ${term.ability}`}${count > 1 ? 's' : ''} for a ${characterClass}${characterContext ? ` (${characterContext})` : ''} at character level ${characterLevel}.
Casting ability: ${castingAbility.toUpperCase()}.
${term.schoolsLabel} available for this class: ${schools.join(', ')}.
Mix offensive, defensive, and utility effects where count > 1.
IMPORTANT: All names and flavor MUST fit the ${worldGenre} aesthetic. Do not use generic D&D names.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';

    // The model may return {"spells": [...]} or just [...]
    let parsed: unknown = JSON.parse(raw);
    let spells: Spell[];

    if (Array.isArray(parsed)) {
      spells = parsed as Spell[];
    } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).spells)) {
      spells = (parsed as Record<string, unknown[]>).spells as Spell[];
    } else {
      // Last resort: find the first array in the object
      const vals = Object.values(parsed as Record<string, unknown>);
      spells = (vals.find(v => Array.isArray(v)) as Spell[]) ?? [];
    }

    // Normalize & fill defaults
    spells = spells.map((sp, i) => ({
      id: sp.id ?? `gen-${Date.now()}-${i}`,
      name: sp.name ?? `Unknown Spell ${i + 1}`,
      level: sp.level ?? targetLevel,
      school: sp.school ?? 'Evocation',
      castingTime: sp.castingTime ?? '1 action',
      range: sp.range ?? 'Self',
      components: sp.components ?? 'V, S',
      duration: sp.duration ?? 'Instantaneous',
      description: sp.description ?? '',
      damage: sp.damage,
      savingThrow: sp.savingThrow as Spell['savingThrow'],
      isPrepared: false,
      isRitual: sp.isRitual ?? false,
    }));

    return NextResponse.json({ spells, count: spells.length });
  } catch (err) {
    console.error('[spells/generate]', err);
    return NextResponse.json(
      { error: 'Spell generation failed', details: String(err) },
      { status: 500 }
    );
  }
}
