import { Langfuse } from 'langfuse';

let _langfuse: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (!process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_PUBLIC_KEY) {
    return null; // Silently skip if not configured
  }
  if (!_langfuse) {
    _langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASE_URL ?? 'https://us.cloud.langfuse.com',
      flushAt: 1,  // Send immediately (useful for serverless/edge functions)
    });
  }
  return _langfuse;
}
