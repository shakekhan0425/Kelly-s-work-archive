/**
 * 共享抓取工具：HTTP、正文抽取、分类、Supabase 客户端。
 * 供 ingest-web / ingest-sites / ingest-cases 复用。
 */
import "./env";
import { createClient } from "@supabase/supabase-js";
import { SOURCE_REGISTRY } from "../../src/lib/data/sources.registry";
import type { ArchiveItem, Block, SourceIntel } from "../../src/lib/data/types";

export function sb() {
  return createClient((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** 给任意 Promise 套一个硬超时。用于包裹不响应 AbortController 的库（如 article-extractor）。 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label = "operation"): Promise<T | null> {
  const t = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  return Promise.race([promise, t]).then((r) => {
    if (r === null) {
      if (process.env.DEBUG) console.log(`  ⏱ ${label} 超时（>${ms}ms）`);
      return null;
    }
    return r;
  });
}

export function regById(id: string): SourceIntel | undefined {
  return SOURCE_REGISTRY.find((s) => s.id === id);
}

export const FETCH_TIMEOUT = 18_000;
export async function fetchText(url: string, ua?: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 WORK-Archive-Bot/1.0",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: ctrl.signal,
    });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
/* ── RSS 抓取：AbortController 强制超时 + RSSHub 镜像故障转移 ──
 * 说明：rss-parser 的 parseURL 内建 timeout 对部分 WAF 主机不生效（TLS 握手挂死），
 * 会导致整条流水线卡住并产生「假阴性」。这里统一改用原生 fetch + AbortController。 */
export const RSSHUB_MIRRORS = [
  "https://rsshub.rssforever.com",
  "https://rsshub.ktachibana.party",
];
const FEED_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

/** 把 `rsshub://<path>` 展开为各镜像候选 URL；普通 URL 原样返回。 */
export function feedCandidates(rss: string): string[] {
  if (rss.startsWith("rsshub://")) {
    const path = rss.slice("rsshub://".length).replace(/^\/+/, "");
    return RSSHUB_MIRRORS.map((m) => `${m}/${path}`);
  }
  return [rss];
}

/** 抓取 feed XML；失败或非 feed 内容返回 null（绝不抛出、绝不挂死）。
 *  超时给到 20s：部分播客 feed（如 ART19）单个体积超过 3MB，12s 拉不完会误判为不可达。 */
export async function fetchFeedXml(url: string, ms = 20_000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": FEED_UA, accept: "application/rss+xml,application/xml,text/xml,*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const xml = await res.text();
    return /<item|<entry/i.test(xml) ? sanitizeXml(xml) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** 清洗不合法 XML：裸 `&`、未定义实体、XML 1.0 非法控制字符。
 *  典型症状：ifanr feed 报 "Invalid character in entity name"，导致整源解析失败。
 *  注意：CDATA 段内 `&` 是字面量，转义会污染正文，因此按 CDATA 切段后只处理段外。 */
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;
const BARE_AMP = /&(?!(?:#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);)/g;
export function sanitizeXml(xml: string): string {
  const parts = xml.replace(/^\uFEFF/, "").split(/(<!\[CDATA\[[\s\S]*?\]\]>)/);
  return parts
    .map((p, i) => (i % 2 === 1 ? p.replace(CTRL, "") : p.replace(CTRL, "").replace(BARE_AMP, "&amp;")))
    .join("");
}

export function abs(u: string, base: string): string {
  try {
    return new URL(u, base).toString();
  } catch {
    return u;
  }
}
export function hostOf(url?: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}
export function meta(h: string, key: string): string {
  return (h.match(new RegExp(`(?:property|name)="${key}"[^>]+content="([^"]+)"`, "i")) || [])[1] || "";
}
/** 取 <p> 正文段落（article-extractor 对中文站失效时的兜底）。 */
export function extractBody(h: string, max = 40): string {
  const ps = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim())
    .filter((x) => x.length > 20);
  return ps.slice(0, max).join("\n\n");
}
export function stripTags(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

/* ── 规则分类（不调 LLM） ── */
const SCOPE_KW: Record<string, string[]> = {
  consumer: ["消费", "社媒", "零售", "渠道", "短视频", "电商", "consumer", "shopper", "私域", "用户"],
  brand: ["品牌", "营销", "广告", "campaign", "内容", "增长", "brand", "marketing", "种草"],
  beauty: ["美妆", "护肤", "化妆品", "香水", "个护", "beauty", "skincare", "cosmetic", "彩妆"],
  luxury: ["奢侈", "时尚", "luxury", "fashion", "设计师", "腕表", "apparel", "高定"],
  business: ["商业", "财报", "并购", "ipo", "上市", "战略", "business", "earnings", "融资", "创投"],
  technology: ["ai", "人工智能", "科技", "数据", "算法", "大模型", "生成式", "technology", "saas"],
  advertising: ["广告", "代理商", "创意", "advertising", "agency", "户外", "投放"],
};
const CAT_KW: Record<string, string[]> = {
  "Consumer Trends": ["消费", "consumer", "趋势", "trend"],
  "Brand Moves": ["品牌", "brand", "联名", "升级"],
  "Campaign & Advertising": ["campaign", "广告", "创意", "投放"],
  "Industry Report": ["报告", "report", "研究", "数据"],
  "Company Moves": ["公司", "财报", "并购", "融资", "ipo", "人事"],
  "AI & Technology": ["ai", "人工智能", "大模型", "科技"],
};
export function classify(title: string, text: string): { signal_category: string; content_scope: string; topics: string[] } {
  const hay = (title + " " + text).toLowerCase();
  let scope = "business", scopeScore = 0;
  for (const [k, kws] of Object.entries(SCOPE_KW)) {
    const s = kws.reduce((n, kw) => (hay.includes(kw.toLowerCase()) ? n + 1 : n), 0);
    if (s > scopeScore) {
      scopeScore = s;
      scope = k;
    }
  }
  let cat = "Industry Report", catScore = 0;
  for (const [k, kws] of Object.entries(CAT_KW)) {
    const s = kws.reduce((n, kw) => (hay.includes(kw.toLowerCase()) ? n + 1 : n), 0);
    if (s > catScore) {
      catScore = s;
      cat = k;
    }
  }
  const topics = new Set<string>();
  if (scope !== "business") topics.add(scope);
  if (cat !== "Industry Report") topics.add(cat.split(" ")[0].toLowerCase());
  return { signal_category: cat, content_scope: scope, topics: [...topics].slice(0, 4) };
}
export function wordCountZh(text: string): number {
  return (text.match(/[一-龥]/g) || []).length;
}
export function buildBlocks(text: string): Block[] {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const blocks: Block[] = [];
  for (const p of paras) {
    if (p.length < 40 && !p.includes("。") && !p.includes(".")) blocks.push({ type: "heading", level: 2, text: p });
    else blocks.push({ type: "para", text: p });
  }
  return blocks;
}
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9一-龥]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}
export const BRAND_KW = [
  "欧莱雅", "珀莱雅", "完美日记", "花西子", "薇诺娜", "华熙", "润百颜", "巨子", "可复美", "毛戈平",
  "雅诗兰黛", "兰蔻", "欧珑", "资生堂", "宝洁", "联合利华", "抖音", "小红书", "字节", "快手",
  "淘宝", "天猫", "京东", "小米", "华为", "苹果", "耐克", "阿迪", "lululemon", "喜茶", "瑞幸",
  "元气森林", "星巴克", "麦当劳", "肯德基", "优衣库", "zara", "shein", "蔚来", "理想", "小鹏",
  "特斯拉", "霸王茶姬", "名创优品", "蕉内", "ubras", "三顿半", "认养一头牛", "观夏", "闻献",
  "moody", "colorkey", "至本", "溪木源", "逐本", "effortless", "blankme",
];
export function tagBrands(text: string): string[] {
  return [...new Set(BRAND_KW.filter((b) => text.includes(b)))];
}
export function draftKnowledge() {
  return { aiStatus: "draft" } as ArchiveItem["knowledge"];
}

/* ───────── 采集任务通用契约（本地 CLI 与 Vercel Cron 共用） ─────────
 * Serverless 有函数执行时长上限，全量跑约 4~5 分钟必被杀。
 * 所以每个 runner 都接受时间预算，超预算就干净收尾并如实上报进度，
 * 已写入的条目是逐条 upsert 的，中途停止不会脏库。 */
export interface RunOpts {
  /** 时间预算（毫秒）。跑满即停止，剩余源留给下一次调用。 */
  budgetMs?: number;
  /** 起始下标，用于分片轮转。 */
  offset?: number;
  /** 本次最多处理多少个源。 */
  limit?: number;
  log?: (line: string) => void;
}
export interface RunReport {
  /** 新增条目数 */
  added: number;
  /** 本次实际处理的源个数 */
  processed: number;
  /** 本轮候选源总数 */
  of: number;
  /** 是否因超预算提前退出 */
  truncated: boolean;
  ms: number;
  lines: string[];
}

/** 按 offset/limit 切片，offset 支持环绕（用于按天轮转分片）。 */
export function slice<T>(all: T[], offset = 0, limit?: number): T[] {
  if (!all.length) return [];
  const start = ((offset % all.length) + all.length) % all.length;
  const rotated = [...all.slice(start), ...all.slice(0, start)];
  return typeof limit === "number" ? rotated.slice(0, limit) : rotated;
}

/** 判断当前脚本是否被当作 CLI 直接执行（用于保留 `tsx pipeline/xxx.ts` 用法）。 */
export function isCli(fileName: string): boolean {
  const argv = process.argv[1] ?? "";
  return argv.includes(fileName);
}
