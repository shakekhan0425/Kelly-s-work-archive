/**
 * 多源 RSS/Atom 实时抓取（无 LLM，规则分类）—— 直接写 Supabase `signals`。
 * 用 rss-parser 解析（兼容 RSS 2.0 / Atom / CDATA / 命名空间），比手写正则稳健。
 * 页面运行时直读 Supabase，灌完立即在线上生效（无需重新构建）。
 *
 * 运行：tsx pipeline/ingest-web.ts
 */
import "./lib/env";
import { createHash } from "node:crypto";
import { extract } from "@extractus/article-extractor";
import { SOURCE_REGISTRY } from "../src/lib/data/sources.registry";
import type { ArchiveItem, SourceIntel } from "../src/lib/data/types";
import { cleanText, cleanTitle } from "../src/lib/data/content-clean";
import {
  sb, fetchText, stripTags, classify, wordCountZh, buildBlocks, slugify, draftKnowledge, hostOf, extractBody, meta,
  feedCandidates, fetchFeedXml, slice, isCli, withTimeout,
  type RunOpts, type RunReport,
} from "./lib/ingest-shared";

const MAX_PER_FEED = 14;

/* 原生 RSS/Atom 解析，替代 rss-parser。
 * 原因：rss-parser 是 CJS 重依赖，静态打进路由包会让 Vercel 的 webpack 构建失败
 * （本地 Turbopack 不报错）。这里只抽取抓取所需字段，足够稳健且零额外依赖。 */
function cdata(s: string): string {
  return s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}
