/**
 * 初始化种子数据：把前端已有的真实注册表（94 来源 / 33 播客 / 51 公司）
 * 同步进 Supabase，作为采集流水线的「来源目录」与「公司档案」底座。
 * 不写入任何抓取内容（articles 由流水线采集填充）。
 *
 * 运行：npm run pipeline:seed   （需先配置 .env.local 中的 SUPABASE_*）
 */
import "./lib/env"; // 必须在最前：加载 .env.local 中的密钥
import { getSupabaseAdmin } from "./lib/supabase";
import { SOURCE_REGISTRY } from "../src/lib/data/sources.registry";
import { PODCAST_CHANNELS } from "../src/lib/data/podcasts.registry";
import { COMPANY_REGISTRY } from "../src/lib/data/companies.registry";

function authorityRank(a: string): number {
  switch (a) {
    case "S": return 5;
    case "A": return 5;
    case "B": return 4;
    case "C": return 3;
    default: return 3;
  }
}
function langOf(l: string): "zh" | "en" {
  return l === "en" ? "en" : "zh";
}
function accessModeOf(t: string): string {
  if (t === "RSS") return "rss";
  if (t === "API") return "api";
  return "web";
}

async function main() {
  const sb = getSupabaseAdmin();

  // 1) Sources
  const sources = SOURCE_REGISTRY.map((s: any) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    language: langOf(s.lang),
    region: s.region ?? "CN",
    authority: authorityRank(s.authority),
    access_mode: accessModeOf(s.type),
    homepage: s.url ?? null,
    feed_url: s.rss ?? null,
    newsletter: !!s.newsletter,
    paywall: !!s.paywall,
    why_follow: s.whyFollow ?? null,
    last_success_at: s.lastSuccessAt ?? null,
    is_active: !!s.live,
  }));
  const { error: e1 } = await sb.from("sources").upsert(sources, { onConflict: "id" });
  if (e1) throw e1;
  console.log(`✓ sources seeded: ${sources.length}`);

  // 2) Podcasts
  const podcasts = PODCAST_CHANNELS.map((p: any) => ({
    id: p.id,
    name: p.name,
    language: langOf(p.lang),
    region: p.group === "International" ? "Global" : "CN",
    rss_url: p.rss,
    homepage: p.site ?? null,
    description: p.desc ?? null,
  }));
  const { error: e2 } = await sb.from("podcasts").upsert(podcasts, { onConflict: "id" });
  if (e2) throw e2;
  console.log(`✓ podcasts seeded: ${podcasts.length}`);

  // 3) Companies
  const companies = COMPANY_REGISTRY.map((c: any) => ({
    id: c.id,
    name: c.name,
    overview: c.overview ?? null,
    timeline: c.timeline ?? [],
    business_model: c.businessModel ?? null,
    brand_portfolio: c.brandPortfolio ?? [],
    revenue_logic: c.revenueLogic ?? null,
    china_strategy: c.chinaStrategy ?? null,
    consumers: c.consumers ?? null,
    competitors: c.competitors ?? [],
    recent_moves: c.recentMoves ?? [],
    marketing_cases: c.marketingCases ?? [],
    culture: c.culture ?? null,
    target_roles: c.openRoles ?? [],
    interview_qs: c.interviewQuestions ?? [],
    my_fit: c.myFit ?? null,
    sources: c.sources ?? [],
  }));
  const { error: e3 } = await sb.from("companies").upsert(companies, { onConflict: "id" });
  if (e3) throw e3;
  console.log(`✓ companies seeded: ${companies.length}`);

  console.log("Seed 完成。下一步：配置 LLM 后运行 npm run pipeline:ingest");
}

main().catch((e) => {
  console.error("Seed 失败：", e.message);
  process.exit(1);
});
