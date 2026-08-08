/**
 * Public Supabase project URL used by both server and browser clients.
 * The fallback keeps production readable if a hosting provider drops the
 * non-secret URL variable; the publishable/anon key is still required.
 */
export const PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://xecllrzcdalpxbxekunm.supabase.co";
