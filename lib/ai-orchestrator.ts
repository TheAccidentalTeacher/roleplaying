/**
 * AI ORCHESTRATOR
 * Routes tasks to the optimal AI model based on task type.
 *
 * ANTHROPIC (Claude):
 *   - claude-opus-4-6     → Most intelligent, complex reasoning, main DM narration
 *   - claude-sonnet-4-6   → Best speed+intelligence balance, combat, loot, NPC dialogue
 *   - claude-haiku-4-5    → Fastest/cheapest, quick lookups, simple responses
 *
 * OPENAI:
 *   - gpt-5.2             → Flagship model, highest reasoning, alternate DM voice
 *   - gpt-5               → Strong general model, creative writing
 *   - gpt-5-mini          → Fast + cheap, structured JSON tasks
 *   - o3                  → Deep reasoning (complex puzzles, strategy)
 *   - o4-mini             → Fast reasoning, combat math, crafting calc
 *   - gpt-image-1         → Latest image generation (highest quality)
 *   - dall-e-3            → High quality image generation (fallback)
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ─── MODEL REGISTRY ───────────────────────────────────────────────────────────

export const MODELS = {
  // Anthropic
  CLAUDE_OPUS:    'claude-opus-4-6',    // Narrative DM, complex world events
  CLAUDE_SONNET:  'claude-sonnet-4-6',  // Combat, loot, NPC dialogue
  CLAUDE_HAIKU:   'claude-haiku-4-5',   // Fast lookups, item descriptions, rolls

  // OpenAI - Text
  GPT_52:         'gpt-5.2',            // Flagship, highest reasoning, alt DM voice
  GPT_5:          'gpt-5',              // Strong general, creative writing
  GPT_5_MINI:     'gpt-5-mini',         // Fast + cheap, structured JSON tasks
  GPT_O3:         'o3',                 // Deep reasoning, complex puzzles/strategy
  GPT_O4_MINI:    'o4-mini',            // Fast reasoning, combat math, crafting calc

  // OpenAI - Image
  GPT_IMAGE_1:    'gpt-image-1',        // Latest, highest quality images
  DALLE_3:        'dall-e-3',           // Fallback image generation
} as const

// ─── TASK ROUTING ─────────────────────────────────────────────────────────────

export type AITask =
  | 'dm_narration'        // Main story narration (Opus - best quality)
  | 'combat_narration'    // Combat descriptions (Sonnet - fast + good)
  | 'combat_resolution'   // Dice math, hit/miss calc (o4-mini - fast reasoning)
  | 'loot_generation'     // Generate loot tables, item properties (Sonnet)
  | 'item_description'    // Flavor text for items (Haiku - cheap + fast)
  | 'npc_dialogue'        // NPC conversations (Sonnet - great at character)
  | 'quest_generation'    // Generate quest content (Opus - complex)
  | 'world_building'      // Generate location descriptions (Opus)
  | 'crafting_result'     // Calculate crafting outcomes (o4-mini)
  | 'bestiary_entry'      // Generate creature stats/lore (Sonnet)
  | 'image_scene'         // Key scene images (gpt-image-1 - highest quality)
  | 'image_item'          // Item artwork (dall-e-3 - reliable)
  | 'image_character'     // Character portraits (gpt-image-1)
  | 'image_location'      // Location art (dall-e-3)
  | 'quick_lookup'        // Any simple fast task (Haiku)

export function getModelForTask(task: AITask): string {
  const routing: Record<AITask, string> = {
    // Claude Opus: richest narration, complex world logic
    dm_narration:       MODELS.CLAUDE_OPUS,
    quest_generation:   MODELS.CLAUDE_OPUS,
    world_building:     MODELS.CLAUDE_OPUS,

    // Claude Sonnet: fast + smart, great for interactive moments
    combat_narration:   MODELS.CLAUDE_SONNET,
    loot_generation:    MODELS.CLAUDE_SONNET,
    npc_dialogue:       MODELS.CLAUDE_SONNET,
    bestiary_entry:     MODELS.CLAUDE_SONNET,

    // Claude Haiku: instant, cheap, high-volume tasks
    item_description:   MODELS.CLAUDE_HAIKU,
    quick_lookup:       MODELS.CLAUDE_HAIKU,

    // o4-mini: fast structured reasoning for math/calc tasks
    combat_resolution:  MODELS.GPT_O4_MINI,
    crafting_result:    MODELS.GPT_O4_MINI,

    // Image generation
    image_scene:        MODELS.GPT_IMAGE_1,
    image_character:    MODELS.GPT_IMAGE_1,
    image_item:         MODELS.DALLE_3,
    image_location:     MODELS.DALLE_3,
  }
  return routing[task]
}

// ─── ANTHROPIC HELPERS ────────────────────────────────────────────────────────

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Create a raw Anthropic MessageStream (async iterable).
 * Use this when you need to iterate events directly inside another
 * ReadableStream — avoids nested ReadableStream issues on Vercel.
 */
