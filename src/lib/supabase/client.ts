import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Returns null when env is not configured
 * (e.g. local demo mode without a Supabase project).
 */
export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
