/**
 * Produces a short deterministic hash of a DM system prompt.
 * Used to track which prompt version was active for a given session
 * so quality changes can be correlated to prompt changes.
 *
 * Pure browser-side implementation (no Node.js crypto module) —
 * works in both Next.js edge/serverless and client components.
 */

/**
 * FNV-1a 32-bit hash → 8-char hex string.
 * Fast, collision-resistant enough for prompt versioning.
 */
export function hashPrompt(prompt: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < prompt.length; i++) {
    hash ^= prompt.charCodeAt(i);
    // FNV prime: multiply with wrapping (imul = 32-bit multiply)
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}
