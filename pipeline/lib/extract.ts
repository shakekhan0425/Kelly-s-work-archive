/**
 * 正文抽取：从 URL 或原始 HTML 提取标题 / 正文 / 作者 / 站点 / 头图。
 * 使用 @extractus/article-extractor（Readability 算法）。
 * 部署前需 npm install @extractus/article-extractor。
 */
import { createHash } from "node:crypto";

export interface Extracted {
  title: string;
  text: string;
  byline?: string | null;
  siteName?: string | null;
  image?: string | null;
  length: number;
  contentHash: string;
}

// @ts-ignore optional dependency
import { extract } from "@extractus/article-extractor";

export async function extractFromUrl(url: string): Promise<Extracted> {
  // @ts-ignore optional dependency
  const art = await extract(url);
  return normalize(art, url);
}

export async function extractFromHtml(
  html: string,
  url?: string
): Promise<Extracted> {
  // @ts-ignore optional dependency
  const art = await extract(url ?? "https://example.com/", { html });
  return normalize(art, url);
}

function normalize(art: any, url?: string): Extracted {
  const text: string = art?.text ?? "";
  const title: string = art?.title ?? "";
  return {
    title,
    text,
    byline: art?.author ?? null,
    siteName: art?.site_name ?? null,
    image: art?.image ?? null,
    length: text.length,
    contentHash: createHash("sha256").update(text).digest("hex"),
  };
}

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
