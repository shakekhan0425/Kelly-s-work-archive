/**
 * 采集编排（§2.4 数据流）：
 *   Source(代码注册表 SOURCE_REGISTRY) → RSS/Web → Content Extraction → Deduplication
 *   → AI Structured Analysis → DB(signals / cases 表)
 *
 * 与读路径统一：写入 signals / cases 表的 {id, data} 形状（data 即 ArchiveItem），
 * 网站 live.ts 直接读取这两张表，实现「采集即更新、无需本地文件中间层」，
 * 适配 Vercel serverless（运行时文件系统只读）。
 *
 * 只处理真实抓取数据；任何一步失败都记录到 ingestion_runs，不中断整体。
 */
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractFromUrl, type Extracted } from "./extract";
import { checkDuplicate, recordDedup } from "./dedupe";
import { analyzeArticle, classifyArticle } from "./analyze";
import type { ArticleRecord, Block } from "./types";
import { SOURCE_REGISTRY } from "../../src/lib/data/sources.registry";
import type { ArchiveItem, SourceIntel } from "../../src/lib/data/types";
import { cleanArchiveItem, cleanText } from "../../src/lib/data/content-clean";

const FETCH_TIMEOUT = 15_000;

/** kind → 目标读表 */
const TABLE_BY_KIND: Record<"signal" | "case", string> = { signal: "signals", case: "cases" };

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "item";
}
function hostOf(url?: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

/** ArticleRecord(snake_case, pipeline) → ArchiveItem(camelCase, 前端读路径)。
 *  vertical / signalCategory / contentScope 由前端在读取时从 topics+title+summary 派生，无需存储。 */
function toArchiveItem(r: ArticleRecord): ArchiveItem {
  const lang = r.language || "zh";
  const wc = r.word_count || 0;
  const blocks = (Array.isArray(r.blocks) ? r.blocks : []) as Block[];
  return cleanArchiveItem({
    id: r.id,
    slug: slugify(r.title),
    title: r.title,
    url: r.original_url || "",
    summary: r.summary || "",
    hero: r.hero || "",
    byline: r.author || "",
    publishedAt: r.published_at || new Date().toISOString(),
    sourceId: r.source_id || "",
    sourceName: r.source_name || "",
    sourceSite: hostOf(r.original_url),
    lang,
    category: r.category || r.content_scope || "",
    topics: r.topics || [],
    brands: r.brands || [],
    blocks,
    wordCount: wc,
    readMinutes: Math.max(1, Math.round(wc / (lang === "zh" ? 300 : 220))),
    thin: !!r.thin || wc < 800,
    knowledge: r.knowledge as ArchiveItem["knowledge"],
  });
}

function toRow(r: ArticleRecord) {
  return { id: r.id, data: toArchiveItem(r) };
}

export interface FeedItem {
  title: string;
  url: string;
  publishedAt?: string | null;
  summary?: string | null;
  content?: string | null; // feed 自带全文（content:encoded / Atom content），真实原文
  guid?: string | null;
}

/** 从一段 XML 片段里取某个标签的原文（保留 CDATA / 嵌套标签），不剥离 HTML。 */
function pickRaw(b: string, tag: string): string {
  const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (m) return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
  return "";
}

/** 极简 RSS 2.0 / Atom 解析（无额外依赖）。生产可替换为 fast-xml-parser。 */
export function parseFeed(xml: string, sourceHome?: string): FeedItem[] {
  const items: FeedItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const b of blocks) {
    const pick = (tag: string): string => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\S]*?)<\\/${tag}>`, "i"));
      if (m) return stripTags(m[1]).trim();
      const m2 = b.match(new RegExp(`<${tag}[^>]*>([\\s\S]*?)<\\/${tag}>`, "i"));
      return m2 ? stripTags(m2[1]).trim() : "";
    };
    const linkMatch =
      b.match(/<link[^>]*href="([^"]+)"[^>]*\/>/i) ?? b.match(/<link>([\s\S]*?)<\/link>/i);
    const url = linkMatch ? (linkMatch[1] ?? linkMatch[2] ?? "").trim() : "";
    const title = pick("title");
    if (!title || !url) continue;
    const dateRaw = pick("pubDate") || pick("published") || pick("updated") || pick("dc:date");
    const content = pickRaw(b, "content:encoded") || pickRaw(b, "content") || "";
    const summary = pick("description") || pick("summary");
    items.push({
      title,
      url: absoluteUrl(url, sourceHome),
      publishedAt: dateRaw ? new Date(dateRaw).toISOString() : null,
      summary,
      content: content || null,
      guid: pick("guid") || url,
    });
  }
  return items;
}

function stripTags(s: string): string {
  return cleanText(s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
}

/** 把 feed 自带的 HTML 全文转成纯文本（去标签、压缩空白、解码实体）。 */
export function htmlToText(html: string): string {
  return cleanText(html);
}
function absoluteUrl(u: string, base?: string): string {
  if (/^https?:\/\//.test(u)) return u;
  if (base) {
    try {
      return new URL(u, base).toString();
    } catch {
      /* ignore */
    }
  }
  return u;
}

/** 文本切分为正文块（与前端 Block 类型对齐）。 */
export function buildBlocks(text: string): Block[] {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const blocks: Block[] = [];
  for (const p of paras) {
    if (p.length < 40 && !p.includes("。") && !p.includes(".")) {
      blocks.push({ type: "heading", level: 2, text: p });
    } else {
      blocks.push({ type: "para", text: p });
    }
  }
  return blocks;
}

export function wordCount(text: string, lang: string): number {
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

async function fetchText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 WORK-Archive-Bot/1.0" },
      signal: ctrl.signal,
    });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** 处理单个来源（取自代码注册表）：拉取 feed → 逐条抽取/去重/萃取/入库。 */
export async function ingestFeed(
  reg: SourceIntel,
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<void> {
  if (!reg.rss) throw new Error(`来源 ${reg.id} 无 RSS 配置`);
  const runId = crypto.randomUUID();
  let itemsFetched = 0,
    itemsNew = 0,
    itemsDeduped = 0,
    itemsFailed = 0;

  await sb.from("ingestion_runs").insert({ id: runId, source_id: reg.id, status: "running" });

  try {
    const xml = await fetchText(reg.rss);
    const items = parseFeed(xml, reg.url);
    itemsFetched = items.length;
    const lang = reg.lang === "both" ? "en" : reg.lang;

    for (const it of items) {
      try {
        const dup = await checkDuplicate(it.url, it.title, sb);
        if (dup.isDuplicate) {
          itemsDeduped++;
          continue;
        }

        // 策略：优先用 feed 自带的真实全文（content:encoded），不抓反爬文章页。
        // 仅当 feed 全文过短（<300 字）时，才回退到 article-extractor 抓正文。
        let ext: Extracted;
        const feedText = it.content ? htmlToText(it.content) : "";
        if (feedText.length >= 300) {
          ext = {
            title: it.title,
            text: feedText,
            byline: null,
            siteName: reg.name,
            image: null,
            length: feedText.length,
            contentHash: createHash("sha256").update(feedText).digest("hex"),
          };
        } else {
          try {
            ext = await extractFromUrl(it.url);
          } catch {
            ext = {
              title: it.title,
              text: feedText || it.summary || "",
              byline: null,
              siteName: reg.name,
              image: null,
              length: (feedText || it.summary || "").length,
              contentHash: createHash("sha256").update(feedText || it.summary || "").digest("hex"),
            };
          }
        }

        const bodyText = ext.text || it.summary || "";
        if (bodyText.length < 150) {
          // 正文确实拿不到：如实存摘要，标记档案未完成，绝不编造。
          itemsFailed++;
          await recordDedup(crypto.randomUUID(), it.url, it.title, "hash", sb);
          console.warn(`  ⚠ 正文不足，跳过：${it.title}`);
          continue;
        }

        const [card, cls] = await Promise.all([
          analyzeArticle({
            title: ext.title || it.title,
            text: bodyText,
            author: ext.byline,
            sourceName: reg.name,
            url: it.url,
            publishedAt: it.publishedAt,
          }),
          classifyArticle(ext.title || it.title, bodyText),
        ]);
        const wc = wordCount(bodyText, lang);
        const id = crypto.randomUUID();
        const record: ArticleRecord = {
          id,
          kind: "signal",
          title: ext.title || it.title,
          author: ext.byline,
          source_id: reg.id,
          source_name: reg.name,
          published_at: it.publishedAt ?? new Date().toISOString(),
          language: lang,
          hero: ext.image,
          summary: it.summary || bodyText.slice(0, 120),
          blocks: buildBlocks(bodyText),
          word_count: wc,
          category: reg.category,
          topics: cls.topics,
          brands: card.originalIntel?.brands ?? [],
          vertical: reg.category,
          signal_category: cls.signal_category,
          content_scope: cls.content_scope,
          thin: wc < 800,
          knowledge: card,
          original_url: it.url,
        };
        await sb.from(TABLE_BY_KIND[record.kind]).upsert(toRow(record), { onConflict: "id" });
        await recordDedup(id, it.url, it.title, "hash", sb);
        itemsNew++;
      } catch (e) {
        itemsFailed++;
        console.error(`  ✗ ${it.title}:`, (e as Error).message);
      }
    }

    await sb.from("ingestion_runs").update({
      finished_at: new Date().toISOString(),
      items_fetched: itemsFetched,
      items_new: itemsNew,
      items_deduped: itemsDeduped,
      items_failed: itemsFailed,
      status: itemsFailed > 0 && itemsNew === 0 ? "failed" : itemsFailed > 0 ? "partial" : "success",
    }).eq("id", runId);
    console.log(
      `✓ ${reg.id}: fetched=${itemsFetched} new=${itemsNew} deduped=${itemsDeduped} failed=${itemsFailed}`
    );
  } catch (e) {
    await sb.from("ingestion_runs").update({
      finished_at: new Date().toISOString(),
      items_fetched: itemsFetched,
      items_new: itemsNew,
      items_deduped: itemsDeduped,
      items_failed: itemsFailed,
      status: "failed",
      error: (e as Error).message,
    }).eq("id", runId);
    console.error(`✗ ingestFeed ${reg.id} failed:`, (e as Error).message);
  }
}

/** 按 sourceId 采集（兼容 cli 旧调用）。 */
export async function ingestSource(
  sourceId: string,
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<void> {
  const reg = SOURCE_REGISTRY.find((s) => s.id === sourceId);
  if (!reg) throw new Error(`来源 ${sourceId} 未在 SOURCE_REGISTRY 注册`);
  await ingestFeed(reg, sb);
}

/** 全量采集所有 open 且有 RSS 的来源。 */
export async function ingestAll(
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<void> {
  const feeds = SOURCE_REGISTRY.filter((s) => s.rss && s.accessMode === "open");
  console.log(`[ingest] 待采集来源 ${feeds.length} 个`);
  for (const reg of feeds) {
    try {
      await ingestFeed(reg, sb);
    } catch (e) {
      console.error(`[ingest] 跳过 ${reg.id}:`, (e as Error).message);
    }
  }
}

/** 单篇网页直接入库（供公众号剪藏 / Newsletter 导入复用）。 */
export async function ingestExtracted(
  ext: Extracted,
  meta: {
    sourceId: string;
    sourceName: string;
    url: string;
    publishedAt?: string | null;
    kind?: "signal" | "case";
  },
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<string> {
  const dup = await checkDuplicate(meta.url, ext.title, sb);
  if (dup.isDuplicate) return dup.existingId as string;

  const [card, cls] = await Promise.all([
    analyzeArticle({
      title: ext.title,
      text: ext.text,
      author: ext.byline,
      sourceName: meta.sourceName,
      url: meta.url,
      publishedAt: meta.publishedAt,
    }),
    classifyArticle(ext.title, ext.text),
  ]);
  const id = crypto.randomUUID();
  const wc = wordCount(ext.text, "zh");
  const kind = meta.kind ?? "signal";
  const record: ArticleRecord = {
    id,
    kind,
    title: ext.title,
    author: ext.byline,
    source_id: meta.sourceId,
    source_name: meta.sourceName,
    published_at: meta.publishedAt ?? new Date().toISOString(),
    language: "zh",
    hero: ext.image,
    summary: ext.text.slice(0, 120),
    blocks: buildBlocks(ext.text),
    word_count: wc,
    category: cls.content_scope,
    topics: cls.topics,
    brands: card.originalIntel?.brands ?? [],
    content_scope: cls.content_scope,
    signal_category: cls.signal_category,
    thin: wc < 800,
    knowledge: card,
    original_url: meta.url,
  };
  await sb.from(TABLE_BY_KIND[kind]).upsert(toRow(record), { onConflict: "id" });
  await recordDedup(id, meta.url, ext.title, "hash", sb);
  return id;
}
