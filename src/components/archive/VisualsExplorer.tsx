import Link from "next/link";

export interface VizItem {
  id: string;
  kind: "signal" | "case";
  title: string;
  hero: string;
  sourceName: string;
  vertical: string;
  url: string;
}

export interface VizVert {
  id: string;
  label: string;
  zh?: string;
}

export function VisualsExplorer({
  items,
  total,
  verticals,
  sources,
  current,
}: {
  items: VizItem[];
  total: number;
  verticals: VizVert[];
  sources: string[];
  current: { v: string; src: string };
}) {
  const { v, src } = current;

  const hrefFor = (over: { v?: string; src?: string }) => {
    const p = new URLSearchParams();
    const next = { v: over.v !== undefined ? over.v : v, src: over.src !== undefined ? over.src : src };
    if (next.v) p.set("v", next.v);
    if (next.src) p.set("src", next.src);
    const s = p.toString();
    return s ? `/visuals?${s}` : "/visuals";
  };

  return (
    <div className="viz-wrap">
      <header className="src-hero">
        <div className="src-kicker">Visual Library</div>
        <h1 className="src-title">视觉素材库</h1>
        <p className="src-lead">
          从真实抓取的行业内容中提取的视觉母题——仅保存允许展示的缩略图与元数据，点击跳往原文。
          共 {total} 张真实配图，可用于品牌审美积累与 moodboard 灵感。
        </p>
        <div className="src-stats">
          <div>
            <b>{total}</b>
            <span>真实配图</span>
          </div>
          <div>
            <b>{verticals.length}</b>
            <span>垂直分类</span>
          </div>
          <div>
            <b>{sources.length}</b>
            <span>来源</span>
          </div>
        </div>
      </header>

      <div className="filter-bar">
        <Link href={hrefFor({ v: "", src: "" })} className={`chip ${!v && !src ? "on" : ""}`}>
          全部
        </Link>
        {verticals.map((vt) => (
          <Link
            key={vt.id}
            href={hrefFor({ v: vt.id })}
            className={`chip ${v === vt.id ? "on" : ""}`}
          >
            {vt.zh ? `${vt.zh} · ` : ""}
            {vt.label}
          </Link>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="filter-bar" style={{ marginTop: 8 }}>
          <span className="filter-label">来源</span>
          {sources.map((s) => (
            <Link
              key={s}
              href={hrefFor({ src: s })}
              className={`filter-chip sub ${src === s ? "is-on" : ""}`}
            >
              {s} <span className="fc-n">{items.filter((i) => i.sourceName === s).length}</span>
            </Link>
          ))}
        </div>
      )}

      {src ? (
        <div className="src-current">
          来源筛选：<b>{src}</b> · <Link href={hrefFor({ src: "" })} className="crumb">清除</Link>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="empty-note">该筛选下暂无视觉素材。</div>
      ) : (
        <div className="viz-grid">
          {items.map((it) => (
            <a
              key={`${it.kind}_${it.id}`}
              className="viz-card"
              href={it.url}
              target="_blank"
              rel="noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="viz-img" src={it.hero} alt={it.title} loading="lazy" />
              <div className="viz-meta">
                <div className="viz-title">{it.title}</div>
                <div className="viz-foot">
                  <span>{it.sourceName}</span>
                  <span className="stamp stamp-lav">{it.vertical}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