function tagText(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? cdata(m[1]) : undefined;
}
function attr(block: string, tagName: string, attrName: string): string | undefined {
  const m = block.match(new RegExp(`<${tagName}\\b[^>]*\\b${attrName}="([^"]*)"`, "i"));
  return m ? m[1] : undefined;
}
interface RawItem {
  title?: string;
  link?: string;
  guid?: string;
  enclosure?: { url?: string };
  "content:encoded"?: string;
  content?: string;
  summary?: string;
  creator?: string;
  isoDate?: string;
  pubDate?: string;
}
function parseFeed(xml: string): { items: RawItem[] } {
  const items: RawItem[] = [];
  const pushBlock = (b: string, atom: boolean) => {
    const link = atom ? attr(b, "link", "href") || tagText(b, "link") : tagText(b, "link");
    const encUrl = atom
      ? attr(b, "link", "href") && /rel=["']enclosure["']/i.test(b)
        ? attr(b, "link", "href")
        : undefined
      : attr(b, "enclosure", "url");
    items.push({
      title: tagText(b, "title"),
      link,
      guid: atom ? tagText(b, "id") : tagText(b, "guid"),
      enclosure: encUrl ? { url: encUrl } : undefined,
      "content:encoded": atom ? undefined : tagText(b, "content:encoded"),
      content: tagText(b, "content"),
      summary: tagText(b, "summary") || tagText(b, "description"),
      creator: atom
        ? tagText(b, "name") || tagText(b, "author")
        : tagText(b, "dc:creator") || tagText(b, "creator"),
      isoDate: atom ? tagText(b, "updated") || tagText(b, "published") : tagText(b, "pubDate"),
      pubDate: atom ? tagText(b, "published") || tagText(b, "updated") : tagText(b, "pubDate"),
    });
  };
  let m: RegExpExecArray | null;
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  while ((m = itemRe.exec(xml))) pushBlock(m[0], false);
  const entryRe = /<entry\b[\s\S]*?<\/entry>/gi;
  while ((m = entryRe.exec(xml))) pushBlock(m[0], true);
  return { items };
}

async function ingestRss(reg: SourceIntel): Promise<{ n: number; skip: number; err?: string; via?: string }> {
  if (!reg.rss) return { n: 0, skip: 0 };
  // 依次尝试候选（rsshub:// 会展开成多个镜像），任一成功即用
  let xml: string | null = null;
  let via = "";
  for (const cand of feedCandidates(reg.rss)) {
    xml = await fetchFeedXml(cand);
    if (xml) { via = cand; break; }
  }
  if (!xml) return { n: 0, skip: 0, err: "feed 不可达或非 RSS/Atom" };
  let feed;
  try {
    feed = parseFeed(xml);
  } catch (e) {
    return { n: 0, skip: 0, err: "解析失败 " + (e as Error).message };
  }
  const items = (feed.items || []).slice(0, MAX_PER_FEED);
  let n = 0, skip = 0;
  const lang = reg.lang === "zh" ? "zh" : "en";
  for (const it of items) {
    // 部分播客 feed（ART19 等）不带 <link>，退回 guid / enclosure 音频地址，否则整源被判为空。
    const guid = typeof it.guid === "string" ? it.guid : "";
    const url = (
      it.link ||
      (/^https?:\/\//.test(guid) ? guid : "") ||
      it.enclosure?.url ||
      ""
    ).trim();
    const title = cleanTitle(it.title || "");
    if (!title || !url) { skip++; continue; }
    const id = "sig_" + createHash("sha256").update(url).digest("hex").slice(0, 20);
    const { data: ex } = await sb().from("signals").select("id").eq("id", id).maybeSingle();
    if (ex) { skip++; continue; }
    let body = stripTags(it["content:encoded"] || it.content || it.summary || "");
    let hero = "";
    if (body.length < 300) {
      // article-extractor 内部 fetch 不响应 AbortController，必须套硬超时防止挂死
      try {
        const art = await withTimeout(extract(url), 12_000, "article-extract");
        if (art?.text) body = art.text;
        if (art?.image) hero = art.image;
      } catch { /* ignore */ }
      if (body.length < 300) {
        try {
          const h = await withTimeout(fetchText(url), 12_000, "fetch-detail");
          const b2 = extractBody(h ?? "");
          if (b2.length > body.length) {
            body = b2;
            if (!hero) hero = meta(h ?? "", "og:image");
          }
        } catch { /* ignore */ }
      }
    }
    const text = body || (it.summary ? stripTags(it.summary) : "") || "";
    if (text.length < 150) { skip++; continue; }
    const { signal_category, content_scope, topics } = classify(title, text);
    const wc = wordCountZh(text);
    const item: ArchiveItem = {
      id, slug: slugify(title), title, url, summary: cleanText(it.summary ? stripTags(it.summary) : text.slice(0, 140)).slice(0, 280),
      hero, byline: it.creator || "", publishedAt: it.isoDate || it.pubDate || new Date().toISOString(),
      sourceId: reg.id, sourceName: reg.name, sourceSite: hostOf(url), lang,
      category: reg.category, topics, brands: [], blocks: buildBlocks(text),
      wordCount: wc, readMinutes: Math.max(1, Math.round(wc / 300)),
      thin: wc < 800, knowledge: draftKnowledge(),
    };
    const { error } = await sb().from("signals").upsert({ id, data: item }, { onConflict: "id" });
    if (error) { console.log(`    ✗ ${reg.id} 写库失败: ${error.message}`); skip++; }
    else n++;
  }
  return { n, skip, via };
}

/** 候选源：有 rss 且未被标记 restricted / paywall / login；按 id 去重防止重复抓取。 */
export function webFeeds(): SourceIntel[] {
  const open = SOURCE_REGISTRY.filter((s) => s.rss && s.accessMode === "open");
  return [...new Map(open.map((s) => [s.id, s])).values()];
}

export async function runWebIngest(opts: RunOpts = {}): Promise<RunReport> {
  const t0 = Date.now();
  const budget = opts.budgetMs ?? Number.POSITIVE_INFINITY;
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); (opts.log ?? console.log)(s); };

  const all = webFeeds();
  const feeds = slice(all, opts.offset ?? 0, opts.limit);
  log(`[ingest-web] 待抓 RSS/Atom 源 ${feeds.length}/${all.length} 个`);

  let added = 0, processed = 0, truncated = false;
  for (const reg of feeds) {
    if (Date.now() - t0 > budget) { truncated = true; log(`  ⏱ 达到时间预算，剩余 ${feeds.length - processed} 源留待下轮`); break; }
    const r = await ingestRss(reg);
    processed++;
    if (r.err) log(`  ✗ ${reg.id}: 抓取失败 ${r.err}`);
    else log(`  ✓ ${reg.id}: new=${r.n} skip=${r.skip}`);
    added += r.n;
    if (r.n > 0) {
      try { await sb().from("sources").update({ is_active: true }).eq("id", reg.id); } catch { /* ignore */ }
    }
  }
  log(`✅ RSS 抓取完成，新增 signals=${added}`);
  return { added, processed, of: feeds.length, truncated, ms: Date.now() - t0, lines };
}

if (isCli("ingest-web")) {
  const budgetMs = Number(process.env.INGEST_BUDGET_MS) || 900_000; // 默认 15 分钟
  runWebIngest({ budgetMs }).catch((e) => { console.error("失败：", e.message); process.exit(1); });
}
