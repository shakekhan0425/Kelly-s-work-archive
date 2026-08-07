/**
 * @extractus/article-extractor 自带 index.d.ts，但其 package.json 的 "exports"
 * 字段没有声明 types 入口，在 moduleResolution: "bundler" 下解析不到。
 * 这里补一个最小声明，避免 next build 时的 TS7016。
 */
declare module "@extractus/article-extractor" {
  export interface ArticleData {
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    author?: string;
    favicon?: string;
    content?: string;
    text?: string;
    published?: string;
    source?: string;
    links?: string[];
    ttr?: number;
    type?: string;
  }
  export function extract(
    input: string,
    parserOptions?: Record<string, unknown>,
    fetchOptions?: Record<string, unknown>
  ): Promise<ArticleData | null>;
  export function extractFromHtml(html: string, url?: string): Promise<ArticleData | null>;
}
