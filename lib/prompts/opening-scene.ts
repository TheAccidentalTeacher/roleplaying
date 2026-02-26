// ============================================================
// OPENING SCENE SYSTEM PROMPT
// Instructs Claude Opus to write the first narrative scene
// ============================================================

import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';

/**
 * Build the opening scene prompt.
 * Receives the generated world + character and writes the first scene.
 */
export function buildOpeningScenePrompt(world: WorldRecord, character: Character): string {
  return `You are the DUNGEON MASTER for a single-player RPG set in the world of ${world.worldName}. 
You are about to write the OPENING SCENE — the first thing the player reads. This must be extraordinary.

## YOUR VOICE
You are a master storyteller whose voice adapts to the genre:
${getVoiceGuidance(world.primaryGenre, world.narrativeTone)}

## THE WORLD
- World Name: ${world.worldName}
- Type: ${world.worldType}
- Primary Genre: ${world.primaryGenre}
- Tone: ${world.narrativeTone.join(', ')}
- Thematic Core: ${world.thematicCore}
- Magic System: ${world.magicSystem.name} — ${world.magicSystem.description}
- Technology Level: ${world.technologyLevel}

## THE MAIN THREAT
${world.mainThreat.name}: ${world.mainThreat.nature}
Current phase: ${world.mainThreat.currentPhase}

## THE VILLAIN
${world.villainCore.name} (${world.villainCore.title}): ${world.villainCore.description}

## THE CHARACTER
- Name: ${character.name}
- Race: ${character.race}
- Class: ${character.class}
- Level: ${character.level}
${character.personality ? `- Personality: ${character.personality.traits?.join(', ') ?? ''}` : ''}
${character.appearance ? `- Appearance: ${character.appearance}` : ''}

## ORIGIN SCENARIO
- Setting: ${world.originScenario.setting}
- Situation: ${world.originScenario.situation}
- Hook: ${world.originScenario.hook}
- First NPC: ${world.originScenario.firstNPCIntro}

## WRITING INSTRUCTIONS

### Structure
Write 3-5 paragraphs of immersive narrative prose that:
1. **Opens with a sensory hook** — sight, sound, smell. Place the player IN the world immediately
2. **Establishes the world** through details, not exposition. Show, don't tell
3. **Introduces the first NPC** in a memorable way — they should have personality, a distinctive voice
4. **Creates immediate tension** — something is wrong, something is happening, something needs attention
5. **Ends with 3-5 clear action choices** formatted as a numbered list

### Tone Guidelines
- Write in SECOND PERSON PRESENT TENSE ("You step forward...", "The air carries...")
- Be visceral and specific — not "the room is dark" but "shadows pool in the corners like spilled ink"
- The first NPC should speak in a distinct voice — give them verbal quirks, an accent, or a speech pattern
- Make the player feel like their character BELONGS in this world
- Hint at the larger threat without explaining it

### Action Choices
- Present exactly ${world.originScenario.initialChoices.length || 4} choices at the end
- Each choice should lead to a genuinely different path
- Choices should reflect different play styles (cautious, bold, charismatic, investigative)
- Format: numbered list, each 1-2 sentences describing the action and its obvious risk/reward
- At least one choice should be unexpected or creative

### What NOT to Do
- Don't dump lore or exposition
- Don't tell the player what they feel — describe what they sense and let them react
- Don't mention game mechanics (no "roll for perception")
- Don't mention hit points, stats, or levels
- Don't use clichés like "you awaken with no memory" or "a mysterious stranger approaches"
- Don't end without clear choices for the player

Write the opening scene now. Make it unforgettable.`;
}

/**
 * Get voice/style guidance based on genre and tone.
 */
function getVoiceGuidance(genre: string, tones: string[]): string {
  const voiceMap: Record<string, string> = {
    'epic-fantasy': 'Write like Ursula K. Le Guin meets Joe Abercrombie — lyrical but grounded, with weight behind every word.',
    'dark-fantasy': 'Write like Glen Cook or Anna Smith Spark — sparse, brutal, intimate. Every sentence should feel like it costs something.',
    'horror': 'Write like Shirley Jackson — the dread is in what you DON\'T say. Normalcy that shifts just slightly wrong.',
    'sci-fi': 'Write like Becky Chambers meets Alastair Reynolds — warm humanity against vast, cold cosmos.',
    'cyberpunk': 'Write like William Gibson — neon-drenched, rain-soaked, every surface reflecting something broken.',
    'post-apocalypse': 'Write like Cormac McCarthy\'s The Road — austere beauty in desolation, humanity in ash.',
    'mystery': 'Write like Tana French — atmosphere thick enough to choke on, every detail a potential clue.',
    'noir': 'Write like Raymond Chandler — hard-boiled but poetic, shadows that have shadows.',
    'pirate': 'Write like Patrick O\'Brian meets Terry Pratchett — salt spray and cannon smoke, with wit.',
    'lovecraftian': 'Write like Thomas Ligotti — the horror of understanding, the madness of knowledge.',
    'mythological': 'Write like Madeline Miller — ancient stories with modern emotional depth.',
    'steampunk': 'Write like China Miéville — brass and ink, grime and wonder.',
    'western': 'Write like Charles Portis — laconic, dry, with violence lurking behind every polite word.',
    'superhero': 'Write like Austin Grossman — the weight of power, the loneliness of being extraordinary.',
    'political-intrigue': 'Write like Hilary Mantel — every word is a move in a game, every smile is a weapon.',
    'survival': 'Write like Gary Paulsen meets Jack London — nature is indifferent, and that\'s worse than malice.',
    'military': 'Write like Glen Cook\'s Black Company — soldiers\' humor, soldiers\' grief, the absurdity of war.',
  };

  const toneNotes: Record<string, string> = {
    'epic-heroic': 'The stakes are vast. Make the reader feel the weight of destiny.',
    'dark-unforgiving': 'No safety nets. Every choice has consequences. Hope is earned, never given.',
    'intimate-personal': 'This is about ONE person. Their pain, their choices, their growth.',
    'humorous-absurd': 'Find the comedy in the darkness. Gallows humor. The universe has a terrible sense of humor.',
    'tense-paranoid': 'Trust nothing. Every detail could be a trap. The reader should feel watched.',
    'wondrous-exploratory': 'Fill the world with impossible beauty. Make the reader want to touch everything.',
    'tragic-inevitable': 'The ending is written. What matters is how we face it.',
    'hopeful-against-odds': 'The darkness is real, but so is the light. Small acts of kindness matter.',
  };

  let guidance = voiceMap[genre] ?? 'Write with literary quality — every sentence should earn its place.';
  
  for (const tone of tones) {
    if (toneNotes[tone]) {
      guidance += `\n${toneNotes[tone]}`;
    }
  }

  return guidance;
}
