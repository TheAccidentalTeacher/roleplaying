import { NextRequest, NextResponse } from 'next/server';

// ──────────────────────────────────────────────────────────────
//  ElevenLabs Text-to-Speech API Route
//  POST /api/tts-el  { text: string; voiceId: string }
//  Returns audio/mpeg
// ──────────────────────────────────────────────────────────────

const EL_BASE = 'https://api.elevenlabs.io/v1/text-to-speech';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 });
    }

    const { text, voiceId } = (await req.json()) as {
      text: string;
      voiceId: string;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (!voiceId?.trim()) {
      return NextResponse.json({ error: 'voiceId is required' }, { status: 400 });
    }

    // Clamp to ElevenLabs recommended limit
    const clampedText = text.slice(0, 5000);

    const elResponse = await fetch(
      `${EL_BASE}/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: clampedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elResponse.ok) {
      const errText = await elResponse.text().catch(() => 'unknown');
      console.error(`[TTS-EL] ElevenLabs error ${elResponse.status}:`, errText);
      return NextResponse.json(
        { error: `ElevenLabs API error (${elResponse.status})`, detail: errText },
        { status: elResponse.status >= 500 ? 502 : elResponse.status },
      );
    }

    const audioBuffer = await elResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[TTS-EL] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
