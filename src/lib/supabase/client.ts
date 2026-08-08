import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 浏览器端 Supabase 客户端（懒加载，仅客户端可用）。
 * 一律在函数内实例化，绝不放在模块顶层 —— 否则 Vercel 构建期会求值到
 * createClient 而失败（参见 pipeline 模块铁律）。
 */
let _client: SupabaseClient | null = null;
let _tried = false;

export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (_client) return _client;
  if (_tried) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    _tried = true;
    return null;
  }
  _client = createClient(url, anon, { auth: { persistSession: false } });
  return _client;
}
