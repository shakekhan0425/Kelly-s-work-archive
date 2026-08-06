/**
 * AI 结构化萃取（§2.5 / §2.8）。
 * 输入：真实抓取的正文 + 元信息。
 * 输出：Structured KnowledgeCard（背景 / 关键事实 / 行业影响 / 营销启示 / 面试应用 / Business English）。
 *
 * 铁律：只基于【提供的原文】分析，绝不编造事实、数据、引用或链接。
 * 原文未提及的字段，返回 null 或空数组，由前端显示「档案未完成」。
 */
import { chatJSON } from "./llm";
import type { KnowledgeCard } from "./types";

export interface AnalyzeInput {
  title: string;
  text: string; // 真实正文（已抽取）
  author?: string | null;
  sourceName: string;
  url?: string | null;
  publishedAt?: string | null;
}

const SYSTEM = `你是资深营销/商业情报分析师，服务于一个面向面试备考的「营销情报工作台」。
任务：把用户提供的【真实原文】萃取为结构化知识卡。
严格要求：
1. 所有结论必须来自【原文】，不得编造任何事实、数据、人物、引用或外部链接。
2. 原文未提及的字段填 null 或空数组。
3. 中文输出（Business English 段可中英混排）。
4. 返回严格 JSON，字段见下方 schema。`;

const SCHEMA = `{
  "originalIntel": {
    "background": "事件背景（2-4句，基于原文）",
    "event": "一句话事件概述",
    "keyFacts": ["关键事实1","关键事实2"],
    "brands": ["提及的品牌"],
    "competitors": ["提及的竞品（可空）"],
    "coreViewpoints": ["核心观点1","核心观点2"]
  },
  "industryAnalysis": {
    "whyImportant": "为什么重要（基于原文）",
    "impact": { "market":"", "consumer":"", "brand":"", "channel":"" },
    "generated": true
  },
  "marketingInsight": {
    "takeaways": ["营销/商业启示1","营销/商业启示2"],
    "generated": true
  },
  "careerUsage": {
    "interviewPitch": "面试中如何应用此案例（1-3句）",
    "englishExpression": "可引用的英文行业表达（若有）",
    "relatedPortfolio": ["相关作品集方向"],
    "generated": true
  },
  "aiStatus": "live",
  "businessEnglish": {
    "passageEn": "从原文提炼的英文表达或行业术语范例（若有）",
    "passageCn": "对应中文理解",
    "vocab": [{"term":"","pos":"","meaning":"","example":""}],
    "sentencePatterns": ["句型拆解"],
    "corporateLanguage": ["地道表达"],
    "interviewApplication": "面试中如何运用该英语表达",
    "sourceLabel": "来源标注（如 Reuters / FT / HBR，仅当原文确属该媒体）",
    "sourceUrl": null
  }
}`;

export async function analyzeArticle(input: AnalyzeInput): Promise<KnowledgeCard> {
  const user = [
    `标题：${input.title}`,
    `来源：${input.sourceName}${input.author ? " / 作者 " + input.author : ""}`,
    `原文链接：${input.url ?? "无"}`,
    `发布时间：${input.publishedAt ?? "未知"}`,
    "",
    "===== 原文 Begin =====",
    input.text.slice(0, 12000),
    "===== 原文 End =====",
    "",
    "请按以下 JSON schema 萃取（只基于原文）：",
    SCHEMA,
  ].join("\n");

  const card = await chatJSON<KnowledgeCard>(SYSTEM, user, { temperature: 0.2 });
  return card;
}

/** 六分类 + 七域内容范围 + 主题词，由 LLM 或规则派生（这里用 LLM 一次产出，减少调用）。 */
export interface ClassifyResult {
  signal_category: string | null; // Consumer Trends / Brand Moves / Campaign & Advertising / Industry Report / Company Moves / AI & Technology
  content_scope: string | null; // consumer | brand | advertising | fashion | business | technology | beauty
  topics: string[];
}

export async function classifyArticle(
  title: string,
  text: string
): Promise<ClassifyResult> {
  const user = [
    `标题：${title}`,
    "",
    "===== 原文 Begin =====",
    text.slice(0, 4000),
    "===== 原文 End =====",
    "",
    `返回 JSON：{
      "signal_category": "六选一：Consumer Trends | Brand Moves | Campaign & Advertising | Industry Report | Company Moves | AI & Technology",
      "content_scope": "七选一：consumer | brand | advertising | fashion | business | technology | beauty",
      "topics": ["2-4个主题词（中英皆可）"]
    }`,
  ].join("\n");
  const r = await chatJSON<ClassifyResult>(SYSTEM, user, { temperature: 0.1 });
  return {
    signal_category: r.signal_category ?? null,
    content_scope: r.content_scope ?? null,
    topics: Array.isArray(r.topics) ? r.topics.slice(0, 6) : [],
  };
}
