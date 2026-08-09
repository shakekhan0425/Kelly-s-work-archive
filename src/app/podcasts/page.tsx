import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { getPodcastChannelsLive, getPodcastEpisodesLive, formatDate, liveSource } from "@/lib/data/live";
import type { PodcastChannelWithHealth, PodcastEpisode } from "@/lib/data/types";

export const metadata = { title: "Podcast Intelligence · WORK / Archive" };
export const dynamic = "force-dynamic";

/** 频道首字母封面（不依赖外部图片，永不挂） */
function ChannelCover({ name, id }: { name: string; id: string }) {
  const ch = name.trim().charAt(0).toUpperCase() || "♪";
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  const bg = `linear-gradient(135deg, hsl(${h} 38% 42%), hsl(${(h + 38) % 360} 42% 30%))`;
  return (
    <div className="podch-cover podch-cover-gen" style={{ background: bg }} aria-hidden="true">
      <span>{ch}</span>
    </div>
  );
}

function ChannelCard({ ch, eps }: { ch: PodcastChannelWithHealth; eps: PodcastEpisode[] }) {
  return (
    <article className="podch-card">
      <Link href={`/podcasts/channel/${ch.id}`} className="podch-head" style={{ textDecoration: "none", color: "inherit" }}>
        <ChannelCover name={ch.name} id={ch.id} />
        <div className="podch-id">
          <div className="podch-name">{ch.name}</div>
          <div className="podch-cat">{ch.category}</div>
          <span className="src-authority" data-a={ch.authority}>
            {ch.authority}
          </span>
        </div>
        <span className={`src-status ${ch.health.ok ? "live" : "pending"}`}>
          {ch.health.ok ? `● ${ch.health.count} 单集` : "○ 接入中"}
        </span>
      </Link>
      <p className="podch-desc">{ch.desc}</p>
      {eps.length > 0 ? (
        <ul className="podch-eps">
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
        <p className="podch-pending">该节目真实单集尚未收录（渠道已收录，不展示占位单集）</p>
      )}
      <a className="src-go" href={ch.site} target="_blank" rel="noreferrer">
        访问节目 ↗
      </a>
    </article>
  );
}

export default async function PodcastsPage() {
  const channels = await getPodcastChannelsLive();
  const episodes = await getPodcastEpisodesLive();
  const zh = channels.filter((c) => c.group === "Chinese");
  const en = channels.filter((c) => c.group === "International");
  const liveCount = channels.filter((c) => c.health.ok).length;
  const src = liveSource();

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Podcast Intelligence"
          title="播客情报"
          action={{ href: "/desk", label: "返回今日" }}
        />
        <p className="list-dek" style={{ maxWidth: "74ch" }}>
          真实播客单集（构建时从各节目官方 RSS 抓取，共 {liveCount} 个频道已接入、{episodes.length}{" "}
          期真实单集）。每条含真实摘要与播放链接，可用于商业洞察与英文表达积累。未接入频道仅显示目录，不生成占位单集。
        </p>
        {src === "supabase" ? (
          <span className="live-badge" title="数据来自 Supabase，实时更新">● 实时</span>
        ) : src === "json" ? (
          <span
            className="live-badge"
            style={{ background: "#eef0f3", color: "#6b7280", borderColor: "#e2e5ea" }}
            title="未连接 Supabase，使用本地归档数据"
          >
            ● 本地档案
          </span>
        ) : null}
      </section>

      <SectionHeader eyebrow="Chinese" title="中文商业播客" />
      <div className="podch-grid" style={{ marginTop: 12 }}>
        {zh.map((c) => (
          <ChannelCard key={c.id} ch={c} eps={episodes.filter((e) => e.channelId === c.id).slice(0, 3)} />
        ))}
      </div>

      <SectionHeader eyebrow="International" title="国际商业播客" />
      <div className="podch-grid" style={{ marginTop: 12 }}>
        {en.map((c) => (
          <ChannelCard key={c.id} ch={c} eps={episodes.filter((e) => e.channelId === c.id).slice(0, 3)} />
        ))}
      </div>
    </ArchiveShell>
  );
}
