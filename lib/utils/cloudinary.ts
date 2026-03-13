/**
 * Cloudinary image upload utility — server-side only.
 * Parses CLOUDINARY_URL env var and uploads base64/buffer images to the CDN.
 * Returns a CDN URL with auto-format + quality transforms applied.
 */
import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) throw new Error('CLOUDINARY_URL is not set');
  // cloudinary.config({ cloud_name, api_key, api_secret }) via CLOUDINARY_URL auto-parse
  cloudinary.config({ secure: true });
  configured = true;
}

/**
 * Upload a base64 data URI (or http URL) to Cloudinary.
 * Returns the CDN URL with f_auto,q_auto applied.
 *
 * @param dataUri  data:image/png;base64,... or https://... URL
 * @param folder   Cloudinary folder, e.g. 'rpg-scenes'
 * @returns        CDN URL string
 */
export async function uploadToCloudinary(
  dataUri: string,
  folder = 'rpg-scenes',
): Promise<string> {
  ensureConfigured();

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    format: 'jpg',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  // Return a CDN URL with runtime transforms for optimal delivery
  return cloudinary.url(result.public_id, {
    transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1024, crop: 'limit' }],
    secure: true,
  });
}
