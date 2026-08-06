/**
 * 去重：基于规范 URL hash + 标题归一模糊匹配（pg_trgm）。
 * 保证同一篇文章不会因为多次抓取 / 多源转发而重复入库（§2.11「新闻去重」）。
 */
import { getSupabaseAdmin } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export function canonicalHash(url?: string | null, title?: string | null): string {
  const base = (url ?? title ?? "").toLowerCase().trim();
  // 简单归一：去协议、去查询参数、去尾斜杠
  const norm = base
    .replace(/^https?:\/\//, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .replace(/\/+$/, "");
  return norm;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DedupResult {
  isDuplicate: boolean;
  existingId?: string | null;
  method?: "hash" | "fuzzy_title" | null;
}

export async function checkDuplicate(
  url: string | null | undefined,
  title: string,
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<DedupResult> {
  const hash = canonicalHash(url, title);

  // 1) 规范 URL / 标题 hash 精确匹配
  const { data: byHash } = await sb
    .from("dedup_log")
    .select("article_id")
    .eq("canonical_hash", hash)
    .limit(1);
  if (byHash && byHash.length > 0) {
    return { isDuplicate: true, existingId: byHash[0].article_id, method: "hash" };
  }

  // 2) 标题模糊匹配（相似度 > 0.85 视为重复）
  const titleNorm = normalizeTitle(title);
  const { data: byTitle } = await sb
    .from("dedup_log")
    .select("article_id, title_norm")
    .textSearch("title_norm", titleNorm, { type: "phrase" })
    .limit(20);
  if (byTitle && byTitle.length > 0) {
    for (const r of byTitle) {
      const sim = similarity(titleNorm, normalizeTitle(r.title_norm ?? ""));
      if (sim > 0.85) {
        return { isDuplicate: true, existingId: r.article_id, method: "fuzzy_title" };
      }
    }
  }
  return { isDuplicate: false };
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const setA = new Set(a.split(" "));
  const setB = new Set(b.split(" "));
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

export async function recordDedup(
  articleId: string,
  url: string | null | undefined,
  title: string,
  method: "hash" | "fuzzy_title",
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<void> {
  await sb.from("dedup_log").upsert(
    {
      article_id: articleId,
      canonical_hash: canonicalHash(url, title),
      source_url: url ?? null,
      title_norm: title,
      method,
    },
    { onConflict: "canonical_hash" }
  );
}
