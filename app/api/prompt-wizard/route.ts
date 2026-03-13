import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

/**
 * Prompt Improvement Wizard — JAIMES-inspired endpoint.
 * Analyzes recent 👎 messages + eval scores and suggests 3 concrete
 * improvements to the DM system prompt. Powered by Groq (near-zero cost).
 *
 * POST body:
 *   {
 *     thumbsDownMessages: Array<{
 *       dmResponse: string;
 *       playerAction: string;
 *       evalNotes?: string;
 *       scores?: { brevity: number; playerAgency: number; storyFlow: number; gameMechanics: number; immersion: number; overall: number };
 *     }>;
 *     promptSnippet?: string;  // First 800 chars of current system prompt (for context)
 *     genre?: string;
 *   }
 *
 * Returns:
 *   { suggestions: Array<{ title: string; description: string; instruction: string }> }
 */

interface ThumbsDownMessage {
  dmResponse: string;
  playerAction: string;
  evalNotes?: string;
  scores?: {
    brevity?: number;
    playerAgency?: number;
    storyFlow?: number;
    gameMechanics?: number;
    immersion?: number;
    overall?: number;
  };
}

interface Suggestion {
  title: string;
  description: string;
  instruction: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { thumbsDownMessages = [], promptSnippet = '', genre = 'epic-fantasy' } =
      (await req.json()) as {
        thumbsDownMessages?: ThumbsDownMessage[];
        promptSnippet?: string;
        genre?: string;
      };

    if (thumbsDownMessages.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: 'No 👎 messages found yet — give the DM a few sessions before running the wizard.',
      });
    }

    // Build a concise summary of each 👎 message for the AI
    const messageContext = thumbsDownMessages
      .slice(0, 3)
      .map((m, i) => {
        const scores = m.scores
          ? `Scores: brevity=${m.scores.brevity ?? '?'} agency=${m.scores.playerAgency ?? '?'} story=${m.scores.storyFlow ?? '?'} mechanics=${m.scores.gameMechanics ?? '?'} immersion=${m.scores.immersion ?? '?'}`
          : 'No eval scores';
        return `[Message ${i + 1}]
Player action: "${m.playerAction}"
DM response: "${m.dmResponse.slice(0, 300)}${m.dmResponse.length > 300 ? '...' : ''}"
${scores}
${m.evalNotes ? `Notes: ${m.evalNotes}` : ''}`;
      })
      .join('\n\n');

    const systemPromptContext = promptSnippet
      ? `\n\nCurrent system prompt excerpt:\n"""\n${promptSnippet.slice(0, 600)}\n"""`
      : '';

    const wizardPrompt = `You are a DM prompt engineer analyzing player feedback to improve an AI Dungeon Master's system prompt for a ${genre} RPG.

The player gave thumbs-down to these DM responses:

${messageContext}
${systemPromptContext}

Based on the patterns in these 👎 responses, generate exactly 3 targeted improvements to the DM's system prompt instructions.

Each improvement must be:
1. Specific and actionable (not vague advice like "be more engaging")
2. Directly addressing patterns you see in the 👎 data
3. Phrased as an instruction to add to the DM system prompt

Return ONLY a JSON object with this exact structure:
{
  "suggestions": [
    {
      "title": "Short label (3-5 words)",
      "description": "One sentence explaining what problem this fixes",
      "instruction": "The exact text to add to the system prompt (1-3 sentences)"
    }
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: wizardPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Groq error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';

    let parsed: { suggestions?: Suggestion[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Failed to parse Groq JSON response');
    }

    const suggestions: Suggestion[] = (parsed.suggestions ?? []).slice(0, 3).map((s) => ({
      title: String(s.title ?? 'Improvement'),
      description: String(s.description ?? ''),
      instruction: String(s.instruction ?? ''),
    }));

    return NextResponse.json({ suggestions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PromptWizard] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
