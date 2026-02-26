import { NextRequest, NextResponse } from 'next/server'
import { streamClaude } from '@/lib/ai-orchestrator'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { messages, character, gameState, task = 'dm_narration' } = await req.json()

    const systemPrompt = `You are an expert Dungeon Master running a rich, immersive single-player RPG.

## CHARACTER
Name: ${character?.name || 'Unknown Adventurer'}
Class: ${character?.class || 'Adventurer'}
Level: ${character?.level || 1}
Background: ${character?.background || 'A mysterious past'}
HP: ${character?.hitPoints?.current ?? '?'}/${character?.hitPoints?.max ?? '?'}

## CURRENT GAME STATE
${gameState || 'Beginning of adventure'}

## YOUR ROLE AS DM
- Create vivid, immersive narratives with atmosphere and tension
- Always end your response with a clear set of available actions OR an open question
- Track and reference prior events for consistency
- Handle combat with full tactical transparency (show enemy HP, AC, available moves)
- When loot is found, describe it dramatically with rarity and properties
- Manage the full world: NPCs, factions, environment, weather, time of day
- Allow complete player freedom — never say "you can't do that"
- Ask for dice rolls with explicit notation (e.g. "Roll a d20 + your STR modifier")
- Scale challenge to character level
- Be cinematic. Make every moment memorable.`

    // Convert messages to Claude format (no 'system' role in messages array)
    const claudeMessages = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const stream = await streamClaude(
      task,
      systemPrompt,
      claudeMessages,
      { maxTokens: 1200, temperature: 0.85 }
    )

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('DM API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'An error occurred' },
      { status: 500 }
    )
  }
}
