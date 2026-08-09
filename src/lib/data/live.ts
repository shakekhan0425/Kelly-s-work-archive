import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getLocalArchive } from "@archive-data";
import { PUBLIC_SUPABASE_URL } from "@/lib/supabase/config";
import { SOURCE_REGISTRY } from "./sources.registry";
import { COMPANY_REGISTRY } from "./companies.registry";
import { PODCAST_CHANNELS } from "./podcasts.registry";
import { cleanArchive, cleanArchiveItem, cleanEnglishCard, cleanPodcastEpisode } from "./content-clean";
import type {
  Archive,
  ArchiveItem,
  CompanyDossier,
  CompanyCategory,
  CompanyRef,
  EnglishCard,
  KnowledgeCard,
  PodcastChannelWithHealth,
  PodcastEpisode,
  PodcastIntel,
  PodcastItem,
  PodcastShow,
  SourceRef,
  SourceIntel,
  CaseStudy,
} from "./types";
import {
  PODCAST_EPISODES,
  CASE_STUDIES,
  filterSignals,
  filterCases,
  getVerticalsFrom,
  getTopicsFrom,
  getCompanyDossiers,
  getPodcastChannels,
  buildKnowledgeCard,
  buildPodcastIntel,
  getCaseStudy,
  buildContext,
  buildBusinessEnglish,
  getRelated as getRelatedFrom,
  getRelatedCompanies,
  getRelatedCases as getRelatedCasesFrom,
  getRelatedPodcasts as getRelatedPodcastsFrom,
  getRelatedEnglish as getRelatedEnglishFrom,
  getRelatedSources as getRelatedSourcesFrom,
  getCompanyDossier,
  getCompanyGroups,
  getSourceIntel as getSourceIntelFrom,
  getSourceById,
  getSourceGroups as getSourceGroupsFrom,
  searchArchive,
  getTodayIntelligence,
  getTodayEdit,
  formatDate,
  relativeTime,
  verticalOf,
  getKnowledgeCard,
  getPodcastIntel,
  getTierACaseCount,
} from "./archive";

/* ─────────── 运行时数据源：Supabase 优先，本地 JSON 回退 ───────────
   设计：采集管线写入 Supabase 后，网站在「访问时」实时取数，实现自动更新；
   未配置 Supabase（本地开发 / 未连接）时回退到构建期 archive.json，保证可构建可运行。
   同一份 Archive 形状，故 archive.ts 的全部纯派生函数（buildKnowledgeCard 等）直接复用。 */

export const PAGE_SIZE = 24;

let cache: Archive | null = null;
let cacheAt = 0;
let source: "supabase" | "json" | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function jsonArchive(): Archive {
  return cleanArchive(getLocalArchive());
}

function newestFirst<T extends { publishedAt?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
  });
}

function sb(): SupabaseClient | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!PUBLIC_SUPABASE_URL || !key) return null;
  return createClient(PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false } });
}

