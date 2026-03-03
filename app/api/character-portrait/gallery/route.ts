/**
 * GET /api/character-portrait/gallery?characterId=xxx
 *
 * Returns the full portrait gallery for a character:
 * - Visual identity (reusable style prompt)
 * - All portrait records ordered by creation date
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFullGallery } from '@/lib/services/gallery-service';

export async function GET(req: NextRequest) {
  try {
    const characterId = req.nextUrl.searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId query parameter is required' },
        { status: 400 },
      );
    }

    const gallery = await getFullGallery(characterId);
    return NextResponse.json(gallery);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Gallery] Error loading gallery:', msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    );
  }
}
