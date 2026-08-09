/**
 * 从 Supabase 中真实已抓取的文章正文提取商务英语语料。
 * 只保存文章中实际出现的句子，不生成虚构例句或来源。
 */
import './lib/env';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from './lib/supabase';
import { cleanText, cleanTitle } from '../src/lib/data/content-clean';

const TERMS = [
  'brand', 'branding', 'marketing', 'campaign', 'consumer', 'luxury', 'revenue',
  'growth', 'dtc', 'omni-channel', 'omni', 'kol', 'influencer', 'ai', 'genai',
  'llm', 'retention', 'loyalty', 'positioning', 'brand equity', 'crm', 'roi',
  'cmo', 'saas', 'ipo', 'merger', 'acquisition', 'm&a', 'earnings', 'guidance',
  'churn', 'funnel', 'personalization', 'creator economy', 'sustainability', 'esg',
  'private label', 'retail media', 'first-party data', 'creator', 'ecommerce',
];

interface SignalBlock {
  type?: string;
  text?: string;
}

interface SignalData {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  publishedAt?: string;
  blocks?: SignalBlock[];
}

function hash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 20);
}

function paragraphs(item: SignalData): string[] {
  return (item.blocks ?? [])
    .filter((block) => block.type === 'para' && typeof block.text === 'string')
    .map((block) => cleanText(block.text!))
    .filter(Boolean);
}

async function main() {
  const sb = getSupabaseAdmin();
  const { data: rows, error: readError } = await sb
    .from('signals')
    .select('data')
    .order('updated_at', { ascending: false })
    .limit(400);
  if (readError) throw readError;

  const cards: Array<{
    id: string;
    data: {
      id: string;
      sentence: string;
      terms: string[];
      sourceTitle: string;
      sourceName: string;
      url: string;
      publishedAt: string;
    };
  }> = [];

  for (const row of rows ?? []) {
    const item = row.data as SignalData;
    if (!item?.id || !item.title || !item.url) continue;
    const text = paragraphs(item);
    for (const term of TERMS) {
      const sentence = text.find((p) => p.toLowerCase().includes(term.toLowerCase()));
      if (!sentence) continue;
      const data = {
        id: `english_${hash(`${item.id}|${term}`)}`,
        sentence,
        terms: [term],
      sourceTitle: cleanTitle(item.title),
      sourceName: cleanText(item.sourceName),
        url: item.url,
        publishedAt: item.publishedAt ?? '',
      };
      cards.push({ id: data.id, data });
    }
  }

  if (cards.length === 0) {
    console.log('No new English corpus extracted; existing data preserved.');
    return;
  }

  const { error: writeError } = await sb.from('english').upsert(cards, { onConflict: 'id' });
  if (writeError) throw writeError;
  console.log(`✓ English corpus: upserted ${cards.length} real sentence cards.`);
}

main().catch((error) => {
  console.error('English corpus ingest failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