async function supabaseArchive(client: SupabaseClient): Promise<Archive> {
  const [
    signalsRes,
    casesRes,
    podcastsRes,
    englishRes,
    sourcesRes,
    companiesRes,
    epiRes,
    caseRes,
    registryRes,
    metaRes,
  ] = await Promise.all([
    client.from("signals").select("data"),
    client.from("cases").select("data"),
    client.from("podcasts").select("data"),
    client.from("english").select("data"),
    client.from("sources").select("data"),
    client.from("company_refs").select("data"),
    client.from("podcast_episodes").select("data"),
    client.from("case_studies").select("data"),
    client.from("company_registry").select("data"),
    client.from("meta").select("value").eq("key", "archive").maybeSingle(),
  ]);

  // 关键：若核心表查询报错（最常见=表尚未建 / RLS 拦截），必须抛出，
  // 让 getArchiveLive 回退本地 JSON。否则会静默返回空数据却仍标记为「supabase」，
  // 导致页面空内容 + 假的「● 实时」徽标。
  const coreErrs = [signalsRes, casesRes, podcastsRes, englishRes, sourcesRes, companiesRes]
    .filter((r) => r.error)
    .map((r) => r.error!.message);
  if (coreErrs.length) {
    throw new Error("Supabase 核心表读取失败: " + coreErrs.join("; "));
  }

  const signals = newestFirst((signalsRes.data ?? []).map((r: { data: ArchiveItem }) => cleanArchiveItem(r.data)));
  const cases = newestFirst((casesRes.data ?? []).map((r: { data: ArchiveItem }) => cleanArchiveItem(r.data)));
  const podcasts = newestFirst((podcastsRes.data ?? []).map((r: { data: PodcastItem }) => cleanArchiveItem(r.data)));
  const english = newestFirst((englishRes.data ?? []).map((r: { data: EnglishCard }) => cleanEnglishCard(r.data)));
  const sources = (sourcesRes.data ?? []).map((r: { data: SourceRef }) => r.data);
  const companies = (companiesRes.data ?? []).map((r: { data: CompanyRef }) => r.data);
  const episodes = newestFirst((epiRes.data ?? []).map((r: { data: PodcastEpisode }) => cleanPodcastEpisode(r.data)));
  const caseStudies = (caseRes.data ?? []).map((r: { data: CaseStudy }) => r.data);
  const registry = (registryRes.data ?? []).map((r: { data: unknown }) => r.data);

  const meta = (metaRes.data?.value as { generatedAt?: string; stats?: Archive["stats"]; topics?: Archive["topics"] }) ?? {};

  // 用 Supabase 数据覆盖本地注册表 / 单集 / 案例富化层
  const LIVE_COMPANY_REGISTRY = registry.length ? (registry as typeof COMPANY_REGISTRY) : COMPANY_REGISTRY;
  const LIVE_EPISODES = episodes.length ? episodes : PODCAST_EPISODES.map(cleanPodcastEpisode);
  const LIVE_CASE_STUDIES = caseStudies.length ? caseStudies : CASE_STUDIES;

  const archive: Archive = {
    generatedAt: meta.generatedAt ?? new Date().toISOString(),
    stats: meta.stats ?? {
      signals: signals.length,
      cases: cases.length,
      podcasts: podcasts.length,
      english: english.length,
      companies: companies.length,
      sources: sources.length,
      withBody: signals.filter((s) => !s.thin).length,
      withHero: signals.filter((s) => s.hero).length,
    },
    signals,
    cases,
    podcasts,
    podcastShows: podcasts as unknown as Archive["podcastShows"],
    english,
    topics: meta.topics ?? [],
    companies,
    sources,
  };

  // 防御：Supabase 虽连通但返回空档案（常见于 RLS 静默拦截 SELECT / 表尚未灌数据），
  // 不能当成「实时空库」——否则详情页全部 404。此时抛出，让 getArchiveLive 回退本地 JSON。
  if (signals.length === 0 && cases.length === 0 && podcasts.length === 0 && companies.length === 0) {
    throw new Error("Supabase 返回空档案（可能 RLS 拦截 SELECT 或表尚未灌数据），回退本地 JSON");
  }

  // 把运行期派生需要但 archive.json 未必包含的常量指向 Supabase 数据
  liveOverrides.companyRegistry = LIVE_COMPANY_REGISTRY;
  liveOverrides.episodes = LIVE_EPISODES;
  liveOverrides.caseStudies = LIVE_CASE_STUDIES;
  return archive;
}

/** 运行期派生层需要的「覆盖」数据（Supabase 优先） */
export const liveOverrides: {
  companyRegistry: typeof COMPANY_REGISTRY;
  episodes: PodcastEpisode[];
  caseStudies: CaseStudy[];
} = {
  companyRegistry: COMPANY_REGISTRY,
  episodes: PODCAST_EPISODES,
  caseStudies: CASE_STUDIES,
};

/** 统一入口：返回当前数据源的 Archive（缓存于模块生命周期） */
export async function getArchiveLive(): Promise<Archive> {
  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) return cache;
  const client = sb();
  if (client) {
    try {
      cache = await supabaseArchive(client);
      cacheAt = Date.now();
      source = "supabase";
      return cache;
    } catch (e) {
      console.error("[live] Supabase 读取失败，回退本地 JSON：", e);
    }
  }
  cache = jsonArchive();
  cacheAt = Date.now();
  source = "json";
  return cache;
}

