// 市场情报六大分类（客户端安全模块，可被 client component 引用）。
// 分类是对真实抓取数据的客观归类（基于话题 / 标题 / 摘要 / 现有 category 字段的规则派生），
// 不新增任何伪造事实，仅用于列表筛选与聚合。

import type { ArchiveItem } from "./types";

export const SIGNAL_CATEGORIES = [
  { id: "consumer-trends", label: "Consumer Trends", zh: "消费趋势" },
  { id: "brand-moves", label: "Brand Moves", zh: "品牌动作" },
  { id: "campaign-ad", label: "Campaign & Advertising", zh: "营销战役与广告" },
  { id: "industry-report", label: "Industry Report", zh: "行业报告" },
  { id: "company-moves", label: "Company Moves", zh: "公司动态" },
  { id: "ai-tech", label: "AI & Technology", zh: "AI 与科技" },
] as const;

export type SignalCategoryId = (typeof SIGNAL_CATEGORIES)[number]["id"];

const KEYWORDS: Record<SignalCategoryId, string[]> = {
  "consumer-trends": [
    "消费", "消费者", "年轻", "z世代", "genz", "gen z", "shopper", "购物",
    "趋势", "偏好", "习惯", "社媒", "短视频", "生活方式", "零售", "客群",
  ],
  "brand-moves": [
    "品牌", "brand", "重塑", "rebrand", "定位", "positioning", "升级", "焕新",
    "新品", "发布", "战略", "公关", "形象", "ip", "联名", "collaboration",
  ],
  "campaign-ad": [
    "campaign", "广告", "营销战役", "代言", "kol", "influencer", "创意", "投放",
    "advertising", "短视频", "内容营销", "social", "病毒", "刷屏",
  ],
  "industry-report": [
    "报告", "白皮书", "数据", "调研", "研究", "report", "study", "市场规模",
    "forecast", "预测", "排行榜", "榜单", "洞察", "分析", "趋势报告",
  ],
  "company-moves": [
    "并购", "融资", "上市", "财报", "ipo", "任命", "ceo", "收购", "merger",
    "acquisition", "funding", "earnings", "投资", "合作", "战略合作", "入股",
    "重组", "裁员", "关店",
  ],
  "ai-tech": [
    "ai", "人工智能", "大模型", "生成式", "genai", "llm", "算法", "数据",
    "technology", "tech", "自动化", "机器学习", "agent", "智能体",
  ],
};

/**
 * 由真实数据确定性地派生素材所属的市场情报分类。
 * 优先级：AI/科技 > 公司动态 > 营销战役 > 行业报告 > 品牌动作 > 消费趋势（默认）。
 * 若任何维度均未命中，回退到「消费趋势」作为中性兜底。
 */
export function signalCategoryOf(item: ArchiveItem): SignalCategoryId {
  const hay = `${item.topics.join(" ")} ${item.title} ${item.summary}`.toLowerCase();

  // AI/科技：category 字段或明确关键词命中
  if (item.category === "ai" || KEYWORDS["ai-tech"].some((k) => hay.includes(k))) {
    return "ai-tech";
  }
  // 公司动态
  if (KEYWORDS["company-moves"].some((k) => hay.includes(k))) {
    return "company-moves";
  }
  // 营销战役与广告
  if (KEYWORDS["campaign-ad"].some((k) => hay.includes(k))) {
    return "campaign-ad";
  }
  // 行业报告
  if (KEYWORDS["industry-report"].some((k) => hay.includes(k))) {
    return "industry-report";
  }
  // 品牌动作
  if (KEYWORDS["brand-moves"].some((k) => hay.includes(k))) {
    return "brand-moves";
  }
  // 消费趋势（兜底）
  return "consumer-trends";
}

export function signalCategoryMeta(id: SignalCategoryId) {
  return SIGNAL_CATEGORIES.find((c) => c.id === id) ?? SIGNAL_CATEGORIES[0];
}
