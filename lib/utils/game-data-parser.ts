// ============================================================
// GAME DATA PARSER
// Extracts structured game-data JSON from DM responses and
// maps them to store actions. This is the bridge between
// narrative AI output and mechanical state changes.
// ============================================================

/** Shape of the game-data block the DM produces */
export interface GameDataUpdate {
  location_change?: string;
  time_advance?: string; // "1 hour", "3 hours", "dawn", "dusk", "midnight"
  hp_change?: number;
  items_gained?: string[];
  items_lost?: string[];
  gold_change?: number;
  xp_gained?: number;
  quest_update?: {
    id: string;
    title?: string;
    status: 'active' | 'completed' | 'failed';
    description?: string;
  };
  npc_met?: {
    name: string;
    attitude: 'friendly' | 'neutral' | 'hostile';
    description?: string;
  };
  combat_start?: boolean;
  combat_end?: boolean;
  rest?: 'short' | 'long';
  scene_image?: string; // Image generation prompt for dramatic scenes
  // Dice check request — triggers the DiceRoller modal
  dice_check?: {
    type: 'ability' | 'skill' | 'attack' | 'saving_throw' | 'custom';
    ability?: string;
    skill?: string;
    dc?: number;
    label?: string;
    advantage?: boolean;
    disadvantage?: boolean;
  };
  // Shop / merchant trigger — opens the shop UI
  shop_open?: {
    shop_type: string;         // e.g. "blacksmith", "alchemist", "general-store"
    merchant_name?: string;    // NPC name if known
    shop_name?: string;        // e.g. "The Gilded Flask"
  };
  // Optional enemy info when combat starts
  enemies?: Array<{
    name: string;
    hp?: number;
    ac?: number;
    attack_bonus?: number;
    damage?: string;
    cr?: number;
  }>;
  // Travel trigger — opens the travel UI with segment-by-segment progression
  travel?: {
    destination: string;
    terrain?: string;          // e.g. "forest", "mountains", "plains"
    distance_hours?: number;   // estimated travel time in hours
    method?: string;           // "walking", "mounted", "ship", etc.
    pace?: string;             // "slow", "normal", "fast"
  };
  // Crafting trigger — opens the crafting UI
  crafting_open?: {
    station_type?: string;     // e.g. "forge", "alchemy_lab", "kitchen"
    station_quality?: string;  // "basic", "good", "excellent"
  };
  // Skill challenge — multi-phase ability check (e.g. chase, negotiation, heist)
  skill_challenge?: {
    name: string;
    description: string;
    complexity?: string;       // "simple", "standard", "complex", "epic"
    allowed_skills?: string[]; // e.g. ["athletics", "acrobatics", "stealth", "persuasion"]
    stakes?: string;           // narrative consequences
  };
}

/**
 * Extract and parse the game-data JSON block from a DM response.
 * Returns null if no game-data block is found or if parsing fails.
 */
export function parseGameData(response: string): GameDataUpdate | null {
  // Match ```game-data ... ``` blocks (with optional whitespace)
  const regex = /```game-data\s*\n?([\s\S]*?)```/;
  const match = response.match(regex);

  if (!match || !match[1]) {
    return null;
  }

  try {
    const raw = match[1].trim();
    const parsed = JSON.parse(raw) as GameDataUpdate;

    // Basic validation: must be an object
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('[game-data-parser] Parsed value is not an object:', parsed);
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('[game-data-parser] Failed to parse game-data JSON:', err);
    // Try to salvage partial JSON by cleaning common LLM artifacts
    try {
      const cleaned = match[1]
        .trim()
        .replace(/,\s*}/g, '}')    // trailing commas
        .replace(/,\s*]/g, ']')    // trailing commas in arrays
        .replace(/'/g, '"')         // single → double quotes
        .replace(/\n/g, ' ');       // collapse newlines
      const fallback = JSON.parse(cleaned) as GameDataUpdate;
      if (typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback)) {
        return fallback;
      }
    } catch {
      // give up
    }
    return null;
  }
}

/**
 * Parse a time_advance string into hours.
 * Handles: "1 hour", "3 hours", "30 minutes", "dawn", "dusk", etc.
 */
export function parseTimeAdvance(timeStr: string): number {
  const lower = timeStr.toLowerCase().trim();

  // Named time jumps: advance to that time of day (approximate hours)
  const namedTimes: Record<string, number> = {
    dawn: 2,
    morning: 3,
    midday: 4,
    afternoon: 3,
    dusk: 2,
    evening: 2,
    night: 3,
    midnight: 4,
    'next day': 12,
    'next morning': 12,
  };

  if (namedTimes[lower] !== undefined) {
    return namedTimes[lower];
  }

  // Numeric: "X hour(s)", "X minute(s)"
  const hourMatch = lower.match(/(\d+)\s*hours?/);
  if (hourMatch) return parseInt(hourMatch[1], 10);

  const minMatch = lower.match(/(\d+)\s*minutes?/);
  if (minMatch) return Math.max(0.25, parseInt(minMatch[1], 10) / 60);

  const dayMatch = lower.match(/(\d+)\s*days?/);
  if (dayMatch) return parseInt(dayMatch[1], 10) * 24;

  // Fallback: 1 hour
  return 1;
}

/**
 * Strip the game-data block from a response so it's not shown to the player.
 * (MessageBubble already does this, but this can be used for clean storage.)
 */
export function stripGameDataBlock(response: string): string {
  return response.replace(/```game-data\s*\n?[\s\S]*?```/g, '').trim();
}
