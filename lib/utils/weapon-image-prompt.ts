// ============================================================
// WEAPON IMAGE PROMPT BUILDER
// Composes a rich, generator-ready prompt from WeaponCatalogEntry
// fields so DALL-E 3 / gpt-image-1 / Nano Banana / Stable
// Diffusion or any other pipeline produces accurate item art.
//
// Prompt structure:
//   [VISUAL CORE]  — imagePromptHint, exact visual description
//   [SUBJECT]      — name + subtype + genre anchor
//   [RARITY STYLE] — material quality, glow, enchantment cues
//   [GENRE STYLE]  — era / aesthetic matching the setting
//   [ART DIRECTION]— always: isolated-on-dark, lighting, format
// ============================================================

import type { WeaponCatalogEntry, GenreFamily } from '@/lib/data/weapons/types';

// ── Rarity → visual quality descriptors ─────────────────────
const RARITY_DESCRIPTORS: Record<string, string> = {
  junk:       'crude, improvised, worn, rust-stained, clearly damaged',
  common:     'plain craftsmanship, functional, no adornment, modest materials',
  uncommon:   'well-crafted, quality materials, subtle decorative detail',
  rare:       'masterwork, fine engraving, high-quality alloy, rich materials',
  'very-rare':'exceptional, rare metals, glowing runes or inlaid gems, clearly magical',
  epic:       'legendary craft, unearthly glow, sigils pulsing with power, awe-inspiring',
  legendary:  'divine or demonic power radiating from the blade, otherworldly light, myth-level detail',
  mythic:     'reality warps near it, primordial energy, floating particles, cosmic visual effects',
  artifact:   'tears reality at its edges, absolute ancient power, floating, impossible material',
};

// ── Genre family → art style anchor phrase ──────────────────
const GENRE_STYLES: Record<GenreFamily, string> = {
  'medieval-fantasy': 'fantasy RPG art style, warm dramatic lighting, Tolkien-inspired aesthetic',
  'dark-fantasy':     'dark fantasy art, grim atmosphere, cold blue-green lighting, blood-stained stone',
  'post-apocalypse':  'post-apocalyptic concept art, gritty realism, industrial wasteland setting, muted tones',
  'steampunk':        'steampunk aesthetics, brass gears, Victorian engineering, warm amber gas-lamp lighting',
  'cyberpunk':        'cyberpunk neon-lit concept art, holographic interface overlay, electric blue and magenta',
  'sci-fi':           'hard science fiction design, clean white-and-chrome, holographic blueprint glow',
  'contemporary':     'realistic modern product photography style, studio lighting, neutral gray background',
  'mythological':     'epic mythological art, ancient Greek-bronze-gold, divine radiance, marble and silver',
  'pirate':           'golden age of sail aesthetic, sea-worn wood and brass, salt-stained, stormy lighting',
  'western':          'wild west frontier style, weathered leather, polished iron, amber sunset lighting',
  'japanese':         'ukiyo-e meets modern concept art, lacquered wood, silk wrapping, ink-wash atmosphere',
  'cosmic-horror':    'eldritch horror aesthetic, non-Euclidean angles, sickly green glow, incomprehensible void',
};

// ── Damage type → material / effect hints ───────────────────
const DAMAGE_CUES: Record<string, string> = {
  slashing:   'sharp edge catching light',
  piercing:   'fine needle point',
  bludgeoning:'heavy blunt head, solid mass',
  fire:       'flame-etched runes, heat shimmer',
  cold:       'frost coating, ice crystals along blade',
  lightning:  'lightning arc tracing the edge, crackling electricity',
  radiant:    'divine golden glow emanating from the weapon',
  necrotic:   'dark miasma crawling along the surface',
  force:      'translucent energy form visible inside',
  acid:       'green corrosive drip along edge',
  psychic:    'iridescent sheen, color shifts with viewing angle',
  poison:     'faint toxic green coating, viscous drip',
  thunder:    'sound-wave rippling from impact point, shockwave lines',
};