export function createClaudeStream(
  task: AITask,
  systemPrompt: string,
  messages: ClaudeMessage[],
  options?: {
    maxTokens?: number
    temperature?: number
    model?: string
  }
) {
  const model = options?.model ?? getModelForTask(task)
  const maxTokens = options?.maxTokens ?? 1024
  const temperature = options?.temperature ?? 0.8

  return anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages,
  })
}

/**
 * Stream a Claude response. Returns a ReadableStream of text chunks.
 */
export async function streamClaude(
  task: AITask,
  systemPrompt: string,
  messages: ClaudeMessage[],
  options?: {
    maxTokens?: number
    temperature?: number
    model?: string
  }
): Promise<ReadableStream<Uint8Array>> {
  const model = options?.model ?? getModelForTask(task)
  const maxTokens = options?.maxTokens ?? 1024
  const temperature = options?.temperature ?? 0.8

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages,
  })

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return readable
}

/**
 * Get a full (non-streaming) Claude response as a string.
 */
export async function callClaude(
  task: AITask,
  systemPrompt: string,
  messages: ClaudeMessage[],
  options?: {
    maxTokens?: number
    temperature?: number
    model?: string
  }
): Promise<string> {
  const model = options?.model ?? getModelForTask(task)
  const maxTokens = options?.maxTokens ?? 1024
  const temperature = options?.temperature ?? 0.7

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages,
  })

  const block = response.content[0]
  if (!block) return ''
  return block.type === 'text' ? block.text : ''
}

// ─── OPENAI HELPERS ───────────────────────────────────────────────────────────

export interface GPTMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Stream a GPT response for tasks needing OpenAI reasoning.
 */
export async function streamGPT(
  task: AITask,
  messages: GPTMessage[],
  options?: {
    maxTokens?: number
    temperature?: number
    model?: string
  }
): Promise<ReadableStream<Uint8Array>> {
  const model = options?.model ?? getModelForTask(task)
  const maxTokens = options?.maxTokens ?? 1024
  const temperature = options?.temperature ?? 0.8

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true,
  })

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return readable
}

/**
 * Full (non-streaming) GPT call.
 */
export async function callGPT(
  task: AITask,
  messages: GPTMessage[],
  options?: {
    maxTokens?: number
    temperature?: number
    model?: string
  }
): Promise<string> {
  const model = options?.model ?? getModelForTask(task)
  const maxTokens = options?.maxTokens ?? 1024
  const temperature = options?.temperature ?? 0.7

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  })

  return response.choices[0]?.message?.content ?? ''
}

// ─── IMAGE GENERATION ─────────────────────────────────────────────────────────

export type ImageSize = '1024x1024' | '1792x1024' | '1024x1792'
export type ImageQuality = 'standard' | 'hd'

export interface GeneratedImage {
  url: string
  revisedPrompt?: string
  model: string
}

/**
 * Generate an image using the best available model for the task.
 * - Character portraits / key scenes → gpt-image-1 (highest quality)
 * - Items / locations → dall-e-3 (reliable, fast)
 */
