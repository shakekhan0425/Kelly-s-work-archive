/**
 * Product identity — single source of truth (v2.5 product correction).
 * 定位校正：从「AI 摘要 / 资讯收藏工具」调整为「Kelly Personal Marketing Intelligence OS」。
 * Beauty 只是用户专业优势领域之一（一个垂直分支），不是产品边界；
 * 所有模块必须支持跨行业扩展（Consumer / Brand / Luxury / Tech / Retail / Global）。
 * The name MUST be a config item, not hardcoded across components.
 */
export const PRODUCT = {
  name: "WORK / Archive",
  nameZh: "Kelly 个人营销情报系统",
  /** 系统定位（v2.5） */
  positioning: "Kelly Personal Marketing Intelligence OS",
  /** 覆盖的垂直行业（beauty 仅为其中之一） */
  verticals: [
    "Consumer Industry",
    "Brand Strategy",
    "Marketing",
    "Luxury & Fashion",
    "Beauty & Personal Care",
    "Technology & AI",
    "Retail",
    "Global Business",
  ],
  subtitle: "行业情报 · 品牌案例 · 公司研究 · 职业资产 · 视觉审美",
  description:
    "面向市场营销岗位的个人情报系统：跨 Consumer / Luxury / Tech / Retail / Beauty 等垂直追踪真实来源、沉淀品牌案例、研究目标公司、积累职业资产与视觉审美。Beauty 是 Kelly 的专业优势分支，而非系统边界。",
  issuePrefix: "No.",
  /** 使用者（用于职业资产语境） */
  owner: "Kelly · 市场营销",
} as const;

export type ProductConfig = typeof PRODUCT;
