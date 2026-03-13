import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

export const maxDuration = 30;

/**
 * Stability AI SDXL scene image generation.
 * Alternative to DALL-E — provides consistent art style per world genre
 * via `style_preset`. Returns Cloudinary CDN URL (or base64 fallback).
 *
 * POST body:
 *   { prompt: string, genre?: string, worldType?: string, width?: number, height?: number }
 */

const SDXL_ENDPOINT =
  'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

// Map primaryGenre → Stability style_preset
const GENRE_STYLE_PRESET: Record<string, string> = {
  'epic-fantasy':    'fantasy-art',
  'dark-fantasy':    'dark-fantasy',
  'horror':          'dark-fantasy',
  'lovecraftian':    'dark-fantasy',
  'mythological':    'fantasy-art',
  'sci-fi':          'cinematic',
  'cyberpunk':       'neon-punk',
  'steampunk':       'steampunk',
  'post-apocalypse': 'cinematic',
  'western':         'analog-film',
  'noir':            'analog-film',
  'military':        'cinematic',
  'comedy':          'digital-art',
  'mystery':         'cinematic',
  'survival':        'cinematic',
  'cosmic':          'digital-art',
  'political-intrigue': 'cinematic',
};

function getStylePreset(genre?: string): string {
  if (!genre) return 'fantasy-art';
  return GENRE_STYLE_PRESET[genre] ?? 'fantasy-art';
}

interface TextPrompt {
  text: string;
  weight: number;
}

interface StabilityResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.STABILITY_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'STABILITY_AI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const {
      prompt,
      genre,
      width = 1024,
      height = 1024,
      negativePrompt = 'blurry, low quality, text, watermark, signature, frame, border',
    } = (await req.json()) as {
      prompt: string;
      genre?: string;
      worldType?: string;
      width?: number;
      height?: number;
      negativePrompt?: string;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const stylePreset = getStylePreset(genre);

    const textPrompts: TextPrompt[] = [
      { text: prompt, weight: 1 },
      { text: negativePrompt, weight: -1 },
    ];

    console.log(`[StabilityAI] Generating image — genre=${genre}, style_preset=${stylePreset}`);

    const response = await fetch(SDXL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text_prompts: textPrompts,
        cfg_scale: 7,
        height,
        width,
        samples: 1,
        steps: 30,
        style_preset: stylePreset,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      console.error('[StabilityAI] API error:', response.status, errText);
      return NextResponse.json(
        { error: `Stability AI error (${response.status}): ${errText}` },
        { status: response.status },
      );
    }

    const data: StabilityResponse = await response.json();
    const artifact = data.artifacts?.[0];

    if (!artifact?.base64 || artifact.finishReason !== 'SUCCESS') {
      throw new Error(`Generation failed — finishReason: ${artifact?.finishReason ?? 'unknown'}`);
    }

    // Convert base64 → data URI for Cloudinary upload
    const dataUri = `data:image/png;base64,${artifact.base64}`;

    // Upload to Cloudinary for persistent CDN URL
    let imageUrl = dataUri;
    if (process.env.CLOUDINARY_URL) {
      try {
        imageUrl = await uploadToCloudinary(dataUri, 'rpg-scenes-stability');
        console.log('[StabilityAI] Uploaded to Cloudinary:', imageUrl);
      } catch (err) {
        console.warn('[StabilityAI] Cloudinary upload failed, returning base64:', err);
      }
    }

    return NextResponse.json({ imageUrl, stylePreset, model: 'stable-diffusion-xl-1024-v1-0' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[StabilityAI] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
