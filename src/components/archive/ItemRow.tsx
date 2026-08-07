import Link from 'next/link';
import type { ArchiveItem } from '@/lib/data/types';
import { formatDate } from '@/lib/format';
import { isChinese } from './ArticleBody';

/** 列表行：缩略图 + 标题 + 摘要 + 元信息 */
export default function ItemRow({
  item,
  href,
  onClick,
}: {
  item: ArchiveItem;
  href?: string;
  onClick?: () => void;
}) {
  const link = href || `/signals/${item.id}`;
  const cn = isChinese(item.title);
  return (
    <article className="list-row">
      <Link href={link} aria-hidden tabIndex={-1} onClick={onClick}>
        {item.hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="list-thumb" src={item.hero} alt="" loading="lazy" />
        ) : (
          <div className="list-thumb-empty">Aa</div>
        )}
      </Link>
      <div style={{ minWidth: 0 }}>
        <div className="meta-line">
          <span style={{ color: 'var(--color-archive-red)' }}>{item.sourceName}</span>
          {item.publishedAt ? (
            <>
              <span className="sep">/</span>
              <span>{formatDate(item.publishedAt)}</span>
            </>
          ) : null}
          {item.readMinutes && !item.thin ? (
            <>
              <span className="sep">/</span>
              <span>{item.readMinutes} min</span>
            </>
          ) : null}
          {item.lang === 'en' ? <span className="stamp stamp-lav">EN</span> : null}
        </div>
        <h3 className={`list-title ${cn ? '' : 'is-en'}`}>
          <Link href={link} onClick={onClick}>{item.title}</Link>
        </h3>
        {item.summary ? <p className="list-dek">{item.summary}</p> : null}
        {item.topics.length ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {item.topics.slice(0, 3).map((t) => (
              <span key={t} className="stamp">
                {t}
              </span>
            ))}
            {item.brands.slice(0, 2).map((b) => (
              <span key={b} className="stamp stamp-coral">
                {b}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** 卡片：图 + 标题（网格用） */
export function ItemCard({ item, href }: { item: ArchiveItem; href?: string }) {
  const link = href || `/signals/${item.id}`;
  const cn = isChinese(item.title);
  return (
    <Link href={link} className="editorial-card" style={{ textDecoration: 'none' }}>
      {item.hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="card-img" src={item.hero} alt="" loading="lazy" />
      ) : (
        <div className="list-thumb-empty" style={{ aspectRatio: '16 / 10' }}>
          Aa
        </div>
      )}
      <div className="kicker">{item.sourceName}</div>
      <h3 className={`card-title ${cn ? '' : 'is-en'}`}>{item.title}</h3>
      <div className="meta-line" style={{ marginTop: 'auto' }}>
        {item.publishedAt ? <span>{formatDate(item.publishedAt)}</span> : <span>未标注日期</span>}
        {!item.thin ? (
          <>
            <span className="sep">/</span>
            <span>{item.readMinutes} min</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}

/** 紧凑文摘行（Quick Picks / 相关阅读） */
export function ItemBrief({ item, href }: { item: ArchiveItem; href?: string }) {
  const link = href || `/signals/${item.id}`;
  const cn = isChinese(item.title);
  return (
    <Link href={link} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="meta-line" style={{ marginBottom: 4 }}>
        <span style={{ color: 'var(--color-archive-red)' }}>{item.sourceName}</span>
        {item.publishedAt ? (
          <>
            <span className="sep">/</span>
            <span>{formatDate(item.publishedAt)}</span>
          </>
        ) : null}
      </div>
      <div
        className={cn ? '' : 'is-en'}
        style={{
          fontFamily: cn ? 'var(--font-serif-cn)' : 'var(--font-display)',
          fontSize: 14.5,
          lineHeight: 1.5,
          fontWeight: 600,
        }}
      >
        {item.title}
      </div>
    </Link>
  );
}
