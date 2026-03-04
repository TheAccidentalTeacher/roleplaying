// ============================================================
// ADVENTURES/[ID] API — Load / Update / Delete a single adventure
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { loadAdventure, updateAdventure, deleteAdventure } from '@/lib/services/database';

// ---- GET: Load a full adventure (including game_state) ----
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await loadAdventure(id);
    if (!row) {
      return NextResponse.json({ error: 'Adventure not found' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error('[adventures/[id]/GET]', err);
    return NextResponse.json({ error: 'Failed to load adventure' }, { status: 500 });
  }
}

// ---- PATCH: Update adventure metadata or overwrite state ----
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await updateAdventure(id, {
      saveName: body.saveName,
      worldName: body.worldName,
      characterLevel: body.characterLevel,
      currentLocation: body.currentLocation,
      messageCount: body.messageCount,
      questCount: body.questCount,
      gameState: body.gameState,
      lastPlayedAt: body.lastPlayedAt,
    });

    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error('[adventures/[id]/PATCH]', err);
    return NextResponse.json({ error: 'Failed to update adventure' }, { status: 500 });
  }
}

// ---- DELETE: Delete an adventure ----
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteAdventure(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[adventures/[id]/DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete adventure' }, { status: 500 });
  }
}
