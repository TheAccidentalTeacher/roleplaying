import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'onyx' } = (await req.json()) as {
      text: string;
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
      .replace(/\*(.*?)\*/g, '$1')       // italic
      .replace(/`([^`]+)`/g, '$1')       // inline code
      .replace(/^#{1,6}\s+/gm, '')       // headers
      .replace(/^[-*]\s+/gm, '')         // list items
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/~~(.*?)~~/g, '$1')       // strikethrough
      .trim();

    // Truncate to ~4000 chars (~1 min of speech at normal pace)
    const truncated = cleanText.length > 4000
      ? cleanText.slice(0, 4000) + '...'
      : cleanText;

    console.log(`[TTS] Generating speech: voice=${voice}, chars=${truncated.length}`);

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: truncated,
      response_format: 'mp3',
      speed: 1.0,
    });

    // Stream the audio response
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('[TTS] Error:', error);
    const message = error instanceof Error ? error.message : 'TTS generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
