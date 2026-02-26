// ============================================================
// IMAGE STORE SERVICE
// Generates images via AI, uploads to Supabase Storage,
// and saves metadata to the images table.
// ============================================================

import { generateImage } from '@/lib/ai-orchestrator';
import { saveImageRecord, getImages } from '@/lib/services/database';
import { getSupabase } from '@/lib/services/supabase';

export type ImageType = 'portrait' | 'npc' | 'item' | 'location' | 'scene';

interface GenerateAndStoreOptions {
  task: 'image_scene' | 'image_item' | 'image_character' | 'image_location';
  prompt: string;
  characterId: string;
  imageType: ImageType;
  referenceId?: string;  // NPC ID, item ID, etc.
  metadata?: Record<string, unknown>;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
}

interface StoredImage {
  id: string;
  url: string;
  storagePath: string;
  prompt: string;
  imageType: ImageType;
}

/**
 * Generate an image, upload to Supabase Storage, and save record.
 * Returns a permanent Supabase Storage URL instead of a temporary OpenAI URL.
 */
export async function generateAndStore(
  options: GenerateAndStoreOptions
): Promise<StoredImage> {
  const {
    task,
    prompt,
    characterId,
    imageType,
    referenceId,
    metadata,
    size = '1024x1024',
  } = options;

  // 1. Generate image via AI
  const generated = await generateImage(task, prompt, { size });

  if (!generated.url) {
    throw new Error('Image generation returned no URL');
  }

  // 2. Download the image from the temporary URL
  const imageResponse = await fetch(generated.url);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  const imageBuffer = await imageResponse.arrayBuffer();

  // 3. Build storage path
  const timestamp = Date.now();
  const fileName = referenceId
    ? `${imageType}_${referenceId}_${timestamp}.png`
    : `${imageType}_${timestamp}.png`;
  const storagePath = `${characterId}/${fileName}`;

  // 4. Upload to Supabase Storage
  const supabase = getSupabase();
  const { error: uploadError } = await supabase.storage
    .from('rpg-images')
    .upload(storagePath, imageBuffer, {
      contentType: 'image/png',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  // 5. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('rpg-images')
    .getPublicUrl(storagePath);

  const permanentUrl = publicUrlData?.publicUrl ?? '';

  // 6. Save record to database
  const record = await saveImageRecord(
    characterId,
    imageType,
    prompt,
    storagePath,
    {
      ...metadata,
      referenceId,
      revisedPrompt: generated.revisedPrompt,
      model: generated.model,
      originalUrl: generated.url,
    }
  );

  return {
    id: record.id,
    url: permanentUrl,
    storagePath,
    prompt,
    imageType,
  };
}

/**
 * Check if an image already exists for a given character and reference.
 * Returns the URL if found, null otherwise.
 */
export async function getExistingImage(
  characterId: string,
  imageType: ImageType,
  referenceId?: string
): Promise<StoredImage | null> {
  const images = await getImages(characterId, imageType);

  if (referenceId) {
    const match = images.find(
      (img) =>
        img.metadata &&
        (img.metadata as Record<string, unknown>).referenceId === referenceId
    );
    if (!match) return null;

    const supabase = getSupabase();
    const { data } = supabase.storage
      .from('rpg-images')
      .getPublicUrl(match.storage_path);

    return {
      id: match.id,
      url: data?.publicUrl ?? '',
      storagePath: match.storage_path,
      prompt: match.prompt,
      imageType: match.image_type,
    };
  }

  // Return most recent image of this type
  if (images.length === 0) return null;
  const latest = images[0];

  const supabase = getSupabase();
  const { data } = supabase.storage
    .from('rpg-images')
    .getPublicUrl(latest.storage_path);

  return {
    id: latest.id,
    url: data?.publicUrl ?? '',
    storagePath: latest.storage_path,
    prompt: latest.prompt,
    imageType: latest.image_type,
  };
}

/**
 * Regenerate an image using the original prompt.
 * Replaces the file in storage and updates the DB record.
 */
export async function regenerateImage(
  characterId: string,
  imageType: ImageType,
  task: 'image_scene' | 'image_item' | 'image_character' | 'image_location',
  prompt: string,
  referenceId?: string
): Promise<StoredImage> {
  // Simply generate a new one (old one stays in storage for now)
  return generateAndStore({
    task,
    prompt,
    characterId,
    imageType,
    referenceId,
  });
}
