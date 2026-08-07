/**
 * 初始化种子数据：把前端已有的真实注册表（来源 / 播客频道 / 公司档案）
 * 同步进 Supabase，作为采集流水线的「来源目录」与「公司档案」底座。
 * 表结构为 jsonb（{id, data}），与 supabase/schema.sql 一致。
 *
 * 运行：npm run pipeline:seed   （需先配置 .env.local 中的 SUPABASE_*）
 */
import "./lib/env"; // 必须在最前：加载 .env.local 中的密钥
import { getSupabaseAdmin } from "./lib/supabase";
import { SOURCE_REGISTRY } from "../src/lib/data/sources.registry";
import { PODCAST_CHANNELS } from "../src/lib/data/podcasts.registry";
import { COMPANY_REGISTRY } from "../src/lib/data/companies.registry";

/** 按 id 去重，保留 live:true 的版本（注册表存在 jiemian/ifanr/geekpark 重复定义） */
function dedupeById<T extends { id: string; live?: boolean }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const r of rows) {
    const prev = map.get(r.id);
    if (!prev || (r.live && !prev.live)) map.set(r.id, r);
  }
  return [...map.values()];
}

async function main() {
  const sb = getSupabaseAdmin();

  // 1) Sources（jsonb：data = 完整 SourceIntel）
  const sources = dedupeById(SOURCE_REGISTRY as any[]).map((s: any) => ({ id: s.id, data: s }));
  const { error: e1 } = await sb.from("sources").upsert(sources, { onConflict: "id" });
  if (e1) throw e1;
  console.log(`✓ sources seeded: ${sources.length}`);

  // 2) Podcasts（jsonb：data = 频道对象）
  const podcasts = PODCAST_CHANNELS.map((p: any) => ({ id: p.id, data: p }));
  const { error: e2 } = await sb.from("podcasts").upsert(podcasts, { onConflict: "id" });
  if (e2) throw e2;
  console.log(`✓ podcasts seeded: ${podcasts.length}`);

  // 3) Companies（jsonb：data = 完整 dossier）
  const companies = COMPANY_REGISTRY.map((c: any) => ({ id: c.id, data: c }));
  const { error: e3 } = await sb.from("company_registry").upsert(companies, { onConflict: "id" });
  if (e3) throw e3;
  console.log(`✓ company_registry seeded: ${companies.length}`);

  console.log("Seed 完成。下一步：运行 npm run pipeline:ingest 抓取实时内容。");
}

main().catch((e) => {
  console.error("Seed 失败：", e.message);
  process.exit(1);
});
