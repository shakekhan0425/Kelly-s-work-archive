/**
 * 中文案例/美妆站 HTML 爬虫 —— 把真实 campaign 灌进 Supabase `cases` 表。
 * 用自写 <p> 段落提取（article-extractor 对这些站正文失效），og:image 做封面。
 * 正文 < 200 字则跳过（避免污染）。页面运行时直读 Supabase，灌完立即上线。
 *
 * 运行：tsx pipeline/ingest-cases.ts
 */
import "./lib/env";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "./lib/supabase";
import { SOURCE_REGISTRY } from "../src/lib/data/sources.registry";
import type { ArchiveItem, SourceIntel } from "../src/lib/data/types";
import { slice, isCli, type RunOpts, type RunReport } from "./lib/ingest-shared";

const FETCH_TIMEOUT = 18_000;
const MAX_PER_SITE = 12;

interface SiteCfg { id: string; home: string; re: RegExp; category: string; }
const SITES: SiteCfg[] = [
  { id: "adquan", home: "https://www.adquan.com/", re: /\/article\/\d+/, category: "Case / 案例" },
  { id: "digitaling-project", home: "https://www.digitaling.com/", re: /\/articles\/\d+\.html/, category: "Case / 案例" },
  { id: "jumeili", home: "https://www.jumeili.cn/", re: /\/news\/view\/\d+\.html/, category: "Beauty / 营销" },
  { id: "brandstar", home: "https://www.brandstar.com.cn/", re: /\/news\/\d+/, category: "Marketing / 新消费" },
  { id: "socialbeta-campaign", home: "https://socialbeta.com/", re: /\/article\/\d+/, category: "Case / 案例" },
];

const BRAND_KW = ["欧莱雅","珀莱雅","完美日记","花西子","薇诺娜","华熙","润百颜","巨子","可复美","毛戈平","雅诗兰黛","兰蔻","欧珑","资生堂","宝洁","联合利华","抖音","小红书","字节","快手","淘宝","天猫","京东","小米","华为","苹果","耐克","阿迪","lululemon","喜茶","瑞幸","元气森林","星巴克","麦当劳","肯德基","优衣库","zara","shein","蔚来","理想","小鹏","特斯拉","霸王茶姬","名创优品","蕉内","ubras","三顿半","认养一头牛","观夏","闻献","moody","colorkey","至本","溪木源","逐本","effortless","blankme"];

function abs(u: string, base: string): string {
  try { return new URL(u, base).toString(); } catch { return u; }
}
async function fetchText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 WORK-Archive-Bot/1.0" }, signal: ctrl.signal });
    return await res.text();
  } finally { clearTimeout(t); }
}
function meta(h: string, key: string): string {
  return (h.match(new RegExp(`(?:property|name)="${key}"[^>]+content="([^"]+)"`, "i")) || [])[1] || "";
}
function extractBody(h: string): string {
  const ps = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim())
    .filter((x) => x.length > 20);
  return ps.join("\n\n");
}
function wordCount(t: string): number {
  return (t.match(/[\u4e00-\u9fa5]/g) || []).length;
}
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "case";
}
function hostOf(url: string): string { try { return new URL(url).host; } catch { return ""; } }

async function scrapeSite(cfg: SiteCfg): Promise<{ n: number; skip: number }> {
  const reg = SOURCE_REGISTRY.find((s) => s.id === cfg.id) as SourceIntel | undefined;
  const sourceName = reg?.name ?? cfg.id;
  let home: string;
  try { home = await fetchText(cfg.home); } catch (e) { console.log(`  ✗ ${cfg.id} 首页抓取失败: ${(e as Error).message}`); return { n: 0, skip: 0 }; }
  const hrefs = [...new Set([...home.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))]
    .filter((u) => cfg.re.test(u))
    .map((u) => abs(u, cfg.home))
    .filter((u) => u.startsWith("http"));
  const links = [...new Set(hrefs)].slice(0, MAX_PER_SITE);
  let n = 0, skip = 0;
  for (const url of links) {
    try {
      const h = await fetchText(url);
      const title = (meta(h, "og:title") || (h.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/[|_|-].*$/, "").trim();
      const hero = meta(h, "og:image");
      const body = extractBody(h);
      const text = body || meta(h, "og:description") || meta(h, "description") || "";
      if (text.length < 200 || !title) { skip++; continue; }
      const wc = wordCount(text);
      const brands = [...new Set(BRAND_KW.filter((b) => (title + body).includes(b)))];
      const id = "case_" + createHash("sha256").update(url).digest("hex").slice(0, 20);
      const { data: ex } = await getSupabaseAdmin().from("cases").select("id").eq("id", id).maybeSingle();
      if (ex) { skip++; continue; }
      const item: ArchiveItem = {
        id, slug: slugify(title), title, url, summary: (meta(h, "og:description") || text.slice(0, 140)).slice(0, 280),
        hero, byline: "", publishedAt: new Date().toISOString(), sourceId: cfg.id, sourceName, sourceSite: hostOf(url),
        lang: "zh", category: cfg.category, topics: brands.length ? ["case", ...brands.slice(0, 2)] : ["case"], brands,
        blocks: text.split(/\n{2,}/).filter(Boolean).map((p) => ({ type: "para" as const, text: p })),
        wordCount: wc, readMinutes: Math.max(1, Math.round(wc / 300)), thin: wc < 800,
        knowledge: { aiStatus: "draft" } as ArchiveItem["knowledge"],
      };
      const { error } = await getSupabaseAdmin().from("cases").upsert({ id, data: item }, { onConflict: "id" });
      if (error) { console.log(`  ✗ ${cfg.id} 写库失败: ${error.message}`); skip++; }
      else n++;
    } catch (e) { skip++; }
  }
  if (n > 0) {
    try { await getSupabaseAdmin().from("sources").update({ is_active: true }).eq("id", cfg.id); } catch { /* ignore */ }
  }
  return { n, skip };
}

export async function runCasesIngest(opts: RunOpts = {}): Promise<RunReport> {
  const t0 = Date.now();
  const budget = opts.budgetMs ?? Number.POSITIVE_INFINITY;
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); (opts.log ?? console.log)(s); };

  const sites = slice(SITES, opts.offset ?? 0, opts.limit);
  log(`[ingest-cases] 待爬案例站 ${sites.length}/${SITES.length} 个`);
  let added = 0, processed = 0, truncated = false;
  for (const cfg of sites) {
    if (Date.now() - t0 > budget) { truncated = true; log(`  ⏱ 达到时间预算，剩余 ${sites.length - processed} 站留待下轮`); break; }
    const r = await scrapeSite(cfg);
    processed++;
    log(`  ✓ ${cfg.id}: new=${r.n} skip=${r.skip}`);
    added += r.n;
  }
  log(`✅ 案例抓取完成，新增 cases=${added}`);
  return { added, processed, of: sites.length, truncated, ms: Date.now() - t0, lines };
}

if (isCli("ingest-cases")) {
  const budgetMs = Number(process.env.INGEST_BUDGET_MS) || 480_000; // 默认 8 分钟
  runCasesIngest({ budgetMs }).catch((e) => { console.error("失败：", e.message); process.exit(1); });
}