// ── Category → camera/composition hint ──────────────────────
const COMPOSITION_HINTS: Record<string, string> = {
  bow:      'bow laid flat, slightly angled, string taut, arrows beside it',
  sword:    'sword laid diagonally, tip pointing upper-right, crossguard prominent',
  axe:      'axe head prominent in lower frame, handle angled upward',
  knife:    'knife point-up, slightly rotated to show edge profile',
  polearm:  'polearm at 30-degree diagonal, head detailed, shaft shortened for composition',
  blunt:    'blunt weapon upright, head filling upper third, handle below',
  exotic:   'weapon arranged to show its unique form, all parts visible',
  firearm:  'firearm at 3/4 angle showing action, barrel and butt both visible',
  energy:   'energy weapon hovering/floating, tech details glowing, power cell visible',
};

/**
 * Build a complete, generator-ready image prompt from a WeaponCatalogEntry.
 * Works with DALL-E 3, gpt-image-1, or any text-to-image API.
 *
 * @param entry   The weapon catalog entry
 * @param options Optional overrides
 */
export function buildWeaponImagePrompt(
  entry: WeaponCatalogEntry,
  options: {
    /** Override the primary genre style — defaults to first genreFamily */
    genreFamily?: GenreFamily;
    /** Extra prompt tokens to append verbatim */
    extraContext?: string;
    /** If false, skip the art-direction suffix (for shorter custom prompts) */
    includeArtDirection?: boolean;
  } = {}
): string {
  const includeArt = options.includeArtDirection !== false;

  // 1. Visual core — concrete visual description
  const visualCore = entry.imagePromptHint ?? `${entry.name}, ${entry.category}`;

  // 2. Subject anchor — name, material cues, damage type hints
  const damageCue = entry.damageType ? (DAMAGE_CUES[entry.damageType] ?? '') : '';
  const subjectParts = [
    entry.name,
    damageCue,
  ].filter(Boolean);

  // 3. Rarity quality descriptor
  const rarityDesc = RARITY_DESCRIPTORS[entry.rarity] ?? 'standard quality';

  // 4. Genre/era style
  const family = options.genreFamily ?? entry.genreFamilies[0];
  const genreStyle = family ? (GENRE_STYLES[family] ?? 'fantasy RPG art style') : 'fantasy RPG art style';

  // 5. Composition hint
  const composition = COMPOSITION_HINTS[entry.category] ?? 'centered composition';

  // 6. Special ability visual cue (if any)
  const specialCue = entry.specialAbilityDescription
    ? `Special: ${entry.specialAbilityDescription.slice(0, 80)}`
    : entry.specialAbility
    ? `Special ability visual: ${entry.specialAbility}`
    : '';

  // 7. Flavor mood from flavorText
  const moodCue = entry.flavorText
    ? `mood: "${entry.flavorText.slice(0, 60).replace(/"/g, '')}"` 
    : '';

  // 8. Attunement glow
  const attuneGlow = entry.requiresAttunement
    ? 'faint magical attunement glow pulsing around the grip'
    : '';

  // Build the core description block
  const descriptionParts = [
    visualCore,
    subjectParts.join(', '),
    rarityDesc,
    damageCue && entry.rarity !== 'junk' ? '' : '',
    specialCue,
    attuneGlow,
    moodCue,
  ].filter(Boolean);

  // Art direction suffix — always appended for consistent results
  const artDirection = includeArt
    ? `${genreStyle}, ${composition}, isolated on dark stone surface, dramatic single-source lighting, highly detailed RPG item concept art, professional digital painting, 8k resolution, no background clutter, no hands, no text, no labels`
    : genreStyle;

  const extraContext = options.extraContext ? `, ${options.extraContext}` : '';

  return `${descriptionParts.join(', ')}, ${artDirection}${extraContext}`;
}

/**
 * Build a short "thumbnail prompt" — for smaller/faster generation.
 */
export function buildWeaponThumbnailPrompt(entry: WeaponCatalogEntry): string {
  const visualCore = entry.imagePromptHint ?? entry.name;
  const family = entry.genreFamilies[0];
  const genreStyle = family ? (GENRE_STYLES[family] ?? 'fantasy RPG art') : 'fantasy RPG art';
  const rarityDesc = RARITY_DESCRIPTORS[entry.rarity] ?? '';
  return `${visualCore}, ${rarityDesc}, ${genreStyle}, isolated on black, dramatic lighting, detailed item art`;
}
