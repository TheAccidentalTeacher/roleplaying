// ============================================================
// MESSAGE SUMMARIZER
// Compresses older messages into a summary to prevent context
// window overflow in long sessions. Keeps recent messages
// intact for conversational continuity.
// ============================================================

interface Message {
  role: string;
  content: string;
}

/** Rough token estimate: ~4 chars per token */
function estimateTokens(messages: Message[]): number {
  return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
}

/** Maximum tokens we want to send in the message history */
const MAX_HISTORY_TOKENS = 12_000;

/** Number of recent messages to always keep intact */
const KEEP_RECENT = 10;

/**
 * Compress message history if it exceeds the token budget.
 * Returns: { messages, wasSummarized }
 *
 * Strategy:
 *   1. If total tokens < MAX_HISTORY_TOKENS → return as-is.
 *   2. Otherwise, keep the last KEEP_RECENT messages intact.
 *   3. Summarize everything before that into a single "summary" message.
 *   4. Prepend the summary as a system-like user message so the DM has context.
 */
export function compressMessages(
  messages: Message[],
  existingSummary?: string
): { messages: Message[]; summary: string | undefined; wasSummarized: boolean } {
  const totalTokens = estimateTokens(messages);

  if (totalTokens <= MAX_HISTORY_TOKENS && !existingSummary) {
    return { messages, summary: undefined, wasSummarized: false };
  }

  if (messages.length <= KEEP_RECENT) {
    // Not enough messages to split, but we may have a prior summary
    if (existingSummary) {
      const summaryMsg: Message = {
        role: 'user',
        content: `[STORY SO FAR — a summary of earlier events in this adventure]\n${existingSummary}\n[END SUMMARY — the conversation below is recent and should be responded to directly]`,
      };
      return {
        messages: [summaryMsg, ...messages],
        summary: existingSummary,
        wasSummarized: true,
      };
    }
    return { messages, summary: undefined, wasSummarized: false };
  }

  // Split: older messages get summarized, recent ones stay
  const olderMessages = messages.slice(0, -KEEP_RECENT);
  const recentMessages = messages.slice(-KEEP_RECENT);

  // Build a quick text summary of older messages
  const olderText = olderMessages
    .map((m) => `${m.role === 'user' ? 'PLAYER' : 'DM'}: ${m.content.slice(0, 500)}`)
    .join('\n\n');

  // Combine with any existing summary
  const combinedOlderContext = existingSummary
    ? `PREVIOUS SUMMARY:\n${existingSummary}\n\nNEWER EVENTS:\n${olderText}`
    : olderText;

  // Create a condensed summary (client-side, no AI call — just truncate intelligently)
  const condensed = condenseSummary(combinedOlderContext);

  const summaryMsg: Message = {
    role: 'user',
    content: `[STORY SO FAR — a summary of earlier events in this adventure]\n${condensed}\n[END SUMMARY — the conversation below is recent and should be responded to directly]`,
  };

  return {
    messages: [summaryMsg, ...recentMessages],
    summary: condensed,
    wasSummarized: true,
  };
}

/**
 * Condense raw text into a manageable summary.
 * Extracts key facts: locations visited, NPCs met, items gained/lost,
 * quests, and major plot points.
 */
function condenseSummary(text: string): string {
  // Cap at ~3000 chars (~750 tokens) for the summary
  const MAX_SUMMARY_CHARS = 3000;

  if (text.length <= MAX_SUMMARY_CHARS) return text;

  // Take the first portion (early context) and last portion (recent events)
  const firstPart = text.slice(0, Math.floor(MAX_SUMMARY_CHARS * 0.4));
  const lastPart = text.slice(-Math.floor(MAX_SUMMARY_CHARS * 0.6));

  return `${firstPart}\n\n[...earlier events condensed...]\n\n${lastPart}`;
}
