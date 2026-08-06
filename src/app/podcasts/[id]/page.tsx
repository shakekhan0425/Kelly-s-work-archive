import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import NotesPanel from "@/components/archive/NotesPanel";
import { BackButton } from "@/components/archive/BackButton";
import {
  getPodcastEpisodeByIdLive,
  getPodcastChannelsLive,
  buildPodcastIntel,
  formatDate,
} from "@/lib/data/live";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ep = await getPodcastEpisodeByIdLive(id);
  return { title: ep ? `${ep.title} · 播客` : "播客详情" };
}

export default async function PodcastDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ep = await getPodcastEpisodeByIdLive(id);
  if (!ep) notFound();

  const intel = buildPodcastIntel(ep);
  const ch = (await getPodcastChannelsLive()).find((c) => c.id === ep.channelId);

  return (
    <ArchiveShell>
      <article className="read-wrap">
        <div className="read-back">
          <BackButton fallbackHref="/podcasts" fallbackLabel="Podcast Intelligence" />
        </div>

        <header className="read-head">
          <div className="read-kicker">
            <Link href="/podcasts" className="crumb">
              Podcast Intelligence
            </Link>
            <span className="sep">/</span>
            <span>{ep.show}</span>
          </div>
          <h1 className="read-title">{ep.title}</h1>
          <div className="read-meta">
            {ep.publishedAt ? <span>{formatDate(ep.publishedAt)}</span> : null}
            {ep.duration ? (
              <>
                <span className="sep">·</span>
                <span>{ep.duration}</span>
              </>
            ) : null}
            <span className="stamp stamp-lav">EPISODE</span>
          </div>
          {ep.showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="read-hero" src={ep.showImage} alt="" />
          ) : null}
        </header>

        <div className="read-grid">
          <div>
            {ep.audio ? (
              <div className="pod-player">
                <span className="pod-player-h">播放真实单集</span>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls src={ep.audio} preload="none" />
              </div>
            ) : null}

            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">Episode Summary</span>
                <span className="ki-note">真实 show notes</span>
              </div>
              <p className="ki-event">
                {ep.summary || "（该单集 show notes 未提供文字摘要，请使用上方播放器收听原声。）"}
              </p>
            </section>

            {intel.businessTerms.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">Business Vocabulary</span>
                  <span className="ki-note">规则派生 · 可核对</span>
                </div>
                <div className="ki-brands">
                  {intel.businessTerms.map((t) => (
                    <span key={t} className="stamp stamp-coral">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {intel.relatedCompany && intel.relatedCompany.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">Related Companies</span>
                  <span className="ki-note">规则派生 · 可核对</span>
                </div>
                <div className="ki-brands">
                  {intel.relatedCompany.map((c) => (
                    <Link key={c} href={`/companies/${c}`} className="stamp stamp-coral">
                      {c}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="ki-block draft">
              <div className="ki-head">
                <span className="ki-tag">Marketing Insight</span>
                <span className="ki-note draft">规则派生 · 可核对</span>
              </div>
              <p className="ki-draft-text">
                商业启示与英文表达将由此基于真实内容萃取。当前为结构占位，不生成虚构事实。
              </p>
            </section>
          </div>

          <aside className="read-aside">
            <div className="aside-card">
              <div className="aside-h">来源</div>
              {/^https?:\/\//i.test(ep.link) ? (
                <a className="source-link" href={ep.link} target="_blank" rel="noreferrer">
                  打开单集原文 ↗
                </a>
              ) : ch?.site ? (
                <a className="source-link" href={ch.site} target="_blank" rel="noreferrer">
                  打开节目主页 ↗
                </a>
              ) : null}
              <div className="aside-meta">
                <div>节目：{ep.show}</div>
                {ch?.site ? (
                  <div>
                    主页：
                    <a href={ch.site} target="_blank" rel="noreferrer">
                      {ch.site.replace(/^https?:\/\//, "")} ↗
                    </a>
                  </div>
                ) : null}
                {ep.duration ? <div>时长：{ep.duration}</div> : null}
              </div>
            </div>

            <NotesPanel itemId={ep.id} itemTitle={ep.title} />
          </aside>
        </div>
      </article>
    </ArchiveShell>
  );
}
