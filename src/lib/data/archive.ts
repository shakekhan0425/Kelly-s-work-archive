import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type {
  Archive,
  ArchiveItem,
  CompanyDossier,
  CompanyCategory,
  CompanyRef,
  EnglishCard,
  IndustryAnalysis,
  KnowledgeCard,
  OriginalIntel,
  PodcastChannelWithHealth,
  PodcastEpisode,
  PodcastIntel,
  PodcastItem,
  PodcastShow,
  SourceGroup,
  SourceIntel,
  SourceRef,
  CaseStudy,
} from './types';
import { SOURCE_REGISTRY } from './sources.registry';
import { COMPANY_REGISTRY } from './companies.registry';
import { PODCAST_CHANNELS } from './podcasts.registry';
import episodesData from './podcasts.episodes.json';
import caseStudiesData from './case-studies.json';

/** 构建时从真实 RSS 抓取的单集（失败源不在此出现，绝不编造） */
export const PODCAST_EPISODES: PodcastEpisode[] = (episodesData as { episodes: PodcastEpisode[] }).episodes;
const PODCAST_CHANNELS_HEALTH: PodcastChannelWithHealth[] = (
  episodesData as { channels: PodcastChannelWithHealth[] }
).channels;

/** Tier A 案例深度富化层（策划/LLM 复核，独立于抓取产物） */
export const CASE_STUDIES: CaseStudy[] = (caseStudiesData as { cases: CaseStudy[] }).cases;

const EMPTY: Archive = {
  generatedAt: '',
  stats: {
    signals: 0,
    cases: 0,
    podcasts: 0,
    english: 0,
    companies: 0,
    sources: 0,
    withBody: 0,
    withHero: 0,
  },
  signals: [],
  cases: [],
  podcasts: [],
  podcastShows: [],
  english: [],
  topics: [],
  companies: [],
  sources: [],
};

let cache: Archive | null = null;

