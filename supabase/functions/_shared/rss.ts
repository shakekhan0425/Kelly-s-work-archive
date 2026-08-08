// 共享：极简 RSS 解析（无外部依赖，适配 Deno Edge）
// 仅解析 <item> 关键字段；对微信 RSS 的 content:encoded / dc:creator 友好。

export interface RssItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  author?: string;
  content?: string; // content:encoded 或 description
  description?: string;
  heroImage?: string;
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function tag(block: string, name: string): string | undefined {
  // 兼容 namespaced：content:encoded
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  return decode(m[1].trim());
}

export function parseRss(xml: string): { items: RssItem[]; feedTitle?: string } {
  const items: RssItem[] = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const b of blocks) {
    const link = tag(b, "link") || tag(b, "guid");
    const content =
      tag(b, "content:encoded") || tag(b, "description") || tag(b, "content") || "";
    const hero = (content.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1];
    items.push({
      title: tag(b, "title"),
      link,
      guid: tag(b, "guid"),
      pubDate: tag(b, "pubDate"),
      author: tag(b, "dc:creator") || tag(b, "author") || tag(b, "creator"),
      content,
      description: tag(b, "description"),
      heroImage: hero,
    });
  }
  const ft = (xml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  return { items, feedTitle: ft ? decode(ft) : undefined };
}

export async function fetchRss(url: string, timeoutMs = 12000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WechatArchiveBot/1.0)" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
