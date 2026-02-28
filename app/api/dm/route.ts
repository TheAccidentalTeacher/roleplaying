import { NextRequest, NextResponse } from 'next/server';
import { streamClaude } from '@/lib/ai-orchestrator';
import { buildDMSystemPrompt } from '@/lib/prompts/dm-system';
import { buildContextFromDB, getMessageHistory } from '@/lib/services/context-builder';
import { saveMessage } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';
import type { Quest } from '@/lib/types/quest';
import type { NPC } from '@/lib/types/npc';
import type { CombatState } from '@/lib/types/combat';
import type { GameClock, Weather } from '@/lib/types/exploration';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],       // Latest messages from client
      characterId,         // Supabase character ID (if available)
      worldId,             // Supabase world ID (if available)
      // Fallback data passed from client when Supabase isn't configured
      character: fallbackCharacter,
      world: fallbackWorld,
      activeQuests = [],
      knownNPCs = [],
      combatState = null,
      gameClock,
      weather,
    } = body as {
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      characterId?: string;
      worldId?: string;
      character?: Character;
      world?: WorldRecord;
      activeQuests?: Quest[];
      knownNPCs?: NPC[];
      combatState?: CombatState | null;
      gameClock?: GameClock;
      weather?: Weather;
    };

    // Build the full DM context
    const dmContext = await buildContextFromDB({
      worldId: worldId || 'local',
      characterId: characterId || 'local',
      fallbackWorld: fallbackWorld ?? undefined,
      fallbackCharacter: fallbackCharacter ?? undefined,
      activeQuests,
      knownNPCs,
      combatState,
      gameClock,
      weather,
    });

    // Build the massive system prompt
    const systemPrompt = buildDMSystemPrompt(dmContext);

    // Get message history from Supabase (or use client-provided messages)
    let messageHistory = messages;
    if (characterId && characterId !== 'local') {
      try {
        const dbMessages = await getMessageHistory(characterId, 40);
        // Use DB messages if available, append latest client message
        if (dbMessages.length > 0) {
          const latestUserMessage = messages.filter((m) => m.role === 'user').pop();
          // DB has history; just add the latest user message if not already there
          messageHistory = [
            ...dbMessages,
            ...(latestUserMessage ? [latestUserMessage] : []),
          ];
        }
      } catch {
        // Fall back to client messages
      }
    }

    // Filter out system messages (Claude doesn't accept them in messages array)
    const claudeMessages = messageHistory
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // Ensure messages are not empty
    if (claudeMessages.length === 0) {
      claudeMessages.push({
        role: 'user',
        content: 'I look around and take in my surroundings.',
      });
    }

    // Save the latest user message to Supabase
    const latestUser = claudeMessages[claudeMessages.length - 1];
    if (characterId && characterId !== 'local' && latestUser?.role === 'user') {
      saveMessage(characterId, 'user', latestUser.content).catch(() => {});
    }

    // Stream the DM response
    const stream = await streamClaude(
      'dm_narration',
      systemPrompt,
      claudeMessages,
      { maxTokens: 2000, temperature: 0.85 }
    );

    // Create a TransformStream to capture the response for saving
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = stream.getReader();
    let fullResponse = '';

    // Process the stream: pass through to client AND capture for saving
    const decoder = new TextDecoder();
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
          await writer.write(value);
        }
      } catch (err) {
        console.error('Stream processing error:', err);
      } finally {
        await writer.close();
        // Save the complete DM response to Supabase
        if (characterId && characterId !== 'local' && fullResponse) {
          saveMessage(characterId, 'assistant', fullResponse).catch(() => {});
        }
      }
    })();

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: unknown) {
    console.error('DM API Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
