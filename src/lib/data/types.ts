/** 结构化正文块 —— 供编辑感排版渲染 */
export type Block =
  | { type: 'para'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'code'; text: string };

export interface ArchiveItem {
  id: string;
  slug: string;
  title: string;
  url: string;
  summary: string;
  hero: string;
  byline: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  sourceSite: string;
  lang: 'zh' | 'en' | string;
  category: string;
  topics: string[];
  brands: string[];
  blocks: Block[];
  wordCount: number;
  readMinutes: number;
  thin: boolean;
  /** 运行时注入：由真实条目派生的知识卡（AI Extraction 层） */
  knowledge?: KnowledgeCard;
}

export interface PodcastItem extends ArchiveItem {
  show: string;
  showImage: string;
  audio: string;
  duration: string;
}

/* ─────────── Source Intelligence Layer（Phase 1） ─────────── */

export type Authority = 'A' | 'B' | 'C' | 'S';
export type SourceGroup =
  | 'Beauty'
  | 'Marketing'
  | 'Luxury'
  | 'AI Business'
  | 'Business Strategy'
  | 'Casebook'
  | 'Podcast';
export type Lang = 'zh' | 'en' | 'both';

/** Source Intelligence Database —— 真实来源目录（非抓取内容，而是来源元数据） */
export interface SourceIntel {
  id: string;
  name: string;
  group: SourceGroup;
  /** 细分赛道，如 Luxury / Beauty / Skincare */
  category: string;
  type: 'RSS' | 'HTML' | 'API';
  /** 主页（homepage） */
  url: string;
  /** RSS / feed 地址（feedUrl） */
  rss?: string;
  lang: Lang;
  /** 权威度：A 顶级 / B 主流 / C 垂直补充 / S 策略级（同时作为权重基准） */
  authority: Authority;
  /** 更新频率：Daily / Weekly / Ad hoc */
  updateFrequency: string;
  /** 覆盖区域：Global / China / US / EU / UK / Asia */
  region: string;
  /** 访问方式：open 公开 / newsletter 邮件订阅 / paywall 付费墙 / login 登录 */
  accessMode: 'open' | 'newsletter' | 'paywall' | 'login';
  /** 是否有邮件订阅（newsletter） */
  newsletter?: boolean;
  /** 是否付费墙（paywall） */
  paywall?: boolean;
  /** 为什么值得关注（编辑性描述，基于真实来源定位） */
  whyFollow: string;
  /** 适用岗位：Brand Marketer / Strategy / Growth / Creative / Insights 等 */
  targetRole: string;
  /** 是否已接入真实抓取管道 */
  live: boolean;
  lastSync?: string;
  /** 上次成功抓取时间（lastSuccessAt），未接入时为 undefined */
  lastSuccessAt?: string;
  /** 运行时注入：该来源已抓取的条目数 */
  itemCount?: number;
  notes?: string;
}

/* ─────────── Knowledge Card（Phase 3：详情页结构） ───────────
   数据流：Source → Article/Podcast → AI Extraction → Knowledge Card → Archive
   说明：Original Intelligence 由真实抓取数据派生（客观）；
   Industry / Marketing / Career 为主观 AI 萃取层，未接入 LLM 前标记 draft/pending，
   绝不编造事实，仅基于真实话题/品牌做结构化支架。 */

export interface OriginalIntel {
  background?: string;
  event?: string;
  keyFacts: string[];
  brands: string[];
  competitors?: string[];
  coreViewpoints: string[];
}

export interface IndustryAnalysis {
  whyImportant?: string;
  impact: { market?: string; consumer?: string; brand?: string; channel?: string };
  generated: boolean;
}

export interface MarketingInsight {
  takeaways: string[];
  generated: boolean;
}

export interface CareerUsage {
  interviewPitch?: string;
  englishExpression?: string;
  relatedPortfolio?: string[];
  generated: boolean;
}

export interface KnowledgeCard {
  originalIntel: OriginalIntel;
  industryAnalysis?: IndustryAnalysis;
  marketingInsight?: MarketingInsight;
  careerUsage?: CareerUsage;
  /** live=已接 LLM 生成 / draft=基于真实数据的规则派生 / pending=待生成 */
  aiStatus: 'live' | 'draft' | 'pending';
}

/* ─────────── Podcast Intelligence（Phase 4） ─────────── */

export interface PodcastIntel {
  show: string;
  cover: string;
  platform: string;
  latestEpisode?: string;
  episodeDate?: string;
  summary: string;
  keyTakeaways: string[];
  businessTerms: string[];
  marketingInsight?: string;
  relatedCompany?: string[];
  transcript?: string;
  audio: string;
  sourceId: string;
  aiStatus: 'live' | 'draft';
}

