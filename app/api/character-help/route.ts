import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';

export const maxDuration = 30;

/** The fields we can generate help for */
type HelpField =
  | 'name'
  | 'description'
  | 'storyHook'
  | 'backstory'
  | 'motivation'
  | 'fears'
  | 'mannerisms'
  | 'connections'
  | 'trait'
  | 'ideal'
  | 'bond'
  | 'flaw'
  | 'enhance';

interface CharacterContext {
  worldName?: string;
  worldGenre?: string;
  origin?: string;
  className?: string;
  classRole?: string;
  background?: string;
  abilityScores?: Record<string, number>;
  personality?: {
    traits: string[];
    ideal: string;
    bond: string;
    flaw: string;
  };
  name?: string;
  description?: string;
  backstory?: string;
  motivation?: string;
  storyHook?: string;
}

interface HelpRequest {
  field: HelpField;
  context: CharacterContext;
  /** For 'enhance' mode: the selected text to improve */
  selectedText?: string;
  /** For 'enhance' mode: user's direction for the enhancement */
  enhanceDirection?: string;
}

interface Suggestion {
  text: string;
  label: string;
}

interface HelpResponse {
  suggestions: Suggestion[];
}

function buildCharacterSummary(ctx: CharacterContext): string {
  const parts: string[] = [];
  if (ctx.worldName) parts.push(`World: ${ctx.worldName}${ctx.worldGenre ? ` (${ctx.worldGenre})` : ''}`);
  if (ctx.origin) parts.push(`Origin/Race: ${ctx.origin}`);
  if (ctx.className) parts.push(`Class: ${ctx.className}${ctx.classRole ? ` (${ctx.classRole})` : ''}`);
  if (ctx.background) parts.push(`Background: ${ctx.background}`);
  if (ctx.name) parts.push(`Name: ${ctx.name}`);
  if (ctx.abilityScores) {
    const scores = ctx.abilityScores;
    parts.push(`Ability Scores: STR ${scores.str}, DEX ${scores.dex}, CON ${scores.con}, INT ${scores.int}, WIS ${scores.wis}, CHA ${scores.cha}`);
  }
  if (ctx.personality) {
    const p = ctx.personality;
    if (p.traits.length) parts.push(`Traits: ${p.traits.join(', ')}`);
    if (p.ideal) parts.push(`Ideal: ${p.ideal}`);
    if (p.bond) parts.push(`Bond: ${p.bond}`);
    if (p.flaw) parts.push(`Flaw: ${p.flaw}`);
  }
  if (ctx.description) parts.push(`Appearance: ${ctx.description}`);
  if (ctx.backstory) parts.push(`Backstory: ${ctx.backstory}`);
  if (ctx.motivation) parts.push(`Motivation: ${ctx.motivation}`);
  if (ctx.storyHook) parts.push(`Story Hook: ${ctx.storyHook}`);
  return parts.join('\n');
}

