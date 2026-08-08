// Edge Function: process-wechat
// 处理流水线：RAW → EXTRACTED → ANALYZED → VERIFIED → PUBLISHED
//   - EXTRACTED：正文已在 ingest 阶段清洗落库
//   - ANALYZED ：调用 LLM 萃取结构化情报（无 key 则跳过，仍发布）
//   - VERIFIED / PUBLISHED：写回 wechat_articles.status，并 upsert 进 signals
// 只有 PUBLISHED 的内容进入 Desk / Signals / Recommendations（signals 表）。
import { getSupabase } from "../_shared/db.ts";
import { callLLM } from "../_shared/ai.ts";
import { stripHtml, truncate } from "../_shared/canon.ts";

const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

function authorized(req: Request): boolean {
  if (req.headers.get("x-cron-secret") === CRON_SECRET && CRON_SECRET) return true;
  const u = new URL(req.url);
  if (u.searchParams.get("secret") === CRON_SECRET && CRON_SECRET) return true;
  return false;
}

function toBlocks(content: string): any[] {
  const paras = (content || "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 10);
  return paras.map((t) => ({ type: "para", text: t }));
}

function toArchiveItem(a: any, ai: any) {
  const plain = stripHtml(a.content || "");
  const blocks = toBlocks(plain);
  const wordCount = plain.length;
  return {
    id: `wx-${a.external_id || a.id}`,
    slug: a.external_id || a.id,
    title: a.title,
    url: a.canonical_url || a.original_url,
    summary: ai?.summary || truncate(plain, 120),
    hero: a.hero_image || "",
    byline: a.author || a.source_name || "",
    publishedAt: a.published_at || a.created_at,
    sourceId: a.source_id,
    sourceName: a.source_name,
    sourceSite: "mp.weixin.qq.com",
    lang: "zh",
    category: ai?.industry || "WeChat / 公众号",
    topics: ai?.topic || [],
    brands: ai?.brand || [],
    blocks,
    wordCount,
    readMinutes: Math.max(1, Math.round(wordCount / 300)),
    thin: false,
    knowledge: ai && ai.summary
      ? {
          originalIntel: {
            keyFacts: ai.key_facts || [],
            brands: ai.brand || [],
            competitors: [],
            coreViewpoints: [],
          },
          industryAnalysis: { impact: {}, generated: true },
          marketingInsight: { takeaways: ai.marketing_insight ? [ai.marketing_insight] : [], generated: true },
          careerUsage: { generated: false },
          aiStatus: "live",
        }
      : undefined,
  };
}

async function run(supabase: any) {
  const { data: rows, error } = await supabase
    .from("wechat_articles")
    .select("*")
    .in("status", ["raw", "extracted", "analyzed"])
    .order("published_at", { ascending: false })
    .limit(20);
  if (error) throw error;

  const results: any[] = [];
  for (const a of rows ?? []) {
    try {
      const plain = stripHtml(a.content || "");
      let ai = a.ai || {};
      if (!ai.summary) {
        const llm = await callLLM(a.title, plain);
        if (llm) ai = { ...ai, ...llm };
      }
      // VERIFIED → PUBLISHED
      const { error: e } = await supabase
        .from("wechat_articles")
        .update({ ai, status: "published" })
        .eq("id", a.id);
      if (e) throw e;

      // 写入 signals（ArchiveItem 形状）→ 自动进入 Desk / Signals / Recommendations
      const item = toArchiveItem(a, ai);
      const { error: e2 } = await supabase
        .from("signals")
        .upsert({ id: item.id, data: item }, { onConflict: "id" });
      if (e2) console.error("[process] signals upsert err:", e2.message);

      results.push({ id: a.id, title: a.title, status: "published" });
    } catch (e: any) {
      // 失败则停在 analyzed，保留 ai 以便重试
      await supabase
        .from("wechat_articles")
        .update({ status: "analyzed" })
        .eq("id", a.id);
      results.push({ id: a.id, error: String(e?.message || e) });
    }
  }
  return { processed: results.length, results };
}

Deno.serve(async (req: Request) => {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });
  try {
    const supabase = getSupabase();
    const result = await run(supabase);
    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