export async function generateImage(
  task: 'image_scene' | 'image_item' | 'image_character' | 'image_location',
  prompt: string,
  options?: {
    size?: ImageSize
    quality?: ImageQuality
    style?: 'vivid' | 'natural'
  }
): Promise<GeneratedImage> {
  const model = getModelForTask(task)
  const size = options?.size ?? '1024x1024'
  const quality = options?.quality ?? 'hd'

  // gpt-image-1 uses a slightly different API surface
  if (model === MODELS.GPT_IMAGE_1) {
    const response = await openai.images.generate({
      model: MODELS.GPT_IMAGE_1,
      prompt,
      n: 1,
      size,
      quality,
    })
    const url = response.data?.[0]?.url;
    if (!url) throw new Error('Image generation returned no URL (gpt-image-1)');
    return {
      url,
      revisedPrompt: response.data?.[0]?.revised_prompt,
      model,
    }
  }

  // DALL-E 3
  const response = await openai.images.generate({
    model: MODELS.DALLE_3,
    prompt,
    n: 1,
    size,
    quality,
    style: options?.style ?? 'vivid',
  })
  const url = response.data?.[0]?.url;
  if (!url) throw new Error('Image generation returned no URL (dall-e-3)');
  return {
    url,
    revisedPrompt: response.data?.[0]?.revised_prompt,
    model,
  }
}

// ─── STRUCTURED JSON CALLS ────────────────────────────────────────────────────

/**
 * Attempt to repair truncated JSON by closing unclosed brackets/braces.
 * Handles the common case where Claude runs out of tokens mid-response.
 */
function repairTruncatedJSON(text: string): string {
  // Remove any trailing partial string (unmatched quote)
  let s = text.trim()
  
  // If it ends with a partial string value, close it
  const quoteCount = (s.match(/(?<!\\)"/g) || []).length
  if (quoteCount % 2 !== 0) {
    // Truncated inside a string — find last unescaped quote and trim there
    const lastQuote = s.lastIndexOf('"')
    s = s.substring(0, lastQuote + 1)
  }
  
  // Remove trailing comma if any
  s = s.replace(/,\s*$/, '')
  
  // Count unclosed brackets and braces
  let braces = 0
  let brackets = 0
  let inString = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '"' && (i === 0 || s[i - 1] !== '\\')) {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') braces++
    else if (ch === '}') braces--
    else if (ch === '[') brackets++
    else if (ch === ']') brackets--
  }
  
  // Close unclosed brackets then braces
  for (let i = 0; i < brackets; i++) s += ']'
  for (let i = 0; i < braces; i++) s += '}'
  
  return s
}

/**
 * Call an AI model and parse the response as JSON.
 * Useful for loot generation, combat resolution, etc.
 * Includes auto-repair for truncated JSON from token limits.
 */
export async function callClaudeJSON<T>(
  task: AITask,
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<T> {
  const fullSystem = `${systemPrompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Just raw JSON.`

  const maxAttempts = 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const text = await callClaude(task, fullSystem, [{ role: 'user', content: userMessage }], options)

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Try parsing as-is first
    try {
      return JSON.parse(cleaned) as T
    } catch (err) {
      // Try repairing truncated JSON before giving up on this attempt
      try {
        const repaired = repairTruncatedJSON(cleaned)
        console.warn(`[callClaudeJSON] Repaired truncated JSON (attempt ${attempt + 1})`)
        return JSON.parse(repaired) as T
      } catch {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt === 0) continue
      }
    }
  }

  throw new Error(`callClaudeJSON failed after ${maxAttempts} attempts: ${lastError?.message}`)
}

export async function callGPTJSON<T>(
  task: AITask,
  systemMessage: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<T> {
  const maxAttempts = 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const text = await callGPT(task, [
      { role: 'system', content: `${systemMessage}\n\nRespond ONLY with valid JSON. No markdown, no explanation.` },
      { role: 'user', content: userMessage },
    ], options)

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    try {
      return JSON.parse(cleaned) as T
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt === 0) continue
    }
  }

  throw new Error(`callGPTJSON failed after ${maxAttempts} attempts: ${lastError?.message}`)
}

// ─── COST REFERENCE (not tracked at runtime) ──────────────────────────────────
// Anthropic: opus $5/$25, sonnet $3/$15, haiku $1/$5 per million tokens
// OpenAI: gpt-5.2 $1.75/$14, gpt-5 $1.25/$10, gpt-5-mini $0.25/$1, o3 $10/$40, o4-mini $1.10/$4.40
