import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PUBLIC_SUPABASE_URL } from "./config";

/**
 * Server-side Supabase client (used in Server Components and Server Actions).
 * Returns null when env is not configured, so callers must handle the
 * no-backend (demo) path.
 */
export async function getServerSupabase() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!PUBLIC_SUPABASE_URL || !anon) return null;

  const cookieStore = await cookies();
  return createServerClient(PUBLIC_SUPABASE_URL, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (read-only cookies) — safe to ignore.
        }
      },
    },
  });
}
