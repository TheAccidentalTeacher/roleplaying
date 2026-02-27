// ============================================================
// OPENING SCENE API ROUTE — Phase 2: Streamed Opening Scene
// POST /api/world-genesis/opening-scene
// Streams the opening narrative using Claude Opus
// Called AFTER /api/world-genesis returns the world + character
// ============================================================

import { NextRequest } from 'next/server';
import { streamClaude } from '@/lib/ai-orchestrator';
import { buildOpeningScenePrompt } from '@/lib/prompts/opening-scene';
import { saveMessage } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';
import type { Character } from '@/lib/types/character';

// Opus streams text chunks continuously — each chunk resets the timeout
export const maxDuration = 60;

interface OpeningSceneRequest {
  world: WorldRecord;
  character: Character;
  worldId: string;
  characterId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { world, character, worldId, characterId } =
      (await request.json()) as OpeningSceneRequest;

    if (!world || !character) {
      return new Response(
        JSON.stringify({ error: 'world and character are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openingScenePrompt = buildOpeningScenePrompt(world, character);

    // Stream the opening scene from Opus — text arrives chunk by chunk
    const aiStream = await streamClaude(
      'dm_narration',
      openingScenePrompt,
      [{ role: 'user', content: 'Write the opening scene now.' }],
      { maxTokens: 4096, temperature: 0.9 }
    );

    // Tee the stream: one copy goes to the client, the other accumulates for DB save
    const [clientStream, saveStream] = aiStream.tee();

    // Save the complete text to DB in the background (don't block the response)
    const savePromise = (async () => {
      const reader = saveStream.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
        // Save system context + opening scene to DB
        await saveMessage(
          characterId,
          'system',
          `World: ${world.worldName}. Genre: ${world.primaryGenre}. Tone: ${world.narrativeTone.join(', ')}.`
        );
        await saveMessage(characterId, 'assistant', fullText, {
          type: 'opening_scene',
          worldId,
          location: world.originScenario.setting,
        });
      } catch (dbErr) {
        console.warn('[OpeningScene] DB save failed:', dbErr);
      }
    })();

    // Don't await savePromise — let it run in the background
    // The Edge runtime will keep it alive until the response completes
    void savePromise;

    return new Response(clientStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[OpeningScene] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate opening scene' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
