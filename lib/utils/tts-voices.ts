// ============================================================
// TTS VOICE MAPPING — Maps world genres to OpenAI TTS voices
// ============================================================

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

/**
 * Voice character profiles:
 *   onyx   — Deep, authoritative, gravelly   → Epic Fantasy, Military
 *   echo   — Warm, resonant, slightly ominous → Dark Fantasy, Horror, Lovecraftian
 *   fable  — Expressive, storytelling energy   → Whimsical, Comedy, Mythological
 *   alloy  — Neutral, clean, synthetic feel   → Sci-fi, Cyberpunk, Post-singularity
 *   nova   — Warm, inviting, emotive          → Romance, Mystery, Political Intrigue
 *   shimmer— Clear, crisp, precise            → Noir, Western, Steampunk, Survival
 */

const GENRE_VOICE_MAP: Record<string, TTSVoice> = {
  // Fantasy
  'epic-fantasy':       'onyx',
  'dark-fantasy':       'echo',
  'horror':             'echo',
  'lovecraftian':       'echo',
  'mythological':       'fable',
  'comedy':             'fable',

  // Sci-fi / Tech
  'sci-fi':             'alloy',
  'cyberpunk':          'alloy',
  'steampunk':          'shimmer',
  'post-apocalypse':    'shimmer',
  'superhero':          'onyx',

  // Grounded / Dramatic
  'mystery':            'nova',
  'noir':               'shimmer',
  'romance':            'nova',
  'political-intrigue': 'nova',
  'pirate':             'fable',
  'western':            'shimmer',
  'military':           'onyx',
  'survival':           'shimmer',
};

const WORLD_TYPE_VOICE_MAP: Record<string, TTSVoice> = {
  // Fantasy world types
  'classic-high-fantasy': 'onyx',
  'dark-fantasy':         'echo',
  'dying-world':          'echo',
  'young-world':          'fable',
  'fallen-empire':        'onyx',
  'conquered-world':      'echo',
  'mythic-age':           'fable',
  'hidden-magic':         'nova',
  'clockwork-fantasy':    'shimmer',
  'planar-world':         'fable',

  // Sci-fi world types
  'deep-space-opera':     'alloy',
  'hard-scifi':           'alloy',
  'post-singularity':     'alloy',
  'generation-ship':      'alloy',
  'colony-world':         'alloy',
  'post-contact':         'alloy',
  'dyson-sphere':         'alloy',
  'time-war':             'shimmer',
  'uploaded-world':       'alloy',

  // Contemporary
  'modern-magic-revealed': 'nova',
  'zombie-apocalypse':     'echo',
  'alien-occupation':      'alloy',
  'corporate-dystopia':    'shimmer',
  'superhuman-emergence':  'onyx',

  // Historical/Mythological
  'norse-twilight':              'onyx',
  'greek-heroic-age':            'fable',
  'egyptian-eternal':            'fable',
  'arthurian-twilight':          'onyx',
  'feudal-japan-supernatural':   'shimmer',
  'age-of-sail-mythology':       'fable',

  // Weird
  'dying-universe':     'echo',
  'dream-world':        'fable',
  'recursive-reality':  'alloy',
  'the-void-between':   'echo',
  'inside-a-god':       'fable',
};

/**
 * Pick the best TTS voice for a world.
 * Priority: explicit user override > genre match > worldType match > fallback (onyx)
 */
export function getVoiceForWorld(
  primaryGenre?: string,
  worldType?: string,
  userVoice?: string,
): TTSVoice {
  // Explicit override
  if (userVoice && userVoice !== 'auto') {
    return userVoice as TTSVoice;
  }

  // Genre match
  if (primaryGenre && GENRE_VOICE_MAP[primaryGenre]) {
    return GENRE_VOICE_MAP[primaryGenre];
  }

  // World type match
  if (worldType && WORLD_TYPE_VOICE_MAP[worldType]) {
    return WORLD_TYPE_VOICE_MAP[worldType];
  }

  // Default
  return 'onyx';
}

/**
 * Get a human-readable description of a voice.
 */
export function getVoiceDescription(voice: TTSVoice): string {
  const descriptions: Record<TTSVoice, string> = {
    onyx:    'Deep & authoritative',
    echo:    'Warm & ominous',
    fable:   'Expressive storyteller',
    alloy:   'Neutral & clean',
    nova:    'Warm & inviting',
    shimmer: 'Clear & precise',
  };
  return descriptions[voice] ?? voice;
}
