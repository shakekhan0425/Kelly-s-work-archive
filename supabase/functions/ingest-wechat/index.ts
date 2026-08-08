// Edge Function: ingest-wechat
// 读取 Wechat2RSS 的 RSS（按 wechat_sources.feed_url，或 BASE_URL/rss/<biz>），
// canonicalize → dedupe（幂等 upsert）→ 写 wechat_articles / 更新 wechat_sources / 写 sync_jobs。
//
// 鉴权：public 函数 + x-cron-secret 头（或 ?secret= 查询参数），由 Supabase Cron 调用。
import { getSupabase } from "../_shared/db.ts";
import { parseRss, fetchRss } from "../_shared/rss.ts";
import {
  canonicalizeWechatUrl,
  externalIdOf,
  normalizeSourceName,
  firstImage,
  stripHtml,
} from "../_shared/canon.ts";

const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

function authorized(req: Request): boolean {
  if (req.headers.get("x-cron-secret") === CRON_SECRET && CRON_SECRET) return true;
  const u = new URL(req.url);
  if (u.searchParams.get("secret") === CRON_SECRET && CRON_SECRET) return true;
  return false;
}

async function run(supabase: any) {
  const base = (Deno.env.get("WECHAT2RSS_BASE_URL") || "").replace(/\/$/, "");
  if (!base) throw new Error("WECHAT2RSS_BASE_URL 未配置");

  const { data: sources, error } = await supabase
    .from("wechat_sources")
    .select("*")
    .neq("status", "paused");
  if (error) throw error;

  const jobs: any[] = [];
  for (const src of sources ?? []) {
    const jobId = crypto.randomUUID();
    const started = new Date().toISOString();
    let status = "success";
    let errMsg: string | null = null;
    let found = 0;
    let inserted = 0;
    let updated = 0;

    try {
      const feedUrl = src.feed_url || `${base}/rss/${src.wechat_biz_id}`;
      const xml = await fetchRss(feedUrl);
      const { items } = parseRss(xml);
      found = items.length;

      for (const it of items) {
        const canonical = it.link ? canonicalizeWechatUrl(it.link) : (it.guid || "").split("?")[0];
        const ext = externalIdOf(it.link || "", it.guid);
        const sourceName = normalizeSourceName(src.name, "微信公众号");
        const hero = it.heroImage || firstImage(it.content || "");
        const plain = stripHtml(it.content || it.description || "");
        const publishedAt = it.pubDate ? new Date(it.pubDate).toISOString() : null;

        const row = {
          source_id: src.id,
          external_id: ext,
          canonical_url: canonical,
          title: it.title || "(无标题)",
          author: it.author || null,
          published_at: publishedAt,
          original_url: it.link,
          content: plain.slice(0, 60000),
          hero_image: hero,
          source_name: sourceName,
          wechat_biz_id: src.wechat_biz_id,
          status: "raw",
        };

        // 幂等：按 canonical_url 或 (source_id, external_id) 查重
        const { data: existing } = await supabase
          .from("wechat_articles")
          .select("id, status")
          .or(`canonical_url.eq.${canonical},and(source_id.eq.${src.id},external_id.eq.${ext})`)
          .maybeSingle();

        if (existing) {
          if (existing.status === "published") {
            updated++; // 已发布，不回写以免覆盖 AI 萃取
            continue;
          }
          const { error: e2 } = await supabase
            .from("wechat_articles")
            .update(row)
            .eq("id", existing.id);
          if (!e2) updated++;
        } else {
          const { error: e3 } = await supabase.from("wechat_articles").insert(row);
          if (!e3) inserted++;
        }
      }

      // 来源健康度聚合
      const { data: latest } = await supabase
        .from("wechat_articles")
        .select("published_at")
        .eq("source_id", src.id)
        .order("published_at", { ascending: false })
        .limit(1);
      const { count } = await supabase
        .from("wechat_articles")
        .select("id", { count: "exact", head: true })
        .eq("source_id", src.id);

      await supabase
        .from("wechat_sources")
        .update({
          status: "healthy",
          last_checked: started,
          last_successful_sync: new Date().toISOString(),
          latest_article_at: latest?.[0]?.published_at ?? null,
          articles_imported: count ?? 0,
          error_message: null,
        })
        .eq("id", src.id);
    } catch (e: any) {
      status = "failed";
      errMsg = String(e?.message || e);
      const reason = errMsg.includes("401") || errMsg.includes("403") || errMsg.includes("未登录")
        ? "auth_required"
        : errMsg.includes("429")
          ? "rate_limited"
          : "failed";
      await supabase
        .from("wechat_sources")
        .update({
          status: reason,
          last_checked: started,
          error_message: errMsg.slice(0, 500),
        })
        .eq("id", src.id);
    }

    await supabase.from("sync_jobs").insert({
      id: jobId,
      source_id: src.id,
      job_type: "ingest-wechat",
      started_at: started,
      finished_at: new Date().toISOString(),
      status: status === "success" ? (inserted + updated > 0 ? "success" : "success") : "failed",
      items_found: found,
      items_inserted: inserted,
      items_updated: updated,
      error_message: errMsg,
    });

    jobs.push({ source: src.id, found, inserted, updated, status });
  }

  return { jobs };
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