/** 当前数据源模式（供页面展示「实时 / 本地」徽标） */
export function liveSource(): "supabase" | "json" | "unknown" {
  return source ?? "unknown";
}

/* ─────────── 分页工具 ─────────── */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function paginate<T>(arr: T[], page = 1, size = PAGE_SIZE): Page<T> {
  const safePage = Math.max(1, page | 0);
  const start = (safePage - 1) * size;
  return {
    items: arr.slice(start, start + size),
    total: arr.length,
    page: safePage,
    size,
    pages: Math.max(1, Math.ceil(arr.length / size)),
  };
}

/* ─────────── 查询（异步，Supabase/JSON 统一） ─────────── */

export async function getSignalsLive(opts: Parameters<typeof filterSignals>[1] = {}): Promise<ArchiveItem[]> {
  return filterSignals(await getArchiveLive(), opts);
}

export async function getCasesLive(opts: Parameters<typeof filterCases>[1] = {}): Promise<ArchiveItem[]> {
  return filterCases(await getArchiveLive(), opts);
}

export async function getCompaniesLive(limit?: number): Promise<CompanyRef[]> {
  const list = (await getArchiveLive()).companies;
  return limit ? list.slice(0, limit) : list;
}

export async function getPodcastChannelsLive(): Promise<PodcastChannelWithHealth[]> {
  await getArchiveLive();
  const src = liveSource();
  // 频道始终来自真实 RSS 注册表（podcasts.episodes.json 的 channels 段），
  // 绝不能用 archive.json 的「播客文章」冒充频道。
  // health 由真实单集数计算（Supabase 模式下单集来自库内 episodes 表）。
  const base = getPodcastChannels();
  const byCh = new Map<string, number>();
  for (const e of liveOverrides.episodes) byCh.set(e.channelId, (byCh.get(e.channelId) ?? 0) + 1);
  return base.map((c) => ({
    ...c,
    health: {
      ok: (byCh.get(c.id) ?? 0) > 0,
      count: byCh.get(c.id) ?? 0,
      lastSuccessAt: "",
      source: src,
    },
  }));
}

export async function getPodcastEpisodesLive(channelId?: string): Promise<PodcastEpisode[]> {
  await getArchiveLive();
  const eps = liveOverrides.episodes;
  const filtered = channelId ? eps.filter((e) => e.channelId === channelId) : eps;
  return [...filtered].sort((a, b) => {
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
  });
}

export async function getPodcastsLive(limit?: number): Promise<PodcastItem[]> {
  const list = newestFirst((await getArchiveLive()).podcasts);
  return limit ? list.slice(0, limit) : list;
}

export async function getEnglishLive(limit?: number): Promise<EnglishCard[]> {
  const list = newestFirst((await getArchiveLive()).english);
  return limit ? list.slice(0, limit) : list;
}

export async function getSourcesLive(): Promise<SourceRef[]> {
  return (await getArchiveLive()).sources;
}

export async function getSourceIntelLive(group?: Parameters<typeof getSourceIntelFrom>[0]) {
  return getSourceIntelFrom(group, await getArchiveLive());
}

export async function getSourceGroupsLive() {
  return getSourceGroupsFrom(await getArchiveLive());
}

export async function getVerticalsLive() {
  return getVerticalsFrom(await getArchiveLive());
}

export async function getTopicsLive() {
  return getTopicsFrom(await getArchiveLive());
}

export async function getCompanyDossiersLive(category?: CompanyCategory): Promise<CompanyDossier[]> {
  // 公司档案是代码内注册表（COMPANY_REGISTRY），与 Supabase 的信号流分离，
  // 保证部署即完整、不依赖建表进度。
  return getCompanyDossiers(category);
}

