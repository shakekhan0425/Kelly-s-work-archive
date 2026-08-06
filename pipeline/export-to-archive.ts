/**
 * 将 Supabase 中真实采集 + AI 萃取的文章，合并写回 data/archive.json，
 * 供静态工作台（next build）消费。
 *
 * 设计：
 *  - 保留 archive.json 中已有的全部条目（含原有 167 条 signals）。
 *  - 按 original_url 去重：已存在则更新为真实抓取版本；不存在则追加。
 *  - 绝不编造：只搬运 Supabase 中已有的真实数据。
 *
 * 运行：npm run pipeline:export
 */
import './lib/env';
import fs from 'node:fs';
import path from 'node:path';
import { getSupabaseAdmin } from './lib/supabase';
import type { KnowledgeCard } from './lib/types';

interface ArchiveItemShape {
  id: string;
  slug: string;
  title: string;
  url: string;
  summary: string;
  hero: string | null;
  byline: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  sourceSite: string;
  lang: string;
  category: string;
  topics: string[];
  brands: string[];
  blocks: unknown[];
  wordCount: number;
  readMinutes: number;
  thin: boolean;
  knowledge?: KnowledgeCard;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'item';
}

async function main() {
  const sb = getSupabaseAdmin();

  // 拉取来源主页，用于填 sourceSite
  const { data: sources } = await sb.from('sources').select('id,data');
  const homeBySource = new Map(
    (sources || []).map((s: any) => [s.id, s.data?.site || s.data?.url || ''])
  );

  // 拉取全部已采集文章（signals 表，data 即 ArchiveItem，按发布时间倒序）
  const { data: articles, error } = await sb
    .from('signals')
    .select('data')
    .order('data->>publishedAt', { ascending: false })
    .limit(2000);
  if (error) throw error;
  console.log(`Supabase signals 数: ${(articles || []).length}`);

  const archivePath = path.join(process.cwd(), 'data', 'archive.json');
  const raw = fs.readFileSync(archivePath, 'utf8');
  const archive = JSON.parse(raw);
  const existing: ArchiveItemShape[] = archive.signals || [];
  const byUrl = new Map(existing.map((s) => [s.url, s]));

  let added = 0;
  let updated = 0;
  for (const a of articles || []) {
    const item = a.data as ArchiveItemShape;
    const url: string = item.url || '';
    if (!url) continue;
    item.slug = slugify(item.title);
    if (byUrl.has(url)) {
      const idx = existing.indexOf(byUrl.get(url)!);
      existing[idx] = item;
      updated++;
    } else {
      existing.push(item);
      byUrl.set(url, item);
      added++;
    }
  }

  archive.signals = existing;
  const withBody = existing.filter((s) => s.blocks && s.blocks.length > 0 && !s.thin).length;
  const withHero = existing.filter((s) => s.hero).length;
  archive.stats = {
    ...archive.stats,
    signals: existing.length,
    withBody,
    withHero,
  };
  archive.generatedAt = new Date().toISOString();
  fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
  console.log(`合并完成: 新增 ${added} / 更新 ${updated} / 现有总计 ${existing.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
