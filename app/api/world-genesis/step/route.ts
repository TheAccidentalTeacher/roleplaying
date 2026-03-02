// ============================================================
// WORLD GENESIS — SINGLE STEP API
// POST /api/world-genesis/step
//
// Runs ONE world-genesis step at a time.
// The client orchestrates: call step 1, get result, call step 2
// with accumulated data, etc.
//
// KEY: This route makes exactly ONE Claude API call (~20-30s).
// The CLIENT handles retries, so no server-side retry loop.
// This keeps each function invocation well under Vercel's timeout.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/ai-orchestrator';
import { GENESIS_STEPS, TOTAL_STEPS } from '@/lib/prompts/world-genesis-steps';
import type { CharacterCreationInput } from '@/lib/types/character';

// Single Claude call should take 20-40s. 60s gives comfortable margin.
export const maxDuration = 60;

interface StepRequest {
  character: CharacterCreationInput;
  playerSentence?: string;
  stepIndex: number; // 0-based index into GENESIS_STEPS
  accumulated: Record<string, unknown>; // Results from all prior steps merged
}

/**
 * Attempt to repair truncated JSON from token limit cutoff.
 */
function repairJSON(text: string): string {
  let s = text.trim();

  // Strip markdown fences
  s = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // If odd number of unescaped quotes, close the open string
  const quoteCount = (s.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    s += '"';
  }

  // Remove trailing partial key-value pairs
  s = s.replace(/,\s*"[^"]*"\s*:\s*"?[^"{}[\]]*$/, '');
  s = s.replace(/,\s*"[^"]*"\s*:\s*$/, '');
  s = s.replace(/,\s*"[^"]*$/, '');
  s = s.replace(/,\s*$/, '');

  // Count unclosed brackets/braces
  let braces = 0, brackets = 0, inStr = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"' && (i === 0 || s[i - 1] !== '\\')) { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }

  for (let i = 0; i < brackets; i++) s += ']';
  for (let i = 0; i < braces; i++) s += '}';

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

  console.log(`[WorldGenesis:Step] Running step ${step.id}/${TOTAL_STEPS}: ${step.name}...`);

  try {
    const prompt = step.buildPrompt(charInput, accumulated ?? {}, playerSentence);

    // Add explicit JSON instruction to system prompt
    const system = `${prompt.system}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Just raw JSON.`;

    // ONE Claude call — no internal retry. Client handles retries.
    const rawText = await callClaude(
      'world_building',
      system,
      [{ role: 'user', content: prompt.user }],
      { maxTokens: prompt.maxTokens }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[WorldGenesis:Step] Step ${step.id} raw response: ${rawText.length} chars in ${duration}s`);

    // Parse JSON — try as-is first, then repair
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let result: Record<string, unknown>;

    try {
      result = JSON.parse(cleaned);
    } catch {
      console.warn(`[WorldGenesis:Step] Step ${step.id} JSON parse failed, attempting repair...`);
      const repaired = repairJSON(cleaned);
      result = JSON.parse(repaired); // If this throws, the catch below returns 500
      console.warn(`[WorldGenesis:Step] Step ${step.id} JSON repaired successfully`);
    }

    console.log(`[WorldGenesis:Step] Step ${step.id} (${step.name}) complete in ${duration}s`);

    return NextResponse.json({
      stepId: step.id,
      stepName: step.name,
      label: step.label,
      data: result,
      duration: parseFloat(duration),
    });
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[WorldGenesis:Step] Step ${step.id} failed after ${duration}s:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Step generation failed' },
      { status: 500 }
    );
  }
}