export async function getItemByIdLive(id: string): Promise<ArchiveItem | PodcastItem | undefined> {
  const a = await getArchiveLive();
  const found = [...a.signals, ...a.cases, ...a.podcasts].find((s) => s.id === id);
  if (found) return found;

  // 防御性兜底：即使 archive 缓存回退到本地 JSON（新采集的 id 不在本地），
  // 仍直接到 Supabase 单表查询，避免详情页间歇性 404。
  const client = sb();
  if (!client) return undefined;

  const ids = encodeURIComponent(id);
  const [sig, cas, pod] = await Promise.all([
    client
      .from("signals")
      .select("data")
      .filter("data->>id", "eq", id)
      .maybeSingle(),
    client
      .from("cases")
      .select("data")
      .filter("data->>id", "eq", id)
      .maybeSingle(),
    client
      .from("podcasts")
      .select("data")
      .filter("data->>id", "eq", id)
      .maybeSingle(),
  ]);

  const row =
    (sig.data?.data as ArchiveItem | PodcastItem | undefined) ||
    (cas.data?.data as ArchiveItem | undefined) ||
    (pod.data?.data as PodcastItem | undefined);

  return row;
}

export async function getItemsByIdsLive(ids: string[]): Promise<ArchiveItem[]> {
  const a = await getArchiveLive();
  const map = new Map([...a.signals, ...a.cases, ...a.podcasts].map((i) => [i.id, i]));
  return ids.map((i) => map.get(i)).filter(Boolean) as ArchiveItem[];
}

export async function getCompanyByIdLive(id: string): Promise<CompanyRef | undefined> {
  return (await getArchiveLive()).companies.find((c) => c.id === id);
}

export async function getCompanyDossierLive(id: string): Promise<CompanyDossier | undefined> {
  return getCompanyDossiersLive().then((d) => d.find((x) => x.id === id));
}

export async function getPodcastEpisodeByIdLive(id: string): Promise<PodcastEpisode | undefined> {
  await getArchiveLive();
  return liveOverrides.episodes.find((e) => e.id === id);
}

export function getCaseStudyLive(id: string): CaseStudy | undefined {
  return liveOverrides.caseStudies.find((c) => c.id === id);
}

function currentArchive(): Archive {
  return cache ?? jsonArchive();
}

export function getRelated(item: ArchiveItem, limit = 4): ArchiveItem[] {
  return getRelatedFrom(item, limit, currentArchive());
}

export function getRelatedCases(item: ArchiveItem, limit = 4): ArchiveItem[] {
  return getRelatedCasesFrom(item, limit, currentArchive());
}

export function getRelatedPodcasts(item: ArchiveItem, limit = 3): PodcastEpisode[] {
  return getRelatedPodcastsFrom(item, limit, liveOverrides.episodes);
}

export function getRelatedEnglish(item: ArchiveItem, limit = 2): EnglishCard[] {
  return getRelatedEnglishFrom(item, limit, currentArchive());
}

export function getRelatedSources(item: ArchiveItem, limit = 6): SourceIntel[] {
  return getRelatedSourcesFrom(item, limit, currentArchive());
}

export function getSourceIntel(group?: Parameters<typeof getSourceIntelFrom>[0]) {
  return getSourceIntelFrom(group, currentArchive());
}

export function getSourceGroups() {
  return getSourceGroupsFrom(currentArchive());
}

/* ─────────── 复用 archive.ts 的纯派生（详情页结构化卡片） ─────────── */
export {
  buildKnowledgeCard,
  buildPodcastIntel,
  getCaseStudy,
  buildContext,
  buildBusinessEnglish,
  getRelatedCompanies,
  getCompanyDossier,
  getCompanyGroups,
  getSourceById,
  getKnowledgeCard,
  getPodcastIntel,
  getTierACaseCount,
  formatDate,
  relativeTime,
  verticalOf,
  getTodayIntelligence,
  getTodayEdit,
  searchArchive,
} from "./archive";

/** 搜索（复用 archive.ts 逻辑，传入 live archive） */
export async function searchArchiveLive(q: string, limit = 60): Promise<ArchiveItem[]> {
  return searchArchive(q, limit, await getArchiveLive());
}
