import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { ItemBrief } from "@/components/archive/ItemRow";
import {
  getTodayIntelligence,
  getSignalsLive,
  getEnglishLive,
  getPodcastsLive,
  getVerticalsLive,
  getCompanyDossiersLive,
  getArchiveLive,
  liveSource,
} from "@/lib/data/live";

export default async function DeskPage() {
  const today = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

    const [ti, verticals, english, podcasts, recent, archive, dossiers] = await Promise.all([
    getTodayIntelligence(await getArchiveLive()),
    getVerticalsLive(),
    getEnglishLive(4),
    getPodcastsLive(4),
    getSignalsLive({ limit: 8 }),
    getArchiveLive(),
    getCompanyDossiersLive(),
  ]);
  const stats = archive.stats;
  const companyCount = dossiers.length;
  const src = liveSource();

  const sinceLast = [
    { label: "市场情报", href: "/signals", n: stats.signals },
    { label: "品牌案例", href: "/cases", n: stats.cases },
    { label: "公司研究", href: "/companies", n: companyCount },
    { label: "播客单集", href: "/podcasts", n: stats.podcasts },
    { label: "商务英语", href: "/english", n: stats.english },
    { label: "来源体系", href: "/sources", n: stats.sources },
  ];

  return (
    <ArchiveShell>
      {/* A. Cover Header */}
      <section className="paper-panel torn" style={{ padding: 22, marginBottom: 22 }}>
        <span className="tape" aria-hidden="true">
          Daily Desk
        </span>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Today’s Issue · {today}
            </div>
            <h1 style={{ fontSize: 34, lineHeight: 1.05 }}>今日工作档案馆</h1>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="issue-no">No. 001</span>
              <span className="stamp">实时抓取</span>
              <span className="stamp">情报 {stats.signals}</span>
              <span className="stamp">案例 {stats.cases}</span>
              <span className="stamp">播客 {stats.podcasts}</span>
            </div>
            {src === "supabase" ? (
              <span className="live-badge" style={{ marginLeft: 8 }} title="数据来自 Supabase，实时更新">● 实时</span>
            ) : src === "json" ? (
              <span
                className="live-badge"
                style={{ marginLeft: 8, background: "#eef0f3", color: "#6b7280", borderColor: "#e2e5ea" }}
                title="未连接 Supabase，使用本地归档数据"
              >
                ● 本地档案
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Link href="/signals" className="btn btn-primary">
              浏览最新情报 →
            </Link>
            <Link href="/sources" className="btn btn-ghost">
              来源体系
            </Link>
          </div>
        </div>
      </section>

      {/* B. Today's Intelligence（5 行业变化 / 1 案例 / 1 公司 / 1 播客 / 1 英语） */}
      <section className="paper-panel" style={{ padding: 18, marginBottom: 22 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader eyebrow="Today’s Intelligence" title="今日情报" />
        <div className="ti-grid">
          <div className="ti-changes">
            <div className="ti-h">5 个行业变化</div>
            {ti.changes.map((s) => (
              <Link key={s.id} href={`/signals/${s.id}`} className="ti-change">
                <span className="ti-vert">{s.category}</span>
                <span className="ti-ct">{s.title}</span>
              </Link>
            ))}
          </div>
          <div className="ti-side">
            {ti.caseItem ? (
              <Link href={`/cases/${ti.caseItem.id}`} className="ti-feature">
                <span className="ti-tag">案例</span>
                <span className="ti-ft">{ti.caseItem.title}</span>
                <span className="ti-fs">{ti.caseItem.sourceName}</span>
              </Link>
            ) : null}
            {ti.company ? (
              <Link href={`/companies/${ti.company.id}`} className="ti-feature">
                <span className="ti-tag">公司动态</span>
                <span className="ti-ft">{ti.company.name}</span>
                <span className="ti-fs">
                  {ti.company.recentMoves[0] ?? ti.company.overview.slice(0, 40)}
                </span>
              </Link>
            ) : null}
            {ti.podcast ? (
              <Link href={`/podcasts/${ti.podcast.id}`} className="ti-feature">
                <span className="ti-tag">播客</span>
                <span className="ti-ft">{ti.podcast.title}</span>
                <span className="ti-fs">{ti.podcast.show}</span>
              </Link>
            ) : null}
            {ti.english ? (
              <Link href={`/english#${ti.english.id}`} className="ti-feature">
                <span className="ti-tag">English Brief</span>
                <span className="ti-ft">{ti.english.sourceTitle}</span>
                <span className="ti-fs">“{ti.english.sentence.slice(0, 48)}…”</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* C. Quick Picks — 垂直速选 */}
      <section style={{ marginBottom: 22 }}>
        <SectionHeader eyebrow="Quick Picks" title="今日速选 · 按垂直" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {verticals.map((v) => (
            <Link key={v.id} href={`/signals?v=${v.id}`} className="chip" aria-pressed="false">
              {v.zh} · {v.label} <span style={{ opacity: 0.6 }}>{v.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* D. Since Your Last Visit */}
      <section style={{ marginBottom: 22 }}>
        <SectionHeader eyebrow="Since Your Last Visit" title="档案总览" />
        <div className="grid-stats">
          {sinceLast.map((s) => (
            <Link key={s.label} href={s.href} className="stat-tile" style={{ textDecoration: "none" }}>
              <span className="num">{s.n}</span>
              <span className="lbl">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* E. Daily English */}
      <section style={{ marginBottom: 22 }}>
        <SectionHeader
          eyebrow="Daily English"
          title="每日商务英语"
          action={{ href: "/english", label: "进入英语库" }}
        />
        {english.length > 0 ? (
          <div className="en-grid">
            {english.map((e) => (
              <a key={e.id} className="en-card" href={e.url} target="_blank" rel="noreferrer">
                <div className="en-sentence">“{e.sentence}”</div>
                <div className="en-terms">
                  {e.terms.slice(0, 3).map((t) => (
                    <span key={t} className="stamp stamp-lav">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="meta-line" style={{ marginTop: 8 }}>
                  <span>{e.sourceName}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="list-dek">暂无英语条目。</p>
        )}
      </section>

      {/* F. Podcast Shelf */}
      <section style={{ marginBottom: 22 }}>
        <SectionHeader
          eyebrow="Podcast Shelf"
          title="播客书架"
          action={{ href: "/podcasts", label: "浏览播客" }}
        />
        {podcasts.length > 0 ? (
          <div className="pod-grid">
            {podcasts.map((p) => (
              <Link key={p.id} href={`/podcasts/${p.id}`} className="pod-row">
                {p.showImage || p.hero ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="pod-cover" src={p.showImage || p.hero} alt="" loading="lazy" />
                ) : (
                  <div className="pod-cover-empty">♪</div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div className="meta-line">
                    <span style={{ color: "var(--color-archive-red)" }}>{p.show}</span>
                  </div>
                  <div className="pod-title">{p.title}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="list-dek">暂无播客单集。</p>
        )}
      </section>

      {/* G. Recent Archive */}
      <section>
        <SectionHeader
          eyebrow="Recent Archive"
          title="最近档案"
          action={{ href: "/signals", label: "打开情报库" }}
        />
        <div className="col-list">
          {recent.map((s) => (
            <ItemBrief key={s.id} item={s} />
          ))}
        </div>
      </section>
    </ArchiveShell>
  );
}
