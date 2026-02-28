// ============================================================
// IMAGE PROMPT BUILDERS
// Constructs detailed, art-style-aware prompts for image gen.
// ============================================================

// Map genre to default art style
const GENRE_ART_STYLES: Record<string, string> = {
  'high-fantasy': 'epic fantasy art, detailed oil painting style, dramatic lighting, rich colors',
  'dark-fantasy': 'dark gothic fantasy art, moody atmosphere, muted tones, dramatic shadows',
  'sword-and-sorcery': 'classic sword and sorcery illustration, pulp fantasy art style, bold lines',
  'steampunk': 'steampunk aesthetic, brass and copper tones, Victorian-era machinery, detailed mechanical elements',
  'science-fantasy': 'science fantasy art, blend of magic and technology, vibrant neon and ethereal glow',
  'gothic-horror': 'gothic horror illustration, dark atmospheric, candlelit shadows, haunting mood',
  'mythic': 'classical mythological art, heroic figures, divine lighting, marble and gold',
  'post-apocalyptic': 'post-apocalyptic landscape art, wasteland aesthetic, rust and decay, harsh light',
  'nautical-fantasy': 'nautical fantasy art, ocean storms, ship battles, turquoise and deep blue',
  'urban-fantasy': 'urban fantasy illustration, modern city with magical elements, neon lights and arcane sigils',
  'fairy-tale': 'storybook illustration style, whimsical and enchanting, soft watercolor feel',
  'wuxia': 'wuxia art style, Chinese ink painting influence, martial arts poses, flowing silk',
  'cosmic-horror': 'cosmic horror art, eldritch and unknowable, tentacles and void, deep space colors',
  'grimdark': 'grimdark fantasy art, gritty and brutal, muted earthy tones, blood and mud',
  'heroic-fantasy': 'heroic fantasy art, triumphant poses, golden hour lighting, noble and grand',
  'weird-west': 'weird west illustration, desert landscapes, supernatural elements, sepia tones',
  'dieselpunk': 'dieselpunk aesthetic, 1940s military style, heavy machinery, propaganda poster influence',
};

function getArtStyle(genre?: string): string {
  if (!genre) return GENRE_ART_STYLES['high-fantasy'];
  return GENRE_ART_STYLES[genre] || GENRE_ART_STYLES['high-fantasy'];
}

/**
 * Build a character portrait prompt.
 */
export function buildPortraitPrompt(params: {
  name: string;
  race: string;
  characterClass: string;
  appearance?: string;
  genre?: string;
  genreArtStyle?: string;
}): string {
  const { name, race, characterClass, appearance, genre, genreArtStyle } = params;
  const artStyle = genreArtStyle || getArtStyle(genre);

  let prompt = `A character portrait of ${name}, a ${race} ${characterClass}. `;

  if (appearance) {
    prompt += `${appearance} `;
  }

  prompt += `Portrait framing, face and upper torso visible, looking towards the viewer. `;
  prompt += `${artStyle}. `;
  prompt += `RPG character portrait, high detail, professional quality. `;
  prompt += `No text, no watermarks, no signatures.`;

  return prompt;
}

/**
 * Build an NPC portrait prompt.
 */
export function buildNPCPortraitPrompt(params: {
  name: string;
  race?: string;
  role: string;
  physicalDescription?: string;
  genre?: string;
}): string {
  const { name, race, role, physicalDescription, genre } = params;
  const artStyle = getArtStyle(genre);

  let prompt = `A character portrait of ${name}`;
  if (race) prompt += `, a ${race}`;
  prompt += `, who is a ${role}. `;

  if (physicalDescription) {
    prompt += `${physicalDescription} `;
  }

  prompt += `Portrait framing, face and upper torso. `;
  prompt += `${artStyle}. `;
  prompt += `RPG NPC portrait, high detail. No text, no watermarks.`;

  return prompt;
}

/**
 * Build a location/scene image prompt.
 */
export function buildLocationPrompt(params: {
  name: string;
  description: string;
  genre?: string;
  timeOfDay?: string;
  weather?: string;
}): string {
  const { name, description, genre, timeOfDay, weather } = params;
  const artStyle = getArtStyle(genre);

  let prompt = `${name}: ${description}. `;

  if (timeOfDay) {
    prompt += `Time of day: ${timeOfDay}. `;
  }
  if (weather) {
    prompt += `Weather: ${weather}. `;
  }

  prompt += `Wide landscape composition, establishing shot. `;
  prompt += `${artStyle}. `;
  prompt += `Fantasy RPG environment art. No text, no watermarks.`;

  return prompt;
}

/**
 * Build a scene illustration prompt for in-chat images.
 */
export function buildScenePrompt(params: {
  sceneDescription: string;
  characters?: string[];
  genre?: string;
  mood?: string;
}): string {
  const { sceneDescription, characters, genre, mood } = params;
  const artStyle = getArtStyle(genre);

  let prompt = `${sceneDescription} `;

  if (characters && characters.length > 0) {
    prompt += `Characters present: ${characters.join(', ')}. `;
  }

  if (mood) {
    prompt += `Mood: ${mood}. `;
  }

  prompt += `Cinematic composition, dramatic angle. `;
  prompt += `${artStyle}. `;
  prompt += `Fantasy RPG scene illustration. No text, no watermarks.`;

  return prompt;
}

/**
 * Build an item artwork prompt.
 */
export function buildItemPrompt(params: {
  name: string;
  description: string;
  rarity?: string;
  genre?: string;
}): string {
  const { name, description, rarity, genre } = params;
  const artStyle = getArtStyle(genre);

  let prompt = `${name}: ${description}. `;

  if (rarity && rarity !== 'common') {
    const glowMap: Record<string, string> = {
      uncommon: 'faint green magical glow',
      rare: 'blue magical aura',
      'very-rare': 'purple arcane energy surrounding it',
      legendary: 'golden legendary radiance',
      artifact: 'reality-warping cosmic energy emanating from it',
    };
    prompt += `${glowMap[rarity] || ''}. `;
  }

  prompt += `Single item on a neutral dark background, centered composition. `;
  prompt += `${artStyle}. `;
  prompt += `RPG item icon art, detailed. No text, no watermarks.`;

  return prompt;
}