const FIELD_PROMPTS: Record<Exclude<HelpField, 'enhance'>, string> = {
  name: `Generate 4 character name suggestions. Names should fit the world setting, origin/race, and class.
Each name should feel distinct — vary cultural origins, syllable counts, and tone (epic, grounded, exotic, mysterious).
Return JSON: { "suggestions": [{ "text": "<name>", "label": "<1-3 word style hint>" }] }`,

  description: `Generate 3 physical appearance descriptions (2-3 sentences each). Factor in the race/origin, class, background, and ability scores. High STR = muscular, high DEX = lithe, low CHA = scarred/off-putting, etc. Include distinctive features like scars, tattoos, eye color, clothing style.
Return JSON: { "suggestions": [{ "text": "<description>", "label": "<1-2 word tone>" }] }`,

  storyHook: `Generate 3 story hook sentences. Each should be a single evocative sentence that sets up a mystery, quest, or personal conflict tied to this character's background and world. These hooks will shape the AI-generated world.
Return JSON: { "suggestions": [{ "text": "<hook>", "label": "<1-2 word theme>" }] }`,

  backstory: `Generate 3 backstory paragraphs (3-5 sentences each). Weave in the character's origin, class, background, personality traits, bonds, and flaws. Include a formative event, a key relationship, and a reason they became an adventurer.
Return JSON: { "suggestions": [{ "text": "<backstory>", "label": "<1-2 word tone>" }] }`,

  motivation: `Generate 3 character motivations (1-2 sentences each). What drives this character? Connect to their bond, ideal, background, and class. Include both a surface goal and a deeper need.
Return JSON: { "suggestions": [{ "text": "<motivation>", "label": "<1-2 word theme>" }] }`,

  fears: `Generate 3 fears/weaknesses (1-2 sentences each). What terrifies this character or holds them back? Connect to their flaw, background, and class. Make them specific and story-worthy, not generic.
Return JSON: { "suggestions": [{ "text": "<fear>", "label": "<1-2 word type>" }] }`,

  mannerisms: `Generate 3 sets of speech patterns and mannerisms (2-3 sentences each). How does this character talk, move, and behave? Factor in CHA score, background, class, and origin. Include verbal tics, body language, and habits.
Return JSON: { "suggestions": [{ "text": "<mannerisms>", "label": "<1-2 word style>" }] }`,

  connections: `Generate 3 relationship/connection descriptions (2-3 sentences each). Who does this character know? Include a mentor/ally, a rival/enemy, and a personal connection. Tie to their background, bond, and world.
Return JSON: { "suggestions": [{ "text": "<connections>", "label": "<1-2 word type>" }] }`,

  trait: `Generate 4 unique personality traits for this character. Each should be a single sentence that reveals how the character behaves, thinks, or interacts. Factor in their background, class, origin, and ability scores. Make each distinct in tone.
Return JSON: { "suggestions": [{ "text": "<trait>", "label": "<1-2 word style>" }] }`,

  ideal: `Generate 4 character ideals — the principles or beliefs that guide this character's actions. Tie each to their background, class, and world setting. Each should be 1 word or short phrase followed by a brief explanation.
Return JSON: { "suggestions": [{ "text": "<ideal>", "label": "<1 word category>" }] }`,

  bond: `Generate 4 character bonds — the people, places, or things this character cares about most. Tie each to their background, origin, and world. Each should be a specific, evocative sentence.
Return JSON: { "suggestions": [{ "text": "<bond>", "label": "<1-2 word type>" }] }`,

  flaw: `Generate 4 character flaws — the weaknesses, vices, or blind spots that make this character vulnerable. Tie each to their background and personality. Each should be specific and create interesting story moments.
Return JSON: { "suggestions": [{ "text": "<flaw>", "label": "<1-2 word type>" }] }`,
};

export async function POST(req: NextRequest) {
  try {
    const { field, context, selectedText, enhanceDirection } = (await req.json()) as HelpRequest;

    const VALID_FIELDS: HelpField[] = [
      'name', 'description', 'storyHook', 'backstory', 'motivation',
      'fears', 'mannerisms', 'connections', 'trait', 'ideal', 'bond', 'flaw', 'enhance',
    ];
    if (!VALID_FIELDS.includes(field)) {
      return NextResponse.json({ error: `Invalid field: ${field}` }, { status: 400 });
    }

    const characterSummary = buildCharacterSummary(context);

    let prompt: string;
    let systemPrompt: string;

    if (field === 'enhance') {
      systemPrompt = `You are a creative writing assistant for a tabletop RPG character builder. You enhance and expand text while keeping the original voice and intent. Match the world setting and tone.`;

      const directionPart = enhanceDirection
        ? `The user wants to enhance it in this direction: "${enhanceDirection}"`
        : 'Make it more vivid, specific, and evocative while keeping the core meaning.';

      prompt = `Character context:
${characterSummary}

Original text to enhance:
"${selectedText}"

${directionPart}

Generate 3 enhanced versions. Each should be a clear improvement while remaining distinct.
Return JSON: { "suggestions": [{ "text": "<enhanced text>", "label": "<1-2 word style>" }] }`;
    } else {
      systemPrompt = `You are a creative assistant for a tabletop RPG character builder. You generate evocative, setting-appropriate character details. Always be specific and imaginative — never generic. Adapt tone and style to match the world genre.`;

      prompt = `Character context:
${characterSummary}

Task: ${FIELD_PROMPTS[field]}`;
    }

    const result = await callClaudeJSON<HelpResponse>(
      'npc_dialogue', // Use Sonnet — fast, creative, great at character
      systemPrompt,
      prompt,
      { maxTokens: 1500 }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[character-help] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', suggestions: [] },
      { status: 500 }
    );
  }
}
