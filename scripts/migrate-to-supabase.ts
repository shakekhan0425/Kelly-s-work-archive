/**
 * 将本地数据迁移到 Supabase（一次性 / 按需运行）。
 * 用法：
 *   1. 在 Supabase 后台执行 supabase/schema.sql 建表
 *   2. 配置环境变量：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY
 *   3. npm run migrate:supabase
 * 之后网站在检测到这两个变量时会自动从 Supabase 读取（实时更新）。
 */
import { config } from "dotenv";
import { resolve } from "node:path";
// Next.js 会自动读 .env.local，但 tsx 跑独立脚本不会；这里手动加载（与 pipeline/lib/env.ts 一致）
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { COMPANY_REGISTRY } from "../src/lib/data/companies.registry";

type Row = { id: string; data: unknown };

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ 缺少环境变量 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb: SupabaseClient = createClient(url, key, { auth: { persistSession: false } });

function loadJSON(rel: string): any {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), "utf8"));
}

async function upsertChunks(table: string, rows: Row[]): Promise<void> {
  const size = 500;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await sb.from(table).upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`upsert ${table} 失败: ${error.message}`);
  }
  console.log(`  ✓ ${table}: ${rows.length} 行`);
}

async function main() {
  const archive = loadJSON("data/archive.json");
  const episodes = loadJSON("src/lib/data/podcasts.episodes.json").episodes as Row["data"][];
  const caseStudies = loadJSON("src/lib/data/case-studies.json").cases as Row["data"][];

  console.log("开始迁移到 Supabase…");
  await upsertChunks(
    "signals",
    (archive.signals as Row["data"][]).map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "cases",
    (archive.cases as Row["data"][]).map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "podcasts",
    (archive.podcasts as Row["data"][]).map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "podcast_episodes",
    episodes.map((d: any) => ({ id: d.id, channel_id: d.channelId, data: d })),
  );
  await upsertChunks(
    "english",
    (archive.english as Row["data"][]).map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "sources",
    (archive.sources as Row["data"][]).map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "company_refs",
    (archive.companies as Row["data"][]).map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "company_registry",
    COMPANY_REGISTRY.map((d: any) => ({ id: d.id, data: d })),
  );
  await upsertChunks(
    "case_studies",
    caseStudies.map((d: any) => ({ id: d.id, data: d })),
  );

  const { error: metaErr } = await sb.from("meta").upsert({
    key: "archive",
    value: {
      generatedAt: archive.generatedAt,
      stats: archive.stats,
      topics: archive.topics ?? [],
    },
  });
  if (metaErr) throw new Error(`upsert meta 失败: ${metaErr.message}`);
  console.log("  ✓ meta: archive 元数据");

  console.log("✅ 迁移完成。网站已可连接 Supabase 实时读取。");
}

main().catch((e) => {
  console.error("✗ 迁移失败：", e.message);
  process.exit(1);
});
