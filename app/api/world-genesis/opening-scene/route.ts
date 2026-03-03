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

// Vercel Pro plan supports up to 300s
export const maxDuration = 300;

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

    console.log('[OpeningScene] ▶ Request received');
    console.log('[OpeningScene] World:', world?.worldName ?? 'MISSING');
    console.log('[OpeningScene] Character:', character?.name ?? 'MISSING');
    console.log('[OpeningScene] WorldId:', worldId ?? 'MISSING');
    console.log('[OpeningScene] CharacterId:', characterId ?? 'MISSING');

    if (!world || !character) {
      console.error('[OpeningScene] ✗ Missing world or character in request body');
      return new Response(
        JSON.stringify({ error: 'world and character are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log world data completeness
    const worldKeys = Object.keys(world);
    console.log(`[OpeningScene] World has ${worldKeys.length} keys: ${worldKeys.join(', ')}`);
    console.log(`[OpeningScene] Has magicSystem: ${!!world.magicSystem}, mainThreat: ${!!world.mainThreat}, villainCore: ${!!world.villainCore}, originScenario: ${!!world.originScenario}`);

    const openingScenePrompt = buildOpeningScenePrompt(world, character);
    console.log(`[OpeningScene] Prompt built: ${openingScenePrompt.length} chars`);

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
    console.error('[OpeningScene] ✗ Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to generate opening scene';
    const errStack = error instanceof Error ? error.stack : undefined;
    return new Response(
      JSON.stringify({ error: errMsg, stack: errStack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
