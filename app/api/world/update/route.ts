import { NextResponse } from 'next/server';
import { updateWorld } from '@/lib/services/database';
import type { WorldRecord } from '@/lib/types/world';

// PATCH /api/world/update
// Body: { worldId: string; updates: Partial<WorldRecord> }
export async function PATCH(req: Request) {
  try {
    const { worldId, updates } = await req.json() as {
      worldId: string;
      updates: Partial<WorldRecord>;
    };

    if (!worldId || typeof worldId !== 'string') {
      return NextResponse.json({ error: 'worldId is required' }, { status: 400 });
    }
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates must be an object' }, { status: 400 });
    }

    await updateWorld(worldId, updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[world/update]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
