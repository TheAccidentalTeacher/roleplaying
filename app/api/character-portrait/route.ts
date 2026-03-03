/**
 * POST /api/character-portrait
 *
 * Generates a character portrait with visual consistency.
 *
 * Flow:
 * 1. If no visual identity exists → Claude analyzes character sheet → creates one → saves it
 * 2. Build a full image prompt = visual identity prefix + milestone scene description
 * 3. Generate image via OpenAI (gpt-image-1)
 * 4. Download from OpenAI (URL expires in 1hr) → upload to Supabase Storage
 * 5. Save portrait record to Supabase `images` table
 * 6. Return the public URL + record
 *
 * Request body:
 * {
 *   character: Character,         // Full character sheet
 *   characterId: string,          // UUID from Supabase or localStorage
 *   milestone?: PortraitMilestone, // Default: 'custom'
 *   storyContext?: string,        // Optional story context for scene description
 *   label?: string,               // Custom label (e.g. "After defeating the dragon")
 *   worldGenre?: string,          // World genre for art style matching
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Character } from '@/lib/types/character';
import type { PortraitMilestone, VisualIdentity } from '@/lib/types/gallery';
import { MILESTONE_LABELS } from '@/lib/types/gallery';
import { generateVisualIdentity, buildPortraitPrompt } from '@/lib/services/portrait-prompt';
import { generateImage } from '@/lib/ai-orchestrator';
import {
  persistImage,
  savePortraitRecord,
  loadVisualIdentity,
  saveVisualIdentity,
} from '@/lib/services/gallery-service';

export const maxDuration = 120; // Image gen can take a while

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      character,
      characterId,
      milestone = 'custom',
      storyContext,
      label,
      worldGenre,
    } = body as {
      character: Character;
      characterId: string;
      milestone?: PortraitMilestone;
      storyContext?: string;
      label?: string;
      worldGenre?: string;
    };

    if (!character || !characterId) {
      return NextResponse.json(
        { error: 'character and characterId are required' },
        { status: 400 },
      );
    }

    console.log(`[Portrait] Generating for ${character.name} (${milestone}, level ${character.level})`);

    // ── Step 1: Get or create visual identity ──
    let visualIdentity: VisualIdentity | null = null;

    try {
      visualIdentity = await loadVisualIdentity(characterId);
    } catch (e) {
      console.warn('[Portrait] Could not load visual identity from Supabase:', e);
    }

    if (!visualIdentity) {
      console.log('[Portrait] No visual identity found, generating one...');
      visualIdentity = await generateVisualIdentity(character, worldGenre);
      console.log('[Portrait] Visual identity created:', visualIdentity.artStyle);

      try {
        await saveVisualIdentity(characterId, visualIdentity);
      } catch (e) {
        console.warn('[Portrait] Could not save visual identity to Supabase (continuing):', e);
      }
    }

    // ── Step 2: Build the full prompt ──
    const prompt = buildPortraitPrompt(
      visualIdentity,
      milestone,
      character.level,
      storyContext,
    );
    console.log('[Portrait] Prompt built, length:', prompt.length);

    // ── Step 3: Generate image ──
    const result = await generateImage('image_character', prompt, {
      size: '1024x1024',
      quality: 'hd',
    });
    console.log('[Portrait] Image generated via', result.model);

    // ── Step 4: Persist to Supabase Storage ──
    let publicUrl = result.url;
    let storagePath = '';

    try {
      const filename = `${milestone}-lv${character.level}-${Date.now()}.png`;
      const persisted = await persistImage(result.url, characterId, filename);
      publicUrl = persisted.publicUrl;
      storagePath = persisted.storagePath;
      console.log('[Portrait] Persisted to Supabase Storage:', storagePath);
    } catch (e) {
      console.warn('[Portrait] Could not persist to Supabase Storage (returning OpenAI URL):', e);
      // Fall back to the OpenAI URL (expires in ~1hr)
      storagePath = `temp/${characterId}/${Date.now()}.png`;
    }

    // ── Step 5: Save record to database ──
    const portraitLabel = label || `Level ${character.level} — ${MILESTONE_LABELS[milestone]}`;

    let savedRecord;
    try {
      savedRecord = await savePortraitRecord({
        characterId,
        imageUrl: publicUrl,
        storagePath,
        prompt,
        model: result.model,
        label: portraitLabel,
        milestone,
        characterLevel: character.level,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[Portrait] Could not save record to Supabase:', e);
      savedRecord = {
        id: `local-${Date.now()}`,
        characterId,
        imageUrl: publicUrl,
        storagePath,
        prompt,
        model: result.model,
        label: portraitLabel,
        milestone,
        characterLevel: character.level,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      portrait: savedRecord,
      visualIdentity,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[Portrait] Error:', msg, stack);
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    );
  }
}
