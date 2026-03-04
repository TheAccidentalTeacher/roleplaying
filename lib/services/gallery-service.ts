/**
 * GALLERY SERVICE — Supabase storage for character portraits
 *
 * Handles:
 * - Downloading generated images from OpenAI (URLs expire in 1hr)
 * - Uploading to Supabase Storage `rpg-images` bucket
 * - CRUD on the `images` table for portrait records
 * - Loading/saving visual identity + gallery metadata
 */

import { getSupabaseAdmin } from '@/lib/services/supabase';
import type { PortraitRecord, CharacterGallery, VisualIdentity, PortraitMilestone } from '@/lib/types/gallery';

const BUCKET = 'rpg-images';

/**
 * Download an image from a URL and upload it to Supabase Storage.
 * Returns the public URL of the stored image.
 */
export async function persistImage(
  imageUrl: string,
  characterId: string,
  filename: string,
): Promise<{ storagePath: string; publicUrl: string }> {
  const supabase = getSupabaseAdmin();
  const storagePath = `portraits/${characterId}/${filename}`;

  let buffer: Buffer;

  if (imageUrl.startsWith('data:')) {
    // Handle base64 data URI (gpt-image-1 returns b64_json)
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    buffer = Buffer.from(base64Data, 'base64');
  } else {
    // Download the image from OpenAI (URL expires in ~1hr)
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    buffer = Buffer.from(await blob.arrayBuffer());
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl };
}

/**
 * Save a portrait record to the `images` table.
 */
export async function savePortraitRecord(
  record: Omit<PortraitRecord, 'id'>,
): Promise<PortraitRecord> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('images')
    .insert({
      character_id: record.characterId,
      image_type: 'character',
      prompt: record.prompt,
      storage_path: record.storagePath,
      metadata: {
        label: record.label,
        milestone: record.milestone,
        characterLevel: record.characterLevel,
        model: record.model,
        imageUrl: record.imageUrl,
      },
      created_at: record.createdAt,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save portrait record: ${error.message}`);
  }

  return { ...record, id: data.id };
}

/**
 * Load all portrait records for a character.
 */
export async function loadGallery(characterId: string): Promise<PortraitRecord[]> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('character_id', characterId)
      .eq('image_type', 'character')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Gallery] Failed to load gallery:', error.message);
      return [];
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      characterId: row.character_id as string,
      imageUrl: (row.metadata as Record<string, unknown>)?.imageUrl as string || '',
      storagePath: row.storage_path as string,
      prompt: row.prompt as string,
      model: (row.metadata as Record<string, unknown>)?.model as string || 'unknown',
      label: (row.metadata as Record<string, unknown>)?.label as string || 'Portrait',
      milestone: ((row.metadata as Record<string, unknown>)?.milestone as PortraitMilestone) || 'custom',
      characterLevel: (row.metadata as Record<string, unknown>)?.characterLevel as number || 1,
      createdAt: row.created_at as string,
    }));
  } catch (e) {
    console.warn('[Gallery] loadGallery crashed:', e instanceof Error ? e.message : e);
    return [];
  }
}

/**
 * Save/load visual identity to the character's metadata in Supabase.
 * Stored as a JSONB field in the `characters` table metadata column,
 * or as a separate localStorage key if characters table doesn't have metadata.
 */
export async function saveVisualIdentity(
  characterId: string,
  identity: VisualIdentity,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  // Try to save to characters table metadata
  const { error } = await supabase
    .from('characters')
    .update({
      portrait_url: null, // Will be set when first portrait is generated
    })
    .eq('id', characterId);

  if (error) {
    console.warn('[Gallery] Could not update characters table:', error.message);
  }

  // Also save as a separate images record with type metadata
  await supabase
    .from('images')
    .upsert({
      character_id: characterId,
      image_type: 'character',
      prompt: '__visual_identity__',
      storage_path: '__identity__',
      metadata: { visualIdentity: identity },
      created_at: identity.createdAt,
    }, {
      onConflict: 'character_id',
      ignoreDuplicates: false,
    })
    .select()
    .single()
    .then(({ error: e }) => {
      if (e) {
        // If upsert fails (no unique constraint), just insert
        return supabase.from('images').insert({
          character_id: characterId,
          image_type: 'character',
          prompt: '__visual_identity__',
          storage_path: '__identity__',
          metadata: { visualIdentity: identity },
          created_at: identity.createdAt,
        });
      }
    });
}

/**
 * Load visual identity for a character from Supabase.
 */
export async function loadVisualIdentity(
  characterId: string,
): Promise<VisualIdentity | null> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('images')
      .select('metadata')
      .eq('character_id', characterId)
      .eq('prompt', '__visual_identity__')
      .single();

    if (error || !data) return null;

    const meta = data.metadata as Record<string, unknown>;
    const vi = meta?.visualIdentity as VisualIdentity | undefined;
    return vi || null;
  } catch (e) {
    console.warn('[Gallery] loadVisualIdentity failed:', e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Get the full gallery (identity + portraits) for a character.
 */
export async function getFullGallery(characterId: string): Promise<CharacterGallery> {
  try {
    const [visualIdentity, portraits] = await Promise.all([
      loadVisualIdentity(characterId),
      loadGallery(characterId),
    ]);

    return {
      characterId,
      visualIdentity,
      portraits,
    };
  } catch (e) {
    console.warn('[Gallery] getFullGallery failed:', e instanceof Error ? e.message : e);
    return {
      characterId,
      visualIdentity: null,
      portraits: [],
    };
  }
}
