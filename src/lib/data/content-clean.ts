import type { Archive, ArchiveItem, Block, EnglishCard, PodcastEpisode, PodcastItem } from './types';

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  middot: '·',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  bull: '•',
  copy: '©',
  reg: '®',
  trade: '™',
};

/** 解码抓取源常见的 HTML 实体，兼容重复编码（例如 &amp;lt;）。 */
export function decodeHtmlEntities(value: string): string {
  let result = value;
  for (let pass = 0; pass < 3; pass++) {
    const previous = result;
    const next = result.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (full, entity: string) => {
      if (entity[0] === '#') {
        const hex = entity[1]?.toLowerCase() === 'x';
        const raw = hex ? entity.slice(2) : entity.slice(1);
        const code = Number.parseInt(raw, hex ? 16 : 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : full;
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? full;
    });
    result = next;
    if (next === previous) break;
  }
  return result;
}

function cutArtifacts(value: string): string {
  const artifact = /(?:el-pagination|btn-next|btn-prev|is-background|shouldInjectCss|document\.getElementsByTagName|webpackJsonp|__NEXT_DATA__)/i;
  const index = value.search(artifact);
  return index >= 0 ? value.slice(0, index).replace(/[\s"'`})\].:;,\-]+$/g, '') : value;
}

/** 将 RSS/HTML/富文本字段转成可直接展示的纯文本。 */
export function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  let text = value;
  for (let pass = 0; pass < 2; pass++) {
    text = decodeHtmlEntities(text)
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, ' ')
      .replace(/<img\b[^>]*>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|h[1-6]|blockquote)\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ');
  }
  return cutArtifacts(text)
    .replace(/[ \t\f\r]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function cleanTitle(value: unknown): string {
  const decoded = decodeHtmlEntities(typeof value === 'string' ? value : '');
  const emphasized = decoded.match(/<b\b[^>]*>([\s\S]*?)<\/b>/i)?.[1];
  return cleanText(emphasized ?? decoded).replace(/\s*[|｜]\s*$/, '').trim();
}

function cleanBlock(block: Block): Block {
  switch (block.type) {
    case 'image':
      return { ...block, caption: block.caption ? cleanText(block.caption) : block.caption };
    case 'list':
      return { ...block, items: block.items.map((item) => cleanText(item)).filter(Boolean) };
    default:
      return { ...block, text: cleanText(block.text) };
  }
}

export function cleanArchiveItem<T extends ArchiveItem | PodcastItem>(item: T): T {
  const rawBlocks = Array.isArray(item.blocks) ? item.blocks : [];
  return {
    ...item,
    title: cleanTitle(item.title),
    summary: cleanText(item.summary),
    byline: cleanText(item.byline),
    sourceName: cleanText(item.sourceName),
    category: cleanText(item.category),
    topics: (Array.isArray(item.topics) ? item.topics : []).map((topic) => cleanText(topic)).filter(Boolean),
    brands: (Array.isArray(item.brands) ? item.brands : []).map((brand) => cleanText(brand)).filter(Boolean),
    blocks: rawBlocks.filter((block): block is Block => Boolean(block && typeof block === 'object' && 'type' in block)).map(cleanBlock),
  } as T;
}

export function cleanEnglishCard(card: EnglishCard): EnglishCard {
  return {
    ...card,
    sentence: cleanText(card.sentence),
    terms: (Array.isArray(card.terms) ? card.terms : []).map((term) => cleanText(term)).filter(Boolean),
    sourceTitle: cleanTitle(card.sourceTitle),
    sourceName: cleanText(card.sourceName),
  };
}

export function cleanPodcastEpisode(episode: PodcastEpisode): PodcastEpisode {
  return {
    ...episode,
    show: cleanText(episode.show),
    title: cleanTitle(episode.title),
    summary: cleanText(episode.summary),
  };
}

export function cleanArchive(archive: Archive): Archive {
  return {
    ...archive,
    signals: archive.signals.map((item) => cleanArchiveItem(item)),
    cases: archive.cases.map((item) => cleanArchiveItem(item)),
    podcasts: archive.podcasts.map((item) => cleanArchiveItem(item)),
    english: archive.english.map(cleanEnglishCard),
  };
}
