import type { Block } from '@/lib/data/types';
import ImageWithFallback from "@/components/archive/ImageWithFallback";

/** 中文占比判断，决定排版字体族 */
export function isChinese(text: string): boolean {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  return cjk > text.length * 0.12;
}

export default function ArticleBody({ blocks, lang }: { blocks: Block[]; lang: string }) {
  const cn = lang !== 'en';

  if (!blocks.length) {
    return (
      <div className="empty-state" style={{ maxWidth: '68ch' }}>
        <div className="empty-mark">Abstract only</div>
        <p style={{ fontSize: 14 }}>
          该来源未提供可提取的正文段落，仅收录了标题与摘要。
          <br />
          可通过右侧「阅读原文」前往来源站点查看完整内容。
        </p>
      </div>
    );
  }

  return (
    <div className={`prose-archive ${cn ? '' : 'is-en'}`} lang={cn ? 'zh-CN' : 'en'}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading': {
            const lvl = Math.min(Math.max(b.level, 2), 4);
            if (lvl === 2) return <h2 key={i}>{b.text}</h2>;
            if (lvl === 3) return <h3 key={i}>{b.text}</h3>;
            return <h4 key={i}>{b.text}</h4>;
          }
          case 'quote':
            return (
              <blockquote key={i} className={isChinese(b.text) ? 'is-cn' : ''}>
                {b.text}
              </blockquote>
            );
          case 'list':
            return b.ordered ? (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case 'image':
            return (
              <figure key={i} className="read-figure">
                <ImageWithFallback
                  src={b.src}
                  alt={b.caption || ''}
                  loading="lazy"
                  fallback={{ source: "ARCHIVE", category: "" }}
                />
                {b.caption ? <figcaption>{b.caption}</figcaption> : null}
              </figure>
            );
          case 'code':
            return <pre key={i}>{b.text}</pre>;
          default:
            return <p key={i}>{b.text}</p>;
        }
      })}
      <div className="read-endmark" aria-hidden>
        ❧
      </div>
    </div>
  );
}
