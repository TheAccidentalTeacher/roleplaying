import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

/**
 * POST /api/eval-message
 * Groq Llama 3.3 70B judges a DM response against 5 RPG-specific rubrics.
 * Near-zero cost (~$0.001/eval). Triggered on 👎 clicks, not every message.
 *
 * Body:
 *   { dmResponse, playerAction, worldType, genre, promptVersion? }
 *
 * Returns:
 *   { scores: { brevity, playerAgency, storyFlow, gameMechanics, immersion }, overall, notes, promptVersion }
 */

interface EvalScores {
  brevity: number;       // 1-5: appropriate length, no padding, not too short
  playerAgency: number;  // 1-5: leaves meaningful choices to the player
  storyFlow: number;     // 1-5: advances narrative, no dead ends
  gameMechanics: number; // 1-5: HP/dice/spells applied correctly
  immersion: number;     // 1-5: tone matches world genre, stays in character
}

interface EvalResult {
  scores: EvalScores;
  overall: number;       // average of 5 scores
  notes: string;         // 1-2 sentences of specific feedback
  promptVersion?: string;
}

const EVAL_SYSTEM_PROMPT = `You are an expert TTRPG Dungeon Master evaluator. Your job is to score DM responses on 5 rubrics, each from 1 to 5. Be strict — a 5 means it is nearly perfect, a 3 is average but acceptable, a 2 means it needs work.

Rubrics:
- brevity: Is the response an appropriate length? A long scene description is fine. Padding filler phrases ("certainly!", "of course!", excessive re-narration of what just happened) are bad. Cutting too short when players need context is also bad.
- playerAgency: After reading the DM response, does the player feel they have meaningful choices? Railroading, dead ends, or responses that just describe what happened without any hook forward score low.
- storyFlow: Does the response advance the narrative, introduce interesting details, and maintain momentum? Bland, forgettable filler scores low.
- gameMechanics: Are HP, damage, dice rolls, spell slots, and other mechanics applied correctly and mentioned when relevant? Ignoring mechanics when they should matter scores low.
- immersion: Does the tone match the world's genre and setting? Does the DM stay in character? Breaking the fourth wall unnecessarily, anachronistic language, or tone mismatches score low.

Respond ONLY with a valid JSON object in this exact shape:
{
  "scores": {
    "brevity": <1-5>,
    "playerAgency": <1-5>,
    "storyFlow": <1-5>,
    "gameMechanics": <1-5>,
    "immersion": <1-5>
  },
  "notes": "<1-2 sentences of the most important specific feedback>"
}`;

export async function POST(req: NextRequest) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { dmResponse, playerAction = '', worldType = '', genre = '', promptVersion } = (await req.json()) as {
      dmResponse: string;
      playerAction?: string;
      worldType?: string;
      genre?: string;
      promptVersion?: string;
    };

    if (!dmResponse || dmResponse.trim().length === 0) {
      return NextResponse.json({ error: 'dmResponse is required' }, { status: 400 });
    }

    const userContent = `World Type: ${worldType || 'unknown'}
Genre: ${genre || 'unknown'}

Player action:
${playerAction || '(not provided)'}

DM response to evaluate:
${dmResponse.slice(0, 3000)}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: EVAL_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        max_tokens: 300,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Eval] Groq error:', res.status, errText.slice(0, 200));
      return NextResponse.json({ error: `Groq returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    const rawContent = data.choices?.[0]?.message?.content ?? '{}';

    let parsed: Partial<{ scores: Partial<EvalScores>; notes: string }>;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error('[Eval] Failed to parse Groq response:', rawContent);
      return NextResponse.json({ error: 'Failed to parse eval scores' }, { status: 502 });
    }

    const scores: EvalScores = {
      brevity:       clamp(parsed.scores?.brevity),
      playerAgency:  clamp(parsed.scores?.playerAgency),
      storyFlow:     clamp(parsed.scores?.storyFlow),
      gameMechanics: clamp(parsed.scores?.gameMechanics),
      immersion:     clamp(parsed.scores?.immersion),
    };

    const scoreValues = Object.values(scores);
    const overall = Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10;

    const result: EvalResult = {
      scores,
      overall,
      notes: typeof parsed.notes === 'string' ? parsed.notes.slice(0, 500) : '',
      promptVersion,
    };

    console.log(`[Eval] Completed. Overall: ${overall}. Notes: ${result.notes.slice(0, 80)}`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eval failed';
    console.error('[Eval] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function clamp(v: number | undefined | null): number {
  if (typeof v !== 'number' || isNaN(v)) return 3;
  return Math.max(1, Math.min(5, Math.round(v)));
}
