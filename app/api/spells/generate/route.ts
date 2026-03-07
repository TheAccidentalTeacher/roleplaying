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

    const genreStyle = worldGenre === 'post-apocalypse'
      ? 'Post-apocalyptic: use industrial, wasteland, or scavenged-tech language for spell names and descriptions. E.g., instead of "Fireball" use "Napalm Burst". Instead of "Healing Word" use "Field Triage Pulse".'
      : worldGenre === 'cyberpunk'
      ? 'Cyberpunk: use hacker, neon, netrunner language. "Fireball" → "Overclock Burst". "Detect Thoughts" → "Neural Tap".'
      : worldGenre === 'steampunk'
      ? 'Steampunk: use steam-powered, alchemical, clockwork language. "Shield" → "Pneumatic Ward". "Lightning Bolt" → "Tesla Arc".'
      : worldGenre === 'lovecraftian' || worldGenre === 'cosmic-horror'
      ? 'Cosmic horror: use unknowable, tentacled, non-Euclidean language. "Fireball" → "Void Ignition". "Charm Person" → "The Dreaming Whisper".'
      : worldGenre === 'western'
      ? 'Western: use frontier, dust, gunslinger language. "Misty Step" → "Dust Devil Step". "Bless" → "Frontier Fortune".'
      : 'Standard fantasy naming.';

    const systemPrompt = `You are a master game designer creating thematically unique spells for a tabletop RPG.

${magicFlavor}

Genre aesthetic: ${worldGenre}${worldTheme ? ` / ${worldTheme}` : ''}
${genreStyle}

RULES:
- All spell names MUST reflect the world's magic system aesthetic — do not use generic D&D names.
- Mechanics must be balanced for D&D 5e rules at the given level.
- Descriptions should be 1-2 rich, flavorful sentences.
- Damage values should follow 5e conventions: cantrips = 1d8-1d10, 1st = 2d6-2d8, 2nd = 3d6-4d6, 3rd = 6d6-8d6.

DO NOT generate spells the character already knows: ${existingSpellNames.join(', ') || 'none'}.

Return ONLY a JSON array, no markdown:
[
  {
    "id": "unique-slug",
    "name": "World-Flavored Spell Name",
    "level": ${targetLevel},
    "school": "${schools[0]}",
    "castingTime": "1 action",
    "range": "60 feet",
    "components": "V, S",
    "duration": "Instantaneous",
    "description": "Evocative 1-2 sentence description that matches the world's tone.",
    "damage": "Xd6 fire",
    "savingThrow": "dex",
    "isPrepared": false,
    "isRitual": false
  }
]
Only include "damage" and "savingThrow" if applicable. "isRitual" should be true only for appropriate utility spells.`;

    const userPrompt = `Generate ${count} ${isCantrip ? 'cantrip' : `level-${targetLevel}`} spell${count > 1 ? 's' : ''} for a ${characterClass}${characterContext ? ` (${characterContext})` : ''} at character level ${characterLevel}.
Casting ability: ${castingAbility.toUpperCase()}.
Schools available for this class: ${schools.join(', ')}.
Mix offensive, defensive, and utility where count > 1.`;

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
