import type { ArchiveItem } from "./types";

/**
 * §2.1 内容范围（不以 Beauty 为核心）
 * 工作台覆盖 7 大领域，Beauty 仅专业标签之一。
 * 本文件只定义「内容领域 taxonomy」与确定性分类器，不触碰任何页面与视觉。
 */

export interface ContentScope {
  id: string;
  label: string;
  en: string;
  desc: string;
  /** 权重基准：用于列表/Desk 排序（Marketing/Brand/Luxury/Consumer 置顶） */
  weight: number;
}

export const CONTENT_SCOPE: ContentScope[] = [
  { id: "consumer", label: "Consumer & Market", en: "Consumer & Market", desc: "消费者趋势、市场结构与需求变化", weight: 10 },
  { id: "brand", label: "Brand & Marketing", en: "Brand & Marketing", desc: "品牌战略、定位与整合营销", weight: 10 },
  { id: "advertising", label: "Advertising & Creative", en: "Advertising & Creative", desc: "广告创意、代理商与 Campaign", weight: 9 },
  { id: "fashion", label: "Fashion & Luxury", en: "Fashion & Luxury", desc: "时尚、奢侈品与高端消费", weight: 9 },
  { id: "business", label: "Business & Finance", en: "Business & Finance", desc: "商业、资本与财务", weight: 8 },
  { id: "technology", label: "Technology & AI", en: "Technology & AI", desc: "技术、AI 与数字化", weight: 8 },
  { id: "beauty", label: "Beauty & Personal Care", en: "Beauty & Personal Care", desc: "美妆个护（专业标签之一，非核心）", weight: 6 },
];

const KEYWORDS: Record<string, string[]> = {
  consumer: ["consumer", "消费", "shopper", "audience", "generation z", "z世代", "trend", "趋势", "insight", "调研", "market research"],
  brand: ["brand", "品牌", "positioning", "定位", "equity", "portfolio", "rebrand", "brand strategy"],
  advertising: ["campaign", "广告", "creative", "创意", "agency", "代理商", "cmo", "media", "媒介", "ad "],
  fashion: ["fashion", "时尚", "luxury", "奢侈品", "apparel", "服饰", "couture", "streetwear", "腕表", "珠宝"],
  business: ["revenue", "营收", "earnings", "财报", "ipo", "merger", "收购", "funding", "融资", "valuation", "私募", "retailer", "财报"],
  technology: ["ai", "artificial intelligence", "人工智能", "genai", "llm", "saas", "data", "数据", "automation", "算法", "tech"],
  beauty: ["beauty", "美妆", "cosmetic", "护肤", "skincare", "彩妆", "fragrance", "香水", "personal care", "个护"],
};

/** 确定性分类：基于 item 已有 category / topics / brands / title / summary，绝不编造。 */
export function contentScopeOf(item: ArchiveItem): string {
  const hay = [
    item.category,
    ...(item.topics ?? []),
    ...(item.brands ?? []),
    item.title,
    item.summary,
  ]
    .join(" ")
    .toLowerCase();

  let best = "brand";
  let bestScore = 0;
  for (const scope of CONTENT_SCOPE) {
    const kws = KEYWORDS[scope.id] ?? [];
    const score = kws.reduce((s, k) => s + (hay.includes(k.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = scope.id;
    }
  }
  return best;
}

/** 统计各内容领域条目数（供未来筛选/Desk 使用） */
export function scopeBreakdown(items: ArchiveItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of CONTENT_SCOPE) out[s.id] = 0;
  for (const it of items) {
    const id = contentScopeOf(it);
    out[id] = (out[id] ?? 0) + 1;
  }
  return out;
}
