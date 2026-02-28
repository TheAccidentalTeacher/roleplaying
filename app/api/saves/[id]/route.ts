// ============================================================
// SAVES/[ID] API — Load / Delete a single save via Supabase
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  loadSave,
  deleteSave,
} from '@/lib/services/database';

// ---- GET: Load a save by ID ----
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = await loadSave(id);
    if (!row) {
      return NextResponse.json({ error: 'Save not found' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error('[saves/[id]/GET]', err);
    return NextResponse.json(
      { error: 'Failed to load save' },
      { status: 500 }
    );
  }
}

// ---- DELETE: Delete a save by ID ----
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSave(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[saves/[id]/DELETE]', err);
    return NextResponse.json(
      { error: 'Failed to delete save' },
      { status: 500 }
    );
  }
}
