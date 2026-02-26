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
    return {
      url: response.data[0]?.url ?? '',
      revisedPrompt: response.data[0]?.revised_prompt,
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
  return {
    url: response.data[0]?.url ?? '',
    revisedPrompt: response.data[0]?.revised_prompt,
    model,
  }
}

// ─── STRUCTURED JSON CALLS ────────────────────────────────────────────────────

/**
 * Call an AI model and parse the response as JSON.
 * Useful for loot generation, combat resolution, etc.
 */
export async function callClaudeJSON<T>(
  task: AITask,
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<T> {
  const fullSystem = `${systemPrompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Just raw JSON.`

  const text = await callClaude(task, fullSystem, [{ role: 'user', content: userMessage }], options)

  // Strip any accidental markdown code fences
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned) as T
}

export async function callGPTJSON<T>(
  task: AITask,
  systemMessage: string,
  userMessage: string,
  options?: { maxTokens?: number; model?: string }
): Promise<T> {
  const text = await callGPT(task, [
    { role: 'system', content: `${systemMessage}\n\nRespond ONLY with valid JSON. No markdown, no explanation.` },
    { role: 'user', content: userMessage },
  ], options)

  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned) as T
}

// ─── COST TRACKING (Optional Logging) ─────────────────────────────────────────

export interface UsageRecord {
  task: AITask
  model: string
  inputTokens: number
  outputTokens: number
  estimatedCostUSD: number
  timestamp: number
}

const TOKEN_COSTS_PER_M: Record<string, { input: number; output: number }> = {
  // Anthropic (from your screenshot)
  'claude-opus-4-6':    { input: 5.00,  output: 25.00 },
  'claude-sonnet-4-6':  { input: 3.00,  output: 15.00 },
  'claude-haiku-4-5':   { input: 1.00,  output:  5.00 },
  // OpenAI (from your GPT-5.2 screenshot)
  'gpt-5.2':            { input: 1.75,  output: 14.00 },
  'gpt-5':              { input: 1.25,  output: 10.00 },
  'gpt-5-mini':         { input: 0.25,  output:  1.00 },
  'o3':                 { input: 10.00, output: 40.00 },
  'o4-mini':            { input: 1.10,  output:  4.40 },
}

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = TOKEN_COSTS_PER_M[model]
  if (!costs) return 0
  return (inputTokens / 1_000_000) * costs.input + (outputTokens / 1_000_000) * costs.output
}
