import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { BackButton } from "@/components/archive/BackButton";
import { SectionHeader } from "@/components/archive/SectionHeader";
import {
  getPodcastChannelsLive,
  getPodcastEpisodesLive,
  formatDate,
  liveSource,
} from "@/lib/data/live";

/** 频道首字母封面（不依赖外部图片，永不挂） */
function ChannelCover({ name, id }: { name: string; id: string }) {
  const ch = name.trim().charAt(0).toUpperCase() || "♪";
  // 由 id 派生稳定色相，保证同一频道颜色一致
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  const bg = `linear-gradient(135deg, hsl(${h} 38% 42%), hsl(${(h + 38) % 360} 42% 30%))`;
  return (
    <div className="podch-cover podch-cover-gen" style={{ background: bg }} aria-hidden="true">
      <span>{ch}</span>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ch = (await getPodcastChannelsLive()).find((c) => c.id === id);
  return { title: ch ? `${ch.name} · 播客频道` : "播客频道" };
}

export default async function PodcastChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const channels = await getPodcastChannelsLive();
  const ch = channels.find((c) => c.id === id);
  if (!ch) notFound();

  const eps = await getPodcastEpisodesLive(ch.id);
  const src = liveSource();

  return (
    <ArchiveShell>
      <article className="read-wrap">
        <div className="read-back">
          <BackButton fallbackHref="/podcasts" fallbackLabel="Podcast Intelligence" />
        </div>

        <header className="ch-head">
          <ChannelCover name={ch.name} id={ch.id} />
          <div className="ch-head-info">
            <div className="read-kicker">
              <Link href="/podcasts" className="crumb">
                Podcast Intelligence
              </Link>
              <span className="sep">/</span>
              <span>{ch.group === "Chinese" ? "中文商业播客" : "International"}</span>
            </div>
            <h1 className="read-title">{ch.name}</h1>
            <div className="read-meta">
              <span className="src-authority" data-a={ch.authority}>
                {ch.authority}
              </span>
              <span className="src-status live">● {eps.length} 单集</span>
              <span>{ch.category}</span>
            </div>
          </div>
        </header>

        <p className="ch-desc">{ch.desc}</p>

        <div className="ch-actions">
          <a className="src-go" href={ch.site} target="_blank" rel="noreferrer">
            访问节目主页 ↗
          </a>
          {src === "supabase" ? (
            <span className="live-badge" title="数据来自 Supabase，实时更新">● 实时</span>
          ) : null}
        </div>

        <SectionHeader eyebrow="Episodes" title={`全部单集（${eps.length}）`} />

        {eps.length > 0 ? (
          <ul className="podch-eps ch-ep-list">
            {eps.map((e) => (
              <li key={e.id} className="podch-ep">
                <Link href={`/podcasts/${e.id}`} className="podch-ep-title">
                  {e.title}
                </Link>
                <span className="podch-ep-date">{e.publishedAt ? formatDate(e.publishedAt) : ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ch-pending">该频道真实单集暂未抓取。已收录频道目录，部署到 Vercel 后 Cron 会自动采集真实单集。</p>
        )}
      </article>
    </ArchiveShell>
  );
}
