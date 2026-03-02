// ============================================================
// WORLD GENESIS — SINGLE STEP API
// POST /api/world-genesis/step
//
// Runs ONE world-genesis step at a time.
// The client orchestrates: call step 1, get result, call step 2
// with accumulated data, etc.
//
// JSON HANDLING: Uses the battle-tested `jsonrepair` library
// instead of hand-rolled sanitizers. This handles all common
// LLM JSON issues: unescaped chars, trailing commas, truncation,
// missing brackets, unquoted keys, etc.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/ai-orchestrator';
import { GENESIS_STEPS, TOTAL_STEPS } from '@/lib/prompts/world-genesis-steps';
import { jsonrepair } from 'jsonrepair';
import type { CharacterCreationInput } from '@/lib/types/character';

// Vercel Pro plan allows up to 300s. Single Claude call ~25-40s.
export const maxDuration = 300;

interface StepRequest {
  character: CharacterCreationInput;
  playerSentence?: string;
  stepIndex: number; // 0-based index into GENESIS_STEPS
  accumulated: Record<string, unknown>; // Results from all prior steps merged
}

/**
 * Strip markdown fences and other non-JSON wrapper text.
 */
function stripWrapper(raw: string): string {
  let s = raw.trim();
  // Remove markdown code fences
  s = s.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  // If there's text before the first { or [, strip it
  const firstBrace = s.indexOf('{');
  const firstBracket = s.indexOf('[');
  const jsonStart = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);
  if (jsonStart > 0) {
    s = s.substring(jsonStart);
  }
  return s;
}

export async function POST(request: NextRequest) {
  let body: StepRequest;
  try {
    body = (await request.json()) as StepRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { character: charInput, playerSentence, stepIndex, accumulated } = body;

  if (!charInput?.name || !charInput?.race || !charInput?.class) {
    return NextResponse.json(
      { error: 'Character must have name, race, and class' },
      { status: 400 }
    );
  }

  if (stepIndex < 0 || stepIndex >= TOTAL_STEPS) {
    return NextResponse.json(
      { error: `stepIndex must be 0-${TOTAL_STEPS - 1}` },
      { status: 400 }
    );
  }

  const step = GENESIS_STEPS[stepIndex];
  const startTime = Date.now();

  console.log(`[WorldGenesis:Step] ▶ Starting step ${step.id}/${TOTAL_STEPS}: ${step.name}`);

  try {
    const prompt = step.buildPrompt(charInput, accumulated ?? {}, playerSentence);

    // Add explicit JSON instruction to system prompt
    const system = `${prompt.system}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Just raw JSON.`;

    console.log(`[WorldGenesis:Step] Step ${step.id} prompt lengths: system=${system.length} chars, user=${prompt.user.length} chars, maxTokens=${prompt.maxTokens}`);

    // ONE Claude call — no internal retry. Client handles retries.
    const rawText = await callClaude(
      'world_building',
      system,
      [{ role: 'user', content: prompt.user }],
      { maxTokens: prompt.maxTokens }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[WorldGenesis:Step] Step ${step.id} raw response: ${rawText.length} chars in ${duration}s`);
    console.log(`[WorldGenesis:Step] Step ${step.id} first 200 chars: ${rawText.substring(0, 200)}`);
    console.log(`[WorldGenesis:Step] Step ${step.id} last 200 chars: ${rawText.substring(Math.max(0, rawText.length - 200))}`);

    // Strip markdown/wrapper → jsonrepair → JSON.parse
    const stripped = stripWrapper(rawText);
    let result: Record<string, unknown>;

    try {
      // First try direct parse (fastest path)
      result = JSON.parse(stripped);
      console.log(`[WorldGenesis:Step] Step ${step.id} ✓ direct JSON.parse succeeded`);
    } catch (directErr) {
      console.warn(`[WorldGenesis:Step] Step ${step.id} direct parse failed: ${directErr instanceof Error ? directErr.message : directErr}`);
      console.warn(`[WorldGenesis:Step] Step ${step.id} running jsonrepair...`);
      try {
        // jsonrepair handles: unescaped chars, trailing commas,
        // missing quotes, truncated JSON, comments, etc.
        const repaired = jsonrepair(stripped);
        result = JSON.parse(repaired);
        console.log(`[WorldGenesis:Step] Step ${step.id} ✓ jsonrepair succeeded (repaired ${repaired.length - stripped.length} chars diff)`);
      } catch (repairErr) {
        // Both failed — return the raw text so we can debug from the browser
        console.error(`[WorldGenesis:Step] Step ${step.id} ✗ jsonrepair ALSO failed:`, repairErr);
        console.error(`[WorldGenesis:Step] Step ${step.id} FULL raw text (${rawText.length} chars):\n${rawText}`);
        return NextResponse.json(
          {
            error: `Step ${step.id} (${step.name}) JSON parse failed`,
            parseError: directErr instanceof Error ? directErr.message : String(directErr),
            repairError: repairErr instanceof Error ? repairErr.message : String(repairErr),
            rawLength: rawText.length,
            rawSnippetStart: rawText.substring(0, 500),
            rawSnippetEnd: rawText.substring(Math.max(0, rawText.length - 500)),
          },
          { status: 500 }
        );
      }
    }

    console.log(`[WorldGenesis:Step] Step ${step.id} (${step.name}) ✓ complete in ${duration}s, keys: ${Object.keys(result).join(', ')}`);

    return NextResponse.json({
      stepId: step.id,
      stepName: step.name,
      label: step.label,
      data: result,
      duration: parseFloat(duration),
    });
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[WorldGenesis:Step] Step ${step.id} ✗ EXCEPTION after ${duration}s:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Step generation failed',
        step: step.id,
        stepName: step.name,
        duration: parseFloat(duration),
      },
      { status: 500 }
    );
  }
}
