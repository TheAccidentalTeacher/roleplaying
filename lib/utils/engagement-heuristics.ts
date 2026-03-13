/**
 * RPG-Aware Engagement Heuristics
 *
 * JAIMES insight: generic sentiment analysis misreads RPG players.
 * "I stab the guard!" is enthusiasm, not hostility.
 *
 * Rule-based classifier tags player messages as:
 *   engaged    — active play, clear intent
 *   confused   — unclear about rules, world, or what just happened
 *   frustrated — unhappy with the DM's response or game state
 *
 * Results are logged in session exports alongside 👍/👎 feedback,
 * building ground truth data without needing a training pipeline.
 */

export type EngagementTag = 'engaged' | 'confused' | 'frustrated' | 'neutral';

const ENGAGED_PATTERNS = [
  /\b(I|let me|I'll|I want to)\s+(attack|charge|cast|stab|fire|slash|run|grab|hide|search|sneak|climb|jump|open|pick|disarm|dodge|parry|drink|eat|use|equip|draw|throw|shout|whisper|call|examine|inspect|read|touch|push|pull)/i,
  /\blet'?s\b/i,
  /\bI (quickly|carefully|boldly|stealthily|cautiously)\b/i,
  /\b(perfect|excellent|awesome|nice|hell yes|let's go|yes!)\b/i,
  /[!]{2,}/, // multiple exclamation marks = enthusiasm
];

const CONFUSED_PATTERNS = [
  /\b(what\?|huh\?|wait[,.]?\s*(what|no|huh))\b/i,
  /\bdoesn'?t make sense\b/i,
  /\b(I'?m confused|I don'?t understand|I don'?t know what)\b/i,
  /\bhow do(es)? .{0,30} work\b/i,
  /\bwhat (does|did|is|are|happens|happened)\b.*\?$/im,
  /\bcan I\b.*\?$/im,
];

const FRUSTRATED_PATTERNS = [
  /\bthat'?s (wrong|not right|incorrect|not what I|unfair|unrealistic)\b/i,
  /\b(but|wait),? (you (said|told me)|earlier|last time|before you|the description said)\b/i,
  /\b(undo|go back|rewind|restart|that didn'?t happen|cancel that)\b/i,
  /\b(no no|wtf|this (sucks|is broken|is wrong|doesn'?t work))\b/i,
  /\bI (never|didn'?t) (said|do|said)\b/i,
];

/**
 * Classify a single player message.
 * Returns the dominant tag, or 'neutral' if no pattern matches.
 */
export function classifyEngagement(message: string): EngagementTag {
  if (FRUSTRATED_PATTERNS.some((p) => p.test(message))) return 'frustrated';
  if (CONFUSED_PATTERNS.some((p) => p.test(message))) return 'confused';
  if (ENGAGED_PATTERNS.some((p) => p.test(message))) return 'engaged';
  return 'neutral';
}

/**
 * Annotate an array of player messages.
 * Returns a Record<messageId, EngagementTag>.
 */
export function annotateMessages(
  messages: { id: string; role: string; content: string }[]
): Record<string, EngagementTag> {
  const result: Record<string, EngagementTag> = {};
  for (const msg of messages) {
    if (msg.role === 'user') {
      result[msg.id] = classifyEngagement(msg.content);
    }
  }
  return result;
}