/** 读取抓取管道产物。缺失时返回空档案（页面会显示编辑感空状态）。 */
export function getArchive(): Archive {
  if (cache) return cache;
  try {
    const file = path.join(process.cwd(), 'data', 'archive.json');
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as Archive;
    // 诚实标注：正文不足 800 字或正文块为空 → 档案未完成（触发详情页提示，绝不编造内容补足）
    for (const item of [...parsed.signals, ...parsed.cases]) {
      if (typeof item.thin !== 'boolean') item.thin = false;
      if (!item.thin && (item.wordCount < 800 || !item.blocks || item.blocks.length === 0)) {
        item.thin = true;
      }
    }
    cache = parsed;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

/* ─────────── 查询 ─────────── */

export function getSignals(opts: {
  topic?: string;
  lang?: string;
  source?: string;
  category?: string;
  limit?: number;
} = {}): ArchiveItem[] {
  return filterSignals(getArchive(), opts);
}

/** 纯过滤：给定 Archive，按条件筛信号（live.ts 复用，避免重复逻辑） */
export function filterSignals(
  a: Archive,
  opts: { topic?: string; lang?: string; source?: string; category?: string; limit?: number } = {},
): ArchiveItem[] {
  const { topic, lang, source, category, limit } = opts;
  let list = a.signals;
  if (topic) list = list.filter((s) => s.topics.includes(topic));
  if (lang) list = list.filter((s) => s.lang === lang);
  if (source) list = list.filter((s) => s.sourceId === source);
  if (category) list = list.filter((s) => s.category === category);
  return limit ? list.slice(0, limit) : list;
}

export function getCases(opts: { topic?: string; limit?: number } = {}): ArchiveItem[] {
  return filterCases(getArchive(), opts);
}

/** 纯过滤：给定 Archive，按条件筛案例（live.ts 复用） */
export function filterCases(a: Archive, opts: { topic?: string; limit?: number } = {}): ArchiveItem[] {
  let list = a.cases;
  if (opts.topic) list = list.filter((s) => s.topics.includes(opts.topic!));
  return opts.limit ? list.slice(0, opts.limit) : list;
}

export function getPodcasts(limit?: number): PodcastItem[] {
  const list = getArchive().podcasts;
  return limit ? list.slice(0, limit) : list;
}

export function getPodcastShows(): PodcastShow[] {
  return getArchive().podcastShows;
}

/* ─────────── Podcast Intelligence（真实 RSS 单集） ─────────── */

export function getPodcastChannels(): PodcastChannelWithHealth[] {
  if (PODCAST_CHANNELS_HEALTH.length) return PODCAST_CHANNELS_HEALTH;
  return PODCAST_CHANNELS.map((c) => ({
    ...c,
    health: { ok: false, count: 0, lastSuccessAt: '', source: '' },
  }));
}

/** 真实抓取的单集；不传 channelId 返回全部 */
export function getPodcastEpisodes(channelId?: string): PodcastEpisode[] {
  return channelId
    ? PODCAST_EPISODES.filter((e) => e.channelId === channelId)
    : PODCAST_EPISODES;
}

export function getPodcastEpisodeById(id: string): PodcastEpisode | undefined {
  return PODCAST_EPISODES.find((e) => e.id === id);
}

/** 商业 / 营销高频词表，用于规则派生（不编造，仅当单集文本出现才列出） */
export const BIZ_TERMS = [
  'brand', 'branding', 'marketing', 'campaign', 'consumer', 'luxury', 'revenue',
  'growth', 'dtc', 'omni-channel', 'omni', 'kol', 'influencer', 'ai', 'genai',
  'llm', 'retention', 'loyalty', 'positioning', 'brand equity', 'crm', 'roi',
  'cmo', 'saas', 'ipo', 'merger', 'acquisition', 'm&a', 'earnings', 'guidance',
  'churn', 'funnel', 'personalization', 'creator economy', 'sustainability', 'esg',
  'private label', 'retail media', 'first-party data', 'creator', 'ecommerce',
];

export function buildPodcastIntel(ep: PodcastEpisode): PodcastIntel {
  const hay = `${ep.title} ${ep.summary}`.toLowerCase();
  const relatedCompany = Object.entries(COMPANY_ALIASES)
    .filter(([, al]) => al.some((a) => hay.includes(a)))
    .map(([id]) => COMPANY_REGISTRY.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) as string[];
  const businessTerms = BIZ_TERMS.filter((t) => hay.includes(t.toLowerCase())).slice(0, 10);
  const ch = PODCAST_CHANNELS.find((c) => c.id === ep.channelId);
  return {
    show: ep.show,
    cover: ep.showImage,
    platform: ch?.site ?? '',
    latestEpisode: ep.title,
    episodeDate: ep.publishedAt,
    summary: ep.summary,
    keyTakeaways: [],
    businessTerms,
    relatedCompany: relatedCompany.slice(0, 8),
    audio: ep.audio,
    sourceId: ep.channelId,
    aiStatus: 'draft',
  };
}

export function getEnglish(limit?: number): EnglishCard[] {
  const list = getArchive().english;
  return limit ? list.slice(0, limit) : list;
}

export function getSources(): SourceRef[] {
  return getArchive().sources;
}

export function getTopics(): { name: string; count: number }[] {
  return getArchive().topics;
}

/** 纯函数：从给定 Archive 取话题（live.ts 复用） */
export function getTopicsFrom(a: Archive): { name: string; count: number }[] {
  return a.topics;
}

export function getCompanies(limit?: number): CompanyRef[] {
  const list = getArchive().companies;
  return limit ? list.slice(0, limit) : list;
}

/** 全部条目（含案例、播客），用于详情查找与搜索 */
export function getAllItems(): ArchiveItem[] {
  const a = getArchive();
  return [...a.signals, ...a.cases, ...a.podcasts];
}

export function getItemById(id: string): ArchiveItem | PodcastItem | undefined {
  return getAllItems().find((s) => s.id === id);
}

export function getCompanyById(id: string): CompanyRef | undefined {
  return getArchive().companies.find((c) => c.id === id);
}

export function getItemsByIds(ids: string[]): ArchiveItem[] {
  const map = new Map(getAllItems().map((i) => [i.id, i]));
  return ids.map((i) => map.get(i)).filter(Boolean) as ArchiveItem[];
}

/** 同源 / 同话题的相关条目 */
export function getRelated(item: ArchiveItem, limit = 4): ArchiveItem[] {
  const all = getAllItems().filter((s) => s.id !== item.id);
  const scored = all.map((s) => {
    let score = 0;
    s.topics.forEach((t) => item.topics.includes(t) && (score += 3));
    s.brands.forEach((b) => item.brands.includes(b) && (score += 4));
    if (s.sourceId === item.sourceId) score += 1;
    return { s, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

/** 由真实数据派生：本条情报关联的公司 dossier（按品牌 / 正文匹配别名） */
export function getRelatedCompanies(item: ArchiveItem): CompanyDossier[] {
  const hay = `${item.title} ${item.summary} ${item.brands.join(' ')} ${item.topics.join(' ')}`.toLowerCase();
  const ids = new Set<string>();
  for (const [id, al] of Object.entries(COMPANY_ALIASES)) {
    if (al.some((a) => hay.includes(a))) ids.add(id);
  }
  for (const b of item.brands) {
    const found = Object.entries(COMPANY_ALIASES).find(([, al]) => al.includes(b.toLowerCase()));
    if (found) ids.add(found[0]);
  }
  return [...ids].map((id) => getCompanyDossier(id)).filter(Boolean) as CompanyDossier[];
}

/** 由真实数据派生：本条情报关联的品牌案例（同话题 / 同品牌） */
export function getRelatedCases(item: ArchiveItem, limit = 4): ArchiveItem[] {
  const cases = getArchive().cases;
  const scored = cases.map((c) => {
    let score = 0;
    c.topics.forEach((t) => item.topics.includes(t) && (score += 3));
    c.brands.forEach((b) => item.brands.includes(b) && (score += 4));
    if (c.sourceId === item.sourceId) score += 1;
    return { c, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

/** 由真实数据派生：相关商务英语卡片（话题重叠则优先，否则返回空，页面引导至 /english） */
export function getRelatedEnglish(item: ArchiveItem, limit = 2): EnglishCard[] {
  const hay = `${item.topics.join(' ')} ${item.title} ${item.summary}`.toLowerCase();
  const all = getArchive().english;
  const matched = all.filter((e) =>
    e.terms.some((t) => hay.includes(t.toLowerCase())) ||
    hay.includes(e.sourceName.toLowerCase()),
  );
  return (matched.length ? matched : all).slice(0, limit);
}

/** 由真实数据派生：本条情报关联的播客单集（按相关公司 / 品牌 / 话题匹配真实 RSS 文本） */
export function getRelatedPodcasts(item: ArchiveItem, limit = 3): PodcastEpisode[] {
  const cos = getRelatedCompanies(item).map((c) => c.id);
  const scored = PODCAST_EPISODES.map((ep) => {
    const eh = `${ep.title} ${ep.summary}`.toLowerCase();
    let score = 0;
    for (const id of cos) {
      const al = COMPANY_ALIASES[id] ?? [];
      if (al.some((a) => eh.includes(a))) score += 3;
    }
    for (const b of item.brands) if (eh.includes(b.toLowerCase())) score += 2;
    item.topics.forEach((t) => {
      if (eh.includes(t.toLowerCase())) score += 1;
    });
    return { ep, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.ep);
}

/** 由真实正文规则派生商务英语素材：仅提取正文中实际出现的商业词汇 + 其所在原句，不编造释义 */
export function buildBusinessEnglish(item: ArchiveItem): {
  terms: string[];
  examples: { term: string; sentence: string }[];
} {
  const paras = item.blocks
    .filter((b) => b.type === 'para')
    .map((b) => (b as { type: 'para'; text: string }).text);
  const text = paras.join(' ').toLowerCase();
  const terms = BIZ_TERMS.filter((t) => text.includes(t.toLowerCase())).slice(0, 8);
  const examples = terms
    .map((t) => {
      const sent = paras.find((p) => p.toLowerCase().includes(t.toLowerCase()));
      return sent ? { term: t, sentence: sent } : null;
    })
    .filter(Boolean) as { term: string; sentence: string }[];
  return { terms, examples };
}

/** 由真实数据规则派生「事件背景」句：组合来源类型 / 话题 / 首段，绝不编造外部事实 */
export function buildContext(item: ArchiveItem): string {
  const firstPara = item.blocks
    .filter((b) => b.type === 'para')
    .map((b) => (b as { type: 'para'; text: string }).text)[0];
  const topicStr = item.topics.join('、');
  const base = `本条来自 ${item.sourceName}（${item.category}）`;
  const tail = topicStr ? `，聚焦 ${topicStr}。` : '。';
  return firstPara ? `${base}${tail} ${firstPara}` : `${base}${tail}`;
}

/** Today's Intelligence 组合：5 个行业变化（按垂直各取最新）+ 1 案例 + 1 公司动态 + 1 播客 + 1 英语；全部来自真实数据 */
export function getTodayIntelligence(archive: Archive = getArchive()): {
  changes: ArchiveItem[];
  caseItem?: ArchiveItem;
  company?: CompanyDossier;
  podcast?: PodcastItem;
  english?: EnglishCard;
} {
  const signals = archive.signals;
  const changes: ArchiveItem[] = [];
  for (const v of VERTICALS) {
    const s = signals.find((x) => verticalOf(x) === v.id);
    if (s && !changes.includes(s)) changes.push(s);
    if (changes.length >= 5) break;
  }
  for (const s of signals) {
    if (changes.length >= 5) break;
    if (!changes.includes(s)) changes.push(s);
  }
  const caseItem = archive.cases[0];
  const allCos = getCompanyDossiers();
  const company = allCos.find((d) => d.tier === 'A') ?? allCos[0];
  const podcast = archive.podcasts[0];
  const english = archive.english[0];
  return { changes, caseItem, company, podcast, english };
}

/** 延伸权威信源：A/B 级来源中类目与本条话题 / 垂直重叠者，供深挖（不编造，仅推荐） */
export function getRelatedSources(item: ArchiveItem, limit = 6): SourceIntel[] {
  const vId = verticalOf(item);
  const vLabel = VERTICALS.find((v) => v.id === vId)?.label ?? '';
  const hay = `${item.category} ${item.topics.join(' ')} ${vLabel}`.toLowerCase();
  const matched = getSourceIntel()
    .filter((s) => s.authority !== 'C')
    .filter((s) => {
      const sh = `${s.category} ${s.whyFollow}`.toLowerCase();
      return (
        hay.includes(s.category.toLowerCase()) ||
        (s.category.toLowerCase().length > 3 && sh.includes(s.category.toLowerCase().slice(0, 8)))
      );
    });
  const sorted = [...matched].sort((a, b) => (a.authority === 'A' ? 0 : 1) - (b.authority === 'A' ? 0 : 1));
  return sorted.slice(0, limit);
}

/** 全文搜索（标题 / 摘要 / 正文 / 品牌 / 话题 / 来源）；可传 Archive 以支持 live 数据源 */
export function searchArchive(q: string, limit = 60, a: Archive = getArchive()): ArchiveItem[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const terms = query.split(/\s+/).filter(Boolean);
  const all = [...a.signals, ...a.cases, ...a.podcasts];
  const scored = all.map((item) => {
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();
    const body = item.blocks
      .map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : ''))
      .join(' ')
      .toLowerCase()
      .slice(0, 4000);
    const meta = `${item.sourceName} ${item.topics.join(' ')} ${item.brands.join(' ')}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      if (meta.includes(t)) score += 5;
      if (summary.includes(t)) score += 3;
      if (body.includes(t)) score += 1;
    }
    return { item, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

/** Desk 用：今日精选 / 快速拾取 */
export function getTodayEdit(): { lead?: ArchiveItem; secondary: ArchiveItem[] } {
  const withBody = getArchive().signals.filter((s) => !s.thin && s.hero);
  const pool = withBody.length >= 5 ? withBody : getArchive().signals;
  return { lead: pool[0], secondary: pool.slice(1, 5) };
}

export function formatDate(iso: string, lang: 'zh' | 'en' = 'zh'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  if (lang === 'en') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function relativeTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  if (isNaN(d)) return '';
  const diff = Date.now() - d;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return '刚刚';
  if (h < 24) return `${h} 小时前`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} 天前`;
  return formatDate(iso);
}

/* ─────────── Signals 垂直分类（跨行业） ───────────
   对应 v2.5 校正：Consumer Trends / Brand Marketing / Beauty /
   Luxury Fashion / Technology AI / Global Business。
   Beauty 只是其一，所有模块支持跨行业扩展。 */
export const VERTICALS = [
  { id: 'consumer', label: 'Consumer Trends', zh: '消费趋势' },
  { id: 'brand', label: 'Brand Marketing', zh: '品牌营销' },
  { id: 'beauty', label: 'Beauty', zh: '美妆个护' },
  { id: 'luxury', label: 'Luxury Fashion', zh: '奢侈时尚' },
  { id: 'tech', label: 'Technology AI', zh: '科技 AI' },
  { id: 'global', label: 'Global Business', zh: '全球商业' },
] as const;

export const VERTICAL_KEYWORDS: Record<string, string[]> = {
  consumer: ['消费', '社媒', '零售', '渠道', '短视频', '电商', 'consumer', 'shopper'],
  brand: ['品牌', '营销', '广告', 'campaign', '内容', '增长', 'brand', 'marketing'],
  beauty: ['美妆', '护肤', '化妆品', '香水', '个护', 'beauty', 'skincare', 'cosmetic'],
  luxury: ['奢侈', '时尚', 'luxury', 'fashion', '设计师', '腕表', 'apparel'],
  tech: ['ai', '人工智能', '科技', '数据', '算法', '大模型', '生成式', 'technology'],
  global: ['全球', '国际', '海外', '财报', '并购', 'ipo', '上市', 'global', 'earnings'],
};

/** 由真实数据（话题 + 标题）派生所属垂直 */
export function verticalOf(item: ArchiveItem): string {
  const hay = `${item.topics.join(' ')} ${item.title} ${item.summary}`.toLowerCase();
  let best = 'brand';
  let bestScore = 0;
  for (const [vid, kws] of Object.entries(VERTICAL_KEYWORDS)) {
    let score = 0;
    for (const kw of kws) if (hay.includes(kw)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = vid;
    }
  }
  return best;
}

/** 各垂直的信号计数（供筛选栏） */
export function getVerticals(): { id: string; label: string; zh: string; count: number }[] {
  return getVerticalsFrom(getArchive());
}

/** 纯函数：从给定 Archive 计算各垂直计数（live.ts 复用） */
export function getVerticalsFrom(a: Archive): { id: string; label: string; zh: string; count: number }[] {
  const all = a.signals;
  return VERTICALS.map((v) => ({
    ...v,
    count: all.filter((s) => verticalOf(s) === v.id).length,
  }));
}

/* ─────────── Source Intelligence Layer（Phase 1/2） ─────────── */

/** 真实来源目录 + 运行时注入的抓取计数与 live 状态 */
export function getSourceIntel(group?: SourceGroup): SourceIntel[] {
  const counts = new Map(getArchive().sources.map((s) => [s.id, s.count]));
  const list = SOURCE_REGISTRY.map((s) => ({ ...s, itemCount: counts.get(s.id) ?? 0 }));
  return group ? list.filter((s) => s.group === group) : list;
}

export function getSourceById(id: string): SourceIntel | undefined {
  return getSourceIntel().find((s) => s.id === id);
}

export function getSourceGroups(): { group: SourceGroup; label: string; count: number; live: number }[] {
  const all = getSourceIntel();
  const order: SourceGroup[] = ['Beauty', 'Marketing', 'Luxury', 'AI Business', 'Business Strategy', 'Podcast'];
  const labelMap: Record<SourceGroup, string> = {
    Beauty: '美妆',
    Marketing: '营销',
    Luxury: '奢侈 / 时尚',
    'AI Business': 'AI 商业',
    'Business Strategy': '商业战略',
    Casebook: '案例',
    Podcast: '播客',
  };
  return order
    .map((group) => {
      const items = all.filter((s) => s.group === group);
      return {
        group,
        label: labelMap[group],
        count: items.length,
        live: items.filter((s) => s.live).length,
      };
    })
    .filter((g) => g.count > 0);
}

/* ─────────── Company Dossier（Phase 5） ─────────── */

/** 品牌别名 → 用于把真实抓取信号关联到公司 dossier（避免中英文割裂） */
export const COMPANY_ALIASES: Record<string, string[]> = {
  loreal: ['欧莱雅', 'loreal'],
  'estee-lauder': ['雅诗兰黛', 'estée', 'lauder'],
  shiseido: ['资生堂', 'shiseido'],
  pg: ['宝洁', 'olay', 'sk-ii', 'skii'],
  unilever: ['联合利华', 'dove', '多芬'],
  'lvmh-beauty': ['dior', 'fenty', '迪奥'],
  amorepacific: ['爱茉莉', 'laneige', '雪花秀'],
  kao: ['花王', 'kao', 'curel'],
  proya: ['珀莱雅', 'proya'],
  winona: ['薇诺娜', 'winona'],
  'huaxi-bio': ['华熙', 'huaxi', '润百颜'],
  'giant-biogene': ['巨子', 'giant biogene', '可复美'],
  maogeping: ['毛戈平', 'maogeping'],
  florasis: ['花西子', 'florasis'],
  'perfect-diary': ['完美日记', 'perfect diary'],
  bytedance: ['字节', '抖音', 'douyin', 'bytedance'],
  tiktok: ['tiktok', 'tik tok'],
  xiaohongshu: ['小红书', 'red', 'xiaohongshu'],
  alibaba: ['阿里', '天猫', 'tmall', 'alibaba'],
  jd: ['京东', 'jd'],
  kuaishou: ['快手', 'kuaishou'],
  tencent: ['腾讯', '微信', 'wechat', 'tencent'],
  meta: ['instagram', 'meta', 'facebook'],
  google: ['youtube', 'google'],
  amazon: ['amazon'],
  lvmh: ['lvmh', 'lv'],
  kering: ['kering', 'gucci', '古驰'],
  chanel: ['chanel', '香奈儿'],
  hermes: ['hermès', 'hermes', '爱马仕'],
  richemont: ['richemont', 'cartier', '卡地亚'],
};

/** 公司研究库（v3）：9 大分类、Tier A/B/watchlist 三档。 */
export const CATEGORY_ORDER: CompanyCategory[] = [
  'Global Beauty & Personal Care',
  'China Beauty & Personal Care',
  'China Internet & Platforms',
  'Global Technology & Platforms',
  'FMCG & Consumer Multinationals',
  'Luxury & Fashion Groups',
  'Sports, Retail & Lifestyle Brands',
  'China Consumer Brands',
  'Advertising, Consulting & Research Firms',
];

export const CATEGORY_LABELS: Record<CompanyCategory, string> = {
  'Global Beauty & Personal Care': '全球美妆个护',
  'China Beauty & Personal Care': '中国美妆个护',
  'China Internet & Platforms': '中国互联网与平台',
  'Global Technology & Platforms': '全球科技与平台',
  'FMCG & Consumer Multinationals': '快消与消费外企',
  'Luxury & Fashion Groups': '奢侈品与时尚集团',
  'Sports, Retail & Lifestyle Brands': '运动零售与生活方式',
  'China Consumer Brands': '中国消费品牌',
  'Advertising, Consulting & Research Firms': '广告咨询与研究',
};

export function getCompanyDossiers(category?: CompanyCategory): CompanyDossier[] {
  const all = COMPANY_REGISTRY;
  return category ? all.filter((d) => d.category === category) : all;
}

export function getCompanyDossier(id: string): CompanyDossier | undefined {
  return getCompanyDossiers().find((d) => d.id === id);
}

export function getCompanyGroups(): { category: CompanyCategory; label: string; count: number; tierA: number }[] {
  const all = getCompanyDossiers();
  return CATEGORY_ORDER.map((category) => {
    const items = all.filter((d) => d.category === category);
    return {
      category,
      label: CATEGORY_LABELS[category],
      count: items.length,
      tierA: items.filter((d) => d.tier === 'A').length,
    };
  }).filter((g) => g.count > 0);
}

/* ─────────── Knowledge Card（Phase 3：详情页结构） ───────────
   originalIntel 由真实抓取数据客观派生；
   industry / marketing / career 为主观 AI 萃取支架，未接 LLM 前标记 draft/pending，
   绝不编造事实，仅基于真实话题/品牌做结构化。 */

export function buildKnowledgeCard(item: ArchiveItem): KnowledgeCard {
  const paras = item.blocks.filter((b) => b.type === 'para') as { type: 'para'; text: string }[];
  const headings = item.blocks.filter((b) => b.type === 'heading') as { type: 'heading'; level: number; text: string }[];
  const keyFacts: string[] = [];
  headings.slice(0, 4).forEach((h) => keyFacts.push(h.text));
  if (paras[0]) {
    const first = paras[0].text.split(/[。.!?]/)[0]?.trim();
    if (first && keyFacts.length < 5) keyFacts.push(first);
  }
  const sentences = (item.summary || '')
    .split(/[。.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const coreViewpoints = sentences.slice(0, 3);
  const originalIntel: OriginalIntel = {
    event: sentences[0] || paras[0]?.text.slice(0, 140) || '',
    keyFacts: keyFacts.slice(0, 5),
    brands: item.brands,
    coreViewpoints,
  };

  /* ── 规则派生（客观层）：仅引用真实字段，绝不编造外部事实 ── */
  const vId = verticalOf(item);
  const vLabel = VERTICALS.find((v) => v.id === vId)?.label ?? item.category;
  const topics = item.topics;
  const brands = item.brands;

  const whyImportant = `本条目归入「${vLabel}」垂直，涉及真实话题：${topics.join('、') || '—'}。`;
  const impact: IndustryAnalysis['impact'] = {};
  if (topics.length) {
    impact.market = `市场：关注 ${topics.slice(0, 2).join('、')} 对相关品类与竞争格局的潜在影响。`;
    impact.consumer = `消费者：${brands.length ? brands.join('、') + ' 的' : ''}受众行为与偏好变化值得追踪。`;
    impact.brand = brands.length
      ? `品牌：${brands.join('、')} 的叙事、产品与增长动作可拆解复用。`
      : `品牌：本动向对品牌资产建设的启示。`;
    impact.channel = `渠道：内容分发与触点组合（社媒 / 电商 / 线下）的协同值得复盘。`;
  }

  const marketingTakeaways: string[] = [];
  if (brands.length) marketingTakeaways.push(`涉及品牌：${brands.join('、')}。`);
  if (topics.length) marketingTakeaways.push(`核心话题：${topics.join('、')}。`);
  marketingTakeaways.push(
    `可思考：如何把「${topics[0] ?? vLabel}」的洞察，转化为可衡量的内容与增长动作？`,
  );

  const careerPitch =
    brands.length || topics.length
      ? `面试中可引用「${item.title}」：围绕 ${brands.join('、') || topics.join('、')}，说明你对行业动向的判断与可落地动作。`
      : undefined;

  return {
    originalIntel,
    industryAnalysis: { whyImportant, impact, generated: false },
    marketingInsight: { takeaways: marketingTakeaways, generated: false },
    careerUsage: {
      interviewPitch: careerPitch,
      englishExpression: `本条目相关英文术语可在「商务英语」模块按话题检索，用于外企面试表达训练。`,
      relatedPortfolio: [],
      generated: false,
    },
    aiStatus: 'draft',
  };
}

export function getKnowledgeCard(id: string): KnowledgeCard | undefined {
  const item = getItemById(id);
  return item ? buildKnowledgeCard(item as ArchiveItem) : undefined;
}

export function getPodcastIntel(id: string): PodcastIntel | undefined {
  const ep = getPodcastEpisodeById(id);
  return ep ? buildPodcastIntel(ep) : undefined;
}

/* ─────────── Case Study Breakdown（Tier A 深度富化层） ─────────── */

export function getCaseStudy(id: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.id === id);
}

/** Tier A 已深拆案例数量（用于概览/进度展示） */
export function getTierACaseCount(): number {
  return CASE_STUDIES.filter((c) => c.tier === 'A').length;
}
