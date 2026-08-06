import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 后端流水线使用 service_role key（绕过 RLS，拥有写入权限）。
 * 前端工作台使用 NEXT_PUBLIC_SUPABASE_ANON_KEY（仅匿名读）。
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请在 .env 中配置（参考 .env.example）。"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getSupabaseAnon(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("缺少 SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY。");
  }
  return createClient(url, key);
}
