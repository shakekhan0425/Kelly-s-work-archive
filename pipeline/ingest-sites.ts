/**
 * 中文营销/美妆站 HTML 列表页爬虫 —— 把真实文章灌进 Supabase `signals` 表。
 * 适用对象：无 RSS、但列表页能稳定抓到文章链接的 open 站点
 *   （Morketing / 品牌星球 / TOPMarketing / 聚美丽 等）。
 * 页面运行时直读 Supabase，灌完立即上线。
 *
 * 运行：tsx pipeline/ingest-sites.ts
 */
import "./lib/env";
import { createHash } from "node:crypto";
import { SOURCE_REGISTRY } from "../src/lib/data/sources.registry";
import type { ArchiveItem, SourceIntel } from "../src/lib/data/types";
import { cleanText, cleanTitle } from "../src/lib/data/content-clean";
import {
  sb, regById, fetchText, abs, meta, extractBody, classify, wordCountZh, buildBlocks, slugify, draftKnowledge, tagBrands, hostOf,
  slice, isCli, type RunOpts, type RunReport,
} from "./lib/ingest-shared";

const MAX_PER_SITE = 14;

interface SiteCfg { id: string; home: string; re: RegExp; category: string; }
const SITES: SiteCfg[] = [
  { id: "morketing", home: "https://www.morketing.com/", re: /\/detail\/\d+/, category: "Marketing / 商业" },
  { id: "brandstar", home: "https://www.brandstar.com.cn/", re: /\/news\/\d+/, category: "Marketing / 新消费" },
  { id: "topmarketing", home: "https://www.itopmarketing.com/", re: /\/info\d+/, category: "Marketing / 广告" },
  { id: "jumeili", home: "https://www.jumeili.cn/", re: /\/news\/view\/\d+\.html/, category: "Beauty / 营销" },
  { id: "pinguan", home: "https://www.pinguan.com/", re: /\/article\/content\/\d+/, category: "Beauty / 行业" },
];

async function scrape(cfg: SiteCfg): Promise<{ n: number; skip: number; err?: string }> {
  const reg = regById(cfg.id) as SourceIntel | undefined;
  const sourceName = reg?.name ?? cfg.id;
  let home: string;
  try {
    home = await fetchText(cfg.home);
  } catch (e) {
    return { n: 0, skip: 0, err: (e as Error).message };
  }
  const hrefs = [...new Set([...home.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))]
    .filter((u) => cfg.re.test(u))
    .map((u) => abs(u, cfg.home))
    .filter((u) => u.startsWith("http"));
  const links = [...new Set(hrefs)].slice(0, MAX_PER_SITE);
  let n = 0, skip = 0;
  for (const url of links) {
    try {
      const h = await fetchText(url);
      const title = cleanTitle(meta(h, "og:title") || (h.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "")
        .replace(/\s*[-|_|｜].*$/, "")
        .trim();
      const hero = meta(h, "og:image");
      const body = extractBody(h);
      const text = body || cleanText(meta(h, "og:description") || meta(h, "description") || "");
      if (text.length < 200 || !title) { skip++; continue; }
      const wc = wordCountZh(text);
      const brands = tagBrands(title + body);
      const id = "sig_" + createHash("sha256").update(url).digest("hex").slice(0, 20);
      const { data: ex } = await sb().from("signals").select("id").eq("id", id).maybeSingle();
      if (ex) { skip++; continue; }
      const { signal_category, content_scope, topics } = classify(title, text);
      const item: ArchiveItem = {
        id, slug: slugify(title), title, url, summary: cleanText(meta(h, "og:description") || text.slice(0, 140)).slice(0, 280),
        hero, byline: "", publishedAt: new Date().toISOString(), sourceId: cfg.id, sourceName,
        sourceSite: hostOf(url), lang: "zh", category: cfg.category,
        topics: topics.length ? topics : ["marketing"], brands,
        blocks: buildBlocks(text), wordCount: wc, readMinutes: Math.max(1, Math.round(wc / 300)),
        thin: wc < 800, knowledge: draftKnowledge(),
      };
      const { error } = await sb().from("signals").upsert({ id, data: item }, { onConflict: "id" });
      if (error) { console.log(`    ✗ ${cfg.id} 写库失败: ${error.message}`); skip++; }
      else n++;
    } catch {
      skip++;
    }
  }
  return { n, skip };
}

export async function runSitesIngest(opts: RunOpts = {}): Promise<RunReport> {
  const t0 = Date.now();
  const budget = opts.budgetMs ?? Number.POSITIVE_INFINITY;
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); (opts.log ?? console.log)(s); };

  const sites = slice(SITES, opts.offset ?? 0, opts.limit);
  log(`[ingest-sites] 待爬中文站 ${sites.length}/${SITES.length} 个`);
  let added = 0, processed = 0, truncated = false;
  for (const cfg of sites) {
    if (Date.now() - t0 > budget) { truncated = true; log(`  ⏱ 达到时间预算，剩余 ${sites.length - processed} 站留待下轮`); break; }
    const r = await scrape(cfg);
    processed++;
    if (r.err) log(`  ✗ ${cfg.id}: 抓取失败 ${r.err}`);
    else log(`  ✓ ${cfg.id}: new=${r.n} skip=${r.skip}`);
    added += r.n;
    if (r.n > 0) {
      try { await sb().from("sources").update({ is_active: true }).eq("id", cfg.id); } catch { /* ignore */ }
    }
  }
  log(`✅ 中文站抓取完成，新增 signals=${added}`);
  return { added, processed, of: sites.length, truncated, ms: Date.now() - t0, lines };
}

if (isCli("ingest-sites")) {
  const budgetMs = Number(process.env.INGEST_BUDGET_MS) || 480_000; // 默认 8 分钟
  runSitesIngest({ budgetMs }).catch((e) => { console.error("失败：", e.message); process.exit(1); });
}
