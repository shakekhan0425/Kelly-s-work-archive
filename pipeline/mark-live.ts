/**
 * 数据驱动地把「已有内容」的来源标记为 live:true。
 * 依据：signals / cases 表中出现过的 sourceId → 该来源确实已被接入。
 * 直接更新 Supabase `sources` 表的 jsonb data.live，避免重跑 seed 覆盖。
 *
 * 运行：tsx pipeline/mark-live.ts
 */
import "./lib/env";
import { getSupabaseAdmin } from "./lib/supabase";
import { isCli } from "./lib/ingest-shared";

export async function runMarkLive(log: (s: string) => void = console.log): Promise<{ withContent: number; marked: number }> {
  const [{ data: sig }, { data: cas }] = await Promise.all([
    getSupabaseAdmin().from("signals").select("data"),
    getSupabaseAdmin().from("cases").select("data"),
  ]);
  const ids = new Set<string>();
  for (const r of sig || []) if (r.data?.sourceId) ids.add(r.data.sourceId);
  for (const r of cas || []) if (r.data?.sourceId) ids.add(r.data.sourceId);
  log(`有内容的来源数：${ids.size}`);
  let n = 0;
  for (const id of ids) {
    const { data: row } = await getSupabaseAdmin().from("sources").select("data").eq("id", id).maybeSingle();
    if (!row || !row.data) continue;
    if (row.data.live === true) { n++; continue; }
    const updated = { ...row.data, live: true };
    const { error } = await getSupabaseAdmin().from("sources").update({ data: updated }).eq("id", id);
    if (!error) n++;
  }
  log(`✅ 已标记 live:true 的来源：${n} 个`);
  return { withContent: ids.size, marked: n };
}

if (isCli("mark-live")) {
  runMarkLive().catch((e) => { console.error("失败：", e.message); process.exit(1); });
}