/* ─────────── Company Dossier（Phase 5） ─────────── */

export type CompanyTier = 'live' | 'curated';
export type CompanyGroup = 'Beauty' | 'Platform' | 'Luxury' | 'Agency' | 'Other';

export interface CompanyDossier {
  id: string;
  name: string;
  group: CompanyGroup;
  /** live=有真实抓取信号关联 / curated=策划资料（DEMO，明确区分） */
  tier: CompanyTier;
  overview: string;
  /** 发展时间线（关键节点，真实公开事实） */
  timeline?: string[];
  businessModel: string;
  /** 收入逻辑 / 变现方式 */
  revenueLogic?: string;
  brandPortfolio: string[];
  chinaStrategy: string;
  /** 目标消费者画像 */
  consumers?: string;
  recentMoves: string[];
  marketingCases: string[];
  competitors: string[];
  culture: string;
  openRoles: string[];
  interviewQuestions: string[];
  myFit?: string;
  /** 参考资料来源 id / 名称 */
  sources?: string[];
  /** 运行时注入：真实信号提及数 */
  mentions?: number;
  signalIds?: string[];
}

/** Podcast 频道（真实 RSS 源元数据，注册表） */
export interface PodcastChannel {
  id: string;
  name: string;
  group: 'Chinese' | 'International';
  category: string;
  lang: Lang;
  authority: Authority;
  /** 真实 RSS feed 地址 */
  rss: string;
  site: string;
  desc: string;
  image: string;
  sourceId: string;
}

/** Podcast 节目（运行时从 archive.json 注入） */
export interface PodcastShow {
  name: string;
  image: string;
  desc: string;
  site: string;
  sourceId: string;
}

/** Podcast 单集（构建时从真实 RSS 抓取，绝不编造） */
export interface PodcastEpisode {
  id: string;
  channelId: string;
  show: string;
  showImage: string;
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
  duration: string;
  audio: string;
}

export interface PodcastChannelHealth {
  ok: boolean;
  count: number;
  lastSuccessAt: string;
  source: string;
}

export interface PodcastChannelWithHealth extends PodcastChannel {
  health: PodcastChannelHealth;
}

export interface EnglishCard {
  id: string;
  sentence: string;
  terms: string[];
  sourceTitle: string;
  sourceName: string;
  url: string;
  publishedAt: string;
}

/* ─────────── Case Study Breakdown（Tier A 深度富化层） ───────────
   与 archive.json（抓取标题/摘要/正文）解耦：本层为经人工/LLM 复核的
   结构化案例拆解，缺失字段如实标注「档案未完成」，绝不编造结果与数据。 */
export type CaseTier = 'A' | 'B' | 'pending';

export interface CaseStudy {
  id: string;
  tier: CaseTier;
  /** 主品牌（与 ArchiveItem.brands 对齐） */
  brand: string;
  campaignName: string;
  market: string;
  period: string;
  businessContext: string;
  challenge: string;
  /** 数据基线：每条含指标、数值、来源与日期；无可靠数据写 No verified performance data available. */
  dataBaseline: string[];
  targetAudience: string;
  consumerInsight: string;
  strategicObjective: string;
  bigIdea: string;
  messageArchitecture: string[];
  /** 执行时间线：每条「日期：动作」 */
  executionTimeline: string[];
  channelRoles: { channel: string; role: string }[];
  creativeAssets: string[];
  mediaMechanism: string;
  conversionPath: string;
  /** 结果：含来源/日期；无可靠硬指标写 No verified performance data available. */
  results: string[];
  evidenceGrade: 'A' | 'B' | 'C' | 'D';
  whatWorked: string[];
  limitations: string[];
  tradeOffs: string[];
  reusableLearning: string[];
  /** 关联公司 id（对应 companies.registry） */
  relatedCompanies: string[];
  confidence: number;
}

export interface SourceRef {
  id: string;
  name: string;
  site: string;
  lang: string;
  category: string;
  count: number;
}

export interface CompanyRef {
  id: string;
  name: string;
  mentions: number;
  signalIds: string[];
}

export interface Archive {
  generatedAt: string;
  stats: {
    signals: number;
    cases: number;
    podcasts: number;
    english: number;
    companies: number;
    sources: number;
    withBody: number;
    withHero: number;
  };
  signals: ArchiveItem[];
  cases: ArchiveItem[];
  podcasts: PodcastItem[];
  podcastShows: PodcastShow[];
  english: EnglishCard[];
  topics: { name: string; count: number }[];
  companies: CompanyRef[];
  sources: SourceRef[];
}
