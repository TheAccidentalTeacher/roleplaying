/**
 * PORTRAIT PROMPT BUILDER
 *
 * Two stages:
 * 1. generateVisualIdentity() — Claude reads the full character sheet and produces
 *    a reusable "visual identity" prompt prefix that describes the character's
 *    physical appearance, art style, palette, and lighting. This is stored and
 *    reused for ALL future portraits to maintain visual consistency.
 *
 * 2. buildPortraitPrompt() — Combines the visual identity prefix with a
 *    context-specific scene description (e.g. level, story moment) to produce
 *    the final image generation prompt.
 */

import type { Character } from '@/lib/types/character';
import type { VisualIdentity, PortraitMilestone } from '@/lib/types/gallery';
import { callClaude } from '@/lib/ai-orchestrator';

/**
 * Have Claude analyze the character sheet and generate a reusable visual identity
 * prompt that will be prepended to every future portrait. This ensures all
 * portraits look like the same character in the same art style.
 */
export async function generateVisualIdentity(
  character: Character,
  worldGenre?: string,
): Promise<VisualIdentity> {
  const systemPrompt = `You are an expert art director for a fantasy TTRPG game. Your job is to create a reusable visual identity for a character that will be used as a prompt prefix for AI image generation (DALL-E / gpt-image-1).

The visual identity MUST include:
1. **Physical Appearance**: Race, build, height, skin tone, hair (color, style, length), eyes, distinguishing features, scars, tattoos, facial features.
2. **Clothing & Gear**: Signature outfit style, armor type, weapon silhouette, color palette of outfit.
3. **Art Style**: Consistent artistic direction (e.g. "detailed fantasy oil painting", "dark fantasy concept art", "watercolor storybook illustration"). Match the world's genre/tone.
4. **Lighting & Palette**: Dominant color palette and lighting direction that should stay consistent.
5. **Character Energy**: The overall vibe/mood the character radiates.

Output ONLY a JSON object with these exact fields:
{
  "promptPrefix": "A [detailed 2-3 sentence character description with physical details, outfit, and visual markers]. Style: [art style with medium, lighting, palette]. ",
  "artStyle": "[short art style label, e.g. 'Fantasy oil painting, warm dramatic lighting']"
}

The promptPrefix should be written as an image generation prompt — vivid, specific, visual. NO names (image models can't use names). Describe what you SEE, not what you KNOW. Keep it under 200 words.`;

  const charSummary = `CHARACTER SHEET:
Name: ${character.name}
Race: ${character.race}
Class: ${character.class}${character.subclass ? ` (${character.subclass})` : ''}
Level: ${character.level}
Background: ${character.background}
Alignment: ${character.alignment}
Appearance: ${character.appearance || 'Not specified'}
${character.personality ? `Personality Traits: ${(character.personality.traits || []).join('; ')}
Ideal: ${character.personality.ideal || ''}
Bond: ${character.personality.bond || ''}
Flaw: ${character.personality.flaw || ''}` : ''}
Key Equipment: ${(character.inventory || []).slice(0, 8).join(', ')}
${worldGenre ? `World Genre: ${worldGenre}` : 'World Genre: Classic high fantasy'}

Generate a visual identity that captures this character's essence.`;

  const rawResponse = await callClaude(
    'npc_dialogue', // Using Sonnet — fast + good at creative tasks
    systemPrompt,
    [{ role: 'user', content: charSummary }],
    { maxTokens: 1024, temperature: 0.7 },
  );

  // Parse the JSON from Claude's response
  const cleaned = rawResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      promptPrefix: parsed.promptPrefix || '',
      artStyle: parsed.artStyle || 'Fantasy concept art',
      createdAt: new Date().toISOString(),
    };
  } catch {
    // Fallback: use the raw text as the prefix
    console.warn('[VisualIdentity] Failed to parse Claude response as JSON, using raw text');
    return {
      promptPrefix: cleaned.slice(0, 500),
      artStyle: 'Fantasy concept art',
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Build the full image generation prompt by combining the visual identity
 * prefix with context about the current milestone/scene.
 */
export function buildPortraitPrompt(
  visualIdentity: VisualIdentity,
  milestone: PortraitMilestone,
  characterLevel: number,
  storyContext?: string,
): string {
  const sceneDescriptors: Record<PortraitMilestone, string> = {
    'creation': `Portrait of a fresh level 1 adventurer just beginning their journey. Eager but untested, simple gear, determination in their eyes. Background: a road stretching ahead, dawn light.`,
    'level-5': `Portrait of a level ${characterLevel} adventurer gaining confidence. Battle-tested gear showing first wear, stronger stance. Background: a dramatic dungeon entrance or crossroads.`,
    'level-10': `Portrait of a seasoned level ${characterLevel} hero at the height of their power. Impressive gear, magical aura visible, commanding presence. Background: an epic vista — mountaintop, castle, or battlefield.`,
    'level-15': `Portrait of a legendary level ${characterLevel} champion. Radiating power, enchanted weapons glowing, armor battle-scarred but magnificent. Background: a throne room, dragon's lair, or cosmic plane.`,
    'level-20': `Portrait of an epic level ${characterLevel} figure of myth. Near-godlike presence, reality bending around them, ultimate gear. Background: celestial or apocalyptic — fitting their legend.`,
    'custom': storyContext || `Portrait of a level ${characterLevel} adventurer in a moment of contemplation.`,
    'story-moment': storyContext || `Portrait of a level ${characterLevel} adventurer at a pivotal moment in their story.`,
  };

  const scene = sceneDescriptors[milestone];

  return `${visualIdentity.promptPrefix}${scene} No text, no watermarks, no UI elements.`;
}
