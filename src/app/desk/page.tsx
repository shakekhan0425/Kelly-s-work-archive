import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import {
  getTodayIntelligence,
  getCompanyDossiersLive,
  getArchiveLive,
  liveSource,
  getCaseStudyLive,
  getPodcastEpisodesLive,
} from "@/lib/data/live";
import { ArrowRight } from "lucide-react";
import ServerImage from "@/components/archive/ServerImage";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1600&q=80", // Amalfi coast
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80", // Paris street
  "https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=1600&q=80", // Lisbon tiles
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&q=80", // Cinque Terre
];
const DISPLAY_TIME_ZONE = "Asia/Shanghai";

export const dynamic = "force-dynamic";

function formatDeskTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: DISPLAY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function heroImage() {
  const day = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TIME_ZONE,
    day: "numeric",
  }).format(new Date()));
  return HERO_IMAGES[day % HERO_IMAGES.length];
}

export default async function DeskPage() {
  const todayLong = new Intl.DateTimeFormat("zh-CN", {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  const todayShort = new Intl.DateTimeFormat("zh-CN", {
    timeZone: DISPLAY_TIME_ZONE,
    month: "long",
    day: "numeric",
  }).format(new Date());

  const archive = await getArchiveLive();
  const [dossiers, latestEpisodes] = await Promise.all([
    getCompanyDossiersLive(),
    getPodcastEpisodesLive(),
  ]);
  const tiRaw = getTodayIntelligence(archive);

  // Desk 只展示已发布条目：摘要/正文缺失的 thin 项不进入今日情报列表与右栏精选
  const ti = {
    ...tiRaw,
    changes: tiRaw.changes.filter((s) => !s.thin && s.title && s.publishedAt),
  };

  const stats = archive.stats;
  const src = liveSource();

  // Right rail picks：只从已发布条目中选
  const publishedCases = archive.cases.filter((c) => !c.thin);
  const publishedSignals = archive.signals.filter((s) => !s.thin);
  const casePick = ti.caseItem && !ti.caseItem.thin
    ? getCaseStudyLive(ti.caseItem.id) ?? ti.caseItem
    : publishedCases[0] ?? null;
  const companyPick = ti.company ?? dossiers.find((d) => d.tier === "A") ?? dossiers[0];
  const podcastPick = latestEpisodes[0] ?? ti.podcast ?? archive.podcasts[0];

  return (
    <ArchiveShell>
      {/* ── Hero ── */}
      <section className="desk-hero-wrap">
        <div className="desk-hero">
          <div className="desk-hero-text">
            <div className="desk-hero-kicker">
              <span className="desk-hero-handwritten">Daily Desk</span>
              <span className="desk-hero-issue">TODAY&apos;S ISSUE · {todayShort}</span>
            </div>
            <h1 className="desk-hero-title">今日工作档案馆</h1>
            <div className="desk-hero-badges">
              <span className="desk-hero-no">No. 001</span>
              <span className="desk-hero-pill">情报 {stats.signals}</span>
              <span className="desk-hero-pill">案例 {stats.cases}</span>
              <span className="desk-hero-pill">播客 {stats.podcasts}</span>
              {src === "supabase" ? (
                <span className="desk-hero-live">实时抓取</span>
              ) : (
                <span className="desk-hero-live local">本地档案</span>
              )}
            </div>
          </div>

          <div className="desk-hero-visual">
            <ServerImage
              className="desk-hero-image"
              src={heroImage()}
              alt="Europe film photography"
              loading="eager"
            />
          </div>

          <div className="desk-hero-actions">
            <Link href="/signals" className="desk-hero-cta primary">
              浏览最新情报 <ArrowRight size={14} />
            </Link>
            <Link href="/sources" className="desk-hero-cta">
              来源体系
            </Link>
          </div>
        </div>
      </section>

      {/* ── Today&apos;s Intelligence + Right Rail ── */}
      <section className="desk-today">
        <div className="desk-today-header">
          <div>
            <span className="desk-handwritten">Today&apos;s Intelligence</span>
            <h2 className="desk-section-title">今日情报</h2>
          </div>
          <span className="desk-today-count">{ti.changes.length} 个行业变化</span>
        </div>

        <div className="desk-today-grid">
          <div className="ti-list">
            {ti.changes.map((s) => (
              <Link key={s.id} href={`/signals/${s.id}`} className="ti-row">
                <span className="ti-cat">{s.category}</span>
                <span className="ti-headline">{s.title}</span>
                <span className="ti-time">
                  {s.publishedAt ? formatDeskTime(s.publishedAt) : ""}
                </span>
                <ArrowRight size={14} className="ti-arrow" />
              </Link>
            ))}
            <Link href="/signals" className="ti-row more">
              <span className="ti-cat" />
              <span className="ti-headline">打开情报库</span>
              <span className="ti-time" />
              <ArrowRight size={14} className="ti-arrow" />
            </Link>
          </div>

          <aside className="desk-rail">
            {casePick ? (
              <Link
                href={`/cases/${"id" in casePick ? casePick.id : ""}`}
                className="rail-card"
              >
                <div className="rail-card-head">
                  <span className="rail-handwritten">Case</span>
                  <span className="rail-label">案例</span>
                </div>
                <div className="rail-card-body">
                  <div>
                    <div className="rail-card-title">
                      {"campaignName" in casePick ? casePick.campaignName : casePick.title}
                    </div>
                    <div className="rail-card-meta">
                      {"brand" in casePick ? casePick.brand : casePick.sourceName}
                      {"period" in casePick ? ` · ${casePick.period}` : ""}
                    </div>
                  </div>
                  <div className="rail-card-media">
                    <ServerImage
                      src={
                        "image" in casePick && (casePick as any).image
                          ? (casePick as any).image
                          : "hero" in casePick && (casePick as any).hero
                            ? (casePick as any).hero
                            : "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&q=80"
                      }
                      alt=""
                      loading="lazy"
                      fallback={{ source: "CASE", category: "" }}
                    />
                  </div>
                </div>
              </Link>
            ) : null}

            {companyPick ? (
              <Link href={`/companies/${companyPick.id}`} className="rail-card">
                <div className="rail-card-head">
                  <span className="rail-handwritten">Company Move</span>
                  <span className="rail-label">公司动态</span>
                </div>
                <div className="rail-card-body">
                  <div>
                    <div className="rail-card-title">{companyPick.name}</div>
                    <div className="rail-card-meta">
                      {companyPick.recentMoves?.[0] ?? companyPick.overview?.slice(0, 40)}
                    </div>
                  </div>
                  <div
                    className="rail-card-media round"
                    style={{
                      background: `linear-gradient(145deg, #b08d57, #6e7059)`,
                    }}
                  >
                    <span>{companyPick.name.slice(0, 1)}</span>
                  </div>
                </div>
              </Link>
            ) : null}

            {podcastPick ? (
              <Link href={`/podcasts/${podcastPick.id}`} className="rail-card">
                <div className="rail-card-head">
                  <span className="rail-handwritten">Podcast</span>
                  <span className="rail-label">播客</span>
                </div>
                <div className="rail-card-body">
                  <div>
                    <div className="rail-card-title">{podcastPick.title}</div>
                    <div className="rail-card-meta">
                      {(podcastPick as any).show ?? (podcastPick as any).sourceName}
                    </div>
                    <div className="rail-wave" aria-hidden="true">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <i key={i} style={{ height: `${6 + Math.random() * 14}px` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rail-card-media round">
                    {"showImage" in podcastPick && podcastPick.showImage ? (
                      <ServerImage
                        src={podcastPick.showImage}
                        alt=""
                        loading="lazy"
                        fallback={{ source: "PODCAST", category: "" }}
                      />
                    ) : (
                      <span>♪</span>
                    )}
                  </div>
                </div>
              </Link>
            ) : null}
          </aside>
        </div>
      </section>

      {/* ── Footer line ── */}
      <footer className="desk-foot">
        <span className="desk-handwritten">Archive today.</span>
        <span className="desk-foot-line" />
        <span className="desk-handwritten">Inspire tomorrow.</span>
      </footer>
    </ArchiveShell>
  );
}
