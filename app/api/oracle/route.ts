import { NextRequest, NextResponse } from 'next/server';
import { buildOracleSystemPrompt } from '@/lib/prompts/oracle-system';
import { buildContextFromDB } from '@/lib/services/context-builder';
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
    console.log('[Oracle] Request received');

    const {
      messages = [],         // Oracle conversation messages
      dmMessages = [],       // Full DM chat history for analysis
      characterId,
      worldId,
      character: fallbackCharacter,
      world: fallbackWorld,
      activeQuests = [],
      knownNPCs = [],
      combatState = null,
      gameClock,
      weather,
    } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      dmMessages: { role: string; content: string }[];
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

    // Build game context (same pipeline as DM)
    let dmContext;
    try {
      dmContext = await buildContextFromDB({
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
    } catch (ctxError) {
      console.error('[Oracle] Context build failed:', ctxError);
      return NextResponse.json(
        { error: 'Failed to build Oracle context: ' + (ctxError instanceof Error ? ctxError.message : 'Unknown') },
        { status: 500 }
      );
    }

    // Build the Oracle system prompt with full DM history
    let systemPrompt: string;
    try {
      systemPrompt = buildOracleSystemPrompt(dmContext, dmMessages);
      console.log('[Oracle] System prompt built. Length:', systemPrompt.length);
    } catch (promptError) {
      console.error('[Oracle] System prompt build crashed:', promptError);
      return NextResponse.json(
        { error: 'Failed to build Oracle prompt: ' + (promptError instanceof Error ? promptError.message : 'Unknown') },
        { status: 500 }
      );
    }

    // Filter messages for Claude
    const claudeMessages = messages
      .filter((m) => m.role !== 'system' as string)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    if (claudeMessages.length === 0) {
      claudeMessages.push({
        role: 'user',
        content: 'Give me a quick status report on my game.',
      });
    }

    // Use Groq Llama 3.3 70B — ~500 tokens/sec, near-instant Oracle responses
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      // Fallback: let caller know Groq isn't configured
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groqBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...claudeMessages,
      ],
      max_tokens: 1500,
      temperature: 0.3,
      stream: true,
    };

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groqBody),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('[Oracle] Groq error:', groqRes.status, errText);
      return NextResponse.json({ error: `Groq returned ${groqRes.status}` }, { status: 502 });
    }

    // Convert Groq SSE stream → plain text stream (same format as streamClaude)
    const encoder = new TextEncoder();
    const groqStream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body?.getReader();
        if (!reader) { controller.close(); return; }
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload) as { choices: { delta: { content?: string } }[] };
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch { /* skip malformed chunks */ }
          }
        }
        controller.close();
      },
    });

    const stream = groqStream;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error: unknown) {
    console.error('[Oracle] API Error:', error);
    const message = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
