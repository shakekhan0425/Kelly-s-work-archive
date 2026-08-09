/**
 * Build-time Podcast RSS fetcher.
 * Fetches each real channel's RSS, parses latest episodes, and writes
 * src/lib/data/podcasts.episodes.json and, when configured, Supabase.
 * FAILURES ARE SKIPPED — never fabricated.
 */
import './lib/env';
import { PODCAST_CHANNELS } from '../src/lib/data/podcasts.registry.ts';
import { getSupabaseAdmin } from './lib/supabase';
import { writeFileSync } from 'node:fs';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(s: string): string {
  if (!s) return '';
  return decode(
    s
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i');
  const m = block.match(re);
  return m ? decode(m[1]).trim() : '';
}

function attr(block: string, tagName: string, attr: string): string {
  const re = new RegExp(`<${tagName}[^>]*\\b${attr}=["']([^"']+)["'][^>]*>`, 'i');
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function looksLikeFeed(xml: string): boolean {
  const s = xml.slice(0, 2000).toLowerCase();
  return (
    s.includes('<rss') ||
    s.includes('<feed') ||
    s.includes('<item') ||
    s.includes('<entry') ||
    s.includes('xmlns')
  );
}

interface Episode {
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

function parseFeed(xml: string, channelId: string, show: string, showImage: string, fallbackLink = ''): Episode[] {
  const out: Episode[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  if (blocks.length === 0) {
    // Atom
    const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
    for (let i = 0; i < entries.length && out.length < 14; i++) {
      const b = entries[i];
      const title = tag(b, 'title');
      let link = attr(b, 'link', 'href');
      if (!link) link = tag(b, 'link');
      if (!link) link = tag(b, 'id');
      const pub = tag(b, 'updated') || tag(b, 'published') || tag(b, 'issued');
      const summary = stripHtml(tag(b, 'summary') || tag(b, 'content'));
      if (title && (link || fallbackLink)) {
        out.push({
          id: `${channelId}__${i}`,
          channelId,
          show,
          showImage,
          title: decode(title),
          link: link || fallbackLink,
          publishedAt: pub ? new Date(pub).toISOString() : '',
          summary: summary.slice(0, 700),
          duration: '',
          audio: '',
        });
      }
    }
    return out;
  }
  for (let i = 0; i < blocks.length && out.length < 14; i++) {
    const b = blocks[i];
    const title = tag(b, 'title');
    let link = tag(b, 'link');
    if (!link) link = attr(b, 'link', 'href');
    if (!link) link = tag(b, 'guid'); // Megaphone/Art19 omit <link>, put URL in <guid>
    const pub = tag(b, 'pubDate') || tag(b, 'dc:date') || tag(b, 'published');
    const desc = stripHtml(tag(b, 'description') || tag(b, 'content:encoded') || tag(b, 'summary'));
    const dur = tag(b, 'itunes:duration');
    const img = attr(b, 'itunes:image', 'href') || attr(b, 'media:thumbnail', 'url');
    if (title && (link || fallbackLink)) {
      out.push({
        id: `${channelId}__${i}`,
        channelId,
        show,
        showImage: img || showImage,
        title: decode(title),
        link: link || fallbackLink,
        publishedAt: pub ? new Date(pub).toISOString() : '',
        summary: desc.slice(0, 700),
        duration: dur,
        audio: attr(b, 'enclosure', 'url'),
      });
    }
  }
  return out;
}

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const episodes: Episode[] = [];
  const channels: any[] = [];
  const health: Record<string, { ok: boolean; count: number; lastSuccessAt: string; source: string }> = {};

  for (const ch of PODCAST_CHANNELS) {
    let xml = await fetchText(ch.rss);
    let source = ch.rss;
    if (!xml || !looksLikeFeed(xml)) {
      const alt = await fetchText(ch.site);
      if (alt && looksLikeFeed(alt)) {
        xml = alt;
        source = ch.site;
      }
    }
    if (xml && looksLikeFeed(xml)) {
      const eps = parseFeed(xml, ch.id, ch.name, ch.image, ch.site).slice(0, 12);
      eps.forEach((e) => episodes.push(e));
      health[ch.id] = {
        ok: eps.length > 0,
        count: eps.length,
        lastSuccessAt: new Date().toISOString(),
        source,
      };
      channels.push({ ...ch, health: health[ch.id] });
      console.log(`OK   ${ch.id.padEnd(28)} ${eps.length} episodes  (${source.slice(0, 50)})`);
    } else {
      health[ch.id] = { ok: false, count: 0, lastSuccessAt: '', source };
      channels.push({ ...ch, health: health[ch.id] });
      console.log(`FAIL ${ch.id.padEnd(28)} no feed  (rss=${ch.rss.slice(0, 45)})`);
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    channels,
    episodes,
  };
  writeFileSync('src/lib/data/podcasts.episodes.json', JSON.stringify(payload, null, 2));

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && episodes.length > 0) {
    const sb = getSupabaseAdmin();
    const rows = episodes.map((episode) => ({
      id: episode.id,
      channel_id: episode.channelId,
      data: episode,
    }));
    const { error } = await sb.from('podcast_episodes').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    console.log(`✓ Supabase: upserted ${rows.length} podcast episodes.`);
  }

  const okCount = channels.filter((c) => c.health.ok).length;
  console.log(`\nDONE: ${okCount}/${channels.length} channels fetched, ${episodes.length} episodes total.`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
