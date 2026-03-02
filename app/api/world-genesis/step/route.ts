// ============================================================
// WORLD GENESIS — SINGLE STEP API
// POST /api/world-genesis/step
//
// Runs ONE world-genesis step at a time.
// The client orchestrates: call step 1, get result, call step 2
// with accumulated data, etc. Each call is ~15-20s, no timeout.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/ai-orchestrator';
import { GENESIS_STEPS, TOTAL_STEPS } from '@/lib/prompts/world-genesis-steps';
import type { CharacterCreationInput } from '@/lib/types/character';

// A single step should never take more than 60s
export const maxDuration = 60;

interface StepRequest {
  character: CharacterCreationInput;
  playerSentence?: string;
  stepIndex: number; // 0-based index into GENESIS_STEPS
  accumulated: Record<string, unknown>; // Results from all prior steps merged
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
    const result = await callClaudeJSON<Record<string, unknown>>(
      'world_building',
      prompt.system,
      prompt.user,
      { maxTokens: prompt.maxTokens }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
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
