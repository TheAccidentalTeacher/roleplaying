/**
 * Strips markdown formatting from text before sending to TTS.
 * Prevents narrators from reading asterisks, hashtags, backticks, etc.
 */
export function stripMarkdown(text: string): string {
  return text
    // Remove headings (# ## ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic (***text***, **text**, *text*, ___text___, __text__, _text_)
    .replace(/\*{1,3}([^*\n]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_\n]+)_{1,3}/g, '$1')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquotes (> )
    .replace(/^>\s+/gm, '')
    // Remove bullet/numbered list markers (- item, * item, 1. item)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove links — keep label text ([label](url) → label)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bare URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Collapse multiple blank lines to one
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
