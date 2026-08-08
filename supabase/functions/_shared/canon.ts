// 共享：微信 URL 规范化与去重键提取
// 设计要点（STEP 3 幂等要求）：
//   - canonical_url 首选：从 mp.weixin.qq.com/s/<token> 提取稳定 token，剔除 chksm/scene/sn 等追踪参数
//   - external_id 回退：使用同一 token；若无则用 guid 或链接本身

/** 提取微信文章 token（/s/ 之后的稳定片段） */
export function extractArticleToken(url: string): string | null {
  if (!url) return null;
  const m = url.match(/\/s\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

/** 规范化为稳定文章地址（去除 Query 追踪参数） */
export function canonicalizeWechatUrl(url: string): string {
  const t = extractArticleToken(url);
  if (t) return `https://mp.weixin.qq.com/s/${t}`;
  // 非标准链接：去掉查询串，仅保留 path
  const clean = url.split("#")[0].split("?")[0];
  return clean;
}

/** 外部唯一键：token 优先，否则 guid / canonical */
export function externalIdOf(url: string, guid?: string): string {
  const t = extractArticleToken(url);
  if (t) return t;
  if (guid) return guid.trim();
  return canonicalizeWechatUrl(url);
}

/** 来源名归一（去除 @ 前缀等噪音） */
export function normalizeSourceName(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const n = raw.replace(/^@/, "").trim();
  return n.length ? n : fallback;
}

/** 从 HTML/微信内容中抽取第一张图片作为头图 */
export function firstImage(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

/** 去除 HTML 标签，得到纯文本（用于 summary / 落库 content） */
export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** 截断到指定字符数（中英文混排） */
export function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}
