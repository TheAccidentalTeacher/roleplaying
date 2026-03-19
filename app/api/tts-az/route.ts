import { NextRequest, NextResponse } from 'next/server';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION ?? 'westus';

  if (!speechKey) {
    return NextResponse.json({ error: 'AZURE_SPEECH_KEY not configured' }, { status: 500 });
  }

  try {
    const { text, voice = 'en-US-AriaNeural' } = (await req.json()) as {
      text: string;
      voice?: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Azure TTS max is ~10K characters per request
    const truncated = text.length > 9000 ? text.slice(0, 9000) + '...' : text;

    // Escape XML special chars for SSML
    const escaped = truncated
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const ssml = `<speak version='1.0' xml:lang='en-US'>
  <voice name='${voice}'>${escaped}</voice>
</speak>`;

    const endpoint = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      },
      body: ssml,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[TTS-AZ] Azure error:', response.status, errText.slice(0, 200));
      return NextResponse.json({ error: `Azure Speech returned ${response.status}` }, { status: 502 });
    }

    return new NextResponse(response.body as ReadableStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Azure TTS failed';
    console.error('[TTS-AZ] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
