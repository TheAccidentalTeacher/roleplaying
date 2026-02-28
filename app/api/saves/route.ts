// ============================================================
// SAVES API — Create / List saves via Supabase
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  createSave,
  listSaves,
  deleteOldAutoSaves,
} from '@/lib/services/database';

// ---- POST: Create a new save ----
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterId, saveType, payload, label, localId } = body;

    if (!characterId || !saveType || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: characterId, saveType, payload' },
        { status: 400 }
      );
    }

    const row = await createSave(characterId, saveType, payload, label, localId);

    // Prune old auto-saves
    if (saveType === 'auto') {
      await deleteOldAutoSaves(characterId, 5).catch(() => {});
    }

    return NextResponse.json({ id: row.id, created_at: row.created_at });
  } catch (err) {
    console.error('[saves/POST]', err);
    return NextResponse.json(
      { error: 'Failed to create save' },
      { status: 500 }
    );
  }
}

// ---- GET: List saves for a character ----
export async function GET(req: NextRequest) {
  try {
    const characterId = req.nextUrl.searchParams.get('characterId');
    if (!characterId) {
      return NextResponse.json(
        { error: 'Missing characterId query param' },
        { status: 400 }
      );
    }

    const rows = await listSaves(characterId);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[saves/GET]', err);
    return NextResponse.json(
      { error: 'Failed to list saves' },
      { status: 500 }
    );
  }
}
