// 共享：Supabase 服务端客户端（service_role，绕过 RLS）
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabase(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未配置");
  return createClient(url, key, { auth: { persistSession: false } });
}
