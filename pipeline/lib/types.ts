// 与 supabase/schema.sql 对齐的领域类型（pipeline 使用，避免依赖前端 src）

/** 结构化正文块 —— 与前端 src/lib/data/types.ts 的 Block 完全对齐 */
export type Block =
  | { type: "para"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; src: string; caption?: string }
  | { type: "code"; text: string };

export type ArticleKind = "signal" | "case";

export interface SourceRecord {
  id: string;
  name: string;
  category: string;
  language: string;
  region: string;
  authority: number;
  access_mode: string;
  homepage?: string | null;
  feed_url?: string | null;
  newsletter: boolean;
  paywall: boolean;
  why_follow?: string | null;
  is_active?: boolean;
}

export interface VocabItem {
  term: string;
  pos?: string;
  meaning: string;
  example?: string;
}

/** AI 结构化萃取卡（与前端 KnowledgeCard 对齐：§2.5 / §2.8）
 *  数据流：Source → Article → AI Extraction → Knowledge Card → Archive */
export interface KnowledgeCard {
  originalIntel: {
    background?: string;
    event?: string;
    keyFacts: string[];
    brands: string[];
    competitors?: string[];
    coreViewpoints: string[];
  };
  industryAnalysis?: {
    whyImportant?: string;
    impact?: { market?: string; consumer?: string; brand?: string; channel?: string };
    generated: boolean;
  };
  marketingInsight?: {
    takeaways: string[];
    generated: boolean;
  };
  careerUsage?: {
    interviewPitch?: string;
    englishExpression?: string;
    relatedPortfolio?: string[];
    generated: boolean;
  };
  /** live=已接 LLM 生成（基于真实原文）/ draft=规则派生 / pending=待生成 */
  aiStatus: "live" | "draft" | "pending";
  /** 多源聚合与 Business English 段（前端另有独立渲染，此处可选） */
  multiSourceViews?: { source: string; view: string }[];
  businessEnglish?: {
    passageEn?: string;
    passageCn?: string;
    vocab?: VocabItem[];
    sentencePatterns?: string[];
    corporateLanguage?: string[];
    interviewApplication?: string;
    sourceLabel?: string;
    sourceUrl?: string;
  };
}

export interface ArticleRecord {
  id: string;
  kind: ArticleKind;
  title: string;
  author?: string | null;
  source_id?: string | null;
  source_name?: string | null;
  published_at?: string | null;
  language: string;
  hero?: string | null;
  summary?: string | null;
  blocks?: unknown[]; // 正文块
  word_count: number;
  category?: string | null;
  topics?: string[];
  brands?: string[];
  tags?: string[];
  vertical?: string | null;
  signal_category?: string | null;
  content_scope?: string | null;
  thin?: boolean; // 档案未完成（正文不足阈值）
  knowledge?: KnowledgeCard;
  original_url?: string | null;
}

export interface PodcastRecord {
  id: string;
  name: string;
  language: string;
  region: string;
  rss_url: string;
  homepage?: string | null;
  description?: string | null;
}

export interface EpisodeRecord {
  id: string;
  podcast_id: string;
  title: string;
  summary?: string | null;
  published_at?: string | null;
  audio_url?: string | null;
  duration_sec?: number | null;
  transcript_status?: string;
  transcript_text?: string | null;
  shownotes?: unknown;
}
