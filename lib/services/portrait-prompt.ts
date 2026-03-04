/**
 * PORTRAIT PROMPT BUILDER
 *
 * Two stages:
 * 1. generateVisualIdentity() — Claude reads the full character sheet + world data
 *    and produces a reusable "visual identity" prompt prefix that describes the
 *    character's physical appearance, ACTUAL equipment, art style matching the
 *    world genre, palette, and lighting. This is stored and reused for ALL future
 *    portraits to maintain visual consistency.
 *
 * 2. buildPortraitPrompt() — Combines the visual identity prefix with a
 *    context-specific scene description (e.g. level, story moment) to produce
 *    the final image generation prompt. The scene description is also genre-aware.
 */

import type { Character } from '@/lib/types/character';
import type { VisualIdentity, PortraitMilestone } from '@/lib/types/gallery';
import { callClaude } from '@/lib/ai-orchestrator';

// ─── HELPERS ───────────────────────────────────────────────────────

/**
 * Extract a concise but detailed equipment description from the character sheet.
 * This ensures armor, weapons, and gear are accurately described in the prompt.
 */
function describeEquipment(character: Character): string {
  const parts: string[] = [];

  const eq = character.equipment;
  if (eq) {
    if (eq.head) parts.push(`Head: ${eq.head}`);
    if (eq.chest) parts.push(`Chest/Torso: ${eq.chest}`);
    if (eq.back) parts.push(`Back/Cloak: ${eq.back}`);
    if (eq.hands) parts.push(`Hands: ${eq.hands}`);
    if (eq.legs) parts.push(`Legs: ${eq.legs}`);
    if (eq.feet) parts.push(`Feet: ${eq.feet}`);
    if (eq.neck) parts.push(`Neck: ${eq.neck}`);
    if (eq.belt) parts.push(`Belt: ${eq.belt}`);
    if (eq['weapon-main']) parts.push(`Main Weapon: ${eq['weapon-main']}`);
    if (eq['weapon-off']) parts.push(`Off-hand: ${eq['weapon-off']}`);
    if (eq['ring-l'] || eq['ring-r']) {
      const rings = [eq['ring-l'], eq['ring-r']].filter(Boolean).join(', ');
      parts.push(`Rings: ${rings}`);
    }
    if (eq['trinket-1'] || eq['trinket-2']) {
      const trinkets = [eq['trinket-1'], eq['trinket-2']].filter(Boolean).join(', ');
      parts.push(`Trinkets: ${trinkets}`);
    }
  }

  // Armor class gives context for protection level
  if (character.armorClass) {
    parts.push(`Armor Class: ${character.armorClass}`);
  }

  // Proficiencies tell us what they'd realistically wear
  if (character.proficiencies) {
    if (character.proficiencies.armor?.length) {
      parts.push(`Armor proficiencies: ${character.proficiencies.armor.join(', ')}`);
    }
    if (character.proficiencies.weapons?.length) {
      parts.push(`Weapon proficiencies: ${character.proficiencies.weapons.join(', ')}`);
    }
  }

  // Backpack items for flavor
  if (character.inventory?.length) {
    parts.push(`Backpack items: ${character.inventory.slice(0, 10).join(', ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'No specific equipment listed';
}

/**
 * Build a rich genre/world context block from the full world record.
 * This ensures the visual identity and portrait match the world's era,
 * technology level, aesthetic, and setting — not a generic fantasy.
 */
function buildWorldContext(worldGenre?: string, worldData?: Record<string, unknown>): string {
  if (!worldData && !worldGenre) {
    return 'World Genre: Classic high fantasy (medieval European setting)';
  }

  const parts: string[] = [];

  if (worldData) {
    if (worldData.worldType) parts.push(`World Type: ${worldData.worldType}`);
    if (worldData.worldName) parts.push(`World Name: ${worldData.worldName}`);
    if (worldData.primaryGenre) parts.push(`Primary Genre: ${worldData.primaryGenre}`);
    if (worldData.genreBlends && Array.isArray(worldData.genreBlends) && worldData.genreBlends.length) {
      parts.push(`Genre Blends: ${worldData.genreBlends.join(', ')}`);
    }
    if (worldData.genreArtStyle) parts.push(`Art Style Direction: ${worldData.genreArtStyle}`);
    if (worldData.technologyLevel) parts.push(`Technology Level: ${worldData.technologyLevel}`);
    if (worldData.narrativeTone && Array.isArray(worldData.narrativeTone)) {
      parts.push(`Narrative Tone: ${worldData.narrativeTone.join(', ')}`);
    }
    if (worldData.cosmology) parts.push(`Cosmology: ${worldData.cosmology}`);

    // Magic system context
    const magic = worldData.magicSystem as Record<string, unknown> | undefined;
    if (magic) {
      if (magic.name) parts.push(`Magic System: ${magic.name}`);
      if (magic.socialAttitude) parts.push(`Magic in Society: ${magic.socialAttitude}`);
    }

    // Thematic core
    if (worldData.thematicCore) parts.push(`Thematic Core: ${worldData.thematicCore}`);
  }

  // Fallback to simple genre string
  if (parts.length === 0 && worldGenre) {
    parts.push(`World Genre: ${worldGenre}`);
  }

  return parts.join('\n');
}

// ─── MAIN FUNCTIONS ────────────────────────────────────────────────

/**
 * Have Claude analyze the character sheet + world data and generate a reusable
 * visual identity prompt that will be prepended to every future portrait.
 * This ensures all portraits look like the same character in the same art style,
 * wearing their ACTUAL equipment, in a genre-appropriate visual style.
 */
export async function generateVisualIdentity(
  character: Character,
  worldGenre?: string,
  worldData?: Record<string, unknown>,
): Promise<VisualIdentity> {
  const worldContext = buildWorldContext(worldGenre, worldData);
  const equipmentDesc = describeEquipment(character);

  const systemPrompt = `You are an expert art director for a TTRPG game. Your job is to create a reusable visual identity for a character that will be used as a prompt prefix for AI image generation (gpt-image-1).

CRITICAL RULES:
- The character MUST be depicted wearing their ACTUAL listed equipment — not generic fantasy gear
- The art style, lighting, materials, and color palette MUST match the world's genre and technology level
- A character in a medieval fantasy world wears actual chainmail, leather, cloth — NOT modern clothing
- A character in a cyberpunk world wears neon-lit tech armor — NOT medieval plate
- A character in a post-apocalyptic world wears scavenged gear — NOT pristine fantasy robes
- Be specific about MATERIALS and TEXTURES (leather, steel, silk, rusted iron, carbon fiber, etc.)
- Reference the ACTUAL items from their equipment list by name and describe what they look like

The visual identity MUST include:
1. **Physical Appearance**: Race, build, height, skin tone, hair (color, style, length), eyes, distinguishing features, scars, tattoos, facial features
2. **Clothing & Equipment**: Describe their ACTUAL equipped items visually — what the armor looks like, what the weapon looks like, how items hang/sit on their body. Be specific about materials, condition, and fit. DO NOT invent equipment they don't have.
3. **Art Style**: Consistent artistic direction that matches the world's genre/art style. Examples: "detailed fantasy oil painting with warm dramatic lighting" for high fantasy, "gritty desaturated concept art with harsh shadows" for dark fantasy, "sleek digital illustration with neon accents" for cyberpunk, "dusty western landscape painting style" for frontier settings
4. **Lighting & Palette**: Dominant color palette and lighting that matches the world's tone
5. **Setting Coherence**: The overall visual must feel like it belongs in THIS specific world

Output ONLY a JSON object with these exact fields:
{
  "promptPrefix": "A [detailed 2-3 sentence character description with physical details, ACTUAL equipped items described visually, materials and textures]. Style: [art style matching world genre, with medium, lighting, palette]. ",
  "artStyle": "[short art style label matching world genre, e.g. 'Dark fantasy oil painting, cold moonlight']"
}

The promptPrefix should be written as an image generation prompt — vivid, specific, visual. NO character names (image models can't use names). Describe what you SEE. Keep under 250 words.`;

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
${character.backstory ? `Backstory: ${character.backstory}` : ''}

EQUIPPED ITEMS (the character MUST be wearing/carrying these specific items):
${equipmentDesc}

WORLD CONTEXT (the art style and visual tone MUST match this setting):
${worldContext}

Generate a visual identity that:
1. Depicts the character wearing their ACTUAL equipped items described above
2. Uses an art style that matches the world's genre, technology level, and tone
3. Maintains visual coherence between the character and their world`;

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
 * Now includes character equipment details and world context for scene accuracy.
 */
export function buildPortraitPrompt(
  visualIdentity: VisualIdentity,
  milestone: PortraitMilestone,
  character: Character,
  storyContext?: string,
  worldData?: Record<string, unknown>,
): string {
  const characterLevel = character.level;

  // Extract key world details for scene descriptions
  const techLevel = worldData?.technologyLevel as string || '';
  const worldType = worldData?.worldType as string || '';
  const genreArt = worldData?.genreArtStyle as string || '';

  // Genre-adaptive scene backgrounds
  const genreSceneHint = techLevel
    ? `Setting details: ${worldType} world, ${techLevel} technology level. `
    : '';

  const sceneDescriptors: Record<PortraitMilestone, string> = {
    'creation': `${genreSceneHint}Portrait of a fresh level 1 adventurer just beginning their journey. Eager but untested, gear is new and unscuffed, determination in their eyes. Background: a path stretching ahead, dawn light breaking through.`,
    'level-5': `${genreSceneHint}Portrait of a level ${characterLevel} adventurer gaining confidence. Gear shows signs of use, stance more assured. Background: a dramatic entrance to unknown territory.`,
    'level-10': `${genreSceneHint}Portrait of a seasoned level ${characterLevel} hero at the height of their power. Equipment well-maintained and battle-proven, commanding presence. Background: an epic vista befitting the world.`,
    'level-15': `${genreSceneHint}Portrait of a legendary level ${characterLevel} champion. Radiating power, weapons and armor showing marks of epic battles, awe-inspiring presence. Background: a place of great power in this world.`,
    'level-20': `${genreSceneHint}Portrait of an epic level ${characterLevel} figure of myth. Near-godlike presence, ultimate gear, reality bending around them. Background: a climactic, world-defining setting.`,
    'custom': `${genreSceneHint}${storyContext || `Portrait of a level ${characterLevel} adventurer in a moment of contemplation.`}`,
    'story-moment': `${genreSceneHint}${storyContext || `Portrait of a level ${characterLevel} adventurer at a pivotal moment in their story.`}`,
  };

  const scene = sceneDescriptors[milestone];

  // Include a genre-style reinforcement if available
  const styleReinforcement = genreArt
    ? ` Art style: ${genreArt}.`
    : '';

  return `${visualIdentity.promptPrefix}${scene}${styleReinforcement} No text, no watermarks, no UI elements.`;
}
