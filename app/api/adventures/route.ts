// ============================================================
// ADVENTURES API — List + Create adventures via Supabase
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdventure, listAdventures, countAdventures } from '@/lib/services/database';

const MAX_ADVENTURES = 20;

// ---- GET: List all adventures ----
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'default';
    const rows = await listAdventures(userId);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[adventures/GET]', err);
    return NextResponse.json({ error: 'Failed to list adventures' }, { status: 500 });
  }
}

// ---- POST: Create a new adventure save ----
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'default',
      saveName,
      worldName,
      worldType,
      primaryGenre,
      characterName,
      characterClass,
      characterRace,
      characterLevel,
      currentLocation,
      messageCount,
      questCount,
      gameState,
    } = body;

    if (!saveName || !gameState) {
      return NextResponse.json(
        { error: 'Missing required fields: saveName, gameState' },
        { status: 400 }
      );
    }

    // Check max saves
    const count = await countAdventures(userId);
    if (count >= MAX_ADVENTURES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ADVENTURES} adventures reached. Delete some old saves first.` },
        { status: 409 }
      );
    }

    const row = await createAdventure({
      userId,
      saveName,
      worldName: worldName ?? 'Unknown',
      worldType: worldType ?? 'unknown',
      primaryGenre: primaryGenre ?? 'fantasy',
      characterName: characterName ?? 'Unknown',
      characterClass: characterClass ?? 'Unknown',
      characterRace: characterRace ?? 'Unknown',
      characterLevel: characterLevel ?? 1,
      currentLocation: currentLocation ?? 'Unknown',
      messageCount: messageCount ?? 0,
      questCount: questCount ?? 0,
      gameState,
    });

    return NextResponse.json({ id: row.id, created_at: row.created_at });
  } catch (err) {
    console.error('[adventures/POST]', err);
    return NextResponse.json({ error: 'Failed to create adventure' }, { status: 500 });
  }
}
