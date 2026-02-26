// ============================================================
// SUPABASE CLIENT — Singleton Supabase client
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing env vars SUPABASE_URL / SUPABASE_ANON_KEY. ' +
    'Database features will not work until these are configured.'
  );
}

// Client-side singleton (uses anon key — RLS policies apply)
let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return clientInstance;
}

// Server-side client for API routes (uses service role key — bypasses RLS)
export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? '';
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export default getSupabase;
