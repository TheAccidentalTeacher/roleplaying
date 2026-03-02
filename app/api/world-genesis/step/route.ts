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

// Vercel Pro plan allows up to 300s. Single Claude call ~25-40s.
export const maxDuration = 300;

interface StepRequest {
  character: CharacterCreationInput;
  playerSentence?: string;
  stepIndex: number; // 0-based index into GENESIS_STEPS
  accumulated: Record<string, unknown>; // Results from all prior steps merged
}

/**
 * Sanitize Claude's raw JSON output by escaping control characters
 * (literal newlines, tabs, etc.) that appear inside JSON string values.
 * Also fixes common Claude JSON mistakes.
 */
function sanitizeJSON(raw: string): string {
  let s = raw.trim();

  // Strip markdown fences
  s = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Walk through character by character and escape control chars inside strings
  let result = '';
  let inString = false;
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (ch === '"' && (i === 0 || s[i - 1] !== '\\')) {
      inString = !inString;
      result += ch;
      i++;
      continue;
    }

    if (inString) {
      // Escape literal control characters that break JSON
      if (ch === '\n') { result += '\\n'; i++; continue; }
      if (ch === '\r') { result += '\\r'; i++; continue; }
      if (ch === '\t') { result += '\\t'; i++; continue; }
      // Escape unescaped backslashes that aren't part of valid escape sequences
      if (ch === '\\' && i + 1 < s.length) {
        const next = s[i + 1];
        if ('"\\\/bfnrtu'.includes(next)) {
          // Valid escape sequence — keep as-is
          result += ch + next;
          i += 2;
          continue;
        } else {
          // Invalid escape — double the backslash
          result += '\\\\';
          i++;
          continue;
        }
      }
      result += ch;
      i++;
    } else {
      result += ch;
      i++;
    }
  }

  return result;
}

/**
 * Attempt to repair truncated JSON from token limit cutoff.
 */
function repairTruncated(text: string): string {
  let s = text;

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

    // Sanitize → parse → repair if needed
    const sanitized = sanitizeJSON(rawText);
    let result: Record<string, unknown>;

    try {
      result = JSON.parse(sanitized);
    } catch (firstErr) {
      console.warn(`[WorldGenesis:Step] Step ${step.id} JSON parse failed after sanitize, attempting truncation repair...`);
      try {
        const repaired = repairTruncated(sanitized);
        result = JSON.parse(repaired);
        console.warn(`[WorldGenesis:Step] Step ${step.id} JSON repaired successfully`);
      } catch {
        // Log the actual error and a snippet of the problematic JSON
        console.error(`[WorldGenesis:Step] Step ${step.id} JSON repair also failed:`, firstErr);
        console.error(`[WorldGenesis:Step] Raw text snippet (first 500 chars): ${rawText.substring(0, 500)}`);
        throw firstErr;
      }
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
